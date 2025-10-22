<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Order;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\SecureAuthController;
use App\Http\Controllers\Auth\AdminController;
use App\Http\Controllers\Auth\SellerController;
use App\Http\Controllers\Auth\CustomerController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\http\Controllers\ChatController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\DiscountCodeController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\SellerFollowController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\Work_and_EventsController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\AfterSaleController;
use App\Http\Controllers\Social\FacebookController;

// Public Routes
Route::middleware([])->group(function () {
    // Test endpoint for debugging
    Route::get('/test-stores', function () {
        return response()->json(['message' => 'API is working', 'timestamp' => now()]);
    });
    
    // Test authentication endpoint
    Route::get('/test-auth-simple', function () {
        return response()->json(['message' => 'Auth test endpoint accessible']);
    });
    
    // Debug cookies endpoint
    Route::get('/debug-cookies', function () {
        return response()->json([
            'message' => 'Cookie debug',
            'cookies' => request()->cookies->all(),
            'headers' => request()->headers->all(),
            'has_access_token' => request()->hasCookie('access_token'),
            'has_refresh_token' => request()->hasCookie('refresh_token')
        ]);
    });
    
    // CSRF token endpoint for session-based authentication
    Route::get('/csrf-token', function () {
        return response()->json([
            'csrf_token' => csrf_token(),
            'message' => 'CSRF token generated'
        ]);
    });
    
    // Sanctum CSRF cookie endpoint
    Route::get('/sanctum/csrf-cookie', function () {
        return response()->json([
            'message' => 'CSRF cookie set',
            'csrf_token' => csrf_token()
        ]);
    });
    
    // Test registration endpoint
    Route::post('/test-register', function (Request $request) {
        return response()->json([
            'message' => 'Registration test endpoint working',
            'received_data' => $request->all(),
            'headers' => $request->headers->all()
        ]);
    });
    
    // Test authentication endpoint
    Route::get('/test-auth', function () {
        $user = Auth::user();
        return response()->json([
            'message' => 'Auth test',
            'user_authenticated' => $user ? true : false,
            'user_id' => $user ? $user->userID : null,
            'cookies' => request()->cookies->all()
        ]);
    }); // Temporarily removed middleware for testing
    
    // Simple test endpoint without middleware
    Route::get('/simple-test', function () {
        return response()->json([
            'message' => 'Simple test working',
            'route' => request()->route()->getName(),
            'path' => request()->path()
        ]);
    });
    
    // Debug endpoint
    Route::get('/debug-route', function () {
        Log::info('Debug route hit', [
            'path' => request()->path(),
            'url' => request()->url(),
            'method' => request()->method(),
            'route' => request()->route()->getName(),
            'middleware' => request()->route()->middleware()
        ]);
        
        return response()->json([
            'message' => 'Debug route hit',
            'path' => request()->path(),
            'url' => request()->url(),
            'method' => request()->method(),
            'route' => request()->route()->getName(),
            'middleware' => request()->route()->middleware()
        ]);
    });
    
    // CORS Test endpoint
    Route::get('/test-cors', function () {
        return response()->json([
            'message' => 'CORS is working!',
            'timestamp' => now(),
            'origin' => request()->header('Origin'),
            'headers' => request()->headers->all()
        ]);
    });
    
    // Test user data with city and province
    Route::middleware(['auth:sanctum'])->get('/test-user-data', function () {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }
        
        return response()->json([
            'user_data' => [
                'userID' => $user->userID,
                'userName' => $user->userName,
                'userEmail' => $user->userEmail,
                'userAddress' => $user->userAddress,
                'userCity' => $user->userCity,
                'userProvince' => $user->userProvince,
                'userRegion' => $user->userRegion,
                'role' => $user->role,
            ]
        ]);
    });
    
    // Simple auth test endpoint
    Route::middleware(['auth:sanctum'])->get('/test-auth', function () {
        return response()->json([
            'message' => 'Authenticated successfully',
            'user' => Auth::user()->userName ?? 'Unknown'
        ]);
    });
    
    // Legacy Auth routes removed - using secure auth routes only
    
    // Secure Auth routes with httpOnly cookies
    Route::prefix('auth')->group(function () {
        Route::post('/register', [SecureAuthController::class, 'register']);
        Route::post('/login', [SecureAuthController::class, 'login']);
        Route::post('/verify-otp', [SecureAuthController::class, 'verifyOtp']);
        Route::post('/refresh-token', [SecureAuthController::class, 'refreshToken']);
        Route::get('/profile', [SecureAuthController::class, 'profile'])->middleware('auth:sanctum');
        Route::put('/profile', [AuthController::class, 'updateProfile'])->middleware('auth:sanctum');
        Route::post('/profile', [AuthController::class, 'updateProfile'])->middleware('auth:sanctum'); // For multipart/form-data with _method override
        Route::post('/logout', [SecureAuthController::class, 'logout'])->middleware('auth:sanctum');
    });
    
    // Customer Profile Routes
    Route::prefix('customer')->middleware('auth:sanctum')->group(function () {
        Route::get('/profile', [\App\Http\Controllers\CustomerProfileController::class, 'getProfile']);
        Route::post('/profile', [\App\Http\Controllers\CustomerProfileController::class, 'updateProfile']);
        Route::post('/profile-picture', [\App\Http\Controllers\CustomerProfileController::class, 'updateProfilePicture']);
        Route::delete('/profile-picture', [\App\Http\Controllers\CustomerProfileController::class, 'deleteProfilePicture']);
    });
    
    // Additional profile route for backward compatibility
    Route::get('/profile', [SecureAuthController::class, 'profile'])->middleware('auth:sanctum');
    
    
    // Public product routes
    Route::get('/products/approved', [ProductController::class, 'approvedProducts']);
    Route::get('/products/featured', [ProductController::class, 'featuredProducts']);
    Route::get('/products/{id}', [ProductController::class, 'getProductDetails'])->whereNumber('id');
    
    // Contact form route
    Route::post('/contact', [ContactController::class, 'submit']);
    
    // Categories routes
    Route::get('/categories', [App\Http\Controllers\CategoryController::class, 'index']);
    
    // Public work and events routes (for customers to view)
    Route::get('/work-and-events/public', [Work_and_EventsController::class, 'getPublicWorkAndEvents']);
    Route::get('/work-and-events/public/{id}', [Work_and_EventsController::class, 'getPublicWorkAndEventById'])->whereNumber('id');
    
    // Payment success/failed routes (public - for PayMongo redirects)
    Route::get('/payment/success', [PaymentController::class, 'success']);
    Route::get('/payment/failed', [PaymentController::class, 'failed']);
    
    // Public products endpoints for admin (without authentication)
    Route::get('/products-public', function() {
        $products = App\Models\Product::with('seller.user')
            ->where('approval_status', '!=', 'draft')
            ->get()
            ->map(function($product) {
                return [
                    'id' => $product->id,
                    'product_id' => $product->product_id,
                    'productName' => $product->productName,
                    'productDescription' => $product->productDescription,
                    'productPrice' => $product->productPrice,
                    'productQuantity' => $product->productQuantity,
                    'productImage' => $product->productImage,
                    'category' => $product->category,
                    'status' => $product->status,
                    'approval_status' => $product->approval_status,
                    'seller_id' => $product->seller_id,
                    'seller' => $product->seller ? [
                        'sellerID' => $product->seller->sellerID,
                        'user' => $product->seller->user ? [
                            'userName' => $product->seller->user->userName,
                            'userEmail' => $product->seller->user->userEmail,
                            'userAddress' => $product->seller->user->userAddress,
                        ] : null
                    ] : null,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                ];
            });
        
        return response()->json($products);
    });

    // Public product details endpoint for admin (without authentication)
    Route::get('/products-public/{id}', function($id) {
        try {
            $product = App\Models\Product::with('seller.user')
                ->where('product_id', $id)
                ->where('approval_status', '!=', 'draft')
                ->first();
            
            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }
            
            return response()->json([
                'id' => $product->id,
                'product_id' => $product->product_id,
                'productName' => $product->productName,
                'productDescription' => $product->productDescription,
                'productPrice' => $product->productPrice,
                'productQuantity' => $product->productQuantity,
                'productImage' => $product->productImage,
                'category' => $product->category,
                'status' => $product->status,
                'approval_status' => $product->approval_status,
                'seller_id' => $product->seller_id,
                'seller' => $product->seller ? [
                    'sellerID' => $product->seller->sellerID,
                    'user' => $product->seller->user ? [
                        'userName' => $product->seller->user->userName,
                        'userEmail' => $product->seller->user->userEmail,
                        'userAddress' => $product->seller->user->userAddress,
                    ] : null
                ] : null,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });
    
    // Public orders endpoint for testing
    Route::get('/orders-test', function() {
        $orders = App\Models\Order::with(['customer.user', 'user'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($order) {
                // Get customer name from the customer's user relationship
                $customerName = 'Unknown Customer';
                if ($order->customer && $order->customer->user) {
                    $customerName = $order->customer->user->userName;
                } elseif ($order->user) {
                    $customerName = $order->user->userName;
                }
                
                return [
                    'id' => $order->orderID,
                    'customer' => $customerName,
                    'date' => $order->created_at->format('Y-m-d'),
                    'amount' => '₱' . number_format($order->totalAmount, 2),
                    'status' => ucfirst($order->status),
                    'items' => 1, // Default for now, can be calculated from order_products table
                    'location' => $order->location ?? 'N/A'
                ];
            });
        
        return response()->json($orders);
    });
    
    // Seller routes
    Route::get('/sellers/{id}/approvedProduct', [ProductController::class, 'getApprovedProducts'])->whereNumber('id');
    Route::get('/sellers/{id}', [SellerController::class, 'getSellerById'])->whereNumber('id');
    Route::get('/sellers/{id}/details', [SellerController::class, 'getArtisanDetails'])->whereNumber('id');
    Route::get('/sellers/{id}/store', [StoreController::class, 'getStoreBySeller'])->whereNumber('id');
    Route::get('/get/sellers', [SellerController::class, 'getAllSellers']);
    
    // Public store routes
    Route::get('/stores', [StoreController::class, 'index']);
    
    // Review routes
    Route::get('/products/{id}/reviews', [ReviewController::class, 'getProductReviews']);
    Route::prefix('products/{product}')->group(function () {
        Route::get('/reviews/{review}', [ReviewController::class, 'show']);
    });
    
    // Profile route (moved to protected section)
    
    // Test routes
    Route::get('/test', function () {
        return response()->json(['message' => 'API is working!']);
    });
    
    Route::get('/test/storage', function () {
        $testPath = 'profile_images/test.jpg';
        $fullUrl = url('storage/' . $testPath);
        return response()->json([
            'message' => 'Storage test',
            'url' => $fullUrl,
            'storage_path' => storage_path('app/public/' . $testPath),
            'public_path' => public_path('storage/' . $testPath)
        ]);
    });
    
    Route::get('/test/email', function () {
        try {
            $result = \App\Services\EmailService::sendOtpEmail(
                'test@example.com',
                'Test User',
                '123456'
            );
            
            return response()->json([
                'message' => 'Email test completed',
                'result' => $result,
                'ssl_options' => \App\Helpers\SslHelper::getSslOptions()
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Email test failed',
                'error' => $e->getMessage(),
                'ssl_options' => \App\Helpers\SslHelper::getSslOptions()
            ], 500);
        }
    });
    
    Route::get('/test/location', function () {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Please login first'], 401);
        }
        
        return response()->json([
            'message' => 'Location test',
            'user_location' => [
                'userAddress' => $user->userAddress,
                'userId' => $user->userID,
                'userName' => $user->userName
            ]
        ]);
    });
    
    Route::get('/test/profile', function () {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Please login first'], 401);
        }
        
        return response()->json([
            'message' => 'Profile test',
            'user_data' => [
                'id' => $user->userID,
                'userName' => $user->userName,
                'userEmail' => $user->userEmail,
                'userContactNumber' => $user->userContactNumber,
                'userAddress' => $user->userAddress,
                'userCity' => $user->userCity,                  
                'userRegion' => $user->userRegion,
                'userProvince' => $user->userProvince,
                'role' => $user->role
            ]
        ]);
    });

    Route::get('/test/debug-profile', function () {
        try {
            $user = Auth::user();
            $authHeader = request()->header('Authorization');
            
            return response()->json([
                'message' => 'Debug Profile Test',
                'auth_header' => $authHeader ? 'Present' : 'Missing',
                'user_authenticated' => $user ? true : false,
                'user_id' => $user ? $user->userID : 'Not authenticated',
                'user_data' => $user ? [
                    'userName' => $user->userName,
                    'userEmail' => $user->userEmail,
                    'userContactNumber' => $user->userContactNumber,
                    'userCity' => $user->userCity,
                    'role' => $user->role
                ] : 'No user data'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Debug error',
                'error' => $e->getMessage()
            ], 500);
        }
    });
});

// Protected routes 
Route::middleware(['auth:sanctum'])->group(function () {
    // Protected review routes
    Route::prefix('products/{product}')->group(function () {
        Route::post('/reviews', [ReviewController::class, 'store']);
    });
    // Batch review check for current user
    Route::post('/reviews/user-reviewed', [ReviewController::class, 'userReviewedBatch']);
    
    // Cart routes
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index']);
        Route::post('/add', [CartController::class, 'store']);
        Route::put('/update/{id}', [CartController::class, 'update']);
        Route::delete('/remove/{id}', [CartController::class, 'destroy']);
        Route::delete('/clear', [CartController::class, 'clear']);
        Route::post('/checkout', [CartController::class, 'checkout']);
    });
    
    // Order routes
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::get('/seller', [OrderController::class, 'sellerOrders']);
        Route::get('/{id}', [OrderController::class, 'show']);
        Route::post('/', [OrderController::class, 'store']);
        Route::post('/{orderId}/mark-received', [OrderController::class, 'markAsReceived']);
        Route::put('/{orderId}/status', [OrderController::class, 'updateStatus']);
    });

    // After-Sale Support Routes (Returns, Exchanges, Refunds, Support)
    Route::prefix('after-sale')->group(function () {
        // Customer routes
        Route::get('/my-requests', [AfterSaleController::class, 'getCustomerRequests']);
        Route::post('/requests', [AfterSaleController::class, 'createRequest']);
        Route::post('/requests/{id}/cancel', [AfterSaleController::class, 'cancelRequest']);
        Route::get('/requests/{id}', [AfterSaleController::class, 'getRequest']);
        
        // Seller routes
        Route::get('/seller/requests', [AfterSaleController::class, 'getSellerRequests']);
        Route::post('/seller/requests/{id}/respond', [AfterSaleController::class, 'respondToRequest']);
        
        // Admin routes
        Route::get('/admin/requests', [AfterSaleController::class, 'getAllRequests']);
        Route::put('/admin/requests/{id}/status', [AfterSaleController::class, 'updateRequestStatus']);
        Route::get('/admin/statistics', [AfterSaleController::class, 'getStatistics']);
    });

    // Payment Method routes
    Route::prefix('payment-methods')->group(function () {
        Route::get('/', [PaymentMethodController::class, 'index']);
        Route::post('/', [PaymentMethodController::class, 'store']);
        Route::get('/{id}', [PaymentMethodController::class, 'show']);
        Route::put('/{id}', [PaymentMethodController::class, 'update']);
        Route::delete('/{id}', [PaymentMethodController::class, 'destroy']);
        Route::post('/{id}/set-default', [PaymentMethodController::class, 'setDefault']);
    });

    // Facebook & Google Authentication (Login/Register)
    Route::prefix('auth')->group(function () {
        Route::get('/facebook/redirect', [AuthController::class, 'redirectToFacebook'])->withoutMiddleware(['auth:sanctum']);
        Route::get('/facebook/callback', [AuthController::class, 'handleFacebookCallback'])->withoutMiddleware(['auth:sanctum']);
        Route::get('/google/redirect', [AuthController::class, 'redirectToGoogle'])->withoutMiddleware(['auth:sanctum']);
        Route::get('/google/callback', [AuthController::class, 'handleGoogleCallback'])->withoutMiddleware(['auth:sanctum']);
    });

    // Social: Facebook integration
    Route::prefix('social/facebook')->group(function () {
        Route::get('/status', [FacebookController::class, 'status']);
        Route::get('/redirect', [FacebookController::class, 'redirect']);
        Route::get('/callback', [FacebookController::class, 'callback'])->withoutMiddleware(['auth:sanctum']);
        Route::get('/pages', [FacebookController::class, 'pages']);
        Route::get('/debug-permissions', [FacebookController::class, 'debugPermissions']);
        Route::post('/select-page', [FacebookController::class, 'selectPage']);
        Route::post('/disconnect', [FacebookController::class, 'disconnect']);
        Route::post('/post', [FacebookController::class, 'post']);
        Route::post('/instagram-post', [FacebookController::class, 'postToInstagram']);
    });
    
    // Chat routes
    // Route::prefix('chat')->group(function () {
    //     Route::get('/conversations', [ChatController::class, 'index']);
    //     Route::post('/conversations', [ChatController::class, 'store']);
    //     Route::get('/conversations/{conversation}/messages', [ChatController::class, 'messages']);
    //     Route::post('/conversations/{conversation}/messages', [ChatController::class, 'sendMessage']);
    // });
    
    // Product management routes (for sellers with verified stores)
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::apiResource('products', ProductController::class)->except(['index', 'show']);
        Route::get('/seller/products', [ProductController::class, 'sellerProducts']);
        Route::get('/seller/payments', [\App\Http\Controllers\SellerControllerMain::class, 'getPayments']);
    });
    
    // Admin routes
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/products/{id}/approve', [ProductController::class, 'approve']);
        Route::post('/products/{id}/reject', [ProductController::class, 'reject']);
        
        // Store verification routes
        Route::prefix('admin')->group(function () {
            Route::get('/stores', [AdminController::class, 'getAllStores']);
            Route::get('/stores/{storeId}', [AdminController::class, 'getStoreDetails']);
            Route::get('/stores/{storeId}/documents', [AdminController::class, 'getStoreDocuments']);
            Route::get('/stores/{storeId}/seller-details', [AdminController::class, 'getSellerDetails']);
            Route::post('/stores/{storeId}/approve', [AdminController::class, 'approveStore']);
            Route::post('/stores/{storeId}/reject', [AdminController::class, 'rejectStore']);
            Route::get('/verification-stats', [AdminController::class, 'getVerificationStats']);
            Route::post('/sellers/{sellerId}/verify', [AdminController::class, 'verifySeller']);
        });
        
        // Analytics routes (admin only - but endpoints are public for easier access)
        Route::prefix('analytics')->group(function () {
            Route::get('/admin', [AnalyticsController::class, 'getAdminAnalytics']);
            Route::post('/generate', [AnalyticsController::class, 'generateAnalyticsData']);
            Route::get('/test', function() {
                return response()->json(['message' => 'Analytics test endpoint working']);
            });
        });
    });
    
    // User profile - COMMENTED OUT: Using secure auth routes instead
    // Route::get('/profile', [AuthController::class, 'show']);
    // Route::put('/profile', [AuthController::class, 'updateProfile']);
    
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/update-location', [AuthController::class, 'updateLocation']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
});

// Test analytics without authentication
Route::get('/analytics/test-simple', function() {
    return response()->json(['message' => 'Simple analytics test working']);
});

Route::get('/analytics/test-controller', [AnalyticsController::class, 'getAdminAnalytics']);

// Public analytics generate endpoint for testing
Route::post('/analytics/generate-public', [AnalyticsController::class, 'generateAnalyticsData']);

// NOTE: Micro analytics tab has been removed - all revenue-related analytics are now under /analytics/revenue/*
// The micro analytics were merged into the Revenue tab in Analytics section

// Analytics Revenue Tab - Public endpoints for micro analytics (no auth required for analytics viewing)
Route::prefix('analytics/revenue')->group(function () {
    Route::get('/rating-breakdown', [AnalyticsController::class, 'getDetailedRatingBreakdown']);
    Route::get('/product-comparison', [AnalyticsController::class, 'getProductSellerComparison']);
    Route::get('/competitive-analysis', [AnalyticsController::class, 'getCompetitiveAnalysis']);
    Route::get('/most-selling-products', [AnalyticsController::class, 'getMostSellingProducts']);
    Route::get('/highest-sales-sellers', [AnalyticsController::class, 'getHighestSalesSellers']);
    Route::get('/product-trend/{productId}', [AnalyticsController::class, 'getProductSellingTrend']);
    Route::get('/seller-trend/{sellerId}', [AnalyticsController::class, 'getSellerSalesTrend']);
});

// Seller analytics endpoints
Route::get('/analytics/seller/{seller_id}', function($seller_id) {
    try {
        // Check if seller exists
        $seller = App\Models\Seller::where('sellerID', $seller_id)->first();
        if (!$seller) {
            return response()->json(['error' => 'Seller not found'], 404);
        }

        // Get seller's products with relationships
        $products = App\Models\Product::where('seller_id', $seller_id)
            ->with(['orders' => function($query) {
                $query->orderBy('created_at', 'desc');
            }, 'reviews'])
            ->get();

        // Get seller's orders
        $orders = App\Models\Order::whereHas('products', function($query) use ($seller_id) {
            $query->where('seller_id', $seller_id);
        })->with('products')->get();

        // Get seller's discount codes
        $discountCodes = App\Models\DiscountCode::where('created_by', $seller->user->userID)->get();

        // Calculate total revenue
            $totalRevenue = $orders->sum(function($order) {
            return $order->totalAmount;
        });

        // Calculate order status metrics
        $orderStatusMetrics = [
            'total_orders' => $orders->count(),
            'completed' => $orders->where('status', 'delivered')->count(),
            'pending' => $orders->where('status', 'pending')->count(),
            'packing' => $orders->where('status', 'packing')->count(),
            'shipped' => $orders->where('status', 'shipped')->count(),
            'completion_rate' => $orders->count() > 0 
                ? ($orders->where('status', 'delivered')->count() / $orders->count()) * 100 
                : 0
        ];

        // Calculate revenue by product
        $revenueByProduct = $products->map(function($product) {
            $totalRevenue = $product->orders->sum(function($order) use ($product) {
                $productOrder = $order->products->firstWhere('product_id', $product->product_id);
                return $productOrder ? $productOrder->pivot->quantity * $productOrder->pivot->price : 0;
            });
            $totalUnits = $product->orders->sum('pivot.quantity');
            $viewCount = $product->view_count ?? rand(50, 200); // Using random view count for now
            $conversionRate = $viewCount > 0 ? ($totalUnits / $viewCount) * 100 : 0;
            $inventoryTurnover = $product->productQuantity > 0 ? $totalUnits / $product->productQuantity : 0;

            return [
                'product_id' => $product->product_id,
                'name' => $product->productName,
                'revenue' => $totalRevenue,
                'units_sold' => $totalUnits,
                'views' => $viewCount,
                'conversion_rate' => $conversionRate,
                'inventory_turnover' => $inventoryTurnover
            ];
        });

        // Calculate revenue by category
        $revenueByCategory = $products->groupBy('category')->map(function($products) {
            return [
                'revenue' => $products->sum(function($product) {
                    return $product->orders->sum(function($order) use ($product) {
                        $productOrder = $order->products->firstWhere('product_id', $product->product_id);
                        return $productOrder ? $productOrder->pivot->quantity * $productOrder->pivot->price : 0;
                    });
                }),
                'units_sold' => $products->sum(function($product) {
                    return $product->orders->sum('pivot.quantity');
                })
            ];
        });

        // Calculate monthly trends (last 12 months)
        $monthlyTrends = collect(range(0, 11))->map(function($month) use ($orders) {
            $date = now()->subMonths($month);
            $monthOrders = $orders->filter(function($order) use ($date) {
                return $order->created_at->format('Y-m') === $date->format('Y-m');
            });
            
            $monthRevenue = $monthOrders->sum(function($order) {
                return $order->totalAmount;
            });
            
            return [
                'month' => $date->format('Y-m'),
                'revenue' => $monthRevenue,
                'orders' => $monthOrders->count()
            ];
        })->reverse()->values();

        // Get best-selling products
        $bestSellers = $revenueByProduct->sortByDesc('units_sold')->take(5)->values();

        // Get low-performing products (low inventory turnover)
        $lowPerformers = $revenueByProduct->sortBy('inventory_turnover')->take(5)->values();

        // Calculate discount code statistics
        $discountStats = [
            'total_codes' => $discountCodes->count(),
            'codes_used' => $discountCodes->sum('times_used'),
            'total_discount_amount' => $discountCodes->sum('value'),
            'active_codes' => $discountCodes->filter(function($code) {
                return (!$code->expires_at || $code->expires_at->isFuture()) &&
                       (!$code->usage_limit || $code->times_used < $code->usage_limit);
            })->count(),
            'expired_codes' => $discountCodes->filter(function($code) {
                return ($code->expires_at && $code->expires_at->isPast()) ||
                       ($code->usage_limit && $code->times_used >= $code->usage_limit);
            })->count()
        ];

        // Calculate peak selling periods
        $peakPeriods = $monthlyTrends
            ->sortByDesc('revenue')
            ->take(3)
            ->map(function($period) {
                return [
                    'month' => $period['month'],
                    'revenue' => $period['revenue'],
                    'orders' => $period['orders']
                ];
            })
            ->values();

        return response()->json([
            'total_revenue' => $totalRevenue,
            'revenue_by_product' => $revenueByProduct,
            'revenue_by_category' => $revenueByCategory,
            'monthly_trends' => $monthlyTrends,
            'best_sellers' => $bestSellers,
            'low_performers' => $lowPerformers,
            'discount_stats' => $discountStats,
            'discount_codes' => $discountCodes->map(function($code) {
                return [
                    'id' => $code->id,
                    'code' => $code->code ?? $code->code_name ?? ($code->name ?? 'CODE'),
                    'name' => $code->name ?? $code->code_name ?? null,
                    'type' => $code->type ?? ($code->is_percentage ? 'percent' : 'amount'),
                    'value' => (float) ($code->value ?? 0),
                    'usage_limit' => $code->usage_limit ?? null,
                    'times_used' => $code->times_used ?? 0,
                    'expires_at' => $code->expires_at ? $code->expires_at->toIso8601String() : null,
                    'active' => (!isset($code->expires_at) || ($code->expires_at && $code->expires_at->isFuture())) 
                        && (!isset($code->usage_limit) || ($code->usage_limit && $code->times_used < $code->usage_limit)),
                ];
            })->values(),
            'order_metrics' => $orderStatusMetrics,
            'peak_periods' => $peakPeriods
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// Admin products route
Route::middleware(['auth:sanctum'])->get('/admin/products', [ProductController::class, 'adminIndex']);

    // Customer Routes
    Route::resource('/customers', CustomerController::class);
    
    // User routes
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/customers', [AuthController::class, 'getCustomers']);
    Route::get('/admins', [AuthController::class, 'getAdmins']);
    Route::get('/sellers', [AuthController::class, 'getSellers']);

    // NOTE: Order routes are defined in the protected middleware group above (lines 414-419)
    // The /orders endpoint is at line 415 with proper auth:sanctum protection

    //Customer Chat Routes 
    Route::post('/conversations', [ChatController::class, 'createConversation']);
    Route::get('/conversations/with-seller/{sellerId}', [ChatController::class, 'getConversationWithSeller']);
    Route::post('/chat/{conversation}/send', [ChatController::class, 'sendMessage']);
    Route::get('/chat/{conversation}/messages', [ChatController::class, 'getMessages']);

    Route::post('/payments/initiate', [PaymentController::class, 'initiatePayment']);
    Route::post('/payments/confirm', [PaymentController::class, 'confirmPayment']);
    Route::post('/payment-session', [PaymentController::class, 'paymentSession']);
    Route::get('/payment/success/{payment_id}', [PaymentController::class, 'paymentSuccess'])->name('payment.success');
    Route::get('/payment/failed/{payment_id}', [PaymentController::class, 'paymentFailed'])->name('payment.failed');

    // New revenue sharing payment routes
    Route::post('/payments/create-intent', [PaymentController::class, 'createPaymentIntent']);

     //Products Routes in Admin Side
     Route::post('/products/{id}/approve', [ProductController::class, 'approve']);
     Route::post('/products/{id}/reject', [ProductController::class, 'reject']);
     Route::put('/products/{id}/update', [ProductController::class, 'update']);
     
    
    // Admin reporting routes
    Route::prefix('admin/reports')->group(function () {
        Route::get('/revenue', [App\Http\Controllers\AdminReportingController::class, 'getRevenueReport']);
        Route::get('/products', [App\Http\Controllers\AdminReportingController::class, 'getProductBreakdown']);
        Route::get('/sellers', [App\Http\Controllers\AdminReportingController::class, 'getSellerReport']);
        Route::get('/financial-dashboard', [App\Http\Controllers\AdminReportingController::class, 'getFinancialDashboard']);
        Route::get('/system-commission', [App\Http\Controllers\AdminReportingController::class, 'getSystemCommissionSummary']);
        Route::get('/item-commission', [App\Http\Controllers\AdminReportingController::class, 'getItemLevelCommission']);
        Route::get('/category-commission', [App\Http\Controllers\AdminReportingController::class, 'getCommissionByCategory']);
        Route::get('/export', [App\Http\Controllers\AdminReportingController::class, 'exportFinancialData']);
    });
    
    // Webhook doesn't need auth
    Route::post('/payments/webhook', [PaymentController::class, 'handleWebhook']);
    Route::post('/webhooks/paymongo', [PaymentController::class, 'handleWebhook']);

    // Seller Follow Routes (protected by auth)
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/sellers/{seller}/follow', [SellerFollowController::class, 'follow']);
        Route::post('/sellers/{seller}/unfollow', [SellerFollowController::class, 'unfollow']);
        Route::get('/sellers/{seller}/follow-status', [SellerFollowController::class, 'checkFollowStatus']);
        Route::get('/user/followed-sellers', [SellerFollowController::class, 'followedSellers']);
        Route::get('/products/followed-sellers', [ProductController::class, 'followedSellerProducts']);
    });

    // Seller dashboard routes
    Route::prefix('seller')->group(function () {
        Route::get('/{sellerId}/transactions', [App\Http\Controllers\SellerDashboardController::class, 'getTransactions']);
        Route::get('/{sellerId}/balance', [App\Http\Controllers\SellerDashboardController::class, 'getBalance']);
        Route::get('/{sellerId}/dashboard', [App\Http\Controllers\SellerDashboardController::class, 'getDashboardSummary']);
    });

    // Protected Routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Product Routes 
    Route::get('products/search/{name}', [ProductController::class, 'search']);
    Route::resource('/products', ProductController::class);

    //Toggle Featured Product
    Route::post('/products/{id}/toggle-featured', [ProductController::class, 'toggleFeatured']);
    //Toggle Publish Status
    Route::post('/products/{id}/toggle-publish', [ProductController::class, 'togglePublishStatus']);
     Route::get('/seller/products', [ProductController::class, 'index']);

    //Discount Code Routes
    Route::resource('/discount-codes', DiscountCodeController::class);
        Route::get('/discount-codes', [DiscountCodeController::class, 'index']);
        Route::post('/discount-codes', [DiscountCodeController::class, 'store']);
        Route::delete('/discount-codes/{id}', [DiscountCodeController::class, 'destroy']);
    
    //Seller Routes
   Route::get('sellers/profile', [SellerController::class, 'showProfile']);
    Route::post('sellers/{sellerID}/profile', [SellerController::class, 'updateSellerProfile']);
    Route::post('/user/deactivate', [AuthController::class, 'deactivate']);
    Route::delete('/user', [AuthController::class, 'destroy']);

    // Store Routes
    Route::prefix('stores')->group(function () {
        Route::get('/me', [StoreController::class, 'me']);
        Route::post('/', [StoreController::class, 'store']);
        Route::post('/customization', [StoreController::class, 'updateCustomization']);
        Route::get('/dashboard', [StoreController::class, 'getDashboardData']);
        Route::get('/{store}', [StoreController::class, 'show']);
        Route::get('/{store}/products', [StoreController::class, 'getStoreProducts']);
        Route::put('/{store}', [StoreController::class, 'update']);
        Route::delete('/{store}', [StoreController::class, 'destroy']);
        Route::post('/{store}/approve', [StoreController::class, 'approve']);
        Route::post('/{store}/reject', [StoreController::class, 'reject']);
    });   

      // Seller Chat Routes
    Route::get('/chat/seller/conversations', [ChatController::class, 'getSellerConversations']);
    Route::get('/chat/seller/conversation/{customerId}', [ChatController::class, 'getConversationWithCustomer']);
    Route::post('/chat/{conversation}/mark-read', [ChatController::class, 'markMessagesAsRead']);

    // Work and Events Routes (already inside auth:sanctum group from line 718)
    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('work-and-events', Work_and_EventsController::class);
    });

    // Shipping Routes
    Route::prefix('shipping')->group(function () {
        Route::post('/assign', [App\Http\Controllers\ShippingController::class, 'assignRider']);
        Route::put('/{id}/status', [App\Http\Controllers\ShippingController::class, 'updateStatus']);
        Route::get('/tracking/{trackingNumber}', [App\Http\Controllers\ShippingController::class, 'getByTrackingNumber']);
        Route::get('/seller', [App\Http\Controllers\ShippingController::class, 'getSellerShippings']);
        Route::get('/generate-tracking', [App\Http\Controllers\ShippingController::class, 'generateTrackingNumber']);
    });
});

// TEST/SIMULATION ROUTES - For development/demo purposes only
if (env('APP_ENV') === 'local' || env('APP_DEBUG')) {
    Route::prefix('test')->group(function () {
        // Mark pending GCash/PayMaya orders as paid (for simulation)
        Route::post('/mark-orders-paid', function (Request $request) {
            $orderIds = $request->input('order_ids', []);
            
            if (empty($orderIds)) {
                // If no specific IDs, update all pending gcash/paymaya orders
                $orders = Order::whereIn('payment_method', ['gcash', 'paymaya'])
                    ->where('paymentStatus', 'pending')
                    ->get();
            } else {
                $orders = Order::whereIn('orderID', $orderIds)->get();
            }
            
            $updated = 0;
            foreach ($orders as $order) {
                $order->update([
                    'status' => 'processing',
                    'paymentStatus' => 'paid'
                ]);
                $updated++;
                
                Log::info('TEST: Marked order as paid', [
                    'order_id' => $order->orderID,
                    'payment_method' => $order->payment_method
                ]);
            }
            
            return response()->json([
                'success' => true,
                'message' => "Marked {$updated} orders as paid",
                'orders' => $orders->map(fn($o) => [
                    'orderID' => $o->orderID,
                    'status' => $o->status,
                    'paymentStatus' => $o->paymentStatus,
                    'payment_method' => $o->payment_method
                ])
            ]);
        });
    });
}