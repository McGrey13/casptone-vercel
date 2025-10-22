# Facebook Login - Debug Guide 🔍

## The URL You're Seeing is CORRECT!

```
http://localhost:5173/home?token=104|VpoQ...&user_id=30&user_type=customer#_=_
```

✅ **Backend is working perfectly!**
- ✅ User created (ID: 30)
- ✅ Token generated
- ✅ Redirected to `/home`
- ✅ Correct parameters passed

The `#_=_` is just Facebook's cache-buster - **it's normal!**

---

## Why It Might Not Be Working

### Issue #1: Frontend Code Not Updated

**Did you refresh your frontend dev server?**

The code changes I made to `Login.jsx` need to be applied:

```bash
# Make sure your frontend dev server reloaded
# If using Vite, it should auto-reload
# If not, restart it:
cd frontend
npm run dev
```

### Issue #2: Browser Cache

**Old JavaScript might be cached:**

1. **Hard refresh:** `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)
2. **Or clear cache:** `Ctrl + Shift + Delete` → Clear everything
3. **Close and reopen browser**

### Issue #3: Console Errors

**Open browser console (F12) and check for errors:**
- Red errors might show what's failing
- Check the "Console" tab for my debug logs
- Check the "Network" tab for API requests

---

## Step-by-Step Testing

### Before You Start:

1. **Clear everything:**
```js
// In browser console (F12):
localStorage.clear();
sessionStorage.clear();
location.reload();
```

2. **Close all tabs** of localhost:5173

3. **Restart frontend server:**
```bash
cd frontend
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

### Test Facebook Login:

1. **Open browser console (F12)** - Keep it open!

2. **Go to:** `http://localhost:5173/login`

3. **Click:** "Sign in with Facebook"

4. **Select:** "Customer"

5. **Authorize Facebook**

6. **Watch the console** - you should see:
```
🔐 OAuth callback params: { hasToken: true, userId: '30', userType: 'customer', ... }
🔄 Starting OAuth login process...
🔑 Setting token: 104|VpoQ08zD0pnxIbu...
📡 Fetching user profile...
👤 User profile received: { userID: 30, userName: 'Your Name', ... }
✅ OAuth login successful, user data saved to localStorage
🚀 Redirecting to: /home
```

7. **After redirect, check console again:**
```js
// Check token
sessionStorage.getItem('auth_token')
// Should return: "104|VpoQ08zD0pnxIbu..."

// Check user data
JSON.parse(localStorage.getItem('user_data'))
// Should return: { userID: 30, userName: '...', userEmail: '...' }
```

---

## What You Should See (Step by Step)

### Step 1: Login Page
- URL: `http://localhost:5173/login`
- Click "Sign in with Facebook"
- Modal opens

### Step 2: Role Selection
- Select "Customer"
- Click "Continue"
- Redirects to Facebook

### Step 3: Facebook Authorization
- URL: `https://www.facebook.com/v19.0/dialog/oauth?client_id=823045633579448...`
- Click "Continue as [Your Name]"
- Authorizes permissions

### Step 4: Backend Callback
- URL: `http://localhost:8000/api/auth/facebook/callback?code=...&state=...`
- Backend creates user
- Backend generates token
- Backend redirects to frontend

### Step 5: Frontend Callback
- URL: `http://localhost:5173/home?token=104|...&user_id=30&user_type=customer#_=_`
- **Console shows:** OAuth callback params detected
- **Console shows:** Setting token
- **Console shows:** Fetching user profile
- **Console shows:** User profile received
- **Console shows:** Redirecting to /home

### Step 6: Home Page
- URL: `http://localhost:5173/home`
- **You're logged in!**
- Profile shows your data
- localStorage has user_data
- sessionStorage has auth_token

---

## If You See NO Console Logs

**This means the frontend code didn't update!**

### Solution:

1. **Check if Login.jsx was saved:**
```bash
# In the project root
git status
# Should show: modified: frontend/src/Components/Auth/Login.jsx
```

2. **Check the file manually:**
Open `frontend/src/Components/Auth/Login.jsx` and look for line 70-73:
```js
// Remove Facebook's #_=_ hash fragment if present
if (window.location.hash === '#_=_') {
  window.history.replaceState(null, null, window.location.pathname + window.location.search);
}
```

If this code is NOT there, the file wasn't saved!

3. **Restart Vite dev server:**
```bash
cd frontend
# Press Ctrl+C to stop
npm run dev
```

---

## If You See Errors in Console

### Error: "Failed to fetch user profile"

**Cause:** Token not valid or `/auth/profile` endpoint failing

**Fix:**
```bash
# Check if backend is running
cd backend
php artisan serve

# Check if route exists
php artisan route:list --path=auth/profile
# Should show: GET api/auth/profile
```

### Error: "Network Error" or "CORS"

**Cause:** Backend not running or CORS issue

**Fix:**
- Make sure backend is running on port 8000
- Check `backend/config/cors.php`

### Error: "Unauthorized" (401)

**Cause:** Token not being sent in headers

**Debug in console:**
```js
// Check if token is set
sessionStorage.getItem('auth_token')
// Should NOT be null

// Check API headers
// In Network tab → Click on the /auth/profile request
// Headers → Request Headers → Authorization
// Should be: Bearer 104|VpoQ...
```

---

## Quick Debug Script

Open browser console on the `/home` page and run:

```js
// Debug script
console.log('=== DEBUG INFO ===');
console.log('Token:', sessionStorage.getItem('auth_token'));
console.log('User Data:', localStorage.getItem('user_data'));
console.log('Parsed User:', JSON.parse(localStorage.getItem('user_data') || '{}'));

// Test API call
fetch('http://localhost:8000/api/auth/profile', {
  headers: {
    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_token'),
    'Accept': 'application/json'
  }
})
  .then(r => r.json())
  .then(d => console.log('Profile API Response:', d))
  .catch(e => console.error('Profile API Error:', e));
```

**Expected output:**
```
=== DEBUG INFO ===
Token: 104|VpoQ08zD0pnxIbuNdUYYxXDyoQEbfoWwqdhCgNKxbb0effcb
User Data: {"userID":30,"userName":"Your Name","userEmail":"your@email.com"...}
Parsed User: {userID: 30, userName: "Your Name", ...}
Profile API Response: {userID: 30, userName: "Your Name", ...}
```

---

## Files That Need to Be Updated

Make sure these files have my changes:

### 1. `frontend/src/Components/Auth/Login.jsx`
**Line 12-13:**
```js
import { setToken } from "../../api";
import api from "../../api";  // ← This should be there
```

**Line 70-138:** Should have the new OAuth handler with console.logs

### 2. `backend/routes/api.php`
**Line 481-487:** Should have Facebook auth routes

### 3. `backend/.env`
Should have correct redirect URIs (no duplicates)

### 4. `backend/app/Http/Controllers/Auth/AuthController.php`
Should redirect to `/home`, `/seller`, or `/admin` based on role

---

## Checklist Before Testing

- [ ] Frontend dev server is running and reloaded
- [ ] Login.jsx file has the updated code (check line 70-73)
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] localStorage and sessionStorage cleared
- [ ] Browser console open (F12)
- [ ] Backend is running on port 8000

---

## Expected Console Output

When you click "Sign in with Facebook" and complete the flow, you should see:

```
🔐 OAuth callback params: {hasToken: true, userId: '30', userType: 'customer', redirectTo: null, url: 'http://localhost:5173/home?token=104...' }
🔄 Starting OAuth login process...
🔑 Setting token: 104|VpoQ08zD0pnxIbu...
📡 Fetching user profile...
👤 User profile received: {userID: 30, userName: 'Your Name', userEmail: 'your@email.com', role: 'customer', ...}
✅ OAuth login successful, user data saved to localStorage
🚀 Redirecting to: /home
```

If you **DON'T** see these logs, the frontend code hasn't been applied!

---

## Summary

**Backend:** ✅ Working (you got the correct URL with token)  
**Frontend:** ❓ Need to verify the code is running

**Most likely issue:** Frontend changes not applied yet OR browser cache

**Solution:** 
1. Restart frontend dev server
2. Hard refresh browser
3. Try again with console open
4. Send me the console output!

---

Let me know what you see in the console bro! That will tell us exactly what's happening. 🔍

