<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Customer;
use App\Models\Seller;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\Shipping;
use App\Models\ShippingHistory;
use Carbon\Carbon;
use Faker\Factory as Faker;

class OrderCustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        $this->command->info('🚀 Starting Order Customer Seeder...');
        
        // Create customers with proper relationships
        $this->createCustomersWithOrders();
        
        $this->command->info('✅ Order Customer Seeder completed successfully!');
    }

    private function createCustomersWithOrders()
    {
        $faker = Faker::create();
        
        // Get existing sellers and products
        $sellers = Seller::with('user')->get();
        $products = Product::all();
        
        if ($sellers->isEmpty() || $products->isEmpty()) {
            $this->command->warn('⚠️ No sellers or products found. Please run other seeders first.');
            return;
        }

        $this->command->info('📝 Creating customers with orders...');

        // Create 20 customers with orders
        for ($i = 0; $i < 20; $i++) {
            // Create user with customer role
            $user = User::create([
                'userName' => $faker->name(),
                'userEmail' => $faker->unique()->safeEmail(),
                'userPassword' => bcrypt('password123'),
                'role' => 'customer',
                'userContactNumber' => $faker->phoneNumber(),
                'userAddress' => $faker->address(),
                'userCity' => $faker->city(),
                'userProvince' => $faker->state(),
                'is_verified' => true,
                'created_at' => Carbon::now()->subDays(rand(1, 90)),
                'updated_at' => Carbon::now()->subDays(rand(1, 30)),
            ]);

            // Create customer record
            $customer = Customer::create([
                'user_id' => $user->userID,
                'profile_picture_path' => null,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ]);

            $this->command->info("👤 Created customer: {$user->userName} (ID: {$customer->customerID})");

            // Create 2-5 orders for this customer
            $orderCount = rand(2, 5);
            for ($j = 0; $j < $orderCount; $j++) {
                $this->createOrderForCustomer($customer, $user, $sellers, $products, $faker);
            }
        }
    }

    private function createOrderForCustomer($customer, $user, $sellers, $products, $faker)
    {
        // Select a random seller
        $seller = $sellers->random();
        
        // Get products from this seller
        $sellerProducts = $products->where('seller_id', $seller->sellerID);
        
        if ($sellerProducts->isEmpty()) {
            $this->command->warn("⚠️ No products found for seller: {$seller->user->userName}");
            return;
        }

        // Create order
        $order = Order::create([
            'customer_id' => $customer->customerID,
            'sellerID' => $seller->sellerID,
            'totalAmount' => 0,
            'status' => $this->getRandomOrderStatus(),
            'paymentStatus' => $this->getRandomPaymentStatus(),
            'location' => $user->userAddress,
            'created_at' => Carbon::now()->subDays(rand(1, 60)),
            'updated_at' => Carbon::now()->subDays(rand(1, 30)),
        ]);

        $totalAmount = 0;
        $productCount = rand(1, 3);
        $selectedProducts = $sellerProducts->random(min($productCount, $sellerProducts->count()));

        // Add products to order
        foreach ($selectedProducts as $product) {
            $quantity = rand(1, 3);
            $price = $product->productPrice;
            $subtotal = $price * $quantity;

            OrderProduct::create([
                'order_id' => $order->orderID,
                'product_id' => $product->product_id,
                'quantity' => $quantity,
                'price' => $price,
                'subtotal' => $subtotal,
            ]);

            $totalAmount += $subtotal;
        }

        // Update order total
        $order->update(['totalAmount' => $totalAmount]);

        // Create shipping record for orders that are shipped or delivered
        if (in_array($order->status, ['packing', 'shipped', 'delivered'])) {
            $this->createShippingForOrder($order, $user, $faker);
        }

        $this->command->info("📦 Created order #{$order->orderID} for {$user->userName} - Total: ₱{$totalAmount}");
    }

    private function createShippingForOrder($order, $user, $faker)
    {
        // Generate tracking number
        $trackingNumber = 'CC' . date('Ymd') . strtoupper(substr(md5(uniqid()), 0, 6));

        // Create shipping record
        $shipping = Shipping::create([
            'order_id' => $order->orderID,
            'tracking_number' => $trackingNumber,
            'rider_name' => $faker->name(),
            'rider_phone' => $faker->phoneNumber(),
            'rider_email' => $faker->email(),
            'vehicle_type' => $faker->randomElement(['Motorcycle', 'Van', 'Truck', 'Bicycle']),
            'vehicle_number' => $faker->bothify('???-####'),
            'delivery_address' => $user->userAddress,
            'delivery_city' => $user->userCity,
            'delivery_province' => $user->userProvince,
            'delivery_notes' => $faker->optional(0.3)->sentence(),
            'estimated_delivery' => Carbon::now()->addDays(rand(1, 7)),
            'status' => $order->status,
            'assigned_at' => Carbon::now()->subDays(rand(1, 30)),
            'shipped_at' => $order->status === 'shipped' ? Carbon::now()->subDays(rand(1, 20)) : null,
            'delivered_at' => $order->status === 'delivered' ? Carbon::now()->subDays(rand(1, 10)) : null,
        ]);

        // Create shipping history
        $this->createShippingHistory($shipping, $order->status);

        $this->command->info("🚚 Created shipping record for order #{$order->orderID} - Tracking: {$trackingNumber}");
    }

    private function createShippingHistory($shipping, $currentStatus)
    {
        $histories = [
            'packing' => [
                ['status' => 'packing', 'description' => 'Package ready for shipping', 'location' => 'Warehouse'],
            ],
            'shipped' => [
                ['status' => 'packing', 'description' => 'Package ready for shipping', 'location' => 'Warehouse'],
                ['status' => 'shipped', 'description' => 'Package has been shipped', 'location' => 'In Transit'],
            ],
            'delivered' => [
                ['status' => 'packing', 'description' => 'Package ready for shipping', 'location' => 'Warehouse'],
                ['status' => 'shipped', 'description' => 'Package has been shipped', 'location' => 'In Transit'],
                ['status' => 'delivered', 'description' => 'Package has been delivered', 'location' => $shipping->delivery_city],
            ],
        ];

        $orderHistories = $histories[$currentStatus] ?? $histories['packing'];

        foreach ($orderHistories as $index => $history) {
            ShippingHistory::create([
                'shipping_id' => $shipping->id,
                'status' => $history['status'],
                'description' => $history['description'],
                'location' => $history['location'],
                'timestamp' => Carbon::now()->subDays(rand(1, 30))->subHours($index * 24),
            ]);
        }
    }

    private function getRandomOrderStatus()
    {
        $statuses = ['pending_payment', 'processing', 'packing', 'shipped', 'delivered'];
        $weights = [10, 20, 30, 30, 10]; // Weighted distribution
        
        $random = rand(1, 100);
        $cumulative = 0;
        
        foreach ($weights as $index => $weight) {
            $cumulative += $weight;
            if ($random <= $cumulative) {
                return $statuses[$index];
            }
        }
        
        return 'processing';
    }

    private function getRandomPaymentStatus()
    {
        $statuses = ['pending', 'paid', 'failed'];
        $weights = [10, 80, 10]; // Most orders are paid
        
        $random = rand(1, 100);
        $cumulative = 0;
        
        foreach ($weights as $index => $weight) {
            $cumulative += $weight;
            if ($random <= $cumulative) {
                return $statuses[$index];
            }
        }
        
        return 'paid';
    }
}
