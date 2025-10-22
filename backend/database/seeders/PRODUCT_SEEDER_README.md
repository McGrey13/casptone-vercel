# Product Seeder - How to Edit Products

## Overview
The `ProductSeeder.php` file contains all the product data that gets seeded into your database. This file is designed to be easily editable so you can customize the products for your application.

## How to Edit Products

### 1. Open the ProductSeeder File
Navigate to: `backend/database/seeders/ProductSeeder.php`

### 2. Find the Product Data
Look for the `getProductData()` method around line 100. This method returns an array of all products.

### 3. Edit Product Information
Each product is defined as an array with the following properties:

```php
[
    'name' => 'Product Name',                    // Product name
    'description' => 'Product description',      // Product description
    'price' => 99.99,                           // Product price (decimal)
    'category' => 'Category Name',              // Product category
    'quantity' => 25,                           // Stock quantity (optional)
    'status' => 'in stock',                     // Stock status (optional)
    'is_featured' => true,                      // Featured product (optional)
    'approval_status' => 'approved',            // Approval status (optional)
    'publish_status' => 'published',            // Publish status (optional)
    'productImage' => 'path/to/image.jpg',      // Product image (optional)
]
```

### 4. Add New Products
To add a new product, simply add a new array to the `getProductData()` method:

```php
[
    'name' => 'My New Product',
    'description' => 'This is my new amazing product',
    'price' => 75.50,
    'category' => 'My Category',
    'quantity' => 20,
    'status' => 'in stock',
    'is_featured' => false,
],
```

### 5. Remove Products
To remove a product, simply delete its array from the `getProductData()` method.

### 6. Modify Existing Products
To modify an existing product, find its array and change the values you want to update.

## Available Categories
The seeder includes products in these categories:
- Jewelry
- Pottery
- Textiles
- Woodworking
- Art
- Leather
- Candles
- Home Decor
- Accessories

You can add new categories by simply using a new category name in the product data.

## Stock Status Options
- `'in stock'` - Product is available
- `'low stock'` - Product has low quantity
- `'out of stock'` - Product is not available

## Running the Seeder

### Run Only the Product Seeder
```bash
cd backend
php artisan db:seed --class=ProductSeeder
```

### Run All Seeders (including products)
```bash
cd backend
php artisan db:seed
```

### Clear and Re-seed Products
If you want to clear existing products and add new ones, uncomment this line in the `run()` method:
```php
Product::truncate();
```

## Notes
- Products are randomly distributed among sellers (8-12 products per seller)
- Each seller gets a different random selection of products
- The seeder checks for existing products to avoid duplicates
- Product images are set to sample images by default
- Created and updated timestamps are randomized for realistic data

## Troubleshooting
- Make sure sellers exist before running the product seeder
- Check that the database connection is working
- Verify that the products table exists and has the correct structure
- If you get errors, check the Laravel logs in `storage/logs/`

