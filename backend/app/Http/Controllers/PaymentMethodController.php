<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethod;
use App\Services\PayMongoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PaymentMethodController extends Controller
{
    protected $payMongoService;

    public function __construct()
    {
        if (env('PAYMONGO_SECRET_KEY') && env('PAYMONGO_PUBLIC_KEY')) {
            $this->payMongoService = new PayMongoService();
        }
    }

    /**
     * Get all payment methods for the authenticated user
     */
    public function index()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $paymentMethods = PaymentMethod::where('user_id', $user->userID)
                ->where('is_active', true)
                ->orderBy('is_default', 'desc')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($method) {
                    return [
                        'id' => $method->id,
                        'paymongo_id' => $method->paymongo_payment_method_id,
                        'type' => $method->type,
                        'details' => $method->masked_details,
                        'billing' => $method->billing,
                        'is_default' => $method->is_default,
                        'is_active' => $method->is_active,
                        'created_at' => $method->created_at->format('Y-m-d H:i:s'),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $paymentMethods
            ]);

        } catch (\Exception $e) {
            Log::error('Payment Methods Index Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payment methods'
            ], 500);
        }
    }

    /**
     * Create a new payment method
     */
    public function store(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $validator = Validator::make($request->all(), [
                'type' => 'required|in:card,gcash,grab_pay,paymaya',
                'details' => 'required|array',
                'billing' => 'required|array',
                'billing.name' => 'required|string|max:255',
                'billing.email' => 'required|email|max:255',
                'billing.phone' => 'required|string|max:20',
                'is_default' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // If no PayMongo service, create a mock payment method for development
            if (!$this->payMongoService) {
                $paymentMethod = PaymentMethod::create([
                    'user_id' => $user->userID,
                    'paymongo_payment_method_id' => 'mock_' . uniqid(),
                    'type' => $request->type,
                    'details' => $request->details,
                    'billing' => $request->billing,
                    'is_default' => $request->is_default ?? false,
                ]);

                // If this is set as default, unset other defaults
                if ($paymentMethod->is_default) {
                    PaymentMethod::where('user_id', $user->userID)
                        ->where('id', '!=', $paymentMethod->id)
                        ->update(['is_default' => false]);
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Payment method created successfully (development mode)',
                    'data' => [
                        'id' => $paymentMethod->id,
                        'paymongo_id' => $paymentMethod->paymongo_payment_method_id,
                        'type' => $paymentMethod->type,
                        'details' => $paymentMethod->masked_details,
                        'billing' => $paymentMethod->billing,
                        'is_default' => $paymentMethod->is_default,
                    ]
                ]);
            }

            // Create payment method with PayMongo
            $paymongoResponse = $this->payMongoService->createPaymentMethod(
                $request->type,
                $request->details,
                $request->billing
            );

            if (!$paymongoResponse || !isset($paymongoResponse['data'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create payment method with PayMongo'
                ], 500);
            }

            $paymentMethod = PaymentMethod::create([
                'user_id' => $user->userID,
                'paymongo_payment_method_id' => $paymongoResponse['data']['id'],
                'type' => $request->type,
                'details' => $paymongoResponse['data']['attributes']['details'],
                'billing' => $paymongoResponse['data']['attributes']['billing'],
                'is_default' => $request->is_default ?? false,
            ]);

            // If this is set as default, unset other defaults
            if ($paymentMethod->is_default) {
                PaymentMethod::where('user_id', $user->userID)
                    ->where('id', '!=', $paymentMethod->id)
                    ->update(['is_default' => false]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment method created successfully',
                'data' => [
                    'id' => $paymentMethod->id,
                    'paymongo_id' => $paymentMethod->paymongo_payment_method_id,
                    'type' => $paymentMethod->type,
                    'details' => $paymentMethod->masked_details,
                    'billing' => $paymentMethod->billing,
                    'is_default' => $paymentMethod->is_default,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Payment Method Creation Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment method: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific payment method
     */
    public function show($id)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $paymentMethod = PaymentMethod::where('id', $id)
                ->where('user_id', $user->userID)
                ->where('is_active', true)
                ->first();

            if (!$paymentMethod) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment method not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $paymentMethod->id,
                    'paymongo_id' => $paymentMethod->paymongo_payment_method_id,
                    'type' => $paymentMethod->type,
                    'details' => $paymentMethod->masked_details,
                    'billing' => $paymentMethod->billing,
                    'is_default' => $paymentMethod->is_default,
                    'is_active' => $paymentMethod->is_active,
                    'created_at' => $paymentMethod->created_at->format('Y-m-d H:i:s'),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Payment Method Show Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payment method'
            ], 500);
        }
    }

    /**
     * Update a payment method
     */
    public function update(Request $request, $id)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $paymentMethod = PaymentMethod::where('id', $id)
                ->where('user_id', $user->userID)
                ->where('is_active', true)
                ->first();

            if (!$paymentMethod) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment method not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'details' => 'sometimes|array',
                'billing' => 'sometimes|array',
                'billing.name' => 'sometimes|string|max:255',
                'billing.email' => 'sometimes|email|max:255',
                'billing.phone' => 'sometimes|string|max:20',
                'is_default' => 'sometimes|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update with PayMongo if service is available
            if ($this->payMongoService) {
                try {
                    $this->payMongoService->updatePaymentMethod(
                        $paymentMethod->paymongo_payment_method_id,
                        $request->details ?? $paymentMethod->details,
                        $request->billing ?? $paymentMethod->billing
                    );
                } catch (\Exception $e) {
                    Log::warning('PayMongo update failed, continuing with local update: ' . $e->getMessage());
                }
            }

            // Update local record
            $updateData = [];
            if ($request->has('details')) {
                $updateData['details'] = $request->details;
            }
            if ($request->has('billing')) {
                $updateData['billing'] = $request->billing;
            }
            if ($request->has('is_default')) {
                $updateData['is_default'] = $request->is_default;
                
                // If setting as default, unset other defaults
                if ($request->is_default) {
                    PaymentMethod::where('user_id', $user->userID)
                        ->where('id', '!=', $id)
                        ->update(['is_default' => false]);
                }
            }

            $paymentMethod->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Payment method updated successfully',
                'data' => [
                    'id' => $paymentMethod->id,
                    'paymongo_id' => $paymentMethod->paymongo_payment_method_id,
                    'type' => $paymentMethod->type,
                    'details' => $paymentMethod->masked_details,
                    'billing' => $paymentMethod->billing,
                    'is_default' => $paymentMethod->is_default,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Payment Method Update Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update payment method: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a payment method
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $paymentMethod = PaymentMethod::where('id', $id)
                ->where('user_id', $user->userID)
                ->where('is_active', true)
                ->first();

            if (!$paymentMethod) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment method not found'
                ], 404);
            }

            // Delete from PayMongo if service is available
            if ($this->payMongoService) {
                try {
                    $this->payMongoService->deletePaymentMethod($paymentMethod->paymongo_payment_method_id);
                } catch (\Exception $e) {
                    Log::warning('PayMongo deletion failed, continuing with local deletion: ' . $e->getMessage());
                }
            }

            // Soft delete by setting is_active to false
            $paymentMethod->update(['is_active' => false]);

            return response()->json([
                'success' => true,
                'message' => 'Payment method deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Payment Method Deletion Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete payment method: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Set a payment method as default
     */
    public function setDefault($id)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $paymentMethod = PaymentMethod::where('id', $id)
                ->where('user_id', $user->userID)
                ->where('is_active', true)
                ->first();

            if (!$paymentMethod) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment method not found'
                ], 404);
            }

            // Unset all other defaults
            PaymentMethod::where('user_id', $user->userID)
                ->where('id', '!=', $id)
                ->update(['is_default' => false]);

            // Set this one as default
            $paymentMethod->update(['is_default' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Default payment method updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Set Default Payment Method Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to set default payment method: ' . $e->getMessage()
            ], 500);
        }
    }
}