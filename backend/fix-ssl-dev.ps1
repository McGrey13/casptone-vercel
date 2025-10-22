# PowerShell script to fix SSL issues for development environment

Write-Host "Fixing SSL issues for development environment..." -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host ".env file not found. Creating from .env.example..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
    } else {
        Write-Host "Creating basic .env file..." -ForegroundColor Yellow
        $envContent = @"
APP_NAME=CraftConnect
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=craftconnect_dev
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_SECURE_COOKIE=false
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax

FORCE_HTTPS=false
HSTS_ENABLED=false
CSP_ENABLED=false

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1
"@
        Set-Content -Path ".env" -Value $envContent
    }
}

# Update .env file to ensure development settings
Write-Host "Updating .env file for development..." -ForegroundColor Yellow

$envContent = Get-Content ".env"
$envContent = $envContent -replace 'APP_ENV=production', 'APP_ENV=local'
$envContent = $envContent -replace 'APP_URL=https://', 'APP_URL=http://'
$envContent = $envContent -replace 'FORCE_HTTPS=true', 'FORCE_HTTPS=false'
$envContent = $envContent -replace 'SESSION_SECURE_COOKIE=true', 'SESSION_SECURE_COOKIE=false'
$envContent = $envContent -replace 'SESSION_ENCRYPT=true', 'SESSION_ENCRYPT=false'
$envContent = $envContent -replace 'HSTS_ENABLED=true', 'HSTS_ENABLED=false'
$envContent = $envContent -replace 'CSP_ENABLED=true', 'CSP_ENABLED=false'

Set-Content -Path ".env" -Value $envContent

# Generate app key if not set
Write-Host "Generating application key..." -ForegroundColor Yellow
php artisan key:generate --force

# Clear caches
Write-Host "Clearing caches..." -ForegroundColor Yellow
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

Write-Host ""
Write-Host "SSL fix completed! Your application should now work in development mode." -ForegroundColor Green
Write-Host ""
Write-Host "If you're still having issues, make sure:" -ForegroundColor Cyan
Write-Host "1. Your APP_ENV is set to 'local' in .env" -ForegroundColor White
Write-Host "2. Your APP_URL uses http:// not https://" -ForegroundColor White
Write-Host "3. All SSL-related settings are disabled for development" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
