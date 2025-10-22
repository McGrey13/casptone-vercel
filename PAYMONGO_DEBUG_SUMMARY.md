# PayMongo Payment Debugging Guide

## Recent Fixes Applied

### 1. Enhanced Error Logging
Added detailed logging to `PaymentController.php`:
- Logs PayMongo API response
- Logs source creation data
- Logs specific errors from PayMongo
- Catches and logs exceptions

### 2. Better Error Messages
Now returns:
- Actual PayMongo error messages
- Debug response data
- Detailed exception messages

## How to Debug the Current Issue

### Step 1: Clear Config Cache
Already done:
```bash
php artisan config:clear
```

### Step 2: Verify PayMongo Configuration
Check your `.env` file has:
```env
PAYMONGO_SECRET_KEY=sk_test_your_actual_key_here
FRONTEND_URL=http://localhost:5173
```

### Step 3: Try Payment Again
1. Add items to cart
2. Go to checkout
3. Select GCash or PayMaya
4. Click "Place Order"

### Step 4: Check Logs for Detailed Error
After the error occurs, check:
```bash
cd backend
Get-Content storage/logs/laravel.log -Tail 100
```

Look for entries labeled:
- "PayMongo Source API Response"
- "PayMongo Source Creation Failed"  
- "PayMongo Source Creation Exception"

## Common PayMongo Errors

### 1. Invalid API Key
**Error**: `Invalid authentication credentials`
**Fix**: Check your `PAYMONGO_SECRET_KEY` in `.env`

### 2. Amount Too Small
**Error**: `Amount must be at least 10000 centavos (100 PHP)`
**Fix**: Ensure cart total is at least ₱100

### 3. Invalid Billing Info
**Error**: `Invalid billing information`
**Fix**: Ensure user has valid phone number and email

### 4. Test Mode Limitations
**Error**: Source type not available
**Fix**: Use PayMongo test account, not live account

## Test PayMongo Configuration

### Quick Test
Try this in Laravel Tinker:
```php
php artisan tinker
```

Then run:
```php
$curl = \Ixudra\Curl\Facades\Curl::to('https://api.paymongo.com/v1/sources')
    ->withHeaders([
        'Content-Type: application/json',
        'Accept: application/json',
        'Authorization: Basic ' . base64_encode(env('PAYMONGO_SECRET_KEY') . ':')
    ])
    ->withData([
        "data" => [
            "attributes" => [
                "amount" => 10000,
                "currency" => "PHP",
                "type" => "gcash",
                "redirect" => [
                    "success" => "http://localhost:8000/api/payment/success",
                    "failed" => "http://localhost:8000/api/payment/failed"
                ]
            ]
        ]
    ])
    ->asJson()
    ->post();
    
print_r($curl);
```

### Expected Response
Should see:
```json
{
  "data": {
    "id": "src_xxx",
    "attributes": {
      "status": "pending",
      "redirect": {
        "checkout_url": "https://..."
      }
    }
  }
}
```

## Next Steps

1. **Try the payment again** - The enhanced logging is now active
2. **Check the error response** - Should show actual PayMongo error
3. **Share the error** - Look for the detailed error in:
   - Browser console (should show more details now)
   - Laravel logs (check storage/logs/laravel.log)

## Frontend Error Format

With the new changes, frontend should receive:
```json
{
  "success": false,
  "message": "Actual PayMongo error message or exception",
  "debug_response": { /* full PayMongo response */ }
}
```

## Troubleshooting Checklist

- [ ] PAYMONGO_SECRET_KEY is set in .env
- [ ] Config cache cleared (`php artisan config:clear`)
- [ ] Cart total is at least ₱100 (10000 centavos)
- [ ] User has valid email and phone number
- [ ] Using test secret key (starts with `sk_test_`)
- [ ] PayMongo account is in test mode
- [ ] Internet connection is working

## Contact PayMongo Support

If error persists:
1. Check PayMongo Dashboard: https://dashboard.paymongo.com/
2. View API logs in PayMongo dashboard
3. Contact PayMongo support with error details

