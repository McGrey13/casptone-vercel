<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\SellerBalance;
use App\Models\Payment;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\Product;
use App\Models\Seller;
use App\Services\CommissionService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminReportingController extends Controller
{
    protected CommissionService $commissionService;

    public function __construct(CommissionService $commissionService)
    {
        $this->commissionService = $commissionService;
    }

    /**
     * Get total revenue and admin fees
     */
    public function getRevenueReport(Request $request)
    {
        try {
            $request->validate([
                'from_date' => 'date|nullable',
                'to_date' => 'date|nullable',
                'seller_id' => 'integer|nullable'
            ]);

            $fromDate = $request->from_date ?? now()->subDays(30);
            $toDate = $request->to_date ?? now();

            $query = Transaction::successful()
                ->whereBetween('created_at', [$fromDate, $toDate]);

            if ($request->seller_id) {
                $query->where('seller_id', $request->seller_id);
            }

            $transactions = $query->get();

            $summary = [
                'period' => [
                    'from' => $fromDate,
                    'to' => $toDate
                ],
                'total_gross_revenue' => $transactions->sum('gross_amount') / 100,
                'total_admin_fees' => $transactions->sum('admin_fee') / 100,
                'total_seller_payments' => $transactions->sum('seller_amount') / 100,
                'transaction_count' => $transactions->count(),
                'average_transaction' => $transactions->count() > 0 ? $transactions->avg('gross_amount') / 100 : 0,
                'commission_rate' => $this->commissionService->getCommissionRate()
            ];

            // Get daily breakdown
            $dailyBreakdown = $transactions->groupBy(function ($transaction) {
                return $transaction->created_at->format('Y-m-d');
            })->map(function ($dayTransactions) {
                return [
                    'date' => $dayTransactions->first()->created_at->format('Y-m-d'),
                    'gross_revenue' => $dayTransactions->sum('gross_amount') / 100,
                    'admin_fees' => $dayTransactions->sum('admin_fee') / 100,
                    'seller_payments' => $dayTransactions->sum('seller_amount') / 100,
                    'transaction_count' => $dayTransactions->count()
                ];
            })->values();

            // Get payment method breakdown
            $paymentBreakdown = $this->getPaymentMethodBreakdown($fromDate, $toDate, $request->seller_id);

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => $summary,
                    'payment_methods' => $paymentBreakdown,
                    'daily_breakdown' => $dailyBreakdown
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get revenue report', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve revenue report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get product-level breakdown
     */
    public function getProductBreakdown(Request $request)
    {
        try {
            $request->validate([
                'from_date' => 'date|nullable',
                'to_date' => 'date|nullable',
                'limit' => 'integer|min:1|max:100|nullable'
            ]);

            $fromDate = $request->from_date ?? now()->subDays(30);
            $toDate = $request->to_date ?? now();
            $limit = $request->limit ?? 20;

            $productBreakdown = DB::table('order_products')
                ->join('products', 'order_products.product_id', '=', 'products.product_id')
                ->join('transactions', 'transactions.order_id', '=', 'order_products.order_id')
                ->where('transactions.status', 'succeeded')
                ->whereBetween('transactions.created_at', [$fromDate, $toDate])
                ->select([
                    'products.product_id',
                    'products.productName',
                    'products.category',
                    DB::raw('SUM(order_products.quantity) as total_quantity_sold'),
                    DB::raw('SUM(order_products.price * order_products.quantity) as gross_revenue'),
                    DB::raw('SUM((order_products.price * order_products.quantity) * ' . $this->commissionService->getCommissionRate() . ') as admin_fees'),
                    DB::raw('COUNT(DISTINCT transactions.order_id) as order_count')
                ])
                ->groupBy('products.product_id', 'products.productName', 'products.category')
                ->orderBy('gross_revenue', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($item) {
                    return [
                        'product_id' => $item->product_id,
                        'product_name' => $item->productName,
                        'category' => $item->category,
                        'total_quantity_sold' => $item->total_quantity_sold,
                        'gross_revenue' => $item->gross_revenue,
                        'admin_fees' => $item->admin_fees,
                        'seller_amount' => $item->gross_revenue - $item->admin_fees,
                        'order_count' => $item->order_count
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $productBreakdown
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get product breakdown', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve product breakdown',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get seller performance report
     */
    public function getSellerReport(Request $request)
    {
        try {
            $request->validate([
                'from_date' => 'date|nullable',
                'to_date' => 'date|nullable',
                'seller_id' => 'integer|nullable',
                'limit' => 'integer|min:1|max:100|nullable'
            ]);

            $fromDate = $request->from_date ?? now()->subDays(30);
            $toDate = $request->to_date ?? now();
            $limit = $request->limit ?? 20;

            $query = Transaction::successful()
                ->whereBetween('created_at', [$fromDate, $toDate])
                ->with(['seller.user']);

            if ($request->seller_id) {
                $query->where('seller_id', $request->seller_id);
            }

            $transactions = $query->get();

            $sellerReport = $transactions->groupBy('seller_id')->map(function ($sellerTransactions, $sellerId) {
                $seller = $sellerTransactions->first()->seller;
                return [
                    'seller_id' => $sellerId,
                    'seller_name' => $seller->user->userName ?? 'Unknown',
                    'seller_email' => $seller->user->userEmail ?? 'Unknown',
                    'total_orders' => $sellerTransactions->count(),
                    'gross_revenue' => $sellerTransactions->sum('gross_amount') / 100,
                    'admin_fees' => $sellerTransactions->sum('admin_fee') / 100,
                    'seller_earnings' => $sellerTransactions->sum('seller_amount') / 100,
                    'average_order_value' => $sellerTransactions->avg('gross_amount') / 100
                ];
            })->sortByDesc('gross_revenue')->take($limit)->values();

            return response()->json([
                'success' => true,
                'data' => $sellerReport
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get seller report', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve seller report',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Get financial dashboard summary
     */
    public function getFinancialDashboard()
    {
        try {
            $currentMonth = now()->startOfMonth();
            $lastMonth = now()->subMonth()->startOfMonth();

            // Current month stats
            $currentMonthTransactions = Transaction::successful()
                ->where('created_at', '>=', $currentMonth)
                ->get();

            $currentMonthStats = [
                'total_revenue' => $currentMonthTransactions->sum('gross_amount') / 100,
                'admin_fees' => $currentMonthTransactions->sum('admin_fee') / 100,
                'seller_payments' => $currentMonthTransactions->sum('seller_amount') / 100,
                'transaction_count' => $currentMonthTransactions->count()
            ];

            // Last month stats for comparison
            $lastMonthTransactions = Transaction::successful()
                ->whereBetween('created_at', [$lastMonth, $currentMonth])
                ->get();

            $lastMonthStats = [
                'total_revenue' => $lastMonthTransactions->sum('gross_amount') / 100,
                'admin_fees' => $lastMonthTransactions->sum('admin_fee') / 100,
                'seller_payments' => $lastMonthTransactions->sum('seller_amount') / 100,
                'transaction_count' => $lastMonthTransactions->count()
            ];

            // Calculate growth rates
            $revenueGrowth = $lastMonthStats['total_revenue'] > 0 
                ? (($currentMonthStats['total_revenue'] - $lastMonthStats['total_revenue']) / $lastMonthStats['total_revenue']) * 100 
                : 0;

            $transactionGrowth = $lastMonthStats['transaction_count'] > 0 
                ? (($currentMonthStats['transaction_count'] - $lastMonthStats['transaction_count']) / $lastMonthStats['transaction_count']) * 100 
                : 0;

            // Top performing sellers
            $topSellers = Transaction::successful()
                ->where('created_at', '>=', $currentMonth)
                ->with(['seller.user'])
                ->get()
                ->groupBy('seller_id')
                ->map(function ($transactions, $sellerId) {
                    $seller = $transactions->first()->seller;
                    return [
                        'seller_id' => $sellerId,
                        'seller_name' => $seller->user->userName ?? 'Unknown',
                        'revenue' => $transactions->sum('gross_amount') / 100,
                        'transaction_count' => $transactions->count()
                    ];
                })
                ->sortByDesc('revenue')
                ->take(5)
                ->values();

            // Recent transactions (no pending payouts since sellers get money directly)
            $recentTransactions = Transaction::successful()
                ->with(['seller.user', 'order.customer'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($transaction) {
                    return [
                        'id' => $transaction->id,
                        'seller_name' => $transaction->seller->user->userName ?? 'Unknown',
                        'customer_name' => $transaction->order->customer->firstName . ' ' . $transaction->order->customer->lastName,
                        'gross_amount' => $transaction->gross_amount_in_pesos,
                        'admin_fee' => $transaction->admin_fee_in_pesos,
                        'seller_amount' => $transaction->seller_amount_in_pesos,
                        'created_at' => $transaction->created_at->format('M d, Y H:i')
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'current_month' => $currentMonthStats,
                    'last_month' => $lastMonthStats,
                    'growth_rates' => [
                        'revenue_growth' => round($revenueGrowth, 2),
                        'transaction_growth' => round($transactionGrowth, 2)
                    ],
                    'top_sellers' => $topSellers,
                    'recent_transactions' => $recentTransactions
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get financial dashboard', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve financial dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export financial data to CSV
     */
    public function exportFinancialData(Request $request)
    {
        try {
            $request->validate([
                'from_date' => 'date|nullable',
                'to_date' => 'date|nullable',
                'type' => 'string|in:transactions,revenue|required'
            ]);

            $fromDate = $request->from_date ?? now()->subDays(30);
            $toDate = $request->to_date ?? now();

            $filename = 'financial_data_' . $request->type . '_' . $fromDate . '_to_' . $toDate . '.csv';

            switch ($request->type) {
                case 'transactions':
                    return $this->exportTransactions($fromDate, $toDate, $filename);
                case 'revenue':
                    return $this->exportRevenue($fromDate, $toDate, $filename);
                default:
                    return response()->json(['error' => 'Invalid export type'], 400);
            }

        } catch (\Exception $e) {
            Log::error('Failed to export financial data', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to export data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function exportTransactions($fromDate, $toDate, $filename)
    {
        $transactions = Transaction::whereBetween('created_at', [$fromDate, $toDate])
            ->with(['seller.user', 'order.customer'])
            ->get();

        $csvData = "Transaction ID,Order ID,Seller Name,Customer Name,Gross Amount,Admin Fee,Seller Amount,Status,Created At\n";

        foreach ($transactions as $transaction) {
            $csvData .= sprintf(
                "%d,%d,%s,%s,%.2f,%.2f,%.2f,%s,%s\n",
                $transaction->id,
                $transaction->order_id,
                $transaction->seller->user->userName ?? 'Unknown',
                $transaction->order->customer->firstName . ' ' . $transaction->order->customer->lastName,
                $transaction->gross_amount_in_pesos,
                $transaction->admin_fee_in_pesos,
                $transaction->seller_amount_in_pesos,
                $transaction->status,
                $transaction->created_at->format('Y-m-d H:i:s')
            );
        }

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }


    private function exportRevenue($fromDate, $toDate, $filename)
    {
        $transactions = Transaction::successful()
            ->whereBetween('created_at', [$fromDate, $toDate])
            ->get();

        $csvData = "Date,Gross Revenue,Admin Fees,Seller Payments,Transaction Count\n";

        $dailyData = $transactions->groupBy(function ($transaction) {
            return $transaction->created_at->format('Y-m-d');
        });

        foreach ($dailyData as $date => $dayTransactions) {
            $csvData .= sprintf(
                "%s,%.2f,%.2f,%.2f,%d\n",
                $date,
                $dayTransactions->sum('gross_amount') / 100,
                $dayTransactions->sum('admin_fee') / 100,
                $dayTransactions->sum('seller_amount') / 100,
                $dayTransactions->count()
            );
        }

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Get payment method breakdown (online and COD payments)
     */
    private function getPaymentMethodBreakdown($fromDate, $toDate, $sellerId = null)
    {
        try {
            // Get payments with their transactions (both online and COD payments)
            $query = Payment::query()
                ->join('transactions', 'payments.orderID', '=', 'transactions.order_id')
                ->where('payments.paymentStatus', 'paid')
                ->whereBetween('payments.created_at', [$fromDate, $toDate]);

            if ($sellerId) {
                $query->where('transactions.seller_id', $sellerId);
            }

            $payments = $query->get();

            // Group by payment method (GCash, PayMaya, COD)
            $breakdown = $payments->groupBy('paymentMethod')->map(function ($methodPayments, $method) {
                $totalAmount = $methodPayments->sum('amount');
                $transactionCount = $methodPayments->count();
                
                return [
                    'method' => $method,
                    'display_name' => $this->getPaymentMethodDisplayName($method),
                    'total_amount' => $totalAmount,
                    'transaction_count' => $transactionCount,
                    'average_amount' => $transactionCount > 0 ? $totalAmount / $transactionCount : 0,
                    'percentage' => 0 // Will be calculated after all methods
                ];
            })->values();

            // Calculate percentages
            $totalAmount = $breakdown->sum('total_amount');
            $breakdown = $breakdown->map(function ($method) use ($totalAmount) {
                $method['percentage'] = $totalAmount > 0 ? round(($method['total_amount'] / $totalAmount) * 100, 2) : 0;
                return $method;
            });

            return $breakdown->sortByDesc('total_amount')->values();

        } catch (\Exception $e) {
            Log::error('Payment method breakdown failed', [
                'error' => $e->getMessage(),
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'seller_id' => $sellerId
            ]);

            return collect();
        }
    }

    /**
     * Get payment method display name (online and COD payments)
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

    /**
     * Get overall system commission summary
     */
    public function getSystemCommissionSummary(Request $request)
    {
        try {
            $fromDate = $request->input('from_date', now()->startOfMonth()->toDateString());
            $toDate = $request->input('to_date', now()->endOfMonth()->toDateString());

            $transactions = Transaction::successful()
                ->whereBetween('created_at', [$fromDate, $toDate])
                ->get();

            $totalGrossRevenue = $transactions->sum('gross_amount') / 100;
            $totalAdminFees = $transactions->sum('admin_fee') / 100;
            $totalSellerPayments = $transactions->sum('seller_amount') / 100;
            $transactionCount = $transactions->count();

            // Get payment method breakdown
            $paymentBreakdown = $this->getPaymentMethodBreakdown($fromDate, $toDate);

            // Get top earning sellers
            $topSellers = $transactions->groupBy('seller_id')
                ->map(function ($sellerTransactions, $sellerId) {
                    $seller = Seller::find($sellerId);
                    return [
                        'seller_id' => $sellerId,
                        'seller_name' => $seller ? $seller->businessName : 'Unknown',
                        'total_earnings' => $sellerTransactions->sum('seller_amount') / 100,
                        'admin_fees_paid' => $sellerTransactions->sum('admin_fee') / 100,
                        'transaction_count' => $sellerTransactions->count()
                    ];
                })
                ->sortByDesc('total_earnings')
                ->take(10)
                ->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'period' => [
                        'from' => $fromDate,
                        'to' => $toDate
                    ],
                    'summary' => [
                        'total_gross_revenue' => $totalGrossRevenue,
                        'total_admin_fees' => $totalAdminFees,
                        'total_seller_payments' => $totalSellerPayments,
                        'transaction_count' => $transactionCount,
                        'average_transaction_value' => $transactionCount > 0 ? round($totalGrossRevenue / $transactionCount, 2) : 0,
                        'commission_rate' => config('app.commission_rate', 0.02) * 100 . '%'
                    ],
                    'payment_methods' => $paymentBreakdown,
                    'top_sellers' => $topSellers
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('System commission summary failed', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve system commission summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get item-level commission breakdown
     */
    public function getItemLevelCommission(Request $request)
    {
        try {
            $fromDate = $request->input('from_date', now()->startOfMonth()->toDateString());
            $toDate = $request->input('to_date', now()->endOfMonth()->toDateString());

            $itemBreakdown = $this->commissionService->getItemLevelCommissionBreakdown($fromDate, $toDate);

            return response()->json([
                'success' => true,
                'data' => [
                    'period' => [
                        'from' => $fromDate,
                        'to' => $toDate
                    ],
                    'items' => $itemBreakdown['items'],
                    'summary' => $itemBreakdown['summary']
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Item level commission failed', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve item level commission data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get commission breakdown by product category
     */
    public function getCommissionByCategory(Request $request)
    {
        try {
            $fromDate = $request->input('from_date', now()->startOfMonth()->toDateString());
            $toDate = $request->input('to_date', now()->endOfMonth()->toDateString());

            $categoryBreakdown = $this->commissionService->getCommissionByCategory($fromDate, $toDate);

            return response()->json([
                'success' => true,
                'data' => [
                    'period' => [
                        'from' => $fromDate,
                        'to' => $toDate
                    ],
                    'categories' => $categoryBreakdown['categories'],
                    'summary' => $categoryBreakdown['summary']
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Commission by category failed', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve commission by category data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}