<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DiscountCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class DiscountCodeController extends Controller
{

    public function index()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Log the authenticated user for debugging
            Log::info('Fetching discount codes for user:', [
                'user_id' => $user->userID,
                'email' => $user->userEmail
            ]);

            $discounts = DiscountCode::where('created_by', $user->userID)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($discount) {
                    return [
                        'id' => $discount->coupons_id,
                        'code' => $discount->code,
                        'type' => $discount->type,
                        'value' => (float)$discount->value,
                        'usage_limit' => $discount->usage_limit,
                        'times_used' => $discount->times_used,
                        'expires_at' => $discount->expires_at?->toDateTimeString(),
                        'created_at' => $discount->created_at->toDateTimeString(),
                        'is_active' => $discount->expires_at ? $discount->expires_at->isFuture() : true,
                        'remaining_uses' => $discount->usage_limit ? $discount->usage_limit - $discount->times_used : null
                    ];
                });
            
            // Log the number of discounts found for debugging
            Log::info('Fetched discounts count: ' . $discounts->count());
                
            return response()->json([
                'status' => 'success',
                'data' => $discounts
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching discount codes: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch discount codes',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not authenticated'
                ], 401);
            }

            $validated = $request->validate([
                'code' => 'required|string|max:50|unique:coupons,code',
                'value' => 'required|numeric|min:1|max:100',
                'usage_limit' => 'nullable|integer|min:1',
                'expires_at' => 'nullable|date|after:now',
                'type' => 'required|string|in:percentage,fixed'
            ]);

            // Set default expiration to 30 days from now if not provided
            $expiresAt = $validated['expires_at'] ?? now()->addDays(10);

            $discount = DiscountCode::create([
                'code' => strtoupper($validated['code']),
                'type' => $validated['type'] ?? 'percentage',
                'value' => $validated['value'],
                'usage_limit' => $validated['usage_limit'] ?? null,
                'expires_at' => $expiresAt,
                'created_by' => $user->userID,
                'times_used' => 0
            ]);

            // Format the response to match the index endpoint
            $formattedDiscount = [
                'id' => $discount->coupons_id,
                'code' => $discount->code,
                'type' => $discount->type,
                'value' => (float)$discount->value,
                'usage_limit' => $discount->usage_limit,
                'times_used' => $discount->times_used,
                'expires_at' => $discount->expires_at?->toDateTimeString(),
                'created_at' => $discount->created_at->toDateTimeString(),
                'is_active' => $discount->expires_at ? $discount->expires_at->isFuture() : true,
                'remaining_uses' => $discount->usage_limit ? $discount->usage_limit - $discount->times_used : null
            ];

            return response()->json($formattedDiscount, 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation Error',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            Log::error('Discount code creation error: ' . $e->getMessage() . '\n' . $e->getTraceAsString());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create discount code: ' . $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }

public function destroy($id)
{
    try {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['status' => 'error','message' => 'User not authenticated'], 401);
        }

        $discount = DiscountCode::where('created_by', $user->userID)->where('coupons_id', $id)->first();

        if (!$discount) {
            return response()->json([
                'status' => 'error','message' => 'Discount code not found or you do not have permission to delete it'], 404);
        }

        $code = $discount->code;
        $discount->delete();

        return response()->json(['status' => 'success','message' => "Discount code {$code} has been deleted"]);

    } catch (\Exception $e) {
        Log::error('Error deleting discount code: ' . $e->getMessage());
        return response()->json(['status' => 'error','message' => 'Failed to delete discount code','error' => config('app.debug') ? $e->getMessage() : 'Internal server error'], 500);
    }
}

}
