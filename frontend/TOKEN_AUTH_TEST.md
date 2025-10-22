# Token-Based Authentication Test Guide

## What Changed

### Frontend Changes:
1. **api.js**: Updated to use Authorization header with Bearer token
2. **UserContext.jsx**: Updated to store and use tokens from login/OTP responses
3. **Token Storage**: Using sessionStorage (cleared on browser close)

### Backend Changes:
1. **SecureAuthController**: Now returns `token` in login/verify-otp/refresh responses
2. **Token Management**: Still sets httpOnly cookies as backup

## Test Steps

### Step 1: Clear All Data
```javascript
// Run in browser console
localStorage.clear();
sessionStorage.clear();
// Refresh page
```

### Step 2: Login
1. Go to `/login`
2. Login with:
   - Email: `giocalugas@example.com`
   - Password: `password123`
   - Role: Customer

### Step 3: Check Token Storage
```javascript
// Check if token is stored
console.log('Token:', sessionStorage.getItem('auth_token'));
```

### Step 4: Check API Requests
1. Open DevTools → Network tab
2. Look for `/api/auth/profile` request
3. Check Request Headers for: `Authorization: Bearer <token>`

### Step 5: Verify Authentication
- Should see: `✅ Authentication successful: {user data}`
- NavBar should show user info
- Page refresh should persist user state

## Expected Results

✅ **Login**: Returns token in response
✅ **Token Storage**: Stored in sessionStorage
✅ **API Requests**: Include Authorization header
✅ **Authentication**: Works without 401 errors
✅ **Persistence**: User state persists across page reloads
✅ **Logout**: Clears token and user state

## Troubleshooting

### Still getting 401 errors?
1. Check if token is in sessionStorage
2. Check if Authorization header is being sent
3. Verify backend is returning token in login response

### Token not persisting?
- sessionStorage is cleared on browser close
- This is intentional for security
- User will need to login again in new session
