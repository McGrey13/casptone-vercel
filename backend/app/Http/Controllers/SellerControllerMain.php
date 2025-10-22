<?php

namespace App\Http\Controllers;

use App\Models\Seller;
use App\Models\Payment;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class SellerControllerMain extends Controller
{
    /**
     * Get all sellers
     */
    public function index()
    {
        try {
            $sellers = Seller::select('id', 'name', 'email', 'phone')->get();

            return response()->json([
                'status' => 'success',
                'data' => $sellers
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching sellers: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Unable to fetch sellers'
            ], 500);
        }
    }

    /**
     * Get all payments for the authenticated seller
     */
    public function getPayments(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Get seller record
            $seller = Seller::where('user_id', $user->userID)->first();
            
            if (!$seller) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seller profile not found'
                ], 404);
            }

            // FETCH E-WALLET PAYMENTS (GCash and PayMaya ONLY) FROM ORDERS TABLE
            $ewalletPayments = DB::table('orders')
                ->leftJoin('customers', 'orders.customer_id', '=', 'customers.customerID')
                ->leftJoin('users', 'customers.user_id', '=', 'users.userID')
                ->where('orders.sellerID', $seller->sellerID)
                ->whereIn('orders.payment_method', ['gcash', 'paymaya'])
                ->select(
                    'orders.orderID as payment_id',
                    'orders.orderID',
                    'orders.totalAmount as amount',
                    'orders.payment_method as paymentMethod',
                    'orders.paymentStatus',
                    'orders.created_at',
                    'orders.order_number',
                    'users.userName as customer_name'
                )
                ->orderBy('orders.created_at', 'desc')
                ->get();

            // FETCH COD ORDERS FROM ORDERS TABLE (ONLY COD)
            $codOrdersDB = DB::table('orders')
                ->leftJoin('customers', 'orders.customer_id', '=', 'customers.customerID')
                ->leftJoin('users', 'customers.user_id', '=', 'users.userID')
                ->where('orders.sellerID', $seller->sellerID)
                ->where('orders.payment_method', 'cod')
                ->select(
                    'orders.orderID',
                    'orders.order_number',
                    'orders.totalAmount',
                    'orders.payment_method',
                    'orders.paymentStatus',
                    'orders.status',
                    'orders.created_at',
                    'users.userName as customer_name'
                )
                ->orderBy('orders.created_at', 'desc')
                ->get();

            Log::info('E-Wallet Payments: ' . $ewalletPayments->count());
            Log::info('COD Orders: ' . $codOrdersDB->count());

            // Format E-Wallet payments
            $payments = [];
            foreach ($ewalletPayments as $payment) {
                $orderNum = $payment->order_number;
                
                // Payment reference only for paid
                $reference = null;
                if ($payment->paymentStatus === 'paid') {
                    $reference = 'PAY-' . str_pad($payment->payment_id, 8, '0', STR_PAD_LEFT);
                }
                
                $payments[] = [
                    'id' => $payment->payment_id,
                    'payment_id' => $payment->payment_id,
                    'reference_number' => $reference,
                    'order_id' => $orderNum,
                    'customer_name' => $payment->customer_name ?? 'Unknown',
                    'amount' => floatval($payment->amount),
                    'payment_method' => strtolower($payment->paymentMethod),
                    'payment_status' => $payment->paymentStatus,
                    'created_at' => $payment->created_at
                ];
            }

            // Format COD orders (ONLY COD payment method)
            $codOrdersData = [];
            foreach ($codOrdersDB as $order) {
                $orderNum = $order->order_number;
                
                $codOrdersData[] = [
                    'id' => $order->orderID,
                    'order_id' => $orderNum,
                    'customer_name' => $order->customer_name ?? 'Unknown',
                    'amount' => floatval($order->totalAmount ?? 0),
                    'payment_method' => 'cod',
                    'payment_status' => $order->paymentStatus ?? 'pending',
                    'order_status' => $order->status ?? 'pending',
                    'created_at' => $order->created_at
                ];
            }

            $payments = collect($payments);
            $codOrdersData = collect($codOrdersData);

            // E-Wallet Stats
            $stats = [
                'totalEarnings' => $payments->where('payment_status', 'paid')->sum('amount'),
                'pendingPayouts' => $payments->whereIn('payment_status', ['processing', 'pending'])->sum('amount'),
                'gcashPayments' => $payments->where('payment_method', 'gcash')->where('payment_status', 'paid')->sum('amount'),
                'paymayaPayments' => $payments->where('payment_method', 'paymaya')->where('payment_status', 'paid')->sum('amount')
            ];

            // COD Stats (ONLY COD orders)
            $codStats = [
                'totalCOD' => $codOrdersData->sum('amount'),
                'totalPaid' => $codOrdersData->where('payment_status', 'paid')->sum('amount'),
                'totalPending' => $codOrdersData->where('payment_status', 'pending')->sum('amount'),
                'totalOrders' => $codOrdersData->count()
            ];

            return response()->json([
                'success' => true,
                'payments' => $payments->values()->toArray(),
                'stats' => $stats,
                'cod_orders' => $codOrdersData->values()->toArray(),
                'cod_stats' => $codStats
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error fetching seller payments: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Unable to fetch payments',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
