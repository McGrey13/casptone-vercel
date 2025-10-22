<?php

namespace App\Models\Analytics;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Seller;

class SellerRevenueAnalytics extends Model
{
    use HasFactory;

    protected $table = 'seller_revenue_analytics';

    protected $fillable = [
        'seller_id',
        'date',
        'period_type',
        'total_revenue',
        'commission_earned',
        'total_orders',
        'average_order_value',
        'products_sold',
    ];

    protected $casts = [
        'date' => 'date',
        'total_revenue' => 'decimal:2',
        'commission_earned' => 'decimal:2',
        'average_order_value' => 'decimal:2',
    ];

    /**
     * Get the seller that owns the analytics record
     */
    public function seller()
    {
        return $this->belongsTo(Seller::class, 'seller_id', 'sellerID');
    }

    /**
     * Get revenue data for a specific seller
     */
    public static function getSellerRevenueData($sellerId, $periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('seller_id', $sellerId)->where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->orderBy('date', 'desc')->get();
    }

    /**
     * Get top performing sellers by revenue
     */
    public static function getTopSellersByRevenue($periodType = 'monthly', $limit = 10, $startDate = null, $endDate = null)
    {
        $query = self::with('seller')
            ->where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->selectRaw('seller_id, SUM(total_revenue) as total_revenue, SUM(total_orders) as total_orders, SUM(products_sold) as products_sold')
            ->groupBy('seller_id')
            ->orderBy('total_revenue', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get average revenue per seller
     */
    public static function getAverageRevenuePerSeller($periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->avg('total_revenue');
    }
}
