# 📦 Shipping Simulation - Auto-Fetch Customer Address

## Overview
Updated the Shipping Simulation system to **automatically fetch the customer's delivery address** from the order, eliminating manual address entry and ensuring accuracy.

---

## ✅ Changes Made

### 1. **Frontend - ShippingSimulation.jsx**

#### Auto-Populate Address on Order Selection
```javascript
onClick={() => {
  setSelectedOrder(order);
  // Auto-populate delivery info from order's customer location
  setDeliveryInfo({
    deliveryAddress: order.location || "",
    deliveryCity: "",
    deliveryProvince: "",
    deliveryNotes: "",
    estimatedDelivery: ""
  });
}}
```

#### Read-Only Address Field
```javascript
<Textarea
  id="deliveryAddress"
  value={deliveryInfo.deliveryAddress}
  readOnly
  disabled
  rows={3}
  className="border-[#e5ded7] bg-gray-50 text-[#5c3d28] resize-none cursor-not-allowed opacity-75"
  placeholder="Customer's delivery address will appear here..."
/>
```

#### Visual Indicators
- ✅ Badge showing "Auto-fetched from Order"
- ✅ Blue info box explaining the address source
- ✅ Disabled/read-only styling to prevent editing
- ✅ Helper text below the field

#### Updated API Request
```javascript
const shippingData = {
  order_id: orderId,
  tracking_number: trackingNum,
  rider_info: riderInfo,
  delivery_info: {
    // Only send optional fields - address is auto-fetched from customer on backend
    delivery_notes: deliveryInfo.deliveryNotes,
    estimated_delivery: deliveryInfo.estimatedDelivery
  },
  status: 'shipped'
};
```

---

### 2. **Backend - ShippingController.php**

#### Auto-Fetch Customer Address
```php
// Load order with customer and user relationships
$order = Order::with('customer.user')->findOrFail($request->order_id);

// Auto-fetch customer address from order
$customer = $order->customer;
if (!$customer || !$customer->user) {
    return response()->json([
        'success' => false,
        'message' => 'Customer information not found for this order'
    ], 400);
}

// Use customer's registered address
$deliveryAddress = $customer->user->userAddress ?? $order->location ?? 'Address not available';
$deliveryCity = $customer->user->userCity ?? '';
$deliveryProvince = $customer->user->userProvince ?? '';
```

#### Updated Validation
```php
$request->validate([
    'order_id' => 'required|exists:orders,orderID',
    'tracking_number' => 'required|string',
    'rider_info' => 'required|array',
    // ... rider info validation ...
    'delivery_info' => 'nullable|array',  // ✅ Now nullable
    'delivery_info.delivery_notes' => 'nullable|string',
    'delivery_info.estimated_delivery' => 'nullable|date',
    // ✅ Removed: delivery_address, delivery_city, delivery_province
]);
```

#### Create Shipping Record with Auto-Fetched Address
```php
$shipping = Shipping::create([
    'order_id' => $request->order_id,
    'tracking_number' => $request->tracking_number,
    'rider_name' => $request->rider_info['rider_name'],
    'rider_phone' => $request->rider_info['rider_phone'],
    'rider_email' => $request->rider_info['rider_email'] ?? null,
    'vehicle_type' => $request->rider_info['vehicle_type'],
    'vehicle_number' => $request->rider_info['vehicle_number'],
    'delivery_address' => $deliveryAddress,  // ✅ Auto-fetched
    'delivery_city' => $deliveryCity,        // ✅ Auto-fetched
    'delivery_province' => $deliveryProvince, // ✅ Auto-fetched
    'delivery_notes' => $request->delivery_info['delivery_notes'] ?? null,
    'estimated_delivery' => $request->delivery_info['estimated_delivery'] ?? null,
    'status' => $request->status,
    'assigned_at' => now()
]);
```

---

## 🎯 How It Works

### **Step-by-Step Flow:**

1. **Seller Views Shipping Simulation**
   - Only orders in "Packing" status are shown
   - Each order contains customer location information

2. **Seller Selects an Order**
   - Customer's delivery address is **automatically displayed**
   - Address field is **read-only** and **disabled**
   - Visual badge shows "Auto-fetched from Order"

3. **Seller Enters Rider Details**
   - Rider Name ✍️
   - Phone Number ✍️
   - Email ✍️
   - Vehicle Type ✍️
   - Vehicle Plate Number ✍️

4. **Seller (Optionally) Enters Delivery Details**
   - Delivery Notes (optional) ✍️
   - Estimated Delivery Time (optional) ✍️

5. **Seller Clicks "Assign Rider & Ship"**
   - Frontend sends: Rider info + Optional delivery notes/time
   - **Backend automatically fetches customer address** from order
   - Shipping record created with customer's registered address

6. **Order Status Updated**
   - Order status: `packing` → `shipped`
   - Tracking number assigned
   - Shipping history created

---

## 📊 Address Priority

The backend uses this priority when fetching the delivery address:

```
1. customer.user.userAddress (primary source)
   ↓ (if not available)
2. order.location (fallback)
   ↓ (if not available)
3. "Address not available" (error case)
```

Same for city and province:
```
customer.user.userCity / userProvince
```

---

## ✨ Benefits

### 1. **Accuracy** ✅
- No manual address entry errors
- Uses customer's registered delivery address
- Consistent with order information

### 2. **Efficiency** ⚡
- Faster workflow for sellers
- Fewer fields to fill
- Auto-population saves time

### 3. **Data Integrity** 🔒
- Address cannot be modified in shipping simulation
- Ensures delivery to correct location
- Matches customer's order details

### 4. **Better UX** 💡
- Clear visual indicators (badges, info boxes)
- Disabled fields prevent confusion
- Helper text explains the source

---

## 🖥️ User Interface

### **Before (Old System):**
```
Delivery Information
├── Delivery Address [Input - Manual entry]
├── City [Input - Manual entry]
└── Province [Input - Manual entry]
```

### **After (New System):**
```
Delivery Information [Badge: Auto-fetched from Order]
├── Delivery Address (From Customer Order) [Disabled/Read-only]
├── ℹ️ Info: "This address is automatically fetched from the customer's order details"
├── Delivery Notes [Optional Input]
└── Estimated Delivery [Optional Input]
```

---

## 🔄 API Request Changes

### **Before:**
```javascript
{
  order_id: 123,
  tracking_number: "CC20251009ABC123",
  rider_info: { ... },
  delivery_info: {
    delivery_address: "123 Main St...",  // Manual entry
    delivery_city: "Quezon City",        // Manual entry
    delivery_province: "Metro Manila",   // Manual entry
    delivery_notes: "...",
    estimated_delivery: "..."
  }
}
```

### **After:**
```javascript
{
  order_id: 123,
  tracking_number: "CC20251009ABC123",
  rider_info: { ... },
  delivery_info: {
    // Address auto-fetched on backend
    delivery_notes: "...",      // Optional
    estimated_delivery: "..."   // Optional
  }
}
```

---

## 🔍 Testing

### **Test Scenario 1: Normal Order**
1. Create an order with customer address
2. Go to Shipping Simulation
3. Select order
4. Verify: Customer's address appears automatically
5. Enter rider details
6. Assign rider
7. Verify: Shipping created with correct customer address

### **Test Scenario 2: Order with Different Address Formats**
1. Test with subdivision address: "Blk 5 Lot 12 Phase 2..."
2. Test with street address: "123 Rizal Street..."
3. Test with condo address: "Unit 4B Tower 1..."
4. Verify: All formats display correctly

### **Test Scenario 3: Error Handling**
1. Order with missing customer
2. Verify: Error message displayed
3. Order with missing address
4. Verify: Fallback to order.location

---

## 📝 Database Schema

### **Orders Table** (has customer info):
```sql
orders
├── orderID
├── customer_id → customers.customerID
└── location (complete address string)
```

### **Customers Table**:
```sql
customers
├── customerID  
└── user_id → users.userID
```

### **Users Table** (has detailed address):
```sql
users
├── userID
├── userAddress (street/block/lot)
├── userCity
└── userProvince
```

### **Shippings Table** (stores delivery info):
```sql
shippings
├── id
├── order_id
├── delivery_address (auto-fetched from customer)
├── delivery_city (auto-fetched from customer)
├── delivery_province (auto-fetched from customer)
├── delivery_notes (seller input)
└── estimated_delivery (seller input)
```

---

## 🎨 Visual Design

### **Address Field Styling:**
- **Background:** Light gray (`bg-gray-50`)
- **Cursor:** Not-allowed (indicates disabled)
- **Opacity:** 75% (subtle disabled appearance)
- **Border:** Standard border color

### **Badge Styling:**
- **Color:** Blue (`bg-blue-100 text-blue-800`)
- **Text:** "Auto-fetched from Order"

### **Info Box Styling:**
- **Background:** Light blue (`bg-blue-50`)
- **Border:** Blue (`border-blue-200`)
- **Icon:** ℹ️
- **Message:** Explains the address source

---

## 🚀 Deployment Notes

1. **No Database Migration Required** ✅
   - Uses existing columns
   - No schema changes needed

2. **Backend Changes:**
   - Updated `ShippingController.php`
   - Auto-fetches customer address
   - Updated validation rules

3. **Frontend Changes:**
   - Updated `ShippingSimulation.jsx`
   - Auto-populates address on order selection
   - Read-only address field
   - Updated API request payload

4. **Backward Compatibility:**
   - If old frontend sends address, backend ignores it
   - Backend always uses customer's address

---

## 📧 Error Messages

### **Customer Not Found:**
```json
{
  "success": false,
  "message": "Customer information not found for this order"
}
```

### **Address Not Available:**
```
Uses fallback: "Address not available"
Still creates shipping record
```

---

**Created:** October 9, 2025  
**System:** CraftConnect - Shipping Simulation  
**Status:** ✅ Implemented and Ready

