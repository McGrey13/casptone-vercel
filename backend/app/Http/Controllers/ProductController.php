<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Models\Product;
use app\Models\Seller;
use App\Services\ProductValidationService;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    
    // check if the user is a seller
    private function checkSeller()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        $seller = $user->seller;
        if (!$seller) {
            return response()->json(['message' => 'User is not a seller'], 403);
        }
        
        return $seller;
    }

    /**
     * Check if the product belongs to the authenticated seller
     */
    private function checkProductOwnership(Product $product)
    {
        $seller = $this->checkSeller();
        if ($seller instanceof \Illuminate\Http\JsonResponse) {
            return $seller;
        }
        
        if ($product->seller_id !== $seller->sellerID) {
            return response()->json(['message' => 'Unauthorized - Product does not belong to you'], 403);
        }
        
        return true;
    }

    // view all products
    public function index()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            if ($user->role === 'administrator') {
                // Admin can view all products with seller info (excluding drafts)
                Log::info('Admin fetching all products (excluding drafts)');
                $products = Product::with('seller.user')
                    ->where('approval_status', '!=', 'draft')
                    ->get(); 
            } elseif ($user->role === 'seller') {
                $seller = $user->seller;
                if (!$seller) {
                    return response()->json(['message' => 'User is not a seller'], 403);
                }

                Log::info('Seller fetching products', ['seller_id' => $seller->sellerID]);
                $products = Product::where('seller_id', $seller->sellerID)->get();
            } else {
                return response()->json(['message' => 'Unauthorized role'], 403);
            }

            // Transform products to include full image URLs
            $productsWithImages = $products->map(function ($product) {
                $productImageUrl = $product->productImage
                    ? url('storage/' . ltrim($product->productImage, '/'))
                    : '';
                
                // Handle multiple product images
                $productImagesUrls = [];
                
                // Manually decode productImages if it's a JSON string
                $productImages = $product->productImages;
                if (is_string($productImages)) {
                    $productImages = json_decode($productImages, true);
                }
                
                if ($productImages && is_array($productImages)) {
                    $productImagesUrls = array_map(function($imagePath) {
                        return url('storage/' . ltrim($imagePath, '/'));
                    }, $productImages);
                }
                    
                $productData = [
                    'id' => $product->product_id,
                    'product_id' => $product->product_id,
                    'productName' => $product->productName,
                    'productDescription' => $product->productDescription,
                    'productPrice' => $product->productPrice,
                    'productQuantity' => $product->productQuantity,
                    'status' => $product->status,
                    'productImage' => $productImageUrl,
                    'productImages' => $productImagesUrls,
                    'productVideo' => $product->productVideo,
                    'category' => $product->category,
                    'seller_id' => $product->seller_id,
                    'approval_status' => $product->approval_status,
                    'publish_status' => $product->publish_status,
                    'is_featured' => $product->is_featured, // Add featured status
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                ];

                // Include seller information if available
                if ($product->seller) {
                    $productData['seller'] = [
                        'sellerID' => $product->seller->sellerID,
                        'businessName' => $product->seller->businessName,
                        'user' => $product->seller->user ? [
                            'userName' => $product->seller->user->userName,
                            'userEmail' => $product->seller->user->userEmail,
                            'userAddress' => $product->seller->user->userAddress,
                        ] : null,
                        'profile_picture_path' => $product->seller->profile_picture_path,
                        'profile_image_url' => $product->seller->profile_picture_path
                            ? url('storage/' . ltrim($product->seller->profile_picture_path, '/'))
                            : '',
                    ];

                    // Include store information if available
                    if ($product->seller->store) {
                        $productData['seller']['store'] = [
                            'storeID' => $product->seller->store->storeID,
                            'store_name' => $product->seller->store->store_name,
                            'store_description' => $product->seller->store->store_description,
                            'category' => $product->seller->store->category,
                            'logo_path' => $product->seller->store->logo_path,
                            'logo_url' => $product->seller->store->logo_path
                                ? url('storage/' . ltrim($product->seller->store->logo_path, '/'))
                                : '',
                        ];
                    }
                }

                return $productData;
            });

            return response()->json($productsWithImages);
        } catch (\Exception $e) {
            Log::error('Error fetching products:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error fetching products: ' . $e->getMessage()], 500);
        }
    }

    

    /**
     * Get product statistics for the authenticated seller
     */
    public function stats()
    {
        try {
            $seller = $this->checkSeller();
            if ($seller instanceof \Illuminate\Http\JsonResponse) {
                return $seller;
            }
            
            $sellerId = $seller->sellerID;
            
            $totalProducts = Product::where('seller_id', $sellerId)->count();
            $inStock = Product::where('seller_id', $sellerId)->where('status', 'in stock')->count();
            // Fix: Removed `->now()` which doesn't exist
            $lowStock = Product::where('seller_id', $sellerId)->where('status', 'low stock')->count();
            $outOfStock = Product::where('seller_id', $sellerId)->where('status', 'out of stock')->count();
            
            return response()->json([
                'total_products' => $totalProducts,
                'in_stock' => $inStock,
                'low_stock' => $lowStock,
                'out_of_stock' => $outOfStock
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching product stats:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error fetching product stats: ' . $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        Log::info('Product creation request received', $request->all());

        $seller = $this->checkSeller();
        if ($seller instanceof \Illuminate\Http\JsonResponse) {
            return $seller;
        }
        
        $data = $request->validate([
            'productName' => 'required|string|max:255',
            'productDescription' => 'nullable|string',
            'productPrice' => 'required|numeric',
            'productQuantity' => 'required|integer|min:0',
            'category' => 'required|string',
            'status' => 'nullable|in:in stock,low stock,out of stock',
            'publish_status' => 'nullable|in:published,draft',
            'productImage' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
            'productImages' => 'nullable|array',
            'productImages.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
            'productVideo' => 'nullable|mimes:mp4,avi,mov|max:20480',
        ]);
        
        $sellerId = $seller->sellerID;
        Log::info('Seller ID:', ['seller_id' => $sellerId]);

        // Assign the seller_id to the data array
        $data['seller_id'] = $sellerId;
        
        // Set default status if not provided
        if (!isset($data['status'])) {
            $data['status'] = 'in stock';
        }

        // Set default publish_status if not provided
        if (!isset($data['publish_status'])) {
            $data['publish_status'] = 'draft';
        }

        // Validate product using validation service
        $validation = ProductValidationService::validateProduct($data);
        
        // Set approval status based on validation
        if (!$validation['valid']) {
            $data['approval_status'] = 'rejected';
            $data['rejection_reason'] = $validation['rejection_reason'];
        } elseif ($validation['auto_approve']) {
            $data['approval_status'] = 'approved';
        } else {
            $data['approval_status'] = 'pending';
        }
        
        // Generate unique SKU
        $data['sku'] = $this->generateSKU($sellerId, $data['category']);

        Log::info('Data to be saved:', $data);

        // Handle main image upload
        if ($request->hasFile('productImage')) {
            $data['productImage'] = $request->file('productImage')->store('images', 'public');
            Log::info('Main image uploaded:', ['path' => $data['productImage']]);
        }

        // Handle multiple additional images
        if ($request->hasFile('productImages')) {
            $additionalImages = [];
            foreach ($request->file('productImages') as $index => $file) {
                if ($file && $file->isValid()) {
                    $path = $file->store('images', 'public');
                    $additionalImages[$index] = $path;
                    Log::info('Additional image uploaded:', ['index' => $index, 'path' => $path]);
                }
            }
            if (!empty($additionalImages)) {
                $data['productImages'] = json_encode($additionalImages);
            }
        }

        // Handle video upload
        if ($request->hasFile('productVideo')) {
            $data['productVideo'] = $request->file('productVideo')->store('videos', 'public');
            Log::info('Video uploaded:', ['path' => $data['productVideo']]);
        }

        try {
            // If product validation failed, return error response
            if (!$validation['valid']) {
                Log::warning('Product validation failed', [
                    'seller_id' => $sellerId,
                    'errors' => $validation['errors'],
                    'rejection_reason' => $validation['rejection_reason']
                ]);
                
                return response()->json([
                    'message' => 'Product validation failed',
                    'errors' => $validation['errors'],
                    'rejection_reason' => $validation['rejection_reason'],
                    'suggestions' => ProductValidationService::getImprovementSuggestion($validation)
                ], 422);
            }
            
            $product = Product::create($data);
            Log::info('Product created successfully:', [
                'product_id' => $product->product_id,
                'sku' => $product->sku,
                'approval_status' => $product->approval_status
            ]);
            
            // Transform product to include full image URL
            $productImageUrl = $product->productImage
                ? url('storage/' . ltrim($product->productImage, '/'))
                : '';
                
            $productData = [
                'id' => $product->product_id,
                'product_id' => $product->product_id,
                'productName' => $product->productName,
                'productDescription' => $product->productDescription,
                'productPrice' => $product->productPrice,
                'productQuantity' => $product->productQuantity,
                'status' => $product->status,
                'productImage' => $productImageUrl,
                'productVideo' => $product->productVideo,
                'category' => $product->category,
                'seller_id' => $product->seller_id,
                'approval_status' => $product->approval_status,
                'publish_status' => $product->publish_status,
                'sku' => $product->sku,
                'rejection_reason' => $product->rejection_reason,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ];
            
            // Return appropriate message based on approval status
            $message = 'Product created successfully!';
            if ($product->approval_status === 'pending') {
                $message = 'Product submitted for review. It will be approved by an administrator shortly.';
            } elseif ($product->approval_status === 'approved') {
                $message = 'Product approved and created successfully!';
            }
            
            return response()->json([
                'message' => $message,
                'product' => $productData,
                'validation_warnings' => $validation['warnings'] ?? []
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating product:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error creating product: ' . $e->getMessage()], 500);
        }
    }

    // update product
    public function update(Request $request, Product $product) // Changed parameter order for consistency
    {
        try {
            Log::info('Product update attempt', [
                'product_id' => $product->product_id,
                'request_data' => $request->except(['productImage', 'productImages', 'productVideo'])
            ]);

            $ownershipCheck = $this->checkProductOwnership($product);
            if ($ownershipCheck instanceof \Illuminate\Http\JsonResponse) {
                return $ownershipCheck;
            }

            // If you are sending a POST with _method=PUT, Laravel automatically handles it.
            // You don't need a custom check here.
        $data = $request->validate([
            'productName' => 'required|string|max:255',
            'productDescription' => 'nullable|string',
            'productPrice' => 'required|numeric',
            'productQuantity' => 'required|integer|min:0',
            'category' => 'required|string',
            'tags' => 'nullable|array',
            'tags.*' => 'nullable|string',
            'status' => 'nullable|in:in stock,low stock,out of stock',
            'publish_status' => 'nullable|in:published,draft',
            'productImage' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
            'productImages' => 'nullable|array',
            'productImages.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
            'existingImages' => 'nullable|array',
            'existingImages.*' => 'nullable|string',
            'mainImageIndex' => 'nullable|integer',
            'mainExistingImageIndex' => 'nullable|integer',
            'productVideo' => 'nullable|mimes:mp4,avi,mov|max:20480',
            'sku' => 'nullable|string|max:255'
        ]);
        
        // Handle tags - convert to JSON if present
        if (isset($data['tags']) && is_array($data['tags'])) {
            $data['tags'] = json_encode($data['tags']);
        }
        
        // Preserve approval status - sellers cannot change it
        $data['approval_status'] = $product->approval_status;

        if ($request->hasFile('productImage')) {
            $data['productImage'] = $request->file('productImage')->store('images', 'public');
        }

        // Handle multiple additional images
        $allImages = [];
        $mainImagePath = null;
        
        // Get existing images from the request
        if ($request->has('existingImages')) {
            $existingImages = $request->input('existingImages', []);
            $mainExistingImageIndex = $request->input('mainExistingImageIndex');
            
            foreach ($existingImages as $index => $imageUrl) {
                if ($imageUrl) {
                    // Extract the relative path from the full URL
                    $relativePath = str_replace(url('storage/'), '', $imageUrl);
                    $relativePath = ltrim($relativePath, '/');
                    if (!empty($relativePath)) {
                        $allImages[] = $relativePath;
                        
                        // Check if this is the main image
                        if ($mainExistingImageIndex !== null && $index == $mainExistingImageIndex) {
                            $mainImagePath = $relativePath;
                        }
                    }
                }
            }
        }
        
        // Add new uploaded images
        if ($request->hasFile('productImages')) {
            $mainImageIndex = $request->input('mainImageIndex');
            $newImagePaths = [];
            
            foreach ($request->file('productImages') as $index => $file) {
                if ($file && $file->isValid()) {
                    $path = $file->store('images', 'public');
                    $newImagePaths[] = $path;
                    
                    // Check if this is the main image
                    if ($mainImageIndex !== null && $index == $mainImageIndex) {
                        $mainImagePath = $path;
                    }
                }
            }
            
            // Merge new images with existing ones
            $allImages = array_merge($allImages, $newImagePaths);
        }
        
        // Update productImages if we have any images
        if (!empty($allImages)) {
            $data['productImages'] = json_encode($allImages);
        }
        
        // Set main image if specified
        if ($mainImagePath) {
            $data['productImage'] = $mainImagePath;
        }

        if ($request->hasFile('productVideo')) {
            $data['productVideo'] = $request->file('productVideo')->store('videos', 'public');
        }

            $product->update($data);
            Log::info('Product updated successfully:', ['product_id' => $product->product_id]);
            
            // Transform product to include full image URL
            $productImageUrl = $product->productImage
                ? url('storage/' . ltrim($product->productImage, '/'))
                : '';
                
            $productData = [
                'id' => $product->product_id,
                'product_id' => $product->product_id,
                'productName' => $product->productName,
                'productDescription' => $product->productDescription,
                'productPrice' => $product->productPrice,
                'productQuantity' => $product->productQuantity,
                'status' => $product->status,
                'productImage' => $productImageUrl,
                'productVideo' => $product->productVideo,
                'category' => $product->category,
                'seller_id' => $product->seller_id,
                'approval_status' => $product->approval_status,
                'publish_status' => $product->publish_status,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ];
            
            return response()->json(['message' => 'Product updated successfully!', 'product' => $productData]);
        } catch (\Exception $e) {
            Log::error('Error updating product:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error updating product: ' . $e->getMessage()], 500);
        }
    }

    // delete product
    public function destroy(Product $product)
    {
        $ownershipCheck = $this->checkProductOwnership($product);
        if ($ownershipCheck instanceof \Illuminate\Http\JsonResponse) {
            return $ownershipCheck;
        }

        try {
            $product->delete();
            Log::info('Product deleted successfully:', ['product_id' => $product->product_id]);
            return response()->json(['message' => 'Product deleted successfully!']);
        } catch (\Exception $e) {
            Log::error('Error deleting product:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error deleting product: ' . $e->getMessage()], 500);
        }
    }

    // search product
    public function search($name)
    {
        try {
            $seller = $this->checkSeller();
            if ($seller instanceof \Illuminate\Http\JsonResponse) {
                return $seller;
            }
            
            $sellerId = $seller->sellerID;
            try {
                $products = Product::where('seller_id', $sellerId)
                                 ->where('productName', 'like', '%' . $name . '%')
                                 ->get();
                Log::info('Products search completed:', ['search_term' => $name, 'count' => $products->count()]);
                
                // Transform products to include full image URLs
                $productsWithImages = $products->map(function ($product) {
                    $productImageUrl = $product->productImage
                        ? url('storage/' . ltrim($product->productImage, '/'))
                        : '';
                        
                    return [
                        'id' => $product->product_id,
                        'product_id' => $product->product_id,
                        'productName' => $product->productName,
                        'productDescription' => $product->productDescription,
                        'productPrice' => $product->productPrice,
                        'productQuantity' => $product->productQuantity,
                        'status' => $product->status,
                        'productImage' => $productImageUrl,
                        'productVideo' => $product->productVideo,
                        'category' => $product->category,
                        'seller_id' => $product->seller_id,
                        'approval_status' => $product->approval_status,
                        'publish_status' => $product->publish_status,
                        'created_at' => $product->created_at,
                        'updated_at' => $product->updated_at,
                    ];
                });
                
                return response()->json($productsWithImages);
            } catch (\Exception $e) {
                Log::error('Error searching products:', ['error' => $e->getMessage()]);
                return response()->json(['message' => 'Error searching products: ' . $e->getMessage()], 500);
            }
        } catch (\Exception $e) {
            Log::error('Error searching products:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error searching products: ' . $e->getMessage()], 500);
        }
    }

    // get product details
    public function getProductDetails($id)
    {
        try {
            $product = Product::with(['seller.user', 'reviews.user'])->findOrFail($id);

            $productImageUrl = $product->productImage
                ? url('storage/' . ltrim($product->productImage, '/'))
                : '';

            $productVideoUrl = $product->productVideo
                ? url('storage/' . ltrim($product->productVideo, '/'))
                : null;

            // Handle multiple product images
            $productImagesUrls = [];
            
            // Manually decode productImages if it's a JSON string
            $productImages = $product->productImages;
            if (is_string($productImages)) {
                $productImages = json_decode($productImages, true);
            }
            
            if ($productImages && is_array($productImages)) {
                $productImagesUrls = array_map(function($imagePath) {
                    return url('storage/' . ltrim($imagePath, '/'));
                }, $productImages);
            }

            // Calculate reviews and ratings
            $reviews = $product->reviews;
            $averageRating = $reviews->count() > 0 ? $reviews->avg('rating') : 0;
            $totalReviews = $reviews->count();

            // Format reviews for frontend
            $formattedReviews = $reviews->map(function($review) {
                return [
                    'review_id' => $review->review_id,
                    'id' => $review->review_id, // For compatibility
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'review_date' => $review->review_date,
                    'created_at' => $review->created_at,
                    'user' => $review->user ? [
                        'userName' => $review->user->userName,
                        'userEmail' => $review->user->userEmail,
                    ] : null,
                ];
            });

            $productData = [
                'id' => $product->product_id,
                'productName' => $product->productName,
                'productDescription' => $product->productDescription,
                'productPrice' => $product->productPrice,
                'productQuantity' => $product->productQuantity,
                'status' => $product->status,
                'productImage' => $productImageUrl,
                'productImages' => $productImagesUrls,
                'productVideo' => $productVideoUrl,
                'category' => $product->category,
                'seller_id' => $product->seller_id,
                'approval_status' => $product->approval_status,
                'publish_status' => $product->publish_status,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
                // Reviews and ratings data
                'reviews' => $formattedReviews,
                'average_rating' => round($averageRating, 2),
                'total_reviews' => $totalReviews,
            ];

            if ($product->seller) {
                $productData['seller'] = [
                    'sellerID' => $product->seller->sellerID,
                    'businessName' => $product->seller->businessName,
                    'user' => $product->seller->user ? [
                        'userName' => $product->seller->user->userName,
                        'userEmail' => $product->seller->user->userEmail,
                        'userAddress' => $product->seller->user->userAddress,
                    ] : null,
                    'profile_picture_path' => $product->seller->profile_picture_path,
                    'profile_image_url' => $product->seller->profile_picture_path
                        ? url('storage/' . ltrim($product->seller->profile_picture_path, '/'))
                        : '',
                ];

                // Include store information if available
                if ($product->seller->store) {
                    $productData['seller']['store'] = [
                        'storeID' => $product->seller->store->storeID,
                        'store_name' => $product->seller->store->store_name,
                        'store_description' => $product->seller->store->store_description,
                        'category' => $product->seller->store->category,
                        'logo_path' => $product->seller->store->logo_path,
                        'logo_url' => $product->seller->store->logo_path
                            ? url('storage/' . ltrim($product->seller->store->logo_path, '/'))
                            : '',
                    ];
                }
            }

            return response()->json($productData);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Product not found'], 404);
        } catch (\Exception $e) {
            Log::error('Error fetching product details:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Error fetching product details: ' . $e->getMessage()
            ], 500);
        }
    }

    // view product
    public function show(Product $product)
    {
        try {
            $ownershipCheck = $this->checkProductOwnership($product);
            if ($ownershipCheck instanceof \Illuminate\Http\JsonResponse) {
                return $ownershipCheck;
            }
            
            // Transform product to include full image URL
            $productImageUrl = $product->productImage
                ? url('storage/' . ltrim($product->productImage, '/'))
                : '';

            // Handle multiple product images
            $productImagesUrls = [];
            
            // Manually decode productImages if it's a JSON string
            $productImages = $product->productImages;
            if (is_string($productImages)) {
                $productImages = json_decode($productImages, true);
            }
            
            if ($productImages && is_array($productImages)) {
                $productImagesUrls = array_map(function($imagePath) {
                    return url('storage/' . ltrim($imagePath, '/'));
                }, $productImages);
            }
                
            $productData = [
                'id' => $product->product_id,
                'product_id' => $product->product_id,
                'productName' => $product->productName,
                'productDescription' => $product->productDescription,
                'productPrice' => $product->productPrice,
                'productQuantity' => $product->productQuantity,
                'status' => $product->status,
                'productImage' => $productImageUrl,
                'productImages' => $productImagesUrls,
                'productVideo' => $product->productVideo
                    ? url('storage/' . ltrim($product->productVideo, '/'))
                    : '',
                'category' => $product->category,
                'seller_id' => $product->seller_id,
                'approval_status' => $product->approval_status,
                'publish_status' => $product->publish_status,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ];

            // Include seller information if available
            if ($product->seller) {
                $productData['seller'] = [
                    'sellerID' => $product->seller->sellerID,
                    'user' => $product->seller->user ? [
                        'userName' => $product->seller->user->userName,
                        'userEmail' => $product->seller->user->userEmail,
                        'userAddress' => $product->seller->user->userAddress,
                    ] : null,
                    'profile_picture_path' => $product->seller->profile_picture_path,
                    'profile_image_url' => $product->seller->profile_picture_path
                        ? url('storage/' . ltrim($product->seller->profile_picture_path, '/'))
                        : '',
                ];
            }
            
            Log::info('Product retrieved successfully:', ['product_id' => $product->product_id]);
            return response()->json($productData);
        } catch (\Exception $e) {
            Log::error('Error retrieving product:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error retrieving product: ' . $e->getMessage()], 500);
        }
    }

    // Approve a product
    public function approve($id)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'administrator') {
            return response()->json(['message' => 'Only admins can approve products'], 403);
        }

        // Find the product by its ID
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->approval_status = 'approved';
        $product->save();

        return response()->json(['message' => 'Product approved successfully']);
    }

    // Reject a product
    public function reject(Request $request, $id)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'administrator') {
            return response()->json(['message' => 'Only admins can reject products'], 403);
        }

        // Find the product by its ID
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->approval_status = 'rejected';
        $product->rejection_reason = $request->input('reason', 'Rejected by administrator');
        $product->save();

        Log::info('Product rejected by admin', [
            'product_id' => $product->product_id,
            'reason' => $product->rejection_reason,
            'admin_id' => $user->userID
        ]);

        return response()->json([
            'message' => 'Product rejected successfully',
            'rejection_reason' => $product->rejection_reason
        ]);
    }

    /**
     * Get all approved products for a given seller
     */
    public function approvedProduct($seller_id)
    {
        try {
            // Find the seller by ID or linked user_id
            $seller = Seller::where('id', $seller_id)
                ->orWhere('user_id', $seller_id)
                ->first();

            if (!$seller) {
                return response()->json([
                    'message' => 'Seller not found'
                ], 404);
            }

            // Fetch approved products for this seller
            $products = Product::where('seller_id', $seller->id) // ✅ correct column
                ->where('approval_status', 'approved')
                ->get();

            if ($products->isEmpty()) {
                return response()->json([
                    'message' => 'No approved products found for this seller'
                ], 200);
            }

            // Transform products to include full image URLs
            $productsWithImages = $products->map(function ($product) {
                $productImageUrl = $product->productImage
                    ? url('storage/' . ltrim($product->productImage, '/'))
                    : '';
                    
                return [
                    'id' => $product->product_id,
                    'productName' => $product->productName,
                    'productDescription' => $product->productDescription,
                    'productPrice' => $product->productPrice,
                    'productQuantity' => $product->productQuantity,
                    'status' => $product->status,
                    'productImage' => $productImageUrl,
                    'productVideo' => $product->productVideo,
                    'category' => $product->category,
                    'seller_id' => $product->seller_id,
                    'approval_status' => $product->approval_status,
                    'publish_status' => $product->publish_status,
                    'is_featured' => $product->is_featured, // Add featured status
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                ];
            });

            return response()->json($productsWithImages);

        } catch (\Exception $e) {
            Log::error('Error fetching approved products for seller:', [
                'seller_id' => $seller_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Error fetching approved products: ' . $e->getMessage()
            ], 500);
        }
    }
    /**
     * Get all approved products for public viewing
     */
    public function getApprovedProducts($sellerId)
    {
        $products = Product::where('seller_id', $sellerId) 
                           ->where('approval_status', 'approved')
                           ->where('publish_status', 'published')
                           ->get();

        // Transform products to include full image URLs
        $productsWithImages = $products->map(function ($product) {
            $productImageUrl = $product->productImage
                ? url('storage/' . ltrim($product->productImage, '/'))
                : '';
                
            return [
                'id' => $product->product_id,
                'product_id' => $product->product_id,
                'productName' => $product->productName,
                'productDescription' => $product->productDescription,
                'productPrice' => $product->productPrice,
                'productQuantity' => $product->productQuantity,
                'status' => $product->status,
                'productImage' => $productImageUrl,
                'productVideo' => $product->productVideo,
                'category' => $product->category,
                'seller_id' => $product->seller_id,
                'approval_status' => $product->approval_status,
                'publish_status' => $product->publish_status,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ];
        });

        return response()->json($productsWithImages);
    }
    
    /**
     * Toggle featured status of a product
     */
    public function toggleFeatured($id)
    {
        try {
            $product = Product::findOrFail($id);
            
            // Check if the product belongs to the authenticated seller
            $ownershipCheck = $this->checkProductOwnership($product);
            if ($ownershipCheck !== true) {
                return $ownershipCheck;
            }
            
            $product->is_featured = !$product->is_featured;
            $product->save();
            
            return response()->json([
                'success' => true,
                'is_featured' => $product->is_featured,
                'message' => 'Product featured status updated successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update featured status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get featured products for public viewing
     */
    public function featuredProducts()
    {
        try {
            $products = Product::with(['seller.user', 'seller.store', 'reviews.user'])
                ->where('approval_status', 'approved')
                ->where('publish_status', 'published')
                ->where('is_featured', true)
                ->whereHas('seller.user', function($q) {
                    $q->where('status', 'active'); // Only show products from active sellers
                })
                ->get();

            // Transform products to include full image URLs
            $productsWithImages = $products->map(function ($product) {
                $productImageUrl = $product->productImage
                    ? url('storage/' . ltrim($product->productImage, '/'))
                    : '';
                
                // Calculate average rating from reviews
                $averageRating = 0;
                if ($product->reviews && $product->reviews->count() > 0) {
                    $sum = $product->reviews->sum('rating');
                    $averageRating = $sum / $product->reviews->count();
                }
                    
                $productData = [
                    'id' => $product->product_id,
                    'productName' => $product->productName,
                    'productDescription' => $product->productDescription,
                    'productPrice' => $product->productPrice,
                    'productQuantity' => $product->productQuantity,
                    'status' => $product->status,
                    'productImage' => $productImageUrl,
                    'productVideo' => $product->productVideo,
                    'category' => $product->category,
                    'seller_id' => $product->seller_id,
                    'approval_status' => $product->approval_status,
                    'is_featured' => $product->is_featured,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                    'average_rating' => round($averageRating, 1),
                    'reviews_count' => $product->reviews ? $product->reviews->count() : 0,
                ];

                // Include seller information if available
                if ($product->seller) {
                    $productData['seller'] = [
                        'sellerID' => $product->seller->sellerID,
                        'businessName' => $product->seller->businessName,
                        'user' => $product->seller->user ? [
                            'userName' => $product->seller->user->userName,
                            'userEmail' => $product->seller->user->userEmail,
                            'userAddress' => $product->seller->user->userAddress,
                        ] : null,
                        'profile_picture_path' => $product->seller->profile_picture_path,
                        'profile_image_url' => $product->seller->profile_picture_path
                            ? url('storage/' . ltrim($product->seller->profile_picture_path, '/'))
                            : '',
                    ];

                    // Include store information if available
                    if ($product->seller->store) {
                        $productData['seller']['store'] = [
                            'storeID' => $product->seller->store->storeID,
                            'store_name' => $product->seller->store->store_name,
                            'store_description' => $product->seller->store->store_description,
                            'category' => $product->seller->store->category,
                            'logo_path' => $product->seller->store->logo_path,
                            'logo_url' => $product->seller->store->logo_path
                                ? url('storage/' . ltrim($product->seller->store->logo_path, '/'))
                                : '',
                        ];
                    }
                }

                return $productData;
            });

            return response()->json($productsWithImages);
        } catch (\Exception $e) {
            Log::error('Error fetching featured products:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error fetching featured products: ' . $e->getMessage()], 500);
        }
    }

    public function approvedProducts()
    {
        try {
            $products = Product::with(['seller.user', 'seller.store', 'reviews.user'])
                ->where('approval_status', 'approved')
                ->where('publish_status', 'published')
                ->whereHas('seller.user', function($q) {
                    $q->where('status', 'active'); // Only show products from active sellers
                })
                ->get();

            // Transform products to include full image URLs
            $productsWithImages = $products->map(function ($product) {
                $productImageUrl = $product->productImage
                    ? url('storage/' . ltrim($product->productImage, '/'))
                    : '';
                
                // Handle multiple product images
                $productImagesUrls = [];
                
                // Manually decode productImages if it's a JSON string
                $productImages = $product->productImages;
                if (is_string($productImages)) {
                    $productImages = json_decode($productImages, true);
                }
                
                if ($productImages && is_array($productImages)) {
                    $productImagesUrls = array_map(function($imagePath) {
                        return url('storage/' . ltrim($imagePath, '/'));
                    }, $productImages);
                }
                
                // Calculate average rating from reviews
                $averageRating = 0;
                $totalRatings = 0;
                if ($product->reviews && $product->reviews->count() > 0) {
                    $totalRatings = $product->reviews->count();
                    $averageRating = round($product->reviews->avg('rating'), 1);
                }
                
                // Calculate total units sold from order_products
                $totalSold = 0;
                try {
                    $totalSold = \DB::table('order_products')
                        ->where('product_id', $product->product_id)
                        ->sum('quantity');
                    
                    // Log sold count for debugging
                    Log::info('Product sold count calculated', [
                        'product_id' => $product->product_id,
                        'product_name' => $product->productName,
                        'sold_count' => $totalSold
                    ]);
                } catch (\Exception $e) {
                    Log::warning('Error calculating sold count', [
                        'product_id' => $product->product_id,
                        'error' => $e->getMessage()
                    ]);
                }
                    
                $productData = [
                    'id' => $product->product_id,
                    'product_id' => $product->product_id,
                    'productName' => $product->productName,
                    'productDescription' => $product->productDescription,
                    'productPrice' => $product->productPrice,
                    'productQuantity' => $product->productQuantity,
                    'status' => $product->status,
                    'productImage' => $productImageUrl,
                    'productImages' => $productImagesUrls,
                    'productVideo' => $product->productVideo,
                    'category' => $product->category,
                    'seller_id' => $product->seller_id,
                    'approval_status' => $product->approval_status,
                    'publish_status' => $product->publish_status,
                    'is_featured' => $product->is_featured,
                    'average_rating' => $averageRating,
                    'reviews_count' => $totalRatings,
                    'sold_count' => $totalSold,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                ];

                // Include seller information if available
                if ($product->seller) {
                    $productData['seller'] = [
                        'sellerID' => $product->seller->sellerID,
                        'businessName' => $product->seller->businessName,
                        'user' => $product->seller->user ? [
                            'userName' => $product->seller->user->userName,
                            'userEmail' => $product->seller->user->userEmail,
                            'userAddress' => $product->seller->user->userAddress,
                        ] : null,
                        'profile_picture_path' => $product->seller->profile_picture_path,
                        'profile_image_url' => $product->seller->profile_picture_path
                            ? url('storage/' . ltrim($product->seller->profile_picture_path, '/'))
                            : '',
                    ];

                    // Include store information if available
                    if ($product->seller->store) {
                        $productData['seller']['store'] = [
                            'storeID' => $product->seller->store->storeID,
                            'store_name' => $product->seller->store->store_name,
                            'store_description' => $product->seller->store->store_description,
                            'category' => $product->seller->store->category,
                            'logo_path' => $product->seller->store->logo_path,
                            'logo_url' => $product->seller->store->logo_path
                                ? url('storage/' . ltrim($product->seller->store->logo_path, '/'))
                                : '',
                        ];
                    }
                }

                return $productData;
            });

            return response()->json($productsWithImages);
        } catch (\Exception $e) {
            Log::error('Error fetching approved products:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error fetching approved products: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Toggle publish status of a product
     */
    public function togglePublishStatus($id)
    {
        try {
            $product = Product::findOrFail($id);
            
            // Check if the product belongs to the authenticated seller
            $ownershipCheck = $this->checkProductOwnership($product);
            if ($ownershipCheck !== true) {
                return $ownershipCheck;
            }
            
            $product->publish_status = $product->publish_status === 'published' ? 'draft' : 'published';
            $product->save();
            
            return response()->json([
                'success' => true,
                'publish_status' => $product->publish_status,
                'message' => 'Product publish status updated successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update publish status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get products from followed sellers (excluding drafts)
     */
    public function followedSellerProducts(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            Log::info('Fetching followed seller products for user: ' . $user->userID);

            // Get followed seller IDs using a direct query
            $followedSellerIds = \DB::table('seller_follows')
                ->where('userID', $user->userID)
                ->pluck('sellerID');

            Log::info('Followed seller IDs: ' . json_encode($followedSellerIds->toArray()));

            if ($followedSellerIds->isEmpty()) {
                return response()->json([]);
            }

            // Get approved products from followed sellers (excluding drafts)
            $products = Product::with('seller.user')
                ->whereIn('seller_id', $followedSellerIds)
                ->where('approval_status', 'approved')
                ->where('publish_status', 'published')
                ->whereHas('seller.user', function($q) {
                    $q->where('status', 'active'); // Only show products from active sellers
                })
                ->orderByRaw('FIELD(seller_id, ' . implode(',', $followedSellerIds->toArray()) . ') DESC')
                ->get();

            // Transform products to include full image URLs
            $productsWithImages = $products->map(function ($product) {
                $productImageUrl = $product->productImage
                    ? url('storage/' . ltrim($product->productImage, '/'))
                    : '';
                
                // Handle multiple product images
                $productImagesUrls = [];
                
                // Manually decode productImages if it's a JSON string
                $productImages = $product->productImages;
                if (is_string($productImages)) {
                    $productImages = json_decode($productImages, true);
                }
                
                if ($productImages && is_array($productImages)) {
                    $productImagesUrls = array_map(function($imagePath) {
                        return url('storage/' . ltrim($imagePath, '/'));
                    }, $productImages);
                }
                    
                $productData = [
                    'id' => $product->product_id,
                    'product_id' => $product->product_id,
                    'productName' => $product->productName,
                    'productDescription' => $product->productDescription,
                    'productPrice' => $product->productPrice,
                    'productQuantity' => $product->productQuantity,
                    'status' => $product->status,
                    'productImage' => $productImageUrl,
                    'productImages' => $productImagesUrls,
                    'productVideo' => $product->productVideo,
                    'category' => $product->category,
                    'seller_id' => $product->seller_id,
                    'approval_status' => $product->approval_status,
                    'publish_status' => $product->publish_status,
                    'is_featured' => $product->is_featured, // Add featured status
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                ];

                // Include seller information if available
                if ($product->seller) {
                    $productData['seller'] = [
                        'sellerID' => $product->seller->sellerID,
                        'businessName' => $product->seller->businessName,
                        'user' => $product->seller->user ? [
                            'userName' => $product->seller->user->userName,
                            'userEmail' => $product->seller->user->userEmail,
                            'userAddress' => $product->seller->user->userAddress,
                        ] : null,
                        'profile_picture_path' => $product->seller->profile_picture_path,
                        'profile_image_url' => $product->seller->profile_picture_path
                            ? url('storage/' . ltrim($product->seller->profile_picture_path, '/'))
                            : '',
                    ];

                    // Include store information if available
                    if ($product->seller->store) {
                        $productData['seller']['store'] = [
                            'storeID' => $product->seller->store->storeID,
                            'store_name' => $product->seller->store->store_name,
                            'store_description' => $product->seller->store->store_description,
                            'category' => $product->seller->store->category,
                            'logo_path' => $product->seller->store->logo_path,
                            'logo_url' => $product->seller->store->logo_path
                                ? url('storage/' . ltrim($product->seller->store->logo_path, '/'))
                                : '',
                        ];
                    }
                }

                return $productData;
            });

            Log::info('Returning ' . $productsWithImages->count() . ' transformed products');
            return response()->json($productsWithImages);
        } catch (\Exception $e) {
            Log::error('Error fetching followed seller products:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Error fetching followed seller products: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Admin endpoint to get all products for admin dashboard
     */
    public function adminIndex()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            if ($user->role !== 'administrator') {
                return response()->json(['message' => 'Unauthorized - Admin access required'], 403);
            }

            Log::info('Admin fetching all products for admin dashboard');

            // Get all products with seller and user information
            $products = Product::with(['seller.user'])
                ->orderBy('created_at', 'desc')
                ->get();

            // Transform products to include full image URLs and additional admin data
            $productsWithImages = $products->map(function ($product) {
                $productImageUrl = $product->productImage
                    ? asset('storage/' . $product->productImage)
                    : null;

                return [
                    'id' => $product->product_id,
                    'productName' => $product->productName,
                    'productDescription' => $product->productDescription,
                    'productPrice' => $product->productPrice,
                    'productQuantity' => $product->productQuantity,
                    'category' => $product->category,
                    'productImage' => $productImageUrl,
                    'approval_status' => $product->approval_status,
                    'is_featured' => $product->is_featured,
                    'is_published' => $product->is_published,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                    'seller' => $product->seller ? [
                        'sellerID' => $product->seller->sellerID,
                        'businessName' => $product->seller->businessName,
                        'user' => $product->seller->user ? [
                            'userID' => $product->seller->user->userID,
                            'userName' => $product->seller->user->userName,
                            'userEmail' => $product->seller->user->userEmail,
                        ] : null
                    ] : null
                ];
            });

            return response()->json($productsWithImages);
        } catch (\Exception $e) {
            Log::error('Error fetching admin products:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Error fetching products: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Generate unique SKU for products
     * Format: CC-S{SELLER_ID}-{CATEGORY}-{RANDOM}
     * Example: CC-S01-HOME-A1B2C3
     */
    private function generateSKU($sellerId, $category)
    {
        // Format category code (first 4 characters, uppercase)
        $categoryCode = strtoupper(substr($category, 0, 4));
        
        // Format seller code (S + padded seller ID)
        $sellerCode = 'S' . str_pad($sellerId, 2, '0', STR_PAD_LEFT);
        
        // Generate random string (6 characters)
        $random = strtoupper(substr(md5(uniqid()), 0, 6));
        
        // Create SKU
        $sku = "CC-{$sellerCode}-{$categoryCode}-{$random}";
        
        // Ensure SKU is unique (check database)
        while (Product::where('sku', $sku)->exists()) {
            $random = strtoupper(substr(md5(uniqid()), 0, 6));
            $sku = "CC-{$sellerCode}-{$categoryCode}-{$random}";
        }
        
        return $sku;
    }
}