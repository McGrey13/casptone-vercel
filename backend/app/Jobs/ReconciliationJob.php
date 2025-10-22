<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Transaction;
use App\Models\Payment;
use App\Services\PayMongoService;
use App\Services\CommissionService;
use Illuminate\Support\Facades\DB;

class ReconciliationJob implements ShouldQueue
{
    use Queueable;

    protected PayMongoService $payMongoService;
    protected CommissionService $commissionService;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        $this->payMongoService = app(PayMongoService::class);
        $this->commissionService = app(CommissionService::class);
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info('Starting reconciliation job');

            // Get payments from yesterday to today
            $fromDate = now()->subDay()->startOfDay();
            $toDate = now()->endOfDay();

            // Get all payment intents from PayMongo for the period
            $payMongoPayments = $this->fetchPayMongoPayments($fromDate, $toDate);

            // Get our local transactions for the same period
            $localTransactions = Transaction::whereBetween('created_at', [$fromDate, $toDate])
                ->with(['order'])
                ->get();

            // Get our local payments for the same period
            $localPayments = Payment::whereBetween('created_at', [$fromDate, $toDate])
                ->get();

            $reconciliationResults = [
                'paymongo_payments' => count($payMongoPayments),
                'local_transactions' => $localTransactions->count(),
                'local_payments' => $localPayments->count(),
                'missing_transactions' => [],
                'mismatched_amounts' => [],
                'orphaned_payments' => []
            ];

            // Check for missing transactions
            foreach ($payMongoPayments as $payMongoPayment) {
                $intentId = $payMongoPayment['id'];
                $status = $payMongoPayment['attributes']['status'];

                if ($status === 'succeeded') {
                    $localTransaction = $localTransactions->firstWhere('paymongo_intent_id', $intentId);
                    
                    if (!$localTransaction) {
                        $reconciliationResults['missing_transactions'][] = [
                            'intent_id' => $intentId,
                            'amount' => $payMongoPayment['attributes']['amount'],
                            'created_at' => $payMongoPayment['attributes']['created_at']
                        ];

                        // Try to create missing transaction
                        $this->createMissingTransaction($payMongoPayment);
                    } else {
                        // Check for amount mismatches
                        $payMongoAmount = $payMongoPayment['attributes']['amount'];
                        if ($localTransaction->gross_amount !== $payMongoAmount) {
                            $reconciliationResults['mismatched_amounts'][] = [
                                'intent_id' => $intentId,
                                'local_amount' => $localTransaction->gross_amount,
                                'paymongo_amount' => $payMongoAmount,
                                'difference' => $payMongoAmount - $localTransaction->gross_amount
                            ];
                        }
                    }
                }
            }

            // Check for orphaned payments (local payments without PayMongo records)
            foreach ($localPayments as $localPayment) {
                if ($localPayment->paymongo_payment_intent_id) {
                    $payMongoPayment = collect($payMongoPayments)
                        ->firstWhere('id', $localPayment->paymongo_payment_intent_id);
                    
                    if (!$payMongoPayment) {
                        $reconciliationResults['orphaned_payments'][] = [
                            'payment_id' => $localPayment->payment_id,
                            'intent_id' => $localPayment->paymongo_payment_intent_id,
                            'amount' => $localPayment->amount
                        ];
                    }
                }
            }

            // Log reconciliation results
            Log::info('Reconciliation completed', $reconciliationResults);

            // Send alerts if there are discrepancies
            if (!empty($reconciliationResults['missing_transactions']) || 
                !empty($reconciliationResults['mismatched_amounts']) || 
                !empty($reconciliationResults['orphaned_payments'])) {
                
                $this->sendReconciliationAlert($reconciliationResults);
            }

        } catch (\Exception $e) {
            Log::error('Reconciliation job failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Fetch payments from PayMongo API
     */
    private function fetchPayMongoPayments($fromDate, $toDate): array
    {
        try {
            $secretKey = config('services.paymongo.secret_key');
            $baseUrl = config('services.paymongo.base_url', 'https://api.paymongo.com/v1');

            $response = Http::withBasicAuth($secretKey, '')
                ->get($baseUrl . '/payment_intents', [
                    'created_at[gte]' => $fromDate->toISOString(),
                    'created_at[lte]' => $toDate->toISOString(),
                    'limit' => 100
                ]);

            if (!$response->successful()) {
                throw new \Exception('Failed to fetch PayMongo payments: ' . $response->body());
            }

            $data = $response->json();
            return $data['data'] ?? [];

        } catch (\Exception $e) {
            Log::error('Failed to fetch PayMongo payments', [
                'error' => $e->getMessage(),
                'from_date' => $fromDate,
                'to_date' => $toDate
            ]);

            return [];
        }
    }

    /**
     * Create missing transaction
     */
    private function createMissingTransaction(array $payMongoPayment): void
    {
        try {
            $intentId = $payMongoPayment['id'];
            $amount = $payMongoPayment['attributes']['amount'];
            $metadata = $payMongoPayment['attributes']['metadata'] ?? [];

            // Try to find the order from metadata
            $orderId = $metadata['order_id'] ?? null;
            
            if (!$orderId) {
                Log::warning('Cannot create missing transaction - no order_id in metadata', [
                    'intent_id' => $intentId,
                    'metadata' => $metadata
                ]);
                return;
            }

            $order = \App\Models\Order::find($orderId);
            if (!$order) {
                Log::warning('Cannot create missing transaction - order not found', [
                    'intent_id' => $intentId,
                    'order_id' => $orderId
                ]);
                return;
            }

            // Get seller ID from order
            $orderProduct = $order->orderProducts()->first();
            if (!$orderProduct) {
                Log::warning('Cannot create missing transaction - no order products', [
                    'intent_id' => $intentId,
                    'order_id' => $orderId
                ]);
                return;
            }

            $sellerId = $orderProduct->product->seller_id;
            if (!$sellerId) {
                Log::warning('Cannot create missing transaction - no seller_id', [
                    'intent_id' => $intentId,
                    'order_id' => $orderId
                ]);
                return;
            }

            // Process payment with commission service
            $paymentData = [
                'order_id' => $orderId,
                'amount_cents' => $amount,
                'paymongo_payment_id' => $intentId,
                'paymongo_intent_id' => $intentId,
                'metadata' => $metadata
            ];

            $result = $this->commissionService->processPayment($paymentData);

            if ($result['success']) {
                Log::info('Created missing transaction during reconciliation', [
                    'intent_id' => $intentId,
                    'transaction_id' => $result['transaction']->id
                ]);
            } else {
                Log::error('Failed to create missing transaction', [
                    'intent_id' => $intentId,
                    'error' => $result['error']
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Failed to create missing transaction', [
                'error' => $e->getMessage(),
                'paymongo_payment' => $payMongoPayment
            ]);
        }
    }

    /**
     * Send reconciliation alert
     */
    private function sendReconciliationAlert(array $results): void
    {
        try {
            // Log alert
            Log::warning('Reconciliation discrepancies found', $results);

            // Here you could send email/Slack notifications
            // For now, just log the alert
            Log::alert('RECONCILIATION ALERT: Discrepancies found in payment reconciliation', [
                'missing_transactions_count' => count($results['missing_transactions']),
                'mismatched_amounts_count' => count($results['mismatched_amounts']),
                'orphaned_payments_count' => count($results['orphaned_payments']),
                'timestamp' => now()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send reconciliation alert', [
                'error' => $e->getMessage(),
                'results' => $results
            ]);
        }
    }
}
