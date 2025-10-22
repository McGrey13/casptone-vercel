<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Seller;


class SellerController extends AuthController
{
    /**
     * Display the seller dashboard.
     *
     * @return \Illuminate\View\View
     */
    public function dashboard()
    {
        // You can fetch seller-specific data here, e.g., their products, orders, etc.
        $seller = Auth::user()->seller; // Get the authenticated user's seller profile
        return view('seller.dashboard', compact('seller'));
    }

    /**
     * Implement the editSellerInfo() method from UML.
     * This would typically be a form submission to update seller's profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function editSellerInfo(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'userName' => ['required', 'string', 'max:255'],
            'userEmail' => ['required', 'string', 'email', 'max:255', 'unique:users,userEmail,' . $user->userID . ',userID'],
            'userContactNumber' => ['nullable', 'string', 'max:255'],
            'userAddress' => ['nullable', 'string', 'max:255'],
            // Add other user fields that a seller can edit
        ]);

        // $user->update([
        //     'userName' => $request->userName,
        //     'userEmail' => $request->userEmail,
        //     'userContactNumber' => $request->userContactNumber,
        //     'userAddress' => $request->userAddress,
        // ]);

         $user->seller->update([
            'userName' => $request->userName,
            'userEmail' => $request->userEmail,
            'userContactNumber' => $request->userContactNumber,
            'userAddress' => $request->userAddress,
         ]);

         return response()->json([
            'success' => true,
            'message' => 'Your seller information has been updated!',
        ]);
    }

      public function getAllSellers()
    {
        $sellers = Seller::with(['user', 'products.reviews', 'store'])->get();
        
        // Transform the data to include profile image URLs and ratings
        $sellersWithImages = $sellers->map(function ($seller) {
            $profileImageUrl = $seller->profile_picture_path
                ? url('storage/' . ltrim($seller->profile_picture_path, '/'))
                : '';
            
            // Calculate average rating from all product reviews
            $allReviews = $seller->products->flatMap(function($product) {
                return $product->reviews;
            });
            $averageRating = $allReviews->count() > 0 ? $allReviews->avg('rating') : 0;
            $totalReviews = $allReviews->count();
            
            // Get store logo if available
            $storeLogo = '';
            if ($seller->store && $seller->store->logo_path) {
                $storeLogo = url('storage/' . ltrim($seller->store->logo_path, '/'));
            }
                
            return [
                'sellerID' => $seller->sellerID,
                'user' => $seller->user,
                'profile_picture_path' => $seller->profile_picture_path,
                'profile_image_url' => $profileImageUrl,
                'specialty' => $seller->specialty ?? '',
                'story' => $seller->story ?? '',
                'video_url' => $seller->video_url ?? '',
                'featured' => $seller->featured ?? false,
                'rating' => round($averageRating, 2),
                'total_reviews' => $totalReviews,
                'productCount' => $seller->products()->count(),
                'store_logo' => $storeLogo,
                'store_name' => $seller->store->store_name ?? '',
            ];
        });

        return response()->json($sellersWithImages);
    }

     public function getSellerById($sellerID)
    {
        // Fetch seller with their related user info and products with reviews
        $seller = Seller::with(['user', 'products.reviews'])->where('sellerID', $sellerID)->first();

        if (!$seller) {
            return response()->json(['message' => 'Seller not found'], 404);
        }

        // Get profile image URL
        $profileImageUrl = $seller->profile_picture_path
            ? url('storage/' . ltrim($seller->profile_picture_path, '/'))
            : '';

        // Calculate seller statistics
        $sellerOrders = $seller->getSellerOrders();
        $totalRevenue = $sellerOrders->sum(function($order) {
            return $order->products->sum(function($product) {
                return $product->pivot->quantity * $product->pivot->price;
            });
        });
        
        $totalOrders = $sellerOrders->count();
        $productsCount = $seller->products->count();
        
        // Calculate average rating from all product reviews
        $allReviews = $seller->products->flatMap(function($product) {
            return $product->reviews;
        });
        $averageRating = $allReviews->count() > 0 ? $allReviews->avg('rating') : 0;
        $totalReviews = $allReviews->count();

        \Log::info('Seller details statistics', [
            'seller_id' => $seller->sellerID,
            'products_count' => $productsCount,
            'total_revenue' => $totalRevenue,
            'total_orders' => $totalOrders,
            'average_rating' => $averageRating,
            'total_reviews' => $totalReviews
        ]);

        return response()->json([
            'sellerID' => $seller->sellerID,
            'businessName' => $seller->businessName ?? '',
            'created_at' => $seller->created_at,
            'user' => $seller->user,
            'profile_picture_path' => $seller->profile_picture_path,
            'profile_image_url' => $profileImageUrl,
            'specialty' => $seller->specialty ?? '',
            'story' => $seller->story ?? '',
            'video_url' => $seller->video_url ?? '',
            'featured' => $seller->featured ?? false,
            // Statistics
            'products_count' => $productsCount,
            'total_revenue' => $totalRevenue,
            'total_orders' => $totalOrders,
            'average_rating' => round($averageRating, 2),
            'total_reviews' => $totalReviews,
        ]);
    }

    public function getArtisanDetails($id)
    {
        $seller = Seller::with(['user', 'products' => function ($q) {
            $q->where('approval_status', 'approved');
        }, 'products.reviews'])->where('sellerID', $id)->first();

        if (!$seller) {
            return response()->json(['message' => 'Seller not found'], 404);
        }

        // Get profile image URL
        $profileImageUrl = $seller->profile_picture_path
            ? url('storage/' . ltrim($seller->profile_picture_path, '/'))
            : '';

        // Calculate seller statistics
        $sellerOrders = $seller->getSellerOrders();
        $totalRevenue = $sellerOrders->sum(function($order) {
            return $order->products->sum(function($product) {
                return $product->pivot->quantity * $product->pivot->price;
            });
        });
        
        $totalOrders = $sellerOrders->count();
        $productsCount = $seller->products->count();
        
        // Calculate average rating from all product reviews
        $allReviews = $seller->products->flatMap(function($product) {
            return $product->reviews;
        });
        $averageRating = $allReviews->count() > 0 ? $allReviews->avg('rating') : 0;
        $totalReviews = $allReviews->count();

        \Log::info('Artisan details statistics', [
            'seller_id' => $seller->sellerID,
            'products_count' => $productsCount,
            'total_revenue' => $totalRevenue,
            'total_orders' => $totalOrders,
            'average_rating' => $averageRating,
            'total_reviews' => $totalReviews
        ]);

        return response()->json([
            'id' => $seller->sellerID,
            'businessName' => $seller->businessName ?? '',
            'created_at' => $seller->created_at,
            'user' => [
                'userName' => $seller->user->userName,
                'userAddress' => $seller->user->userAddress,
                'userCity' => $seller->user->userCity ?? null,
                'userProvince' => $seller->user->userProvince ?? null,
                'profile_photo_url' => $profileImageUrl,
            ],
            'profile_picture_path' => $seller->profile_picture_path,
            'profile_image_url' => $profileImageUrl,
            'specialty' => $seller->specialty ?? '',
            'video_url' => $seller->video_url ?? '',
            // Statistics
            'products_count' => $productsCount,
            'total_revenue' => $totalRevenue,
            'total_orders' => $totalOrders,
            'average_rating' => round($averageRating, 2),
            'total_reviews' => $totalReviews,
            // Products list
            'products' => $seller->products->map(function ($p) {
                $image = $p->productImage;
                $imageUrl = $image && str_starts_with($image, 'http')
                    ? $image
                    : ($image ? url('storage/' . ltrim($image, '/')) : '');
                return [
                    'id' => $p->product_id,
                    'productName' => $p->productName,
                    'productPrice' => $p->productPrice,
                    'productImage' => $imageUrl,
                    'productDescription' => $p->productDescription,
                    'category' => $p->category,
                    'status' => $p->status,
                    'approval_status' => $p->approval_status,
                ];
            }),
        ]);
    }

    // Show the authenticated seller's profile
    public function showProfile(Request $request)
    {   
        try {
            \Log::info('Seller profile request', [
                'cookies' => $request->cookies->all(),
                'headers' => $request->headers->all(),
                'user_authenticated' => Auth::check(),
                'user_id' => Auth::id()
            ]);
            
            $user = Auth::user();
            
            if (!$user) {
                \Log::warning('User not authenticated in showProfile');
                return response()->json(['error' => 'User not authenticated'], 401);
            }

            // Load the seller relationship with store
            $seller = $user->seller;
            
            // If seller doesn't exist, create a new one
            if (!$seller) {
                $seller = Seller::create([
                    'user_id' => $user->userID,
                    'businessName' => $user->userName . "'s Business",
                    'story' => '',
                    'website' => '',
                ]);
            }

            // Load the store relationship
            $seller->load('store');

            // Get profile image URL
            $profileImageUrl = '';
            if ($seller->profile_picture_path) {
                $profileImageUrl = str_contains($seller->profile_picture_path, 'http') 
                    ? $seller->profile_picture_path 
                    : url('storage/' . ltrim($seller->profile_picture_path, '/'));
            }

            return response()->json([
                'success' => true,
                'sellerID' => $seller->sellerID,
                'userID' => $user->userID,
                'userName' => $user->userName,
                'userEmail' => $user->userEmail,
                'role' => $user->role,
                'userBirthday' => $user->userBirthday,
                'userContactNumber' => $user->userContactNumber,
                'userAddress' => $user->userAddress,
                'userCity' => $user->userCity ?? '',
                'userProvince' => $user->userProvince ?? '',
                'profileImage' => $profileImageUrl,
                'story' => $seller->story ?? '',
                'website' => $seller->website ?? '',
                'businessName' => $seller->businessName ?? '',
                'store' => $seller->store, // Include store information
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error in showProfile: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch profile',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }


        // Update the seller's profile
        public function updateSellerProfile(Request $request, $sellerID)
    {
        $seller = Seller::find($sellerID);
        if (!$seller) {
            return response()->json(['message' => 'Seller not found.'], 404);
        }

        $user = $seller->user;
        if (!$user) {
            return response()->json(['message' => 'User not found for this seller.'], 404);
        }

        $request->validate([
            'story' => 'nullable|string|max:1000',
            'userName' => 'nullable|string|max:255',
            'profileImage' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ], [
            'profileImage.image' => 'The file must be an image.',
            'profileImage.mimes' => 'The image must be a file of type: jpeg, png, jpg, gif.',
            'profileImage.max' => 'The image may not be greater than 2MB.',
        ]);

        if ($request->hasFile('profileImage')) {
            \Log::info('Profile image upload detected', [
                'original_name' => $request->file('profileImage')->getClientOriginalName(),
                'size' => $request->file('profileImage')->getSize(),
                'mime_type' => $request->file('profileImage')->getMimeType(),
            ]);
            
            // Delete old image if it exists
            if ($seller->profile_picture_path) {
                \Log::info('Deleting old profile image', ['path' => $seller->profile_picture_path]);
                \Storage::disk('public')->delete($seller->profile_picture_path);
            }
            
            $path = $request->file('profileImage')->store('profile_images', 'public');
            \Log::info('Profile image stored', ['path' => $path]);
            
            // Save relative path; response will convert to public URL
            $seller->profile_picture_path = $path;
            $seller->save();
        } else {
            \Log::info('No profile image in request');
        }

        if ($request->filled('userName')) {
            $user->userName = $request->input('userName');
            $user->save();
        }

        if ($request->filled('story')) {
            $seller->story = $request->input('story');
            $seller->save();
        }

        // Always get the current profile image URL, whether updated or existing
        $profileImageUrl = $seller->profile_picture_path
            ? url('storage/' . ltrim($seller->profile_picture_path, '/'))
            : '';

        \Log::info('Profile update response', [
            'seller_id' => $seller->sellerID,
            'profile_picture_path' => $seller->profile_picture_path,
            'profile_image_url' => $profileImageUrl,
            'story' => $seller->story,
        ]);

        return response()->json([
            'sellerID' => $seller->sellerID,
            'userName' => $user->userName,
            'userEmail' => $user->userEmail,
            'role' => $user->role,
            'userBirthday' => $user->userBirthday,
            'userContactNumber' => $user->userContactNumber,
            'userAddress' => $user->userAddress,
            'profileImage' => $profileImageUrl,
            'story' => $seller->story ?? '',
            'website' => $seller->website ?? '',
        ]);
    }

}
