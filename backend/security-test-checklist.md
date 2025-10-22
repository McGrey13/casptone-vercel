# Security Testing Checklist

## 🔒 Session Security Testing

### 1. Login and Check Cookies
- [ ] Login to your application
- [ ] Open browser Developer Tools (F12)
- [ ] Go to Application/Storage tab → Cookies
- [ ] Check that session cookies have:
  - [ ] `HttpOnly` flag set to `true`
  - [ ] `Secure` flag set to `false` (for local development)
  - [ ] `SameSite` set to `lax`

### 2. Session Timeout Testing
- [ ] Login to your application
- [ ] Wait for 60 minutes (or test with shorter timeout)
- [ ] Try to access a protected page
- [ ] Should be automatically logged out

### 3. Session Regeneration Testing
- [ ] Login to your application
- [ ] Note the session cookie value
- [ ] Browse around for 10+ minutes
- [ ] Check session cookie value again
- [ ] Should have changed (regenerated)

### 4. Logout Testing
- [ ] Login to your application
- [ ] Click logout
- [ ] Check that session cookies are cleared
- [ ] Try to access protected pages - should redirect to login

## 🌐 API Testing

### 5. API Endpoints Testing
- [ ] Test API calls from frontend
- [ ] Check browser Network tab
- [ ] API calls should work with `http://localhost:8000/api`
- [ ] No CORS errors should appear

### 6. Frontend Connection Testing
- [ ] Start your frontend development server
- [ ] Check that it connects to backend API
- [ ] Verify no mixed content warnings

## 🔧 Configuration Verification

### 7. Laravel Configuration Check
Run these commands to verify settings:
```bash
php artisan config:show session
php artisan config:show cors
```

Expected values:
- `session.encrypt` = `true`
- `session.http_only` = `true`
- `session.lifetime` = `60`
- `session.secure` = `false` (for local development)

### 8. Environment Variables Check
Check these are in your `.env` file:
- `SESSION_ENCRYPT=true`
- `SESSION_SECURE_COOKIE=false`
- `SESSION_HTTP_ONLY=true`
- `SESSION_LIFETIME=60`
- `FORCE_HTTPS=false`

## 🚨 Security Headers Testing

### 9. Security Headers Check
- [ ] Visit your application in browser
- [ ] Open Developer Tools → Network tab
- [ ] Refresh page and check response headers
- [ ] Look for these headers:
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `X-Frame-Options: DENY`
  - [ ] `X-XSS-Protection: 1; mode=block`
  - [ ] `Referrer-Policy: strict-origin-when-cross-origin`

## ✅ Success Indicators

Your security implementation is working if:
- ✅ Session cookies have proper security flags
- ✅ Sessions expire after 60 minutes
- ✅ Session IDs regenerate automatically
- ✅ API endpoints work correctly
- ✅ No configuration errors in Laravel
- ✅ Security headers are present
- ✅ Logout properly clears sessions

## 🔧 Troubleshooting

### If Configuration Won't Load:
1. Check `.env` file syntax (no extra spaces, proper quotes)
2. Run `php artisan config:clear`
3. Check Laravel logs in `storage/logs/laravel.log`

### If Sessions Don't Work:
1. Check database connection
2. Verify sessions table exists: `php artisan migrate`
3. Check file permissions on `storage/` directory

### If API Calls Fail:
1. Check CORS configuration
2. Verify frontend is using correct API URL
3. Check Laravel logs for errors

## 📞 Next Steps

After successful testing:
1. **For Production**: Update domain settings in `.env`
2. **For HTTPS**: Follow SSL setup guide
3. **For Monitoring**: Set up security event logging
4. **For Backup**: Document your security configuration
