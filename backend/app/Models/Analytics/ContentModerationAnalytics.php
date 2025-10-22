<?php

namespace App\Models\Analytics;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ContentModerationAnalytics extends Model
{
    use HasFactory;

    protected $table = 'content_moderation_analytics';

    protected $fillable = [
        'date',
        'period_type',
        'products_pending_approval',
        'products_approved',
        'products_rejected',
        'reviews_flagged',
        'reviews_approved',
        'reviews_removed',
        'users_suspended',
        'users_reactivated',
        'approval_rate',
        'rejection_rate',
    ];

    protected $casts = [
        'date' => 'date',
        'approval_rate' => 'decimal:2',
        'rejection_rate' => 'decimal:2',
    ];

    /**
     * Get content moderation analytics data for a specific period
     */
    public static function getModerationData($periodType = 'monthly', $startDate = null, $endDate = null)
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
     * Get content moderation statistics
     */
    public static function getModerationStatistics($periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        $data = $query->selectRaw('
            SUM(products_pending_approval) as pending_products,
            SUM(products_approved) as approved_products,
            SUM(products_rejected) as rejected_products,
            SUM(reviews_flagged) as flagged_reviews,
            SUM(reviews_approved) as approved_reviews,
            SUM(reviews_removed) as removed_reviews,
            SUM(users_suspended) as suspended_users,
            SUM(users_reactivated) as reactivated_users,
            AVG(approval_rate) as avg_approval_rate,
            AVG(rejection_rate) as avg_rejection_rate
        ')->first();
        
        $totalProducts = ($data->approved_products ?? 0) + ($data->rejected_products ?? 0);
        $totalReviews = ($data->approved_reviews ?? 0) + ($data->removed_reviews ?? 0);
        
        return [
            'products' => [
                'pending' => $data->pending_products ?? 0,
                'approved' => $data->approved_products ?? 0,
                'rejected' => $data->rejected_products ?? 0,
                'total_processed' => $totalProducts,
                'approval_rate' => $totalProducts > 0 ? (($data->approved_products ?? 0) / $totalProducts) * 100 : 0,
                'rejection_rate' => $totalProducts > 0 ? (($data->rejected_products ?? 0) / $totalProducts) * 100 : 0,
            ],
            'reviews' => [
                'flagged' => $data->flagged_reviews ?? 0,
                'approved' => $data->approved_reviews ?? 0,
                'removed' => $data->removed_reviews ?? 0,
                'total_processed' => $totalReviews,
                'approval_rate' => $totalReviews > 0 ? (($data->approved_reviews ?? 0) / $totalReviews) * 100 : 0,
                'removal_rate' => $totalReviews > 0 ? (($data->removed_reviews ?? 0) / $totalReviews) * 100 : 0,
            ],
            'users' => [
                'suspended' => $data->suspended_users ?? 0,
                'reactivated' => $data->reactivated_users ?? 0,
            ],
            'overall' => [
                'avg_approval_rate' => $data->avg_approval_rate ?? 0,
                'avg_rejection_rate' => $data->avg_rejection_rate ?? 0,
            ]
        ];
    }

    /**
     * Get approval rate trend
     */
    public static function getApprovalRateTrend($periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->select('date', 'approval_rate', 'rejection_rate')
            ->orderBy('date', 'asc')
            ->get();
    }
}
