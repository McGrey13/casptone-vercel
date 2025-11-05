# Google Maps Setup for Artisan Detail Page

## Overview
The artisan detail page now includes a "Find Us" section with an embedded Google Map showing the store location.

## Setup Instructions

### 1. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Library**
4. Search for **"Maps Embed API"**
5. Click **Enable**
6. Go to **APIs & Services** > **Credentials**
7. Click **Create Credentials** > **API Key**
8. Copy your API key

### 2. Add API Key to Environment
Add the following to your frontend `.env` file (create one if it doesn't exist in the `frontend/` directory):

```env
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
```

### 3. Restart Development Server
After adding the API key, restart your Vite development server:

```bash
cd frontend
npm run dev
```

## Features

✅ **Interactive Map**: Embedded Google Maps showing store location  
✅ **Fallback Handling**: If API key is missing, shows location text and "Open in Google Maps" link  
✅ **Responsive Design**: Map adapts to different screen sizes  
✅ **Customizable**: Uses store's theme colors for borders and styling  

## Location Display

The map uses the store's location from:
- `storeData.seller.user.userCity` + `userProvince` (preferred)
- Falls back to `artisan.location` if available
- Default: "Laguna, Philippines" if no location found

## Limitations

- **Free Tier**: Google Maps Embed API has usage limits for free accounts
- **API Key**: Must be kept secure (never commit to public repositories)
- **Location Accuracy**: Requires accurate address from seller's profile

## Alternative: Static Map (No API Key)

If you don't want to use an API key, you can replace the iframe with a static image:

```jsx
<div className="h-96 w-full bg-gray-100 flex items-center justify-center">
  <a 
    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.location)}`}
    target="_blank"
    rel="noopener noreferrer"
    className="text-center p-8"
  >
    <svg className="w-24 h-24 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    <p className="font-semibold text-lg mb-2">View Location on Google Maps</p>
    <p className="text-sm text-gray-600">{store.location}</p>
  </a>
</div>
```

## Testing

1. Ensure sellers have location data (city/province) in their profile
2. Navigate to any artisan detail page: `/artisan/{seller_id}`
3. Scroll to the "Find Us" section below Workshops & Events
4. Verify the map displays correctly or shows the fallback link

## Security Notes

- The API key is exposed in the frontend code (visible to users)
- Use API key restrictions in Google Cloud Console:
  - HTTP referrers (website restrictions)
  - API restrictions (limit to Maps Embed API only)
- Monitor usage in Google Cloud Console to prevent unexpected charges

## Cost

Google Maps Embed API offers free usage up to a monthly quota. Check current pricing at:
https://developers.google.com/maps/billing-and-pricing/pricing

