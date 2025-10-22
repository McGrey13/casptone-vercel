# Order Status Flow - Complete Guide

## Updated Order Status Flow

### 🎯 Goal
When customers pay via GCash/PayMaya, orders should immediately show in the "To Ship" section (ready for seller to package), not in "To Pay" since payment is already completed.

## Order Status Lifecycle

### For GCash/PayMaya Payments:

```
1. Checkout Created
   ↓
   Status: 'pending'
   Payment: 'pending'
   Display: "To Pay" (temporary)
   
2. Redirected to PayMongo
   ↓
   User authorizes payment in GCash/PayMaya
   
3. Payment Successful
   ↓
   Status: 'processing' ✅
   Payment: 'paid' ✅
   Display: "To Ship" ✅
   Seller: Can see order and start packaging ✅
   
4. Seller Packages
   ↓
   Status: 'packing'
   Display: "To Ship"
   
5. Order Shipped
   ↓
   Status: 'shipped'
   Display: "To Receive"
   
6. Order Delivered
   ↓
   Status: 'delivered'
   Display: "Completed"
```

### For COD (Cash on Delivery) Payments:

```
1. Checkout Created
   ↓
   Status: 'pending'
   Payment: 'pending'
   Display: "To Pay" (will pay on delivery)
   
2. Seller Confirms COD
   ↓
   Status: 'processing'
   Payment: 'pending'
   Display: "To Ship"
   
3. Order Shipped
   ↓
   Status: 'shipped'
   Payment: 'pending'
   Display: "To Receive"
   
4. Order Delivered & Payment Collected
   ↓
   Status: 'delivered'
   Payment: 'paid' (collected)
   Display: "Completed"
```

## Changes Made

### Backend Changes

#### 1. `PaymentController.php` - Success Callback
**File**: `backend/app/Http/Controllers/PaymentController.php`

**Changes**:
- When payment is successful, set order status to `'processing'` (not 'pending')
- This immediately makes the order ready for seller to package
- Added payment status to `'paid'`

```php
$order->update([
    'status' => 'processing', // Ready to package/ship
    'paymentStatus' => 'paid'
]);
```

#### 2. `OrderController.php` - Customer Orders
**File**: `backend/app/Http/Controllers/OrderController.php`

**Changes**:
- Added `'packing'` to allowed statuses
- Added `'payment_failed'` to show failed payments
- Returns `paymentStatus` in response
- Updated to show all relevant order statuses

```php
->whereIn('status', ['pending', 'processing', 'packing', 'shipped', 'delivered', 'cancelled', 'payment_failed'])
```

#### 3. `OrderController.php` - Seller Orders
**Changes**:
- Only shows orders with status `'processing'` or later (paid orders)
- Excludes `'pending'` orders (unpaid)
- Returns `paymentStatus` in response

```php
->whereIn('status', ['processing', 'packing', 'shipped', 'delivered', 'cancelled'])
```

### Frontend Changes

#### 1. `Orders.jsx` - Order Grouping
**File**: `frontend/src/Components/Orders/Orders.jsx`

**Changes**:
- "To Pay" section: Only shows orders with `status === 'pending'` AND `paymentStatus !== 'paid'`
- "To Ship" section: Shows orders with `status === 'processing'`, `'packing'`, OR (`'pending'` AND `paymentStatus === 'paid'`)
- Added payment status badges:
  - ✓ Paid (green) - for GCash/PayMaya paid orders
  - COD (yellow) - for cash on delivery orders

```javascript
'To Pay': orders.filter(order => 
  order.status === 'pending' && order.paymentStatus !== 'paid'
),
'To Ship': orders.filter(order => 
  order.status === 'processing' || 
  order.status === 'packing' ||
  (order.status === 'pending' && order.paymentStatus === 'paid')
),
```

## Status Mapping

| Order Status | Payment Status | Display Tab | Description |
|--------------|----------------|-------------|-------------|
| pending | pending | To Pay | COD or unpaid online order |
| pending | paid | To Ship | Paid online, ready to ship |
| processing | paid | To Ship | Being prepared for shipping |
| packing | paid | To Ship | Seller is packing |
| shipped | paid/pending | To Receive | Out for delivery |
| delivered | paid | Completed | Successfully delivered |
| cancelled | - | Return/Refund | Order cancelled |
| payment_failed | failed | Return/Refund | Payment failed |

## Seller Dashboard View

Sellers will now see:
- ✅ **All orders with status 'processing' or later**
- ✅ **Only confirmed/paid orders** (no pending payments)
- ✅ **Payment status** clearly shown
- ✅ **Orders ready to package immediately after payment**

Orders shown to sellers:
```
processing → packing → shipped → delivered → cancelled
```

Orders NOT shown to sellers:
```
pending (unpaid)
payment_failed (failed payment)
```

## Customer Order View

Customers will see all their orders organized by status:

### To Pay Tab
- COD orders (pending payment on delivery)
- Unpaid online orders

### To Ship Tab
- ✓ Paid orders (GCash/PayMaya) - **Shows immediately after successful payment** ✅
- Processing orders
- Packing orders

### To Receive Tab
- Shipped orders (on the way)

### Completed Tab
- Delivered orders

### Return/Refund Tab
- Cancelled orders
- Failed payment orders
- Returned orders

## Visual Indicators

### Payment Status Badges
```
✓ Paid    → Green badge (GCash/PayMaya successfully paid)
COD       → Yellow badge (Cash on Delivery)
```

## Testing Checklist

### Test GCash Payment Flow
- [ ] Add items to cart (total ≥ ₱100)
- [ ] Select GCash payment
- [ ] Complete payment in PayMongo
- [ ] Redirected to /orders page
- [ ] Order shows in "To Ship" tab (not "To Pay") ✅
- [ ] Order has "✓ Paid" badge ✅
- [ ] Seller sees the order in their dashboard ✅

### Test PayMaya Payment Flow
- [ ] Same as GCash
- [ ] Order appears in "To Ship" tab ✅

### Test COD Payment Flow
- [ ] Select COD payment
- [ ] Order shows in "To Pay" tab initially
- [ ] Order has "COD" badge
- [ ] After seller confirms, moves to "To Ship"

### Test Seller View
- [ ] Login as seller
- [ ] Check seller orders endpoint
- [ ] Should see 'processing' orders from GCash/PayMaya payments ✅
- [ ] Should NOT see unpaid 'pending' orders
- [ ] Can start packaging immediately

## Database Schema

### Orders Table Columns Used
- `orderID` - Primary key
- `customer_id` - Link to customer
- `status` - Order lifecycle status
- `paymentStatus` - Payment completion status
- `totalAmount` - Total order amount

### Status Values
**Order Status**:
- `pending` - Created but not yet processed
- `processing` - Ready to be packaged/shipped
- `packing` - Seller is packing the order
- `shipped` - On the way to customer
- `delivered` - Successfully delivered
- `cancelled` - Order cancelled
- `payment_failed` - Payment authorization failed

**Payment Status**:
- `pending` - Payment not yet received (COD)
- `paid` - Payment successfully received
- `failed` - Payment failed

## API Endpoints Updated

### GET `/api/orders` (Customer Orders)
**Returns**:
```json
[
  {
    "orderID": 123,
    "orderDate": "2025-10-08 12:00:00",
    "status": "processing",
    "paymentStatus": "paid",
    "totalAmount": 299.99,
    "items": [...]
  }
]
```

### GET `/api/orders/seller` (Seller Orders)
**Returns**: Only processing/confirmed orders
**Filters**: Excludes 'pending' (unpaid) orders

## Files Modified

1. `backend/app/Http/Controllers/PaymentController.php`
   - Updated success callback to set status to 'processing'
   - Added payment status tracking

2. `backend/app/Http/Controllers/OrderController.php`
   - Updated customer orders to return paymentStatus
   - Updated seller orders to filter only confirmed orders
   - Added 'packing' and 'payment_failed' statuses

3. `frontend/src/Components/Orders/Orders.jsx`
   - Updated order grouping logic
   - Added payment status badges
   - Updated status descriptions

## Benefits

✅ **Immediate seller visibility** - Paid orders show up instantly for sellers
✅ **Clear payment status** - Customers can see if payment is completed
✅ **Better organization** - Orders grouped by actual workflow status
✅ **Accurate inventory** - Only confirmed orders affect stock
✅ **Better UX** - Clear indication of order and payment state

## Future Enhancements

1. Add order status change notifications
2. Add email confirmations for status changes
3. Add SMS notifications for shipped orders
4. Add order tracking numbers
5. Add payment receipt download
6. Add order cancellation workflow
7. Add refund processing

