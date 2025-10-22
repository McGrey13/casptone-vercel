<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Seller;
use Carbon\Carbon;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Starting Product Seeder...');

        // Get all sellers
        $sellers = Seller::all();
        
        if ($sellers->isEmpty()) {
            $this->command->error('No sellers found. Please run seller seeder first.');
            return;
        }

        $this->command->info('Found ' . $sellers->count() . ' sellers');

        // Clear existing products (optional - remove this if you want to keep existing products)
        // Product::truncate();

        // Add products for each seller
        foreach ($sellers as $seller) {
            $this->command->info("Adding products for seller: {$seller->businessName} (ID: {$seller->sellerID})");
            $this->createProductsForSeller($seller);
        }

        $this->command->info('Product Seeder completed successfully!');
    }

    /**
     * Create products for a specific seller
     */
    private function createProductsForSeller($seller)
    {
        // Get products for this seller from the product data
        $products = $this->getProductData();
        
        // Randomly select 8-12 products for this seller
        $selectedProducts = collect($products)->random(rand(8, 12));
        
        foreach ($selectedProducts as $productData) {
            // Check if product already exists for this seller
            $existingProduct = Product::where('productName', $productData['name'])
                ->where('seller_id', $seller->sellerID)
                ->first();
            
            if ($existingProduct) {
                continue; // Skip if product already exists
            }
            
            // Generate unique SKU for this product
            $sku = $this->generateSKU($seller->sellerID, $productData['category']);
            
            Product::create([
                'productName' => $productData['name'],
                'productDescription' => $productData['description'],
                'productPrice' => $productData['price'],
                'productQuantity' => $productData['quantity'] ?? rand(10, 100),
                'status' => $productData['status'] ?? 'in stock',
                'category' => $productData['category'],
                'seller_id' => $seller->sellerID,
                'approval_status' => $productData['approval_status'] ?? 'approved',
                'publish_status' => $productData['publish_status'] ?? 'published',
                'is_featured' => $productData['is_featured'] ?? (rand(0, 1) ? true : false),
                'productImage' => $productData['productImage'] ?? 'products/sample-product-' . rand(1, 10) . '.jpg',
                'sku' => $sku, // Add unique SKU
                'created_at' => Carbon::now()->subDays(rand(1, 90)),
                'updated_at' => Carbon::now()->subDays(rand(1, 30)),
            ]);
            
            $this->command->info("  ✓ Created product: {$productData['name']} (SKU: {$sku})");
        }
    }

    /**
     * Get all product data - EDIT THIS SECTION TO MODIFY PRODUCTS
     * You can easily add, remove, or modify products here
     */
    private function getProductData()
    {
        return [
            // ===== JEWELRY CATEGORY =====
            [
                'name' => 'Handcrafted Silver Ring',
                'description' => 'Beautiful handcrafted silver ring with intricate design',
                'price' => 89.99,
                'category' => 'Jewelry',
                'quantity' => 25,
                'status' => 'in stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Beaded Necklace Set',
                'description' => 'Elegant beaded necklace set with matching earrings',
                'price' => 65.50,
                'category' => 'Jewelry',
                'quantity' => 15,
                'status' => 'in stock',
            ],
            [
                'name' => 'Wooden Pendant',
                'description' => 'Unique wooden pendant with natural finish',
                'price' => 45.00,
                'category' => 'Jewelry',
                'quantity' => 30,
                'status' => 'in stock',
            ],
            [
                'name' => 'Gemstone Bracelet',
                'description' => 'Hand-woven bracelet with natural gemstones',
                'price' => 78.25,
                'category' => 'Jewelry',
                'quantity' => 20,
                'status' => 'in stock',
            ],
            [
                'name' => 'Artisan Earrings',
                'description' => 'Handmade earrings with vintage style',
                'price' => 55.75,
                'category' => 'Jewelry',
                'quantity' => 35,
                'status' => 'in stock',
            ],

            // ===== POTTERY & CERAMICS CATEGORY =====
            [
                'name' => 'Hand-thrown Ceramic Bowl',
                'description' => 'Beautiful hand-thrown ceramic bowl perfect for serving',
                'price' => 125.00,
                'category' => 'Pottery',
                'quantity' => 12,
                'status' => 'in stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Decorative Vase',
                'description' => 'Elegant decorative vase with unique glaze',
                'price' => 95.50,
                'category' => 'Pottery',
                'quantity' => 8,
                'status' => 'in stock',
            ],
            [
                'name' => 'Coffee Mug Set',
                'description' => 'Set of 4 handcrafted coffee mugs',
                'price' => 85.00,
                'category' => 'Pottery',
                'quantity' => 15,
                'status' => 'in stock',
            ],
            [
                'name' => 'Ceramic Plate Collection',
                'description' => 'Set of decorative ceramic plates',
                'price' => 110.25,
                'category' => 'Pottery',
                'quantity' => 10,
                'status' => 'in stock',
            ],
            [
                'name' => 'Artisan Teapot',
                'description' => 'Handcrafted teapot with traditional design',
                'price' => 145.75,
                'category' => 'Pottery',
                'quantity' => 5,
                'status' => 'low stock',
            ],

            // ===== TEXTILES & CRAFTS CATEGORY =====
            [
                'name' => 'Handwoven Scarf',
                'description' => 'Luxurious handwoven scarf with natural fibers',
                'price' => 75.00,
                'category' => 'Textiles',
                'quantity' => 18,
                'status' => 'in stock',
            ],
            [
                'name' => 'Embroidered Pillow',
                'description' => 'Beautiful embroidered decorative pillow',
                'price' => 95.00,
                'category' => 'Textiles',
                'quantity' => 22,
                'status' => 'in stock',
            ],
            [
                'name' => 'Quilted Blanket',
                'description' => 'Hand-stitched quilted blanket',
                'price' => 180.50,
                'category' => 'Textiles',
                'quantity' => 6,
                'status' => 'in stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Woven Wall Hanging',
                'description' => 'Decorative woven wall hanging',
                'price' => 125.25,
                'category' => 'Textiles',
                'quantity' => 14,
                'status' => 'in stock',
            ],
            [
                'name' => 'Hand-knitted Shawl',
                'description' => 'Elegant hand-knitted shawl',
                'price' => 105.75,
                'category' => 'Textiles',
                'quantity' => 9,
                'status' => 'in stock',
            ],

            // ===== WOODWORKING CATEGORY =====
            [
                'name' => 'Hand-carved Wooden Bowl',
                'description' => 'Beautiful hand-carved wooden bowl',
                'price' => 155.00,
                'category' => 'Woodworking',
                'quantity' => 7,
                'status' => 'in stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Custom Cutting Board',
                'description' => 'Premium custom cutting board',
                'price' => 85.50,
                'category' => 'Woodworking',
                'quantity' => 20,
                'status' => 'in stock',
            ],
            [
                'name' => 'Wooden Wall Art',
                'description' => 'Intricate wooden wall art piece',
                'price' => 225.00,
                'category' => 'Woodworking',
                'quantity' => 4,
                'status' => 'in stock',
            ],
            [
                'name' => 'Handcrafted Coaster Set',
                'description' => 'Set of handcrafted wooden coasters',
                'price' => 45.25,
                'category' => 'Woodworking',
                'quantity' => 25,
                'status' => 'in stock',
            ],
            [
                'name' => 'Custom Wooden Box',
                'description' => 'Beautiful custom wooden storage box',
                'price' => 135.75,
                'category' => 'Woodworking',
                'quantity' => 11,
                'status' => 'in stock',
            ],

            // ===== ART & PAINTINGS CATEGORY =====
            [
                'name' => 'Original Watercolor Painting',
                'description' => 'Original watercolor painting on canvas',
                'price' => 250.00,
                'category' => 'Art',
                'quantity' => 3,
                'status' => 'in stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Acrylic Landscape Art',
                'description' => 'Beautiful acrylic landscape painting',
                'price' => 195.50,
                'category' => 'Art',
                'quantity' => 5,
                'status' => 'in stock',
            ],
            [
                'name' => 'Abstract Art Print',
                'description' => 'Limited edition abstract art print',
                'price' => 75.00,
                'category' => 'Art',
                'quantity' => 15,
                'status' => 'in stock',
            ],
            [
                'name' => 'Hand-painted Ceramic Tile',
                'description' => 'Decorative hand-painted ceramic tile',
                'price' => 35.25,
                'category' => 'Art',
                'quantity' => 30,
                'status' => 'in stock',
            ],
            [
                'name' => 'Mixed Media Artwork',
                'description' => 'Unique mixed media artwork',
                'price' => 175.75,
                'category' => 'Art',
                'quantity' => 8,
                'status' => 'in stock',
            ],

            // ===== LEATHER GOODS CATEGORY =====
            [
                'name' => 'Handcrafted Leather Wallet',
                'description' => 'Premium handcrafted leather wallet',
                'price' => 125.00,
                'category' => 'Leather',
                'quantity' => 16,
                'status' => 'in stock',
            ],
            [
                'name' => 'Custom Leather Belt',
                'description' => 'Hand-tooled leather belt',
                'price' => 95.50,
                'category' => 'Leather',
                'quantity' => 20,
                'status' => 'in stock',
            ],
            [
                'name' => 'Leather Journal Cover',
                'description' => 'Beautiful leather journal cover',
                'price' => 85.00,
                'category' => 'Leather',
                'quantity' => 12,
                'status' => 'in stock',
            ],
            [
                'name' => 'Handbag',
                'description' => 'Elegant handmade leather handbag',
                'price' => 245.25,
                'category' => 'Leather',
                'quantity' => 6,
                'status' => 'in stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Leather Keychain',
                'description' => 'Hand-tooled leather keychain',
                'price' => 25.75,
                'category' => 'Leather',
                'quantity' => 40,
                'status' => 'in stock',
            ],

            // ===== CANDLES & SOAPS CATEGORY =====
            [
                'name' => 'Soy Candle Collection',
                'description' => 'Hand-poured soy candle collection',
                'price' => 65.00,
                'category' => 'Candles',
                'quantity' => 25,
                'status' => 'in stock',
            ],
            [
                'name' => 'Artisan Soap Set',
                'description' => 'Handmade artisan soap set',
                'price' => 45.50,
                'category' => 'Candles',
                'quantity' => 30,
                'status' => 'in stock',
            ],
            [
                'name' => 'Essential Oil Candles',
                'description' => 'Aromatherapy candles with essential oils',
                'price' => 55.25,
                'category' => 'Candles',
                'quantity' => 20,
                'status' => 'in stock',
            ],
            [
                'name' => 'Bath Bomb Collection',
                'description' => 'Luxurious bath bomb collection',
                'price' => 35.00,
                'category' => 'Candles',
                'quantity' => 35,
                'status' => 'in stock',
            ],
            [
                'name' => 'Wax Melts Set',
                'description' => 'Hand-poured wax melts in various scents',
                'price' => 28.75,
                'category' => 'Candles',
                'quantity' => 40,
                'status' => 'in stock',
            ],

            // ===== HOME DECOR CATEGORY =====
            [
                'name' => 'Decorative Wall Mirror',
                'description' => 'Handcrafted decorative wall mirror',
                'price' => 165.50,
                'category' => 'Home Decor',
                'quantity' => 8,
                'status' => 'in stock',
            ],
            [
                'name' => 'Ceramic Planter Set',
                'description' => 'Set of decorative ceramic planters',
                'price' => 85.25,
                'category' => 'Home Decor',
                'quantity' => 15,
                'status' => 'in stock',
            ],
            [
                'name' => 'Woven Throw Pillow',
                'description' => 'Colorful woven throw pillow',
                'price' => 45.75,
                'category' => 'Home Decor',
                'quantity' => 22,
                'status' => 'in stock',
            ],
            [
                'name' => 'Wooden Bookend Set',
                'description' => 'Hand-carved wooden bookends',
                'price' => 65.00,
                'category' => 'Home Decor',
                'quantity' => 18,
                'status' => 'in stock',
            ],
            [
                'name' => 'Metal Wall Sculpture',
                'description' => 'Abstract metal wall sculpture',
                'price' => 125.50,
                'category' => 'Home Decor',
                'quantity' => 6,
                'status' => 'in stock',
            ],

            // ===== ACCESSORIES CATEGORY =====
            [
                'name' => 'Handwoven Tote Bag',
                'description' => 'Eco-friendly handwoven tote bag',
                'price' => 65.50,
                'category' => 'Accessories',
                'quantity' => 20,
                'status' => 'in stock',
            ],
            [
                'name' => 'Leather Hair Accessory',
                'description' => 'Handmade leather hair accessory',
                'price' => 35.25,
                'category' => 'Accessories',
                'quantity' => 30,
                'status' => 'in stock',
            ],
            [
                'name' => 'Beaded Anklet',
                'description' => 'Delicate beaded ankle bracelet',
                'price' => 25.75,
                'category' => 'Accessories',
                'quantity' => 35,
                'status' => 'in stock',
            ],
            [
                'name' => 'Macrame Purse',
                'description' => 'Handmade macrame purse',
                'price' => 85.00,
                'category' => 'Accessories',
                'quantity' => 12,
                'status' => 'in stock',
            ],
            [
                'name' => 'Fabric Hair Scarf',
                'description' => 'Colorful fabric hair scarf',
                'price' => 28.50,
                'category' => 'Accessories',
                'quantity' => 25,
                'status' => 'in stock',
            ],

            // ===== OUT OF STOCK EXAMPLES =====
            [
                'name' => 'Limited Edition Art Print',
                'description' => 'Exclusive limited edition art print - sold out',
                'price' => 150.00,
                'category' => 'Art',
                'quantity' => 0,
                'status' => 'out of stock',
            ],
            [
                'name' => 'Vintage Ceramic Vase',
                'description' => 'Rare vintage ceramic vase - currently unavailable',
                'price' => 200.00,
                'category' => 'Pottery',
                'quantity' => 0,
                'status' => 'out of stock',
            ],
        ];
    }

    /**
     * Generate unique SKU for product
     * Format: CC-S{SELLER_ID}-{CATEGORY}-{RANDOM}
     * Example: CC-S01-JEWE-A1B2C3
     */
    private function generateSKU($sellerId, $category)
    {
        $categoryCode = strtoupper(substr($category, 0, 4));
        $sellerCode = 'S' . str_pad($sellerId, 2, '0', STR_PAD_LEFT);
        $random = strtoupper(substr(md5(uniqid()), 0, 6));
        
        $sku = "CC-{$sellerCode}-{$categoryCode}-{$random}";
        
        // Ensure SKU is unique (check database)
        while (Product::where('sku', $sku)->exists()) {
            $random = strtoupper(substr(md5(uniqid()), 0, 6));
            $sku = "CC-{$sellerCode}-{$categoryCode}-{$random}";
        }
        
        return $sku;
    }
}

