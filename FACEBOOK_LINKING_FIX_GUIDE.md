# Facebook Account Linking Fix Guide

## Problem
When linking Facebook account to existing seller account (renel@example.com), it redirects to customer side (http://localhost:5173/home) instead of seller side (http://localhost:5173/seller).

## Root Cause
The social media Facebook connection is using the wrong redirect URI, causing it to go through the login flow instead of the social media linking flow.

## Solution

### Step 1: Update Your .env File

Add this line to your `backend/.env` file:

```env
# Add this line to your existing .env file
FB_SOCIAL_REDIRECT_URI=http://localhost:8000/api/social/facebook/callback
```

Your .env should look like this:
```env
FB_CLIENT_ID=your_facebook_app_id
FB_CLIENT_SECRET=your_facebook_app_secret
FB_REDIRECT_URI=http://localhost:8000/api/auth/facebook/callback
FB_SOCIAL_REDIRECT_URI=http://localhost:8000/api/social/facebook/callback
```

### Step 2: Update Facebook App Settings

Go to [Facebook Developers](https://developers.facebook.com/):

1. **Select your app** → **Facebook Login** → **Settings**
2. **Add BOTH redirect URIs:**
   ```
   http://localhost:8000/api/auth/facebook/callback
   http://localhost:8000/api/social/facebook/callback
   ```
3. **Save Changes**

### Step 3: Clear Laravel Cache

```bash
cd backend
php artisan config:clear
php artisan cache:clear
```

### Step 4: Test the Fix

1. **Login as seller** (renel@example.com)
2. **Go to Social Media section**
3. **Click "Link Account" on Facebook**
4. **Complete Facebook OAuth**
5. **Should redirect to:** `http://localhost:5173/seller/social?connected=facebook&success=1`

## How It Works Now

### Social Media Connection Flow:
1. User is logged in as seller (renel@example.com)
2. Clicks "Link Account" → Uses `/api/social/facebook/redirect`
3. Facebook OAuth → Uses `/api/social/facebook/callback`
4. Links Facebook to existing user (renel@example.com)
5. Redirects to `/seller/social` (stays in seller section)

### Login Flow (unchanged):
1. User clicks "Sign in with Facebook" → Uses `/api/auth/facebook/redirect`
2. Facebook OAuth → Uses `/api/auth/facebook/callback`
3. Creates new account or logs in existing user
4. Redirects to appropriate dashboard

## Key Changes Made

1. **Separate Redirect URIs:**
   - Login: `/api/auth/facebook/callback`
   - Social Media: `/api/social/facebook/callback`

2. **Account Linking Only:**
   - Social media connection NEVER creates new accounts
   - Always links to existing logged-in user
   - Uses stored user ID from cache

3. **Correct Redirects:**
   - Social media connection → `/seller/social`
   - Login → `/home` or `/seller` based on role

## Verification

After applying the fix:

✅ **Seller links Facebook:** Stays in seller section  
✅ **Uses existing account:** Links to renel@example.com  
✅ **No new account created:** Only links existing account  
✅ **Correct redirect:** Goes to `/seller/social` not `/home`  

## Troubleshooting

If still not working:

1. **Check logs:** `storage/logs/laravel.log`
2. **Verify .env:** Make sure both redirect URIs are set
3. **Clear browser cache:** Clear cookies and local storage
4. **Check Facebook App:** Ensure both redirect URIs are added

The fix ensures that social media linking stays within the correct user context and doesn't create new accounts!

