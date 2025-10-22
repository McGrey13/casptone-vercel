# ID Prefix Standards - CraftConnect

## Overview
This document outlines the standardized ID prefix formats used throughout the CraftConnect platform for all transactions and tracking purposes.

## 📋 ID Format Standards

### 1. **Payment Reference Numbers**

#### Format:
```
PAY-YYYYMMDD-METHOD-RANDOM
```

#### Examples:
- `PAY-20251009-GCAS-A1B2C3` - GCash payment on Oct 9, 2025
- `PAY-20251009-PAYM-B4C5D6` - PayMaya payment on Oct 9, 2025
- `PAY-20251009-COD-E7F8G9` - Cash on Delivery on Oct 9, 2025
- `PAY-20251010-ONLI-D3E4F5` - Generic online payment on Oct 10, 2025

#### Components:
- **PAY**: Payment prefix
- **YYYYMMDD**: Payment creation date
- **METHOD**: First 4 letters of payment method (uppercase)
  - GCAS = GCash
  - PAYM = PayMaya
  - COD = Cash on Delivery
  - ONLI = Generic online payment
- **RANDOM**: 6-character unique hash (uppercase alphanumeric)

#### Generation Logic:
```php
// Backend: PaymentController.php
private function generatePaymentReference($method = 'online')
{
    do {
        $methodCode = strtoupper(substr($method, 0, 4));
        $referenceNumber = 'PAY-' . date('Ymd') . '-' . $methodCode . '-' . strtoupper(substr(md5(uniqid()), 0, 6));
    } while (Payment::where('reference_number', $referenceNumber)->exists());

    return $referenceNumber;
}
```

#### Database Field:
- Table: `payments`
- Column: `reference_number` (VARCHAR, nullable)
- Unique: Yes (enforced in code)

---

### 2. **Order Numbers**

#### Format:
```
ORD-YYYYMMDD-RANDOM
```

#### Examples:
- `ORD-20251008-A1B2C3` - Order from October 8, 2025
- `ORD-20251015-X9Y8Z7` - Order from October 15, 2025
- `ORD-20251120-M4N5P6` - Order from November 20, 2025

#### Components:
- **ORD**: Order prefix
- **YYYYMMDD**: Order creation date
- **RANDOM**: 6-character unique hash (uppercase alphanumeric)

#### Generation Logic:
```php
// Backend: CartController.php
private function generateOrderNumber()
{
    do {
        $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 6));
    } while (Order::where('order_number', $orderNumber)->exists());

    return $orderNumber;
}
```

#### Database Field:
- Table: `orders`
- Column: `order_number` (VARCHAR, unique)
- Unique: Yes (database constraint)

---

### 3. **Tracking Numbers**

#### Format:
```
CCYYYYMMDDXXXXXX
```

#### Examples:
- `CC20251008FDCC7A` - Package from October 8, 2025
- `CC20251015A3B9E2` - Package from October 15, 2025
- `CC20251120F7D4C1` - Package from November 20, 2025

#### Components:
- **CC**: CraftConnect prefix
- **YYYYMMDD**: Shipping/tracking creation date
- **XXXXXX**: 6-character unique hash (uppercase alphanumeric)

#### Generation Logic:
```php
// Backend: CartController.php & PaymentController.php
private function generateTrackingNumber()
{
    do {
        $trackingNumber = 'CC' . date('Ymd') . strtoupper(substr(md5(uniqid()), 0, 6));
    } while (Order::where('tracking_number', $trackingNumber)->exists() || 
             \App\Models\Shipping::where('tracking_number', $trackingNumber)->exists());

    return $trackingNumber;
}
```

#### Database Fields:
- Table: `orders` → Column: `tracking_number` (VARCHAR, unique, nullable)
- Table: `shippings` → Column: `tracking_number` (VARCHAR, unique)
- Unique: Yes (database constraint on both tables)

---

### 4. **Product SKU**

#### Format:
```
CC-S{SELLER_ID}-{CATEGORY}-{RANDOM}
```

#### Examples:
- `CC-S01-HOME-A1B2C3` - Seller 1, Home Decor category
- `CC-S03-KITC-X9Y8Z7` - Seller 3, Kitchenware category
- `CC-S05-JEWE-M4N5P6` - Seller 5, Jewelry category

#### Components:
- **CC**: CraftConnect prefix
- **S{ID}**: Seller ID (2 digits, zero-padded)
- **{CATEGORY}**: First 4 letters of category (uppercase)
- **{RANDOM}**: 6-character unique hash (uppercase alphanumeric)

#### Generation Logic:
```php
// Backend: ComprehensiveDataSeeder.php
private function generateSKU($sellerID, $category)
{
    $categoryCode = strtoupper(substr(str_replace(' ', '', $category), 0, 4));
    $sellerCode = str_pad($sellerID, 2, '0', STR_PAD_LEFT);
    
    do {
        $randomCode = strtoupper(substr(md5(uniqid()), 0, 6));
        $sku = "CC-S{$sellerCode}-{$categoryCode}-{$randomCode}";
    } while (Product::where('sku', $sku)->exists());
    
    return $sku;
}
```

#### Database Field:
- Table: `products`
- Column: `sku` (VARCHAR, unique, nullable)
- Unique: Yes (database constraint)

---

## 🔄 Implementation Summary

### Backend Files Modified:
1. **`backend/app/Http/Controllers/PaymentController.php`**
   - Added `generatePaymentReference()` method
   - Updated `handleOnlinePayment()` to generate PAY- references
   - Updated `handleCODPaymentForOrder()` to generate PAY- references

2. **`backend/app/Http/Controllers/CartController.php`**
   - Contains `generateOrderNumber()` method (ORD- format)
   - Contains `generateTrackingNumber()` method (CC format)

3. **`backend/database/migrations/2025_10_06_173208_add_payment_type_fields_to_payments_table.php`**
   - Added `reference_number` column to payments table

### Frontend Files Modified:
1. **`frontend/src/Components/Seller/PaymentTracking.jsx`**
   - Updated to display `reference_number` instead of `payment_id`
   - Updated search to use `reference_number`
   - Updated CSV export to include `reference_number`
   - Updated table headers and cells
   - Updated view modal to prominently display payment reference

---

## 🎯 Usage Examples

### Creating a Payment (Backend):
```php
// For GCash payment
$referenceNumber = $this->generatePaymentReference('gcash');
// Result: PAY-20251009-GCAS-A1B2C3

// For PayMaya payment
$referenceNumber = $this->generatePaymentReference('paymaya');
// Result: PAY-20251009-PAYM-B4C5D6

// For COD payment
$referenceNumber = $this->generatePaymentReference('cod');
// Result: PAY-20251009-COD-E7F8G9
```

### Creating an Order (Backend):
```php
$orderNumber = $this->generateOrderNumber();
// Result: ORD-20251009-X1Y2Z3

$trackingNumber = $this->generateTrackingNumber();
// Result: CC20251009A3B9E2
```

### Displaying in Frontend:
```javascript
// Payment reference display
<TableCell className="font-medium">{payment.reference_number}</TableCell>
// Shows: PAY-20251009-GCAS-A1B2C3

// Order ID display
<TableCell>{payment.order_id}</TableCell>
// Shows: ORD-20251009-X1Y2Z3
```

---

## 📊 Database Schema

### Payments Table:
```sql
CREATE TABLE payments (
    payment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reference_number VARCHAR(255) NULLABLE,
    userID BIGINT,
    orderID BIGINT,
    amount DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'PHP',
    paymentMethod VARCHAR(255),
    paymentStatus ENUM('pending', 'processing', 'paid', 'failed', 'cancelled'),
    payment_type ENUM('online', 'cod'),
    ...
);
```

### Orders Table:
```sql
CREATE TABLE orders (
    orderID BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(255) UNIQUE,
    tracking_number VARCHAR(255) UNIQUE NULLABLE,
    customer_id BIGINT,
    sellerID BIGINT,
    totalAmount DECIMAL(10, 2),
    status VARCHAR(50),
    ...
);
```

### Products Table:
```sql
CREATE TABLE products (
    product_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sku VARCHAR(255) UNIQUE NULLABLE,
    productName VARCHAR(255),
    sellerID BIGINT,
    category VARCHAR(255),
    ...
);
```

---

## ✅ Benefits

1. **Consistency**: All IDs follow a predictable pattern
2. **Traceability**: Date information embedded in IDs
3. **Uniqueness**: Hash-based random codes prevent collisions
4. **Professional**: Clear prefixes make IDs easily identifiable
5. **Debugging**: Date-based format helps in troubleshooting
6. **User-Friendly**: Easy to communicate and remember
7. **Scalability**: Format supports high volume of transactions

---

## 🔍 Verification

To verify ID formats are working correctly:

1. **Create a new order** as a customer
   - Check: Order number starts with `ORD-`
   - Check: Tracking number starts with `CC`

2. **Make a payment** using GCash/PayMaya
   - Check: Payment reference starts with `PAY-`
   - Check: Method code matches payment type (GCAS/PAYM)

3. **View in Payment Tracking** (seller side)
   - Check: Payment reference displays correctly
   - Check: Search by reference number works
   - Check: CSV export includes correct reference

4. **Check Database**
   ```sql
   SELECT reference_number, paymentMethod FROM payments ORDER BY created_at DESC LIMIT 5;
   SELECT order_number, tracking_number FROM orders ORDER BY created_at DESC LIMIT 5;
   SELECT sku FROM products ORDER BY created_at DESC LIMIT 5;
   ```

---

## 📝 Notes

- All ID generation methods check for uniqueness before returning
- Dates are in YYYYMMDD format for proper sorting
- Random hashes use MD5 of uniqid() for better randomness
- All random codes are uppercase for consistency
- Payment reference is nullable for backwards compatibility with existing data
- SKU is nullable as it was added after initial product creation

