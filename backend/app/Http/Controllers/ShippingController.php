<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Shipping;
use App\Models\ShippingHistory;
use App\Models\Rider;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ShippingController extends Controller
{
    /**
     * Assign rider to an order
     */
    public function assignRider(Request $request)
    {
        try {
            $request->validate([
                'order_id' => 'required|exists:orders,orderID',
                'tracking_number' => 'required|string',
                'rider_info' => 'required|array',
                'rider_info.rider_name' => 'required|string',
                'rider_info.rider_phone' => 'required|string',
                'rider_info.rider_email' => 'nullable|email',
                'rider_info.rider_company' => 'nullable|string',
                'rider_info.vehicle_type' => 'required|string',
                'rider_info.vehicle_number' => 'required|string',
                'delivery_info' => 'nullable|array',
                'delivery_info.delivery_notes' => 'nullable|string',
                'status' => 'required|string|in:shipped,delivered' // Only accept shipped/delivered for orders
            ]);

            $order = Order::with('customer.user')->findOrFail($request->order_id);

            // Check if shipping record already exists for this order
            $existingShipping = Shipping::where('order_id', $request->order_id)->first();
            if ($existingShipping) {
                return response()->json([
                    'success' => false,
                    'message' => 'Shipping record already exists for this order'
                ], 400);
            }

            // Auto-fetch customer address from order
            // Use customer's registered address from their user profile
            $customer = $order->customer;
            if (!$customer || !$customer->user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Customer information not found for this order'
                ], 400);
            }

            $deliveryAddress = $customer->user->userAddress ?? $order->location ?? 'Address not available';
            $deliveryCity = $customer->user->userCity ?? '';
            $deliveryProvince = $customer->user->userProvince ?? '';

            // Create shipping record with auto-calculated estimated delivery (2-5 days from now)
            $estimatedDelivery = now()->addDays(rand(2, 5));
            
            $shipping = Shipping::create([
                'order_id' => $request->order_id,
                'tracking_number' => $request->tracking_number,
                'rider_name' => $request->rider_info['rider_name'],
                'rider_phone' => $request->rider_info['rider_phone'],
                'rider_email' => $request->rider_info['rider_email'] ?? null,
                'rider_company' => $request->rider_info['rider_company'] ?? null,
                'vehicle_type' => $request->rider_info['vehicle_type'],
                'vehicle_number' => $request->rider_info['vehicle_number'],
                'delivery_address' => $deliveryAddress,
                'delivery_city' => $deliveryCity,
                'delivery_province' => $deliveryProvince,
                'delivery_notes' => $request->delivery_info['delivery_notes'] ?? null,
                'estimated_delivery' => $estimatedDelivery,
                'status' => $request->status,
                'assigned_at' => now()
            ]);

            // Update order status AND tracking number
            $order->update([
                'status' => $request->status,
                'tracking_number' => $request->tracking_number
            ]);

            // Notify customer about order being shipped
            if ($request->status === 'shipped' && $order->customer && $order->customer->user_id) {
                NotificationService::notifyOrderStatusChange($order, $order->customer->user_id, 'shipped');
            }

            // Create initial shipping history
            ShippingHistory::create([
                'shipping_id' => $shipping->id,
                'status' => $request->status,
                'description' => 'Rider assigned and package ready for shipping',
                'location' => 'Warehouse',
                'timestamp' => now()
            ]);

            // Save rider information for future use
            // Get seller ID from the order
            $sellerId = $order->sellerID;
            if ($sellerId) {
                // Check if rider already exists for this seller (by phone number)
                $existingRider = Rider::where('seller_id', $sellerId)
                    ->where('rider_phone', $request->rider_info['rider_phone'])
                    ->first();

                if ($existingRider) {
                    // Update existing rider and increment delivery count
                    $existingRider->update([
                        'rider_name' => $request->rider_info['rider_name'],
                        'rider_email' => $request->rider_info['rider_email'] ?? $existingRider->rider_email,
                        'rider_company' => $request->rider_info['rider_company'] ?? $existingRider->rider_company,
                        'vehicle_type' => $request->rider_info['vehicle_type'],
                        'vehicle_number' => $request->rider_info['vehicle_number'],
                        'is_active' => true,
                    ]);
                    $existingRider->incrementDeliveryCount();
                } else {
                    // Create new rider record
                    Rider::create([
                        'seller_id' => $sellerId,
                        'rider_name' => $request->rider_info['rider_name'],
                        'rider_phone' => $request->rider_info['rider_phone'],
                        'rider_email' => $request->rider_info['rider_email'] ?? null,
                        'rider_company' => $request->rider_info['rider_company'] ?? null,
                        'vehicle_type' => $request->rider_info['vehicle_type'],
                        'vehicle_number' => $request->rider_info['vehicle_number'],
                        'delivery_count' => 1,
                        'is_active' => true,
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Rider assigned successfully',
                'data' => $shipping->load('order', 'histories')
            ]);

        } catch (\Exception $e) {
            Log::error('Error assigning rider: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign rider',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update shipping status
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|string|in:to_ship,shipped,delivered',
                'location' => 'nullable|string',
                'description' => 'nullable|string'
            ]);

            $shipping = Shipping::findOrFail($id);

            // Update shipping status
            $shipping->update([
                'status' => $request->status,
                'updated_at' => now()
            ]);

            // Update order status
            $order = $shipping->order;
            $order->update(['status' => $request->status]);

            // Notify customer about status change (shipped or delivered)
            if (in_array($request->status, ['shipped', 'delivered']) && $order->customer && $order->customer->user_id) {
                NotificationService::notifyOrderStatusChange($order, $order->customer->user_id, $request->status);
            }

            // Create shipping history entry
            ShippingHistory::create([
                'shipping_id' => $shipping->id,
                'status' => $request->status,
                'description' => $request->description ?? $this->getStatusDescription($request->status),
                'location' => $request->location ?? 'In Transit',
                'timestamp' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Shipping status updated successfully',
                'data' => $shipping->load('order', 'histories')
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating shipping status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update shipping status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get shipping details by tracking number
     */
    public function getByTrackingNumber($trackingNumber)
    {
        try {
            $shipping = Shipping::where('tracking_number', $trackingNumber)
                ->with(['order.customer', 'order.items.product', 'histories' => function($query) {
                    $query->orderBy('timestamp', 'desc');
                }])
                ->first();

            if (!$shipping) {
                return response()->json([
                    'success' => false,
                    'message' => 'Shipping not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $shipping
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching shipping details: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch shipping details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all shippings for a seller
     */
    public function getSellerShippings(Request $request)
    {
        try {
            $seller = $request->user()->seller;
            
            if (!$seller) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seller not found'
                ], 404);
            }

            $shippings = Shipping::whereHas('order', function($query) use ($seller) {
                $query->where('sellerID', $seller->sellerID);
            })
            ->with(['order.customer', 'histories' => function($query) {
                $query->orderBy('timestamp', 'desc');
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $shippings
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching seller shippings: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch shippings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate tracking number
     */
    public function generateTrackingNumber()
    {
        do {
            $trackingNumber = 'CC' . date('Ymd') . strtoupper(Str::random(6));
        } while (Shipping::where('tracking_number', $trackingNumber)->exists());

        return response()->json([
            'success' => true,
            'tracking_number' => $trackingNumber
        ]);
    }

    /**
     * Get all saved riders for the authenticated seller
     */
    public function getSavedRiders(Request $request)
    {
        try {
            $seller = $request->user()->seller;
            
            if (!$seller) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seller not found'
                ], 404);
            }

            $riders = Rider::where('seller_id', $seller->sellerID)
                ->where('is_active', true)
                ->orderBy('delivery_count', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $riders
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching saved riders: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch saved riders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a saved rider
     */
    public function deleteRider(Request $request, $riderId)
    {
        try {
            $seller = $request->user()->seller;
            
            if (!$seller) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seller not found'
                ], 404);
            }

            $rider = Rider::where('id', $riderId)
                ->where('seller_id', $seller->sellerID)
                ->first();

            if (!$rider) {
                return response()->json([
                    'success' => false,
                    'message' => 'Rider not found'
                ], 404);
            }

            // Soft delete by marking as inactive
            $rider->update(['is_active' => false]);

            return response()->json([
                'success' => true,
                'message' => 'Rider deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting rider: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete rider',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get status description
     */
    private function getStatusDescription($status)
    {
        switch ($status) {
            case 'to_ship':
                return 'Package ready for shipping';
            case 'shipped':
                return 'Package has been shipped';
            case 'delivered':
                return 'Package has been delivered';
            default:
                return 'Status updated';
        }
    }
}
