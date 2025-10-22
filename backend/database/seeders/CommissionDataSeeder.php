<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transaction;
use App\Models\SellerBalance;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\Product;
use App\Models\Seller;
use App\Models\Customer;
use App\Models\User;
use App\Models\Payment;
use App\Services\CommissionService;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CommissionDataSeeder extends Seeder
{
    protected CommissionService $commissionService;

    public function __construct()
    {
        $this->commissionService = new CommissionService();
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Starting Commission Data Seeder...');

        // Get existing data
        $sellers = Seller::with('user')->get();
        $customers = Customer::with('user')->get();
        $products = Product::with('seller')->get();

        if ($sellers->isEmpty() || $customers->isEmpty() || $products->isEmpty()) {
            $this->command->error('Required data not found. Please run DatabaseSeeder first.');
            return;
        }

        $this->command->info('Found ' . $sellers->count() . ' sellers, ' . $customers->count() . ' customers, ' . $products->count() . ' products');

        // Create sample orders with transactions for the last 3 months
        $this->createSampleOrdersAndTransactions($sellers, $customers, $products);

        $this->command->info('Commission Data Seeder completed successfully!');
    }

    /**
     * Create sample orders and transactions
     */
    private function createSampleOrdersAndTransactions($sellers, $customers, $products)
    {
        $paymentMethods = ['gcash', 'paymaya', 'card'];
        $monthsBack = 3;
        
        for ($month = 0; $month < $monthsBack; $month++) {
            $startOfMonth = Carbon::now()->subMonths($month)->startOfMonth();
            $endOfMonth = Carbon::now()->subMonths($month)->endOfMonth();
            
            $this->command->info("Creating orders for " . $startOfMonth->format('F Y'));
            
            // Create 15-25 orders per month
            $ordersCount = rand(15, 25);
            
            for ($i = 0; $i < $ordersCount; $i++) {
                $this->createOrderWithTransaction(
                    $sellers->random(),
                    $customers->random(),
                    $products->where('seller_id', $sellers->random()->sellerID),
                    $paymentMethods[array_rand($paymentMethods)],
                    $startOfMonth,
                    $endOfMonth
                );
            }
        }
    }

    /**
     * Create a single order with transaction
     */
    private function createOrderWithTransaction($seller, $customer, $sellerProducts, $paymentMethod, $startDate, $endDate)
    {
        try {
            DB::beginTransaction();

            // Random date within the month
            $orderDate = Carbon::createFromTimestamp(
                rand($startDate->timestamp, $endDate->timestamp)
            );

            // Select 1-3 products from this seller
            $selectedProducts = $sellerProducts->random(rand(1, 3));
            
            // Calculate total amount
            $totalAmount = 0;
            foreach ($selectedProducts as $product) {
                $quantity = rand(1, 3);
                $totalAmount += $product->productPrice * $quantity;
            }

            // Create order
            $order = Order::create([
                'customer_id' => $customer->customerID,
                'totalAmount' => $totalAmount,
                'status' => 'delivered', // Most orders are delivered for commission tracking
                'location' => $customer->user->userCity . ', ' . $customer->user->userProvince,
                'created_at' => $orderDate,
                'updated_at' => $orderDate,
            ]);

            // Create order products
            $orderProducts = [];
            foreach ($selectedProducts as $product) {
                $quantity = rand(1, 3);
                $orderProduct = OrderProduct::create([
                    'order_id' => $order->orderID,
                    'product_id' => $product->product_id,
                    'quantity' => $quantity,
                    'price' => $product->productPrice,
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate,
                ]);
                $orderProducts[] = $orderProduct;
            }

            // Create payment record
            $payment = Payment::create([
                'userID' => $customer->user_id,
                'orderID' => $order->orderID,
                'amount' => $totalAmount,
                'currency' => 'PHP',
                'paymentMethod' => $paymentMethod,
                'paymentStatus' => 'paid',
                'payment_type' => 'online',
                'reference_number' => strtoupper($paymentMethod) . '-' . $order->orderID . '-' . time(),
                'payment_details' => [
                    'type' => 'online',
                    'method' => $paymentMethod,
                    'reference' => strtoupper($paymentMethod) . '-' . $order->orderID . '-' . time(),
                    'processed_at' => $orderDate->toISOString()
                ],
                'created_at' => $orderDate,
                'updated_at' => $orderDate,
            ]);

            // Create transaction with commission calculation
            $grossAmountCents = (int) round($totalAmount * 100); // Convert to centavos
            $commissionSplit = $this->commissionService->computeSplit($grossAmountCents);

            $transaction = Transaction::create([
                'order_id' => $order->orderID,
                'seller_id' => $seller->sellerID,
                'paymongo_payment_id' => $payment->reference_number,
                'paymongo_intent_id' => $payment->reference_number,
                'gross_amount' => $commissionSplit['gross_amount'],
                'admin_fee' => $commissionSplit['admin_fee'],
                'seller_amount' => $commissionSplit['seller_amount'],
                'status' => 'succeeded',
                'metadata' => [
                    'payment_method' => $paymentMethod,
                    'payment_id' => $payment->payment_id,
                    'order_products_count' => count($orderProducts),
                    'products' => collect($orderProducts)->map(function($op) {
                        return [
                            'product_id' => $op->product_id,
                            'quantity' => $op->quantity,
                            'price' => $op->price,
                            'total' => $op->quantity * $op->price
                        ];
                    })->toArray()
                ],
                'created_at' => $orderDate,
                'updated_at' => $orderDate,
            ]);

            // Create or update seller balance
            $this->updateSellerBalance($seller->sellerID, $commissionSplit['seller_amount']);

            DB::commit();

            $this->command->info("Created order #{$order->orderID} for {$seller->user->userName} - ₱{$totalAmount} (Commission: ₱" . ($commissionSplit['admin_fee'] / 100) . ")");

        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error("Failed to create order: " . $e->getMessage());
        }
    }

    /**
     * Update seller balance
     */
    private function updateSellerBalance($sellerId, $amount)
    {
        $balance = SellerBalance::firstOrCreate(
            ['seller_id' => $sellerId],
            ['available_balance' => 0, 'pending_balance' => 0]
        );

        $balance->addToSellerBalance($amount);
    }

    /**
     * Create additional recent transactions for current month
     */
    private function createCurrentMonthTransactions($sellers, $customers, $products)
    {
        $this->command->info('Creating additional current month transactions...');
        
        $currentMonth = Carbon::now()->startOfMonth();
        $today = Carbon::now();
        
        // Create 30-50 transactions for current month
        $transactionsCount = rand(30, 50);
        
        for ($i = 0; $i < $transactionsCount; $i++) {
            $this->createOrderWithTransaction(
                $sellers->random(),
                $customers->random(),
                $products->where('seller_id', $sellers->random()->sellerID),
                ['gcash', 'paymaya', 'card'][array_rand(['gcash', 'paymaya', 'card'])],
                $currentMonth,
                $today
            );
        }
    }
}
