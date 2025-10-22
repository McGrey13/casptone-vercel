# SSL Certificate Setup Guide for CraftConnect

This guide provides instructions for setting up SSL certificates for production deployment.

## 1. SSL Certificate Options

### Option A: Let's Encrypt (Free, Recommended for Production)

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-apache

# For Apache
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com

# For Nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Option B: Self-Signed Certificates (Development/Testing)

```bash
# Generate private key
openssl genrsa -out craftconnect.key 2048

# Generate certificate signing request
openssl req -new -key craftconnect.key -out craftconnect.csr

# Generate self-signed certificate
openssl x509 -req -days 365 -in craftconnect.csr -signkey craftconnect.key -out craftconnect.crt
```

### Option C: Commercial SSL Certificate

Purchase from providers like:
- DigiCert
- Comodo/Sectigo
- GoDaddy
- Namecheap

## 2. Apache Configuration

Create or update your Apache virtual host configuration:

```apache
<VirtualHost *:443>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    DocumentRoot /path/to/your/project/backend/public
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/your/certificate.crt
    SSLCertificateKeyFile /path/to/your/private.key
    SSLCertificateChainFile /path/to/your/chain.crt
    
    # Security Headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "DENY"
    Header always set X-XSS-Protection "1; mode=block"
    
    # Laravel Configuration
    <Directory /path/to/your/project/backend/public>
        AllowOverride All
        Require all granted
    </Directory>
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/craftconnect_error.log
    CustomLog ${APACHE_LOG_DIR}/craftconnect_access.log combined
</VirtualHost>

# HTTP to HTTPS redirect
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    Redirect permanent / https://yourdomain.com/
</VirtualHost>
```

## 3. Nginx Configuration

```nginx
# HTTPS server block
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    root /path/to/your/project/backend/public;
    index index.php;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_trusted_certificate /path/to/your/chain.crt;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Laravel Configuration
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## 4. Environment Configuration

Update your `.env` file with HTTPS settings:

```env
APP_ENV=production
APP_URL=https://yourdomain.com
FORCE_HTTPS=true
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_ENCRYPT=true
```

## 5. SSL Certificate Renewal (Let's Encrypt)

```bash
# Test renewal
sudo certbot renew --dry-run

# Set up automatic renewal
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 6. Security Testing

After setup, test your SSL configuration:

```bash
# Test SSL configuration
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Online SSL testing tools:
# - https://www.ssllabs.com/ssltest/
# - https://securityheaders.com/
```

## 7. Troubleshooting

### Common Issues:

1. **Mixed Content Warnings**: Ensure all resources use HTTPS
2. **Certificate Chain Issues**: Include intermediate certificates
3. **HSTS Preload**: Submit your domain to HSTS preload list
4. **CORS Issues**: Update allowed origins to use HTTPS

### Useful Commands:

```bash
# Check certificate details
openssl x509 -in certificate.crt -text -noout

# Verify certificate chain
openssl verify -CAfile ca-bundle.crt certificate.crt

# Test SSL connection
curl -I https://yourdomain.com
```

## 8. Production Checklist

- [ ] SSL certificate installed and working
- [ ] HTTP to HTTPS redirect configured
- [ ] Security headers implemented
- [ ] HSTS enabled
- [ ] Session cookies secured
- [ ] CORS configured for HTTPS
- [ ] Certificate auto-renewal set up
- [ ] SSL configuration tested
- [ ] Mixed content issues resolved
- [ ] CDN configured for HTTPS (if applicable)
