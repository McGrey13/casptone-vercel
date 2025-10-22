# CraftConnect Analytics System

## Overview
This analytics system provides comprehensive insights into the CraftConnect artisan marketplace platform, including revenue tracking, order management, review analytics, product metrics, and content moderation statistics.

## Features Implemented

### 1. Revenue Analytics
- **Total platform revenue** (monthly/quarterly/yearly)
- **Revenue per artisan/seller**
- **Platform commission tracking**
- **Payment processing fees**
- **Revenue growth rates and trends**

### 2. Order Management Analytics
- **Total orders processed**
- **Order completion rates**
- **Average order value (AOV)**
- **Order status distribution**
- **Refund/cancellation rates**

### 3. Review Analytics
- **Product review scores distribution**
- **Average rating trends**
- **Review response rates**
- **Rating breakdown by stars**

### 4. Product Analytics
- **Product image quality metrics**
- **Product status distribution**
- **Featured products tracking**
- **Stock level monitoring**

### 5. Content Moderation Analytics
- **Content moderation statistics**
- **Product approval rates**
- **Review moderation metrics**
- **User account moderation**

## Database Structure

### Analytics Tables Created
1. `revenue_analytics` - Platform revenue tracking
2. `seller_revenue_analytics` - Individual seller revenue
3. `order_analytics` - Order processing metrics
4. `review_analytics` - Review and rating data
5. `product_analytics` - Product performance metrics
6. `content_moderation_analytics` - Moderation statistics

## API Endpoints

### Admin Analytics
- `GET /api/analytics/admin` - Get comprehensive analytics dashboard data
- `POST /api/analytics/generate` - Generate analytics data for specific date/period

### Parameters
- `period`: daily, monthly, yearly
- `start_date`: Start date for data range
- `end_date`: End date for data range

## Usage

### 1. Generate Analytics Data
```bash
# Generate data for the last 7 days
php artisan analytics:generate --days=7

# Generate data for the last 30 days
php artisan analytics:generate --days=30
```

### 2. Access Analytics Dashboard
1. Login as admin
2. Navigate to Analytics tab in admin panel
3. View comprehensive analytics dashboard with charts and metrics

### 3. API Usage
```javascript
// Fetch analytics data
const response = await fetch('/api/analytics/admin?period=monthly&start_date=2024-01-01&end_date=2024-01-31', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
const data = await response.json();
```

## Frontend Components

### AnalyticsDashboard.jsx
- Comprehensive analytics dashboard with multiple tabs
- Interactive charts using Recharts library
- Real-time data refresh capabilities
- Export and filtering options

### Key Features
- **Revenue Tab**: Revenue trends, breakdown, and growth metrics
- **Orders Tab**: Order trends, status distribution, and completion rates
- **Reviews Tab**: Rating trends, score distribution, and review metrics
- **Products Tab**: Product status, image quality, and performance metrics
- **Sellers Tab**: Top performing sellers and seller statistics
- **Moderation Tab**: Content moderation and approval statistics

## Data Generation

The system automatically generates analytics data based on:
- Order records (revenue, completion rates)
- Product data (status, images, ratings)
- Review data (ratings, comments)
- User activity (sellers, customers)

## Charts and Visualizations

- **Line Charts**: Revenue trends, order trends, rating trends
- **Pie Charts**: Order status distribution, review score distribution
- **Area Charts**: Revenue over time
- **Progress Bars**: Image quality metrics, completion rates
- **Bar Charts**: Top sellers, category performance

## Future Enhancements

1. **Real-time Analytics**: Live data updates
2. **Custom Date Ranges**: Flexible date selection
3. **Export Functionality**: PDF/Excel export
4. **Email Reports**: Automated analytics reports
5. **Advanced Filtering**: Category, seller, product filters
6. **Predictive Analytics**: Sales forecasting
7. **A/B Testing**: Feature performance tracking

## Technical Notes

- Uses Laravel Eloquent models for data access
- Implements proper indexing for performance
- Handles large datasets efficiently
- Provides RESTful API endpoints
- Responsive React components
- Chart.js/Recharts integration for visualizations

## Security

- Admin-only access to analytics endpoints
- Proper authentication and authorization
- Data validation and sanitization
- Rate limiting on API endpoints

## Performance

- Optimized database queries
- Efficient data aggregation
- Caching for frequently accessed data
- Pagination for large datasets
