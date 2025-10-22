<?php

namespace App\Models\Analytics;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductAnalytics extends Model
{
    use HasFactory;

    protected $table = 'product_analytics';

    protected $fillable = [
        'date',
        'period_type',
        'total_products',
        'active_products',
        'inactive_products',
        'out_of_stock_products',
        'low_stock_products',
        'featured_products',
        'products_with_images',
        'products_with_videos',
        'products_without_images',
        'average_product_rating',
    ];

    protected $casts = [
        'date' => 'date',
        'average_product_rating' => 'decimal:2',
    ];

    /**
     * Get product analytics data for a specific period
     */
    public static function getProductData($periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->orderBy('date', 'desc')->get();
    }

    /**
     * Get product image quality metrics
     */
    public static function getProductImageQualityMetrics($periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        $data = $query->selectRaw('
            SUM(total_products) as total,
            SUM(products_with_images) as with_images,
            SUM(products_with_videos) as with_videos,
            SUM(products_without_images) as without_images
        ')->first();
        
        $total = $data->total ?? 0;
        
        return [
            'total_products' => $total,
            'products_with_images' => $data->with_images ?? 0,
            'products_with_videos' => $data->with_videos ?? 0,
            'products_without_images' => $data->without_images ?? 0,
            'image_coverage_percentage' => $total > 0 ? (($data->with_images ?? 0) / $total) * 100 : 0,
            'video_coverage_percentage' => $total > 0 ? (($data->with_videos ?? 0) / $total) * 100 : 0,
            'missing_images_percentage' => $total > 0 ? (($data->without_images ?? 0) / $total) * 100 : 0,
        ];
    }

    /**
     * Get product status distribution
     */
    public static function getProductStatusDistribution($periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        $data = $query->selectRaw('
            SUM(total_products) as total,
            SUM(active_products) as active,
            SUM(inactive_products) as inactive,
            SUM(out_of_stock_products) as out_of_stock,
            SUM(low_stock_products) as low_stock,
            SUM(featured_products) as featured
        ')->first();
        
        $total = $data->total ?? 0;
        
        return [
            'total' => $total,
            'active' => $data->active ?? 0,
            'inactive' => $data->inactive ?? 0,
            'out_of_stock' => $data->out_of_stock ?? 0,
            'low_stock' => $data->low_stock ?? 0,
            'featured' => $data->featured ?? 0,
            'active_percentage' => $total > 0 ? (($data->active ?? 0) / $total) * 100 : 0,
            'inactive_percentage' => $total > 0 ? (($data->inactive ?? 0) / $total) * 100 : 0,
            'out_of_stock_percentage' => $total > 0 ? (($data->out_of_stock ?? 0) / $total) * 100 : 0,
            'low_stock_percentage' => $total > 0 ? (($data->low_stock ?? 0) / $total) * 100 : 0,
            'featured_percentage' => $total > 0 ? (($data->featured ?? 0) / $total) * 100 : 0,
        ];
    }

    /**
     * Get average product rating
     */
    public static function getAverageProductRating($periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->avg('average_product_rating');
    }
}
