# PowerShell script to create a clean .env file
Write-Host "Creating clean .env file with security settings..." -ForegroundColor Green

$envContent = @"
APP_NAME=CraftConnect
APP_ENV=local
APP_KEY=base64:SZeHR4aNieGVolwN0zqRs0+Qg6GkGAwUWJlukeozy9Y=
APP_DEBUG=true
APP_URL=http://localhost:8000

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file

PHP_CLI_SERVER_WORKERS=4

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=backend
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
SESSION_LIFETIME=60
SESSION_ENCRYPT=true
SESSION_SECURE_COOKIE=false
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="`${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="`${APP_NAME}"
VITE_BACKEND_URL=http://localhost:8000/api

PAYMONGO_PUBLIC_KEY=
PAYMONGO_SECRET_KEY=

# Security Configuration
FORCE_HTTPS=false
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
SESSION_REGENERATION=true
SESSION_REGENERATION_INTERVAL=600
"@

# Backup current .env file
Copy-Item .env .env.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')

# Write new .env file
$envContent | Out-File -FilePath .env -Encoding UTF8

Write-Host "✅ Clean .env file created with security settings!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Run: php artisan config:clear" -ForegroundColor White
Write-Host "   2. Run: php artisan config:cache" -ForegroundColor White
Write-Host "   3. Test your application" -ForegroundColor White
