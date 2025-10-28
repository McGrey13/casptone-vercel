# Account Deactivation - Complete Fix

## Overview
Fixed the account deactivation system to properly block deactivated users from logging in.

## The Problem
1. Users table has a `status` column with values: `'active'` or `'deactivated'`
2. Frontend was checking for `'inactive'` instead of `'deactivated'`
3. Login check wasn't working properly

## The Solution

### 1. Backend - Login Check ✅
**File:** `backend/app/Http/Controllers/Auth/AuthController.php`

```php
// Check if account is deactivated
if (isset($user->status) && $user->status === 'deactivated') {
    return response()->json(['message' => 'Your account has been deactivated. Please contact support.'], 403);
}
```

### 2. Backend - AdminController Methods ✅
**File:** `backend/app/Http/Controllers/Auth/AdminController.php`

Added these methods:
- `deactivateCustomer($customerId)` - Sets status to 'deactivated'
- `reactivateCustomer($customerId)` - Sets status to 'active'
- `deactivateSeller($sellerId)` - Sets status to 'deactivated'
- `reactivateSeller($sellerId)` - Sets status to 'active'
- `resetCustomerPassword($customerId)` - Sends temp password email
- `resetSellerPassword($sellerId)` - Sends temp password email

### 3. Backend - Routes ✅
**File:** `backend/routes/api.php`

```php
// Customer management routes
Route::post('/admin/customers/{customerId}/deactivate', [AdminController::class, 'deactivateCustomer']);
Route::post('/admin/customers/{customerId}/reactivate', [AdminController::class, 'reactivateCustomer']);
Route::post('/admin/customers/{customerId}/reset-password', [AdminController::class, 'resetCustomerPassword']);

// Seller management routes
Route::post('/admin/sellers/{sellerId}/deactivate', [AdminController::class, 'deactivateSeller']);
Route::post('/admin/sellers/{sellerId}/reactivate', [AdminController::class, 'reactivateSeller']);
Route::post('/admin/sellers/{sellerId}/reset-password', [AdminController::class, 'resetSellerPassword']);
```

### 4. Backend - EmailService ✅
**File:** `backend/app/Services/EmailService.php`

Added `sendPasswordResetEmail()` method to send temporary passwords.

### 5. Backend - User Model ✅
**File:** `backend/app/Models/User.php`

Added `status` to the fillable array.

### 6. Frontend - CustomerTable.jsx ✅
Updated to use 'deactivated' instead of 'inactive'.

### 7. Frontend - ArtisanTable.jsx ✅
Updated to use 'deactivated' instead of 'inactive'.

## How It Works

### Deactivate Flow
1. Admin clicks "Deactivate Account"
2. Backend sets `status = 'deactivated'`
3. Frontend updates to show "Reactivate Account" button
4. User cannot log in (gets 403 error)

### Reactivate Flow
1. Admin clicks "Reactivate Account"
2. Backend sets `status = 'active'`
3. Frontend updates to show "Deactivate Account" button
4. User can log in again

## Database Schema

The `status` column in the users table:
- Type: ENUM
- Values: `'active'`, `'deactivated'`
- Default: `'active'`

## Testing

Try this:
1. Go to Admin panel → Customers
2. Click the 3-dot menu on any customer
3. Click "Deactivate Account"
4. Try to log in with that customer's account
5. You should see: "Your account has been deactivated. Please contact support."
6. Go back to admin and click "Reactivate Account"
7. User can now log in again

## Files Modified

**Backend:**
- `backend/app/Http/Controllers/Auth/AuthController.php` - Login check
- `backend/app/Http/Controllers/Auth/AdminController.php` - Deactivate/Reactivate methods
- `backend/routes/api.php` - Routes
- `backend/app/Services/EmailService.php` - Password reset email
- `backend/app/Models/User.php` - Added status to fillable

**Frontend:**
- `frontend/src/Components/Admin/CustomerTable.jsx` - Updated status handling
- `frontend/src/Components/Admin/ArtisanTable.jsx` - Updated status handling

## Status Values

- `'active'` - User can log in and use the system
- `'deactivated'` - User is blocked from accessing the system

The deactivation system is now fully functional! 🎉
