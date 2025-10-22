@echo off
echo Fixing SSL issues for development environment...
echo.

REM Check if .env file exists
if not exist ".env" (
    echo .env file not found. Creating from .env.example...
    if exist ".env.example" (
        copy ".env.example" ".env"
    ) else (
        echo Creating basic .env file...
        echo APP_NAME=CraftConnect > .env
        echo APP_ENV=local >> .env
        echo APP_KEY= >> .env
        echo APP_DEBUG=true >> .env
        echo APP_URL=http://localhost:8000 >> .env
        echo. >> .env
        echo DB_CONNECTION=mysql >> .env
        echo DB_HOST=127.0.0.1 >> .env
        echo DB_PORT=3306 >> .env
        echo DB_DATABASE=craftconnect_dev >> .env
        echo DB_USERNAME=root >> .env
        echo DB_PASSWORD= >> .env
        echo. >> .env
        echo SESSION_DRIVER=file >> .env
        echo SESSION_LIFETIME=120 >> .env
        echo SESSION_ENCRYPT=false >> .env
        echo SESSION_SECURE_COOKIE=false >> .env
        echo SESSION_HTTP_ONLY=true >> .env
        echo SESSION_SAME_SITE=lax >> .env
        echo. >> .env
        echo FORCE_HTTPS=false >> .env
        echo HSTS_ENABLED=false >> .env
        echo CSP_ENABLED=false >> .env
        echo. >> .env
        echo CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173 >> .env
        echo SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1 >> .env
    )
)

REM Update .env file to ensure development settings
echo Updating .env file for development...
powershell -Command "(Get-Content .env) -replace 'APP_ENV=production', 'APP_ENV=local' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace 'APP_URL=https://', 'APP_URL=http://' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace 'FORCE_HTTPS=true', 'FORCE_HTTPS=false' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace 'SESSION_SECURE_COOKIE=true', 'SESSION_SECURE_COOKIE=false' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace 'SESSION_ENCRYPT=true', 'SESSION_ENCRYPT=false' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace 'HSTS_ENABLED=true', 'HSTS_ENABLED=false' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace 'CSP_ENABLED=true', 'CSP_ENABLED=false' | Set-Content .env"

REM Generate app key if not set
php artisan key:generate --force

REM Clear caches
echo Clearing caches...
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

echo.
echo SSL fix completed! Your application should now work in development mode.
echo.
echo If you're still having issues, make sure:
echo 1. Your APP_ENV is set to 'local' in .env
echo 2. Your APP_URL uses http:// not https://
echo 3. All SSL-related settings are disabled for development
echo.
pause
