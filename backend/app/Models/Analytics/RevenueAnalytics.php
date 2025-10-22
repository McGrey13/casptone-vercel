<?php

namespace App\Models\Analytics;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RevenueAnalytics extends Model
{
    use HasFactory;

    protected $table = 'revenue_analytics';

    protected $fillable = [
        'date',
        'period_type',
        'total_revenue',
        'platform_commission',
        'payment_processing_fees',
        'total_orders',
        'average_order_value',
    ];

    protected $casts = [
        'date' => 'date',
        'total_revenue' => 'decimal:2',
        'platform_commission' => 'decimal:2',
        'payment_processing_fees' => 'decimal:2',
        'average_order_value' => 'decimal:2',
    ];

    /**
     * Get revenue data for a specific period
     */
    public static function getRevenueData($periodType = 'monthly', $startDate = null, $endDate = null)
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
     * Get total revenue for a period
     */
    public static function getTotalRevenue($periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->sum('total_revenue');
    }

    /**
     * Get revenue growth rate
     */
    public static function getRevenueGrowthRate($periodType = 'monthly', $currentPeriod = null, $previousPeriod = null)
    {
        if (!$currentPeriod) {
            $currentPeriod = self::getTotalRevenue($periodType);
        }
        
        if (!$previousPeriod) {
            $previousPeriod = self::getTotalRevenue($periodType, 
                now()->subMonth()->startOfMonth(), 
                now()->subMonth()->endOfMonth()
            );
        }
        
        if ($previousPeriod == 0) {
            return 0;
        }
        
        return (($currentPeriod - $previousPeriod) / $previousPeriod) * 100;
    }
}
