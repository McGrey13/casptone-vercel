@echo off
echo Creating clean .env file with security settings...

copy .env .env.backup

(
echo APP_NAME=CraftConnect
echo APP_ENV=local
echo APP_KEY=base64:SZeHR4aNieGVolwN0zqRs0+Qg6GkGAwUWJlukeozy9Y=
echo APP_DEBUG=true
echo APP_URL=http://localhost:8000
echo.
echo APP_LOCALE=en
echo APP_FALLBACK_LOCALE=en
echo APP_FAKER_LOCALE=en_US
echo.
echo APP_MAINTENANCE_DRIVER=file
echo.
echo PHP_CLI_SERVER_WORKERS=4
echo.
echo BCRYPT_ROUNDS=12
echo.
echo LOG_CHANNEL=stack
echo LOG_STACK=single
echo LOG_DEPRECATIONS_CHANNEL=null
echo LOG_LEVEL=debug
echo.
echo DB_CONNECTION=mysql
echo DB_HOST=127.0.0.1
echo DB_PORT=3306
echo DB_DATABASE=backend
echo DB_USERNAME=root
echo DB_PASSWORD=
echo.
echo SESSION_DRIVER=database
echo SESSION_LIFETIME=60
echo SESSION_ENCRYPT=true
echo SESSION_SECURE_COOKIE=false
echo SESSION_HTTP_ONLY=true
echo SESSION_SAME_SITE=lax
echo SESSION_PATH=/
echo SESSION_DOMAIN=null
echo.
echo BROADCAST_CONNECTION=log
echo FILESYSTEM_DISK=local
echo QUEUE_CONNECTION=database
echo.
echo CACHE_STORE=database
echo.
echo MEMCACHED_HOST=127.0.0.1
echo.
echo REDIS_CLIENT=phpredis
echo REDIS_HOST=127.0.0.1
echo REDIS_PASSWORD=null
echo REDIS_PORT=6379
echo.
echo MAIL_MAILER=log
echo MAIL_SCHEME=null
echo MAIL_HOST=127.0.0.1
echo MAIL_PORT=2525
echo MAIL_USERNAME=null
echo MAIL_PASSWORD=null
echo MAIL_FROM_ADDRESS="hello@example.com"
echo MAIL_FROM_NAME="${APP_NAME}"
echo.
echo AWS_ACCESS_KEY_ID=
echo AWS_SECRET_ACCESS_KEY=
echo AWS_DEFAULT_REGION=us-east-1
echo AWS_BUCKET=
echo AWS_USE_PATH_STYLE_ENDPOINT=false
echo.
echo VITE_APP_NAME="${APP_NAME}"
echo VITE_BACKEND_URL=http://localhost:8000/api
echo.
echo PAYMONGO_PUBLIC_KEY=
echo PAYMONGO_SECRET_KEY=
echo.
echo # Security Configuration
echo FORCE_HTTPS=false
echo CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
echo SESSION_REGENERATION=true
echo SESSION_REGENERATION_INTERVAL=600
) > .env

echo.
echo Clean .env file created with security settings!
echo.
echo Next steps:
echo 1. Run: php artisan config:clear
echo 2. Run: php artisan config:cache
echo 3. Test your application
echo.
pause
