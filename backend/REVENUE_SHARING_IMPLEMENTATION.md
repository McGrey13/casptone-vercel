# Revenue Sharing & Reporting System Implementation

## Overview

This document outlines the complete implementation of the revenue sharing and reporting system for CraftConnect. The system handles payment processing, commission calculation, seller payouts, and comprehensive reporting.

## System Architecture

### Core Components

1. **Payment Processing**: PayMongo integration for payment intents and webhooks
2. **Commission Calculation**: 2% commission rate (configurable)
3. **Transaction Management**: Complete audit trail of all payments
4. **Seller Balances**: Available and pending balance tracking
5. **Payout System**: Automated and manual payout processing
6. **Reporting**: Comprehensive admin and seller dashboards

### Database Schema

#### New Tables Created

1. **`transactions`** - Stores payment outcomes and commission splits
2. **`seller_balances`** - Tracks seller available and pending balances
3. **`payouts`** - Records of payouts to sellers

#### Key Relationships

- `transactions.order_id` → `orders.orderID`
- `transactions.seller_id` → `sellers.sellerID`
- `seller_balances.seller_id` → `sellers.sellerID`
- `payouts.seller_id` → `sellers.sellerID`

## Implementation Details

### 1. Payment Flow

```
Customer Checkout → Create Payment Intent → PayMongo Processing → Webhook → Transaction Creation → Balance Update
```

#### Payment Intent Creation
- **Endpoint**: `POST /api/payments/create-intent`
- **Purpose**: Creates PayMongo payment intent for order
- **Process**: Calculates total amount, creates intent, stores payment record

#### Webhook Processing
- **Endpoint**: `POST /webhooks/paymongo`
- **Purpose**: Handles PayMongo payment events
- **Process**: Verifies signature, processes payment, creates transaction, updates balances

### 2. Commission Calculation

#### Commission Service
- **File**: `app/Services/CommissionService.php`
- **Rate**: 2% (configurable via `COMMISSION_RATE` env variable)
- **Storage**: All amounts stored in centavos (integers)

#### Commission Split Example
```
Gross Amount: ₱1,000.00 (100,000 centavos)
Admin Fee (2%): ₱20.00 (2,000 centavos)
Seller Amount: ₱980.00 (98,000 centavos)
```

### 3. Seller Dashboard

#### Available Endpoints

1. **Get Transactions**: `GET /api/seller/{sellerId}/transactions`
2. **Get Balance**: `GET /api/seller/{sellerId}/balance`
3. **Request Payout**: `POST /api/seller/{sellerId}/request-payout`
4. **Get Payouts**: `GET /api/seller/{sellerId}/payouts`
5. **Dashboard Summary**: `GET /api/seller/{sellerId}/dashboard`

#### Features
- Transaction history with filtering
- Real-time balance tracking
- Payout request system
- Performance metrics

### 4. Admin Reporting

#### Available Endpoints

1. **Revenue Report**: `GET /api/admin/reports/revenue`
2. **Product Breakdown**: `GET /api/admin/reports/products`
3. **Seller Report**: `GET /api/admin/reports/sellers`
4. **Payout Summary**: `GET /api/admin/reports/payouts`
5. **Financial Dashboard**: `GET /api/admin/reports/financial-dashboard`
6. **Data Export**: `GET /api/admin/reports/export`

#### Features
- Comprehensive financial reporting
- Product-level analytics
- Seller performance metrics
- CSV data export
- Real-time dashboard

### 5. Automated Jobs

#### Reconciliation Job
- **Command**: `php artisan revenue:reconcile`
- **Purpose**: Verifies PayMongo vs local records
- **Frequency**: Daily (recommended)
- **Features**: Missing transaction detection, amount verification, alert system

#### Settlement Processor Job
- **Command**: `php artisan revenue:settle`
- **Purpose**: Processes settlement periods and payouts
- **Frequency**: Daily (recommended)
- **Features**: Balance transfers, payout processing, cleanup

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

### Scheduled Tasks

Add to your cron schedule:

```bash
# Daily reconciliation
0 2 * * * cd /path/to/backend && php artisan revenue:reconcile

# Daily settlement processing
0 3 * * * cd /path/to/backend && php artisan revenue:settle
```

## API Usage Examples

### 1. Create Payment Intent

```javascript
const response = await fetch('/api/payments/create-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    order_id: 123,
    payment_methods: ['gcash', 'paymaya', 'card']
  })
});

const data = await response.json();
// Returns: payment_intent_id, client_key, checkout_url
```

### 2. Get Seller Balance

```javascript
const response = await fetch('/api/seller/456/balance');
const data = await response.json();

// Returns:
// {
//   "success": true,
//   "data": {
//     "seller_id": 456,
//     "available_balance": 1500.00,
//     "pending_balance": 200.00,
//     "total_balance": 1700.00
//   }
// }
```

### 3. Request Payout

```javascript
const response = await fetch('/api/seller/456/request-payout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    amount: 1000.00,
    notes: 'Monthly payout request'
  })
});
```

### 4. Get Revenue Report

```javascript
const response = await fetch('/api/admin/reports/revenue?from_date=2024-01-01&to_date=2024-01-31');
const data = await response.json();

// Returns comprehensive revenue breakdown
```

## Security Considerations

### Webhook Security
- PayMongo signature verification
- HTTPS-only webhook endpoints
- Request validation and sanitization

### Data Protection
- All amounts stored as integers (centavos)
- Audit trail for all transactions
- Secure payout processing

### Access Control
- Authentication required for all endpoints
- Role-based access for admin functions
- Seller-specific data isolation

## Monitoring & Alerts

### Logging
- Comprehensive transaction logging
- Error tracking and alerting
- Performance monitoring

### Alerts
- Reconciliation discrepancies
- Failed payout processing
- System errors and exceptions

## Testing

### Manual Testing
1. Create test order
2. Process payment through PayMongo sandbox
3. Verify webhook processing
4. Check transaction creation
5. Validate balance updates

### Automated Testing
- Unit tests for commission calculation
- Integration tests for payment flow
- Webhook signature verification tests

## Deployment Checklist

### Pre-deployment
- [ ] Configure PayMongo credentials
- [ ] Set up webhook endpoints
- [ ] Configure commission rate
- [ ] Test payment flow in sandbox

### Post-deployment
- [ ] Run migrations
- [ ] Set up scheduled jobs
- [ ] Configure monitoring
- [ ] Test webhook endpoints
- [ ] Verify reporting functionality

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check PayMongo webhook configuration
   - Verify endpoint URL and HTTPS
   - Check signature verification

2. **Commission calculation errors**
   - Verify `COMMISSION_RATE` configuration
   - Check amount storage (centavos vs pesos)
   - Validate transaction creation

3. **Payout processing failures**
   - Check seller balance sufficiency
   - Verify payout scheduling
   - Review error logs

### Debug Commands

```bash
# Test reconciliation
php artisan revenue:reconcile

# Test settlement processing
php artisan revenue:settle

# Check transaction records
php artisan tinker
>>> App\Models\Transaction::count()

# Check seller balances
>>> App\Models\SellerBalance::all()
```

## Performance Considerations

### Database Optimization
- Indexed foreign keys
- Optimized queries for reporting
- Efficient pagination

### Caching
- Balance calculations cached
- Report data cached for performance
- Redis integration for high-traffic scenarios

## Future Enhancements

### Planned Features
1. **Multi-currency support**
2. **Advanced analytics**
3. **Automated tax calculations**
4. **Integration with accounting systems**
5. **Mobile app support**

### Scalability
- Queue-based processing
- Microservices architecture
- Load balancing for high traffic

## Support & Maintenance

### Regular Tasks
- Monitor reconciliation reports
- Review payout processing
- Update commission rates as needed
- Backup transaction data

### Maintenance Windows
- Schedule during low-traffic periods
- Coordinate with payment processing
- Test in staging environment first

---

## Conclusion

The revenue sharing system provides a complete solution for payment processing, commission management, and financial reporting. The implementation follows best practices for security, scalability, and maintainability.

For questions or issues, refer to the logs and monitoring systems, or contact the development team.

