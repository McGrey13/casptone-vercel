<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Ixudra\Curl\Facades\Curl;
use App\Models\Payment;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\Seller;
use App\Services\PayMongoService;
use App\Services\CommissionService;
use App\Services\NotificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected PayMongoService $payMongoService;
    protected CommissionService $commissionService;

    public function __construct(PayMongoService $payMongoService, CommissionService $commissionService)
    {
        $this->payMongoService = $payMongoService;
        $this->commissionService = $commissionService;
    }
    public function initiatePayment(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string|in:gcash,paymaya,cod',
            'orderID' => 'nullable|integer|exists:orders,orderID'
        ]);

        $user = $request->user(); // assuming you use Laravel Auth
        $amount = $request->amount * 100; // PayMongo uses cents
        $method = strtolower($request->payment_method);
        $orderID = $request->orderID;

        if ($method === 'cod') {
            return $this->handleCODPayment($amount, $user);
        }

        // GCash / PayMaya (via Sources API)
        return $this->handleEwalletPayment($amount, $method, $user, $orderID);
    }

    private function handleEwalletPayment($amount, $method, $user, $orderID = null)
    {
        // PayMongo requires minimum amount of 10000 centavos (100 PHP)
        if ($amount < 10000) {
            return response()->json([
                'success' => false,
                'message' => 'Minimum payment amount is ₱100. Your current total is ₱' . ($amount / 100) . '. Please add more items to your cart.'
            ], 400);
        }

        // Map payment method to PayMongo source type
        $sourceType = $method === 'paymaya' ? 'grab_pay' : $method;

        $sourceData = [
            "data" => [
                "attributes" => [
                    "amount" => $amount,
                    "currency" => "PHP",
                    "type" => $sourceType, // gcash or grab_pay (for paymaya)
                    "redirect" => [
                        "success" => url('/api/payment/success'),
                        "failed"  => url('/api/payment/failed')
                    ],
                    "billing" => [
                        "name" => $user->userName ?? 'Customer',
                        "email" => $user->userEmail ?? 'customer@example.com',
                        "phone" => $user->userContactNumber ?? '09123456789'
                    ]
                ]
            ]
        ];

        // Add metadata if order ID is provided
        // PayMongo metadata must be simple strings, not nested objects
        if ($orderID) {
            $sourceData['data']['attributes']['metadata'] = [
                'orderID' => (string) $orderID,
                'order_id' => (string) $orderID,
                'user_id' => (string) ($user->userID ?? ''),
                'user_name' => (string) ($user->userName ?? '')
            ];
        }

        try {
            $response = Curl::to('https://api.paymongo.com/v1/sources')
                ->withHeaders([
                    'Content-Type: application/json',
                    'Accept: application/json',
                    'Authorization: Basic ' . base64_encode(env('PAYMONGO_SECRET_KEY') . ':')
                ])
                ->withData($sourceData)
                ->asJson()
                ->post();

            \Log::info('PayMongo Source API Response', [
                'response' => $response,
                'sourceData' => $sourceData
            ]);

            if (!isset($response->data->attributes->redirect->checkout_url)) {
                \Log::error('PayMongo Source Creation Failed', [
                    'response' => $response,
                    'sourceData' => $sourceData
                ]);
                
                $errorMessage = 'Unable to create source';
                if (isset($response->errors)) {
                    $errorMessage = json_encode($response->errors);
                }
                
                return response()->json([
                    'success' => false, 
                    'message' => $errorMessage,
                    'debug_response' => $response
                ], 500);
            }

            return response()->json([
                'success' => true,
                'checkout_url' => $response->data->attributes->redirect->checkout_url,
                'redirect_url' => $response->data->attributes->redirect->checkout_url
            ]);
        } catch (\Exception $e) {
            \Log::error('PayMongo Source Creation Exception', [
                'error' => $e->getMessage(),
                'sourceData' => $sourceData
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Payment service error: ' . $e->getMessage()
            ], 500);
        }
    }

    private function handleCardPayment($amount, $user)
    {
        $intentData = [
            "data" => [
                "attributes" => [
                    "amount" => $amount,
                    "currency" => "PHP",
                    "payment_method_allowed" => ["card"],
                    "description" => "Payment by " . ($user->userName ?? 'Customer')
                ]
            ]
        ];

        $response = Curl::to('https://api.paymongo.com/v1/payment_intents')
            ->withHeaders([
                'Content-Type: application/json',
                'Accept: application/json',
                'Authorization: Basic ' . base64_encode(env('PAYMONGO_SECRET_KEY') . ':')
            ])
            ->withData($intentData)
            ->asJson()
            ->post();

        if (!isset($response->data->id)) {
            return response()->json(['success' => false, 'message' => 'Unable to create payment intent'], 500);
        }

        return response()->json([
            'success' => true,
            'payment_intent_id' => $response->data->id,
            'client_key' => $response->data->attributes->client_key
        ]);
    }

    private function handleCODPayment($amount, $user)
    {
        // For COD payments, we don't need PayMongo integration
        // Just return success response
        return response()->json([
            'success' => true,
            'payment_method' => 'cod',
            'message' => 'COD payment initiated successfully'
        ]);
    }

    // ✅ Handle success callback
    public function success(Request $request)
    {
        try {
            // Extract payment source ID from the request
            $sourceId = $request->get('source_id') ?? $request->get('payment_id');
            
            // Log the successful payment
            \Log::info('Payment Success Callback', [
                'source_id' => $sourceId,
                'request_data' => $request->all(),
                'timestamp' => now(),
                'paymongo_env' => env('PAYMONGO_SECRET_KEY') ? 'configured' : 'not configured'
            ]);

            // TEST MODE SIMULATION: If we can't verify with PayMongo (test mode),
            // just mark the most recent pending order as paid
            $isTestMode = str_contains(env('PAYMONGO_SECRET_KEY', ''), 'sk_test') || 
                         env('APP_ENV') === 'local' ||
                         !$sourceId;
            
            if ($isTestMode) {
                \Log::info('Running in TEST/SIMULATION MODE - Auto-confirming payment');
                
                // Find the most recent pending order with GCash or PayMaya
                $recentOrder = Order::whereIn('payment_method', ['gcash', 'paymaya'])
                    ->where('paymentStatus', 'pending')
                    ->orderBy('created_at', 'desc')
                    ->first();
                
                if ($recentOrder) {
                    $recentOrder->update([
                        'status' => 'processing',
                        'paymentStatus' => 'paid'
                    ]);

                    // Notify customer about payment success
                    if ($recentOrder->customer && $recentOrder->customer->user_id) {
                        NotificationService::notifyOrderStatusChange($recentOrder, $recentOrder->customer->user_id, 'processing');
                    }

                    // Notify seller about new order and payment received
                    if ($recentOrder->sellerID) {
                        $seller = Seller::find($recentOrder->sellerID);
                        if ($seller && $seller->user_id) {
                            // Notify about new order
                            NotificationService::notifyNewOrder($recentOrder, $seller->user_id);
                            
                            // Notify about payment received
                            $paymentMethod = $recentOrder->payment_method === 'paymaya' ? 'PayMaya' : 
                                           ($recentOrder->payment_method === 'gcash' ? 'GCash' : 'Online Payment');
                            NotificationService::notifyPaymentReceived(
                                $seller->user_id,
                                $recentOrder,
                                $recentOrder->totalAmount,
                                $paymentMethod
                            );
                        }
                    }
                    
                    \Log::info('TEST MODE: Order auto-confirmed', [
                        'order_id' => $recentOrder->orderID,
                        'payment_method' => $recentOrder->payment_method
                    ]);
                    
                    // Redirect to frontend orders page
                    $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
                    return redirect($frontendUrl . '/orders?payment=success&order_id=' . $recentOrder->orderID);
                }
            }

            // Try to retrieve the payment source from PayMongo to verify
            if ($sourceId) {
                try {
                    $response = Curl::to("https://api.paymongo.com/v1/sources/{$sourceId}")
                        ->withHeaders([
                            'Accept: application/json',
                            'Authorization: Basic ' . base64_encode(env('PAYMONGO_SECRET_KEY') . ':')
                        ])
                        ->asJson()
                        ->get();

                    \Log::info('Payment Source Retrieved', [
                        'source_id' => $sourceId,
                        'status' => $response->data->attributes->status ?? 'unknown'
                    ]);

                    // Check if payment was successful
                    if (isset($response->data->attributes->status) && 
                        ($response->data->attributes->status === 'chargeable' || 
                         $response->data->attributes->status === 'paid')) {
                        
                        // Extract order ID from metadata
                        $metadata = $response->data->attributes->metadata ?? [];
                        $orderID = $metadata['orderID'] ?? $metadata['order_id'] ?? null;
                        
                        \Log::info('Payment metadata extracted', [
                            'metadata' => $metadata,
                            'orderID' => $orderID
                        ]);
                        
                        // If no order ID in metadata, try to find the most recent pending order for simulation
                        if (!$orderID) {
                            \Log::warning('No orderID in metadata, attempting to find order by source_id or recent pending order');
                            
                            // For test/simulation mode, find the most recent pending order with matching payment method
                            $paymentType = $response->data->attributes->type ?? 'gcash';
                            $order = Order::where('paymentStatus', 'pending')
                                ->where('payment_method', $paymentType === 'gcash.source' ? 'gcash' : 'paymaya')
                                ->orderBy('created_at', 'desc')
                                ->first();
                                
                            if ($order) {
                                $orderID = $order->orderID;
                                \Log::info('Found order by payment method', [
                                    'order_id' => $orderID,
                                    'payment_type' => $paymentType
                                ]);
                            }
                        }
                        
                        // Update order and payment status if order ID is found
                        if ($orderID) {
                            $order = Order::find($orderID);
                            if ($order) {
                                \Log::info('Updating order after payment success', [
                                    'order_id' => $orderID,
                                    'current_status' => $order->status,
                                    'current_payment_status' => $order->paymentStatus
                                ]);
                                
                                // For online payments (GCash/PayMaya), set to "processing" since payment is already done
                                // This moves the order to "To Package" tab - ready for seller to package
                                $order->update([
                                    'status' => 'processing', // Ready to package/ship since payment is confirmed
                                    'paymentStatus' => 'paid'
                                ]);

                                // Notify customer about payment success
                                if ($order->customer && $order->customer->user_id) {
                                    NotificationService::notifyOrderStatusChange($order, $order->customer->user_id, 'processing');
                                }

                                // Notify seller about new order and payment received
                                if ($order->sellerID) {
                                    $seller = Seller::find($order->sellerID);
                                    if ($seller && $seller->user_id) {
                                        // Notify about new order
                                        NotificationService::notifyNewOrder($order, $seller->user_id);
                                        
                                        // Notify about payment received
                                        $paymentMethod = $paymongoType === 'grab_pay' ? 'PayMaya' : 'GCash';
                                        NotificationService::notifyPaymentReceived(
                                            $seller->user_id,
                                            $order,
                                            $order->totalAmount,
                                            $paymentMethod
                                        );
                                    }
                                }

                                // Map PayMongo source type back to our internal payment method
                                $paymongoType = $response->data->attributes->type;
                                $paymentMethod = $paymongoType === 'grab_pay' ? 'paymaya' : $paymongoType;

                                // Update or create payment record
                                $payment = Payment::updateOrCreate(
                                    ['orderID' => $orderID],
                                    [
                                        'userID' => $order->customer_id,
                                        'amount' => $response->data->attributes->amount / 100, // Convert from centavos
                                        'currency' => 'PHP',
                                        'paymentMethod' => $paymentMethod,
                                        'paymentStatus' => 'paid',
                                        'payment_type' => 'online',
                                        'paymongo_source_id' => $sourceId,
                                        'payment_details' => $response->data
                                    ]
                                );

                                \Log::info('Order and payment updated successfully', [
                                    'order_id' => $orderID,
                                    'new_status' => 'processing',
                                    'new_payment_status' => 'paid',
                                    'payment_id' => $payment->payment_id ?? 'N/A'
                                ]);
                            } else {
                                \Log::error('Order not found for ID', ['order_id' => $orderID]);
                            }
                        } else {
                            \Log::error('Could not determine order ID from payment', [
                                'metadata' => $metadata,
                                'source_id' => $sourceId
                            ]);
                        }
                    }
                } catch (\Exception $e) {
                    \Log::error('Error verifying payment source', [
                        'source_id' => $sourceId,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            // Redirect to frontend orders page (my orders)
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect($frontendUrl . '/orders?payment=success&source_id=' . $sourceId);
            
        } catch (\Exception $e) {
            \Log::error('Payment Success Callback Error', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);
            
            // Redirect to orders page with error parameter
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect($frontendUrl . '/orders?payment=error');
        }
    }

    // ✅ Handle failed callback
    public function failed(Request $request)
    {
        try {
            $sourceId = $request->get('source_id') ?? $request->get('payment_id');
            
            // Log the failed payment
            \Log::info('Payment Failed Callback', [
                'source_id' => $sourceId,
                'request_data' => $request->all(),
                'timestamp' => now()
            ]);

            // Try to extract order ID from the source if available
            if ($sourceId) {
                try {
                    $response = Curl::to("https://api.paymongo.com/v1/sources/{$sourceId}")
                        ->withHeaders([
                            'Accept: application/json',
                            'Authorization: Basic ' . base64_encode(env('PAYMONGO_SECRET_KEY') . ':')
                        ])
                        ->asJson()
                        ->get();

                    $metadata = $response->data->attributes->metadata ?? [];
                    $orderID = $metadata['orderID'] ?? $metadata['order_id'] ?? null;
                    
                    // Update order status to failed if order ID is found
                    if ($orderID) {
                        $order = Order::find($orderID);
                        if ($order) {
                            $order->update([
                                'status' => 'payment_failed',
                                'paymentStatus' => 'failed'
                            ]);
                        }
                    }
                } catch (\Exception $e) {
                    \Log::error('Error processing failed payment', [
                        'source_id' => $sourceId,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            // Redirect to frontend orders page with error
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect($frontendUrl . '/orders?payment=failed&source_id=' . $sourceId);
            
        } catch (\Exception $e) {
            \Log::error('Payment Failed Callback Error', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);
            
            // Redirect to orders page with error parameter
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect($frontendUrl . '/orders?payment=failed');
        }
    }

    // ✅ Handle payment success with payment ID
    public function paymentSuccess(Request $request, $payment_id)
    {
        try {
            // Log the successful payment
            \Log::info('Payment Success', [
                'payment_id' => $payment_id,
                'request_data' => $request->all(),
                'timestamp' => now()
            ]);

            // You can add additional logic here like:
            // - Update order status
            // - Send confirmation email
            // - Update inventory
            // - Create payment record in database

            return response()->json([
                'success' => true, 
                'message' => 'Payment successful!',
                'payment_id' => $payment_id,
                'redirect_url' => url('/payment-success') // Frontend success page
            ]);
        } catch (\Exception $e) {
            \Log::error('Payment Success Error', [
                'payment_id' => $payment_id,
                'error' => $e->getMessage(),
                'timestamp' => now()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error processing payment success',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ✅ Handle payment failure with payment ID
    public function paymentFailed(Request $request, $payment_id)
    {
        try {
            // Log the failed payment
            \Log::info('Payment Failed', [
                'payment_id' => $payment_id,
                'request_data' => $request->all(),
                'timestamp' => now()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment failed. Please try again.',
                'payment_id' => $payment_id,
                'redirect_url' => url('/payment-failed') // Frontend failure page
            ]);
        } catch (\Exception $e) {
            \Log::error('Payment Failed Error', [
                'payment_id' => $payment_id,
                'error' => $e->getMessage(),
                'timestamp' => now()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error processing payment failure',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create payment intent for order
     */
    public function createPaymentIntent(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,orderID',
            'payment_methods' => 'array|required',
            'payment_methods.*' => 'string|in:gcash,paymaya,cod'
        ]);

        try {
            $order = Order::with('orderProducts.product')->findOrFail($request->order_id);
            
            // Calculate total amount in centavos
            $totalAmount = $order->orderProducts->sum(function ($orderProduct) {
                return $orderProduct->price * $orderProduct->quantity * 100; // Convert to centavos
            });

            if ($totalAmount <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid order amount'
                ], 400);
            }

            // Handle both online payments and COD
            if (in_array('cod', $request->payment_methods)) {
                return $this->handleCODPaymentForOrder($order, $totalAmount);
            }
            
            return $this->handleOnlinePayment($order, $totalAmount, $request->payment_methods);

        } catch (\Exception $e) {
            Log::error('Payment intent creation failed', [
                'error' => $e->getMessage(),
                'order_id' => $request->order_id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment intent',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle PayMongo webhook
     */
    public function handleWebhook(Request $request)
    {
        try {
            $payload = $request->getContent();
            $signature = $request->header('Paymongo-Signature');
            $webhookSecret = config('services.paymongo.webhook_secret');

            // Verify webhook signature
            if (!$this->payMongoService->verifyWebhookSignature($payload, $signature, $webhookSecret)) {
                Log::warning('Invalid webhook signature', [
                    'signature' => $signature,
                    'payload_length' => strlen($payload)
                ]);
                return response()->json(['error' => 'Invalid signature'], 401);
            }

            $event = json_decode($payload, true);
            $eventType = $event['data']['attributes']['type'] ?? null;

            Log::info('Webhook received', [
                'event_type' => $eventType,
                'event_id' => $event['data']['id'] ?? null
            ]);

            // Handle different event types
            switch ($eventType) {
                case 'payment_intent.succeeded':
                    return $this->handlePaymentSuccess($event);
                case 'payment_intent.payment_failed':
                    return $this->handlePaymentFailure($event);
                default:
                    Log::info('Unhandled webhook event', ['type' => $eventType]);
                    return response()->json(['message' => 'Event not handled'], 200);
            }

        } catch (\Exception $e) {
            Log::error('Webhook processing failed', [
                'error' => $e->getMessage(),
                'payload' => $request->getContent()
            ]);

            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    /**
     * Handle successful payment
     */
    private function handlePaymentSuccess(array $event)
    {
        try {
            $intentId = $event['data']['id'];
            $amount = $event['data']['attributes']['amount'];
            $metadata = $event['data']['attributes']['metadata'] ?? [];

            // Find the payment record
            $payment = Payment::where('paymongo_payment_intent_id', $intentId)->first();
            
            if (!$payment) {
                Log::error('Payment record not found', ['intent_id' => $intentId]);
                return response()->json(['error' => 'Payment not found'], 404);
            }

            // Process payment with commission service
            $paymentData = [
                'order_id' => $payment->orderID,
                'amount_cents' => $amount,
                'paymongo_payment_id' => $intentId,
                'paymongo_intent_id' => $intentId,
                'metadata' => $metadata
            ];

            $result = $this->commissionService->processPayment($paymentData);

            if (!$result['success']) {
                Log::error('Payment processing failed', [
                    'error' => $result['error'],
                    'payment_id' => $payment->payment_id
                ]);
                return response()->json(['error' => 'Payment processing failed'], 500);
            }

            // Update payment status
            $payment->update([
                'paymentStatus' => 'paid',
                'payment_details' => array_merge($payment->payment_details ?? [], $event)
            ]);

            Log::info('Payment processed successfully', [
                'payment_id' => $payment->payment_id,
                'transaction_id' => $result['transaction']->id,
                'amount' => $amount
            ]);

            return response()->json(['message' => 'Payment processed successfully']);

        } catch (\Exception $e) {
            Log::error('Payment success handling failed', [
                'error' => $e->getMessage(),
                'event' => $event
            ]);

            return response()->json(['error' => 'Payment success handling failed'], 500);
        }
    }

    /**
     * Handle failed payment
     */
    private function handlePaymentFailure(array $event)
    {
        try {
            $intentId = $event['data']['id'];
            $failureReason = $event['data']['attributes']['last_payment_error']['message'] ?? 'Unknown error';

            // Find the payment record
            $payment = Payment::where('paymongo_payment_intent_id', $intentId)->first();
            
            if ($payment) {
                $payment->update([
                    'paymentStatus' => 'failed',
                    'failure_reason' => $failureReason,
                    'payment_details' => array_merge($payment->payment_details ?? [], $event)
                ]);

                // Update order status
                $order = Order::find($payment->orderID);
                if ($order) {
                    $order->update(['status' => 'failed']);
                }
            }

            Log::info('Payment failed', [
                'intent_id' => $intentId,
                'reason' => $failureReason
            ]);

            return response()->json(['message' => 'Payment failure handled']);

        } catch (\Exception $e) {
            Log::error('Payment failure handling failed', [
                'error' => $e->getMessage(),
                'event' => $event
            ]);

            return response()->json(['error' => 'Payment failure handling failed'], 500);
        }
    }


    /**
     * Handle online payment
     */
    private function handleOnlinePayment(Order $order, int $totalAmount, array $paymentMethods)
    {
        try {
            // Create payment intent with PayMongo
            $paymentData = [
                'amount_cents' => $totalAmount,
                'currency' => 'PHP',
                'payment_methods' => $paymentMethods,
                'description' => 'Payment for Order #' . $order->orderID,
                'metadata' => [
                    'order_id' => $order->orderID,
                    'customer_id' => $order->customer_id
                ]
            ];

            $result = $this->payMongoService->createPaymentIntent($paymentData);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create payment intent',
                    'error' => $result['error']
                ], 500);
            }

            // Generate unique payment reference number
            $referenceNumber = $this->generatePaymentReference($paymentMethods[0] ?? 'online');

            // Create payment record
            $payment = Payment::create([
                'userID' => $order->userID,
                'orderID' => $order->orderID,
                'amount' => $totalAmount / 100,
                'currency' => 'PHP',
                'paymentMethod' => implode(',', $paymentMethods),
                'paymentStatus' => 'pending',
                'payment_type' => 'online',
                'reference_number' => $referenceNumber,
                'paymongo_payment_intent_id' => $result['data']['id'],
                'payment_details' => $result['data']
            ]);

            // Update order status
            $order->update(['status' => 'pending_payment']);

            Log::info('Online payment intent created', [
                'order_id' => $order->orderID,
                'payment_id' => $payment->payment_id,
                'intent_id' => $result['data']['id'],
                'amount' => $totalAmount,
                'methods' => $paymentMethods
            ]);

            return response()->json([
                'success' => true,
                'payment_type' => 'online',
                'payment_intent_id' => $result['data']['id'],
                'client_key' => $result['data']['attributes']['client_key'],
                'checkout_url' => $result['data']['attributes']['next_action']['redirect']['url'] ?? null,
                'payment_id' => $payment->payment_id
            ]);

        } catch (\Exception $e) {
            Log::error('Online payment creation failed', [
                'error' => $e->getMessage(),
                'order_id' => $order->orderID
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create online payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle COD payment for order
     */
    private function handleCODPaymentForOrder(Order $order, int $totalAmount)
    {
        try {
            // Generate unique payment reference number
            $referenceNumber = $this->generatePaymentReference('cod');
            
            // Create payment record for COD
            $payment = Payment::create([
                'userID' => $order->userID,
                'orderID' => $order->orderID,
                'paymentMethod' => 'cod',
                'paymentStatus' => 'pending',
                'amount' => $totalAmount / 100, // Convert back to pesos
                'currency' => 'PHP',
                'payment_type' => 'cod',
                'orderDate' => now(),
                'reference_number' => $referenceNumber
            ]);

            // Update order status
            $order->update([
                'orderStatus' => 'pending_payment',
                'paymentStatus' => 'pending'
            ]);

            Log::info('COD payment created successfully', [
                'order_id' => $order->orderID,
                'payment_id' => $payment->payment_id,
                'amount' => $totalAmount
            ]);

            return response()->json([
                'success' => true,
                'payment_type' => 'cod',
                'payment_id' => $payment->payment_id,
                'message' => 'COD payment created successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('COD payment creation failed', [
                'error' => $e->getMessage(),
                'order_id' => $order->orderID
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create COD payment',
                'error' => $e->getMessage()
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
     * Generate unique payment reference number
     */
    private function generatePaymentReference($method = 'online')
    {
        do {
            // Format: PAY-YYYYMMDD-METHOD-RANDOM
            $methodCode = strtoupper(substr($method, 0, 4)); // First 4 letters of method
            $referenceNumber = 'PAY-' . date('Ymd') . '-' . $methodCode . '-' . strtoupper(substr(md5(uniqid()), 0, 6));
        } while (Payment::where('reference_number', $referenceNumber)->exists());

        return $referenceNumber;
    }

}
