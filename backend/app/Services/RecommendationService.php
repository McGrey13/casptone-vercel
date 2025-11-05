<?php

namespace App\Services;

use App\Models\Product;
use App\Models\BrowsingHistory;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RecommendationService
{
    /**
     * Get personalized recommendations for a user
     * 
     * @param int|null $userId
     * @param string|null $sessionId
     * @param int $limit
     * @return array
     */
    public function getRecommendations($userId = null, $sessionId = null, $limit = 12)
    {
        try {
            // If user is logged in, get personalized recommendations
            if ($userId) {
                return $this->getPersonalizedRecommendations($userId, $limit);
            }
            
            // For guest users, use session-based recommendations
            if ($sessionId) {
                return $this->getSessionBasedRecommendations($sessionId, $limit);
            }
            
            // Fallback to popular products
            return $this->getPopularProducts($limit);
        } catch (\Exception $e) {
            Log::error('Error generating recommendations: ' . $e->getMessage());
            return $this->getPopularProducts($limit);
        }
    }
    
    /**
     * Get personalized recommendations based on user behavior
     */
    private function getPersonalizedRecommendations($userId, $limit)
    {
        // Get user's browsing history (recent views prioritized)
        $browsedProducts = BrowsingHistory::where('user_id', $userId)
            ->select('product_id', DB::raw('COUNT(*) as view_count'), DB::raw('SUM(view_duration) as total_duration'))
            ->where('viewed_at', '>=', now()->subDays(90)) // Last 90 days
            ->groupBy('product_id')
            ->orderBy('view_count', 'desc')
            ->orderBy('total_duration', 'desc')
            ->limit(30)
            ->pluck('product_id')
            ->toArray();
        
        // Get user's purchase history
        $purchasedProducts = Order::where('userID', $userId)
            ->where('status', '!=', 'cancelled')
            ->with('orderProducts')
            ->get()
            ->flatMap(function($order) {
                return $order->orderProducts->pluck('product_id');
            })
            ->unique()
            ->toArray();
        
        // Get recently/most visited stores from browsing history
        $visitedStores = $this->getVisitedStores($userId);
        
        // Combine browsing and purchase data
        $userInterests = array_merge($browsedProducts, $purchasedProducts);
        $userInterests = array_unique($userInterests);
        
        // Strategy 1: Products from frequently/recently visited stores (HIGH PRIORITY)
        $storeBased = $this->getStoreBasedRecommendations($userId, $visitedStores, $limit * 2);
        
        // Strategy 2: Content-based filtering (similar products to browsed/purchased)
        $contentBased = $this->getContentBasedRecommendations($userInterests, $limit * 2);
        
        // Strategy 3: Collaborative filtering (users with similar behavior)
        $collaborative = $this->getCollaborativeRecommendations($userId, $userInterests, $limit * 2);
        
        // Strategy 4: Category-based recommendations
        $categoryBased = $this->getCategoryBasedRecommendations($userId, $limit);
        
        // If no user interests, still try store-based recommendations
        if (empty($userInterests) && !empty($visitedStores)) {
            return $storeBased;
        }
        
        if (empty($userInterests) && empty($visitedStores)) {
            return $this->getPopularProducts($limit);
        }
        
        // Merge and rank recommendations (store-based gets highest weight)
        $recommendations = $this->mergeAndRankRecommendations(
            $storeBased,
            $contentBased,
            $collaborative,
            $categoryBased,
            $userInterests,
            $limit
        );
        
        return $recommendations;
    }
    
    /**
     * Get stores user visited most/recently from browsing history
     */
    private function getVisitedStores($userId)
    {
        // Get products user viewed
        $viewedProductIds = BrowsingHistory::where('user_id', $userId)
            ->where('viewed_at', '>=', now()->subDays(90))
            ->pluck('product_id')
            ->unique();
        
        if ($viewedProductIds->isEmpty()) {
            // Fallback: check purchased products
            $purchasedProductIds = Order::where('userID', $userId)
                ->where('status', '!=', 'cancelled')
                ->with('orderProducts')
                ->get()
                ->flatMap(function($order) {
                    return $order->orderProducts->pluck('product_id');
                })
                ->unique();
            
            $viewedProductIds = $purchasedProductIds;
        }
        
        if ($viewedProductIds->isEmpty()) {
            return [];
        }
        
        // Get stores from these products, ordered by visit frequency
        $storeFrequency = BrowsingHistory::where('user_id', $userId)
            ->whereIn('product_id', $viewedProductIds->toArray())
            ->with('product.seller.store')
            ->get()
            ->groupBy(function($history) {
                return $history->product->seller->store->storeID ?? null;
            })
            ->map(function($group) {
                return [
                    'store_id' => $group->first()->product->seller->store->storeID ?? null,
                    'visit_count' => $group->count(),
                    'last_visit' => $group->max('viewed_at'),
                ];
            })
            ->filter(function($item) {
                return $item['store_id'] !== null;
            })
            ->sortByDesc(function($item) {
                // Prioritize by visit count and recency
                return $item['visit_count'] * 100 + ($item['last_visit'] ? $item['last_visit']->diffInDays(now()) : 999);
            })
            ->pluck('store_id')
            ->take(10)
            ->toArray();
        
        return $storeFrequency;
    }
    
    /**
     * Get products from stores user visits most/recently
     */
    private function getStoreBasedRecommendations($userId, $storeIds, $limit)
    {
        if (empty($storeIds)) {
            return [];
        }
        
        // Get products user already viewed/purchased to exclude
        $excludedProductIds = BrowsingHistory::where('user_id', $userId)
            ->pluck('product_id')
            ->merge(
                Order::where('userID', $userId)
                    ->where('status', '!=', 'cancelled')
                    ->with('orderProducts')
                    ->get()
                    ->flatMap(function($order) {
                        return $order->orderProducts->pluck('product_id');
                    })
            )
            ->unique()
            ->toArray();
        
        // Get products from visited stores
        $storeProducts = Product::whereHas('seller.store', function($query) use ($storeIds) {
                $query->whereIn('storeID', $storeIds);
            })
            ->where('approval_status', 'approved')
            ->where('publish_status', 'published')
            ->where('status', '!=', 'out of stock')
            ->whereNotIn('product_id', $excludedProductIds)
            ->with(['seller.user', 'seller.store', 'reviews'])
            ->orderBy('average_rating', 'desc')
            ->orderBy('review_count', 'desc')
            ->limit($limit)
            ->get();
        
        return $this->formatProducts($storeProducts);
    }
    
    /**
     * Get session-based recommendations for guest users
     */
    private function getSessionBasedRecommendations($sessionId, $limit)
    {
        $browsedProducts = BrowsingHistory::where('session_id', $sessionId)
            ->select('product_id', DB::raw('COUNT(*) as view_count'))
            ->groupBy('product_id')
            ->orderBy('view_count', 'desc')
            ->limit(10)
            ->pluck('product_id')
            ->toArray();
        
        if (empty($browsedProducts)) {
            return $this->getPopularProducts($limit);
        }
        
        return $this->getContentBasedRecommendations($browsedProducts, $limit);
    }
    
    /**
     * Content-based filtering: Find products similar to user's interests
     */
    private function getContentBasedRecommendations(array $productIds, $limit)
    {
        if (empty($productIds)) {
            return [];
        }
        
        // Get categories and tags from user's interested products
        $userProducts = Product::whereIn('product_id', $productIds)
            ->where('approval_status', 'approved')
            ->where('publish_status', 'published')
            ->get();
        
        $categories = $userProducts->pluck('category')->filter()->unique()->toArray();
        $allTags = $userProducts->pluck('tags')->filter()->flatten()->unique()->toArray();
        
        // Find similar products (same category or tags, excluding already viewed/purchased)
        $similarProducts = Product::where('approval_status', 'approved')
            ->where('publish_status', 'published')
            ->where('status', '!=', 'out of stock')
            ->whereNotIn('product_id', $productIds)
            ->where(function($query) use ($categories, $allTags) {
                if (!empty($categories)) {
                    $query->whereIn('category', $categories);
                }
                if (!empty($allTags)) {
                    foreach ($allTags as $tag) {
                        $query->orWhereJsonContains('tags', $tag);
                    }
                }
            })
            ->with(['seller.user', 'seller.store', 'reviews'])
            ->limit($limit * 2)
            ->get();
        
        return $this->formatProducts($similarProducts);
    }
    
    /**
     * Collaborative filtering: Find products liked by users with similar behavior
     */
    private function getCollaborativeRecommendations($userId, array $userInterests, $limit)
    {
        // Find users who viewed/purchased similar products
        $similarUsers = BrowsingHistory::whereIn('product_id', $userInterests)
            ->where('user_id', '!=', $userId)
            ->whereNotNull('user_id')
            ->select('user_id', DB::raw('COUNT(DISTINCT product_id) as common_products'))
            ->groupBy('user_id')
            ->having('common_products', '>=', 2)
            ->orderBy('common_products', 'desc')
            ->limit(50)
            ->pluck('user_id')
            ->toArray();
        
        if (empty($similarUsers)) {
            return [];
        }
        
        // Get products viewed/purchased by similar users that current user hasn't seen
        $recommendedProductIds = BrowsingHistory::whereIn('user_id', $similarUsers)
            ->whereNotIn('product_id', $userInterests)
            ->select('product_id', DB::raw('COUNT(*) as view_count'))
            ->groupBy('product_id')
            ->orderBy('view_count', 'desc')
            ->limit($limit * 2)
            ->pluck('product_id')
            ->toArray();
        
        // Also check purchase history of similar users
        $purchasedBySimilar = Order::whereIn('userID', $similarUsers)
            ->where('status', '!=', 'cancelled')
            ->with('orderProducts')
            ->get()
            ->flatMap(function($order) {
                return $order->orderProducts->pluck('product_id');
            })
            ->filter(function($productId) use ($userInterests) {
                return !in_array($productId, $userInterests);
            })
            ->unique()
            ->toArray();
        
        $recommendedProductIds = array_merge($recommendedProductIds, $purchasedBySimilar);
        $recommendedProductIds = array_unique($recommendedProductIds);
        
        if (empty($recommendedProductIds)) {
            return [];
        }
        
        $products = Product::whereIn('product_id', $recommendedProductIds)
            ->where('approval_status', 'approved')
            ->where('publish_status', 'published')
            ->where('status', '!=', 'out of stock')
            ->with(['seller.user', 'seller.store', 'reviews'])
            ->limit($limit)
            ->get();
        
        return $this->formatProducts($products);
    }
    
    /**
     * Category-based recommendations based on user's favorite categories
     */
    private function getCategoryBasedRecommendations($userId, $limit)
    {
        // Get user's favorite categories from browsing and purchases
        $favoriteCategories = DB::table('browsing_history')
            ->join('products', 'browsing_history.product_id', '=', 'products.product_id')
            ->where('browsing_history.user_id', $userId)
            ->select('products.category', DB::raw('COUNT(*) as view_count'))
            ->whereNotNull('products.category')
            ->groupBy('products.category')
            ->orderBy('view_count', 'desc')
            ->limit(3)
            ->pluck('category')
            ->toArray();
        
        // Also check purchase history
        $purchaseCategories = Order::where('userID', $userId)
            ->where('status', '!=', 'cancelled')
            ->with(['orderProducts.product'])
            ->get()
            ->flatMap(function($order) {
                return $order->orderProducts->map(function($op) {
                    return $op->product->category ?? null;
                })->filter();
            })
            ->unique()
            ->toArray();
        
        $favoriteCategories = array_merge($favoriteCategories, $purchaseCategories);
        $favoriteCategories = array_unique($favoriteCategories);
        
        if (empty($favoriteCategories)) {
            return [];
        }
        
        // Get user's viewed/purchased product IDs to exclude
        $excludedIds = BrowsingHistory::where('user_id', $userId)
            ->pluck('product_id')
            ->merge(
                Order::where('userID', $userId)
                    ->where('status', '!=', 'cancelled')
                    ->with('orderProducts')
                    ->get()
                    ->flatMap(function($order) {
                        return $order->orderProducts->pluck('product_id');
                    })
            )
            ->unique()
            ->toArray();
        
        $products = Product::whereIn('category', $favoriteCategories)
            ->where('approval_status', 'approved')
            ->where('publish_status', 'published')
            ->where('status', '!=', 'out of stock')
            ->whereNotIn('product_id', $excludedIds)
            ->with(['seller.user', 'seller.store', 'reviews'])
            ->orderBy('average_rating', 'desc')
            ->orderBy('review_count', 'desc')
            ->limit($limit)
            ->get();
        
        return $this->formatProducts($products);
    }
    
    /**
     * Get popular products (fallback)
     */
    private function getPopularProducts($limit)
    {
        $products = Product::where('approval_status', 'approved')
            ->where('publish_status', 'published')
            ->where('status', '!=', 'out of stock')
            ->with(['seller.user', 'seller.store', 'reviews'])
            ->orderBy('average_rating', 'desc')
            ->orderBy('review_count', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
        
        return $this->formatProducts($products);
    }
    
    /**
     * Merge and rank recommendations from multiple strategies
     */
    private function mergeAndRankRecommendations(
        array $storeBased,
        array $contentBased,
        array $collaborative,
        array $categoryBased,
        array $excludedIds,
        $limit
    ) {
        // Score and merge recommendations
        $scoredProducts = [];
        
        // Store-based: weight 0.6 (HIGHEST - products from stores user visits)
        foreach ($storeBased as $product) {
            $id = $product['id'];
            if (!isset($scoredProducts[$id])) {
                $scoredProducts[$id] = $product;
                $scoredProducts[$id]['score'] = 0;
            }
            $scoredProducts[$id]['score'] += 0.6;
        }
        
        // Content-based: weight 0.4 (products similar to browsed/purchased)
        foreach ($contentBased as $product) {
            $id = $product['id'];
            if (!isset($scoredProducts[$id])) {
                $scoredProducts[$id] = $product;
                $scoredProducts[$id]['score'] = 0;
            }
            $scoredProducts[$id]['score'] += 0.4;
        }
        
        // Collaborative: weight 0.5 (products liked by similar users)
        foreach ($collaborative as $product) {
            $id = $product['id'];
            if (!isset($scoredProducts[$id])) {
                $scoredProducts[$id] = $product;
                $scoredProducts[$id]['score'] = 0;
            }
            $scoredProducts[$id]['score'] += 0.5;
        }
        
        // Category-based: weight 0.3 (products from favorite categories)
        foreach ($categoryBased as $product) {
            $id = $product['id'];
            if (!isset($scoredProducts[$id])) {
                $scoredProducts[$id] = $product;
                $scoredProducts[$id]['score'] = 0;
            }
            $scoredProducts[$id]['score'] += 0.3;
        }
        
        // Add quality score based on ratings and reviews
        foreach ($scoredProducts as $id => &$product) {
            $ratingScore = ($product['average_rating'] / 5) * 0.2;
            $reviewScore = min($product['reviews_count'] / 100, 1) * 0.1;
            $product['score'] += $ratingScore + $reviewScore;
        }
        
        // Sort by score and take top N
        usort($scoredProducts, function($a, $b) {
            return $b['score'] <=> $a['score'];
        });
        
        return array_slice($scoredProducts, 0, $limit);
    }
    
    /**
     * Format products for API response
     */
    private function formatProducts($products)
    {
        return $products->map(function($product) {
            $averageRating = 0;
            $reviewCount = 0;
            
            if ($product->reviews && $product->reviews->count() > 0) {
                $averageRating = round($product->reviews->avg('rating'), 1);
                $reviewCount = $product->reviews->count();
            }
            
            $productImageUrl = $product->productImage
                ? url('storage/' . ltrim($product->productImage, '/'))
                : '';
            
            return [
                'id' => $product->product_id,
                'product_id' => $product->product_id,
                'productName' => $product->productName,
                'productDescription' => $product->productDescription,
                'productPrice' => (float) $product->productPrice,
                'productQuantity' => $product->productQuantity,
                'productImage' => $productImageUrl,
                'productImages' => $product->productImages ?? [],
                'category' => $product->category,
                'tags' => $product->tags ?? [],
                'status' => $product->status,
                'average_rating' => $averageRating,
                'reviews_count' => $reviewCount,
                'score' => $product->score ?? 0, // Include recommendation score if available
                'seller' => $product->seller ? [
                    'sellerID' => $product->seller->sellerID,
                    'user' => $product->seller->user ? [
                        'userName' => $product->seller->user->userName,
                        'userEmail' => $product->seller->user->userEmail,
                    ] : null,
                    'store' => $product->seller->store ? [
                        'store_name' => $product->seller->store->store_name,
                    ] : null,
                ] : null,
            ];
        })->toArray();
    }
    
    /**
     * Get recommended stores based on user behavior
     */
    public function getRecommendedStores($userId = null, $sessionId = null, $limit = 12)
    {
        try {
            $recommendedStoreIds = [];
            
            if ($userId) {
                // Get user's favorite categories from products they viewed/purchased
                $userProductIds = BrowsingHistory::where('user_id', $userId)
                    ->pluck('product_id')
                    ->merge(
                        Order::where('userID', $userId)
                            ->where('status', '!=', 'cancelled')
                            ->with('orderProducts')
                            ->get()
                            ->flatMap(function($order) {
                                return $order->orderProducts->pluck('product_id');
                            })
                    )
                    ->unique();
                
                if ($userProductIds->isNotEmpty()) {
                    // Get sellers/stores from products user interacted with
                    $userStores = Product::whereIn('product_id', $userProductIds)
                        ->with('seller.store')
                        ->get()
                        ->pluck('seller.store.storeID')
                        ->filter()
                        ->unique();
                    
                    // Get products from these stores
                    $recommendedStoreIds = $userStores->toArray();
                    
                    // Also get stores from similar categories
                    $userCategories = Product::whereIn('product_id', $userProductIds)
                        ->pluck('category')
                        ->filter()
                        ->unique();
                    
                    $categoryStoreIds = Product::whereIn('category', $userCategories->toArray())
                        ->where('approval_status', 'approved')
                        ->where('publish_status', 'published')
                        ->whereHas('seller.store')
                        ->with('seller.store')
                        ->get()
                        ->pluck('seller.store.storeID')
                        ->filter()
                        ->unique()
                        ->diff($recommendedStoreIds)
                        ->take($limit - count($recommendedStoreIds))
                        ->toArray();
                    
                    $recommendedStoreIds = array_merge($recommendedStoreIds, $categoryStoreIds);
                }
            } elseif ($sessionId) {
                // Session-based recommendations
                $sessionProductIds = BrowsingHistory::where('session_id', $sessionId)
                    ->pluck('product_id')
                    ->unique();
                
                if ($sessionProductIds->isNotEmpty()) {
                    $recommendedStoreIds = Product::whereIn('product_id', $sessionProductIds->toArray())
                        ->where('approval_status', 'approved')
                        ->where('publish_status', 'published')
                        ->whereHas('seller.store')
                        ->with('seller.store')
                        ->get()
                        ->pluck('seller.store.storeID')
                        ->filter()
                        ->unique()
                        ->take($limit)
                        ->toArray();
                }
            }
            
            return $recommendedStoreIds;
        } catch (\Exception $e) {
            Log::error('Error getting recommended stores: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Track a product view
     */
    public function trackProductView($productId, $userId = null, $sessionId = null, $duration = 0)
    {
        try {
            BrowsingHistory::create([
                'user_id' => $userId,
                'product_id' => $productId,
                'session_id' => $sessionId,
                'view_duration' => $duration,
                'viewed_at' => now(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error('Error tracking product view: ' . $e->getMessage());
            return false;
        }
    }
}

