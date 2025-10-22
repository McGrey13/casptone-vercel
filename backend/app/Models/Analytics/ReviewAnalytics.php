<?php

namespace App\Models\Analytics;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ReviewAnalytics extends Model
{
    use HasFactory;

    protected $table = 'review_analytics';

    protected $fillable = [
        'date',
        'period_type',
        'total_reviews',
        'average_rating',
        'five_star_reviews',
        'four_star_reviews',
        'three_star_reviews',
        'two_star_reviews',
        'one_star_reviews',
        'reviews_with_comments',
        'reviews_without_comments',
        'response_rate',
    ];

    protected $casts = [
        'date' => 'date',
        'average_rating' => 'decimal:2',
        'response_rate' => 'decimal:2',
    ];

    /**
     * Get review analytics data for a specific period
     */
    public static function getReviewData($periodType = 'monthly', $startDate = null, $endDate = null)
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
     * Get review score distribution
     */
    public static function getReviewScoreDistribution($periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        $data = $query->selectRaw('
            SUM(total_reviews) as total,
            SUM(five_star_reviews) as five_star,
            SUM(four_star_reviews) as four_star,
            SUM(three_star_reviews) as three_star,
            SUM(two_star_reviews) as two_star,
            SUM(one_star_reviews) as one_star
        ')->first();
        
        $total = $data->total ?? 0;
        
        return [
            'total' => $total,
            'five_star' => $data->five_star ?? 0,
            'four_star' => $data->four_star ?? 0,
            'three_star' => $data->three_star ?? 0,
            'two_star' => $data->two_star ?? 0,
            'one_star' => $data->one_star ?? 0,
            'five_star_percentage' => $total > 0 ? (($data->five_star ?? 0) / $total) * 100 : 0,
            'four_star_percentage' => $total > 0 ? (($data->four_star ?? 0) / $total) * 100 : 0,
            'three_star_percentage' => $total > 0 ? (($data->three_star ?? 0) / $total) * 100 : 0,
            'two_star_percentage' => $total > 0 ? (($data->two_star ?? 0) / $total) * 100 : 0,
            'one_star_percentage' => $total > 0 ? (($data->one_star ?? 0) / $total) * 100 : 0,
        ];
    }

    /**
     * Get average rating trend
     */
    public static function getAverageRatingTrend($periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->select('date', 'average_rating', 'total_reviews')
            ->orderBy('date', 'asc')
            ->get();
    }

    /**
     * Get overall average rating
     */
    public static function getOverallAverageRating($periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->avg('average_rating');
    }

    /**
     * Get review response rate
     */
    public static function getReviewResponseRate($periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->avg('response_rate');
    }
}
