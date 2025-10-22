#!/bin/bash

# CraftConnect Production Deployment Script
# This script sets up the application for production deployment with HTTPS

set -e

echo "🚀 Starting CraftConnect Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please do not run this script as root"
    exit 1
fi

# Get domain name
read -p "Enter your domain name (e.g., yourdomain.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    print_error "Domain name is required!"
    exit 1
fi

print_status "Setting up production environment for domain: $DOMAIN"

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y nginx php8.2-fpm php8.2-mysql php8.2-xml php8.2-curl php8.2-zip php8.2-mbstring php8.2-gd php8.2-redis redis-server mysql-server certbot python3-certbot-nginx

# Install Composer if not present
if ! command -v composer &> /dev/null; then
    print_status "Installing Composer..."
    curl -sS https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer
fi

# Install Node.js and npm if not present
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Create application directory
APP_DIR="/var/www/craftconnect"
print_status "Creating application directory: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Copy application files (assuming current directory is the project)
print_status "Copying application files..."
cp -r . $APP_DIR/
cd $APP_DIR

# Install PHP dependencies
print_status "Installing PHP dependencies..."
composer install --optimize-autoloader --no-dev

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm install

# Build frontend assets
print_status "Building frontend assets..."
npm run build

# Set up environment file
print_status "Setting up environment configuration..."
cp .env.example .env

# Generate application key
print_status "Generating application key..."
php artisan key:generate

# Configure environment for production
print_status "Configuring environment for production..."
sed -i "s|APP_URL=http://localhost|APP_URL=https://$DOMAIN|g" .env
sed -i "s|APP_ENV=local|APP_ENV=production|g" .env
sed -i "s|APP_DEBUG=true|APP_DEBUG=false|g" .env
sed -i "s|FORCE_HTTPS=false|FORCE_HTTPS=true|g" .env
sed -i "s|SESSION_SECURE_COOKIE=false|SESSION_SECURE_COOKIE=true|g" .env
sed -i "s|SESSION_HTTP_ONLY=false|SESSION_HTTP_ONLY=true|g" .env
sed -i "s|SESSION_ENCRYPT=false|SESSION_ENCRYPT=true|g" .env

# Set up database
print_status "Setting up database..."
read -p "Enter MySQL root password: " -s MYSQL_ROOT_PASSWORD
echo

# Create database and user
mysql -u root -p$MYSQL_ROOT_PASSWORD << EOF
CREATE DATABASE IF NOT EXISTS craftconnect;
CREATE USER IF NOT EXISTS 'craftconnect'@'localhost' IDENTIFIED BY '$(openssl rand -base64 32)';
GRANT ALL PRIVILEGES ON craftconnect.* TO 'craftconnect'@'localhost';
FLUSH PRIVILEGES;
EOF

# Update database configuration in .env
DB_PASSWORD=$(mysql -u root -p$MYSQL_ROOT_PASSWORD -e "SELECT authentication_string FROM mysql.user WHERE User='craftconnect';" -s)
sed -i "s|DB_PASSWORD=|DB_PASSWORD=$DB_PASSWORD|g" .env

# Run database migrations
print_status "Running database migrations..."
php artisan migrate --force

# Set up file permissions
print_status "Setting up file permissions..."
sudo chown -R www-data:www-data $APP_DIR
sudo chmod -R 755 $APP_DIR
sudo chmod -R 775 $APP_DIR/storage
sudo chmod -R 775 $APP_DIR/bootstrap/cache

# Configure Nginx
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/craftconnect > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    root $APP_DIR/backend/public;
    index index.php;

    # SSL Configuration (will be updated by Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Laravel Configuration
    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }

    # Serve frontend assets
    location /assets/ {
        alias $APP_DIR/frontend/dist/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/craftconnect /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

# Start services
print_status "Starting services..."
sudo systemctl enable nginx php8.2-fpm redis-server mysql
sudo systemctl restart nginx php8.2-fpm redis-server mysql

# Install SSL certificate
print_status "Installing SSL certificate..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Set up automatic SSL renewal
print_status "Setting up automatic SSL renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Set up Laravel queue worker
print_status "Setting up Laravel queue worker..."
sudo tee /etc/systemd/system/craftconnect-queue.service > /dev/null << EOF
[Unit]
Description=CraftConnect Queue Worker
After=network.target

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php $APP_DIR/backend/artisan queue:work --verbose --tries=3 --timeout=90
WorkingDirectory=$APP_DIR/backend

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable craftconnect-queue
sudo systemctl start craftconnect-queue

# Set up Laravel scheduler
print_status "Setting up Laravel scheduler..."
(crontab -l 2>/dev/null; echo "* * * * * cd $APP_DIR/backend && php artisan schedule:run >> /dev/null 2>&1") | crontab -

# Configure Redis for sessions
print_status "Configuring Redis..."
sudo sed -i 's/# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf
sudo sed -i 's/# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
sudo systemctl restart redis-server

# Update session configuration to use Redis
sed -i 's|SESSION_DRIVER=file|SESSION_DRIVER=redis|g' .env
sed -i 's|CACHE_STORE=file|CACHE_STORE=redis|g' .env
sed -i 's|QUEUE_CONNECTION=sync|QUEUE_CONNECTION=redis|g' .env

# Clear and cache configurations
print_status "Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Test the deployment
print_status "Testing deployment..."
if curl -f -s https://$DOMAIN > /dev/null; then
    print_status "✅ Deployment successful! Your application is now available at https://$DOMAIN"
else
    print_warning "⚠️  Deployment completed but HTTPS test failed. Please check SSL certificate installation."
fi

print_status "🎉 Production deployment completed!"
print_status "📋 Next steps:"
echo "  1. Update your DNS records to point to this server"
echo "  2. Test all functionality on https://$DOMAIN"
echo "  3. Set up monitoring and backups"
echo "  4. Review the SSL_SETUP_GUIDE.md for additional security configurations"

print_status "📁 Application files are located at: $APP_DIR"
print_status "🔧 Log files:"
echo "  - Nginx: /var/log/nginx/"
echo "  - PHP-FPM: /var/log/php8.2-fpm.log"
echo "  - Laravel: $APP_DIR/backend/storage/logs/"
echo "  - Queue Worker: journalctl -u craftconnect-queue"
