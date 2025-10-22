# PayMongo Payment Flow Fix Summary

## Problem
After authorizing payment in PayMongo (GCash/PayMaya), users were not being redirected to their orders page and orders were not being properly saved in the database.

## Issues Fixed

### 1. **Success Redirect Not Going to Orders Page**
- **Before**: Redirected to `/payment-success`
- **After**: Redirects to `/orders?payment=success`

### 2. **Order Status Not Updated After Payment**
- **Before**: Order remained in pending state even after successful payment
- **After**: Order status updated to "pending" (confirmed) and paymentStatus set to "paid"

### 3. **Payment Record Not Saved**
- **Before**: Payment wasn't saved to database after successful authorization
- **After**: Payment record created/updated with PayMongo source ID and details

### 4. **Order ID Not Passed to PayMongo**
- **Before**: PayMongo metadata didn't include order ID
- **After**: Order ID included in metadata for tracking

## Changes Made

### Backend Changes

#### 1. `PaymentController.php` - Success Handler
**File**: `backend/app/Http/Controllers/PaymentController.php`

**Key Updates**:
- Retrieves payment source from PayMongo to verify payment status
- Extracts order ID from PayMongo metadata
- Updates order status to "pending" and paymentStatus to "paid"
- Creates/updates payment record in database
- Redirects to frontend `/orders` page with success parameter

```php
// Redirect to orders page after successful payment
return redirect($frontendUrl . '/orders?payment=success&source_id=' . $sourceId);
```

#### 2. `PaymentController.php` - Failed Handler
**Updates**:
- Retrieves payment source to get order ID
- Updates order status to "payment_failed" if order exists
- Redirects to `/orders` page with failed parameter

```php
// Redirect to orders page after failed payment
return redirect($frontendUrl . '/orders?payment=failed&source_id=' . $sourceId);
```

#### 3. `PaymentController.php` - Metadata Addition
**Updates**:
- Added `orderID` parameter to `initiatePayment` method
- Passes order ID to `handleEwalletPayment`
- Includes order ID in PayMongo source metadata

```php
$sourceData['data']['attributes']['metadata'] = [
    'orderID' => $orderID,
    'order_id' => $orderID,
    'user_id' => $user->userID ?? null
];
```

### Frontend Changes

#### 1. `CartContext.jsx` - Order ID Passing
**File**: `frontend/src/Components/Cart/CartContext.jsx`

**Key Updates**:
- Ensures order ID is included in payment initiation request
- Adds console logging for debugging
- Order ID passed to PayMongo via backend API

```javascript
const sessionPayload = {
    amount: amount,
    payment_method: paymentMethod,
    orderID: orderID  // Include order ID so PayMongo metadata contains it
};
```

## Payment Flow (Updated)

### GCash/PayMaya Payment Flow

1. **User clicks "Place Order" on checkout page**
   - Frontend calls `/api/cart/checkout` (CartContext)
   - Order is created in database with status "pending_payment"
   - Order ID is returned to frontend

2. **Frontend initiates PayMongo payment**
   - Calls `/api/payments/initiate` with order ID
   - Backend creates PayMongo source with order ID in metadata
   - User redirected to PayMongo (GCash/PayMaya) page

3. **User authorizes payment in PayMongo**
   - User completes payment authorization
   - PayMongo processes the payment

4. **PayMongo redirects back to our app**
   - **Success**: Redirects to `/api/payment/success?source_id={sourceId}`
   - **Failed**: Redirects to `/api/payment/failed?source_id={sourceId}`

5. **Backend processes the callback**
   - Retrieves payment source from PayMongo
   - Extracts order ID from metadata
   - Updates order status and creates payment record
   - Redirects user to `/orders` page

6. **User sees their order**
   - Order displayed in "My Orders" page
   - Payment status shown as "paid" (success) or "failed"

### COD Payment Flow

1. User selects "Cash on Delivery"
2. Order created with status "pending"
3. User redirected directly to `/orders` page
4. No PayMongo interaction needed

## Database Updates

### Orders Table
- `status`: Updated to "pending" (confirmed) after successful payment
- `paymentStatus`: Updated to "paid" after successful payment
- `status`: Updated to "payment_failed" if payment fails

### Payments Table
New payment record created with:
- `orderID`: Link to the order
- `userID`: Customer ID
- `amount`: Payment amount (converted from centavos)
- `currency`: "PHP"
- `paymentMethod`: "gcash" or "paymaya"
- `paymentStatus`: "paid" or "failed"
- `payment_type`: "online"
- `paymongo_source_id`: PayMongo source ID for tracking
- `payment_details`: Full PayMongo response data (JSON)

## Configuration Required

### Environment Variables
Make sure your `.env` file has:

```env
# PayMongo Configuration
PAYMONGO_SECRET_KEY=sk_test_your_secret_key_here

# Frontend URL (must match your React dev server)
FRONTEND_URL=http://localhost:5173
```

### PayMongo Dashboard Settings
1. Login to PayMongo Dashboard
2. Go to Settings > Webhooks
3. Set redirect URLs:
   - Success: `http://your-backend-url/api/payment/success`
   - Failed: `http://your-backend-url/api/payment/failed`

## Testing Steps

### 1. Test GCash Payment Success

1. Add products to cart
2. Click "Proceed to Checkout"
3. Select "GCash" as payment method
4. Click "Place Order"
5. Complete payment authorization in GCash
6. **Expected Result**:
   - Redirected to `/orders` page
   - Order shows in "My Orders" with "Pending" status
   - Payment status shows as "Paid"
   - Order saved in database

### 2. Test PayMaya Payment Success

1. Follow same steps as GCash but select "PayMaya"
2. **Expected Result**: Same as GCash test

### 3. Test Payment Failure

1. Start checkout process
2. In PayMongo page, cancel or let payment fail
3. **Expected Result**:
   - Redirected to `/orders` page
   - Order shows with "Payment Failed" status
   - User can retry payment if needed

### 4. Test COD Payment

1. Select "Cash on Delivery"
2. Click "Place Order"
3. **Expected Result**:
   - Immediately redirected to `/orders` page
   - Order shows with "Pending" status
   - Payment shows as "Pending" (to be paid on delivery)

## Verification Queries

### Check Order Status
```sql
SELECT orderID, status, paymentStatus, totalAmount, created_at 
FROM orders 
WHERE orderID = ?;
```

### Check Payment Record
```sql
SELECT payment_id, orderID, paymentMethod, paymentStatus, amount, paymongo_source_id 
FROM payments 
WHERE orderID = ?;
```

### Check Recent Payments
```sql
SELECT o.orderID, o.status, o.paymentStatus, p.paymentMethod, p.paymongo_source_id, o.created_at
FROM orders o
LEFT JOIN payments p ON o.orderID = p.orderID
ORDER BY o.created_at DESC
LIMIT 10;
```

## Troubleshooting

### Orders Not Showing After Payment

**Check**:
1. Laravel logs: `backend/storage/logs/laravel.log`
2. Look for "Payment Success Callback" entries
3. Verify order ID is in PayMongo metadata

### Payment Not Updating Order

**Check**:
1. PayMongo metadata includes `orderID`
2. Order exists in database
3. Frontend passes orderID to backend

### Redirecting to Wrong URL

**Check**:
1. `FRONTEND_URL` in `.env` matches your React dev server
2. Usually `http://localhost:5173` for Vite
3. Not `http://localhost:3000` (that's for Create React App)

### PayMongo Webhook Not Working

**Note**: The current implementation uses redirect callbacks, not webhooks.
Webhooks are for async notifications and are handled separately in `handleWebhook()`.

## Files Modified

1. `backend/app/Http/Controllers/PaymentController.php`
   - Updated `success()` method
   - Updated `failed()` method  
   - Updated `initiatePayment()` method
   - Updated `handleEwalletPayment()` method

2. `frontend/src/Components/Cart/CartContext.jsx`
   - Updated payment payload to include orderID
   - Added console logging for debugging

## Security Notes

- Order ID is stored in PayMongo metadata (not in URL)
- PayMongo API key is never exposed to frontend
- Payment verification happens server-side
- User authentication required for all payment operations

## Next Steps

1. **Test all payment flows** (GCash, PayMaya, COD)
2. **Monitor Laravel logs** during testing
3. **Verify order status updates** in database
4. **Check payment records** are created properly
5. **Test with real PayMongo test cards/accounts**

## Additional Enhancements (Future)

1. Add email notifications when payment succeeds
2. Add SMS notifications for order confirmation
3. Implement order retry mechanism for failed payments
4. Add payment history page
5. Implement refund processing
6. Add invoice generation after successful payment

## Support

If issues persist:
1. Check Laravel logs: `backend/storage/logs/laravel.log`
2. Check browser console for JavaScript errors
3. Verify PayMongo API credentials
4. Test with PayMongo test mode first
5. Check database connection and migrations
