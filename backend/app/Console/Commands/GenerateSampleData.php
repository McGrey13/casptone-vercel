<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;

class GenerateSampleData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'data:generate-sample';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate sample data for analytics testing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating sample data...');

        // Generate sample orders
        $this->generateOrders();
        
        // Generate sample reviews
        $this->generateReviews();

        $this->info('Sample data generated successfully!');
    }

    private function generateOrders()
    {
        $statuses = ['delivered', 'pending', 'packing', 'shipped'];
        $startDate = now()->subDays(30);
        
        for ($i = 0; $i < 20; $i++) {
            Order::create([
                'customer_id' => 1,
                'totalAmount' => rand(50, 500),
                'status' => $statuses[array_rand($statuses)],
                'location' => 'Sample Location ' . ($i + 1),
                'created_at' => $startDate->copy()->addDays(rand(0, 30)),
                'updated_at' => now()
            ]);
        }
        
        $this->info('Created 20 sample orders');
    }

    private function generateReviews()
    {
        // Get existing products
        $products = Product::all();
        
        if ($products->count() > 0) {
            $created = 0;
            $maxReviews = min(15, $products->count()); // Don't exceed product count
            
            foreach ($products->take($maxReviews) as $index => $product) {
                // Check if review already exists
                $existingReview = Review::where('user_id', 1)
                    ->where('product_id', $product->product_id)
                    ->first();
                
                if (!$existingReview) {
                    Review::create([
                        'user_id' => 1,
                        'product_id' => $product->product_id,
                        'rating' => rand(1, 5),
                        'comment' => 'This is a sample review for testing analytics',
                        'review_date' => now()->subDays(rand(0, 30)),
                        'created_at' => now()->subDays(rand(0, 30)),
                        'updated_at' => now()
                    ]);
                    $created++;
                }
            }
            $this->info("Created {$created} sample reviews");
        } else {
            $this->warn('No products found, skipping review generation');
        }
    }
}