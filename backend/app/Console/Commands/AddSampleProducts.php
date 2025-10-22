<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;

class AddSampleProducts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'products:add-sample';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Add sample products for reviews';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Adding sample products...');

        $statuses = ['in stock', 'out of stock', 'low stock', 'inactive'];
        $categories = ['Handmade', 'Art', 'Craft', 'Jewelry', 'Home Decor', 'Textiles', 'Pottery', 'Woodwork'];
        $productNames = [
            'Handmade Ceramic Bowl', 'Artisan Wooden Spoon', 'Custom Jewelry Set', 'Handwoven Scarf',
            'Decorative Pottery Vase', 'Handcrafted Candle', 'Artistic Wall Hanging', 'Custom Leather Bag',
            'Handmade Soap Set', 'Artisan Coffee Mug', 'Custom Painting', 'Handwoven Basket',
            'Wooden Cutting Board', 'Ceramic Mug Set', 'Handmade Bracelet', 'Woven Throw Pillow',
            'Pottery Plant Pot', 'Wooden Phone Stand', 'Handmade Earrings', 'Fabric Wall Art'
        ];
        
        $created = 0;
        $productCount = 10; // Create 10 new products
        
        for ($i = 0; $i < $productCount; $i++) {
            try {
                $productId = 'REV' . time() . rand(1000, 9999); // Unique ID
                
                Product::create([
                    'product_id' => $productId,
                    'seller_id' => 1,
                    'productName' => $productNames[array_rand($productNames)] . ' ' . ($i + 1),
                    'productDescription' => 'This is a beautiful handcrafted item created by our talented artisans. Perfect for adding a unique touch to your home or as a special gift.',
                    'productPrice' => rand(25, 300),
                    'productQuantity' => rand(1, 50),
                    'status' => $statuses[array_rand($statuses)],
                    'category' => $categories[array_rand($categories)],
                    'average_rating' => 0, // Will be updated when reviews are added
                    'is_featured' => rand(0, 1),
                    'created_at' => now()->subDays(rand(0, 30)),
                    'updated_at' => now()
                ]);
                $created++;
            } catch (\Exception $e) {
                // Skip if there's an error
                continue;
            }
        }
        
        $this->info("Created {$created} sample products");
    }
}