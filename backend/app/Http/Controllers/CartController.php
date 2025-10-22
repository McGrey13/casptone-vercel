<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CartController extends Controller
{
    // View all cart items for logged-in user
    /**
     * Get all cart items for the authenticated user
     */
    public function index()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }

            // First, get all cart items for the user
            $cartItems = Cart::where('userID', $user->userID)->get();
            
            if ($cartItems->isEmpty()) {
                return response()->json([]);
            }

            // Get all product IDs from the cart
            $productIds = $cartItems->pluck('product_id')->unique()->toArray();
            
            // Eager load products with their relationships
            $products = Product::with([
                'seller.user' => function($query) {
                    $query->select('userID', 'userName');
                }
            ])
            ->whereIn('product_id', $productIds)
            ->get()
            ->keyBy('product_id');

            // Map cart items with product data
            $formattedCart = $cartItems->map(function($item) use ($products) {
                $product = $products->get($item->product_id);
                
                if (!$product) {
                    return null;
                }

                $sellerName = 'Unknown Seller';
                if ($product->seller) {
                    $seller = $product->seller;
                    $sellerName = $seller->businessName ?? 
                                ($seller->user ? $seller->user->userName : 'Unknown Seller');
                }

                return [
                    'cart_id' => $item->cart_id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => (float) $product->productPrice,
                    'total_price' => (float) $product->productPrice * $item->quantity,
                    'product' => [
                        'product_id' => $product->product_id,
                        'productName' => $product->productName ?? 'Unknown Product',
                        'productPrice' => (float) $product->productPrice,
                        'productQuantity' => (int) ($product->productQuantity ?? 0), // Add available stock
                        'productImage' => $product->productImage,
                        'seller_name' => $sellerName,
                        'category' => $product->category ?? null,
                        'productDescription' => $product->productDescription ?? null
                    ]
                ];
            })->filter()->values();

            return response()->json($formattedCart);

        } catch (\Exception $e) {
            Log::error('CartController error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch cart items',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Add product to cart
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem = Cart::where('userID', Auth::user()->userID)
                        ->where('cart_id', $id)
                        ->firstOrFail();
        $cartItem->update(['quantity' => $validated['quantity']]);

        return response()->json([
            'success' => true,
            'message' => 'Cart item updated successfully', 
            'cart_item' => $cartItem
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,product_id',
            'quantity'   => 'required|integer|min:1',
        ]);

        // Use database transaction to prevent race conditions
        return DB::transaction(function () use ($validated) {
            // Check if item already exists in cart
            $existingCartItem = Cart::where('userID', Auth::user()->userID)
                                   ->where('product_id', $validated['product_id'])
                                   ->first();

            if ($existingCartItem) {
                // Update existing item quantity
                $existingCartItem->update([
                    'quantity' => $existingCartItem->quantity + $validated['quantity']
                ]);
                $existingCartItem->load('product');
                return response()->json($existingCartItem, 200);
            } else {
                // Create new cart item
                $cartItem = Cart::create([
                    'userID' => Auth::user()->userID,
                    'product_id' => $validated['product_id'],
                    'quantity' => $validated['quantity'],
                ]);
                
                // Load the product relationship to include in the response
                $cartItem->load('product');
                return response()->json($cartItem, 201);
            }
        });
    }

    // Remove product from cart
    public function destroy($id)
    {
        $cartItem = Cart::where('userID', Auth::user()->userID)->where('cart_id', operator: $id)->firstOrFail();
        $cartItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart'
        ]);
    }

    // Checkout: convert cart items into Order + OrderProducts
    public function clear()
    {
        Cart::where('userID', Auth::user()->userID)->delete();
        return response()->json([
            'success' => true,
            'message' => 'Cart cleared successfully'
        ]);
    }

    public function checkout(Request $request)
    {
        try {
            // Start database transaction
            return DB::transaction(function () use ($request) {
                $user = Auth::user();
                
                // Get selected cart item IDs from request (if provided)
                $selectedCartIds = $request->input('selected_items', []);
                
                Log::info('Checkout request', [
                    'user_id' => $user->userID,
                    'selected_items' => $selectedCartIds,
                    'has_selection' => !empty($selectedCartIds)
                ]);
                
                // If selected items are provided, only checkout those items
                // Otherwise, checkout all items (backward compatibility)
                if (!empty($selectedCartIds)) {
                    $cartItems = Cart::with('product')
                        ->where('userID', $user->userID)
                        ->whereIn('cart_id', $selectedCartIds)
                        ->get();
                    
                    Log::info('Checking out selected items', [
                        'selected_count' => count($selectedCartIds),
                        'found_count' => $cartItems->count()
                    ]);
                } else {
                    $cartItems = Cart::with('product')->where('userID', $user->userID)->get();
                    
                    Log::info('Checking out all cart items (no selection provided)', [
                        'cart_count' => $cartItems->count()
                    ]);
                }

                if ($cartItems->isEmpty()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Your cart is empty or selected items not found'
                    ], 400);
                }
                
                // Validate stock availability BEFORE creating order
                foreach ($cartItems as $item) {
                    // Refresh product data to get latest stock
                    $freshProduct = Product::find($item->product_id);
                    
                    if (!$freshProduct) {
                        throw new \Exception("Product '{$item->product->productName}' no longer exists.");
                    }
                    
                    Log::info('Stock check', [
                        'product' => $freshProduct->productName,
                        'available' => $freshProduct->productQuantity,
                        'requested' => $item->quantity
                    ]);
                    
                    if ($freshProduct->productQuantity < $item->quantity) {
                        throw new \Exception("Insufficient stock for product: {$freshProduct->productName}. Available: {$freshProduct->productQuantity}, Requested: {$item->quantity}");
                    }
                    
                    // Update the cart item's product with fresh data
                    $item->product = $freshProduct;
                }

                // Get payment method from request, default to 'cod'
                $paymentMethod = $request->input('payment_method', 'cod');
                Log::info('Checkout with payment method', ['payment_method' => $paymentMethod]);

                // Calculate total amount
                $totalAmount = $cartItems->sum(function ($item) {
                    return $item->product->productPrice * $item->quantity;
                });

                // Find or create customer record
                $customer = Customer::where('user_id', $user->userID)->first();
                if (!$customer) {
                    $customer = Customer::create([
                        'user_id' => $user->userID
                    ]);
                }

                // Generate unique order number (NOT tracking number yet - that comes when rider is assigned)
                $orderNumber = $this->generateOrderNumber();
                
                // Get seller ID from first cart item (assuming single seller per order)
                $firstProduct = $cartItems->first()->product;
                $sellerID = $firstProduct->seller_id ?? null;
                
                // Build complete customer address
                $fullAddress = implode(', ', array_filter([
                    $user->userAddress,
                    $user->userCity,
                    $user->userProvince
                ])) ?: 'Not specified';

                // Determine payment status based on payment method
                // COD orders should be 'pending' payment until delivery
                // Online payments (GCash/PayMaya) will be 'pending' until webhook confirms
                $paymentStatus = ($paymentMethod === 'cod') ? 'pending' : 'pending';

                // Create order with pending status (will be confirmed after payment)
                $order = Order::create([
                    'customer_id' => $customer->customerID,
                    'sellerID' => $sellerID,
                    'status' => 'pending', // Set to pending initially
                    'paymentStatus' => $paymentStatus,
                    'payment_method' => $paymentMethod, // Save the payment method
                    'totalAmount' => $totalAmount,
                    'location' => $fullAddress,
                    'tracking_number' => null, // Tracking number will be generated when rider is assigned
                    'order_number' => $orderNumber // Assign unique order number
                ]);
                
                Log::info('Order created', [
                    'order_id' => $order->orderID,
                    'payment_method' => $paymentMethod,
                    'payment_status' => $paymentStatus
                ]);

                // Create order products
                $orderProducts = [];
                foreach ($cartItems as $item) {
                    $price = $item->product->productPrice;
                    $quantity = $item->quantity;
                    
                    $orderProducts[] = [
                        'order_id' => $order->orderID,
                        'product_id' => $item->product_id,
                        'quantity' => $quantity,
                        'price' => $price,
                        'created_at' => now(),
                        'updated_at' => now()
                    ];

                    // Update product quantity (if needed) - check if enough stock
                    if ($item->product->productQuantity >= $quantity) {
                        $item->product->decrement('productQuantity', $quantity);
                    } else {
                        throw new \Exception("Insufficient stock for product: {$item->product->productName}. Available: {$item->product->productQuantity}, Requested: {$quantity}");
                    }
                }

                // Bulk insert order products
                OrderProduct::insert($orderProducts);

                // Clear ONLY the selected cart items (or all if no selection)
                // This ensures unselected items remain in cart
                if (!empty($selectedCartIds)) {
                    // Remove only selected items
                    Cart::where('userID', $user->userID)
                        ->whereIn('cart_id', $selectedCartIds)
                        ->delete();
                    
                    Log::info('Cleared selected cart items', [
                        'cleared_count' => count($selectedCartIds)
                    ]);
                } else {
                    // Remove all cart items (backward compatibility)
                    Cart::where('userID', $user->userID)->delete();
                    
                    Log::info('Cleared all cart items');
                }

                // Load relationships for response
                $order->load('orderProducts.product');

                return response()->json([
                    'success' => true,
                    'message' => 'Order placed successfully!',
                    'order' => $order
                ]);
            });
        } catch (\Exception $e) {
            Log::error('CartController error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to process checkout',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate unique tracking number
     */
    private function generateTrackingNumber()
    {
        do {
            $trackingNumber = 'CC' . date('Ymd') . strtoupper(substr(md5(uniqid()), 0, 6));
        } while (Order::where('tracking_number', $trackingNumber)->exists() || 
                 \App\Models\Shipping::where('tracking_number', $trackingNumber)->exists());

        return $trackingNumber;
    }

    /**
     * Generate unique order number
     */
    private function generateOrderNumber()
    {
        do {
            $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 6));
        } while (Order::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }
}

