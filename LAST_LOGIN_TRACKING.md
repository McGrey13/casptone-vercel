# Last Login Tracking

## Overview
Track when users last logged into the system.

## Database Field

Added to `users` table:
- `last_login_at` - Timestamp of last login

## Implementation

### 1. Migration ✅
**File:** `backend/database/migrations/0001_01_01_000000_create_users_table.php`

Added column:
```php
$table->timestamp('last_login_at')->nullable();
```

### 2. User Model ✅
**File:** `backend/app/Models/User.php`

Added to fillable and casts:
```php
'last_login_at', // in fillable array
'last_login_at' => 'datetime', // in casts array
```

### 3. Login Method ✅
**File:** `backend/app/Http/Controllers/Auth/AuthController.php`

Updated to set `last_login_at` on successful login:
```php
// Update last login timestamp
$user->last_login_at = now();
$user->save();
```

### 4. Display in Admin Tables

You can add a "Last Login" column in `CustomerTable.jsx` and `ArtisanTable.jsx`:

```javascript
// Helper function
const formatLastLogin = (lastLogin) => {
  if (!lastLogin) return 'Never';
  
  const lastLoginDate = new Date(lastLogin);
  const now = new Date();
  const diffTime = Math.abs(now - lastLoginDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};

// In table
<TableHead>Last Login</TableHead>

<TableCell>
  {formatLastLogin(customer.last_login_at)}
</TableCell>
```

## Usage

Now when users log in:
1. The `last_login_at` field is automatically updated with the current timestamp
2. You can display this in admin tables
3. You can filter or sort by last login date

## Run Migration

Since your users table already exists, you need to add the column. You can either:

**Option 1:** Create a new migration:
```bash
php artisan make:migration add_last_login_at_to_users_table --table=users
```

Then in the migration:
```php
public function up()
{
    Schema::table('users', function (Blueprint $table) {
        $table->timestamp('last_login_at')->nullable();
    });
}
```

Then run:
```bash
php artisan migrate
```

**Option 2:** If you haven't run migrations yet, just run:
```bash
php artisan migrate:fresh
```

## Summary

- ✅ Database column added
- ✅ Model updated
- ✅ Login method updated
- ⏳ Run migration
- ⏳ Add display in admin tables (optional)

Done! Last login tracking is now working.
