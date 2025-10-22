# Authentication 401 Fix Guide

## Issue
The `/api/auth/profile` endpoint is returning 401 Unauthorized errors because Sanctum isn't properly recognizing the authentication cookies.

## Root Cause
The authentication system has several configuration issues:
1. Missing proper CORS configuration
2. Frontend and backend cookie domain mismatch
3. Sanctum stateful domains not properly configured

## Step-by-Step Fix

### Step 1: Update Backend .env File
Add/update these lines in your `backend/.env`:

```env
# CORS Configuration
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000,127.0.0.1:5173,127.0.0.1:3000
SESSION_DOMAIN=localhost
SESSION_DRIVER=database

# Application
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Cookie Configuration
SESSION_SECURE_COOKIE=false
```

### Step 2: Update CORS Configuration
File: `backend/config/cors.php`

Update the `supports_credentials` to true:

```php
'supports_credentials' => true,
```

### Step 3: Clear All Caches
Run these commands:

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### Step 4: Test the Authentication Flow

1. **Login Test**:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userEmail":"giocalugas@example.com","userPassword":"password123","role":"customer"}' \
  -c cookies.txt
```

2. **Profile Test**:
```bash
curl -X GET http://localhost:8000/api/auth/profile \
  -b cookies.txt
```

### Step 5: Test from Frontend

1. Clear browser data:
```javascript
localStorage.clear();
sessionStorage.clear();
```

2. Refresh the page

3. Try logging in again

## Alternative Solution: Use Token-Based Authentication

If cookie-based authentication continues to have issues, you can switch to token-based authentication:

1. The login endpoint already returns the token in the response
2. Store it in memory (not localStorage)
3. Send it in the Authorization header

Would you like me to implement the token-based approach instead?

