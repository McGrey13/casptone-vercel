<?php

namespace App\Http\Controllers;

use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SellerFollowController extends Controller
{
    public function follow(Request $request, $sellerId)
    {
        try {
            $user = $request->user();
            
            // Check if already following - use wherePivot to avoid ambiguity
            $alreadyFollowing = $user->followedSellers()->where('sellers.sellerID', $sellerId)->exists();
            
            if (!$alreadyFollowing) {
                $user->followedSellers()->attach($sellerId);
            }
            
            // Get the updated followers count
            $seller = Seller::findOrFail($sellerId);
            $followersCount = $seller->followers()->count();
            
            Log::info('User followed seller', [
                'user_id' => $user->userID,
                'seller_id' => $sellerId,
                'followers_count' => $followersCount
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Successfully followed seller',
                'followers_count' => $followersCount,
                'is_following' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Error following seller', [
                'seller_id' => $sellerId,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to follow seller'
            ], 500);
        }
    }

    public function unfollow(Request $request, $sellerId)
    {
        try {
            $user = $request->user();
            
            // Check if actually following - use table prefix to avoid ambiguity
            $isFollowing = $user->followedSellers()->where('sellers.sellerID', $sellerId)->exists();
            
            if ($isFollowing) {
                $user->followedSellers()->detach($sellerId);
            }
            
            // Get the updated followers count
            $seller = Seller::findOrFail($sellerId);
            $followersCount = $seller->followers()->count();
            
            Log::info('User unfollowed seller', [
                'user_id' => $user->userID,
                'seller_id' => $sellerId,
                'followers_count' => $followersCount
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Successfully unfollowed seller',
                'followers_count' => $followersCount,
                'is_following' => false
            ]);
        } catch (\Exception $e) {
            Log::error('Error unfollowing seller', [
                'seller_id' => $sellerId,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to unfollow seller'
            ], 500);
        }
    }

    public function followedSellers(Request $request)
    {
        return $request->user()->followedSellers()->get();
    }
    
    public function checkFollowStatus(Request $request, $sellerId)
    {
        try {
            $user = $request->user();
            // Use table prefix to avoid ambiguity
            $isFollowing = $user->followedSellers()->where('sellers.sellerID', $sellerId)->exists();
            
            return response()->json([
                'is_following' => $isFollowing
            ]);
        } catch (\Exception $e) {
            Log::error('Error checking follow status', [
                'seller_id' => $sellerId,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'is_following' => false
            ], 500);
        }
    }
}