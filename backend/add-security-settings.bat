@echo off
echo Adding security settings to .env file...

echo. >> .env
echo # Security Configuration >> .env
echo SESSION_ENCRYPT=true >> .env
echo SESSION_SECURE_COOKIE=false >> .env
echo SESSION_HTTP_ONLY=true >> .env
echo SESSION_LIFETIME=60 >> .env
echo FORCE_HTTPS=false >> .env
echo CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000 >> .env
echo VITE_BACKEND_URL=http://localhost:8000/api >> .env

echo Security settings added successfully!
echo Now run: php artisan config:clear
pause
