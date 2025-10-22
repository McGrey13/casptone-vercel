<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Seller;
use App\Models\Store;
use App\Models\ShippingHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Get customer record for the user
        $customer = \App\Models\Customer::where('user_id', $user->userID)->first();
        if (!$customer) {
            return response()->json(['error' => 'Customer record not found'], 404);
        }

        $orders = Order::with(['orderProducts.product' => function($query) {
                $query->select('product_id', 'productName', 'productPrice', 'productImage', 'seller_id', 'sku');
            }, 'orderProducts.product.seller.user'])
            ->where('customer_id', $customer->customerID)
            ->whereIn('status', ['pending', 'processing', 'packing', 'shipped', 'delivered', 'cancelled', 'payment_failed', 'failed', 'returned']) // Show all order statuses
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($order) {
                return [
                    'orderID' => $order->orderID,
                    'order_number' => $order->order_number,
                    'tracking_number' => $order->tracking_number,
                    'orderDate' => $order->created_at->format('Y-m-d H:i:s'),
                    'status' => $order->status,
                    'paymentStatus' => $order->paymentStatus ?? 'pending',
                    'payment_method' => $order->payment_method ?? 'cod', // Add payment method
                    'totalAmount' => $order->totalAmount,
                    'items' => $order->orderProducts->map(function($item) {
                        return [
                            'order_product_id' => $item->orderProducts_id,
                            'product_id' => $item->product_id,
                            'product_name' => $item->product->productName ?? 'Product Unavailable',
                            'product_image' => $item->product->productImage ?? null,
                            'sku' => $item->product->sku ?? 'N/A',
                            'seller_name' => $item->product->seller->businessName ?? 'Unknown Seller',
                            'price' => $item->price,
                            'quantity' => $item->quantity,
                            'total_amount' => $item->price * $item->quantity
                        ];
                    })
                ];
            });

        return response()->json($orders);
    }

    public function sellerOrders()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Get seller record for the user with store and user relationships
        $seller = Seller::with(['user', 'store'])->where('user_id', $user->userID)->first();
        if (!$seller) {
            return response()->json(['error' => 'Seller record not found'], 404);
        }

        // Get orders that contain products from this seller
        // Include processing orders (paid via GCash/PayMaya) so seller can package them
        $orders = Order::with([
                'orderProducts.product' => function($query) use ($seller) {
                    $query->where('seller_id', $seller->sellerID);
                },
                'orderProducts.product.seller.user',
                'customer.user',
                'shipping'
            ])
            ->whereHas('orderProducts.product', function($query) use ($seller) {
                $query->where('seller_id', $seller->sellerID);
            })
            ->whereIn('status', ['processing', 'packing', 'shipped', 'delivered', 'cancelled']) // Only show paid/confirmed orders
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($order) use ($seller) {
                // Filter order products to only include products from this seller
                $sellerProducts = $order->orderProducts->filter(function($item) use ($seller) {
                    return $item->product && $item->product->seller_id == $seller->sellerID;
                });

                $paymentMethod = $order->payment_method ?? 'cod';
                \Log::info('Seller Order API - Order #' . $order->orderID, [
                    'payment_method' => $paymentMethod,
                    'paymentStatus' => $order->paymentStatus,
                    'order_number' => $order->order_number
                ]);
                
                return [
                    'orderID' => $order->orderID,
                    'id' => $order->order_number,
                    'order_number' => $order->order_number,
                    'customer' => $order->customer && $order->customer->user ? $order->customer->user->userName : 'Unknown Customer',
                    'date' => $order->created_at->format('Y-m-d'),
                    'total' => '₱' . number_format($sellerProducts->sum(function($item) {
                        return $item->price * $item->quantity;
                    }), 2),
                    'totalAmount' => $sellerProducts->sum(function($item) {
                        return $item->price * $item->quantity;
                    }),
                    'status' => $order->status,
                    'paymentStatus' => $order->paymentStatus ?? 'pending',
                    'payment_method' => $paymentMethod, // Add payment method for waybill
                    'trackingNumber' => $order->tracking_number ?? ($order->shipping ? $order->shipping->tracking_number : null),
                    'location' => $this->getCustomerFullAddress($order),
                    'seller_name' => $seller->businessName ?? ($seller->user ? $seller->user->userName : 'CraftConnect Seller'),
                    'seller_contact' => $seller->user ? $seller->user->userContactNumber : 'N/A',
                    'seller_email' => $seller->user ? $seller->user->userEmail : 'N/A',
                    'seller_address' => $this->getSellerFullAddress($seller),
                    'seller_city' => $seller->user ? $seller->user->userCity : 'N/A',
                    'seller_province' => $seller->user ? $seller->user->userProvince : 'N/A',
                    'created_at' => $order->created_at->toISOString(),
                    'items' => $sellerProducts->sum('quantity'),
                    'order_id' => $order->orderID,
                    'customer_email' => $order->customer && $order->customer->user ? $order->customer->user->userEmail : 'N/A',
                    'customer_contact' => $order->customer && $order->customer->user ? $order->customer->user->userContactNumber : 'N/A',
                    'products' => $sellerProducts->map(function($item) {
                        return [
                            'product_name' => $item->product->productName ?? 'Product Unavailable',
                            'product_image' => $item->product->productImage ?? null,
                            'sku' => $item->product->sku ?? 'N/A',
                            'price' => $item->price,
                            'quantity' => $item->quantity,
                            'total_amount' => $item->price * $item->quantity
                        ];
                    })
                ];
            });

        return response()->json($orders);
    }

    /**
     * Mark order as received by customer
     */
    public function markAsReceived($orderId)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            // Get customer record
            $customer = \App\Models\Customer::where('user_id', $user->userID)->first();
            if (!$customer) {
                return response()->json(['error' => 'Customer record not found'], 404);
            }

            // Get the order
            $order = Order::with('shipping')->where('orderID', $orderId)
                ->where('customer_id', $customer->customerID)
                ->first();

            if (!$order) {
                return response()->json(['error' => 'Order not found'], 404);
            }

            // Only allow marking as received if order is shipped
            if ($order->status !== 'shipped') {
                return response()->json([
                    'success' => false,
                    'message' => 'Order must be in shipped status to mark as received'
                ], 400);
            }

            // Update order status to delivered
            $order->update(['status' => 'delivered']);

            // Update shipping status if exists
            if ($order->shipping) {
                $order->shipping->update([
                    'status' => 'delivered',
                    'delivered_at' => now()
                ]);

                // Add shipping history
                ShippingHistory::create([
                    'shipping_id' => $order->shipping->id,
                    'status' => 'delivered',
                    'description' => 'Package successfully delivered and confirmed by customer',
                    'location' => $order->shipping->delivery_city,
                    'timestamp' => now()
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Order marked as received successfully',
                'order' => $order
            ]);

        } catch (\Exception $e) {
            \Log::error('Error marking order as received: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark order as received',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update order status (for sellers)
     */
    public function updateStatus(Request $request, $orderId)
    {
        try {
            $request->validate([
                'status' => 'required|string|in:pending,processing,packing,shipped,delivered,cancelled,failed'
            ]);

            $order = Order::findOrFail($orderId);
            
            \Log::info('Updating order status', [
                'order_id' => $orderId,
                'old_status' => $order->status,
                'new_status' => $request->status
            ]);

            $order->update(['status' => $request->status]);

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'order' => $order
            ]);

        } catch (\Exception $e) {
            \Log::error('Error updating order status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get full customer delivery address
     */
    private function getCustomerFullAddress($order)
    {
        $addressParts = [];
        
        // Get customer user data
        if ($order->customer && $order->customer->user) {
            $user = $order->customer->user;
            
            // Add street address
            if ($user->userAddress) {
                $addressParts[] = $user->userAddress;
            }
            
            // Add city
            if ($user->userCity) {
                $addressParts[] = $user->userCity;
            }
            
            // Add province
            if ($user->userProvince) {
                $addressParts[] = $user->userProvince;
            }
        }
        
        // Fallback to order location if customer data not available
        if (empty($addressParts) && $order->location) {
            return $order->location;
        }
        
        return !empty($addressParts) 
            ? implode(', ', $addressParts) 
            : 'Delivery address not available';
    }

    /**
     * Get full seller address
     */
    private function getSellerFullAddress($seller)
    {
        $addressParts = [];
        
        // Try to get address from store first, then from user
        if ($seller->store && $seller->store->owner_address) {
            $addressParts[] = $seller->store->owner_address;
        } elseif ($seller->user && $seller->user->userAddress) {
            $addressParts[] = $seller->user->userAddress;
        }
        
        // Add city
        if ($seller->user && $seller->user->userCity) {
            $addressParts[] = $seller->user->userCity;
        }
        
        // Add province
        if ($seller->user && $seller->user->userProvince) {
            $addressParts[] = $seller->user->userProvince;
        }
        
        return !empty($addressParts) 
            ? implode(', ', $addressParts) 
            : 'Address not available';
    }
}
