<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Review;
use App\Models\Product;

class AddSampleReviews extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reviews:add-sample';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Add sample reviews with different ratings';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Adding sample reviews...');

        $products = Product::all();
        
        if ($products->count() == 0) {
            $this->warn('No products found. Please create products first.');
            return;
        }

        $reviewComments = [
            'Amazing quality! Highly recommend this product.',
            'Beautiful craftsmanship, exactly as described.',
            'Fast shipping and great customer service.',
            'Love this item! Perfect addition to my collection.',
            'Excellent quality for the price. Will buy again.',
            'Unique and well-made. Very satisfied with my purchase.',
            'Great product, arrived quickly and in perfect condition.',
            'Beautiful design and excellent quality. Highly recommend!',
            'Exactly what I was looking for. Great value for money.',
            'Outstanding craftsmanship and attention to detail.',
            'Good product but could be better.',
            'Not bad, but expected more for the price.',
            'Average quality, nothing special.',
            'Disappointed with the quality.',
            'Poor quality, would not recommend.',
            'Fantastic! Exceeded my expectations.',
            'Very happy with this purchase.',
            'Good value for money.',
            'Nice product, would buy again.',
            'Perfect for what I needed.'
        ];

        $created = 0;
        $maxReviews = 50; // Create 50 reviews
        
        for ($i = 0; $i < $maxReviews; $i++) {
            try {
                $product = $products->random();
                $rating = rand(1, 5);
                $comment = $reviewComments[array_rand($reviewComments)];
                
                // Use different user IDs and add timestamp to make unique
                $userId = rand(1, 10); // Use more user IDs
                $timestamp = time() + $i; // Add timestamp to make unique
                
                // Create review without checking for duplicates (for demo purposes)
                Review::create([
                    'user_id' => $userId,
                    'product_id' => $product->product_id,
                    'rating' => $rating,
                    'comment' => $comment . ' (Review #' . $timestamp . ')',
                    'review_date' => now()->subDays(rand(0, 30)),
                    'created_at' => now()->subDays(rand(0, 30)),
                    'updated_at' => now()
                ]);
                $created++;
            } catch (\Exception $e) {
                // Skip if there's an error
                continue;
            }
        }
        
        $this->info("Created {$created} sample reviews");
        
        // Show rating distribution
        $ratingDistribution = Review::selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->orderBy('rating')
            ->get();
            
        $this->info('Rating distribution:');
        foreach ($ratingDistribution as $dist) {
            $this->line("  {$dist->rating} stars: {$dist->count} reviews");
        }
    }
}