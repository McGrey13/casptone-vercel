<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\SellerBalance;
use App\Models\Order;
use App\Models\OrderProduct;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CommissionService
{
    /**
     * Commission rate (2% by default)
     */
    private float $commissionRate;

    public function __construct()
    {
        $this->commissionRate = config('app.commission_rate', 0.02);
    }

    /**
     * Calculate commission split for a given amount
     */
    public function computeSplit(int $grossAmountCents, float $rate = null): array
    {
        $rate = $rate ?? $this->commissionRate;
        $adminFee = (int) round($grossAmountCents * $rate);
        $sellerAmount = $grossAmountCents - $adminFee;

        return [
            'admin_fee' => $adminFee,
            'seller_amount' => $sellerAmount,
            'gross_amount' => $grossAmountCents,
            'commission_rate' => $rate
        ];
    }

    /**
     * Process payment and create transaction records
     */
    public function processPayment(array $paymentData): array
    {
        try {
            DB::beginTransaction();

            $order = Order::with('orderProducts.product')->findOrFail($paymentData['order_id']);
            $sellerId = $this->getSellerIdFromOrder($order);
            
            if (!$sellerId) {
                throw new \Exception('No seller found for order');
            }

            $split = $this->computeSplit($paymentData['amount_cents']);

            // Get detailed order products for metadata
            $orderProducts = $order->orderProducts;
            $itemsMetadata = [];
            $totalItemsCommission = 0;

            foreach ($orderProducts as $orderProduct) {
                $itemTotal = $orderProduct->price * $orderProduct->quantity;
                $itemCommission = $this->computeSplit((int) round($itemTotal * 100));
                
                $itemsMetadata[] = [
                    'product_id' => $orderProduct->product_id,
                    'product_name' => $orderProduct->product->productName ?? 'Unknown Product',
                    'quantity' => $orderProduct->quantity,
                    'unit_price' => $orderProduct->price,
                    'item_total' => $itemTotal,
                    'commission_rate' => $this->commissionRate,
                    'item_commission' => $itemCommission['admin_fee'] / 100, // Convert back to pesos
                    'seller_amount' => $itemCommission['seller_amount'] / 100 // Convert back to pesos
                ];
                
                $totalItemsCommission += $itemCommission['admin_fee'];
            }

            // Create transaction record with detailed item information
            $transaction = Transaction::create([
                'order_id' => $order->orderID,
                'seller_id' => $sellerId,
                'paymongo_payment_id' => $paymentData['paymongo_payment_id'] ?? null,
                'paymongo_intent_id' => $paymentData['paymongo_intent_id'] ?? null,
                'gross_amount' => $split['gross_amount'],
                'admin_fee' => $split['admin_fee'],
                'seller_amount' => $split['seller_amount'],
                'status' => 'succeeded',
                'metadata' => array_merge($paymentData['metadata'] ?? [], [
                    'commission_rate' => $this->commissionRate,
                    'items_count' => count($orderProducts),
                    'items_commission' => $totalItemsCommission / 100, // Total commission from all items
                    'items_detail' => $itemsMetadata
                ])
            ]);

            // Add seller amount directly to their balance (customer pays seller directly)
            $this->addToSellerBalance($sellerId, $split['seller_amount']);

            // Update order status
            $order->update(['status' => 'paid']);

            DB::commit();

            Log::info('Payment processed successfully with item-level commission tracking', [
                'transaction_id' => $transaction->id,
                'order_id' => $order->orderID,
                'seller_id' => $sellerId,
                'amount' => $split['gross_amount'],
                'admin_fee' => $split['admin_fee'],
                'seller_amount' => $split['seller_amount'],
                'items_count' => count($orderProducts),
                'items_commission' => $totalItemsCommission / 100,
                'commission_rate' => $this->commissionRate
            ]);

            return [
                'success' => true,
                'transaction' => $transaction,
                'split' => $split,
                'items_detail' => $itemsMetadata
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Payment processing failed', [
                'error' => $e->getMessage(),
                'payment_data' => $paymentData
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get seller ID from order (assuming single seller per order)
     */
    private function getSellerIdFromOrder(Order $order): ?int
    {
        $orderProduct = $order->orderProducts()->first();
        return $orderProduct ? $orderProduct->product->seller_id : null;
    }

    /**
     * Add to seller balance (customer pays seller directly)
     */
    private function addToSellerBalance(int $sellerId, int $amount): void
    {
        $balance = SellerBalance::firstOrCreate(
            ['seller_id' => $sellerId],
            ['available_balance' => 0, 'pending_balance' => 0]
        );

        // Add seller amount directly to their balance
        $balance->addToSellerBalance($amount);
    }

    /**
     * Process refund
     */
    public function processRefund(Transaction $transaction, int $refundAmountCents = null): array
    {
        try {
            DB::beginTransaction();

            $refundAmount = $refundAmountCents ?? $transaction->seller_amount;
            $refundSplit = $this->computeSplit($refundAmount);

            // Create refund transaction
            $refundTransaction = Transaction::create([
                'order_id' => $transaction->order_id,
                'seller_id' => $transaction->seller_id,
                'paymongo_payment_id' => $transaction->paymongo_payment_id,
                'paymongo_intent_id' => $transaction->paymongo_intent_id,
                'gross_amount' => -$refundSplit['gross_amount'],
                'admin_fee' => -$refundSplit['admin_fee'],
                'seller_amount' => -$refundSplit['seller_amount'],
                'status' => 'refunded',
                'metadata' => ['refund_of_transaction_id' => $transaction->id]
            ]);

            // Update seller balance (deduct)
            $balance = SellerBalance::where('seller_id', $transaction->seller_id)->first();
            if ($balance) {
                $balance->deductFromAvailableBalance($refundSplit['seller_amount']);
            }

            // Update original transaction
            $transaction->update(['status' => 'refunded']);

            DB::commit();

            Log::info('Refund processed successfully', [
                'original_transaction_id' => $transaction->id,
                'refund_transaction_id' => $refundTransaction->id,
                'refund_amount' => $refundSplit['gross_amount']
            ]);

            return [
                'success' => true,
                'refund_transaction' => $refundTransaction
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Refund processing failed', [
                'error' => $e->getMessage(),
                'transaction_id' => $transaction->id
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get commission rate
     */
    public function getCommissionRate(): float
    {
        return $this->commissionRate;
    }

    /**
     * Set commission rate
     */
    public function setCommissionRate(float $rate): void
    {
        $this->commissionRate = $rate;
    }

    /**
     * Get total admin fees for a period
     */
    public function getTotalAdminFees(string $fromDate, string $toDate): int
    {
        return Transaction::successful()
            ->whereBetween('created_at', [$fromDate, $toDate])
            ->sum('admin_fee');
    }

    /**
     * Get total seller earnings for a period
     */
    public function getTotalSellerEarnings(int $sellerId, string $fromDate, string $toDate): int
    {
        return Transaction::successful()
            ->where('seller_id', $sellerId)
            ->whereBetween('created_at', [$fromDate, $toDate])
            ->sum('seller_amount');
    }

    /**
     * Get item-level commission breakdown
     */
    public function getItemLevelCommissionBreakdown(string $fromDate, string $toDate): array
    {
        $transactions = Transaction::successful()
            ->whereBetween('created_at', [$fromDate, $toDate])
            ->with(['order.orderProducts.product', 'seller.user'])
            ->get();

        $itemBreakdown = [];
        $totalCommission = 0;
        $totalItems = 0;

        foreach ($transactions as $transaction) {
            $metadata = $transaction->metadata ?? [];
            $itemsDetail = $metadata['items_detail'] ?? [];

            foreach ($itemsDetail as $item) {
                $productId = $item['product_id'];
                
                if (!isset($itemBreakdown[$productId])) {
                    $itemBreakdown[$productId] = [
                        'product_id' => $productId,
                        'product_name' => $item['product_name'],
                        'total_quantity_sold' => 0,
                        'total_revenue' => 0,
                        'total_commission' => 0,
                        'total_seller_amount' => 0,
                        'transaction_count' => 0,
                        'average_price' => 0,
                        'commission_rate' => $item['commission_rate']
                    ];
                }

                $itemBreakdown[$productId]['total_quantity_sold'] += $item['quantity'];
                $itemBreakdown[$productId]['total_revenue'] += $item['item_total'];
                $itemBreakdown[$productId]['total_commission'] += $item['item_commission'];
                $itemBreakdown[$productId]['total_seller_amount'] += $item['seller_amount'];
                $itemBreakdown[$productId]['transaction_count']++;
                
                $totalCommission += $item['item_commission'];
                $totalItems += $item['quantity'];
            }
        }

        // Calculate averages
        foreach ($itemBreakdown as $productId => &$item) {
            if ($item['total_quantity_sold'] > 0) {
                $item['average_price'] = $item['total_revenue'] / $item['total_quantity_sold'];
            }
        }

        return [
            'items' => array_values($itemBreakdown),
            'summary' => [
                'total_products' => count($itemBreakdown),
                'total_items_sold' => $totalItems,
                'total_commission' => $totalCommission,
                'commission_rate' => $this->commissionRate,
                'average_commission_per_item' => $totalItems > 0 ? $totalCommission / $totalItems : 0
            ]
        ];
    }

    /**
     * Get commission summary by product category
     */
    public function getCommissionByCategory(string $fromDate, string $toDate): array
    {
        $transactions = Transaction::successful()
            ->whereBetween('created_at', [$fromDate, $toDate])
            ->with(['order.orderProducts.product'])
            ->get();

        $categoryBreakdown = [];
        $totalCommission = 0;

        foreach ($transactions as $transaction) {
            $metadata = $transaction->metadata ?? [];
            $itemsDetail = $metadata['items_detail'] ?? [];

            foreach ($itemsDetail as $item) {
                $productId = $item['product_id'];
                
                // Get product category from the transaction's order products
                $orderProduct = $transaction->order->orderProducts
                    ->where('product_id', $productId)
                    ->first();
                
                if ($orderProduct && $orderProduct->product) {
                    $category = $orderProduct->product->category ?? 'Uncategorized';
                    
                    if (!isset($categoryBreakdown[$category])) {
                        $categoryBreakdown[$category] = [
                            'category' => $category,
                            'total_revenue' => 0,
                            'total_commission' => 0,
                            'total_seller_amount' => 0,
                            'transaction_count' => 0,
                            'items_sold' => 0
                        ];
                    }

                    $categoryBreakdown[$category]['total_revenue'] += $item['item_total'];
                    $categoryBreakdown[$category]['total_commission'] += $item['item_commission'];
                    $categoryBreakdown[$category]['total_seller_amount'] += $item['seller_amount'];
                    $categoryBreakdown[$category]['transaction_count']++;
                    $categoryBreakdown[$category]['items_sold'] += $item['quantity'];
                    
                    $totalCommission += $item['item_commission'];
                }
            }
        }

        return [
            'categories' => array_values($categoryBreakdown),
            'summary' => [
                'total_categories' => count($categoryBreakdown),
                'total_commission' => $totalCommission,
                'commission_rate' => $this->commissionRate
            ]
        ];
    }
}
