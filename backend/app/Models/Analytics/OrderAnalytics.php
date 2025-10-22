<?php

namespace App\Models\Analytics;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderAnalytics extends Model
{
    use HasFactory;

    protected $table = 'order_analytics';

    protected $fillable = [
        'date',
        'period_type',
        'total_orders',
        'completed_orders',
        'cancelled_orders',
        'refunded_orders',
        'pending_orders',
        'processing_orders',
        'shipped_orders',
        'completion_rate',
        'cancellation_rate',
        'refund_rate',
        'average_order_value',
    ];

    protected $casts = [
        'date' => 'date',
        'completion_rate' => 'decimal:2',
        'cancellation_rate' => 'decimal:2',
        'refund_rate' => 'decimal:2',
        'average_order_value' => 'decimal:2',
    ];

    /**
     * Get order analytics data for a specific period
     */
    public static function getOrderData($periodType = 'monthly', $startDate = null, $endDate = null)
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
     * Get total orders for a period
     */
    public static function getTotalOrders($periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->sum('total_orders');
    }

    /**
     * Get order completion rate
     */
    public static function getCompletionRate($periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        $data = $query->selectRaw('SUM(total_orders) as total, SUM(completed_orders) as completed')->first();
        
        if ($data && $data->total > 0) {
            return ($data->completed / $data->total) * 100;
        }
        
        return 0;
    }

    /**
     * Get average order value
     */
    public static function getAverageOrderValue($periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->avg('average_order_value');
    }

    /**
     * Get order status distribution
     */
    public static function getOrderStatusDistribution($periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        $data = $query->selectRaw('
            SUM(total_orders) as total,
            SUM(completed_orders) as completed,
            SUM(cancelled_orders) as cancelled,
            SUM(refunded_orders) as refunded,
            SUM(pending_orders) as pending,
            SUM(processing_orders) as processing,
            SUM(shipped_orders) as shipped
        ')->first();
        
        return [
            'total' => $data->total ?? 0,
            'completed' => $data->completed ?? 0,
            'cancelled' => $data->cancelled ?? 0,
            'refunded' => $data->refunded ?? 0,
            'pending' => $data->pending ?? 0,
            'processing' => $data->processing ?? 0,
            'shipped' => $data->shipped ?? 0,
        ];
    }
}
