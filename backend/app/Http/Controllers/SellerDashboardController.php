<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\SellerBalance;
use App\Models\Payout;
use App\Models\Seller;
use App\Models\Payment;
use App\Services\CommissionService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SellerDashboardController extends Controller
{
    protected CommissionService $commissionService;

    public function __construct(CommissionService $commissionService)
    {
        $this->commissionService = $commissionService;
    }

    /**
     * Get seller transactions
     */
    public function getTransactions(Request $request, $sellerId)
    {
        try {
            $request->validate([
                'from' => 'date|nullable',
                'to' => 'date|nullable',
                'status' => 'string|in:pending,succeeded,failed,refunded|nullable',
                'page' => 'integer|min:1|nullable',
                'per_page' => 'integer|min:1|max:100|nullable'
            ]);

            $query = Transaction::where('seller_id', $sellerId)
                ->with(['order', 'order.customer']);

            // Apply filters
            if ($request->from) {
                $query->whereDate('created_at', '>=', $request->from);
            }

            if ($request->to) {
                $query->whereDate('created_at', '<=', $request->to);
            }

            if ($request->status) {
                $query->where('status', $request->status);
            }

            // Pagination
            $perPage = $request->per_page ?? 15;
            $transactions = $query->orderBy('created_at', 'desc')
                ->paginate($perPage);

            // Transform data for frontend
            $transactions->getCollection()->transform(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'order_id' => $transaction->order_id,
                    'customer_name' => $transaction->order->customer->firstName . ' ' . $transaction->order->customer->lastName,
                    'gross_amount' => $transaction->gross_amount_in_pesos,
                    'admin_fee' => $transaction->admin_fee_in_pesos,
                    'seller_amount' => $transaction->seller_amount_in_pesos,
                    'status' => $transaction->status,
                    'created_at' => $transaction->created_at->format('Y-m-d H:i:s'),
                    'paymongo_payment_id' => $transaction->paymongo_payment_id
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transactions,
                'summary' => $this->getTransactionSummary($sellerId, $request->from, $request->to)
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get seller transactions', [
                'seller_id' => $sellerId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve transactions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get seller balance
     */
    public function getBalance($sellerId)
    {
        try {
            $balance = SellerBalance::where('seller_id', $sellerId)->first();

            if (!$balance) {
                // Create balance record if it doesn't exist
                $balance = SellerBalance::create([
                    'seller_id' => $sellerId,
                    'available_balance' => 0,
                    'pending_balance' => 0
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'seller_id' => $sellerId,
                    'available_balance' => $balance->available_balance_in_pesos,
                    'pending_balance' => $balance->pending_balance_in_pesos,
                    'total_balance' => $balance->total_balance_in_pesos,
                    'available_balance_cents' => $balance->available_balance,
                    'pending_balance_cents' => $balance->pending_balance,
                    'total_balance_cents' => $balance->available_balance + $balance->pending_balance
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get seller balance', [
                'seller_id' => $sellerId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve balance',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Get seller dashboard summary
     */
    public function getDashboardSummary(Request $request, $sellerId)
    {
        try {
            // Use provided date range or default to last 30 days
            $fromDate = $request->get('from') ? \Carbon\Carbon::parse($request->get('from')) : now()->subDays(30);
            $toDate = $request->get('to') ? \Carbon\Carbon::parse($request->get('to')) : now();

            // Get transaction summary
            $transactionSummary = $this->getTransactionSummary($sellerId, $fromDate, $toDate);

            // Get balance
            $balance = SellerBalance::where('seller_id', $sellerId)->first();
            $balanceData = $balance ? [
                'available_balance' => $balance->available_balance_in_pesos,
                'pending_balance' => $balance->pending_balance_in_pesos,
                'total_balance' => $balance->total_balance_in_pesos
            ] : [
                'available_balance' => 0,
                'pending_balance' => 0,
                'total_balance' => 0
            ];

            // Get recent transactions
            $recentTransactions = Transaction::where('seller_id', $sellerId)
                ->with(['order.customer'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($transaction) {
                    return [
                        'id' => $transaction->id,
                        'order_id' => $transaction->order_id,
                        'customer_name' => $transaction->order->customer->firstName . ' ' . $transaction->order->customer->lastName,
                        'amount' => $transaction->seller_amount_in_pesos,
                        'status' => $transaction->status,
                        'created_at' => $transaction->created_at->format('M d, Y')
                    ];
                });

            // Get recent earnings (no pending payouts since sellers get money directly)
            $recentEarnings = Transaction::where('seller_id', $sellerId)
                ->where('status', 'succeeded')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($transaction) {
                    return [
                        'id' => $transaction->id,
                        'amount' => $transaction->seller_amount_in_pesos,
                        'commission' => $transaction->admin_fee_in_pesos,
                        'created_at' => $transaction->created_at->format('M d, Y')
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'balance' => $balanceData,
                    'transaction_summary' => $transactionSummary,
                    'recent_transactions' => $recentTransactions,
                    'recent_earnings' => $recentEarnings
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get seller dashboard summary', [
                'seller_id' => $sellerId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dashboard summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get transaction summary for a seller
     */
    private function getTransactionSummary($sellerId, $fromDate = null, $toDate = null)
    {
        $query = Transaction::where('seller_id', $sellerId);

        if ($fromDate) {
            $query->whereDate('created_at', '>=', $fromDate);
        }

        if ($toDate) {
            $query->whereDate('created_at', '<=', $toDate);
        }

        $transactions = $query->get();

        // Get payment method breakdown
        $paymentBreakdown = $this->getSellerPaymentMethodBreakdown($sellerId, $fromDate, $toDate);

        // Get pending payments
        $pendingPayments = $this->getSellerPendingPayments($sellerId, $fromDate, $toDate);

        // Get online payment count
        $onlinePaymentCount = $this->getSellerOnlinePaymentCount($sellerId, $fromDate, $toDate);

        return [
            'total_transactions' => $transactions->count(),
            'successful_transactions' => $transactions->where('status', 'succeeded')->count(),
            'total_gross_amount' => $transactions->sum('gross_amount') / 100,
            'total_admin_fee' => $transactions->sum('admin_fee') / 100,
            'total_seller_amount' => $transactions->sum('seller_amount') / 100,
            'average_transaction' => $transactions->count() > 0 ? $transactions->avg('seller_amount') / 100 : 0,
            'commission_rate' => config('app.commission_rate', 0.02) * 100 . '%',
            'payment_methods' => $paymentBreakdown,
            'pending_payments' => $pendingPayments,
            'online_payment_count' => $onlinePaymentCount
        ];
    }

    /**
     * Get payment method breakdown for seller
     */
    private function getSellerPaymentMethodBreakdown($sellerId, $fromDate = null, $toDate = null)
    {
        try {
            $query = Payment::query()
                ->join('transactions', 'payments.orderID', '=', 'transactions.order_id')
                ->where('transactions.seller_id', $sellerId)
                ->where('payments.paymentStatus', 'paid');

            if ($fromDate) {
                $query->whereDate('payments.created_at', '>=', $fromDate);
            }

            if ($toDate) {
                $query->whereDate('payments.created_at', '<=', $toDate);
            }

            $payments = $query->get();

            $breakdown = $payments->groupBy('paymentMethod')->map(function ($methodPayments, $method) {
                $totalAmount = $methodPayments->sum('amount');
                $transactionCount = $methodPayments->count();
                
                return [
                    'method' => $method,
                    'display_name' => $this->getPaymentMethodDisplayName($method),
                    'total_amount' => round($totalAmount, 2),
                    'transaction_count' => $transactionCount,
                    'average_amount' => $transactionCount > 0 ? round($totalAmount / $transactionCount, 2) : 0
                ];
            })->values();

            // Calculate percentages
            $totalAmount = $breakdown->sum('total_amount');
            $breakdown = $breakdown->map(function ($method) use ($totalAmount) {
                $method['percentage'] = $totalAmount > 0 ? round(($method['total_amount'] / $totalAmount) * 100, 1) : 0;
                return $method;
            });

            return $breakdown->sortByDesc('total_amount')->values();

        } catch (\Exception $e) {
            Log::error('Seller payment method breakdown failed', [
                'error' => $e->getMessage(),
                'seller_id' => $sellerId
            ]);

            return collect();
        }
    }

    /**
     * Get pending payments for seller
     */
    private function getSellerPendingPayments($sellerId, $fromDate = null, $toDate = null)
    {
        try {
            $query = Payment::query()
                ->join('transactions', 'payments.orderID', '=', 'transactions.order_id')
                ->where('transactions.seller_id', $sellerId)
                ->where('payments.paymentStatus', 'pending');

            if ($fromDate) {
                $query->whereDate('payments.created_at', '>=', $fromDate);
            }

            if ($toDate) {
                $query->whereDate('payments.created_at', '<=', $toDate);
            }

            $pendingPayments = $query->get();

            return [
                'count' => $pendingPayments->count(),
                'total_amount' => round($pendingPayments->sum('amount'), 2),
                'breakdown' => $pendingPayments->groupBy('paymentMethod')->map(function ($methodPayments, $method) {
                    return [
                        'method' => $method,
                        'display_name' => $this->getPaymentMethodDisplayName($method),
                        'count' => $methodPayments->count(),
                        'amount' => round($methodPayments->sum('amount'), 2)
                    ];
                })->values()
            ];

        } catch (\Exception $e) {
            Log::error('Seller pending payments failed', [
                'error' => $e->getMessage(),
                'seller_id' => $sellerId
            ]);

            return [
                'count' => 0,
                'total_amount' => 0,
                'breakdown' => collect()
            ];
        }
    }

    /**
     * Get online payment count for seller
     */
    private function getSellerOnlinePaymentCount($sellerId, $fromDate = null, $toDate = null)
    {
        try {
            $query = Payment::query()
                ->join('transactions', 'payments.orderID', '=', 'transactions.order_id')
                ->where('transactions.seller_id', $sellerId)
                ->where('payments.payment_type', 'online')
                ->where('payments.paymentStatus', 'paid');

            if ($fromDate) {
                $query->whereDate('payments.created_at', '>=', $fromDate);
            }

            if ($toDate) {
                $query->whereDate('payments.created_at', '<=', $toDate);
            }

            return $query->count();

        } catch (\Exception $e) {
            Log::error('Seller online payment count failed', [
                'error' => $e->getMessage(),
                'seller_id' => $sellerId
            ]);

            return 0;
        }
    }

    /**
     * Get payment method display name
     */
    private function getPaymentMethodDisplayName($method)
    {
        return match($method) {
            'gcash' => 'GCash',
            'paymaya' => 'PayMaya',
            'cod' => 'Cash on Delivery',
            default => ucfirst($method)
        };
    }
}