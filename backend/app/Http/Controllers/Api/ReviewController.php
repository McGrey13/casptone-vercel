<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Get all reviews for a product
     *
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index($productId)
    {
        try {
            $product = Product::findOrFail($productId);
            $reviews = $product->reviews()
                ->with(['user' => function($query) {
                    $query->select('userID', 'userName');
                }])
                ->latest()
                ->get();

            return response()->json($reviews);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created review in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, $productId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'nullable|string|max:1000',
                'review' => 'nullable|string|max:1000', // allow alternate field name from frontend
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $product = Product::findOrFail($productId);
            $user = Auth::user();

            // Choose comment content from either 'comment' or 'review'
            $commentText = $request->input('comment', $request->input('review'));

            // Check if user has already reviewed this product
            $existingReview = Review::where('user_id', $user->userID)
                ->where('product_id', $productId)
                ->first();

            if ($existingReview) {
                // Update existing review instead of returning conflict
                $existingReview->rating = $request->rating;
                $existingReview->comment = $commentText;
                $existingReview->review_date = now();
                $existingReview->save();
                $existingReview->load('user');

                return response()->json([
                    'success' => true,
                    'message' => 'Review updated successfully',
                    'data' => $existingReview
                ], 200);
            }

            $review = new Review([
                'user_id' => $user->userID,
                'product_id' => $productId,
                'rating' => $request->rating,
                'comment' => $commentText,
                'review_date' => now(),
            ]);

            $review->save();
            $review->load('user');

            return response()->json([
                'success' => true,
                'message' => 'Review submitted successfully',
                'data' => $review
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified review.
     *
     * @param  int  $productId
     * @param  int  $reviewId
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($productId, $reviewId)
    {
        try {
            $review = Review::with(['user' => function($query) {
                    $query->select('userID', 'userName');
                }])
                ->where('product_id', $productId)
                ->findOrFail($reviewId);

            return response()->json([
                'success' => true,
                'data' => $review
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Review not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Get all reviews for a specific product
     *
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProductReviews($productId)
    {
        try {
            $reviews = Review::with(['user' => function($query) {
                    $query->select('userID', 'userName');
                }])
                ->where('product_id', $productId)
                ->latest()
                ->get();

            $averageRating = $reviews->avg('rating');
            $totalReviews = $reviews->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'reviews' => $reviews,
                    'average_rating' => $averageRating ? round($averageRating, 1) : 0,
                    'total_reviews' => $totalReviews
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch product reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check in batch which products the authenticated user has reviewed.
     * Request: { product_ids: number[] }
     * Response: { reviewed: { [product_id: number]: boolean } }
     */
    public function userReviewedBatch(Request $request)
    {
        try {
            $data = $request->validate([
                'product_ids' => 'required|array|min:1',
                'product_ids.*' => 'integer'
            ]);

            $user = Auth::user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
            }

            $productIds = $data['product_ids'];

            $reviewedIds = Review::where('user_id', $user->userID)
                ->whereIn('product_id', $productIds)
                ->pluck('product_id')
                ->unique()
                ->values()
                ->all();

            $reviewedMap = [];
            foreach ($productIds as $pid) {
                $reviewedMap[$pid] = in_array($pid, $reviewedIds, true);
            }

            return response()->json([
                'success' => true,
                'reviewed' => $reviewedMap
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
