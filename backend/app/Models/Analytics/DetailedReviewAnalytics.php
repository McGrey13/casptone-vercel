<?php

namespace App\Models\Analytics;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\User;
use App\Models\Product;
use App\Models\Seller;

class DetailedReviewAnalytics extends Model
{
    use HasFactory;

    protected $table = 'detailed_review_analytics';

    protected $fillable = [
        'date',
        'period_type',
        'user_id',
        'product_id',
        'seller_id',
        'rating',
        'review_text',
        'is_verified_purchase',
        'helpful_votes',
        'response_text',
        'response_date',
        'category',
        'product_name',
        'seller_name',
        'user_name'
    ];

    protected $casts = [
        'date' => 'date',
        'is_verified_purchase' => 'boolean',
        'response_date' => 'datetime',
    ];

    /**
     * Get the user who wrote the review
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'userID');
    }

    /**
     * Get the product being reviewed
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    /**
     * Get the seller of the product
     */
    public function seller()
    {
        return $this->belongsTo(Seller::class, 'seller_id', 'sellerID');
    }

    /**
     * Get rating distribution for a specific period
     */
    public static function getRatingDistribution($periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->selectRaw('rating, COUNT(*) as count, AVG(helpful_votes) as avg_helpful_votes')
            ->groupBy('rating')
            ->orderBy('rating', 'desc')
            ->get();
    }

    /**
     * Get detailed rating breakdown with user information
     */
    public static function getDetailedRatingBreakdown($rating = null, $periodType = 'monthly', $startDate = null, $endDate = null, $limit = 50)
    {
        $query = self::with(['user', 'product', 'seller'])
            ->where('period_type', $periodType);
        
        if ($rating) {
            $query->where('rating', $rating);
        }
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->orderBy('date', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get top reviewers by rating
     */
    public static function getTopReviewers($rating = null, $periodType = 'monthly', $startDate = null, $endDate = null, $limit = 10)
    {
        $query = self::with('user')
            ->where('period_type', $periodType);
        
        if ($rating) {
            $query->where('rating', $rating);
        }
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->selectRaw('user_id, user_name, COUNT(*) as review_count, AVG(rating) as avg_rating, SUM(helpful_votes) as total_helpful_votes')
            ->groupBy('user_id', 'user_name')
            ->orderBy('review_count', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get rating trends over time
     */
    public static function getRatingTrends($periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->selectRaw('date, rating, COUNT(*) as count')
            ->groupBy('date', 'rating')
            ->orderBy('date', 'asc')
            ->get()
            ->groupBy('date')
            ->map(function($dayData) {
                $ratings = $dayData->keyBy('rating');
                return [
                    'date' => $dayData->first()->date,
                    'five_star' => $ratings->get(5)->count ?? 0,
                    'four_star' => $ratings->get(4)->count ?? 0,
                    'three_star' => $ratings->get(3)->count ?? 0,
                    'two_star' => $ratings->get(2)->count ?? 0,
                    'one_star' => $ratings->get(1)->count ?? 0,
                    'total' => $dayData->sum('count')
                ];
            });
    }
}

