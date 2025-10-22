<?php

namespace App\Http\Controllers;

use App\Models\AfterSaleRequest;
use App\Models\Order;
use App\Models\Customer;
use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class AfterSaleController extends Controller
{
    /**
     * Get all after-sale requests for a customer
     */
    public function getCustomerRequests(Request $request)
    {
        try {
            $user = Auth::user();
            $customer = Customer::where('user_id', $user->userID)->first();

            if (!$customer) {
                return response()->json(['error' => 'Customer not found'], 404);
            }

            $requests = AfterSaleRequest::with(['order', 'product', 'seller.user'])
                ->forCustomer($customer->customerID)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($requests);
        } catch (\Exception $e) {
            Log::error('Error fetching customer after-sale requests: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch requests'], 500);
        }
    }

    /**
     * Get all after-sale requests for a seller
     */
    public function getSellerRequests(Request $request)
    {
        try {
            $user = Auth::user();
            $seller = Seller::where('userID', $user->userID)->first();

            if (!$seller) {
                return response()->json(['error' => 'Seller not found'], 404);
            }

            $requests = AfterSaleRequest::with(['order', 'product', 'customer.user'])
                ->forSeller($seller->sellerID)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($requests);
        } catch (\Exception $e) {
            Log::error('Error fetching seller after-sale requests: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch requests'], 500);
        }
    }

    /**
     * Get all after-sale requests for admin
     */
    public function getAllRequests(Request $request)
    {
        try {
            $requests = AfterSaleRequest::with(['order', 'product', 'customer.user', 'seller.user'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($requests);
        } catch (\Exception $e) {
            Log::error('Error fetching all after-sale requests: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch requests'], 500);
        }
    }

    /**
     * Get a specific after-sale request
     */
    public function getRequest($id)
    {
        try {
            $request = AfterSaleRequest::with(['order', 'product', 'customer.user', 'seller.user'])
                ->findOrFail($id);

            return response()->json($request);
        } catch (\Exception $e) {
            Log::error('Error fetching after-sale request: ' . $e->getMessage());
            return response()->json(['error' => 'Request not found'], 404);
        }
    }

    /**
     * Create a new after-sale request
     */
    public function createRequest(Request $request)
    {
        try {
            $validated = $request->validate([
                'order_id' => 'required|exists:orders,orderID',
                'product_id' => 'nullable|exists:products,product_id',
                'request_type' => 'required|in:return,exchange,refund,support,complaint',
                'subject' => 'required|string|max:255',
                'description' => 'required|string|min:20',
                'reason' => 'nullable|string',
                'images' => 'nullable|array|max:5',
                'images.*' => 'image|mimes:jpeg,png,jpg|max:4096',
                'video' => 'nullable|file|mimes:mp4,mov,avi,webm|max:51200',
            ]);

            $user = Auth::user();
            $customer = Customer::where('userID', $user->userID)->first();

            if (!$customer) {
                return response()->json(['error' => 'Customer not found'], 404);
            }

            // Get order and verify ownership
            $order = Order::where('orderID', $validated['order_id'])->firstOrFail();
            if ($order->customer_id != $customer->customerID) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            // Enforce one after-sale request per order (any status except cancelled)
            $existing = AfterSaleRequest::where('order_id', $order->orderID)
                ->whereNotIn('status', ['cancelled', 'rejected', 'completed'])
                ->first();
            if ($existing) {
                return response()->json([
                    'error' => 'An after-sale request for this order already exists',
                    'request_id' => $existing->request_id
                ], 409);
            }

            // Handle file uploads (images + video)
            $imageUrls = [];
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('after-sale-requests', 'public');
                    $imageUrls[] = $path;
                }
            }
            $videoPath = null;
            if ($request->hasFile('video')) {
                $videoPath = $request->file('video')->store('after-sale-requests/videos', 'public');
            }

            // Require video + at least 1 image for return/refund requests
            if (in_array($validated['request_type'], ['return', 'refund'])) {
                if (!$videoPath || empty($imageUrls)) {
                    return response()->json([
                        'error' => 'Unboxing video and at least one photo are required for return/refund requests.'
                    ], 422);
                }
            }

            // Resolve seller ID (fallback if missing on order)
            $sellerIdForRequest = $order->sellerID;
            if (!$sellerIdForRequest) {
                try {
                    $firstOrderProduct = \App\Models\OrderProduct::where('order_id', $order->orderID)->first();
                    if ($firstOrderProduct) {
                        $prod = \App\Models\Product::find($firstOrderProduct->product_id);
                        if ($prod && $prod->seller_id) {
                            $sellerIdForRequest = $prod->seller_id;
                        }
                    }
                } catch (\Throwable $t) {
                    // ignore fallback errors, will validate below
                }
            }
            if (!$sellerIdForRequest) {
                return response()->json([
                    'error' => 'Unable to determine seller for this order.'
                ], 422);
            }

            // Create after-sale request
            $afterSaleRequest = AfterSaleRequest::create([
                'order_id' => $order->orderID,
                'product_id' => $validated['product_id'] ?? null,
                'customer_id' => $customer->customerID,
                'seller_id' => $sellerIdForRequest,
                'request_type' => $validated['request_type'],
                'subject' => $validated['subject'],
                'description' => $validated['description'],
                'reason' => $validated['reason'] ?? null,
                'images' => !empty($imageUrls) ? $imageUrls : null,
                'video_path' => $videoPath,
                'status' => 'pending',
            ]);

            $afterSaleRequest->load(['order', 'product', 'seller.user']);

            return response()->json([
                'success' => true,
                'message' => 'After-sale request created successfully',
                'request' => $afterSaleRequest,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating after-sale request: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to create request',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Seller responds to a request
     */
    public function respondToRequest(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'response' => 'required|string|min:10',
                'status' => 'required|in:approved,rejected,processing',
            ]);

            $user = Auth::user();
            $seller = Seller::where('userID', $user->userID)->first();

            if (!$seller) {
                return response()->json(['error' => 'Seller not found'], 404);
            }

            $afterSaleRequest = AfterSaleRequest::findOrFail($id);

            // Verify seller owns this request
            if ($afterSaleRequest->seller_id != $seller->sellerID) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            if (!$afterSaleRequest->canBeResponded()) {
                return response()->json(['error' => 'Request cannot be responded to in current status'], 400);
            }

            $afterSaleRequest->update([
                'seller_response' => $validated['response'],
                'status' => $validated['status'],
                'responded_at' => now(),
            ]);

            $afterSaleRequest->load(['order', 'product', 'customer.user']);

            return response()->json([
                'success' => true,
                'message' => 'Response submitted successfully',
                'request' => $afterSaleRequest,
            ]);
        } catch (\Exception $e) {
            Log::error('Error responding to after-sale request: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to respond to request'], 500);
        }
    }

    /**
     * Update request status (Admin/Seller)
     */
    public function updateRequestStatus(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:pending,approved,rejected,processing,completed,cancelled',
                'admin_notes' => 'nullable|string',
            ]);

            $afterSaleRequest = AfterSaleRequest::findOrFail($id);

            $updateData = ['status' => $validated['status']];

            if (isset($validated['admin_notes'])) {
                $updateData['admin_notes'] = $validated['admin_notes'];
            }

            if ($validated['status'] === 'completed') {
                $updateData['resolved_at'] = now();
            }

            $afterSaleRequest->update($updateData);

            $afterSaleRequest->load(['order', 'product', 'customer.user', 'seller.user']);

            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully',
                'request' => $afterSaleRequest,
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating request status: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update status'], 500);
        }
    }

    /**
     * Cancel a request (Customer only, for pending requests)
     */
    public function cancelRequest($id)
    {
        try {
            $user = Auth::user();
            $customer = Customer::where('userID', $user->userID)->first();

            if (!$customer) {
                return response()->json(['error' => 'Customer not found'], 404);
            }

            $afterSaleRequest = AfterSaleRequest::findOrFail($id);

            // Verify customer owns this request
            if ($afterSaleRequest->customer_id != $customer->customerID) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            if (!$afterSaleRequest->canBeCancelled()) {
                return response()->json(['error' => 'Request cannot be cancelled in current status'], 400);
            }

            $afterSaleRequest->update(['status' => 'cancelled']);

            return response()->json([
                'success' => true,
                'message' => 'Request cancelled successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Error cancelling after-sale request: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to cancel request'], 500);
        }
    }

    /**
     * Get statistics for after-sale requests
     */
    public function getStatistics()
    {
        try {
            $stats = [
                'total' => AfterSaleRequest::count(),
                'pending' => AfterSaleRequest::where('status', 'pending')->count(),
                'approved' => AfterSaleRequest::where('status', 'approved')->count(),
                'rejected' => AfterSaleRequest::where('status', 'rejected')->count(),
                'processing' => AfterSaleRequest::where('status', 'processing')->count(),
                'completed' => AfterSaleRequest::where('status', 'completed')->count(),
                'cancelled' => AfterSaleRequest::where('status', 'cancelled')->count(),
                'by_type' => [
                    'return' => AfterSaleRequest::where('request_type', 'return')->count(),
                    'exchange' => AfterSaleRequest::where('request_type', 'exchange')->count(),
                    'refund' => AfterSaleRequest::where('request_type', 'refund')->count(),
                    'support' => AfterSaleRequest::where('request_type', 'support')->count(),
                    'complaint' => AfterSaleRequest::where('request_type', 'complaint')->count(),
                ],
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            Log::error('Error fetching after-sale statistics: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch statistics'], 500);
        }
    }
}

