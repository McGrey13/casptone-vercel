# Analytics Data Seeder - Complete Guide

## Overview
The Analytics Data Seeder generates comprehensive analytics data for **ALL** graphs in the Admin Analytics Dashboard. This ensures complete visualization coverage across all tabs and time periods.

## 🎯 Minimum Requirements
**Recommended: 3 years of data** to ensure all dashboard graphs display properly, especially:
- Yearly trend comparisons
- Quarterly analysis  
- Seasonal patterns
- Year-over-year growth metrics

## 🚀 How to Run

### Basic Usage
```bash
php artisan db:seed --class=AnalyticsDataSeeder
```

### Interactive Menu
When you run the seeder, you'll be prompted to select a time period:

```
📅 Available Time Periods:
   • 1 day     - Quick test data
   • 1 week    - Weekly analysis
   • 1 month   - Monthly trends
   • 3 months  - Quarterly overview
   • 1 year    - Annual analytics
   • 3 years   - ⭐ RECOMMENDED (ensures all dashboard graphs have data)
   • 5 years   - Historical analysis
   • Custom    - Specify exact dates
```

## 📊 What Gets Generated

### Main Analytics (All Tabs)
| Data Type | Dashboard Location | What It Populates |
|-----------|-------------------|-------------------|
| Revenue Analytics | Revenue Tab | Revenue trends, commission breakdown, payment fees |
| Order Analytics | Orders Tab | Order volume, status distribution, completion rates |
| Review Analytics | Reviews Tab | Rating trends, score distribution, review metrics |
| Product Analytics | Products Tab | Product status, inventory levels, image quality |
| Seller Revenue Analytics | Sellers Tab | Top sellers, seller performance, revenue distribution |
| Content Moderation Analytics | Moderation Tab | Approval rates, flagged content, moderation trends |

### Micro Analytics (Revenue Tab)
| Data Type | Dashboard Graph | Description |
|-----------|----------------|-------------|
| Detailed Review Analytics | Rating Breakdown | User-level review data with names and details |
| Seller Comparison Analytics | Product Comparison | Competitive analysis between sellers |
| Category Performance Analytics | Category Analysis | Performance across product categories |
| Most Selling Products | Product Trends | Top products by sales volume and revenue |
| Highest Sales Sellers | Seller Growth | Top sellers with growth rates |

## 📈 Time Periods Generated

For every dataset, the seeder generates:

### 1. **Daily Data**
- Individual day-by-day analytics
- Includes seasonal variations, weekend effects, holiday patterns
- Example: 1,095 days for 3 years

### 2. **Monthly Data**  
- Aggregated monthly summaries
- Calculated from daily data
- Example: 36 months for 3 years

### 3. **Quarterly Data**
- Aggregated quarterly summaries (Q1, Q2, Q3, Q4)
- Calculated from monthly data
- Example: 12 quarters for 3 years

### 4. **Yearly Data**
- Aggregated annual summaries
- Calculated from quarterly/monthly data
- Example: 3 years for 3-year dataset

## 🎨 Data Features

### Seasonal Variations
The seeder applies realistic seasonal patterns:
- **November**: +30% (Black Friday prep)
- **December**: +80% (Holiday season peak)
- **January**: -40% (Post-holiday slump)
- **February**: +20% (Valentine's Day)
- **May**: +30% (Mother's Day)

### Weekend Effects
- **Weekends**: -30% (lower sales on Sat/Sun)
- **Weekdays**: Normal traffic

### Holiday Multipliers
Special events with significant impact:
- **Black Friday**: +150%
- **Cyber Monday**: +100%
- **Valentine's Day**: +50%
- **Mother's/Father's Day**: +40%
- **Christmas Day**: -70% (stores closed)

## ⏱️ Generation Time Estimates

| Time Period | Days | Est. Time | Use Case |
|-------------|------|-----------|----------|
| 1 day | 1 | ~1 second | Quick test |
| 1 week | 7 | ~10 seconds | Weekly demo |
| 1 month | 30 | ~30 seconds | Monthly test |
| 3 months | 90 | ~2 minutes | Quarterly test |
| 1 year | 365 | ~6 minutes | Annual analysis |
| **3 years** | **1,095** | **~18 minutes** | **Recommended** |
| 5 years | 1,825 | ~30 minutes | Historical analysis |

## 📋 Dashboard Graph Coverage

### ✅ Revenue Tab
- [x] Revenue Trend Chart (daily/monthly/quarterly/yearly)
- [x] Revenue Breakdown (total, commission, fees, net)
- [x] Most Selling Products Trend (micro analytics)
- [x] Highest Sales Sellers Trend (micro analytics)
- [x] Category Performance Analysis (micro analytics)
- [x] Seller Growth Analysis (micro analytics)
- [x] Detailed Rating Breakdown (micro analytics)

### ✅ Orders Tab
- [x] Order Trends Chart (volume over time)
- [x] Order Status Distribution Pie Chart
- [x] Order Performance Metrics (completion rate, avg value)
- [x] Order status breakdown (pending, processing, shipped, completed)

### ✅ Reviews Tab
- [x] Rating Trends Chart (average rating over time)
- [x] Review Score Distribution Pie Chart (1-5 stars)
- [x] Review Performance Metrics (total reviews, response rate)
- [x] Star rating breakdown (5-star to 1-star counts)

### ✅ Products Tab
- [x] Product Status Distribution (active, inactive, out of stock, low stock)
- [x] Image Quality Metrics (coverage percentages)
- [x] Featured Products Count
- [x] Product Trends Over Time
- [x] Most Selling Products Chart (with revenue and quantity data)

### ✅ Sellers Tab
- [x] Top Performing Sellers List (with revenue ranking)
- [x] Seller Performance Metrics (total, active, avg revenue)
- [x] Highest Sales Sellers Chart (with growth rates)
- [x] Seller revenue distribution

### ✅ Moderation Tab
- [x] Product Moderation Statistics (pending, approved, rejected)
- [x] Review Moderation Statistics (flagged, approved, removed)
- [x] Moderation Trends Chart (approval rates over time)
- [x] User Moderation (suspended, reactivated)
- [x] Approval/Rejection rates

## 🔄 Complete Data Flow

```
1. Daily Generation
   ↓
   - Creates 7 types of analytics per day
   - Applies seasonal/weekend/holiday multipliers
   - Generates micro analytics (reviews, seller comparison, category performance)
   
2. Monthly Aggregation
   ↓
   - Summarizes daily data into monthly records
   - Aggregates micro analytics to monthly level
   
3. Quarterly Aggregation
   ↓
   - Summarizes monthly data into quarterly records (Q1-Q4)
   - Aggregates micro analytics to quarterly level
   
4. Yearly Aggregation (if 1+ years)
   ↓
   - Summarizes quarterly data into yearly records
   - Aggregates micro analytics to yearly level
```

## 💾 Database Tables Populated

### Main Analytics Tables
- `revenue_analytics`
- `order_analytics`
- `review_analytics`
- `product_analytics`
- `seller_revenue_analytics`
- `content_moderation_analytics`

### Micro Analytics Tables
- `detailed_review_analytics`
- `seller_comparison_analytics`
- `category_performance_analytics`

Each table contains records for: **daily**, **monthly**, **quarterly**, and **yearly** periods.

## 🎯 Usage Examples

### Generate 3 Years (Recommended)
```bash
php artisan db:seed --class=AnalyticsDataSeeder
# Select option: "3 years (Recommended)"
```

### Generate 5 Years for Historical Analysis
```bash
php artisan db:seed --class=AnalyticsDataSeeder
# Select option: "5 years"
# Confirm when prompted
```

### Generate Custom Date Range
```bash
php artisan db:seed --class=AnalyticsDataSeeder
# Select option: "Custom (enter dates)"
# Enter start date: 2020-01-01
# Enter end date: 2024-12-31
```

### Quick Test (1 Week)
```bash
php artisan db:seed --class=AnalyticsDataSeeder
# Select option: "1 week"
```

## ✅ Verification

After running the seeder, verify data was created:

```sql
-- Check daily records
SELECT COUNT(*) FROM revenue_analytics WHERE period_type = 'daily';
SELECT COUNT(*) FROM detailed_review_analytics WHERE period_type = 'daily';

-- Check monthly records  
SELECT COUNT(*) FROM revenue_analytics WHERE period_type = 'monthly';
SELECT COUNT(*) FROM seller_comparison_analytics WHERE period_type = 'monthly';

-- Check quarterly records
SELECT COUNT(*) FROM revenue_analytics WHERE period_type = 'quarterly';
SELECT COUNT(*) FROM category_performance_analytics WHERE period_type = 'quarterly';

-- Check yearly records
SELECT COUNT(*) FROM revenue_analytics WHERE period_type = 'yearly';
```

## 🎨 Output Example

```
╔════════════════════════════════════════════════╗
║    Analytics Data Seeder - Enhanced Version   ║
╚════════════════════════════════════════════════╝

Found 10 sellers
Adding products for sellers...
Creating sample customers...
Sample orders and reviews created

📅 Available Time Periods:
[Selection menu appears]

Selected period: 3 years (Recommended)
Generating data from 2021-12-08 to 2024-12-07
Total days to generate: 1095

Progress: 100/1095 days (9.1%)
Progress: 200/1095 days (18.3%)
...
Progress: 1095/1095 days (100.0%)

Generated 1095 days of daily analytics data
Generating monthly analytics data...
Generated 36 months of monthly analytics data (including micro analytics)
Generating quarterly analytics data...
Generated 12 quarters of quarterly analytics data (including micro analytics)
Generating yearly analytics data...
Generated 3 years of yearly analytics data (including micro analytics)

╔════════════════════════════════════════════════╗
║          Generation Complete! ✓                ║
╚════════════════════════════════════════════════╝

📊 Analytics Summary:
   • Period: 3 years (Recommended)
   • Date Range: 2021-12-08 to 2024-12-07
   • Daily Records: 1095 days
   • Monthly Records: 36 months
   • Quarterly Records: 12 quarters
   • Yearly Records: 3 years

📈 Data Types Generated (All Dashboard Graphs):
   ✓ Revenue Analytics (Revenue Tab)
   ✓ Order Analytics (Orders Tab)
   ✓ Review Analytics (Reviews Tab)
   ✓ Product Analytics (Products Tab)
   ✓ Seller Revenue Analytics (Sellers Tab)
   ✓ Content Moderation Analytics (Moderation Tab)
   ✓ Micro Analytics - Most Selling Products (Revenue Tab)
   ✓ Micro Analytics - Highest Sales Sellers (Revenue & Sellers Tab)
   ✓ Micro Analytics - Detailed Reviews (Revenue Tab)
   ✓ Micro Analytics - Seller Comparison (Revenue Tab)
   ✓ Micro Analytics - Category Performance (Revenue Tab)

✅ All analytics data successfully seeded to database!
🎯 All dashboard graphs should now display data correctly!
```

## 📏 Database Constraints

The seeder automatically enforces these database constraints:

| Field Type | Database Constraint | Valid Range | Example |
|------------|-------------------|-------------|---------|
| `growth_rate` | `decimal(5,2)` | -99.99 to 999.99 | -50.00, 125.50, 500.00 |
| `market_share_percentage` | `decimal(5,2)` | 0.00 to 100.00 | 25.50, 75.00 |
| `average_rating` | `decimal(3,2)` | 0.00 to 5.00 | 3.50, 4.75, 5.00 |
| `average_price` | `decimal(10,2)` | 0.00 to 99,999,999.99 | 89.99, 1250.00 |
| `total_revenue` | `decimal(15,2)` | 0.00 to 999,999,999,999,999.99 | 15000.00 |
| `completion_rate` | `decimal(5,2)` | 0.00 to 100.00 | 85.50 |
| `rating` (reviews) | `integer` | 1 to 5 | 4, 5 |
| `helpful_votes` | `integer` | 0+ | 0, 5, 15 |

All values are automatically capped to fit within these constraints, preventing database errors.

## ⚠️ Important Notes

1. **Run Order**: Make sure sellers exist before running this seeder
2. **Database**: Seeder will create data in your current database
3. **Large Datasets**: 5 years = ~30 minutes of generation time
4. **Memory**: Large datasets may require increased PHP memory limit
5. **Confirmation**: You'll be asked to confirm before generating 1+ year datasets
6. **Data Validation**: All values are automatically validated and capped to fit database constraints

## 🔧 Troubleshooting

**No data showing in graphs?**
- Verify seeder completed successfully
- Check date range matches dashboard date range
- Ensure period type matches (daily/monthly/quarterly/yearly)

**Generation too slow?**
- Start with smaller datasets (1 month) for testing
- Use 3 years for production
- Only use 5 years if you need historical analysis

**Missing micro analytics data?**
- Check that `detailed_review_analytics`, `seller_comparison_analytics`, and `category_performance_analytics` tables exist
- Run migrations if tables are missing
- Verify sellers and products exist before seeding

## 📞 Support

For issues or questions about the analytics seeder, check:
- Database migrations in `database/migrations/2024_01_15_000001_create_analytics_tables.php`
- Analytics models in `app/Models/Analytics/`
- Analytics controller in `app/Http/Controllers/AnalyticsController.php`

