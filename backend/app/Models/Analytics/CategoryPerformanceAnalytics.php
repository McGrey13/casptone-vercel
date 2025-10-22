<?php

namespace App\Models\Analytics;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CategoryPerformanceAnalytics extends Model
{
    use HasFactory;

    protected $table = 'category_performance_analytics';

    protected $fillable = [
        'date',
        'period_type',
        'category',
        'total_sellers',
        'total_products',
        'total_revenue',
        'total_orders',
        'average_rating',
        'total_reviews',
        'average_price',
        'market_share_percentage',
        'growth_rate',
        'top_seller_count'
    ];

    protected $casts = [
        'date' => 'date',
        'total_revenue' => 'decimal:2',
        'average_rating' => 'decimal:2',
        'average_price' => 'decimal:2',
        'market_share_percentage' => 'decimal:2',
        'growth_rate' => 'decimal:2',
    ];

    /**
     * Get category performance comparison
     */
    public static function getCategoryComparison($periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->selectRaw('category, SUM(total_revenue) as total_revenue, SUM(total_orders) as total_orders, AVG(average_rating) as avg_rating, SUM(total_sellers) as total_sellers, SUM(total_products) as total_products')
            ->groupBy('category')
            ->orderBy('total_revenue', 'desc')
            ->get();
    }

    /**
     * Get category trends over time
     */
    public static function getCategoryTrends($category = null, $periodType = 'monthly', $startDate = null, $endDate = null)
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
        
        return $query->orderBy('date', 'asc')->get();
    }

    /**
     * Get top performing categories
     */
    public static function getTopCategories($periodType = 'monthly', $startDate = null, $endDate = null, $limit = 10)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->selectRaw('category, SUM(total_revenue) as total_revenue, SUM(total_orders) as total_orders, AVG(average_rating) as avg_rating, SUM(total_sellers) as total_sellers')
            ->groupBy('category')
            ->orderBy('total_revenue', 'desc')
            ->limit($limit)
            ->get();
    }
}

