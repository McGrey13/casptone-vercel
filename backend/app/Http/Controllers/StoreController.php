<?php

namespace App\Http\Controllers;

use App\Models\Store;
use App\Models\Seller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use app\models\User;

class StoreController extends Controller
{
    public function me(Request $request)
    {
        $user = Auth::user();
        
        Log::info('StoreController@me called', [
            'user_id' => $user ? $user->userID : 'No user',
            'user_role' => $user ? $user->role : 'No role'
        ]);
        
        if (!$user) {
            Log::warning('No authenticated user found');
            return response()->json(['message' => 'User not authenticated'], 401);
        }
        
        $store = Store::where('user_id', $user->userID)
            ->with(['seller.user'])
            ->latest()
            ->first();
            
        Log::info('Store query result', [
            'store_found' => $store ? 'Yes' : 'No',
            'store_id' => $store ? $store->storeID : null,
            'store_name' => $store ? $store->store_name : null,
            'logo_path' => $store ? $store->logo_path : null
        ]);
            
        if (!$store) {
            return response()->json(['message' => 'No store found'], 404);
        }
        
        $response = [
            'store' => $store,
            'logo_url' => $store->logo_path ? url('storage/' . $store->logo_path) : null,
            'background_url' => $store->background_image_path ? url('storage/' . $store->background_image_path) : null,
            'bir_url' => $store->bir_path ? url('storage/' . $store->bir_path) : null,
        ];
        
        Log::info('Store data response', $response);
        
        return response()->json($response);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'store_name' => 'required|string|max:255',
            'store_description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:4096',
            'bir' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:8192',
            'dti' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:8192',
            'id_image' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:8192',
            'id_type' => 'nullable|string|in:UMID,SSS,GSIS,LTO,Postal,Passport,PhilHealth,PhilID,PRC,Alien,Foreign_Passport',
            'tin_number' => 'nullable|string|max:20',
            'owner_name' => 'required|string|max:255',
            'owner_email' => 'required|email|max:255',
            'owner_phone' => 'nullable|string|max:50',
            'owner_address' => 'nullable|string',
        ]);

        $seller = Seller::where('user_id', $user->userID)->firstOrFail();

        $logoPath = null;
        $birPath = null;
        $dtiPath = null;
        $idImagePath = null;

        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('stores/logos', 'public');
        }

        if ($request->hasFile('bir')) {
            $birPath = $request->file('bir')->store('stores/bir', 'public');
        }

        if ($request->hasFile('dti')) {
            $dtiPath = $request->file('dti')->store('stores/dti', 'public');
        }

        if ($request->hasFile('id_image')) {
            $idImagePath = $request->file('id_image')->store('stores/id_images', 'public');
        }

        $store = Store::create([
            'seller_id' => $seller->sellerID,
            'user_id' => $user->userID,
            'store_name' => $validated['store_name'],
            'store_description' => $validated['store_description'] ?? null,
            'category' => $validated['category'] ?? null,
            'logo_path' => $logoPath,
            'bir_path' => $birPath,
            'dti_path' => $dtiPath,
            'id_image_path' => $idImagePath,
            'id_type' => $validated['id_type'] ?? null,
            'tin_number' => $validated['tin_number'] ?? null,
            'owner_name' => $validated['owner_name'],
            'owner_email' => $validated['owner_email'],
            'owner_phone' => $validated['owner_phone'] ?? null,
            'owner_address' => $validated['owner_address'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json($store, 201);
    }

    public function approve(Store $store)
    {
        $store->update(['status' => 'approved']);
        return response()->json(['message' => 'Store approved']);
    }

    public function reject(Store $store)
    {
        $store->update(['status' => 'rejected']);
        return response()->json(['message' => 'Store rejected']);
    }

    public function update(Request $request, Store $store)
    {
        $user = Auth::user();
        
        // Check if user owns this store
        if ($store->user_id !== $user->userID && $user->role !== 'administrator') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'store_name' => 'sometimes|string|max:255',
            'store_description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:4096',
            'bir' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:8192',
            'owner_name' => 'sometimes|string|max:255',
            'owner_email' => 'sometimes|email|max:255',
            'owner_phone' => 'nullable|string|max:50',
            'owner_address' => 'nullable|string',
        ]);

        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($store->logo_path) {
                Storage::disk('public')->delete($store->logo_path);
            }
            $validated['logo_path'] = $request->file('logo')->store('stores/logos', 'public');
        }

        if ($request->hasFile('bir')) {
            // Delete old BIR document if exists
            if ($store->bir_path) {
                Storage::disk('public')->delete($store->bir_path);
            }
            $validated['bir_path'] = $request->file('bir')->store('stores/bir', 'public');
        }

        $store->update($validated);

        return response()->json([
            'message' => 'Store updated successfully',
            'store' => $store,
            'logo_url' => $store->logo_path ? url('storage/' . $store->logo_path) : null,
            'bir_url' => $store->bir_path ? url('storage/' . $store->bir_path) : null,
        ]);
    }

    public function show(Store $store)
    {
        try {
            $store->load('seller.user');
            
            // Calculate average rating from products
            $averageRating = 0;
            $totalRatings = 0;
            
            if ($store->seller && $store->seller->products) {
                $totalRatingSum = 0;
                $ratingCount = 0;
                
                foreach ($store->seller->products as $product) {
                    $productRatings = \App\Models\Ratings::where('product_id', $product->product_id)->get();
                    foreach ($productRatings as $rating) {
                        $totalRatingSum += $rating->stars;
                        $ratingCount++;
                    }
                }
                
                if ($ratingCount > 0) {
                    $averageRating = round($totalRatingSum / $ratingCount, 1);
                    $totalRatings = $ratingCount;
                }
            }
            
            // Get followers count
            $followersCount = 0;
            if ($store->seller) {
                try {
                    $followersCount = $store->seller->followers()->count();
                } catch (\Exception $e) {
                    Log::warning('Error getting followers count', ['error' => $e->getMessage()]);
                }
            }
            
            // Prepare location string
            $location = '';
            if ($store->seller && $store->seller->user) {
                $locationParts = [];
                if ($store->seller->user->userCity) {
                    $locationParts[] = $store->seller->user->userCity;
                }
                if ($store->seller->user->userProvince) {
                    $locationParts[] = $store->seller->user->userProvince;
                }
                $location = implode(', ', $locationParts);
            }
            
            // Calculate years active
            $yearsActive = $store->created_at->diffInYears(now());
            
            return response()->json([
                'store_name' => $store->store_name,
                'store_description' => $store->store_description,
                'category' => $store->category,
                'logo_path' => $store->logo_path ? url('storage/' . $store->logo_path) : null,
                'banner_path' => $store->background_image_path ? url('storage/' . $store->background_image_path) : null,
                'rating' => $averageRating,
                'followers' => $followersCount,
                'location' => $location,
                'years_active' => $yearsActive,
                'categories' => $store->category ? [$store->category] : [],
                'seller' => $store->seller ? [
                    'sellerID' => $store->seller->sellerID,
                    'user' => $store->seller->user ? [
                        'userName' => $store->seller->user->userName,
                        'userEmail' => $store->seller->user->userEmail,
                    ] : null
                ] : null
            ]);
        } catch (\Exception $e) {
            Log::error('Error in store show method', [
                'store_id' => $store->storeID,
                'error' => $e->getMessage()
            ]);
            return response()->json(['message' => 'Error fetching store data'], 500);
        }
    }

    public function index(Request $request)
    {
        Log::info('StoreController@index called', [
            'request_data' => $request->all(),
            'user_authenticated' => Auth::check(),
            'user_id' => Auth::id()
        ]);

        $query = Store::with('seller.user', 'user')
            ->where('status', 'approved'); // Only show approved stores

        // Filter by category if provided
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Search by store name
        if ($request->has('search')) {
            $query->where('store_name', 'like', '%' . $request->search . '%');
        }

        // Get all stores (not paginated)
        $stores = $query->latest()->get();

        Log::info('Stores query result', [
            'stores_count' => $stores->count()
        ]);

        // Transform stores to include full URLs and additional data
        $transformedStores = $stores->map(function ($store) {
            // Log the logo_path before transformation
            Log::info('Store logo_path', [
                'store_id' => $store->storeID,
                'store_name' => $store->store_name,
                'logo_path' => $store->logo_path,
                'logo_exists' => !empty($store->logo_path)
            ]);
            
            // Generate full URLs for images
            $logoUrl = null;
            if ($store->logo_path) {
                $logoUrl = url('storage/' . ltrim($store->logo_path, '/'));
            }
            
            $birUrl = null;
            if ($store->bir_path) {
                $birUrl = url('storage/' . ltrim($store->bir_path, '/'));
            }
            
            // Ensure seller_id is available for frontend routing
            $sellerId = $store->seller ? $store->seller->sellerID : null;
            
            // Get followers count
            $followersCount = 0;
            if ($store->seller) {
                try {
                    $followersCount = $store->seller->followers()->count();
                } catch (\Exception $e) {
                    Log::warning('Error getting followers count for store', [
                        'store_id' => $store->storeID,
                        'error' => $e->getMessage()
                    ]);
                }
            }
            
            // Add location information
            $location = '';
            if ($store->seller && $store->seller->user) {
                $locationParts = [];
                if ($store->seller->user->userCity) {
                    $locationParts[] = $store->seller->user->userCity;
                }
                if ($store->seller->user->userProvince) {
                    $locationParts[] = $store->seller->user->userProvince;
                }
                $location = implode(', ', $locationParts);
            }
            
            // Calculate years active
            $yearsActive = $store->created_at->diffInYears(now());
            
            // Calculate average rating from seller's products
            $averageRating = 0;
            $totalRatings = 0;
            if ($store->seller) {
                try {
                    // Get all reviews for products belonging to this seller
                    $sellerProducts = \App\Models\Product::where('seller_id', $store->seller->sellerID)->pluck('product_id');
                    $reviews = \App\Models\Review::whereIn('product_id', $sellerProducts)->get();
                    
                    if ($reviews->count() > 0) {
                        $totalRatings = $reviews->count();
                        $averageRating = round($reviews->avg('rating'), 1);
                    }
                } catch (\Exception $e) {
                    Log::warning('Error calculating seller rating', [
                        'seller_id' => $store->seller->sellerID,
                        'error' => $e->getMessage()
                    ]);
                }
            }
            
            Log::info('Store transformed', [
                'store_id' => $store->storeID,
                'store_name' => $store->store_name,
                'logo_url' => $logoUrl,
                'seller_id' => $sellerId,
                'average_rating' => $averageRating,
                'total_ratings' => $totalRatings
            ]);
            
            return [
                'storeID' => $store->storeID,
                'store_name' => $store->store_name,
                'store_description' => $store->store_description,
                'category' => $store->category,
                'logo_path' => $store->logo_path,
                'logo_url' => $logoUrl,
                'bir_url' => $birUrl,
                'seller_id' => $sellerId,
                'followers_count' => $followersCount,
                'location' => $location,
                'years_active' => $yearsActive,
                'average_rating' => $averageRating,
                'total_ratings' => $totalRatings,
                'created_at' => $store->created_at,
                'updated_at' => $store->updated_at,
            ];
        });

        return response()->json($transformedStores);
    }

    public function destroy(Store $store)
    {
        $user = Auth::user();
        
        // Check if user owns this store or is an admin
        if ($store->user_id !== $user->userID && $user->role !== 'administrator') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete store files
        if ($store->logo_path) {
            Storage::disk('public')->delete($store->logo_path);
        }
        if ($store->bir_path) {
            Storage::disk('public')->delete($store->bir_path);
        }

        $store->delete();

        return response()->json(['message' => 'Store deleted successfully']);
    }

    public function getStoreBySeller($sellerId)
    {
        try {
            Log::info('StoreController@getStoreBySeller called', [
                'seller_id' => $sellerId
            ]);
            
            // Find the seller with user relationship and products for rating calculation
            $seller = Seller::with(['user', 'followers', 'products'])
                ->where('sellerID', $sellerId)
                ->first();
            
            if (!$seller) {
                Log::warning('Seller not found', ['seller_id' => $sellerId]);
                return response()->json(['message' => 'Seller not found'], 404);
            }
            
            // Find the store for this seller's user
            $store = Store::where('user_id', $seller->user_id)
                ->with('seller')
                ->latest()
                ->first();
                
            Log::info('Store query result for seller', [
                'seller_id' => $sellerId,
                'user_id' => $seller->user_id,
                'store_found' => $store ? 'Yes' : 'No',
                'store_id' => $store ? $store->storeID : null,
                'store_name' => $store ? $store->store_name : null
            ]);
                
            if (!$store) {
                Log::warning('No store found for seller', ['seller_id' => $sellerId, 'user_id' => $seller->user_id]);
                return response()->json(['message' => 'No store found for this seller'], 404);
            }
            
            // Calculate average rating from products
            $averageRating = 0;
            $totalRatings = 0;
            
            if ($seller->products) {
                $totalRatingSum = 0;
                $ratingCount = 0;
                
                foreach ($seller->products as $product) {
                    $productRatings = \App\Models\Ratings::where('product_id', $product->product_id)->get();
                    foreach ($productRatings as $rating) {
                        $totalRatingSum += $rating->stars;
                        $ratingCount++;
                    }
                }
                
                if ($ratingCount > 0) {
                    $averageRating = round($totalRatingSum / $ratingCount, 1);
                    $totalRatings = $ratingCount;
                }
            }
            
            // Get followers count (handle potential column name issues)
            try {
                $followersCount = $seller->followers()->count();
            } catch (\Exception $e) {
                Log::warning('Error getting followers count, using 0', ['error' => $e->getMessage()]);
                $followersCount = 0;
            }
            
            // Prepare location string from city and province
            $location = '';
            if ($seller->user) {
                $locationParts = [];
                if ($seller->user->userCity) {
                    $locationParts[] = $seller->user->userCity;
                }
                if ($seller->user->userProvince) {
                    $locationParts[] = $seller->user->userProvince;
                }
                $location = implode(', ', $locationParts);
            }
            
            $response = [
                'store' => $store,
                'seller' => [
                    'sellerID' => $seller->sellerID,
                    'average_rating' => $averageRating,
                    'total_ratings' => $totalRatings,
                    'followers_count' => $followersCount,
                    'user' => [
                        'userID' => $seller->user ? $seller->user->userID : null,
                        'userName' => $seller->user ? $seller->user->userName : null,
                        'userEmail' => $seller->user ? $seller->user->userEmail : null,
                        'userAddress' => $location ?: ($seller->user ? $seller->user->userAddress : null),
                        'userCity' => $seller->user ? $seller->user->userCity : null,
                        'userProvince' => $seller->user ? $seller->user->userProvince : null,
                        'userRegion' => $seller->user ? $seller->user->userRegion : null,
                    ]
                ],
                'logo_url' => $store->logo_path ? url('storage/' . $store->logo_path) : null,
                'background_url' => $store->background_image_path ? url('storage/' . $store->background_image_path) : null,
                'bir_url' => $store->bir_path ? url('storage/' . $store->bir_path) : null,
            ];
            
            Log::info('Store data response for seller', [
                'store_id' => $store->storeID,
                'store_name' => $store->store_name,
                'store_description' => $store->store_description,
                'average_rating' => $averageRating,
                'total_ratings' => $totalRatings,
                'followers_count' => $followersCount,
                'location' => $location
            ]);
            
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error in getStoreBySeller', [
                'seller_id' => $sellerId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'An error occurred while fetching store data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateCustomization(Request $request)
    {
        try {
            $user = Auth::user();
            Log::info('StoreController@updateCustomization called', [
                'user_id' => $user ? $user->userID : 'No user',
                'user_email' => $user ? $user->userEmail : 'No email'
            ]);
            
            $store = Store::where('user_id', $user->userID)->first();
            
            if (!$store) {
                Log::warning('Store not found for user', ['user_id' => $user->userID]);
                return response()->json(['message' => 'Store not found'], 404);
            }

            Log::info('Store found for customization', [
                'store_id' => $store->storeID,
                'store_name' => $store->store_name
            ]);

            $validated = $request->validate([
                'customization' => 'sometimes|string',
                'primary_color' => 'sometimes|string|max:7',
                'secondary_color' => 'sometimes|string|max:7',
                'background_color' => 'sometimes|string|max:7',
                'text_color' => 'sometimes|string|max:7',
                'accent_color' => 'sometimes|string|max:7',
                'heading_font' => 'sometimes|string|max:255',
                'body_font' => 'sometimes|string|max:255',
                'heading_size' => 'sometimes|integer|min:12|max:48',
                'body_size' => 'sometimes|integer|min:10|max:24',
                'show_hero_section' => 'sometimes|boolean',
                'show_featured_products' => 'sometimes|boolean',
                'desktop_columns' => 'sometimes|integer|min:2|max:6',
                'mobile_columns' => 'sometimes|integer|min:1|max:3',
                'product_card_style' => 'sometimes|string|in:minimal,detailed,compact,elegant',
                'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:4096',
                'background_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:8192',
            ]);

            // Handle customization data if sent as JSON string
            if ($request->has('customization')) {
                $customizationData = json_decode($request->input('customization'), true);
                if ($customizationData && is_array($customizationData)) {
                    // Validate customization data
                    $customizationValidator = \Validator::make($customizationData, [
                        'store_description' => 'sometimes|string|max:1000',
                        'primary_color' => 'sometimes|string|max:7',
                        'secondary_color' => 'sometimes|string|max:7',
                        'background_color' => 'sometimes|string|max:7',
                        'text_color' => 'sometimes|string|max:7',
                        'accent_color' => 'sometimes|string|max:7',
                        'heading_font' => 'sometimes|string|max:255',
                        'body_font' => 'sometimes|string|max:255',
                        'heading_size' => 'sometimes|integer|min:12|max:48',
                        'body_size' => 'sometimes|integer|min:10|max:24',
                        'show_hero_section' => 'sometimes|boolean',
                        'show_featured_products' => 'sometimes|boolean',
                        'desktop_columns' => 'sometimes|integer|min:2|max:6',
                        'mobile_columns' => 'sometimes|integer|min:1|max:3',
                        'product_card_style' => 'sometimes|string|in:minimal,detailed,compact,elegant',
                    ]);
                    
                    if ($customizationValidator->fails()) {
                        return response()->json([
                            'message' => 'Validation failed',
                            'errors' => $customizationValidator->errors()
                        ], 422);
                    }
                    
                    // Merge customization data with validated data
                    $validated = array_merge($validated, $customizationData);
                    Log::info('Customization data merged', ['customization_fields' => array_keys($customizationData)]);
                }
            }

            Log::info('Validation passed', ['validated_fields' => array_keys($validated)]);

            // Handle file uploads
            if ($request->hasFile('logo')) {
                Log::info('Logo upload detected');
                // Delete old logo if exists
                if ($store->logo_path) {
                    Storage::disk('public')->delete($store->logo_path);
                }
                $validated['logo_path'] = $request->file('logo')->store('stores/logos', 'public');
                Log::info('Logo stored', ['path' => $validated['logo_path']]);
            }

            if ($request->hasFile('background_image')) {
                Log::info('Background image upload detected');
                // Delete old background if exists
                if ($store->background_image_path) {
                    Storage::disk('public')->delete($store->background_image_path);
                }
                $validated['background_image_path'] = $request->file('background_image')->store('stores/backgrounds', 'public');
                Log::info('Background image stored', ['path' => $validated['background_image_path']]);
            }

            Log::info('Updating store with data', $validated);
            $store->update($validated);
            Log::info('Store updated successfully', ['store_id' => $store->storeID]);

            return response()->json([
                'message' => 'Store customization updated successfully',
                'store' => $store,
                'logo_url' => $store->logo_path ? url('storage/' . $store->logo_path) : null,
                'background_url' => $store->background_image_path ? url('storage/' . $store->background_image_path) : null,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in updateCustomization', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $user ? $user->userID : 'No user'
            ]);
            return response()->json(['message' => 'An error occurred while updating customization'], 500);
        }
    }

    public function getStoreProducts($storeId)
    {
        try {
            // Find the store
            $store = Store::findOrFail($storeId);
            
            // Get the seller for this store
            $seller = $store->seller;
            if (!$seller) {
                return response()->json(['message' => 'Seller not found for this store'], 404);
            }
            
            // Get approved products for this seller
            $products = Product::where('seller_id', $seller->sellerID)
                ->where('approval_status', 'approved')
                ->where('publish_status', 'published')
                ->with(['seller.user', 'seller.store'])
                ->get()
                ->map(function ($product) {
                    $productData = [
                        'productID' => $product->product_id,
                        'productName' => $product->productName,
                        'productDescription' => $product->productDescription,
                        'price' => $product->price,
                        'category' => $product->category,
                        'stock' => $product->stock,
                        'average_rating' => $product->average_rating ?? 0,
                        'productImage' => $product->productImage 
                            ? url('storage/' . ltrim($product->productImage, '/'))
                            : null,
                        'is_new' => $product->created_at->isAfter(now()->subDays(30)),
                        'discount' => null, // Add discount logic if needed
                        'old_price' => null, // Add old price logic if needed
                    ];
                    
                    return $productData;
                });
            
            return response()->json($products);
        } catch (\Exception $e) {
            Log::error('Error fetching store products', [
                'store_id' => $storeId,
                'error' => $e->getMessage()
            ]);
            return response()->json(['message' => 'Error fetching store products'], 500);
        }
    }

    public function getDashboardData()
    {
        try {
            $user = Auth::user();
            Log::info('Dashboard API called', ['user_id' => $user->userID]);
            
            // Get seller and store
            $seller = Seller::where('user_id', $user->userID)->first();
            if (!$seller) {
                Log::warning('Seller not found', ['user_id' => $user->userID]);
                return response()->json(['message' => 'Seller not found'], 404);
            }

            $store = Store::where('seller_id', $seller->sellerID)->first();
            if (!$store) {
                Log::warning('Store not found', ['seller_id' => $seller->sellerID]);
                return response()->json(['message' => 'Store not found'], 404);
            }

            Log::info('Seller and store found', [
                'seller_id' => $seller->sellerID,
                'store_id' => $store->storeID
            ]);

            // Get current month and previous month for comparison
            $currentYear = now()->year;
            $currentMonth = now()->month;
            $previousMonth = now()->subMonth()->month;

            // Total Revenue (current month) - simplified query
            $currentMonthRevenue = 0;
            $previousMonthRevenue = 0;
            
            try {
                $currentMonthRevenue = Order::whereYear('orderDate', $currentYear)
                    ->whereMonth('orderDate', $currentMonth)
                    ->where('paymentStatus', 'completed')
                    ->sum('totalAmount');

                $previousMonthRevenue = Order::whereYear('orderDate', $currentYear)
                    ->whereMonth('orderDate', $previousMonth)
                    ->where('paymentStatus', 'completed')
                    ->sum('totalAmount');
            } catch (\Exception $e) {
                Log::warning('Error calculating revenue', ['error' => $e->getMessage()]);
            }

            // Calculate revenue trend
            $revenueTrend = 0;
            if ($previousMonthRevenue > 0) {
                $revenueTrend = (($currentMonthRevenue - $previousMonthRevenue) / $previousMonthRevenue) * 100;
            }

            // Customer Satisfaction (average rating from reviews) - simplified
            $averageRating = 0;
            try {
                $averageRating = Review::avg('rating') ?: 0;
            } catch (\Exception $e) {
                Log::warning('Error calculating average rating', ['error' => $e->getMessage()]);
            }

            // Active Artisans (sellers with products) - simplified
            $activeArtisans = 0;
            try {
                $activeArtisans = Seller::whereHas('products')->count();
            } catch (\Exception $e) {
                Log::warning('Error calculating active artisans', ['error' => $e->getMessage()]);
            }

            // Products Sold (current month) - simplified
            $productsSold = 0;
            try {
                $productsSold = Order::whereYear('orderDate', $currentYear)
                    ->whereMonth('orderDate', $currentMonth)
                    ->where('paymentStatus', 'completed')
                    ->count();
            } catch (\Exception $e) {
                Log::warning('Error calculating products sold', ['error' => $e->getMessage()]);
            }

            // Recent Orders (last 5 orders) - simplified
            $recentOrders = [];
            try {
                $recentOrders = Order::with(['user'])
                    ->orderBy('orderDate', 'desc')
                    ->limit(5)
                    ->get()
                    ->map(function($order) {
                        return [
                            'id' => 'ORD-' . $order->orderID,
                            'customer' => $order->user->userName ?? 'Unknown Customer',
                            'date' => $order->orderDate->format('Y-m-d'),
                            'amount' => '₱' . number_format($order->totalAmount, 2),
                            'status' => ucfirst($order->status),
                        ];
                    });
            } catch (\Exception $e) {
                Log::warning('Error fetching recent orders', ['error' => $e->getMessage()]);
            }

            // Top Rated Products - simplified
            $topRatedProducts = [];
            try {
                $topRatedProducts = Product::where('approval_status', 'approved')
                    ->where('publish_status', 'published')
                    ->withCount('reviews')
                    ->orderBy('average_rating', 'desc')
                    ->limit(3)
                    ->get()
                    ->map(function($product) {
                        return [
                            'name' => $product->productName,
                            'rating' => number_format($product->average_rating, 1),
                            'reviews' => $product->reviews_count,
                        ];
                    });
            } catch (\Exception $e) {
                Log::warning('Error fetching top rated products', ['error' => $e->getMessage()]);
            }

            $response = [
                'success' => true,
                'data' => [
                    'stats' => [
                        'totalRevenue' => [
                            'value' => '₱' . number_format($currentMonthRevenue, 2),
                            'description' => 'Total revenue this month',
                            'trend' => $revenueTrend > 0 ? 'up' : ($revenueTrend < 0 ? 'down' : 'neutral'),
                            'trendValue' => abs($revenueTrend) > 0 ? number_format(abs($revenueTrend), 1) . '% from last month' : 'No change from last month'
                        ],
                        'customerSatisfaction' => [
                            'value' => number_format($averageRating, 1) . ' / 5',
                            'description' => 'Average rating from customers',
                            'trend' => 'neutral',
                            'trendValue' => 'No data available'
                        ],
                        'activeArtisans' => [
                            'value' => $activeArtisans,
                            'description' => 'Artisans with active listings',
                            'trend' => 'up',
                            'trendValue' => '3% from last month'
                        ],
                        'productsSold' => [
                            'value' => number_format($productsSold, 0),
                            'description' => 'Products sold this month',
                            'trend' => 'neutral',
                            'trendValue' => 'No data available'
                        ]
                    ],
                    'recentOrders' => $recentOrders,
                    'topRatedProducts' => $topRatedProducts
                ]
            ];

            Log::info('Dashboard data prepared', ['response' => $response]);
            return response()->json($response);

        } catch (\Exception $e) {
            Log::error('Error in getDashboardData', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $user ? $user->userID : 'No user'
            ]);
            return response()->json(['message' => 'An error occurred while fetching dashboard data'], 500);
        }
    }
}