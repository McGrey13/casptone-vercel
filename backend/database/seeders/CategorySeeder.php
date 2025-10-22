<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Basketry & Weaving',
            'Woodcrafts',
            'Textiles',
            'Jewelry',
            'Pottery',
            'Home Decor',
            'Accessories',
            'Paper Crafts',
            'Metal Crafts',
            'Miniatures & Souvenirs',
            'Rubber Stamp Engraving',
            'Traditional Accessories',
            'Statuary & Sculpture',
            'Embroidery',
            'Rattan/Bamboo Crafts',
            'Coconut Crafts',
            'Musical Instruments',
            'Candles',
            'Leather',
            'Art',
            'Kitchenware',
            'Garden',
        ];

        foreach ($categories as $categoryName) {
            Category::firstOrCreate(
                ['CategoryName' => $categoryName]
            );
        }

        $this->command->info('✅ Categories seeded successfully!');
    }
}

