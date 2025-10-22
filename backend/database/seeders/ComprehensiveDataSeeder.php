<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Customer;
use App\Models\Seller;
use App\Models\Product;
use App\Models\Store;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\Shipping;
use App\Models\ShippingHistory;
use App\Models\Review;
use Carbon\Carbon;
use Illuminate\Support\Str;

class ComprehensiveDataSeeder extends Seeder
{
    private $filipinoNames = [
        ['first' => 'Juan', 'last' => 'Dela Cruz'],
        ['first' => 'Maria', 'last' => 'Santos'],
        ['first' => 'Jose', 'last' => 'Reyes'],
        ['first' => 'Ana', 'last' => 'Garcia'],
        ['first' => 'Pedro', 'last' => 'Martinez'],
        ['first' => 'Rosa', 'last' => 'Lopez'],
        ['first' => 'Carlos', 'last' => 'Mendoza'],
        ['first' => 'Elena', 'last' => 'Rivera'],
        ['first' => 'Miguel', 'last' => 'Torres'],
        ['first' => 'Sofia', 'last' => 'Hernandez'],
        ['first' => 'Luis', 'last' => 'Gonzales'],
        ['first' => 'Carmen', 'last' => 'Ramos'],
        ['first' => 'Ricardo', 'last' => 'Cruz'],
        ['first' => 'Isabel', 'last' => 'Flores'],
        ['first' => 'Antonio', 'last' => 'Domingo'],
    ];

    private $philippineAddresses = [
        ['street' => 'Blk 5 Lot 12 Phase 2', 'city' => 'Manila', 'province' => 'Metro Manila'],
        ['street' => '123 Rizal Avenue', 'city' => 'Quezon City', 'province' => 'Metro Manila'],
        ['street' => 'Unit 4B Tower 1 Ayala Center', 'city' => 'Makati', 'province' => 'Metro Manila'],
        ['street' => '456 Bonifacio Drive', 'city' => 'Taguig', 'province' => 'Metro Manila'],
        ['street' => 'Blk 8 Lot 25 Villa Homes', 'city' => 'Calamba', 'province' => 'Laguna'],
        ['street' => '789 J.P. Rizal Street', 'city' => 'Cavite City', 'province' => 'Cavite'],
        ['street' => 'Blk 15 Lot 7 Green Valley', 'city' => 'Lipa', 'province' => 'Batangas'],
        ['street' => '234 National Highway', 'city' => 'San Pedro', 'province' => 'Laguna'],
        ['street' => 'Purok 3 Barangay San Jose', 'city' => 'Antipolo', 'province' => 'Rizal'],
        ['street' => '567 Commonwealth Avenue', 'city' => 'Pasig', 'province' => 'Metro Manila'],
    ];

    private $craftProducts = [
        ['name' => 'Handwoven Rattan Basket', 'category' => 'Home Decor', 'price_range' => [250, 500]],
        ['name' => 'Bamboo Wall Art', 'category' => 'Home Decor', 'price_range' => [400, 800]],
        ['name' => 'Wooden Salad Bowl Set', 'category' => 'Kitchenware', 'price_range' => [350, 600]],
        ['name' => 'Hand-carved Jewelry Box', 'category' => 'Accessories', 'price_range' => [500, 1000]],
        ['name' => 'Macrame Plant Hanger', 'category' => 'Home Decor', 'price_range' => [200, 400]],
        ['name' => 'Ceramic Coffee Mug', 'category' => 'Kitchenware', 'price_range' => [150, 300]],
        ['name' => 'Leather Wallet', 'category' => 'Accessories', 'price_range' => [400, 800]],
        ['name' => 'Woven Table Runner', 'category' => 'Home Decor', 'price_range' => [300, 600]],
        ['name' => 'Handmade Candles Set', 'category' => 'Home Decor', 'price_range' => [250, 500]],
        ['name' => 'Wooden Cutting Board', 'category' => 'Kitchenware', 'price_range' => [350, 700]],
        ['name' => 'Beaded Bracelet', 'category' => 'Jewelry', 'price_range' => [100, 300]],
        ['name' => 'Clay Flower Pot', 'category' => 'Garden', 'price_range' => [150, 350]],
        ['name' => 'Embroidered Pillow Cover', 'category' => 'Home Decor', 'price_range' => [200, 450]],
        ['name' => 'Hand-painted Coasters', 'category' => 'Kitchenware', 'price_range' => [100, 250]],
        ['name' => 'Woven Shopping Bag', 'category' => 'Accessories', 'price_range' => [180, 400]],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🚀 Starting Comprehensive Data Seeder...');
        $this->command->info('════════════════════════════════════════');
        
        // Create customers
        $customers = $this->createCustomers(30);
        $this->command->info("✅ Created {$customers->count()} customers");
        
        // Get existing sellers
        $sellers = Seller::with(['user', 'store'])->get();
        $this->command->info("✅ Found {$sellers->count()} sellers");
        
        // Create products with unique SKUs
        $products = $this->createProducts($sellers);
        $this->command->info("✅ Created {$products->count()} products with unique SKUs");
        
        // Create orders with unique order numbers
        $orders = $this->createOrdersWithShipping($customers, $sellers, $products);
        $this->command->info("✅ Created {$orders->count()} orders with shipping data");
        
        // Create reviews
        $this->createReviews($customers, $products);
        $this->command->info("✅ Created product reviews");
        
        $this->command->info('════════════════════════════════════════');
        $this->command->info('🎉 Comprehensive Data Seeder Completed!');
        $this->command->info('');
        $this->command->info('📊 Summary:');
        $this->command->info("   - Customers: {$customers->count()}");
        $this->command->info("   - Products: {$products->count()} (with unique SKUs)");
        $this->command->info("   - Orders: {$orders->count()} (with unique order numbers)");
        $this->command->info("   - Shipping Records: " . Shipping::count());
        $this->command->info("   - Reviews: " . Review::count());
    }

    private function createCustomers($count)
    {
        $customers = collect();
        
        $this->command->info("📝 Creating {$count} customers with realistic data...");
        
        for ($i = 0; $i < $count; $i++) {
            $name = $this->filipinoNames[array_rand($this->filipinoNames)];
            $address = $this->philippineAddresses[array_rand($this->philippineAddresses)];
            
            $fullName = "{$name['first']} {$name['last']}";
            
            // Generate unique email
            do {
                $email = strtolower($name['first'] . '.' . $name['last'] . rand(1000, 9999) . '@gmail.com');
            } while (User::where('userEmail', $email)->exists());
            
            $user = User::create([
                'userName' => $fullName,
                'userEmail' => $email,
                'userPassword' => bcrypt('password123'),
                'role' => 'customer',
                'userContactNumber' => '09' . rand(100000000, 999999999),
                'userAddress' => $address['street'],
                'userCity' => $address['city'],
                'userProvince' => $address['province'],
                'is_verified' => true,
                'created_at' => Carbon::now()->subDays(rand(1, 180)),
                'updated_at' => Carbon::now()->subDays(rand(1, 90)),
            ]);

            $customer = Customer::create([
                'user_id' => $user->userID,
                'profile_picture_path' => null,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ]);

            $customers->push($customer);
        }
        
        return $customers;
    }

    private function createProducts($sellers)
    {
        $products = collect();
        
        $this->command->info("🎨 Creating products with unique SKUs...");
        
        foreach ($sellers as $seller) {
            // Create 10-15 products per seller
            $productCount = rand(10, 15);
            
            for ($i = 0; $i < $productCount; $i++) {
                $craftProduct = $this->craftProducts[array_rand($this->craftProducts)];
                
                // Generate unique SKU
                $sku = $this->generateSKU($seller->sellerID, $craftProduct['category']);
                
                $product = Product::create([
                    'productName' => $craftProduct['name'],
                    'productDescription' => "Beautiful handcrafted {$craftProduct['name']} made with care and attention to detail.",
                    'productPrice' => rand($craftProduct['price_range'][0], $craftProduct['price_range'][1]),
                    'productQuantity' => rand(5, 50),
                    'status' => 'available',
                    'seller_id' => $seller->sellerID,
                    'category' => $craftProduct['category'],
                    'approval_status' => 'approved',
                    'publish_status' => 'published',
                    'is_featured' => rand(0, 10) > 7,
                    'sku' => $sku, // Unique SKU
                    'created_at' => Carbon::now()->subDays(rand(30, 365)),
                    'updated_at' => Carbon::now()->subDays(rand(1, 30)),
                ]);

                $products->push($product);
            }
        }
        
        return $products;
    }

    private function createOrdersWithShipping($customers, $sellers, $products)
    {
        $orders = collect();
        
        $this->command->info("📦 Creating orders with shipping data...");
        
        // Create 50 orders
        for ($i = 0; $i < 50; $i++) {
            $customer = $customers->random();
            $seller = $sellers->random();
            
            // Get products from this seller
            $sellerProducts = $products->where('seller_id', $seller->sellerID);
            
            if ($sellerProducts->isEmpty()) {
                continue;
            }

            $orderDate = Carbon::now()->subDays(rand(1, 60));
            $orderStatus = $this->getWeightedOrderStatus();
            
            // Generate unique order number
            $orderNumber = $this->generateOrderNumber($orderDate);
            
            $order = Order::create([
                'customer_id' => $customer->customerID,
                'sellerID' => $seller->sellerID,
                'totalAmount' => 0,
                'status' => $orderStatus,
                'paymentStatus' => $orderStatus === 'pending_payment' ? 'pending' : 'paid',
                'location' => $customer->user->userAddress . ', ' . $customer->user->userCity . ', ' . $customer->user->userProvince,
                'order_number' => $orderNumber, // Unique order number
                'created_at' => $orderDate,
                'updated_at' => $orderDate->copy()->addHours(rand(1, 24)),
            ]);

            // Add products to order
            $totalAmount = 0;
            $productCount = rand(1, 4);
            $selectedProducts = $sellerProducts->random(min($productCount, $sellerProducts->count()));

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

            $order->update(['totalAmount' => $totalAmount]);

            // Create shipping for packed, shipped, or delivered orders
            if (in_array($orderStatus, ['packing', 'shipped', 'delivered'])) {
                $this->createShippingWithHistory($order, $customer, $orderStatus, $orderDate);
            }

            $orders->push($order);
            
            $created = $i + 1;
            if ($created % 10 == 0) {
                $this->command->info("   Created {$created} orders...");
            }
        }
        
        return $orders;
    }

    private function createShippingWithHistory($order, $customer, $orderStatus, $orderDate)
    {
        $riderNames = [
            'Juan Dela Cruz', 'Pedro Santos', 'Maria Garcia', 'Jose Reyes',
            'Carlos Mendoza', 'Miguel Rivera', 'Luis Hernandez', 'Antonio Lopez'
        ];
        
        $vehicleTypes = ['Motorcycle', 'Multicab', 'Van', 'Tricycle'];
        
        // Generate unique tracking number
        $trackingNumber = 'CC' . $orderDate->format('Ymd') . strtoupper(substr(md5($order->orderID . uniqid()), 0, 6));
        
        $assignedAt = $orderDate->copy()->addHours(rand(2, 24));
        $shippedAt = in_array($orderStatus, ['shipped', 'delivered']) 
            ? $assignedAt->copy()->addHours(rand(4, 48)) 
            : null;
        $deliveredAt = $orderStatus === 'delivered' 
            ? $shippedAt->copy()->addHours(rand(6, 72)) 
            : null;
        
        $companies = ['JRS Express', 'LBC', 'J&T Express', 'Ninja Van', 'Flash Express', 'Lalamove', 'Grab Express', 'Borzo'];
        
        $shipping = Shipping::create([
            'order_id' => $order->orderID,
            'tracking_number' => $trackingNumber,
            'rider_name' => $riderNames[array_rand($riderNames)],
            'rider_phone' => '09' . rand(100000000, 999999999),
            'rider_email' => strtolower(str_replace(' ', '.', $riderNames[array_rand($riderNames)])) . '@craftconnect.com',
            'rider_company' => $companies[array_rand($companies)],
            'vehicle_type' => $vehicleTypes[array_rand($vehicleTypes)],
            'vehicle_number' => strtoupper(chr(rand(65, 90))) . strtoupper(chr(rand(65, 90))) . strtoupper(chr(rand(65, 90))) . '-' . rand(1000, 9999),
            'delivery_address' => $customer->user->userAddress,
            'delivery_city' => $customer->user->userCity,
            'delivery_province' => $customer->user->userProvince,
            'delivery_notes' => $this->getRandomDeliveryNote(),
            'estimated_delivery' => $assignedAt->copy()->addDays(rand(2, 5)),
            'status' => $orderStatus,
            'assigned_at' => $assignedAt,
            'shipped_at' => $shippedAt,
            'delivered_at' => $deliveredAt,
        ]);

        // Create shipping history
        $this->createShippingHistoryEntries($shipping, $orderStatus, $assignedAt, $shippedAt, $deliveredAt);
    }

    private function createShippingHistoryEntries($shipping, $status, $assignedAt, $shippedAt, $deliveredAt)
    {
        $locations = [
            'CraftConnect Warehouse - Manila',
            'Sorting Hub - Quezon City',
            'Distribution Center - Makati',
            'Transit Hub - Laguna',
            'Local Hub - ' . $shipping->delivery_city,
            'Out for Delivery - ' . $shipping->delivery_city,
        ];

        // Packing status
        ShippingHistory::create([
            'shipping_id' => $shipping->id,
            'status' => 'packing',
            'description' => 'Order packed and ready for pickup',
            'location' => $locations[0],
            'timestamp' => $assignedAt,
        ]);

        // Shipped status
        if (in_array($status, ['shipped', 'delivered']) && $shippedAt) {
            ShippingHistory::create([
                'shipping_id' => $shipping->id,
                'status' => 'shipped',
                'description' => 'Package picked up by courier',
                'location' => $locations[1],
                'timestamp' => $shippedAt,
            ]);

            // Add transit updates
            if ($status === 'shipped') {
                for ($i = 0; $i < rand(1, 2); $i++) {
                    ShippingHistory::create([
                        'shipping_id' => $shipping->id,
                        'status' => 'shipped',
                        'description' => 'Package in transit',
                        'location' => $locations[rand(2, 4)],
                        'timestamp' => $shippedAt->copy()->addHours(rand(4, 24) * ($i + 1)),
                    ]);
                }
            }
        }

        // Delivered status
        if ($status === 'delivered' && $deliveredAt) {
            ShippingHistory::create([
                'shipping_id' => $shipping->id,
                'status' => 'delivered',
                'description' => 'Package successfully delivered to customer',
                'location' => $shipping->delivery_city . ', ' . $shipping->delivery_province,
                'timestamp' => $deliveredAt,
            ]);
        }
    }

    private function createReviews($customers, $products)
    {
        $this->command->info("⭐ Creating product reviews...");
        
        $reviewTexts = [
            'Amazing quality! Highly recommend.',
            'Beautiful craftsmanship, exactly as described.',
            'Great product, fast shipping!',
            'Love this item, perfect for my needs.',
            'Excellent quality and beautiful design.',
            'Very satisfied with this purchase.',
            'Outstanding workmanship, will buy again!',
            'Perfect gift for my loved one.',
            'Better than expected! Great value.',
            'Beautifully made, authentic Filipino craft.',
        ];

        for ($i = 0; $i < 100; $i++) {
            $customer = $customers->random();
            $product = $products->random();
            
            // Check if review already exists
            $exists = Review::where('user_id', $customer->user_id)
                ->where('product_id', $product->product_id)
                ->exists();
            
            if (!$exists) {
                Review::create([
                    'user_id' => $customer->user_id,
                    'product_id' => $product->product_id,
                    'rating' => rand(3, 5),
                    'comment' => $reviewTexts[array_rand($reviewTexts)],
                    'review_date' => Carbon::now()->subDays(rand(1, 90)),
                ]);
            }
        }
    }

    private function generateSKU($sellerId, $category)
    {
        // Format: CC-SELLER-CATEGORY-RANDOM
        // Example: CC-S01-HOME-A1B2C3
        $categoryCode = strtoupper(substr($category, 0, 4));
        $sellerCode = 'S' . str_pad($sellerId, 2, '0', STR_PAD_LEFT);
        $random = strtoupper(substr(md5(uniqid()), 0, 6));
        
        return "CC-{$sellerCode}-{$categoryCode}-{$random}";
    }

    private function generateOrderNumber($date)
    {
        // Format: ORD-YYYYMMDD-RANDOM
        // Example: ORD-20251008-A1B2C3
        $dateCode = $date->format('Ymd');
        $random = strtoupper(substr(md5(uniqid()), 0, 6));
        
        return "ORD-{$dateCode}-{$random}";
    }

    private function getWeightedOrderStatus()
    {
        $statuses = ['processing', 'packing', 'shipped', 'delivered', 'pending_payment'];
        $weights = [25, 25, 25, 20, 5]; // More orders in active statuses
        
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

    private function getRandomDeliveryNote()
    {
        $notes = [
            'Please call before delivery',
            'Leave with security guard if not home',
            'Ring doorbell twice',
            'Contact via phone first',
            'Deliver between 9 AM - 5 PM only',
            'Handle with care - fragile items',
            'No special instructions',
            null,
        ];
        
        return $notes[array_rand($notes)];
    }
}
