<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use App\Models\Order;
use App\Models\Review;
use App\Models\DiscountCode;
use App\Models\Seller;
use Carbon\Carbon;
use Illuminate\Support\Str;

class GenerateSellerAnalyticsData extends Command
{
    protected $signature = 'analytics:generate-seller-data {seller_id}';
    protected $description = 'Generate mock data for seller analytics testing';

    public function handle()
    {
        $sellerId = $this->argument('seller_id');
        $seller = Seller::with('user')->find($sellerId);

        if (!$seller) {
            $this->error("Seller not found!");
            return 1;
        }

        $this->info("Generating data for seller: " . $seller->user->userName);

        // Generate Products
        $this->info("Generating products...");
        $products = $this->generateProducts($seller);
        $this->info("Created " . count($products) . " products");

        // Generate Orders
        $this->info("Generating orders...");
        $orders = $this->generateOrders($products);
        $this->info("Created " . count($orders) . " orders");

        // Generate Reviews
        $this->info("Generating reviews...");
        $reviews = $this->generateReviews($products);
        $this->info("Created " . count($reviews) . " reviews");

        // Generate Discount Codes
        $this->info("Generating discount codes...");
        $discountCodes = $this->generateDiscountCodes($seller);
        $this->info("Created " . count($discountCodes) . " discount codes");

        $this->info("All mock data generated successfully!");
        return 0;
    }

    private function generateProducts($seller)
    {
        $categories = ['Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Paintings'];
        $products = [];

        for ($i = 0; $i < 10; $i++) {
            $product = Product::create([
                'productName' => 'Test Product ' . ($i + 1),
                'productDescription' => 'Description for test product ' . ($i + 1),
                'productPrice' => rand(100, 1000),
                'productQuantity' => rand(5, 50),
                'status' => rand(0, 1) ? 'in stock' : 'low stock',
                'category' => $categories[array_rand($categories)],
                'seller_id' => $seller->sellerID,
                'approval_status' => 'approved',
                'average_rating' => rand(3, 5),
                'review_count' => 0,
                'publish_status' => 'published',
                'is_featured' => rand(0, 1)
            ]);
            $products[] = $product;
        }

        return $products;
    }

    private function generateOrders($products)
    {
        $statuses = ['Delivered', 'Pending', 'Packing', 'Shipped'];
        $orders = [];

        // Generate orders for the last 12 months
        for ($month = 0; $month < 12; $month++) {
            $numOrders = rand(3, 8); // 3-8 orders per month
            
            for ($i = 0; $i < $numOrders; $i++) {
                $date = Carbon::now()->subMonths($month)->subDays(rand(0, 30));
                $order = Order::create([
                    'orderID' => 'ORD-' . Str::random(8),
                    'totalAmount' => 0,
                    'status' => $statuses[array_rand($statuses)],
                    'created_at' => $date,
                    'updated_at' => $date,
                    'location' => 'Test Location',
                    'customer_id' => 1 // Using a default customer ID
                ]);

                // Add 1-3 products to each order
                $numProducts = rand(1, 3);
                $total = 0;
                
                for ($j = 0; $j < $numProducts; $j++) {
                    $product = $products[array_rand($products)];
                    $quantity = rand(1, 3);
                    $price = $product->productPrice;
                    $total += $price * $quantity;

                    $order->products()->attach($product->id, [
                        'quantity' => $quantity,
                        'price' => $price
                    ]);
                }

                $order->update(['totalAmount' => $total]);
                $orders[] = $order;
            }
        }

        return $orders;
    }

    private function generateReviews($products)
    {
        $reviews = [];
        $comments = [
            'Great product!',
            'Very satisfied with the quality',
            'Beautiful craftsmanship',
            'Exactly what I was looking for',
            'Highly recommended'
        ];

        foreach ($products as $product) {
            $numReviews = rand(2, 5);
            
            $this->info("Creating reviews for product: " . $product->product_id);
            
            for ($i = 0; $i < $numReviews; $i++) {
                try {
                    $date = Carbon::now()->subDays(rand(0, 90));
                    $review = Review::create([
                        'product_id' => $product->product_id,
                        'user_id' => rand(1, 5), // Using random user IDs
                        'rating' => rand(3, 5),
                        'comment' => $comments[array_rand($comments)],
                        'review_date' => $date,
                        'created_at' => $date,
                        'updated_at' => $date
                    ]);
                } catch (\Exception $e) {
                    $this->error("Failed to create review: " . $e->getMessage());
                    $this->info("Product ID: " . var_export($product->product_id, true));
                    continue;
                }
                $reviews[] = $review;
            }

            // Update product review count and average rating
            $productReviews = Review::where('product_id', $product->product_id)->get();
            $product->review_count = $productReviews->count();
            $product->average_rating = $productReviews->avg('rating') ?? 0;
            $product->save();
        }

        return $reviews;
    }

    private function generateDiscountCodes($seller)
    {
        $discountCodes = [];
        $types = ['percentage', 'fixed'];

        for ($i = 0; $i < 5; $i++) {
            $isActive = rand(0, 1);
            $usageLimit = rand(10, 50);
            $timesUsed = $isActive ? rand(0, $usageLimit - 1) : $usageLimit;
            
            $discountCode = DiscountCode::create([
                'code' => 'TEST' . strtoupper(Str::random(6)),
                'type' => $types[array_rand($types)],
                'value' => rand(5, 30),
                'usage_limit' => $usageLimit,
                'times_used' => $timesUsed,
                'expires_at' => Carbon::now()->addDays(rand(-10, 30)), // Some expired, some active
                'created_by' => $seller->user->userID
            ]);
            $discountCodes[] = $discountCode;
        }

        return $discountCodes;
    }
}
