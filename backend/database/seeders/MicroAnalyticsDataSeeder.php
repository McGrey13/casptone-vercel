<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Analytics\MostSellingProductAnalytics;
use App\Models\Analytics\HighestSalesSellerAnalytics;
use App\Models\Product;
use App\Models\Seller;
use App\Models\Order;
use App\Models\OrderProduct;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class MicroAnalyticsDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "Starting fast micro analytics data generation...\n";
        
        // Clear existing data first
        MostSellingProductAnalytics::truncate();
        HighestSalesSellerAnalytics::truncate();
        
        $this->seedMostSellingProductAnalytics();
        $this->seedHighestSalesSellerAnalytics();
        
        echo "Micro analytics data generation completed!\n";
    }

    private function seedMostSellingProductAnalytics()
    {
        echo "Generating most selling product analytics...\n";
        
        // Generate monthly data using fast SQL queries
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $startDate = $date->copy()->startOfMonth();
            $endDate = $date->copy()->endOfMonth();
            $monthYear = $date->format('Y-m');
            
            echo "Processing month: {$monthYear}\n";
            
            // Use raw SQL for much faster performance - Include ALL products
            $monthlyData = DB::select("
                SELECT 
                    p.product_id,
                    p.productName,
                    p.category,
                    p.seller_id,
                    u.userName as seller_name,
                    COUNT(DISTINCT o.orderID) as total_orders,
                    COALESCE(SUM(op.quantity), 0) as total_quantity_sold,
                    COALESCE(SUM(op.quantity * op.price), 0) as total_revenue,
                    COALESCE(AVG(r.rating), 0) as average_rating,
                    COUNT(DISTINCT r.review_id) as total_reviews
                FROM products p
                LEFT JOIN sellers s ON p.seller_id = s.sellerID
                LEFT JOIN users u ON s.user_id = u.userID
                LEFT JOIN order_products op ON p.product_id = op.product_id
                LEFT JOIN orders o ON op.order_id = o.orderID AND o.created_at BETWEEN ? AND ?
                LEFT JOIN reviews r ON p.product_id = r.product_id
                WHERE p.product_id IS NOT NULL
                GROUP BY p.product_id, p.productName, p.category, p.seller_id, seller_name
                ORDER BY total_quantity_sold DESC, total_revenue DESC
            ", [$startDate, $endDate]);
            
            // Batch insert for speed (chunked to save memory)
            $records = [];
            foreach ($monthlyData as $data) {
                $records[] = [
                    'date' => $startDate->format('Y-m-d'),
                    'period_type' => 'monthly',
                    'product_id' => $data->product_id,
                    'product_name' => $data->productName,
                    'seller_id' => $data->seller_id,
                    'seller_name' => $data->seller_name,
                    'category' => $data->category,
                    'total_orders' => $data->total_orders,
                    'total_quantity_sold' => $data->total_quantity_sold,
                    'total_revenue' => $data->total_revenue,
                    'average_rating' => round($data->average_rating, 2),
                    'total_reviews' => $data->total_reviews,
                    'month_year' => $monthYear,
                    'year' => $date->year,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                
                // Insert in chunks of 1000 to save memory
                if (count($records) >= 1000) {
                    DB::table('most_selling_product_analytics')->insert($records);
                    $records = [];
                }
            }
            
            if (!empty($records)) {
                DB::table('most_selling_product_analytics')->insert($records);
            }
        }
        
        // Generate yearly data
        for ($i = 2; $i >= 0; $i--) {
            $year = Carbon::now()->subYears($i)->year;
            $startDate = Carbon::createFromDate($year, 1, 1);
            $endDate = Carbon::createFromDate($year, 12, 31);
            
            echo "Processing year: {$year}\n";
            
            $yearlyData = DB::select("
                SELECT 
                    p.product_id,
                    p.productName,
                    p.category,
                    p.seller_id,
                    u.userName as seller_name,
                    COUNT(DISTINCT o.orderID) as total_orders,
                    COALESCE(SUM(op.quantity), 0) as total_quantity_sold,
                    COALESCE(SUM(op.quantity * op.price), 0) as total_revenue,
                    COALESCE(AVG(r.rating), 0) as average_rating,
                    COUNT(DISTINCT r.review_id) as total_reviews
                FROM products p
                LEFT JOIN sellers s ON p.seller_id = s.sellerID
                LEFT JOIN users u ON s.user_id = u.userID
                LEFT JOIN order_products op ON p.product_id = op.product_id
                LEFT JOIN orders o ON op.order_id = o.orderID AND YEAR(o.created_at) = ?
                LEFT JOIN reviews r ON p.product_id = r.product_id
                WHERE p.product_id IS NOT NULL
                GROUP BY p.product_id, p.productName, p.category, p.seller_id, seller_name
                ORDER BY total_quantity_sold DESC, total_revenue DESC
            ", [$year]);
            
            $records = [];
            foreach ($yearlyData as $data) {
                $records[] = [
                    'date' => $startDate->format('Y-m-d'),
                    'period_type' => 'yearly',
                    'product_id' => $data->product_id,
                    'product_name' => $data->productName,
                    'seller_id' => $data->seller_id,
                    'seller_name' => $data->seller_name,
                    'category' => $data->category,
                    'total_orders' => $data->total_orders,
                    'total_quantity_sold' => $data->total_quantity_sold,
                    'total_revenue' => $data->total_revenue,
                    'average_rating' => round($data->average_rating, 2),
                    'total_reviews' => $data->total_reviews,
                    'month_year' => $year,
                    'year' => $year,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            
            if (!empty($records)) {
                DB::table('most_selling_product_analytics')->insert($records);
            }
        }
    }

    private function seedHighestSalesSellerAnalytics()
    {
        echo "Generating highest sales seller analytics...\n";
        
        // Generate monthly data using fast SQL queries
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $startDate = $date->copy()->startOfMonth();
            $endDate = $date->copy()->endOfMonth();
            $monthYear = $date->format('Y-m');
            
            echo "Processing month: {$monthYear}\n";
            
            $monthlyData = DB::select("
                SELECT 
                    s.sellerID,
                    u.userName as seller_name,
                    COALESCE(s.businessName, 'Unknown Business') as business_name,
                    COUNT(DISTINCT o.orderID) as total_orders,
                    COALESCE(SUM(op.quantity), 0) as total_products_sold,
                    COALESCE(SUM(op.quantity * op.price), 0) as total_revenue,
                    COUNT(DISTINCT p.product_id) as unique_products,
                    CASE 
                        WHEN COUNT(DISTINCT o.orderID) > 0 
                        THEN COALESCE(SUM(op.quantity * op.price), 0) / COUNT(DISTINCT o.orderID)
                        ELSE 0 
                    END as average_order_value,
                    CASE 
                        WHEN COUNT(DISTINCT o.orderID) > 0 
                        THEN (COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.orderID END) * 100.0 / COUNT(DISTINCT o.orderID))
                        ELSE 0 
                    END as completion_rate,
                    COALESCE(AVG(p.average_rating), 0) as average_rating,
                    COUNT(DISTINCT r.review_id) as total_reviews,
                    (SELECT p2.category 
                     FROM products p2 
                     WHERE p2.seller_id = s.sellerID 
                     GROUP BY p2.category 
                     ORDER BY COUNT(*) DESC 
                     LIMIT 1) as top_category
                FROM sellers s
                LEFT JOIN users u ON s.user_id = u.userID
                LEFT JOIN products p ON s.sellerID = p.seller_id
                LEFT JOIN order_products op ON p.product_id = op.product_id
                LEFT JOIN orders o ON op.order_id = o.orderID AND o.created_at BETWEEN ? AND ?
                LEFT JOIN reviews r ON p.product_id = r.product_id
                WHERE s.sellerID IS NOT NULL
                GROUP BY s.sellerID, seller_name, business_name
                ORDER BY total_revenue DESC, total_orders DESC
            ", [$startDate, $endDate]);
            
            $records = [];
            foreach ($monthlyData as $data) {
                $records[] = [
                    'date' => $startDate->format('Y-m-d'),
                        'period_type' => 'monthly',
                    'seller_id' => $data->sellerID,
                    'seller_name' => $data->seller_name,
                    'business_name' => $data->business_name,
                    'total_revenue' => round($data->total_revenue, 2),
                    'total_orders' => $data->total_orders,
                    'total_products_sold' => $data->total_products_sold,
                    'unique_products' => $data->unique_products,
                    'average_order_value' => round($data->average_order_value, 2),
                    'completion_rate' => round($data->completion_rate, 2),
                    'average_rating' => round($data->average_rating, 2),
                    'total_reviews' => $data->total_reviews,
                    'top_category' => $data->top_category ?? 'Unknown',
                    'month_year' => $monthYear,
                    'year' => $date->year,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            
            if (!empty($records)) {
                DB::table('highest_sales_seller_analytics')->insert($records);
            }
        }
        
        // Generate yearly data
        for ($i = 2; $i >= 0; $i--) {
            $year = Carbon::now()->subYears($i)->year;
            $startDate = Carbon::createFromDate($year, 1, 1);
            $endDate = Carbon::createFromDate($year, 12, 31);
            
            echo "Processing year: {$year}\n";
            
            $yearlyData = DB::select("
                SELECT 
                    s.sellerID,
                    u.userName as seller_name,
                    COALESCE(s.businessName, 'Unknown Business') as business_name,
                    COUNT(DISTINCT o.orderID) as total_orders,
                    COALESCE(SUM(op.quantity), 0) as total_products_sold,
                    COALESCE(SUM(op.quantity * op.price), 0) as total_revenue,
                    COUNT(DISTINCT p.product_id) as unique_products,
                    CASE 
                        WHEN COUNT(DISTINCT o.orderID) > 0 
                        THEN COALESCE(SUM(op.quantity * op.price), 0) / COUNT(DISTINCT o.orderID)
                        ELSE 0 
                    END as average_order_value,
                    CASE 
                        WHEN COUNT(DISTINCT o.orderID) > 0 
                        THEN (COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.orderID END) * 100.0 / COUNT(DISTINCT o.orderID))
                        ELSE 0 
                    END as completion_rate,
                    COALESCE(AVG(p.average_rating), 0) as average_rating,
                    COUNT(DISTINCT r.review_id) as total_reviews,
                    (SELECT p2.category 
                     FROM products p2 
                     WHERE p2.seller_id = s.sellerID 
                     GROUP BY p2.category 
                     ORDER BY COUNT(*) DESC 
                     LIMIT 1) as top_category
                FROM sellers s
                LEFT JOIN users u ON s.user_id = u.userID
                LEFT JOIN products p ON s.sellerID = p.seller_id
                LEFT JOIN order_products op ON p.product_id = op.product_id
                LEFT JOIN orders o ON op.order_id = o.orderID AND YEAR(o.created_at) = ?
                LEFT JOIN reviews r ON p.product_id = r.product_id
                WHERE s.sellerID IS NOT NULL
                GROUP BY s.sellerID, seller_name, business_name
                ORDER BY total_revenue DESC, total_orders DESC
            ", [$year]);
            
            $records = [];
            foreach ($yearlyData as $data) {
                $records[] = [
                    'date' => $startDate->format('Y-m-d'),
                    'period_type' => 'yearly',
                    'seller_id' => $data->sellerID,
                    'seller_name' => $data->seller_name,
                    'business_name' => $data->business_name,
                    'total_revenue' => round($data->total_revenue, 2),
                    'total_orders' => $data->total_orders,
                    'total_products_sold' => $data->total_products_sold,
                    'unique_products' => $data->unique_products,
                    'average_order_value' => round($data->average_order_value, 2),
                    'completion_rate' => round($data->completion_rate, 2),
                    'average_rating' => round($data->average_rating, 2),
                    'total_reviews' => $data->total_reviews,
                    'top_category' => $data->top_category ?? 'Unknown',
                    'month_year' => $year,
                    'year' => $year,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            
            if (!empty($records)) {
                DB::table('highest_sales_seller_analytics')->insert($records);
            }
        }
    }
}

