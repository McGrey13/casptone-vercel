# PowerShell script to update .env file with HTTPS and session security settings
# Run this script from the backend directory

Write-Host "🔧 Updating .env file with HTTPS and session security settings..." -ForegroundColor Green
    
# Read the current .env file
$envPath = ".\.env"
$envContent = Get-Content $envPath -Raw

# Security settings to add/update
$securitySettings = @"
# HTTPS and Session Security Configuration
# Added by CraftConnect Security Setup

# HTTPS Configuration
FORCE_HTTPS=false
SECURE_SSL_REDIRECT=false

# Session Security
SESSION_ENCRYPT=true
SESSION_SECURE_COOKIE=false
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax
SESSION_LIFETIME=60
SESSION_EXPIRE_ON_CLOSE=false

# Session Regeneration
SESSION_REGENERATION=true
SESSION_REGENERATION_INTERVAL=600

# Security Headers
HSTS_ENABLED=false
HSTS_MAX_AGE=31536000
HSTS_INCLUDE_SUBDOMAINS=true
HSTS_PRELOAD=true
CSP_ENABLED=true
X_FRAME_OPTIONS=DENY
X_CONTENT_TYPE_OPTIONS=nosniff
X_XSS_PROTECTION=1; mode=block
REFERRER_POLICY=strict-origin-when-cross-origin

# CORS Configuration (Local Development)
CORS_ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000,https://localhost:5173,https://localhost:3000"

# Vite Configuration
VITE_BACKEND_URL="http://localhost:8000/api"

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS="localhost,127.0.0.1"

# End of Security Configuration
"@

# Check if security settings already exist
if ($envContent -match "# HTTPS and Session Security Configuration") {
    Write-Host "⚠️  Security settings already exist in .env file" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite existing security settings? (y/n)"
    if ($overwrite -eq "y" -or $overwrite -eq "Y") {
        # Remove existing security section
        $envContent = $envContent -replace "(?s)# HTTPS and Session Security Configuration.*?# End of Security Configuration\s*\n?", ""
        Write-Host "✅ Removed existing security settings" -ForegroundColor Green
    } else {
        Write-Host "❌ Cancelled. No changes made." -ForegroundColor Red
        exit 0
    }
}

# Append security settings to .env file
Add-Content -Path $envPath -Value "`n$securitySettings"

Write-Host "✅ Successfully added HTTPS and session security settings to .env file" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Run: php artisan config:clear" -ForegroundColor White
Write-Host "   2. Run: php artisan config:cache" -ForegroundColor White
Write-Host "   3. Restart your Laravel server" -ForegroundColor White
Write-Host "   4. Test the security features" -ForegroundColor White
