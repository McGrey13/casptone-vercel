<?php

namespace Database\Seeders;

/**
 * Analytics Data Seeder - Comprehensive Dashboard Data Generator
 * 
 * This seeder generates complete analytics data for ALL graphs in the Admin Analytics Dashboard.
 * Minimum 3 years of data recommended for full visualization coverage.
 * 
 * Generated Data Types:
 * ====================
 * 
 * MAIN ANALYTICS (All Tabs):
 * - Revenue Analytics (revenue trends, commission, fees) → Revenue Tab
 * - Order Analytics (order volume, status, completion rates) → Orders Tab  
 * - Review Analytics (ratings, review distribution) → Reviews Tab
 * - Product Analytics (inventory, status, quality) → Products Tab
 * - Seller Revenue Analytics (seller performance) → Sellers Tab
 * - Content Moderation Analytics (approval rates, moderation) → Moderation Tab
 * 
 * MICRO ANALYTICS (Revenue Tab):
 * - Detailed Review Analytics (user-level review data)
 * - Seller Comparison Analytics (competitive analysis)
 * - Category Performance Analytics (category trends)
 * - Most Selling Product Analytics (product performance trends, top sellers by quantity)
 * - Highest Sales Seller Analytics (top sellers by revenue, growth comparison)
 * 
 * TIME PERIODS GENERATED:
 * - Daily: All individual days in selected range
 * - Monthly: Aggregated monthly data
 * - Quarterly: Aggregated quarterly data (Q1, Q2, Q3, Q4)
 * - Yearly: Aggregated yearly data (for multi-year ranges)
 * 
 * FEATURES:
 * - Seasonal variations (holidays, weekends, special events)
 * - Realistic data patterns with growth trends
 * - Full database integration with proper relationships
 * - Progress tracking for large datasets
 * - Interactive terminal prompts for flexible generation
 */

use Illuminate\Database\Seeder;
use App\Models\Seller;
use App\Models\Product;
use App\Models\User;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\Review;
use App\Models\Analytics\RevenueAnalytics;
use App\Models\Shipping;
use App\Models\ShippingHistory;
use App\Models\Analytics\SellerRevenueAnalytics;
use App\Models\Analytics\OrderAnalytics;
use App\Models\Analytics\ReviewAnalytics;
use App\Models\Analytics\ProductAnalytics;
use App\Models\Analytics\ContentModerationAnalytics;
use App\Models\Analytics\DetailedReviewAnalytics;
use App\Models\Analytics\SellerComparisonAnalytics;
use App\Models\Analytics\CategoryPerformanceAnalytics;
use App\Models\Analytics\MostSellingProductAnalytics;
use App\Models\Analytics\HighestSalesSellerAnalytics;
use Carbon\Carbon;

class AnalyticsDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('╔════════════════════════════════════════════════╗');
        $this->command->info('║    Analytics Data Seeder - Enhanced Version   ║');
        $this->command->info('╚════════════════════════════════════════════════╝');
        $this->command->newLine();

        // Get all sellers
        $sellers = Seller::all();
        
        if ($sellers->isEmpty()) {
            $this->command->error('No sellers found. Please run seller seeder first.');
            return;
        }

        $this->command->info('Found ' . $sellers->count() . ' sellers');

        // Expanded sample product data with more variety
        $sampleProducts = [
            // Handmade Jewelry (15 products)
            ['name' => 'Handcrafted Silver Ring', 'description' => 'Beautiful handcrafted silver ring with intricate design', 'price' => 89.99, 'category' => 'Jewelry'],
            ['name' => 'Beaded Necklace Set', 'description' => 'Elegant beaded necklace set with matching earrings', 'price' => 65.50, 'category' => 'Jewelry'],
            ['name' => 'Wooden Pendant', 'description' => 'Unique wooden pendant with natural finish', 'price' => 45.00, 'category' => 'Jewelry'],
            ['name' => 'Gemstone Bracelet', 'description' => 'Hand-woven bracelet with natural gemstones', 'price' => 78.25, 'category' => 'Jewelry'],
            ['name' => 'Artisan Earrings', 'description' => 'Handmade earrings with vintage style', 'price' => 55.75, 'category' => 'Jewelry'],
            ['name' => 'Pearl Choker Necklace', 'description' => 'Classic pearl choker with elegant design', 'price' => 120.00, 'category' => 'Jewelry'],
            ['name' => 'Gold-plated Cufflinks', 'description' => 'Sophisticated gold-plated cufflinks', 'price' => 95.50, 'category' => 'Jewelry'],
            ['name' => 'Crystal Drop Earrings', 'description' => 'Sparkling crystal drop earrings', 'price' => 68.75, 'category' => 'Jewelry'],
            ['name' => 'Beaded Anklet', 'description' => 'Delicate beaded anklet for summer', 'price' => 35.25, 'category' => 'Jewelry'],
            ['name' => 'Silver Chain Bracelet', 'description' => 'Simple yet elegant silver chain bracelet', 'price' => 42.50, 'category' => 'Jewelry'],
            ['name' => 'Turquoise Pendant', 'description' => 'Natural turquoise pendant on leather cord', 'price' => 58.00, 'category' => 'Jewelry'],
            ['name' => 'Vintage Brooch', 'description' => 'Antique-style vintage brooch', 'price' => 85.75, 'category' => 'Jewelry'],
            ['name' => 'Wire-wrapped Ring', 'description' => 'Intricate wire-wrapped gemstone ring', 'price' => 72.25, 'category' => 'Jewelry'],
            ['name' => 'Charm Bracelet', 'description' => 'Personalized charm bracelet', 'price' => 105.00, 'category' => 'Jewelry'],
            ['name' => 'Moonstone Necklace', 'description' => 'Mystical moonstone pendant necklace', 'price' => 92.50, 'category' => 'Jewelry'],

            // Pottery & Ceramics (15 products)
            ['name' => 'Hand-thrown Ceramic Bowl', 'description' => 'Beautiful hand-thrown ceramic bowl perfect for serving', 'price' => 125.00, 'category' => 'Pottery'],
            ['name' => 'Decorative Vase', 'description' => 'Elegant decorative vase with unique glaze', 'price' => 95.50, 'category' => 'Pottery'],
            ['name' => 'Coffee Mug Set', 'description' => 'Set of 4 handcrafted coffee mugs', 'price' => 85.00, 'category' => 'Pottery'],
            ['name' => 'Ceramic Plate Collection', 'description' => 'Set of decorative ceramic plates', 'price' => 110.25, 'category' => 'Pottery'],
            ['name' => 'Artisan Teapot', 'description' => 'Handcrafted teapot with traditional design', 'price' => 145.75, 'category' => 'Pottery'],
            ['name' => 'Clay Sculpture', 'description' => 'Hand-sculpted clay art piece', 'price' => 185.00, 'category' => 'Pottery'],
            ['name' => 'Ceramic Salt Cellar', 'description' => 'Handmade ceramic salt cellar with spoon', 'price' => 65.50, 'category' => 'Pottery'],
            ['name' => 'Glazed Serving Bowl', 'description' => 'Large glazed serving bowl', 'price' => 98.75, 'category' => 'Pottery'],
            ['name' => 'Ceramic Candle Holder', 'description' => 'Decorative ceramic candle holder set', 'price' => 45.25, 'category' => 'Pottery'],
            ['name' => 'Hand-painted Tiles', 'description' => 'Set of hand-painted ceramic tiles', 'price' => 75.00, 'category' => 'Pottery'],
            ['name' => 'Ceramic Planter', 'description' => 'Beautiful ceramic plant pot', 'price' => 55.50, 'category' => 'Pottery'],
            ['name' => 'Raku Fired Vase', 'description' => 'Unique raku fired ceramic vase', 'price' => 165.25, 'category' => 'Pottery'],
            ['name' => 'Ceramic Spoon Rest', 'description' => 'Handmade ceramic spoon rest', 'price' => 25.75, 'category' => 'Pottery'],
            ['name' => 'Stoneware Pitcher', 'description' => 'Traditional stoneware water pitcher', 'price' => 115.00, 'category' => 'Pottery'],
            ['name' => 'Ceramic Butter Dish', 'description' => 'Elegant ceramic butter dish with lid', 'price' => 68.50, 'category' => 'Pottery'],

            // Textiles & Crafts (15 products)
            ['name' => 'Handwoven Scarf', 'description' => 'Luxurious handwoven scarf with natural fibers', 'price' => 75.00, 'category' => 'Textiles'],
            ['name' => 'Embroidered Pillow', 'description' => 'Beautiful embroidered decorative pillow', 'price' => 95.00, 'category' => 'Textiles'],
            ['name' => 'Quilted Blanket', 'description' => 'Hand-stitched quilted blanket', 'price' => 180.50, 'category' => 'Textiles'],
            ['name' => 'Woven Wall Hanging', 'description' => 'Decorative woven wall hanging', 'price' => 125.25, 'category' => 'Textiles'],
            ['name' => 'Hand-knitted Shawl', 'description' => 'Elegant hand-knitted shawl', 'price' => 105.75, 'category' => 'Textiles'],
            ['name' => 'Macrame Plant Hanger', 'description' => 'Decorative macrame plant hanger', 'price' => 45.50, 'category' => 'Textiles'],
            ['name' => 'Crocheted Doily Set', 'description' => 'Set of hand-crocheted doilies', 'price' => 35.25, 'category' => 'Textiles'],
            ['name' => 'Felted Wool Bag', 'description' => 'Hand-felted wool shoulder bag', 'price' => 85.75, 'category' => 'Textiles'],
            ['name' => 'Linen Table Runner', 'description' => 'Hand-embroidered linen table runner', 'price' => 68.00, 'category' => 'Textiles'],
            ['name' => 'Woven Basket', 'description' => 'Traditional hand-woven storage basket', 'price' => 95.50, 'category' => 'Textiles'],
            ['name' => 'Patchwork Quilt', 'description' => 'Colorful patchwork quilt', 'price' => 225.00, 'category' => 'Textiles'],
            ['name' => 'Tassel Garland', 'description' => 'Decorative tassel garland', 'price' => 42.75, 'category' => 'Textiles'],
            ['name' => 'Hand-dyed Scarf', 'description' => 'Beautiful hand-dyed silk scarf', 'price' => 88.25, 'category' => 'Textiles'],
            ['name' => 'Cross-stitch Art', 'description' => 'Hand-stitched cross-stitch artwork', 'price' => 125.50, 'category' => 'Textiles'],
            ['name' => 'Woven Placemats', 'description' => 'Set of 4 woven placemats', 'price' => 55.00, 'category' => 'Textiles'],

            // Woodworking (15 products)
            ['name' => 'Hand-carved Wooden Bowl', 'description' => 'Beautiful hand-carved wooden bowl', 'price' => 155.00, 'category' => 'Woodworking'],
            ['name' => 'Custom Cutting Board', 'description' => 'Premium custom cutting board', 'price' => 85.50, 'category' => 'Woodworking'],
            ['name' => 'Wooden Wall Art', 'description' => 'Intricate wooden wall art piece', 'price' => 225.00, 'category' => 'Woodworking'],
            ['name' => 'Handcrafted Coaster Set', 'description' => 'Set of handcrafted wooden coasters', 'price' => 45.25, 'category' => 'Woodworking'],
            ['name' => 'Custom Wooden Box', 'description' => 'Beautiful custom wooden storage box', 'price' => 135.75, 'category' => 'Woodworking'],
            ['name' => 'Wooden Wine Rack', 'description' => 'Handcrafted wooden wine rack', 'price' => 185.50, 'category' => 'Woodworking'],
            ['name' => 'Carved Wooden Spoon', 'description' => 'Hand-carved wooden cooking spoon', 'price' => 35.75, 'category' => 'Woodworking'],
            ['name' => 'Wooden Picture Frame', 'description' => 'Custom wooden picture frame', 'price' => 65.25, 'category' => 'Woodworking'],
            ['name' => 'Wooden Salt Box', 'description' => 'Traditional wooden salt storage box', 'price' => 55.50, 'category' => 'Woodworking'],
            ['name' => 'Carved Wooden Figurine', 'description' => 'Hand-carved wooden animal figurine', 'price' => 95.00, 'category' => 'Woodworking'],
            ['name' => 'Wooden Bread Box', 'description' => 'Handcrafted wooden bread storage box', 'price' => 125.75, 'category' => 'Woodworking'],
            ['name' => 'Wooden Phone Stand', 'description' => 'Minimalist wooden phone stand', 'price' => 42.50, 'category' => 'Woodworking'],
            ['name' => 'Carved Wooden Bowl Set', 'description' => 'Set of 3 hand-carved wooden bowls', 'price' => 175.25, 'category' => 'Woodworking'],
            ['name' => 'Wooden Utensil Holder', 'description' => 'Kitchen wooden utensil holder', 'price' => 75.00, 'category' => 'Woodworking'],
            ['name' => 'Wooden Laptop Stand', 'description' => 'Ergonomic wooden laptop stand', 'price' => 115.50, 'category' => 'Woodworking'],

            // Art & Paintings (15 products)
            ['name' => 'Original Watercolor Painting', 'description' => 'Original watercolor painting on canvas', 'price' => 250.00, 'category' => 'Art'],
            ['name' => 'Acrylic Landscape Art', 'description' => 'Beautiful acrylic landscape painting', 'price' => 195.50, 'category' => 'Art'],
            ['name' => 'Abstract Art Print', 'description' => 'Limited edition abstract art print', 'price' => 75.00, 'category' => 'Art'],
            ['name' => 'Hand-painted Ceramic Tile', 'description' => 'Decorative hand-painted ceramic tile', 'price' => 35.25, 'category' => 'Art'],
            ['name' => 'Mixed Media Artwork', 'description' => 'Unique mixed media artwork', 'price' => 175.75, 'category' => 'Art'],
            ['name' => 'Oil Painting Portrait', 'description' => 'Hand-painted oil portrait', 'price' => 325.00, 'category' => 'Art'],
            ['name' => 'Digital Art Print', 'description' => 'High-quality digital art print', 'price' => 65.50, 'category' => 'Art'],
            ['name' => 'Collage Artwork', 'description' => 'Creative collage art piece', 'price' => 125.75, 'category' => 'Art'],
            ['name' => 'Pencil Sketch', 'description' => 'Detailed pencil sketch artwork', 'price' => 85.25, 'category' => 'Art'],
            ['name' => 'Charcoal Drawing', 'description' => 'Dramatic charcoal drawing', 'price' => 95.00, 'category' => 'Art'],
            ['name' => 'Pastel Painting', 'description' => 'Soft pastel painting', 'price' => 145.50, 'category' => 'Art'],
            ['name' => 'Ink Wash Painting', 'description' => 'Traditional ink wash painting', 'price' => 155.75, 'category' => 'Art'],
            ['name' => 'Abstract Canvas', 'description' => 'Large abstract canvas painting', 'price' => 285.00, 'category' => 'Art'],
            ['name' => 'Botanical Illustration', 'description' => 'Detailed botanical illustration', 'price' => 105.25, 'category' => 'Art'],
            ['name' => 'Calligraphy Art', 'description' => 'Hand-lettered calligraphy artwork', 'price' => 75.50, 'category' => 'Art'],

            // Leather Goods (15 products)
            ['name' => 'Handcrafted Leather Wallet', 'description' => 'Premium handcrafted leather wallet', 'price' => 125.00, 'category' => 'Leather'],
            ['name' => 'Custom Leather Belt', 'description' => 'Hand-tooled leather belt', 'price' => 95.50, 'category' => 'Leather'],
            ['name' => 'Leather Journal Cover', 'description' => 'Beautiful leather journal cover', 'price' => 85.00, 'category' => 'Leather'],
            ['name' => 'Handbag', 'description' => 'Elegant handmade leather handbag', 'price' => 245.25, 'category' => 'Leather'],
            ['name' => 'Leather Keychain', 'description' => 'Hand-tooled leather keychain', 'price' => 25.75, 'category' => 'Leather'],
            ['name' => 'Leather Phone Case', 'description' => 'Handmade leather phone case', 'price' => 65.50, 'category' => 'Leather'],
            ['name' => 'Leather Laptop Sleeve', 'description' => 'Premium leather laptop sleeve', 'price' => 135.75, 'category' => 'Leather'],
            ['name' => 'Leather Coin Purse', 'description' => 'Small leather coin purse', 'price' => 45.25, 'category' => 'Leather'],
            ['name' => 'Leather Watch Band', 'description' => 'Handcrafted leather watch band', 'price' => 75.00, 'category' => 'Leather'],
            ['name' => 'Leather Backpack', 'description' => 'Handmade leather backpack', 'price' => 295.50, 'category' => 'Leather'],
            ['name' => 'Leather Sunglasses Case', 'description' => 'Leather sunglasses case', 'price' => 55.75, 'category' => 'Leather'],
            ['name' => 'Leather iPad Case', 'description' => 'Handcrafted leather iPad case', 'price' => 185.25, 'category' => 'Leather'],
            ['name' => 'Leather Dog Collar', 'description' => 'Handmade leather dog collar', 'price' => 85.50, 'category' => 'Leather'],
            ['name' => 'Leather Business Card Holder', 'description' => 'Elegant leather business card holder', 'price' => 65.25, 'category' => 'Leather'],
            ['name' => 'Leather Camera Strap', 'description' => 'Professional leather camera strap', 'price' => 95.75, 'category' => 'Leather'],

            // Candles & Soaps (15 products)
            ['name' => 'Soy Candle Collection', 'description' => 'Hand-poured soy candle collection', 'price' => 65.00, 'category' => 'Candles'],
            ['name' => 'Artisan Soap Set', 'description' => 'Handmade artisan soap set', 'price' => 45.50, 'category' => 'Candles'],
            ['name' => 'Essential Oil Candles', 'description' => 'Aromatherapy candles with essential oils', 'price' => 55.25, 'category' => 'Candles'],
            ['name' => 'Bath Bomb Collection', 'description' => 'Luxurious bath bomb collection', 'price' => 35.00, 'category' => 'Candles'],
            ['name' => 'Wax Melts Set', 'description' => 'Hand-poured wax melts in various scents', 'price' => 28.75, 'category' => 'Candles'],
            ['name' => 'Lavender Soap Bar', 'description' => 'Handmade lavender soap bar', 'price' => 12.50, 'category' => 'Candles'],
            ['name' => 'Vanilla Candle', 'description' => 'Hand-poured vanilla scented candle', 'price' => 42.75, 'category' => 'Candles'],
            ['name' => 'Tea Tree Soap', 'description' => 'Antibacterial tea tree soap', 'price' => 15.25, 'category' => 'Candles'],
            ['name' => 'Citrus Wax Melts', 'description' => 'Fresh citrus scented wax melts', 'price' => 22.50, 'category' => 'Candles'],
            ['name' => 'Rose Petal Soap', 'description' => 'Luxurious rose petal soap', 'price' => 18.75, 'category' => 'Candles'],
            ['name' => 'Sandalwood Candle', 'description' => 'Woody sandalwood scented candle', 'price' => 48.50, 'category' => 'Candles'],
            ['name' => 'Eucalyptus Bath Salts', 'description' => 'Relaxing eucalyptus bath salts', 'price' => 25.00, 'category' => 'Candles'],
            ['name' => 'Honey Soap', 'description' => 'Moisturizing honey soap bar', 'price' => 16.25, 'category' => 'Candles'],
            ['name' => 'Ocean Breeze Candle', 'description' => 'Fresh ocean breeze scented candle', 'price' => 52.75, 'category' => 'Candles'],
            ['name' => 'Oatmeal Soap', 'description' => 'Gentle oatmeal exfoliating soap', 'price' => 14.50, 'category' => 'Candles'],

            // Additional Categories for Better Distribution
            // Home Decor (10 products)
            ['name' => 'Decorative Wall Mirror', 'description' => 'Handcrafted decorative wall mirror', 'price' => 165.50, 'category' => 'Home Decor'],
            ['name' => 'Ceramic Planter Set', 'description' => 'Set of decorative ceramic planters', 'price' => 85.25, 'category' => 'Home Decor'],
            ['name' => 'Woven Throw Pillow', 'description' => 'Colorful woven throw pillow', 'price' => 45.75, 'category' => 'Home Decor'],
            ['name' => 'Wooden Bookend Set', 'description' => 'Hand-carved wooden bookends', 'price' => 65.00, 'category' => 'Home Decor'],
            ['name' => 'Metal Wall Sculpture', 'description' => 'Abstract metal wall sculpture', 'price' => 125.50, 'category' => 'Home Decor'],
            ['name' => 'Ceramic Coaster Set', 'description' => 'Set of hand-painted ceramic coasters', 'price' => 35.25, 'category' => 'Home Decor'],
            ['name' => 'Woven Storage Basket', 'description' => 'Large woven storage basket', 'price' => 95.75, 'category' => 'Home Decor'],
            ['name' => 'Wooden Candle Holder', 'description' => 'Handcrafted wooden candle holder', 'price' => 55.50, 'category' => 'Home Decor'],
            ['name' => 'Ceramic Vase Set', 'description' => 'Set of decorative ceramic vases', 'price' => 115.25, 'category' => 'Home Decor'],
            ['name' => 'Metal Wind Chime', 'description' => 'Handcrafted metal wind chime', 'price' => 75.00, 'category' => 'Home Decor'],

            // Accessories (10 products)
            ['name' => 'Handwoven Tote Bag', 'description' => 'Eco-friendly handwoven tote bag', 'price' => 65.50, 'category' => 'Accessories'],
            ['name' => 'Leather Hair Accessory', 'description' => 'Handmade leather hair accessory', 'price' => 35.25, 'category' => 'Accessories'],
            ['name' => 'Beaded Anklet', 'description' => 'Delicate beaded ankle bracelet', 'price' => 25.75, 'category' => 'Accessories'],
            ['name' => 'Macrame Purse', 'description' => 'Handmade macrame purse', 'price' => 85.00, 'category' => 'Accessories'],
            ['name' => 'Fabric Hair Scarf', 'description' => 'Colorful fabric hair scarf', 'price' => 28.50, 'category' => 'Accessories'],
            ['name' => 'Leather Headband', 'description' => 'Handcrafted leather headband', 'price' => 45.75, 'category' => 'Accessories'],
            ['name' => 'Woven Belt', 'description' => 'Handwoven fabric belt', 'price' => 55.25, 'category' => 'Accessories'],
            ['name' => 'Beaded Hair Clip', 'description' => 'Decorative beaded hair clip', 'price' => 18.75, 'category' => 'Accessories'],
            ['name' => 'Leather Wristlet', 'description' => 'Small leather wristlet purse', 'price' => 75.50, 'category' => 'Accessories'],
            ['name' => 'Fabric Makeup Bag', 'description' => 'Handmade fabric makeup bag', 'price' => 42.25, 'category' => 'Accessories'],
        ];

        // Add products for each seller with better category distribution
        foreach ($sellers as $seller) {
            $this->command->info("Adding products for seller: {$seller->businessName} (ID: {$seller->sellerID})");
            
            // Ensure each seller gets products from different categories
            $categories = collect($sampleProducts)->groupBy('category')->keys();
            $sellerProducts = collect();
            
            // Get 1-2 products from each category to ensure variety
            foreach ($categories as $category) {
                $categoryProducts = collect($sampleProducts)->where('category', $category);
                $sellerProducts = $sellerProducts->merge($categoryProducts->random(rand(1, 2)));
            }
            
            // Add a few more random products to reach 8-12 products per seller
            $additionalProducts = collect($sampleProducts)->random(rand(3, 5));
            $sellerProducts = $sellerProducts->merge($additionalProducts)->unique('name');
            
            foreach ($sellerProducts as $productData) {
                // Check if product already exists for this seller
                $existingProduct = Product::where('productName', $productData['name'])
                    ->where('seller_id', $seller->sellerID)
                    ->first();
                
                if ($existingProduct) {
                    continue; // Skip if product already exists
                }
                
                Product::create([
                    'productName' => $productData['name'],
                    'productDescription' => $productData['description'],
                    'productPrice' => $productData['price'],
                    'productQuantity' => rand(10, 100),
                    'status' => rand(0, 1) ? 'in stock' : (rand(0, 1) ? 'low stock' : 'out of stock'),
                    'category' => $productData['category'],
                    'seller_id' => $seller->sellerID,
                    'approval_status' => 'approved',
                    'publish_status' => 'published',
                    'is_featured' => rand(0, 1) ? true : false,
                    'productImage' => 'products/sample-product-' . rand(1, 10) . '.jpg',
                    'created_at' => Carbon::now()->subDays(rand(1, 90)),
                    'updated_at' => Carbon::now()->subDays(rand(1, 30)),
                ]);
            }
        }

        $this->command->info('Products created successfully');

        // Create some customers for orders
        $this->createSampleCustomers();

        // Generate analytics data for the past 3 months
        $this->generateAnalyticsData();

        $this->command->info('Analytics Data Seeder completed successfully!');
    }

    private function createSampleCustomers()
    {
        $this->command->info('Using existing customers for analytics data...');

        // Get all existing customer users instead of creating new ones
        $customers = User::where('role', 'customer')->get()->toArray();
        
        if (empty($customers)) {
            $this->command->warn('No customers found. Please run CustomerSeeder first.');
            return;
        }
        
        $this->command->info('Found ' . count($customers) . ' existing customers.');

        // Create sample orders using existing customers
        $this->createSampleOrders($customers);
    }

    private function createSampleOrders($customers)
    {
        $this->command->info('Creating sample orders...');

        $products = Product::all();
        $sellers = Seller::all();

        // Create 50-100 sample orders over the past 3 months
        $orderCount = rand(50, 100);
        
        for ($i = 0; $i < $orderCount; $i++) {
            $customer = $customers[array_rand($customers)];
            $seller = $sellers->random();
            $sellerProducts = $products->where('seller_id', $seller->sellerID);
            
            if ($sellerProducts->isEmpty()) {
                continue;
            }

            // Get customer record for this user
            $customerRecord = \App\Models\Customer::where('user_id', $customer->userID)->first();
            if (!$customerRecord) {
                // Create customer record if it doesn't exist
                $customerRecord = \App\Models\Customer::create([
                    'user_id' => $customer->userID,
                    'profile_picture_path' => null,
                ]);
            }

            $orderStatus = $this->getRandomOrderStatus();
            $orderDate = Carbon::now()->subDays(rand(1, 90));
            
            $order = Order::create([
                'customer_id' => $customerRecord->customerID,
                'sellerID' => $seller->sellerID,
                'totalAmount' => 0,
                'status' => $orderStatus,
                'paymentStatus' => $this->getRandomPaymentStatus(),
                'location' => $customer->userAddress ?? '123 Sample Street, Sample City, SC 12345',
                'created_at' => $orderDate,
                'updated_at' => $orderDate->copy()->addDays(rand(0, 10)),
            ]);

            $totalAmount = 0;
            $productCount = rand(1, 3);
            $selectedProducts = $sellerProducts->random($productCount);

            foreach ($selectedProducts as $product) {
                $quantity = rand(1, 3);
                $subtotal = $product->productPrice * $quantity;
                
                OrderProduct::create([
                    'order_id' => $order->orderID,
                    'product_id' => $product->product_id,
                    'quantity' => $quantity,
                    'price' => $product->productPrice,
                    'subtotal' => $subtotal,
                ]);

                $totalAmount += $subtotal;
            }

            $order->update(['totalAmount' => $totalAmount]);
            
            // Create shipping record for orders that are packing, shipped, or delivered
            if (in_array($orderStatus, ['packing', 'shipped', 'delivered'])) {
                $this->createShippingForOrder($order, $customer, $orderStatus, $orderDate);
            }

            // Create some reviews for products
            if (rand(0, 1)) { // 50% chance of review
                $this->createSampleReview($customer, $selectedProducts->random());
            }
        }

        $this->command->info('Sample orders and reviews created');
    }

    private function createSampleReview($customer, $product)
    {
        // Check if review already exists for this user-product combination
        $existingReview = Review::where('user_id', $customer->userID)
            ->where('product_id', $product->product_id)
            ->first();
        
        if ($existingReview) {
            return; // Skip if review already exists
        }

        $ratings = [5, 5, 4, 4, 5, 3, 5, 4, 5]; // Mostly positive ratings
        $rating = $ratings[array_rand($ratings)];
        
        $reviewTexts = [
            'Amazing quality! Highly recommended.',
            'Beautiful craftsmanship, exactly as described.',
            'Great product, fast shipping!',
            'Love this item, perfect for my needs.',
            'Excellent quality and beautiful design.',
            'Very satisfied with this purchase.',
            'Outstanding workmanship, will buy again!',
            'Perfect gift for my loved one.',
        ];

        Review::create([
            'user_id' => $customer->userID,
            'product_id' => $product->product_id,
            'rating' => $rating,
            'comment' => $reviewTexts[array_rand($reviewTexts)],
            'review_date' => Carbon::now()->subDays(rand(1, 60)),
        ]);
    }

    private function getRandomOrderStatus()
    {
        $statuses = ['pending_payment', 'processing', 'packing', 'shipped', 'delivered'];
        $weights = [10, 15, 20, 25, 30]; // Most orders are delivered
        
        $random = rand(1, 100);
        $cumulative = 0;
        
        for ($i = 0; $i < count($statuses); $i++) {
            $cumulative += $weights[$i];
            if ($random <= $cumulative) {
                return $statuses[$i];
            }
        }
        
        return 'delivered';
    }
    
    private function getRandomPaymentStatus()
    {
        $statuses = ['pending', 'paid', 'failed'];
        $weights = [10, 80, 10]; // Most orders are paid
        
        $random = rand(1, 100);
        $cumulative = 0;
        
        for ($i = 0; $i < count($statuses); $i++) {
            $cumulative += $weights[$i];
            if ($random <= $cumulative) {
                return $statuses[$i];
            }
        }
        
        return 'paid';
    }
    
    private function createShippingForOrder($order, $customer, $orderStatus, $orderDate)
    {
        // Realistic Filipino names for riders
        $riderNames = [
            'Juan Dela Cruz', 'Pedro Santos', 'Maria Garcia', 'Jose Reyes',
            'Antonio Lopez', 'Carlos Mendoza', 'Miguel Rivera', 'Luis Hernandez',
            'Roberto Gonzales', 'Francisco Ramos', 'Ricardo Torres', 'Manuel Cruz'
        ];
        
        $vehicleTypes = ['Motorcycle', 'Multicab', 'Van', 'Bicycle', 'Tricycle'];
        
        // Generate tracking number
        $trackingNumber = 'CC' . $orderDate->format('Ymd') . strtoupper(substr(md5(uniqid()), 0, 6));
        
        // Determine shipping dates based on order status
        $assignedAt = $orderDate->copy()->addHours(rand(1, 24));
        $shippedAt = in_array($orderStatus, ['shipped', 'delivered']) 
            ? $assignedAt->copy()->addHours(rand(2, 48)) 
            : null;
        $deliveredAt = $orderStatus === 'delivered' 
            ? $shippedAt->copy()->addHours(rand(4, 72)) 
            : null;
        
        // Create shipping record
        $shipping = Shipping::create([
            'order_id' => $order->orderID,
            'tracking_number' => $trackingNumber,
            'rider_name' => $riderNames[array_rand($riderNames)],
            'rider_phone' => '09' . rand(100000000, 999999999),
            'rider_email' => 'rider' . rand(1000, 9999) . '@craftconnect.com',
            'vehicle_type' => $vehicleTypes[array_rand($vehicleTypes)],
            'vehicle_number' => strtoupper(chr(rand(65, 90))) . strtoupper(chr(rand(65, 90))) . strtoupper(chr(rand(65, 90))) . '-' . rand(1000, 9999),
            'delivery_address' => $customer->userAddress ?? '123 Sample Street, Sample City',
            'delivery_city' => $customer->userCity ?? 'Manila',
            'delivery_province' => $customer->userProvince ?? 'Metro Manila',
            'delivery_notes' => $this->getRandomDeliveryNote(),
            'estimated_delivery' => $assignedAt->copy()->addDays(rand(2, 7)),
            'status' => $orderStatus,
            'assigned_at' => $assignedAt,
            'shipped_at' => $shippedAt,
            'delivered_at' => $deliveredAt,
        ]);
        
        // Create shipping history
        $this->createShippingHistory($shipping, $orderStatus, $assignedAt, $shippedAt, $deliveredAt);
    }
    
    private function createShippingHistory($shipping, $currentStatus, $assignedAt, $shippedAt, $deliveredAt)
    {
        $locations = [
            'Warehouse - Manila', 'Hub - Quezon City', 'Hub - Makati', 
            'Hub - Pasig', 'Hub - Taguig', 'Distribution Center - BGC',
            'Last Mile Hub - Ortigas', 'Out for Delivery'
        ];
        
        $histories = [];
        
        // Always add packing/assigned status
        $histories[] = [
            'status' => 'packing',
            'description' => 'Package has been prepared and ready for shipping',
            'location' => 'Warehouse - Manila',
            'timestamp' => $assignedAt
        ];
        
        // Add shipped status if applicable
        if (in_array($currentStatus, ['shipped', 'delivered']) && $shippedAt) {
            $histories[] = [
                'status' => 'shipped',
                'description' => 'Package has been picked up by rider and is in transit',
                'location' => $locations[array_rand($locations)],
                'timestamp' => $shippedAt
            ];
            
            // Add some intermediate updates for shipped orders
            if ($currentStatus === 'shipped') {
                $updateCount = rand(1, 3);
                for ($i = 0; $i < $updateCount; $i++) {
                    $histories[] = [
                        'status' => 'shipped',
                        'description' => 'Package is in transit',
                        'location' => $locations[array_rand($locations)],
                        'timestamp' => $shippedAt->copy()->addHours(rand(2, 24) * ($i + 1))
                    ];
                }
            }
        }
        
        // Add delivered status if applicable
        if ($currentStatus === 'delivered' && $deliveredAt) {
            $histories[] = [
                'status' => 'delivered',
                'description' => 'Package successfully delivered to recipient',
                'location' => $shipping->delivery_city,
                'timestamp' => $deliveredAt
            ];
        }
        
        // Create all history records
        foreach ($histories as $history) {
            ShippingHistory::create([
                'shipping_id' => $shipping->id,
                'status' => $history['status'],
                'description' => $history['description'],
                'location' => $history['location'],
                'timestamp' => $history['timestamp'],
            ]);
        }
    }
    
    private function getRandomDeliveryNote()
    {
        $notes = [
            'Please call upon arrival',
            'Leave with security guard if no one is home',
            'Ring doorbell twice',
            'Contact via phone before delivery',
            'Deliver between 9 AM - 5 PM',
            'Please handle with care - fragile items',
            'No special instructions',
            null, // Some orders have no notes
        ];
        
        return $notes[array_rand($notes)];
    }

    private function generateAnalyticsData()
    {
        $this->command->info('📅 Available Time Periods:');
        $this->command->newLine();
        $this->command->info('   [0] 1 day     - Quick test data');
        $this->command->info('   [1] 1 week    - Weekly analysis');
        $this->command->info('   [2] 1 month   - Monthly trends');
        $this->command->info('   [3] 3 months  - Quarterly overview');
        $this->command->info('   [4] 1 year    - Annual analytics');
        $this->command->info('   [5] 3 years   - ⭐ RECOMMENDED (ensures all dashboard graphs have data)');
        $this->command->info('   [6] 5 years   - Historical analysis');
        $this->command->info('   [7] Custom    - Specify exact dates');
        $this->command->newLine();
        $this->command->warn('ℹ️  TIP: Enter the number in brackets [#] to select that option');
        $this->command->warn('ℹ️  Minimum 3 years (option 5) recommended for full dashboard visualization');
        $this->command->newLine();
        
        // Ask user for the time period
        $period = $this->command->choice(
            'Select analytics data period (enter the number)',
            [
                '1 day',
                '1 week',
                '1 month',
                '3 months',
                '1 year',
                '3 years (Recommended)',
                '5 years',
                'Custom (enter dates)'
            ],
            5 // Default to '3 years' (index 5) - Recommended minimum
        );

        // Calculate date range based on selection
        $endDate = Carbon::now()->subDay()->endOfDay();
        
        switch ($period) {
            case '1 day':
                $startDate = Carbon::now()->subDay()->startOfDay();
                break;
            case '1 week':
                $startDate = Carbon::now()->subWeek()->startOfDay();
                break;
            case '1 month':
                $startDate = Carbon::now()->subMonth()->startOfDay();
                break;
            case '3 months':
                $startDate = Carbon::now()->subMonths(3)->startOfDay();
                break;
            case '1 year':
        $startDate = Carbon::now()->subYear()->startOfDay();
                break;
            case '3 years (Recommended)':
                $startDate = Carbon::now()->subYears(3)->startOfDay();
                break;
            case '5 years':
                $startDate = Carbon::now()->subYears(5)->startOfDay();
                break;
            case 'Custom (enter dates)':
                $startDateInput = $this->command->ask('Enter start date (YYYY-MM-DD)');
                $endDateInput = $this->command->ask('Enter end date (YYYY-MM-DD)');
                
                try {
                    $startDate = Carbon::parse($startDateInput)->startOfDay();
                    $endDate = Carbon::parse($endDateInput)->endOfDay();
                } catch (\Exception $e) {
                    $this->command->error('Invalid date format. Using default: 3 years');
                    $startDate = Carbon::now()->subYears(3)->startOfDay();
        $endDate = Carbon::now()->subDay()->endOfDay();
                }
                break;
            default:
                $startDate = Carbon::now()->subYears(3)->startOfDay();
                break;
        }

        $totalDays = $startDate->diffInDays($endDate) + 1;
        $totalYears = $startDate->diffInYears($endDate);
        
        $this->command->info("Selected period: {$period}");
        $this->command->info("Generating data from {$startDate->format('Y-m-d')} to {$endDate->format('Y-m-d')}");
        $this->command->info("Total days to generate: {$totalDays}");
        
        // Warning if less than 3 years
        if ($totalYears < 3 && !in_array($period, ['1 day', '1 week', '1 month'])) {
            $this->command->warn("⚠️  Warning: Less than 3 years of data may result in incomplete visualizations");
            $this->command->warn("   Some dashboard graphs (yearly trends, quarterly comparisons) work best with 3+ years");
            $this->command->newLine();
            
            if (!$this->command->confirm('Continue with limited data range?', true)) {
                $this->command->info('Switching to recommended 3 years...');
                $startDate = Carbon::now()->subYears(3)->startOfDay();
                $totalDays = $startDate->diffInDays($endDate) + 1;
                $period = '3 years (Recommended)';
            }
        }
        
        // Warning for large datasets
        if ($totalDays > 365) {
            $estimatedMinutes = round($totalDays / 60);
            $this->command->warn("⚠️  This will generate {$totalDays} days of data. Estimated time: ~{$estimatedMinutes} minutes");
            
            if (!$this->command->confirm('Do you want to continue?', true)) {
                $this->command->info('Analytics data generation cancelled.');
                return;
            }
        }

        // Generate daily analytics data
        $currentDate = $startDate->copy();
        $dayCount = 0;
        $totalDays = $startDate->diffInDays($endDate) + 1;
        
        while ($currentDate->lte($endDate)) {
            $this->generateDailyAnalytics($currentDate, $dayCount, $totalDays);
            $currentDate->addDay();
            $dayCount++;
            
            // Dynamic progress reporting based on total days
            $progressInterval = $totalDays > 365 ? 100 : ($totalDays > 30 ? 30 : 7);
            
            if ($dayCount % $progressInterval == 0 || $dayCount == $totalDays) {
                $percentage = round(($dayCount / $totalDays) * 100, 1);
                $this->command->info("Progress: {$dayCount}/{$totalDays} days ({$percentage}%)");
            }
        }

        $this->command->info("Generated {$dayCount} days of daily analytics data");

        // Generate monthly analytics data
        $this->generateMonthlyAnalytics($startDate, $endDate);

        // Generate quarterly analytics data
        $this->generateQuarterlyAnalytics($startDate, $endDate);

        // Generate yearly analytics data (for 3+ year datasets)
        if ($totalYears >= 1) {
            $this->generateYearlyAnalytics($startDate, $endDate);
        }

        // Calculate summary statistics
        $monthsGenerated = $startDate->diffInMonths($endDate) + 1;
        $quartersGenerated = ceil($monthsGenerated / 3);
        $yearsGenerated = $totalYears >= 1 ? $totalYears + 1 : 0;
        
        $this->command->newLine();
        $this->command->info('╔════════════════════════════════════════════════╗');
        $this->command->info('║          Generation Complete! ✓                ║');
        $this->command->info('╚════════════════════════════════════════════════╝');
        $this->command->newLine();
        $this->command->info("📊 Analytics Summary:");
        $this->command->info("   • Period: {$period}");
        $this->command->info("   • Date Range: {$startDate->format('Y-m-d')} to {$endDate->format('Y-m-d')}");
        $this->command->info("   • Daily Records: {$totalDays} days");
        $this->command->info("   • Monthly Records: {$monthsGenerated} months");
        $this->command->info("   • Quarterly Records: {$quartersGenerated} quarters");
        if ($yearsGenerated > 0) {
            $this->command->info("   • Yearly Records: {$yearsGenerated} years");
        }
        $this->command->newLine();
        $this->command->info("📈 Data Types Generated (All Dashboard Graphs):");
        $this->command->newLine();
        $this->command->info("   MAIN ANALYTICS:");
        $this->command->info("   ✓ Revenue Analytics → Revenue Tab (trends, breakdown, commission)");
        $this->command->info("   ✓ Order Analytics → Orders Tab (volume, status, completion)");
        $this->command->info("   ✓ Review Analytics → Reviews Tab (ratings, distribution)");
        $this->command->info("   ✓ Product Analytics → Products Tab (inventory, status, quality)");
        $this->command->info("   ✓ Seller Revenue Analytics → Sellers Tab (top sellers, performance)");
        $this->command->info("   ✓ Content Moderation Analytics → Moderation Tab (approval, flagged)");
        $this->command->newLine();
        $this->command->info("   MICRO ANALYTICS (Revenue Tab Graphs):");
        $this->command->info("   ✓ Most Selling Products → Product trends chart & top 5 list");
        $this->command->info("   ✓ Highest Sales Sellers → Seller trends chart & top 5 list");
        $this->command->info("   ✓ Category Performance → Category breakdown by revenue");
        $this->command->info("   ✓ Seller Growth Analysis → Seller growth comparison table");
        $this->command->info("   ✓ Detailed Reviews → Rating breakdown with user details");
        $this->command->info("   ✓ Seller Comparison → Competitive analysis data");
        $this->command->newLine();
        $this->command->info("✅ All analytics data successfully seeded to database!");
        $this->command->info("🎯 All dashboard graphs (Revenue, Orders, Reviews, Products, Sellers, Moderation) should now display data correctly!");
    }

    private function generateDailyAnalytics($date, $dayCount = 0, $totalDays = 365)
    {
        // Calculate seasonal multipliers for more realistic data
        $seasonalMultiplier = $this->getSeasonalMultiplier($date);
        $weekendMultiplier = $this->getWeekendMultiplier($date);
        $holidayMultiplier = $this->getHolidayMultiplier($date);
        
        // Apply all multipliers
        $finalMultiplier = $seasonalMultiplier * $weekendMultiplier * $holidayMultiplier;
        
        // Revenue Analytics with seasonal variations
        $baseRevenue = rand(500, 3000);
        $dailyRevenue = round($baseRevenue * $finalMultiplier);
        $platformCommission = $dailyRevenue * 0.10; // 10% commission
        $paymentFees = $dailyRevenue * 0.03; // 3% payment processing
        
        RevenueAnalytics::create([
            'date' => $date,
            'period_type' => 'daily',
            'total_revenue' => min(999999999999999.99, $dailyRevenue), // decimal(15,2) constraint
            'platform_commission' => min(999999999999999.99, $platformCommission), // decimal(15,2) constraint
            'payment_processing_fees' => min(999999999999999.99, $paymentFees), // decimal(15,2) constraint
            'total_orders' => max(0, rand(10, 50)),
            'average_order_value' => min(99999999.99, $dailyRevenue / max(1, rand(10, 50))), // decimal(10,2) constraint
        ]);

        // Order Analytics with seasonal variations
        $baseOrders = rand(10, 50);
        $totalOrders = round($baseOrders * $finalMultiplier);
        $completedOrders = round(rand(5, 25) * $finalMultiplier);
        $pendingOrders = round(rand(1, 5) * $finalMultiplier);
        $processingOrders = round(rand(2, 8) * $finalMultiplier);
        $shippedOrders = round(rand(3, 10) * $finalMultiplier);
        $cancelledOrders = round(rand(0, 3) * $finalMultiplier);
        $refundedOrders = round(rand(0, 2) * $finalMultiplier);
        
        $completionRate = $totalOrders > 0 ? min(100.00, max(0.00, round(($completedOrders / $totalOrders) * 100, 2))) : 0;
        $cancellationRate = $totalOrders > 0 ? min(100.00, max(0.00, round(($cancelledOrders / $totalOrders) * 100, 2))) : 0;
        $refundRate = $totalOrders > 0 ? min(100.00, max(0.00, round(($refundedOrders / $totalOrders) * 100, 2))) : 0;
        
        OrderAnalytics::create([
            'date' => $date,
            'period_type' => 'daily',
            'total_orders' => max(1, $totalOrders),
            'completed_orders' => max(0, $completedOrders),
            'pending_orders' => max(0, $pendingOrders),
            'processing_orders' => max(0, $processingOrders),
            'shipped_orders' => max(0, $shippedOrders),
            'cancelled_orders' => max(0, $cancelledOrders),
            'refunded_orders' => max(0, $refundedOrders),
            'completion_rate' => $completionRate, // decimal(5,2) constraint: 0-100
            'cancellation_rate' => $cancellationRate, // decimal(5,2) constraint: 0-100
            'refund_rate' => $refundRate, // decimal(5,2) constraint: 0-100
            'average_order_value' => min(99999999.99, round(rand(50, 200) * $finalMultiplier, 2)), // decimal(10,2) constraint
        ]);

        // Review Analytics with seasonal variations - Generate much more data for better visualization
        $baseReviews = rand(50, 150); // Increased from 15-50 to 50-150 for much more data
        $totalReviews = round($baseReviews * $finalMultiplier);
        $reviewsWithComments = round(rand(30, $baseReviews) * $finalMultiplier); // Increased from 10 to 30
        
        ReviewAnalytics::create([
            'date' => $date,
            'period_type' => 'daily',
            'total_reviews' => max(1, $totalReviews),
            'average_rating' => min(5.00, max(0.00, round(rand(35, 50) / 10, 2))), // decimal(3,2) constraint: 0-5
            'five_star_reviews' => max(0, round(rand(20, 60) * $finalMultiplier)), // Increased from 2-8 to 20-60
            'four_star_reviews' => max(0, round(rand(15, 45) * $finalMultiplier)), // Increased from 1-5 to 15-45
            'three_star_reviews' => max(0, round(rand(5, 20) * $finalMultiplier)), // Increased from 0-3 to 5-20
            'two_star_reviews' => max(0, round(rand(2, 10) * $finalMultiplier)), // Increased from 0-2 to 2-10
            'one_star_reviews' => max(0, round(rand(1, 5) * $finalMultiplier)), // Increased from 0-1 to 1-5
            'reviews_with_comments' => max(0, $reviewsWithComments),
            'reviews_without_comments' => max(0, $totalReviews - $reviewsWithComments),
            'response_rate' => min(100.00, max(0.00, round(rand(60, 95), 2))), // decimal(5,2) constraint: 0-100
        ]);

        // Product Analytics
        ProductAnalytics::create([
            'date' => $date,
            'period_type' => 'daily',
            'total_products' => max(0, Product::count()),
            'active_products' => max(0, Product::where('status', 'in stock')->count()),
            'inactive_products' => max(0, Product::where('status', 'out of stock')->count()),
            'low_stock_products' => max(0, Product::where('status', 'low stock')->count()),
            'featured_products' => max(0, Product::where('is_featured', true)->count()),
            'products_with_images' => max(0, Product::whereNotNull('productImage')->count()),
            'products_with_videos' => max(0, Product::whereNotNull('productVideo')->count()),
            'products_without_images' => max(0, Product::whereNull('productImage')->count()),
            'average_product_rating' => min(5.00, max(0.00, round(rand(35, 50) / 10, 2))), // decimal(3,2) constraint: 0-5
        ]);

        // Content Moderation Analytics - Generate much more data for better visualization
        $productsPending = rand(20, 60); // Increased from 5-15 to 20-60
        $productsApproved = rand(30, 80); // Increased from 4-12 to 30-80
        $productsRejected = rand(5, 15); // Increased from 0-3 to 5-15
        $totalProducts = $productsPending + $productsApproved + $productsRejected;
        
        $approvalRate = $totalProducts > 0 ? min(100.00, max(0.00, round(($productsApproved / $totalProducts) * 100, 2))) : 0;
        $rejectionRate = $totalProducts > 0 ? min(100.00, max(0.00, round(($productsRejected / $totalProducts) * 100, 2))) : 0;
        
        ContentModerationAnalytics::create([
            'date' => $date,
            'period_type' => 'daily',
            'products_pending_approval' => max(0, $productsPending),
            'products_approved' => max(0, $productsApproved),
            'products_rejected' => max(0, $productsRejected),
            'reviews_flagged' => max(0, rand(10, 30)), // Increased from 1-5 to 10-30
            'reviews_approved' => max(0, rand(20, 50)), // Increased from 2-8 to 20-50
            'reviews_removed' => max(0, rand(2, 8)), // Increased from 0-2 to 2-8
            'users_suspended' => max(0, rand(1, 5)), // Increased from 0-1 to 1-5
            'users_reactivated' => max(0, rand(1, 3)), // Increased from 0-1 to 1-3
            'approval_rate' => $approvalRate, // decimal(5,2) constraint: 0-100
            'rejection_rate' => $rejectionRate, // decimal(5,2) constraint: 0-100
        ]);

        // Seller Revenue Analytics with seasonal variations
        $sellers = Seller::all();
        foreach ($sellers as $seller) {
            $baseSellerRevenue = rand(50, 500);
            $sellerRevenue = round($baseSellerRevenue * $finalMultiplier);
            $sellerOrders = round(rand(1, 10) * $finalMultiplier);
            $productsSold = round(rand(1, 8) * $finalMultiplier);
            
            SellerRevenueAnalytics::create([
                'seller_id' => $seller->sellerID,
                'date' => $date,
                'period_type' => 'daily',
                'total_revenue' => min(999999999999999.99, max(0, $sellerRevenue)), // decimal(15,2) constraint
                'commission_earned' => min(999999999999999.99, max(0, $sellerRevenue * 0.10)), // decimal(15,2) constraint
                'total_orders' => max(0, $sellerOrders),
                'average_order_value' => min(99999999.99, max(0, $sellerOrders > 0 ? round($sellerRevenue / $sellerOrders, 2) : 0)), // decimal(10,2) constraint
                'products_sold' => max(0, $productsSold),
            ]);
        }

        // Generate Micro Analytics Data
        $this->generateMicroAnalytics($date, $finalMultiplier);
    }

    private function generateMicroAnalytics($date, $finalMultiplier)
    {
        $sellers = Seller::all();
        $products = Product::all();
        $users = User::where('role', 'customer')->get();
        
        if ($products->isEmpty() || $users->isEmpty() || $sellers->isEmpty()) {
            return;
        }

        // 1. Generate Detailed Review Analytics - More data for better visualization
        $reviewCount = round(rand(10, 30) * $finalMultiplier); // Increased from 3-10 to 10-30
        for ($i = 0; $i < $reviewCount; $i++) {
            $product = $products->random();
            $user = $users->random();
            $seller = $sellers->where('sellerID', $product->seller_id)->first();
            
            if (!$seller) continue;

            $rating = rand(3, 5); // Mostly positive ratings (1-5 integer constraint)
            $reviewTexts = [
                'Amazing quality! Highly recommended.',
                'Beautiful craftsmanship, exactly as described.',
                'Great product, fast shipping!',
                'Love this item, perfect for my needs.',
                'Excellent quality and beautiful design.',
                'Very satisfied with this purchase.',
                null // Some reviews without text
            ];

            DetailedReviewAnalytics::create([
                'date' => $date,
                'period_type' => 'daily',
                'user_id' => $user->userID,
                'product_id' => $product->product_id,
                'seller_id' => $seller->sellerID,
                'rating' => min(5, max(1, $rating)), // Integer 1-5 constraint
                'review_text' => $reviewTexts[array_rand($reviewTexts)],
                'is_verified_purchase' => rand(0, 1) ? true : false,
                'helpful_votes' => max(0, rand(0, 15)), // Integer, non-negative
                'response_text' => rand(0, 1) ? 'Thank you for your review!' : null,
                'response_date' => rand(0, 1) ? $date->copy()->addDays(rand(1, 3)) : null,
                'category' => $product->category,
                'product_name' => $product->productName,
                'seller_name' => $seller->businessName ?? 'Unknown Seller',
                'user_name' => $user->userName,
            ]);
        }

        // 2. Generate Seller Comparison Analytics
        $categories = $products->pluck('category')->unique();
        foreach ($categories as $category) {
            $categoryProducts = $products->where('category', $category);
            
            foreach ($sellers as $seller) {
                $sellerProducts = $categoryProducts->where('seller_id', $seller->sellerID);
                
                if ($sellerProducts->isEmpty()) continue;

                foreach ($sellerProducts->take(2) as $product) { // Limit to 2 products per seller per category per day
                    $revenue = round(rand(100, 1000) * $finalMultiplier);
                    $orders = round(rand(2, 10) * $finalMultiplier);
                    $quantitySold = round(rand(3, 15) * $finalMultiplier);
                    
                    // Calculate previous period revenue for growth rate (with realistic bounds)
                    $previousRevenue = round(rand(80, 900) * $finalMultiplier);
                    $rawGrowthRate = $previousRevenue > 0 ? (($revenue - $previousRevenue) / $previousRevenue) * 100 : 0;
                    // Cap growth rate to fit decimal(5,2) constraint: -99.99 to 999.99, but keep it realistic
                    $growthRate = max(-99.99, min(500.00, round($rawGrowthRate, 2)));

                    SellerComparisonAnalytics::create([
                        'date' => $date,
                        'period_type' => 'daily',
                        'product_id' => $product->product_id,
                        'product_name' => $product->productName,
                        'category' => $category,
                        'seller_id' => $seller->sellerID,
                        'seller_name' => $seller->businessName ?? 'Unknown Seller',
                        'total_revenue' => $revenue,
                        'total_orders' => max(0, $orders),
                        'total_quantity_sold' => max(0, $quantitySold),
                        'average_price' => min(99999999.99, $product->productPrice), // decimal(10,2) constraint
                        'average_rating' => min(5.00, max(0.00, round(rand(35, 50) / 10, 2))), // decimal(3,2) constraint: 0-5
                        'total_reviews' => max(0, rand(1, 20)),
                        'market_share_percentage' => min(100.00, max(0.00, round(rand(5, 25), 2))), // decimal(5,2) constraint: 0-100
                        'revenue_rank' => max(1, rand(1, 10)),
                        'orders_rank' => max(1, rand(1, 10)),
                        'rating_rank' => max(1, rand(1, 10)),
                        'growth_rate' => $growthRate,
                        'previous_period_revenue' => $previousRevenue,
                        'is_top_seller' => rand(0, 1) ? true : false,
                        'competitor_count' => max(1, $categoryProducts->count()),
                    ]);
                }
            }
        }

        // 3. Generate Category Performance Analytics
        foreach ($categories as $category) {
            $categoryProducts = $products->where('category', $category);
            $categorySellers = $sellers->filter(function($seller) use ($categoryProducts) {
                return $categoryProducts->where('seller_id', $seller->sellerID)->isNotEmpty();
            });

            $totalRevenue = round(rand(500, 5000) * $finalMultiplier);
            $totalOrders = round(rand(20, 100) * $finalMultiplier);
            
            // Calculate previous period revenue for growth rate (with realistic bounds)
            $previousRevenue = round(rand(400, 4500) * $finalMultiplier);
            $rawGrowthRate = $previousRevenue > 0 ? (($totalRevenue - $previousRevenue) / $previousRevenue) * 100 : 0;
            // Cap growth rate to fit decimal(5,2) constraint: -99.99 to 999.99, but keep it realistic
            $growthRate = max(-99.99, min(500.00, round($rawGrowthRate, 2)));

            CategoryPerformanceAnalytics::create([
                'date' => $date,
                'period_type' => 'daily',
                'category' => $category,
                'total_sellers' => max(0, $categorySellers->count()),
                'total_products' => max(0, $categoryProducts->count()),
                'total_revenue' => $totalRevenue,
                'total_orders' => max(0, $totalOrders),
                'average_rating' => min(5.00, max(0.00, round(rand(35, 50) / 10, 2))), // decimal(3,2) constraint: 0-5
                'total_reviews' => max(0, rand(10, 50)),
                'average_price' => min(99999999.99, round($categoryProducts->avg('productPrice') ?? 100, 2)), // decimal(10,2) constraint
                'market_share_percentage' => min(100.00, max(0.00, round(rand(10, 30), 2))), // decimal(5,2) constraint: 0-100
                'growth_rate' => $growthRate,
                'top_seller_count' => max(0, rand(1, 5)),
            ]);
        }

        // 4. Generate Most Selling Product Analytics - More products for better data
        $topProductCount = min(50, $products->count()); // Increased from 20 to 50 products
        $topProducts = $products->random(min($topProductCount, $products->count()));
        
        foreach ($topProducts as $product) {
            $seller = $sellers->where('sellerID', $product->seller_id)->first();
            if (!$seller) continue;

            $quantitySold = round(rand(5, 50) * $finalMultiplier);
            $orders = round(rand(3, 30) * $finalMultiplier);
            $revenue = round($product->productPrice * $quantitySold);

            MostSellingProductAnalytics::create([
                'date' => $date,
                'period_type' => 'daily',
                'product_id' => $product->product_id,
                'product_name' => $product->productName,
                'seller_id' => $seller->sellerID,
                'seller_name' => $seller->businessName ?? 'Unknown Seller',
                'category' => $product->category,
                'total_orders' => max(0, $orders),
                'total_quantity_sold' => max(0, $quantitySold),
                'total_revenue' => min(9999999999.99, $revenue), // decimal(10,2) constraint
                'average_rating' => min(5.00, max(0.00, round(rand(35, 50) / 10, 2))), // decimal(3,2) constraint
                'total_reviews' => max(0, rand(5, 30)),
                'month_year' => $date->format('M Y'),
                'year' => $date->year,
            ]);
        }

        // 5. Generate Highest Sales Seller Analytics
        foreach ($sellers as $seller) {
            $sellerProducts = $products->where('seller_id', $seller->sellerID);
            if ($sellerProducts->isEmpty()) continue;

            $totalProductsSold = round(rand(10, 100) * $finalMultiplier);
            $totalOrders = round(rand(5, 50) * $finalMultiplier);
            $revenue = round(rand(500, 5000) * $finalMultiplier);
            
            // Get the seller's top category
            $topCategory = $sellerProducts->groupBy('category')
                ->sortByDesc(function($products) { return $products->count(); })
                ->keys()
                ->first() ?? 'Mixed';

            HighestSalesSellerAnalytics::create([
                'date' => $date,
                'period_type' => 'daily',
                'seller_id' => $seller->sellerID,
                'seller_name' => $seller->user->userName ?? 'Unknown',
                'business_name' => $seller->businessName ?? 'Unknown Business',
                'total_revenue' => min(9999999999.99, $revenue), // decimal(10,2) constraint
                'total_orders' => max(0, $totalOrders),
                'total_products_sold' => max(0, $totalProductsSold),
                'unique_products' => max(0, $sellerProducts->count()),
                'average_order_value' => min(9999999999.99, $totalOrders > 0 ? round($revenue / $totalOrders, 2) : 0), // decimal(10,2) constraint
                'completion_rate' => min(100.00, max(0.00, round(rand(75, 95), 2))), // decimal(5,2) constraint
                'average_rating' => min(5.00, max(0.00, round(rand(35, 50) / 10, 2))), // decimal(3,2) constraint
                'total_reviews' => max(0, rand(10, 50)),
                'top_category' => $topCategory,
                'month_year' => $date->format('M Y'),
                'year' => $date->year,
            ]);
        }
    }

    private function generateMonthlyAnalytics($startDate, $endDate)
    {
        $this->command->info('Generating monthly analytics data...');
        
        $currentDate = $startDate->copy()->startOfMonth();
        $monthCount = 0;
        
        while ($currentDate->lte($endDate)) {
            $monthEnd = $currentDate->copy()->endOfMonth();
            
            $this->command->info("Processing month: {$currentDate->format('Y-m')}");
            
            // Aggregate daily data for monthly totals
            $dailyRevenueData = RevenueAnalytics::whereBetween('date', [$currentDate, $monthEnd])
                ->where('period_type', 'daily')
                ->get();
            
            if ($dailyRevenueData->isNotEmpty()) {
                // Revenue Analytics
                RevenueAnalytics::create([
                    'date' => $currentDate,
                    'period_type' => 'monthly',
                    'total_revenue' => min(999999999999999.99, $dailyRevenueData->sum('total_revenue')),
                    'platform_commission' => min(999999999999999.99, $dailyRevenueData->sum('platform_commission')),
                    'payment_processing_fees' => min(999999999999999.99, $dailyRevenueData->sum('payment_processing_fees')),
                    'total_orders' => max(0, $dailyRevenueData->sum('total_orders')),
                    'average_order_value' => min(99999999.99, round($dailyRevenueData->avg('average_order_value'), 2)),
                ]);

                // Order Analytics
                $dailyOrderData = OrderAnalytics::whereBetween('date', [$currentDate, $monthEnd])
                    ->where('period_type', 'daily')
                    ->get();
                
                if ($dailyOrderData->isNotEmpty()) {
                    OrderAnalytics::create([
                        'date' => $currentDate,
                        'period_type' => 'monthly',
                        'total_orders' => max(0, $dailyOrderData->sum('total_orders')),
                        'completed_orders' => max(0, $dailyOrderData->sum('completed_orders')),
                        'pending_orders' => max(0, $dailyOrderData->sum('pending_orders')),
                        'processing_orders' => max(0, $dailyOrderData->sum('processing_orders')),
                        'shipped_orders' => max(0, $dailyOrderData->sum('shipped_orders')),
                        'cancelled_orders' => max(0, $dailyOrderData->sum('cancelled_orders')),
                        'refunded_orders' => max(0, $dailyOrderData->sum('refunded_orders')),
                        'completion_rate' => min(100.00, max(0.00, round($dailyOrderData->avg('completion_rate'), 2))),
                        'cancellation_rate' => min(100.00, max(0.00, round($dailyOrderData->avg('cancellation_rate'), 2))),
                        'refund_rate' => min(100.00, max(0.00, round($dailyOrderData->avg('refund_rate'), 2))),
                        'average_order_value' => min(99999999.99, round($dailyOrderData->avg('average_order_value'), 2)),
                    ]);
                }

                // Review Analytics
                $dailyReviewData = ReviewAnalytics::whereBetween('date', [$currentDate, $monthEnd])
                    ->where('period_type', 'daily')
                    ->get();
                
                if ($dailyReviewData->isNotEmpty()) {
                    ReviewAnalytics::create([
                        'date' => $currentDate,
                        'period_type' => 'monthly',
                        'total_reviews' => max(0, $dailyReviewData->sum('total_reviews')),
                        'average_rating' => min(5.00, max(0.00, round($dailyReviewData->avg('average_rating'), 2))),
                        'five_star_reviews' => max(0, $dailyReviewData->sum('five_star_reviews')),
                        'four_star_reviews' => max(0, $dailyReviewData->sum('four_star_reviews')),
                        'three_star_reviews' => max(0, $dailyReviewData->sum('three_star_reviews')),
                        'two_star_reviews' => max(0, $dailyReviewData->sum('two_star_reviews')),
                        'one_star_reviews' => max(0, $dailyReviewData->sum('one_star_reviews')),
                        'reviews_with_comments' => max(0, $dailyReviewData->sum('reviews_with_comments')),
                        'reviews_without_comments' => max(0, $dailyReviewData->sum('reviews_without_comments')),
                        'response_rate' => min(100.00, max(0.00, round($dailyReviewData->avg('response_rate'), 2))),
                    ]);
                }

                // Product Analytics
                $dailyProductData = ProductAnalytics::whereBetween('date', [$currentDate, $monthEnd])
                    ->where('period_type', 'daily')
                    ->get();
                
                if ($dailyProductData->isNotEmpty()) {
                    ProductAnalytics::create([
                        'date' => $currentDate,
                        'period_type' => 'monthly',
                        'total_products' => max(0, round($dailyProductData->avg('total_products'))),
                        'active_products' => max(0, round($dailyProductData->avg('active_products'))),
                        'inactive_products' => max(0, round($dailyProductData->avg('inactive_products'))),
                        'low_stock_products' => max(0, round($dailyProductData->avg('low_stock_products'))),
                        'featured_products' => max(0, round($dailyProductData->avg('featured_products'))),
                        'products_with_images' => max(0, round($dailyProductData->avg('products_with_images'))),
                        'products_with_videos' => max(0, round($dailyProductData->avg('products_with_videos'))),
                        'products_without_images' => max(0, round($dailyProductData->avg('products_without_images'))),
                        'average_product_rating' => min(5.00, max(0.00, round($dailyProductData->avg('average_product_rating'), 2))),
                    ]);
                }

                // Content Moderation Analytics
                $dailyModerationData = ContentModerationAnalytics::whereBetween('date', [$currentDate, $monthEnd])
                    ->where('period_type', 'daily')
                    ->get();
                
                if ($dailyModerationData->isNotEmpty()) {
                    ContentModerationAnalytics::create([
                        'date' => $currentDate,
                        'period_type' => 'monthly',
                        'products_pending_approval' => max(0, $dailyModerationData->sum('products_pending_approval')),
                        'products_approved' => max(0, $dailyModerationData->sum('products_approved')),
                        'products_rejected' => max(0, $dailyModerationData->sum('products_rejected')),
                        'reviews_flagged' => max(0, $dailyModerationData->sum('reviews_flagged')),
                        'reviews_approved' => max(0, $dailyModerationData->sum('reviews_approved')),
                        'reviews_removed' => max(0, $dailyModerationData->sum('reviews_removed')),
                        'users_suspended' => max(0, $dailyModerationData->sum('users_suspended')),
                        'users_reactivated' => max(0, $dailyModerationData->sum('users_reactivated')),
                        'approval_rate' => min(100.00, max(0.00, round($dailyModerationData->avg('approval_rate'), 2))),
                        'rejection_rate' => min(100.00, max(0.00, round($dailyModerationData->avg('rejection_rate'), 2))),
                    ]);
                }

                // Seller Revenue Analytics (monthly aggregation)
                $sellers = Seller::all();
                foreach ($sellers as $seller) {
                    $sellerDailyData = SellerRevenueAnalytics::where('seller_id', $seller->sellerID)
                        ->whereBetween('date', [$currentDate, $monthEnd])
                        ->where('period_type', 'daily')
                        ->get();
                    
                    if ($sellerDailyData->isNotEmpty()) {
                        SellerRevenueAnalytics::create([
                            'seller_id' => $seller->sellerID,
                            'date' => $currentDate,
                            'period_type' => 'monthly',
                            'total_revenue' => min(999999999999999.99, $sellerDailyData->sum('total_revenue')),
                            'commission_earned' => min(999999999999999.99, $sellerDailyData->sum('commission_earned')),
                            'total_orders' => max(0, $sellerDailyData->sum('total_orders')),
                            'average_order_value' => min(99999999.99, round($sellerDailyData->avg('average_order_value'), 2)),
                            'products_sold' => max(0, $sellerDailyData->sum('products_sold')),
                        ]);
                    }
                }

                // Aggregate Micro Analytics - Detailed Review Analytics
                $dailyDetailedReviews = DetailedReviewAnalytics::whereBetween('date', [$currentDate, $monthEnd])
                    ->where('period_type', 'daily')
                    ->get();
                
                if ($dailyDetailedReviews->isNotEmpty()) {
                    foreach ($dailyDetailedReviews as $review) {
                        DetailedReviewAnalytics::create([
                            'date' => $currentDate,
                            'period_type' => 'monthly',
                            'user_id' => $review->user_id,
                            'product_id' => $review->product_id,
                            'seller_id' => $review->seller_id,
                            'rating' => $review->rating,
                            'review_text' => $review->review_text,
                            'is_verified_purchase' => $review->is_verified_purchase,
                            'helpful_votes' => $review->helpful_votes,
                            'response_text' => $review->response_text,
                            'response_date' => $review->response_date,
                            'category' => $review->category,
                            'product_name' => $review->product_name,
                            'seller_name' => $review->seller_name,
                            'user_name' => $review->user_name,
                        ]);
                    }
                }

                // Aggregate Micro Analytics - Most Selling Product Analytics
                $dailyMostSellingData = MostSellingProductAnalytics::whereBetween('date', [$currentDate, $monthEnd])
                    ->where('period_type', 'daily')
                    ->get();
                
                if ($dailyMostSellingData->isNotEmpty()) {
                    // Group by product_id and aggregate
                    $groupedData = $dailyMostSellingData->groupBy('product_id');
                    
                    foreach ($groupedData as $productId => $productData) {
                        $firstRecord = $productData->first();
                        MostSellingProductAnalytics::create([
                            'date' => $currentDate,
                            'period_type' => 'monthly',
                            'product_id' => $firstRecord->product_id,
                            'product_name' => $firstRecord->product_name,
                            'seller_id' => $firstRecord->seller_id,
                            'seller_name' => $firstRecord->seller_name,
                            'category' => $firstRecord->category,
                            'total_orders' => max(0, $productData->sum('total_orders')),
                            'total_quantity_sold' => max(0, $productData->sum('total_quantity_sold')),
                            'total_revenue' => min(9999999999.99, $productData->sum('total_revenue')),
                            'average_rating' => min(5.00, max(0.00, round($productData->avg('average_rating'), 2))),
                            'total_reviews' => max(0, $productData->sum('total_reviews')),
                            'month_year' => $currentDate->format('M Y'),
                            'year' => $currentDate->year,
                        ]);
                    }
                }

                // Aggregate Micro Analytics - Highest Sales Seller Analytics
                $dailyHighestSalesData = HighestSalesSellerAnalytics::whereBetween('date', [$currentDate, $monthEnd])
                    ->where('period_type', 'daily')
                    ->get();
                
                if ($dailyHighestSalesData->isNotEmpty()) {
                    // Group by seller_id and aggregate
                    $groupedData = $dailyHighestSalesData->groupBy('seller_id');
                    
                    foreach ($groupedData as $sellerId => $sellerData) {
                        $firstRecord = $sellerData->first();
                        HighestSalesSellerAnalytics::create([
                            'date' => $currentDate,
                            'period_type' => 'monthly',
                            'seller_id' => $firstRecord->seller_id,
                            'seller_name' => $firstRecord->seller_name,
                            'business_name' => $firstRecord->business_name,
                            'total_revenue' => min(9999999999.99, $sellerData->sum('total_revenue')),
                            'total_orders' => max(0, $sellerData->sum('total_orders')),
                            'total_products_sold' => max(0, $sellerData->sum('total_products_sold')),
                            'unique_products' => max(0, $sellerData->max('unique_products')),
                            'average_order_value' => min(9999999999.99, $sellerData->avg('average_order_value')),
                            'completion_rate' => min(100.00, max(0.00, round($sellerData->avg('completion_rate'), 2))),
                            'average_rating' => min(5.00, max(0.00, round($sellerData->avg('average_rating'), 2))),
                            'total_reviews' => max(0, $sellerData->sum('total_reviews')),
                            'top_category' => $firstRecord->top_category,
                            'month_year' => $currentDate->format('M Y'),
                            'year' => $currentDate->year,
                        ]);
                    }
                }

                // Aggregate Micro Analytics - Seller Comparison Analytics
                $dailySellerComparison = SellerComparisonAnalytics::whereBetween('date', [$currentDate, $monthEnd])
                    ->where('period_type', 'daily')
                    ->get();
                
                if ($dailySellerComparison->isNotEmpty()) {
                    // Group by product and seller for monthly aggregation
                    $grouped = $dailySellerComparison->groupBy(function($item) {
                        return $item->product_id . '_' . $item->seller_id;
                    });

                    foreach ($grouped as $key => $items) {
                        $first = $items->first();
                        SellerComparisonAnalytics::create([
                            'date' => $currentDate,
                            'period_type' => 'monthly',
                            'product_id' => $first->product_id,
                            'product_name' => $first->product_name,
                            'category' => $first->category,
                            'seller_id' => $first->seller_id,
                            'seller_name' => $first->seller_name,
                            'total_revenue' => min(999999999999999.99, $items->sum('total_revenue')),
                            'total_orders' => max(0, $items->sum('total_orders')),
                            'total_quantity_sold' => max(0, $items->sum('total_quantity_sold')),
                            'average_price' => min(99999999.99, round($items->avg('average_price'), 2)),
                            'average_rating' => min(5.00, max(0.00, round($items->avg('average_rating'), 2))),
                            'total_reviews' => max(0, $items->sum('total_reviews')),
                            'market_share_percentage' => min(100.00, max(0.00, round($items->avg('market_share_percentage'), 2))),
                            'revenue_rank' => max(1, $items->min('revenue_rank')),
                            'orders_rank' => max(1, $items->min('orders_rank')),
                            'rating_rank' => max(1, $items->min('rating_rank')),
                            'growth_rate' => max(-99.99, min(999.99, round($items->avg('growth_rate'), 2))),
                            'previous_period_revenue' => min(999999999999999.99, $items->sum('previous_period_revenue')),
                            'is_top_seller' => $items->where('is_top_seller', true)->isNotEmpty(),
                            'competitor_count' => max(1, $first->competitor_count),
                        ]);
                    }
                }

                // Aggregate Micro Analytics - Category Performance Analytics
                $dailyCategoryPerformance = CategoryPerformanceAnalytics::whereBetween('date', [$currentDate, $monthEnd])
                    ->where('period_type', 'daily')
                    ->get();
                
                if ($dailyCategoryPerformance->isNotEmpty()) {
                    $grouped = $dailyCategoryPerformance->groupBy('category');

                    foreach ($grouped as $category => $items) {
                        CategoryPerformanceAnalytics::create([
                            'date' => $currentDate,
                            'period_type' => 'monthly',
                            'category' => $category,
                            'total_sellers' => max(0, round($items->avg('total_sellers'))),
                            'total_products' => max(0, round($items->avg('total_products'))),
                            'total_revenue' => min(999999999999999.99, $items->sum('total_revenue')),
                            'total_orders' => max(0, $items->sum('total_orders')),
                            'average_rating' => min(5.00, max(0.00, round($items->avg('average_rating'), 2))),
                            'total_reviews' => max(0, $items->sum('total_reviews')),
                            'average_price' => min(99999999.99, round($items->avg('average_price'), 2)),
                            'market_share_percentage' => min(100.00, max(0.00, round($items->avg('market_share_percentage'), 2))),
                            'growth_rate' => max(-99.99, min(999.99, round($items->avg('growth_rate'), 2))),
                            'top_seller_count' => max(0, round($items->avg('top_seller_count'))),
                        ]);
                    }
                }

                // Aggregate Most Selling Product Analytics
                $dailyMostSelling = MostSellingProductAnalytics::whereBetween('date', [$currentDate, $monthEnd])
                    ->where('period_type', 'daily')
                    ->get();
                
                if ($dailyMostSelling->isNotEmpty()) {
                    $grouped = $dailyMostSelling->groupBy('product_id');

                    foreach ($grouped as $productId => $items) {
                        $first = $items->first();
                        MostSellingProductAnalytics::create([
                            'date' => $currentDate,
                            'period_type' => 'monthly',
                            'product_id' => $first->product_id,
                            'product_name' => $first->product_name,
                            'seller_id' => $first->seller_id,
                            'seller_name' => $first->seller_name,
                            'category' => $first->category,
                            'total_orders' => max(0, $items->sum('total_orders')),
                            'total_quantity_sold' => max(0, $items->sum('total_quantity_sold')),
                            'total_revenue' => min(9999999999.99, $items->sum('total_revenue')),
                            'average_rating' => min(5.00, max(0.00, round($items->avg('average_rating'), 2))),
                            'total_reviews' => max(0, $items->sum('total_reviews')),
                            'month_year' => $currentDate->format('M Y'),
                            'year' => $currentDate->year,
                        ]);
                    }
                }

                // Aggregate Highest Sales Seller Analytics
                $dailyHighestSales = HighestSalesSellerAnalytics::whereBetween('date', [$currentDate, $monthEnd])
                    ->where('period_type', 'daily')
                    ->get();
                
                if ($dailyHighestSales->isNotEmpty()) {
                    $grouped = $dailyHighestSales->groupBy('seller_id');

                    foreach ($grouped as $sellerId => $items) {
                        $first = $items->first();
                        HighestSalesSellerAnalytics::create([
                            'date' => $currentDate,
                            'period_type' => 'monthly',
                            'seller_id' => $first->seller_id,
                            'seller_name' => $first->seller_name,
                            'business_name' => $first->business_name,
                            'total_revenue' => min(9999999999.99, $items->sum('total_revenue')),
                            'total_orders' => max(0, $items->sum('total_orders')),
                            'total_products_sold' => max(0, $items->sum('total_products_sold')),
                            'unique_products' => max(0, round($items->avg('unique_products'))),
                            'average_order_value' => min(9999999999.99, round($items->avg('average_order_value'), 2)),
                            'completion_rate' => min(100.00, max(0.00, round($items->avg('completion_rate'), 2))),
                            'average_rating' => min(5.00, max(0.00, round($items->avg('average_rating'), 2))),
                            'total_reviews' => max(0, $items->sum('total_reviews')),
                            'top_category' => $first->top_category,
                            'month_year' => $currentDate->format('M Y'),
                            'year' => $currentDate->year,
                        ]);
                    }
                }
            }

            $currentDate->addMonth();
            $monthCount++;
        }
        
        $this->command->info("Generated {$monthCount} months of monthly analytics data (including all micro analytics)");
    }

    private function generateQuarterlyAnalytics($startDate, $endDate)
    {
        $this->command->info('Generating quarterly analytics data...');
        
        $currentDate = $startDate->copy()->startOfQuarter();
        $quarterCount = 0;
        
        while ($currentDate->lte($endDate)) {
            $quarterEnd = $currentDate->copy()->endOfQuarter();
            
            $this->command->info("Processing quarter: Q{$currentDate->quarter} {$currentDate->year}");
            
            // Aggregate monthly data for quarterly totals
            $monthlyRevenueData = RevenueAnalytics::whereBetween('date', [$currentDate, $quarterEnd])
                ->where('period_type', 'monthly')
                ->get();
            
            if ($monthlyRevenueData->isNotEmpty()) {
                // Revenue Analytics
                RevenueAnalytics::create([
                    'date' => $currentDate,
                    'period_type' => 'quarterly',
                    'total_revenue' => min(999999999999999.99, $monthlyRevenueData->sum('total_revenue')),
                    'platform_commission' => min(999999999999999.99, $monthlyRevenueData->sum('platform_commission')),
                    'payment_processing_fees' => min(999999999999999.99, $monthlyRevenueData->sum('payment_processing_fees')),
                    'total_orders' => max(0, $monthlyRevenueData->sum('total_orders')),
                    'average_order_value' => min(99999999.99, round($monthlyRevenueData->avg('average_order_value'), 2)),
                ]);

                // Order Analytics
                $monthlyOrderData = OrderAnalytics::whereBetween('date', [$currentDate, $quarterEnd])
                    ->where('period_type', 'monthly')
                    ->get();
                
                if ($monthlyOrderData->isNotEmpty()) {
                    OrderAnalytics::create([
                        'date' => $currentDate,
                        'period_type' => 'quarterly',
                        'total_orders' => max(0, $monthlyOrderData->sum('total_orders')),
                        'completed_orders' => max(0, $monthlyOrderData->sum('completed_orders')),
                        'pending_orders' => max(0, $monthlyOrderData->sum('pending_orders')),
                        'processing_orders' => max(0, $monthlyOrderData->sum('processing_orders')),
                        'shipped_orders' => max(0, $monthlyOrderData->sum('shipped_orders')),
                        'cancelled_orders' => max(0, $monthlyOrderData->sum('cancelled_orders')),
                        'refunded_orders' => max(0, $monthlyOrderData->sum('refunded_orders')),
                        'completion_rate' => min(100.00, max(0.00, round($monthlyOrderData->avg('completion_rate'), 2))),
                        'cancellation_rate' => min(100.00, max(0.00, round($monthlyOrderData->avg('cancellation_rate'), 2))),
                        'refund_rate' => min(100.00, max(0.00, round($monthlyOrderData->avg('refund_rate'), 2))),
                        'average_order_value' => min(99999999.99, round($monthlyOrderData->avg('average_order_value'), 2)),
                    ]);
                }

                // Review Analytics
                $monthlyReviewData = ReviewAnalytics::whereBetween('date', [$currentDate, $quarterEnd])
                    ->where('period_type', 'monthly')
                    ->get();
                
                if ($monthlyReviewData->isNotEmpty()) {
                    ReviewAnalytics::create([
                        'date' => $currentDate,
                        'period_type' => 'quarterly',
                        'total_reviews' => max(0, $monthlyReviewData->sum('total_reviews')),
                        'average_rating' => min(5.00, max(0.00, round($monthlyReviewData->avg('average_rating'), 2))),
                        'five_star_reviews' => max(0, $monthlyReviewData->sum('five_star_reviews')),
                        'four_star_reviews' => max(0, $monthlyReviewData->sum('four_star_reviews')),
                        'three_star_reviews' => max(0, $monthlyReviewData->sum('three_star_reviews')),
                        'two_star_reviews' => max(0, $monthlyReviewData->sum('two_star_reviews')),
                        'one_star_reviews' => max(0, $monthlyReviewData->sum('one_star_reviews')),
                        'reviews_with_comments' => max(0, $monthlyReviewData->sum('reviews_with_comments')),
                        'reviews_without_comments' => max(0, $monthlyReviewData->sum('reviews_without_comments')),
                        'response_rate' => min(100.00, max(0.00, round($monthlyReviewData->avg('response_rate'), 2))),
                    ]);
                }

                // Product Analytics
                $monthlyProductData = ProductAnalytics::whereBetween('date', [$currentDate, $quarterEnd])
                    ->where('period_type', 'monthly')
                    ->get();
                
                if ($monthlyProductData->isNotEmpty()) {
                    ProductAnalytics::create([
                        'date' => $currentDate,
                        'period_type' => 'quarterly',
                        'total_products' => max(0, round($monthlyProductData->avg('total_products'))),
                        'active_products' => max(0, round($monthlyProductData->avg('active_products'))),
                        'inactive_products' => max(0, round($monthlyProductData->avg('inactive_products'))),
                        'low_stock_products' => max(0, round($monthlyProductData->avg('low_stock_products'))),
                        'featured_products' => max(0, round($monthlyProductData->avg('featured_products'))),
                        'products_with_images' => max(0, round($monthlyProductData->avg('products_with_images'))),
                        'products_with_videos' => max(0, round($monthlyProductData->avg('products_with_videos'))),
                        'products_without_images' => max(0, round($monthlyProductData->avg('products_without_images'))),
                        'average_product_rating' => min(5.00, max(0.00, round($monthlyProductData->avg('average_product_rating'), 2))),
                    ]);
                }

                // Content Moderation Analytics
                $monthlyModerationData = ContentModerationAnalytics::whereBetween('date', [$currentDate, $quarterEnd])
                    ->where('period_type', 'monthly')
                    ->get();
                
                if ($monthlyModerationData->isNotEmpty()) {
                    ContentModerationAnalytics::create([
                        'date' => $currentDate,
                        'period_type' => 'quarterly',
                        'products_pending_approval' => max(0, $monthlyModerationData->sum('products_pending_approval')),
                        'products_approved' => max(0, $monthlyModerationData->sum('products_approved')),
                        'products_rejected' => max(0, $monthlyModerationData->sum('products_rejected')),
                        'reviews_flagged' => max(0, $monthlyModerationData->sum('reviews_flagged')),
                        'reviews_approved' => max(0, $monthlyModerationData->sum('reviews_approved')),
                        'reviews_removed' => max(0, $monthlyModerationData->sum('reviews_removed')),
                        'users_suspended' => max(0, $monthlyModerationData->sum('users_suspended')),
                        'users_reactivated' => max(0, $monthlyModerationData->sum('users_reactivated')),
                        'approval_rate' => min(100.00, max(0.00, round($monthlyModerationData->avg('approval_rate'), 2))),
                        'rejection_rate' => min(100.00, max(0.00, round($monthlyModerationData->avg('rejection_rate'), 2))),
                    ]);
                }

                // Seller Revenue Analytics (quarterly aggregation)
                $sellers = Seller::all();
                foreach ($sellers as $seller) {
                    $sellerMonthlyData = SellerRevenueAnalytics::where('seller_id', $seller->sellerID)
                        ->whereBetween('date', [$currentDate, $quarterEnd])
                        ->where('period_type', 'monthly')
                        ->get();
                    
                    if ($sellerMonthlyData->isNotEmpty()) {
                        SellerRevenueAnalytics::create([
                            'seller_id' => $seller->sellerID,
                            'date' => $currentDate,
                            'period_type' => 'quarterly',
                            'total_revenue' => min(999999999999999.99, $sellerMonthlyData->sum('total_revenue')),
                            'commission_earned' => min(999999999999999.99, $sellerMonthlyData->sum('commission_earned')),
                            'total_orders' => max(0, $sellerMonthlyData->sum('total_orders')),
                            'average_order_value' => min(99999999.99, round($sellerMonthlyData->avg('average_order_value'), 2)),
                            'products_sold' => max(0, $sellerMonthlyData->sum('products_sold')),
                        ]);
                    }
                }

                // Aggregate Quarterly Micro Analytics - Detailed Review Analytics
                $monthlyDetailedReviews = DetailedReviewAnalytics::whereBetween('date', [$currentDate, $quarterEnd])
                    ->where('period_type', 'monthly')
                    ->get();
                
                if ($monthlyDetailedReviews->isNotEmpty()) {
                    foreach ($monthlyDetailedReviews as $review) {
                        DetailedReviewAnalytics::create([
                            'date' => $currentDate,
                            'period_type' => 'quarterly',
                            'user_id' => $review->user_id,
                            'product_id' => $review->product_id,
                            'seller_id' => $review->seller_id,
                            'rating' => $review->rating,
                            'review_text' => $review->review_text,
                            'is_verified_purchase' => $review->is_verified_purchase,
                            'helpful_votes' => $review->helpful_votes,
                            'response_text' => $review->response_text,
                            'response_date' => $review->response_date,
                            'category' => $review->category,
                            'product_name' => $review->product_name,
                            'seller_name' => $review->seller_name,
                            'user_name' => $review->user_name,
                        ]);
                    }
                }

                // Aggregate Quarterly Micro Analytics - Most Selling Product Analytics
                $monthlyMostSellingData = MostSellingProductAnalytics::whereBetween('date', [$currentDate, $quarterEnd])
                    ->where('period_type', 'monthly')
                    ->get();
                
                if ($monthlyMostSellingData->isNotEmpty()) {
                    $groupedData = $monthlyMostSellingData->groupBy('product_id');
                    
                    foreach ($groupedData as $productId => $productData) {
                        $firstRecord = $productData->first();
                        MostSellingProductAnalytics::create([
                            'date' => $currentDate,
                            'period_type' => 'quarterly',
                            'product_id' => $firstRecord->product_id,
                            'product_name' => $firstRecord->product_name,
                            'seller_id' => $firstRecord->seller_id,
                            'seller_name' => $firstRecord->seller_name,
                            'category' => $firstRecord->category,
                            'total_orders' => max(0, $productData->sum('total_orders')),
                            'total_quantity_sold' => max(0, $productData->sum('total_quantity_sold')),
                            'total_revenue' => min(9999999999.99, $productData->sum('total_revenue')),
                            'average_rating' => min(5.00, max(0.00, round($productData->avg('average_rating'), 2))),
                            'total_reviews' => max(0, $productData->sum('total_reviews')),
                            'month_year' => $currentDate->format('M Y'),
                            'year' => $currentDate->year,
                        ]);
                    }
                }

                // Aggregate Quarterly Micro Analytics - Highest Sales Seller Analytics
                $monthlyHighestSalesData = HighestSalesSellerAnalytics::whereBetween('date', [$currentDate, $quarterEnd])
                    ->where('period_type', 'monthly')
                    ->get();
                
                if ($monthlyHighestSalesData->isNotEmpty()) {
                    $groupedData = $monthlyHighestSalesData->groupBy('seller_id');
                    
                    foreach ($groupedData as $sellerId => $sellerData) {
                        $firstRecord = $sellerData->first();
                        HighestSalesSellerAnalytics::create([
                            'date' => $currentDate,
                            'period_type' => 'quarterly',
                            'seller_id' => $firstRecord->seller_id,
                            'seller_name' => $firstRecord->seller_name,
                            'business_name' => $firstRecord->business_name,
                            'total_revenue' => min(9999999999.99, $sellerData->sum('total_revenue')),
                            'total_orders' => max(0, $sellerData->sum('total_orders')),
                            'total_products_sold' => max(0, $sellerData->sum('total_products_sold')),
                            'unique_products' => max(0, $sellerData->max('unique_products')),
                            'average_order_value' => min(9999999999.99, $sellerData->avg('average_order_value')),
                            'completion_rate' => min(100.00, max(0.00, round($sellerData->avg('completion_rate'), 2))),
                            'average_rating' => min(5.00, max(0.00, round($sellerData->avg('average_rating'), 2))),
                            'total_reviews' => max(0, $sellerData->sum('total_reviews')),
                            'top_category' => $firstRecord->top_category,
                            'month_year' => $currentDate->format('M Y'),
                            'year' => $currentDate->year,
                        ]);
                    }
                }

                // Aggregate Quarterly Micro Analytics - Seller Comparison Analytics
                $monthlySellerComparison = SellerComparisonAnalytics::whereBetween('date', [$currentDate, $quarterEnd])
                    ->where('period_type', 'monthly')
                    ->get();
                
                if ($monthlySellerComparison->isNotEmpty()) {
                    $grouped = $monthlySellerComparison->groupBy(function($item) {
                        return $item->product_id . '_' . $item->seller_id;
                    });

                    foreach ($grouped as $key => $items) {
                        $first = $items->first();
                        SellerComparisonAnalytics::create([
                            'date' => $currentDate,
                            'period_type' => 'quarterly',
                            'product_id' => $first->product_id,
                            'product_name' => $first->product_name,
                            'category' => $first->category,
                            'seller_id' => $first->seller_id,
                            'seller_name' => $first->seller_name,
                            'total_revenue' => min(999999999999999.99, $items->sum('total_revenue')),
                            'total_orders' => max(0, $items->sum('total_orders')),
                            'total_quantity_sold' => max(0, $items->sum('total_quantity_sold')),
                            'average_price' => min(99999999.99, round($items->avg('average_price'), 2)),
                            'average_rating' => min(5.00, max(0.00, round($items->avg('average_rating'), 2))),
                            'total_reviews' => max(0, $items->sum('total_reviews')),
                            'market_share_percentage' => min(100.00, max(0.00, round($items->avg('market_share_percentage'), 2))),
                            'revenue_rank' => max(1, $items->min('revenue_rank')),
                            'orders_rank' => max(1, $items->min('orders_rank')),
                            'rating_rank' => max(1, $items->min('rating_rank')),
                            'growth_rate' => max(-99.99, min(999.99, round($items->avg('growth_rate'), 2))),
                            'previous_period_revenue' => min(999999999999999.99, $items->sum('previous_period_revenue')),
                            'is_top_seller' => $items->where('is_top_seller', true)->isNotEmpty(),
                            'competitor_count' => max(1, $first->competitor_count),
                        ]);
                    }
                }

                // Aggregate Quarterly Micro Analytics - Category Performance Analytics
                $monthlyCategoryPerformance = CategoryPerformanceAnalytics::whereBetween('date', [$currentDate, $quarterEnd])
                    ->where('period_type', 'monthly')
                    ->get();
                
                if ($monthlyCategoryPerformance->isNotEmpty()) {
                    $grouped = $monthlyCategoryPerformance->groupBy('category');

                    foreach ($grouped as $category => $items) {
                        CategoryPerformanceAnalytics::create([
                            'date' => $currentDate,
                            'period_type' => 'quarterly',
                            'category' => $category,
                            'total_sellers' => max(0, round($items->avg('total_sellers'))),
                            'total_products' => max(0, round($items->avg('total_products'))),
                            'total_revenue' => min(999999999999999.99, $items->sum('total_revenue')),
                            'total_orders' => max(0, $items->sum('total_orders')),
                            'average_rating' => min(5.00, max(0.00, round($items->avg('average_rating'), 2))),
                            'total_reviews' => max(0, $items->sum('total_reviews')),
                            'average_price' => min(99999999.99, round($items->avg('average_price'), 2)),
                            'market_share_percentage' => min(100.00, max(0.00, round($items->avg('market_share_percentage'), 2))),
                            'growth_rate' => max(-99.99, min(999.99, round($items->avg('growth_rate'), 2))),
                            'top_seller_count' => max(0, round($items->avg('top_seller_count'))),
                        ]);
                    }
                }

                // Aggregate Quarterly Most Selling Product Analytics
                $monthlyMostSelling = MostSellingProductAnalytics::whereBetween('date', [$currentDate, $quarterEnd])
                    ->where('period_type', 'monthly')
                    ->get();
                
                if ($monthlyMostSelling->isNotEmpty()) {
                    $grouped = $monthlyMostSelling->groupBy('product_id');

                    foreach ($grouped as $productId => $items) {
                        $first = $items->first();
                        MostSellingProductAnalytics::create([
                            'date' => $currentDate,
                            'period_type' => 'quarterly',
                            'product_id' => $first->product_id,
                            'product_name' => $first->product_name,
                            'seller_id' => $first->seller_id,
                            'seller_name' => $first->seller_name,
                            'category' => $first->category,
                            'total_orders' => max(0, $items->sum('total_orders')),
                            'total_quantity_sold' => max(0, $items->sum('total_quantity_sold')),
                            'total_revenue' => min(9999999999.99, $items->sum('total_revenue')),
                            'average_rating' => min(5.00, max(0.00, round($items->avg('average_rating'), 2))),
                            'total_reviews' => max(0, $items->sum('total_reviews')),
                            'month_year' => 'Q' . $currentDate->quarter . ' ' . $currentDate->year,
                            'year' => $currentDate->year,
                        ]);
                    }
                }

                // Aggregate Quarterly Highest Sales Seller Analytics
                $monthlyHighestSales = HighestSalesSellerAnalytics::whereBetween('date', [$currentDate, $quarterEnd])
                    ->where('period_type', 'monthly')
                    ->get();
                
                if ($monthlyHighestSales->isNotEmpty()) {
                    $grouped = $monthlyHighestSales->groupBy('seller_id');

                    foreach ($grouped as $sellerId => $items) {
                        $first = $items->first();
                        HighestSalesSellerAnalytics::create([
                            'date' => $currentDate,
                            'period_type' => 'quarterly',
                            'seller_id' => $first->seller_id,
                            'seller_name' => $first->seller_name,
                            'business_name' => $first->business_name,
                            'total_revenue' => min(9999999999.99, $items->sum('total_revenue')),
                            'total_orders' => max(0, $items->sum('total_orders')),
                            'total_products_sold' => max(0, $items->sum('total_products_sold')),
                            'unique_products' => max(0, round($items->avg('unique_products'))),
                            'average_order_value' => min(9999999999.99, round($items->avg('average_order_value'), 2)),
                            'completion_rate' => min(100.00, max(0.00, round($items->avg('completion_rate'), 2))),
                            'average_rating' => min(5.00, max(0.00, round($items->avg('average_rating'), 2))),
                            'total_reviews' => max(0, $items->sum('total_reviews')),
                            'top_category' => $first->top_category,
                            'month_year' => 'Q' . $currentDate->quarter . ' ' . $currentDate->year,
                            'year' => $currentDate->year,
                        ]);
                    }
                }
            }

            $currentDate->addQuarter();
            $quarterCount++;
        }
        
        $this->command->info("Generated {$quarterCount} quarters of quarterly analytics data (including all micro analytics)");
    }

    private function generateYearlyAnalytics($startDate, $endDate)
    {
        $this->command->info('Generating yearly analytics data...');
        
        $currentYear = $startDate->year;
        $endYear = $endDate->year;
        $yearCount = 0;
        
        for ($year = $currentYear; $year <= $endYear; $year++) {
            $yearStart = Carbon::create($year, 1, 1)->startOfDay();
            $yearEnd = Carbon::create($year, 12, 31)->endOfDay();
            
            // Don't generate if outside our data range
            if ($yearEnd->lt($startDate) || $yearStart->gt($endDate)) {
                continue;
            }
            
            // Adjust boundaries to actual data range
            if ($yearStart->lt($startDate)) {
                $yearStart = $startDate->copy();
            }
            if ($yearEnd->gt($endDate)) {
                $yearEnd = $endDate->copy();
            }
            
            $this->command->info("Processing year: {$year}");
            
            // Aggregate quarterly or monthly data for yearly totals
            $quarterlyRevenueData = RevenueAnalytics::whereBetween('date', [$yearStart, $yearEnd])
                ->whereIn('period_type', ['quarterly', 'monthly'])
                ->get();
            
            if ($quarterlyRevenueData->isNotEmpty()) {
                // Revenue Analytics
                RevenueAnalytics::create([
                    'date' => $yearStart,
                    'period_type' => 'yearly',
                    'total_revenue' => min(999999999999999.99, $quarterlyRevenueData->sum('total_revenue')),
                    'platform_commission' => min(999999999999999.99, $quarterlyRevenueData->sum('platform_commission')),
                    'payment_processing_fees' => min(999999999999999.99, $quarterlyRevenueData->sum('payment_processing_fees')),
                    'total_orders' => max(0, $quarterlyRevenueData->sum('total_orders')),
                    'average_order_value' => min(99999999.99, round($quarterlyRevenueData->avg('average_order_value'), 2)),
                ]);

                // Order Analytics
                $quarterlyOrderData = OrderAnalytics::whereBetween('date', [$yearStart, $yearEnd])
                    ->whereIn('period_type', ['quarterly', 'monthly'])
                    ->get();
                
                if ($quarterlyOrderData->isNotEmpty()) {
                    OrderAnalytics::create([
                        'date' => $yearStart,
                        'period_type' => 'yearly',
                        'total_orders' => max(0, $quarterlyOrderData->sum('total_orders')),
                        'completed_orders' => max(0, $quarterlyOrderData->sum('completed_orders')),
                        'pending_orders' => max(0, $quarterlyOrderData->sum('pending_orders')),
                        'processing_orders' => max(0, $quarterlyOrderData->sum('processing_orders')),
                        'shipped_orders' => max(0, $quarterlyOrderData->sum('shipped_orders')),
                        'cancelled_orders' => max(0, $quarterlyOrderData->sum('cancelled_orders')),
                        'refunded_orders' => max(0, $quarterlyOrderData->sum('refunded_orders')),
                        'completion_rate' => min(100.00, max(0.00, round($quarterlyOrderData->avg('completion_rate'), 2))),
                        'cancellation_rate' => min(100.00, max(0.00, round($quarterlyOrderData->avg('cancellation_rate'), 2))),
                        'refund_rate' => min(100.00, max(0.00, round($quarterlyOrderData->avg('refund_rate'), 2))),
                        'average_order_value' => min(99999999.99, round($quarterlyOrderData->avg('average_order_value'), 2)),
                    ]);
                }

                // Review Analytics
                $quarterlyReviewData = ReviewAnalytics::whereBetween('date', [$yearStart, $yearEnd])
                    ->whereIn('period_type', ['quarterly', 'monthly'])
                    ->get();
                
                if ($quarterlyReviewData->isNotEmpty()) {
                    ReviewAnalytics::create([
                        'date' => $yearStart,
                        'period_type' => 'yearly',
                        'total_reviews' => max(0, $quarterlyReviewData->sum('total_reviews')),
                        'average_rating' => min(5.00, max(0.00, round($quarterlyReviewData->avg('average_rating'), 2))),
                        'five_star_reviews' => max(0, $quarterlyReviewData->sum('five_star_reviews')),
                        'four_star_reviews' => max(0, $quarterlyReviewData->sum('four_star_reviews')),
                        'three_star_reviews' => max(0, $quarterlyReviewData->sum('three_star_reviews')),
                        'two_star_reviews' => max(0, $quarterlyReviewData->sum('two_star_reviews')),
                        'one_star_reviews' => max(0, $quarterlyReviewData->sum('one_star_reviews')),
                        'reviews_with_comments' => max(0, $quarterlyReviewData->sum('reviews_with_comments')),
                        'reviews_without_comments' => max(0, $quarterlyReviewData->sum('reviews_without_comments')),
                        'response_rate' => min(100.00, max(0.00, round($quarterlyReviewData->avg('response_rate'), 2))),
                    ]);
                }

                // Product Analytics
                $quarterlyProductData = ProductAnalytics::whereBetween('date', [$yearStart, $yearEnd])
                    ->whereIn('period_type', ['quarterly', 'monthly'])
                    ->get();
                
                if ($quarterlyProductData->isNotEmpty()) {
                    ProductAnalytics::create([
                        'date' => $yearStart,
                        'period_type' => 'yearly',
                        'total_products' => max(0, round($quarterlyProductData->avg('total_products'))),
                        'active_products' => max(0, round($quarterlyProductData->avg('active_products'))),
                        'inactive_products' => max(0, round($quarterlyProductData->avg('inactive_products'))),
                        'low_stock_products' => max(0, round($quarterlyProductData->avg('low_stock_products'))),
                        'featured_products' => max(0, round($quarterlyProductData->avg('featured_products'))),
                        'products_with_images' => max(0, round($quarterlyProductData->avg('products_with_images'))),
                        'products_with_videos' => max(0, round($quarterlyProductData->avg('products_with_videos'))),
                        'products_without_images' => max(0, round($quarterlyProductData->avg('products_without_images'))),
                        'average_product_rating' => min(5.00, max(0.00, round($quarterlyProductData->avg('average_product_rating'), 2))),
                    ]);
                }

                // Content Moderation Analytics
                $quarterlyModerationData = ContentModerationAnalytics::whereBetween('date', [$yearStart, $yearEnd])
                    ->whereIn('period_type', ['quarterly', 'monthly'])
                    ->get();
                
                if ($quarterlyModerationData->isNotEmpty()) {
                    ContentModerationAnalytics::create([
                        'date' => $yearStart,
                        'period_type' => 'yearly',
                        'products_pending_approval' => max(0, $quarterlyModerationData->sum('products_pending_approval')),
                        'products_approved' => max(0, $quarterlyModerationData->sum('products_approved')),
                        'products_rejected' => max(0, $quarterlyModerationData->sum('products_rejected')),
                        'reviews_flagged' => max(0, $quarterlyModerationData->sum('reviews_flagged')),
                        'reviews_approved' => max(0, $quarterlyModerationData->sum('reviews_approved')),
                        'reviews_removed' => max(0, $quarterlyModerationData->sum('reviews_removed')),
                        'users_suspended' => max(0, $quarterlyModerationData->sum('users_suspended')),
                        'users_reactivated' => max(0, $quarterlyModerationData->sum('users_reactivated')),
                        'approval_rate' => min(100.00, max(0.00, round($quarterlyModerationData->avg('approval_rate'), 2))),
                        'rejection_rate' => min(100.00, max(0.00, round($quarterlyModerationData->avg('rejection_rate'), 2))),
                    ]);
                }

                // Seller Revenue Analytics (yearly aggregation)
                $sellers = Seller::all();
                foreach ($sellers as $seller) {
                    $sellerQuarterlyData = SellerRevenueAnalytics::where('seller_id', $seller->sellerID)
                        ->whereBetween('date', [$yearStart, $yearEnd])
                        ->whereIn('period_type', ['quarterly', 'monthly'])
                        ->get();
                    
                    if ($sellerQuarterlyData->isNotEmpty()) {
                        SellerRevenueAnalytics::create([
                            'seller_id' => $seller->sellerID,
                            'date' => $yearStart,
                            'period_type' => 'yearly',
                            'total_revenue' => min(999999999999999.99, $sellerQuarterlyData->sum('total_revenue')),
                            'commission_earned' => min(999999999999999.99, $sellerQuarterlyData->sum('commission_earned')),
                            'total_orders' => max(0, $sellerQuarterlyData->sum('total_orders')),
                            'average_order_value' => min(99999999.99, round($sellerQuarterlyData->avg('average_order_value'), 2)),
                            'products_sold' => max(0, $sellerQuarterlyData->sum('products_sold')),
                        ]);
                    }
                }

                // Aggregate Yearly Micro Analytics - Detailed Review Analytics
                $quarterlyDetailedReviews = DetailedReviewAnalytics::whereBetween('date', [$yearStart, $yearEnd])
                    ->whereIn('period_type', ['quarterly', 'monthly'])
                    ->get();
                
                if ($quarterlyDetailedReviews->isNotEmpty()) {
                    foreach ($quarterlyDetailedReviews as $review) {
                        DetailedReviewAnalytics::create([
                            'date' => $yearStart,
                            'period_type' => 'yearly',
                            'user_id' => $review->user_id,
                            'product_id' => $review->product_id,
                            'seller_id' => $review->seller_id,
                            'rating' => $review->rating,
                            'review_text' => $review->review_text,
                            'is_verified_purchase' => $review->is_verified_purchase,
                            'helpful_votes' => $review->helpful_votes,
                            'response_text' => $review->response_text,
                            'response_date' => $review->response_date,
                            'category' => $review->category,
                            'product_name' => $review->product_name,
                            'seller_name' => $review->seller_name,
                            'user_name' => $review->user_name,
                        ]);
                    }
                }

                // Aggregate Yearly Micro Analytics - Most Selling Product Analytics
                $quarterlyMostSellingData = MostSellingProductAnalytics::whereBetween('date', [$yearStart, $yearEnd])
                    ->whereIn('period_type', ['quarterly', 'monthly'])
                    ->get();
                
                if ($quarterlyMostSellingData->isNotEmpty()) {
                    $groupedData = $quarterlyMostSellingData->groupBy('product_id');
                    
                    foreach ($groupedData as $productId => $productData) {
                        $firstRecord = $productData->first();
                        MostSellingProductAnalytics::create([
                            'date' => $yearStart,
                            'period_type' => 'yearly',
                            'product_id' => $firstRecord->product_id,
                            'product_name' => $firstRecord->product_name,
                            'seller_id' => $firstRecord->seller_id,
                            'seller_name' => $firstRecord->seller_name,
                            'category' => $firstRecord->category,
                            'total_orders' => max(0, $productData->sum('total_orders')),
                            'total_quantity_sold' => max(0, $productData->sum('total_quantity_sold')),
                            'total_revenue' => min(9999999999.99, $productData->sum('total_revenue')),
                            'average_rating' => min(5.00, max(0.00, round($productData->avg('average_rating'), 2))),
                            'total_reviews' => max(0, $productData->sum('total_reviews')),
                            'month_year' => $yearStart->format('M Y'),
                            'year' => $yearStart->year,
                        ]);
                    }
                }

                // Aggregate Yearly Micro Analytics - Highest Sales Seller Analytics
                $quarterlyHighestSalesData = HighestSalesSellerAnalytics::whereBetween('date', [$yearStart, $yearEnd])
                    ->whereIn('period_type', ['quarterly', 'monthly'])
                    ->get();
                
                if ($quarterlyHighestSalesData->isNotEmpty()) {
                    $groupedData = $quarterlyHighestSalesData->groupBy('seller_id');
                    
                    foreach ($groupedData as $sellerId => $sellerData) {
                        $firstRecord = $sellerData->first();
                        HighestSalesSellerAnalytics::create([
                            'date' => $yearStart,
                            'period_type' => 'yearly',
                            'seller_id' => $firstRecord->seller_id,
                            'seller_name' => $firstRecord->seller_name,
                            'business_name' => $firstRecord->business_name,
                            'total_revenue' => min(9999999999.99, $sellerData->sum('total_revenue')),
                            'total_orders' => max(0, $sellerData->sum('total_orders')),
                            'total_products_sold' => max(0, $sellerData->sum('total_products_sold')),
                            'unique_products' => max(0, $sellerData->max('unique_products')),
                            'average_order_value' => min(9999999999.99, $sellerData->avg('average_order_value')),
                            'completion_rate' => min(100.00, max(0.00, round($sellerData->avg('completion_rate'), 2))),
                            'average_rating' => min(5.00, max(0.00, round($sellerData->avg('average_rating'), 2))),
                            'total_reviews' => max(0, $sellerData->sum('total_reviews')),
                            'top_category' => $firstRecord->top_category,
                            'month_year' => $yearStart->format('M Y'),
                            'year' => $yearStart->year,
                        ]);
                    }
                }

                // Aggregate Yearly Micro Analytics - Seller Comparison Analytics
                $quarterlySellerComparison = SellerComparisonAnalytics::whereBetween('date', [$yearStart, $yearEnd])
                    ->whereIn('period_type', ['quarterly', 'monthly'])
                    ->get();
                
                if ($quarterlySellerComparison->isNotEmpty()) {
                    $grouped = $quarterlySellerComparison->groupBy(function($item) {
                        return $item->product_id . '_' . $item->seller_id;
                    });

                    foreach ($grouped as $key => $items) {
                        $first = $items->first();
                        SellerComparisonAnalytics::create([
                            'date' => $yearStart,
                            'period_type' => 'yearly',
                            'product_id' => $first->product_id,
                            'product_name' => $first->product_name,
                            'category' => $first->category,
                            'seller_id' => $first->seller_id,
                            'seller_name' => $first->seller_name,
                            'total_revenue' => min(999999999999999.99, $items->sum('total_revenue')),
                            'total_orders' => max(0, $items->sum('total_orders')),
                            'total_quantity_sold' => max(0, $items->sum('total_quantity_sold')),
                            'average_price' => min(99999999.99, round($items->avg('average_price'), 2)),
                            'average_rating' => min(5.00, max(0.00, round($items->avg('average_rating'), 2))),
                            'total_reviews' => max(0, $items->sum('total_reviews')),
                            'market_share_percentage' => min(100.00, max(0.00, round($items->avg('market_share_percentage'), 2))),
                            'revenue_rank' => max(1, $items->min('revenue_rank')),
                            'orders_rank' => max(1, $items->min('orders_rank')),
                            'rating_rank' => max(1, $items->min('rating_rank')),
                            'growth_rate' => max(-99.99, min(999.99, round($items->avg('growth_rate'), 2))),
                            'previous_period_revenue' => min(999999999999999.99, $items->sum('previous_period_revenue')),
                            'is_top_seller' => $items->where('is_top_seller', true)->isNotEmpty(),
                            'competitor_count' => max(1, $first->competitor_count),
                        ]);
                    }
                }

                // Aggregate Yearly Micro Analytics - Category Performance Analytics
                $quarterlyCategoryPerformance = CategoryPerformanceAnalytics::whereBetween('date', [$yearStart, $yearEnd])
                    ->whereIn('period_type', ['quarterly', 'monthly'])
                    ->get();
                
                if ($quarterlyCategoryPerformance->isNotEmpty()) {
                    $grouped = $quarterlyCategoryPerformance->groupBy('category');

                    foreach ($grouped as $category => $items) {
                        CategoryPerformanceAnalytics::create([
                            'date' => $yearStart,
                            'period_type' => 'yearly',
                            'category' => $category,
                            'total_sellers' => max(0, round($items->avg('total_sellers'))),
                            'total_products' => max(0, round($items->avg('total_products'))),
                            'total_revenue' => min(999999999999999.99, $items->sum('total_revenue')),
                            'total_orders' => max(0, $items->sum('total_orders')),
                            'average_rating' => min(5.00, max(0.00, round($items->avg('average_rating'), 2))),
                            'total_reviews' => max(0, $items->sum('total_reviews')),
                            'average_price' => min(99999999.99, round($items->avg('average_price'), 2)),
                            'market_share_percentage' => min(100.00, max(0.00, round($items->avg('market_share_percentage'), 2))),
                            'growth_rate' => max(-99.99, min(999.99, round($items->avg('growth_rate'), 2))),
                            'top_seller_count' => max(0, round($items->avg('top_seller_count'))),
                        ]);
                    }
                }

                // Aggregate Yearly Most Selling Product Analytics
                $quarterlyMostSelling = MostSellingProductAnalytics::whereBetween('date', [$yearStart, $yearEnd])
                    ->whereIn('period_type', ['quarterly', 'monthly'])
                    ->get();
                
                if ($quarterlyMostSelling->isNotEmpty()) {
                    $grouped = $quarterlyMostSelling->groupBy('product_id');

                    foreach ($grouped as $productId => $items) {
                        $first = $items->first();
                        MostSellingProductAnalytics::create([
                            'date' => $yearStart,
                            'period_type' => 'yearly',
                            'product_id' => $first->product_id,
                            'product_name' => $first->product_name,
                            'seller_id' => $first->seller_id,
                            'seller_name' => $first->seller_name,
                            'category' => $first->category,
                            'total_orders' => max(0, $items->sum('total_orders')),
                            'total_quantity_sold' => max(0, $items->sum('total_quantity_sold')),
                            'total_revenue' => min(9999999999.99, $items->sum('total_revenue')),
                            'average_rating' => min(5.00, max(0.00, round($items->avg('average_rating'), 2))),
                            'total_reviews' => max(0, $items->sum('total_reviews')),
                            'month_year' => $year,
                            'year' => $year,
                        ]);
                    }
                }

                // Aggregate Yearly Highest Sales Seller Analytics
                $quarterlyHighestSales = HighestSalesSellerAnalytics::whereBetween('date', [$yearStart, $yearEnd])
                    ->whereIn('period_type', ['quarterly', 'monthly'])
                    ->get();
                
                if ($quarterlyHighestSales->isNotEmpty()) {
                    $grouped = $quarterlyHighestSales->groupBy('seller_id');

                    foreach ($grouped as $sellerId => $items) {
                        $first = $items->first();
                        HighestSalesSellerAnalytics::create([
                            'date' => $yearStart,
                            'period_type' => 'yearly',
                            'seller_id' => $first->seller_id,
                            'seller_name' => $first->seller_name,
                            'business_name' => $first->business_name,
                            'total_revenue' => min(9999999999.99, $items->sum('total_revenue')),
                            'total_orders' => max(0, $items->sum('total_orders')),
                            'total_products_sold' => max(0, $items->sum('total_products_sold')),
                            'unique_products' => max(0, round($items->avg('unique_products'))),
                            'average_order_value' => min(9999999999.99, round($items->avg('average_order_value'), 2)),
                            'completion_rate' => min(100.00, max(0.00, round($items->avg('completion_rate'), 2))),
                            'average_rating' => min(5.00, max(0.00, round($items->avg('average_rating'), 2))),
                            'total_reviews' => max(0, $items->sum('total_reviews')),
                            'top_category' => $first->top_category,
                            'month_year' => $year,
                            'year' => $year,
                        ]);
                    }
                }
            }
            
            $yearCount++;
        }
        
        $this->command->info("Generated {$yearCount} years of yearly analytics data (including all micro analytics)");
    }

    /**
     * Get seasonal multiplier based on the month
     */
    private function getSeasonalMultiplier($date)
    {
        $month = $date->month;
        
        // Seasonal patterns for e-commerce
        switch ($month) {
            case 11: // November - Black Friday prep
                return 1.3;
            case 12: // December - Holiday season
                return 1.8;
            case 1: // January - Post-holiday slump
                return 0.6;
            case 2: // February - Valentine's Day
                return 1.2;
            case 3: // March - Spring shopping
                return 1.1;
            case 4: // April - Spring peak
                return 1.2;
            case 5: // May - Mother's Day
                return 1.3;
            case 6: // June - Summer shopping
                return 1.0;
            case 7: // July - Summer vacation
                return 0.8;
            case 8: // August - Back to school prep
                return 1.1;
            case 9: // September - Back to school
                return 1.2;
            case 10: // October - Halloween prep
                return 1.1;
            default:
                return 1.0;
        }
    }

    /**
     * Get weekend multiplier (weekends typically have lower sales)
     */
    private function getWeekendMultiplier($date)
    {
        $dayOfWeek = $date->dayOfWeek;
        
        // Saturday = 6, Sunday = 0
        if ($dayOfWeek == 0 || $dayOfWeek == 6) {
            return 0.7; // 30% lower on weekends
        }
        
        return 1.0;
    }

    /**
     * Get holiday multiplier for special shopping days
     */
    private function getHolidayMultiplier($date)
    {
        $month = $date->month;
        $day = $date->day;
        
        // Black Friday (4th Thursday of November)
        if ($month == 11 && $day >= 23 && $day <= 29) {
            return 2.5;
        }
        
        // Cyber Monday (Monday after Black Friday)
        if ($month == 11 && $day >= 26 && $day <= 30) {
            return 2.0;
        }
        
        // Christmas Eve and Christmas Day
        if ($month == 12 && ($day == 24 || $day == 25)) {
            return 0.3; // Very low sales on Christmas
        }
        
        // New Year's Eve and New Year's Day
        if ($month == 1 && ($day == 1 || $day == 2)) {
            return 0.5;
        }
        
        // Valentine's Day
        if ($month == 2 && $day == 14) {
            return 1.5;
        }
        
        // Mother's Day (2nd Sunday of May)
        if ($month == 5 && $day >= 8 && $day <= 14) {
            return 1.4;
        }
        
        // Father's Day (3rd Sunday of June)
        if ($month == 6 && $day >= 15 && $day <= 21) {
            return 1.3;
        }
        
        return 1.0;
    }
}
