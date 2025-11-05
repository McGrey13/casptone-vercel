# AI-Powered Recommendation System Implementation

## Overview
This document describes the implementation of an AI-powered recommendation system that provides intelligent product suggestions based on users' browsing and purchasing behaviors.

## Features

### 1. **Browsing History Tracking**
- Tracks when users view products
- Records time spent viewing each product
- Works for both authenticated users and guest users (via session tracking)
- Stores IP address and user agent for analytics

### 2. **Intelligent Recommendation Algorithms**

The system uses a hybrid approach combining three recommendation strategies:

#### **Content-Based Filtering** (Weight: 0.4)
- Analyzes products similar to those the user has viewed/purchased
- Matches products based on:
  - Category similarity
  - Tag/feature similarity
  - Product characteristics

#### **Collaborative Filtering** (Weight: 0.5)
- Finds users with similar browsing/purchase patterns
- Recommends products liked by similar users
- Identifies users who viewed/purchased similar products
- Requires at least 2 common products to establish similarity

#### **Category-Based Recommendations** (Weight: 0.3)
- Analyzes user's favorite categories from browsing and purchases
- Recommends top-rated products in preferred categories
- Excludes already viewed/purchased products

#### **Quality Scoring** (Additional 0.3 max)
- Considers product ratings (0.2 weight)
- Considers review count (0.1 weight)
- Ensures recommended products have good quality

### 3. **User Experience**

#### For Authenticated Users:
- Personalized recommendations based on:
  - Complete browsing history
  - Purchase history
  - Category preferences
  - Rating patterns

#### For Guest Users:
- Session-based recommendations
- Tracks browsing during current session
- Provides content-based suggestions

#### Fallback:
- If no user data available, shows popular products
- Sorted by ratings and review count

## Implementation Details

### Backend Components

#### 1. Database Schema
**Table: `browsing_history`**
- `id` - Primary key
- `user_id` - Foreign key to users (nullable for guests)
- `product_id` - Foreign key to products
- `session_id` - Session identifier for guest users
- `view_duration` - Time spent viewing (seconds)
- `viewed_at` - Timestamp of view
- `ip_address` - User's IP address
- `user_agent` - Browser user agent
- Indexes for performance optimization

#### 2. Models
- **BrowsingHistory** - Eloquent model with relationships to User and Product

#### 3. Services
- **RecommendationService** - Core recommendation logic
  - `getRecommendations()` - Main entry point
  - `getPersonalizedRecommendations()` - User-specific recommendations
  - `getSessionBasedRecommendations()` - Guest user recommendations
  - `getContentBasedRecommendations()` - Content-based filtering
  - `getCollaborativeRecommendations()` - Collaborative filtering
  - `getCategoryBasedRecommendations()` - Category-based suggestions
  - `trackProductView()` - Record product views

#### 4. Controllers
- **RecommendationController**
  - `getRecommendations()` - API endpoint to fetch recommendations
  - `trackView()` - API endpoint to track product views

#### 5. API Routes
- `GET /api/recommendations` - Get recommendations (public, works for guests)
- `POST /api/products/{id}/track-view` - Track product view (public)

### Frontend Components

#### 1. Hooks
- **useProductViewTracker** - React hook to automatically track product views
  - Tracks when component mounts
  - Records view duration when component unmounts
  - Debounced to prevent excessive API calls

#### 2. Components
- **Recommendations** - Display component for recommendation results
  - Shows personalized title and subtitle
  - Displays products in grid layout
  - Integrates with cart and favorites
  - Handles loading and error states

#### 3. Integration Points
- **Homepage** - Shows "Recommended For You" section
- **Product Details Page** - Shows "You May Also Like" section
- **Product Details Page** - Automatically tracks product views

## How It Works

### Recommendation Flow

1. **Data Collection**
   - User views product → View tracked automatically
   - View duration calculated when user leaves
   - Data stored in `browsing_history` table

2. **Recommendation Generation** (when user requests recommendations)
   - System analyzes:
     - User's browsing history (products viewed, time spent)
     - Purchase history (products bought)
     - Category preferences
   
   - Three algorithms generate candidate products:
     - Content-based: Similar products
     - Collaborative: Products liked by similar users
     - Category-based: Top products in favorite categories
   
   - Products are scored and ranked
   - Top N products returned (default: 12)

3. **Display**
   - Recommendations displayed in UI
   - Users can click to view product details
   - System continues learning from interactions

## Usage

### For Developers

#### Track Product Views
```javascript
// Automatically tracked in ProductDetails component
// Or manually:
import { useProductViewTracker } from '../../hooks/useProductViewTracker';
useProductViewTracker(productId);
```

#### Display Recommendations
```jsx
import Recommendations from './product/Recommendations';

<Recommendations 
  title="Recommended For You"
  subtitle="Based on your browsing history"
  limit={12}
/>
```

### For End Users

- **Authenticated Users**: Simply browse products - recommendations improve over time
- **Guest Users**: Browse products during session - get session-based recommendations
- **No Action Required**: System works automatically in background

## Database Migration

Run the migration to create the browsing_history table:

```bash
cd backend
php artisan migrate
```

## Performance Considerations

- Database indexes on frequently queried columns
- Efficient queries using Eloquent relationships
- Caching can be added for frequently accessed recommendations
- Limits applied to prevent excessive data processing

## Future Enhancements

1. **Real-time Learning**: Update recommendations as user browses
2. **Machine Learning**: Integrate TensorFlow/PyTorch for advanced algorithms
3. **A/B Testing**: Test different recommendation strategies
4. **Personalization Dashboard**: Let users influence recommendations
5. **Seasonal Trends**: Consider time-based patterns
6. **Social Recommendations**: Include friends' preferences

## API Documentation

### GET /api/recommendations
**Query Parameters:**
- `limit` (optional): Number of recommendations (default: 12)

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "id": 1,
      "product_id": 1,
      "productName": "Product Name",
      "productPrice": 99.99,
      "average_rating": 4.5,
      "reviews_count": 25,
      ...
    }
  ],
  "count": 12
}
```

### POST /api/products/{id}/track-view
**Body:**
```json
{
  "duration": 30  // Optional: seconds spent viewing
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product view tracked successfully"
}
```

## Testing

To test the recommendation system:

1. Browse several products while logged in
2. Make some purchases (optional)
3. Visit homepage - see personalized recommendations
4. View a product - see "You May Also Like" section
5. Check that recommendations improve over time

## Notes

- Recommendations improve as more user data is collected
- Guest users get session-based recommendations
- System gracefully falls back to popular products if no data available
- All tracking happens in background without disrupting user experience




