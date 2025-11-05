<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    /**
     * Create a notification for a user.
     *
     * @param int $userId
     * @param string $type
     * @param string $title
     * @param string $message
     * @param string|null $link
     * @param array|null $data
     * @return Notification
     */
    public static function create(
        int $userId,
        string $type,
        string $title,
        string $message,
        ?string $link = null,
        ?array $data = null
    ): Notification {
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'link' => $link,
            'data' => $data,
            'is_read' => false,
        ]);
    }

    /**
     * Notify customer about order status change.
     */
    public static function notifyOrderStatusChange($order, $customerUserId, $newStatus): void
    {
        $statusMessages = [
            'pending' => 'Your order is pending confirmation.',
            'processing' => 'Your order is being processed.',
            'packing' => 'Your order is being packed.',
            'shipped' => 'Your order has been shipped! Track your package to see delivery updates.',
            'delivered' => 'Your order has been delivered!',
            'cancelled' => 'Your order has been cancelled.',
        ];

        $message = $statusMessages[$newStatus] ?? "Your order status has been updated to: {$newStatus}.";

        self::create(
            $customerUserId,
            'order',
            'Order Status Updated',
            $message,
            "/orders",
            [
                'order_id' => $order->orderID,
                'order_number' => $order->order_number ?? null,
                'status' => $newStatus,
            ]
        );
    }

    /**
     * Notify seller about new order.
     */
    public static function notifyNewOrder($order, $sellerUserId): void
    {
        self::create(
            $sellerUserId,
            'order',
            'New Order Received',
            "You have received a new order #{$order->order_number}.",
            "/seller/order-inventory-manager",
            [
                'order_id' => $order->orderID,
                'order_number' => $order->order_number ?? null,
                'customer_id' => $order->customer_id ?? null,
            ]
        );
    }

    /**
     * Notify seller about order cancellation.
     */
    public static function notifyOrderCancellation($order, $sellerUserId): void
    {
        self::create(
            $sellerUserId,
            'order',
            'Order Cancelled',
            "Order #{$order->order_number} has been cancelled.",
            "/seller/order-inventory-manager",
            [
                'order_id' => $order->orderID,
                'order_number' => $order->order_number ?? null,
            ]
        );
    }

    /**
     * Notify user about new message.
     */
    public static function notifyNewMessage($conversation, $recipientUserId, $senderName): void
    {
        self::create(
            $recipientUserId,
            'message',
            'New Message',
            "You have a new message from {$senderName}.",
            "/chatbox",
            [
                'conversation_id' => $conversation->id,
                'sender_name' => $senderName,
            ]
        );
    }

    /**
     * Notify seller about store verification status.
     */
    public static function notifyStoreVerification($sellerUserId, $isApproved, $reason = null): void
    {
        if ($isApproved) {
            self::create(
                $sellerUserId,
                'store_verification',
                'Store Verified',
                'Congratulations! Your store has been verified and approved.',
                '/seller/storefront-customizer',
                [
                    'status' => 'approved',
                ]
            );
        } else {
            self::create(
                $sellerUserId,
                'store_verification',
                'Store Verification Rejected',
                $reason 
                    ? "Your store verification was rejected. Reason: {$reason}"
                    : 'Your store verification was rejected. Please check your store details.',
                '/seller/storefront-customizer',
                [
                    'status' => 'rejected',
                    'reason' => $reason,
                ]
            );
        }
    }

    /**
     * Notify admin about new store verification request.
     */
    public static function notifyAdminNewStoreRequest($adminUserId, $storeName, $sellerName): void
    {
        self::create(
            $adminUserId,
            'admin_action',
            'New Store Verification Request',
            "New store verification request from {$sellerName} - {$storeName}.",
            "/admin/stores",
            [
                'store_name' => $storeName,
                'seller_name' => $sellerName,
            ]
        );
    }

    /**
     * Notify user about account action (deactivation, reactivation, etc.).
     */
    public static function notifyAccountAction($userId, $action, $reason = null): void
    {
        $messages = [
            'deactivated' => $reason 
                ? "Your account has been deactivated. Reason: {$reason}"
                : 'Your account has been deactivated. Please contact support for more information.',
            'reactivated' => 'Your account has been reactivated. You can now log in again.',
            'password_reset' => 'Your password has been reset. Please log in with your new password.',
        ];

        self::create(
            $userId,
            'account_action',
            'Account Update',
            $messages[$action] ?? "Your account has been {$action}.",
            '/settings',
            [
                'action' => $action,
                'reason' => $reason,
            ]
        );
    }

    /**
     * Notify seller about product approval/rejection.
     */
    public static function notifyProductStatus($sellerUserId, $productName, $isApproved, $reason = null): void
    {
        if ($isApproved) {
            self::create(
                $sellerUserId,
                'product',
                'Product Approved',
                "Your product '{$productName}' has been approved and is now live.",
                '/seller/products',
                [
                    'product_name' => $productName,
                    'status' => 'approved',
                ]
            );
        } else {
            self::create(
                $sellerUserId,
                'product',
                'Product Rejected',
                $reason
                    ? "Your product '{$productName}' was rejected. Reason: {$reason}"
                    : "Your product '{$productName}' was rejected. Please review your product details.",
                '/seller/products',
                [
                    'product_name' => $productName,
                    'status' => 'rejected',
                    'reason' => $reason,
                ]
            );
        }
    }

    /**
     * Notify seller about payment received from customer.
     */
    public static function notifyPaymentReceived($sellerUserId, $order, $amount, $paymentMethod): void
    {
        self::create(
            $sellerUserId,
            'payment',
            'Payment Received',
            "You have received a payment of ₱" . number_format($amount, 2) . " for order #{$order->order_number} via {$paymentMethod}.",
            '/seller/payments',
            [
                'order_id' => $order->orderID,
                'order_number' => $order->order_number ?? null,
                'amount' => $amount,
                'payment_method' => $paymentMethod,
            ]
        );
    }

    /**
     * Notify seller about new after-sale request (return/refund/exchange).
     */
    public static function notifyAfterSaleRequest($sellerUserId, $afterSaleRequest, $order): void
    {
        $requestType = ucfirst($afterSaleRequest->request_type);
        $message = "A customer has submitted a {$requestType} request for order #{$order->order_number}.";
        
        self::create(
            $sellerUserId,
            'after_sale',
            'New After-Sale Request',
            $message,
            '/seller/order-inventory-manager',
            [
                'request_id' => $afterSaleRequest->request_id,
                'order_id' => $order->orderID,
                'order_number' => $order->order_number ?? null,
                'request_type' => $afterSaleRequest->request_type,
                'status' => $afterSaleRequest->status,
            ]
        );
    }

    /**
     * Notify customer when seller responds to their after-sale request.
     */
    public static function notifyAfterSaleResponse($customerUserId, $afterSaleRequest, $order, $status): void
    {
        $requestType = ucfirst($afterSaleRequest->request_type);
        
        $statusMessages = [
            'approved' => "Your {$requestType} request for order #{$order->order_number} has been approved.",
            'rejected' => "Your {$requestType} request for order #{$order->order_number} has been rejected.",
            'processing' => "Your {$requestType} request for order #{$order->order_number} is now being processed.",
        ];
        
        $message = $statusMessages[$status] ?? "Seller has responded to your {$requestType} request for order #{$order->order_number}.";
        
        self::create(
            $customerUserId,
            'after_sale',
            ucfirst($status) . ' - ' . $requestType . ' Request',
            $message,
            '/orders',
            [
                'request_id' => $afterSaleRequest->request_id,
                'order_id' => $order->orderID,
                'order_number' => $order->order_number ?? null,
                'request_type' => $afterSaleRequest->request_type,
                'status' => $status,
            ]
        );
    }
}
