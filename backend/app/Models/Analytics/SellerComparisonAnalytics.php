<?php

namespace App\Models\Analytics;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Seller;
use App\Models\Product;

class SellerComparisonAnalytics extends Model
{
    use HasFactory;

    protected $table = 'seller_comparison_analytics';

    protected $fillable = [
        'date',
        'period_type',
        'product_id',
        'product_name',
        'category',
        'seller_id',
        'seller_name',
        'total_revenue',
        'total_orders',
        'total_quantity_sold',
        'average_price',
        'average_rating',
        'total_reviews',
        'market_share_percentage',
        'revenue_rank',
        'orders_rank',
        'rating_rank',
        'growth_rate',
        'previous_period_revenue',
        'is_top_seller',
        'competitor_count'
    ];

    protected $casts = [
        'date' => 'date',
        'total_revenue' => 'decimal:2',
        'average_price' => 'decimal:2',
        'average_rating' => 'decimal:2',
        'market_share_percentage' => 'decimal:2',
        'growth_rate' => 'decimal:2',
        'previous_period_revenue' => 'decimal:2',
        'is_top_seller' => 'boolean',
    ];

    /**
     * Get the seller
     */
    public function seller()
    {
        return $this->belongsTo(Seller::class, 'seller_id', 'sellerID');
    }

    /**
     * Get the product
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    /**
     * Get seller comparison for specific product
     */
    public static function getProductComparison($productId, $periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::with('seller')
            ->where('product_id', $productId)
            ->where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->orderBy('total_revenue', 'desc')->get();
    }

    /**
     * Get category comparison across sellers
     */
    public static function getCategoryComparison($category, $periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::with('seller')
            ->where('category', $category)
            ->where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->selectRaw('seller_id, seller_name, SUM(total_revenue) as total_revenue, SUM(total_orders) as total_orders, AVG(average_rating) as avg_rating, COUNT(DISTINCT product_id) as product_count')
            ->groupBy('seller_id', 'seller_name')
            ->orderBy('total_revenue', 'desc')
            ->get();
    }

    /**
     * Get top performing sellers by category
     */
    public static function getTopSellersByCategory($category = null, $periodType = 'monthly', $startDate = null, $endDate = null, $limit = 10)
    {
        $query = self::with('seller');
        
        if ($category) {
            $query->where('category', $category);
        }
        
        $query->where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->selectRaw('seller_id, seller_name, category, SUM(total_revenue) as total_revenue, SUM(total_orders) as total_orders, AVG(average_rating) as avg_rating, COUNT(DISTINCT product_id) as unique_products')
            ->groupBy('seller_id', 'seller_name', 'category')
            ->orderBy('total_revenue', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get market share analysis
     */
    public static function getMarketShareAnalysis($category = null, $periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($category) {
            $query->where('category', $category);
        }
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        $totalRevenue = $query->sum('total_revenue');
        
        return $query->selectRaw('seller_id, seller_name, SUM(total_revenue) as seller_revenue, (SUM(total_revenue) / ?) * 100 as market_share_percentage', [$totalRevenue])
            ->groupBy('seller_id', 'seller_name')
            ->orderBy('market_share_percentage', 'desc')
            ->get();
    }

    /**
     * Get competitive analysis for specific seller
     */
    public static function getCompetitiveAnalysis($sellerId, $periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        // Get seller's performance
        $sellerPerformance = $query->where('seller_id', $sellerId)
            ->selectRaw('category, SUM(total_revenue) as revenue, SUM(total_orders) as orders, AVG(average_rating) as rating, COUNT(DISTINCT product_id) as products')
            ->groupBy('category')
            ->get();
        
        // Get competitors' performance by category
        $competitorPerformance = [];
        foreach ($sellerPerformance as $performance) {
            $competitors = $query->where('category', $performance->category)
                ->where('seller_id', '!=', $sellerId)
                ->selectRaw('seller_id, seller_name, SUM(total_revenue) as revenue, SUM(total_orders) as orders, AVG(average_rating) as rating')
                ->groupBy('seller_id', 'seller_name')
                ->orderBy('revenue', 'desc')
                ->limit(5)
                ->get();
            
            $competitorPerformance[$performance->category] = $competitors;
        }
        
        return [
            'seller_performance' => $sellerPerformance,
            'competitor_performance' => $competitorPerformance
        ];
    }
}

