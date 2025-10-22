# Facebook Social Connection Setup Guide

## Issue Fixed: Seller Account Redirecting to Customer Side

The issue was that the social media Facebook connection was using the same callback URL as the login flow, causing it to redirect to the wrong page.

## Solution: Separate Redirect URIs

I've created separate redirect URIs for:
1. **Login/Registration:** `/api/auth/facebook/callback` (redirects to login page)
2. **Social Media Connection:** `/api/social/facebook/callback` (redirects to seller social page)

## Required Setup

### 1. Update Your .env File

Add this new environment variable to your `backend/.env`:

```env
# Existing Facebook settings
FB_CLIENT_ID=your_facebook_app_id
FB_CLIENT_SECRET=your_facebook_app_secret
FB_REDIRECT_URI=http://localhost:8000/api/auth/facebook/callback

# NEW: Social media connection redirect URI
FB_SOCIAL_REDIRECT_URI=http://localhost:8000/api/social/facebook/callback
```

### 2. Update Facebook App Settings

Go to [Facebook Developers](https://developers.facebook.com/):

1. **Select your app** → **Facebook Login** → **Settings**
2. **Add BOTH redirect URIs:**
   ```
   http://localhost:8000/api/auth/facebook/callback
   http://localhost:8000/api/social/facebook/callback
   ```
3. **App Domains:** `localhost`
4. **Website URL:** `http://localhost:8000`
5. **Save Changes**

### 3. Clear Laravel Cache

Run these commands to clear the configuration cache:

```bash
cd backend
php artisan config:clear
php artisan cache:clear
```

## How It Works Now

### For Login/Registration (Login Page):
- Uses: `/api/auth/facebook/callback`
- Redirects to: Login page with token
- Purpose: Create new account or login existing user

### For Social Media Connection (Seller Dashboard):
- Uses: `/api/social/facebook/callback`
- Redirects to: `/seller/social?connected=facebook&success=1`
- Purpose: Link existing CraftConnect account to Facebook

## Testing

1. **Test Login Flow:**
   - Go to login page
   - Click "Sign in with Facebook"
   - Should redirect to appropriate dashboard based on role

2. **Test Social Media Connection:**
   - Login as seller
   - Go to Social Media section
   - Click "Link Account" on Facebook
   - Should redirect back to seller social media page

## Expected Behavior

- ✅ **Seller connects Facebook:** Stays in seller section
- ✅ **Customer connects Facebook:** Stays in customer section  
- ✅ **New user signs up with Facebook:** Redirects to appropriate dashboard
- ✅ **Existing user logs in with Facebook:** Redirects to appropriate dashboard

## Troubleshooting

If you still have issues:

1. **Check Facebook App Settings:** Make sure both redirect URIs are added
2. **Clear Browser Cache:** Clear cookies and local storage
3. **Check Laravel Logs:** Look for any OAuth errors in `storage/logs/laravel.log`
4. **Verify .env:** Make sure both redirect URIs are set correctly

The fix ensures that social media connections stay within the correct user context instead of redirecting to the wrong section!

