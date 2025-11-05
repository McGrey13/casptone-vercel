<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\RecommendationService;
use Illuminate\Support\Facades\Auth;

class RecommendationController extends Controller
{
    protected $recommendationService;
    
    public function __construct(RecommendationService $recommendationService)
    {
        $this->recommendationService = $recommendationService;
    }
    
    /**
     * Get personalized recommendations for the current user
     */
    public function getRecommendations(Request $request)
    {
        try {
            $user = Auth::user();
            $userId = $user ? $user->userID : null;
            
            // Get or create session ID for guest users
            $sessionId = null;
            if (!$userId) {
                if (!$request->session()->has('guest_session_id')) {
                    $request->session()->put('guest_session_id', uniqid('guest_', true));
                }
                $sessionId = $request->session()->get('guest_session_id');
            } else {
                $sessionId = $request->session()->getId();
            }
            
            $limit = $request->get('limit', 12);
            
            $recommendations = $this->recommendationService->getRecommendations(
                $userId,
                $sessionId,
                $limit
            );
            
            return response()->json([
                'success' => true,
                'recommendations' => $recommendations,
                'count' => count($recommendations),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get recommendations',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Track a product view
     */
    public function trackView(Request $request, $productId)
    {
        try {
            $user = Auth::user();
            $userId = $user ? $user->userID : null;
            
            // Get or create session ID for guest users
            $sessionId = null;
            if (!$userId) {
                if (!$request->session()->has('guest_session_id')) {
                    $request->session()->put('guest_session_id', uniqid('guest_', true));
                }
                $sessionId = $request->session()->get('guest_session_id');
            } else {
                $sessionId = $request->session()->getId();
            }
            
            $duration = $request->get('duration', 0);
            
            $tracked = $this->recommendationService->trackProductView(
                $productId,
                $userId,
                $sessionId,
                $duration
            );
            
            if ($tracked) {
                return response()->json([
                    'success' => true,
                    'message' => 'Product view tracked successfully',
                ]);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to track product view',
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error tracking product view',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Get recommended stores
     */
    public function getRecommendedStores(Request $request)
    {
        try {
            $user = Auth::user();
            $userId = $user ? $user->userID : null;
            
            // Get or create session ID for guest users
            $sessionId = null;
            if (!$userId) {
                if (!$request->session()->has('guest_session_id')) {
                    $request->session()->put('guest_session_id', uniqid('guest_', true));
                }
                $sessionId = $request->session()->get('guest_session_id');
            } else {
                $sessionId = $request->session()->getId();
            }
            
            $limit = $request->get('limit', 12);
            
            $storeIds = $this->recommendationService->getRecommendedStores(
                $userId,
                $sessionId,
                $limit
            );
            
            return response()->json([
                'success' => true,
                'store_ids' => $storeIds,
                'count' => count($storeIds),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get recommended stores',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Get purchase history for recommendations
     * Lists all products that the user has purchased
     */
    public function getPurchaseHistory(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User must be authenticated to view purchase history',
                ], 401);
            }
            
            $limit = $request->get('limit', 50);
            
            // Get all orders for the user
            $orders = \App\Models\Order::where('userID', $user->userID)
                ->where('status', '!=', 'cancelled')
                ->with(['orderProducts.product' => function($query) {
                    $query->with(['seller.user', 'seller.store', 'reviews']);
                }])
                ->orderBy('created_at', 'desc')
                ->get();
            
            // Extract unique products from orders
            $purchasedProducts = [];
            $seenProductIds = [];
            
            foreach ($orders as $order) {
                foreach ($order->orderProducts as $orderProduct) {
                    $product = $orderProduct->product;
                    $productId = $product->product_id ?? $product->id;
                    
                    // Skip if we've already seen this product
                    if (in_array($productId, $seenProductIds)) {
                        continue;
                    }
                    
                    $seenProductIds[] = $productId;
                    
                    // Get first purchase date and last purchase date
                    $firstPurchase = \App\Models\Order::where('userID', $user->userID)
                        ->whereHas('orderProducts', function($q) use ($productId) {
                            $q->where('product_id', $productId);
                        })
                        ->orderBy('created_at', 'asc')
                        ->first();
                    
                    $lastPurchase = \App\Models\Order::where('userID', $user->userID)
                        ->whereHas('orderProducts', function($q) use ($productId) {
                            $q->where('product_id', $productId);
                        })
                        ->orderBy('created_at', 'desc')
                        ->first();
                    
                    // Calculate total quantity purchased
                    $totalQuantity = \App\Models\OrderProduct::whereHas('order', function($q) use ($user) {
                            $q->where('userID', $user->userID);
                        })
                        ->where('product_id', $productId)
                        ->sum('quantity');
                    
                    // Calculate total amount spent
                    $totalAmount = \App\Models\OrderProduct::whereHas('order', function($q) use ($user) {
                            $q->where('userID', $user->userID);
                        })
                        ->where('product_id', $productId)
                        ->get()
                        ->sum(function($op) {
                            return ($op->price ?? 0) * ($op->quantity ?? 0);
                        });
                    
                    $averageRating = 0;
                    $reviewCount = 0;
                    
                    if ($product->reviews && $product->reviews->count() > 0) {
                        $averageRating = round($product->reviews->avg('rating'), 1);
                        $reviewCount = $product->reviews->count();
                    }
                    
                    $productImageUrl = $product->productImage
                        ? url('storage/' . ltrim($product->productImage, '/'))
                        : '';
                    
                    $purchasedProducts[] = [
                        'id' => $product->product_id,
                        'product_id' => $product->product_id,
                        'productName' => $product->productName,
                        'productDescription' => $product->productDescription,
                        'productPrice' => (float) $product->productPrice,
                        'productImage' => $productImageUrl,
                        'productImages' => $product->productImages ?? [],
                        'category' => $product->category,
                        'tags' => $product->tags ?? [],
                        'status' => $product->status,
                        'average_rating' => $averageRating,
                        'reviews_count' => $reviewCount,
                        'first_purchased_at' => $firstPurchase ? $firstPurchase->created_at->toISOString() : null,
                        'last_purchased_at' => $lastPurchase ? $lastPurchase->created_at->toISOString() : null,
                        'total_quantity_purchased' => (int) $totalQuantity,
                        'total_amount_spent' => (float) $totalAmount,
                        'purchase_count' => \App\Models\Order::where('userID', $user->userID)
                            ->whereHas('orderProducts', function($q) use ($productId) {
                                $q->where('product_id', $productId);
                            })
                            ->count(),
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
                    
                    if (count($purchasedProducts) >= $limit) {
                        break 2; // Break out of both loops
                    }
                }
            }
            
            // Sort by last purchased date (most recent first)
            usort($purchasedProducts, function($a, $b) {
                $dateA = $a['last_purchased_at'] ? strtotime($a['last_purchased_at']) : 0;
                $dateB = $b['last_purchased_at'] ? strtotime($b['last_purchased_at']) : 0;
                return $dateB <=> $dateA;
            });
            
            return response()->json([
                'success' => true,
                'purchases' => $purchasedProducts,
                'count' => count($purchasedProducts),
                'total_products_purchased' => count($purchasedProducts),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get purchase history',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
