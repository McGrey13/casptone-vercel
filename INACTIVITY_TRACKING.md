# Inactivity Tracking System

## Overview
Separate from account deactivation (`status` field), inactivity tracking monitors when users last logged in or were active.

## Database Fields Added

### In `0001_01_01_000000_create_users_table.php`:
```php
$table->timestamp('last_activity_at')->nullable(); // Track last user activity
$table->timestamp('last_login_at')->nullable(); // Track last login
```

## How It Works

### Two Separate Systems:

1. **Account Status (`status` field)**:
   - Values: `'active'`, `'deactivated'`
   - Purpose: Admin-controlled account blocking
   - Effect: Blocks login completely

2. **Inactivity Tracking** (`last_activity_at`, `last_login_at`):
   - Purpose: Track user activity patterns
   - Use: Display "Last seen X days ago" or "Inactive for Y days"
   - No effect on login capability

## Implementation

### 1. Update Login Method (Set last_login_at)

**File:** `backend/app/Http/Controllers/Auth/AuthController.php`

```php
public function login(Request $request)
{
    // ... existing code ...
    
    if (!$user || !Hash::check($credentials['userPassword'], $user->userPassword)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    // Update last login timestamp
    $user->last_login_at = now();
    $user->last_activity_at = now();
    $user->save();
    
    // Check if account is deactivated
    if (isset($user->status) && $user->status === 'deactivated') {
        return response()->json(['message' => 'Your account has been deactivated. Please contact support.'], 403);
    }
    
    // ... rest of login code ...
}
```

### 2. Update Activity on Each Request (Middleware)

**Create:** `backend/app/Http/Middleware/UpdateActivityMiddleware.php`

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UpdateActivityMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            Auth::user()->update([
                'last_activity_at' => now()
            ]);
        }
        
        return $next($request);
    }
}
```

**Register in:** `backend/app/Http/Kernel.php` or `bootstrap/app.php` (Laravel 11)

### 3. Calculate Inactivity Days

**In Admin Tables:**

```javascript
// Frontend - Calculate inactivity
const getInactivityDays = (lastActivity) => {
  if (!lastActivity) return 'Never';
  
  const lastActivityDate = new Date(lastActivity);
  const now = new Date();
  const diffTime = Math.abs(now - lastActivityDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Display in table
<TableCell>
  {getInactivityDays(customer.last_activity_at)} days ago
</TableCell>
```

### 4. Update Backend to Include Activity Data

**In `AuthController.php` `getCustomers()` method:**

```php
return [
    'userID' => $user->userID,
    'userName' => $user->userName,
    'userEmail' => $user->userEmail,
    'status' => $user->status, // 'active' or 'deactivated'
    'last_activity_at' => $user->last_activity_at,
    'last_login_at' => $user->last_login_at,
    'inactivity_days' => $user->last_activity_at ? 
        now()->diffInDays($user->last_activity_at) : null,
    // ... other fields
];
```

## Display in Admin Tables

### Add Status Column

**In `CustomerTable.jsx` and `ArtisanTable.jsx`:**

```jsx
// Add new column header
<TableHead>Status</TableHead>

// Add cell content
<TableCell>
  <div className="flex flex-col">
    <Badge 
      variant={customer.status === 'deactivated' ? 'destructive' : 'default'}
      className="mb-1"
    >
      {customer.status === 'deactivated' ? 'Deactivated' : 'Active'}
    </Badge>
    <span className="text-xs text-gray-500">
      Last seen: {getInactivityDays(customer.last_activity_at)} days ago
    </span>
  </div>
</TableCell>
```

## Rules

- **status = 'active' + inactive 30+ days** → User can still log in, just hasn't recently
- **status = 'deactivated'** → User cannot log in at all
- **status = 'deactivated' + inactive 90+ days** → Deactivated user who hasn't been active in 90 days

## Use Cases

1. **Find Dormant Customers**: Query users where `status = 'active'` AND `last_activity_at < 90 days ago`
2. **Show Account Activity**: Display "Last active: 5 days ago"
3. **Analytics**: Track user engagement over time
4. **Auto-Deactivation**: Optionally auto-deactivate users inactive > 1 year

## Migration

Since your users table already exists, run:

```bash
php artisan migrate
```

This will add the new columns to your existing table.

## Summary

- `status` (active/deactivated) = Admin control, blocks login
- `last_activity_at` = Tracks when user last did something
- `last_login_at` = Tracks when user last logged in
- Both work together to give you complete account management
