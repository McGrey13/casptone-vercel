# Simplified Revenue Sharing System

## Overview

The revenue sharing system has been simplified to work as follows:
- **Customers pay sellers directly** through PayMongo
- **Platform takes 2% commission** automatically
- **No payout system needed** - sellers receive money directly
- **Simple balance tracking** for transparency

## How It Works

### Payment Flow
```
Customer → PayMongo Payment → 2% Commission to Platform → 98% to Seller
```

### Example
- Customer pays ₱1,000.00 for a product
- Platform automatically takes ₱20.00 (2% commission)
- Seller receives ₱980.00 directly to their account

## Database Schema

### Tables Used
1. **`transactions`** - Records all payments and commission splits
2. **`seller_balances`** - Tracks seller earnings (for transparency)

### Removed
- ~~`payouts`~~ - No longer needed since sellers get money directly

## API Endpoints

### Payment Processing
- `POST /api/payments/create-intent` - Create payment intent
- `POST /webhooks/paymongo` - Handle payment completion

### Seller Dashboard
- `GET /api/seller/{sellerId}/transactions` - Transaction history
- `GET /api/seller/{sellerId}/balance` - Current earnings
- `GET /api/seller/{sellerId}/dashboard` - Dashboard summary

### Admin Reporting
- `GET /api/admin/reports/revenue` - Revenue and commission reports
- `GET /api/admin/reports/products` - Product-level analytics
- `GET /api/admin/reports/sellers` - Seller performance
- `GET /api/admin/reports/financial-dashboard` - Financial overview
- `GET /api/admin/reports/export` - CSV data export

## Key Features

### For Sellers
- **Direct payments** - Money goes directly to seller's account
- **Transparent tracking** - See all transactions and earnings
- **Real-time balance** - View current earnings
- **No payout requests** - Money is automatically available

### For Platform
- **Automatic commission** - 2% taken on every transaction
- **Complete audit trail** - All transactions recorded
- **Revenue reporting** - Track platform earnings
- **Seller analytics** - Monitor seller performance

## Configuration

### Environment Variables
```env
# PayMongo Configuration
PAYMONGO_SECRET_KEY=your_secret_key
PAYMONGO_PUBLIC_KEY=your_public_key
PAYMONGO_WEBHOOK_SECRET=your_webhook_secret
PAYMONGO_BASE_URL=https://api.paymongo.com/v1

# Commission Rate (2% = 0.02)
COMMISSION_RATE=0.02
```

### Scheduled Jobs
```bash
# Daily reconciliation
0 2 * * * cd /path/to/backend && php artisan revenue:reconcile

# Daily settlement processing
0 3 * * * cd /path/to/backend && php artisan revenue:settle
```

## Usage Examples

### 1. Create Payment Intent
```javascript
const response = await fetch('/api/payments/create-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    order_id: 123,
    payment_methods: ['gcash', 'paymaya', 'card']
  })
});

const { checkout_url } = await response.json();
// Redirect customer to PayMongo checkout
window.location.href = checkout_url;
```

### 2. Get Seller Balance
```javascript
const response = await fetch('/api/seller/456/balance');
const { available_balance, total_balance } = await response.json();

console.log(`Available: ₱${available_balance}`);
console.log(`Total: ₱${total_balance}`);
```

### 3. Get Revenue Report
```javascript
const response = await fetch('/api/admin/reports/revenue?from_date=2024-01-01&to_date=2024-01-31');
const { total_gross_revenue, total_admin_fees, total_seller_payments } = await response.json();

console.log(`Platform Revenue: ₱${total_admin_fees}`);
console.log(`Seller Payments: ₱${total_seller_payments}`);
```

## Benefits of Simplified System

### For Sellers
- ✅ **Immediate payment** - Money goes directly to their account
- ✅ **No payout delays** - No waiting for payout processing
- ✅ **Lower fees** - No additional payout processing fees
- ✅ **Simple tracking** - Easy to see earnings and transactions

### For Platform
- ✅ **Automatic commission** - No manual payout processing needed
- ✅ **Reduced complexity** - Simpler system to maintain
- ✅ **Better cash flow** - Commission collected immediately
- ✅ **Lower operational costs** - No payout processing overhead

## Testing

Run the test script to verify everything is working:
```bash
php test-revenue-system.php
```

## Migration Notes

### What Changed
- Removed payout system and related tables
- Simplified seller balance tracking
- Updated API endpoints to remove payout functionality
- Streamlined payment processing

### What Stayed the Same
- 2% commission rate
- PayMongo integration
- Transaction recording
- Admin reporting
- Reconciliation system

## Support

For questions or issues:
1. Check logs: `storage/logs/laravel.log`
2. Run test script: `php test-revenue-system.php`
3. Review this documentation
4. Check console commands: `php artisan list`

The simplified system is now ready for production use! 🚀







