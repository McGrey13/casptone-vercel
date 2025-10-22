# Security Implementation Guide

This document outlines the security improvements implemented in the CraftConnect application.

## 🔐 Token Storage Improvements

### HttpOnly Cookies Implementation
- **Replaced localStorage with httpOnly cookies** for token storage
- **Benefits**: Prevents XSS attacks, tokens not accessible via JavaScript
- **Implementation**: `SecureAuthController` and `SecureUserContext`

### Token Refresh Mechanism
- **Automatic token refresh** when access tokens expire
- **Refresh tokens** stored securely in database with expiration
- **Seamless user experience** with automatic re-authentication

### Token Expiration Handling
- **Access tokens**: 60 minutes (configurable)
- **Refresh tokens**: 24 hours (configurable)
- **Automatic cleanup** of expired tokens via command

## 🛡️ Security Headers Implementation

### Content Security Policy (CSP)
- **Comprehensive CSP** with strict directives
- **Environment-based configuration** for development vs production
- **Report-only mode** available for testing
- **Configurable allowed origins** for external resources

### HSTS (HTTP Strict Transport Security)
- **Automatic HTTPS enforcement** in production
- **Configurable max-age** and subdomain inclusion
- **Preload support** for HSTS preload list

### X-Frame-Options
- **DENY by default** to prevent clickjacking
- **Configurable** via environment variables
- **SameSite cookie protection**

## 🔧 Implementation Details

### Backend Components

#### 1. SecureAuthController
```php
// New secure authentication controller with httpOnly cookies
Route::prefix('auth')->group(function () {
    Route::post('/login', [SecureAuthController::class, 'login']);
    Route::post('/register', [SecureAuthController::class, 'register']);
    Route::post('/verify-otp', [SecureAuthController::class, 'verifyOtp']);
    Route::post('/refresh-token', [SecureAuthController::class, 'refreshToken']);
    Route::post('/logout', [SecureAuthController::class, 'logout']);
});
```

#### 2. TokenService
```php
// Centralized token management service
- createAccessToken()
- createRefreshToken()
- refreshAccessToken()
- revokeRefreshToken()
- cleanExpiredTokens()
```

#### 3. EnhancedSecurityHeaders Middleware
```php
// Comprehensive security headers middleware
- Content Security Policy
- HSTS headers
- X-Frame-Options
- Permissions Policy
- Other security headers
```

#### 4. RefreshToken Model
```php
// Database model for refresh tokens
- user_id (foreign key)
- token (hashed)
- expires_at (timestamp)
- Automatic cleanup
```

### Frontend Components

#### 1. secureApi.js
```javascript
// Secure API client with automatic token refresh
- withCredentials: true for cookies
- Automatic token refresh on 401
- Request/response interceptors
```

#### 2. SecureUserContext.jsx
```javascript
// Context for secure authentication
- HttpOnly cookie support
- Automatic token refresh
- Secure logout
```

## 📋 Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Token Configuration
SANCTUM_TOKEN_EXPIRATION=60
SANCTUM_REFRESH_EXPIRATION=1440

# Security Headers
FORCE_HTTPS=false
HSTS_ENABLED=false
CSP_ENABLED=false
X_FRAME_OPTIONS=DENY

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1
FRONTEND_URL=http://localhost:5173
```

### Development vs Production

#### Development Mode
- **Basic security headers** only
- **No HTTPS enforcement**
- **Relaxed CSP** for development tools
- **Local storage fallback** available

#### Production Mode
- **Full security headers** enabled
- **HTTPS enforcement** mandatory
- **Strict CSP** policy
- **HttpOnly cookies** required

## 🚀 Usage Instructions

### 1. Enable Secure Authentication

Update your frontend to use the secure context:

```javascript
// In your main.jsx
import { SecureUserProvider } from './Components/Context/SecureUserContext';

// Replace UserProvider with SecureUserProvider
<SecureUserProvider>
  <App />
</SecureUserProvider>
```

### 2. Update API Calls

Use the secure API client:

```javascript
// Instead of regular api
import secureApi from './api/secureApi';

// All requests automatically include cookies and handle token refresh
const response = await secureApi.get('/auth/profile');
```

### 3. Migration Steps

1. **Run migrations**:
   ```bash
   php artisan migrate
   ```

2. **Update environment**:
   ```bash
   # Copy settings from security-config.example to .env
   ```

3. **Test secure endpoints**:
   ```bash
   # Test the new /auth/* endpoints
   curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"userEmail":"test@example.com","userPassword":"password"}' \
     -c cookies.txt
   ```

4. **Clean expired tokens**:
   ```bash
   php artisan tokens:clean
   ```

## 🔍 Security Testing

### 1. Token Security
- ✅ Tokens stored in httpOnly cookies
- ✅ No JavaScript access to tokens
- ✅ Automatic token refresh
- ✅ Token expiration handling

### 2. Security Headers
- ✅ CSP implemented
- ✅ HSTS configured
- ✅ X-Frame-Options set
- ✅ Other security headers present

### 3. Authentication Flow
- ✅ Secure login/logout
- ✅ Token refresh mechanism
- ✅ Session management
- ✅ CORS configuration

## 📊 Benefits

### Security Improvements
1. **XSS Protection**: Tokens not accessible via JavaScript
2. **CSRF Protection**: SameSite cookies and CSRF tokens
3. **Clickjacking Protection**: X-Frame-Options headers
4. **Content Injection Protection**: CSP headers
5. **Man-in-the-Middle Protection**: HSTS headers

### User Experience
1. **Seamless Authentication**: Automatic token refresh
2. **Persistent Sessions**: Refresh tokens for longer sessions
3. **Secure Logout**: Complete token cleanup
4. **Error Handling**: Graceful authentication failures

### Developer Experience
1. **Centralized Security**: All security logic in one place
2. **Configurable**: Environment-based security settings
3. **Maintainable**: Clear separation of concerns
4. **Testable**: Comprehensive security testing

## 🔧 Maintenance

### Regular Tasks
1. **Clean expired tokens** (run `php artisan tokens:clean`)
2. **Review security headers** in production
3. **Monitor CSP reports** if report-uri is configured
4. **Update token expiration** times as needed

### Monitoring
1. **Check authentication logs** for failed attempts
2. **Monitor token refresh patterns**
3. **Review security header compliance**
4. **Test security configurations** regularly

## 🚨 Security Considerations

### Production Deployment
1. **Enable HTTPS** and set `FORCE_HTTPS=true`
2. **Configure proper CORS origins**
3. **Set up CSP reporting** for monitoring
4. **Use secure cookie settings**
5. **Regular security audits**

### Development
1. **Use development-specific settings**
2. **Test both secure and legacy endpoints**
3. **Monitor browser console** for CSP violations
4. **Validate token refresh** functionality

This implementation provides enterprise-grade security while maintaining a smooth user experience. All security features are configurable and can be adjusted based on your specific requirements.
