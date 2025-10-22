<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Security Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains security-related configurations for the application.
    | These settings help protect against various security vulnerabilities.
    |
    */

    'https' => [
        'force' => env('FORCE_HTTPS', false),
        'redirect' => env('SECURE_SSL_REDIRECT', false),
        'hsts' => [
            'enabled' => env('HSTS_ENABLED', true),
            'max_age' => env('HSTS_MAX_AGE', 31536000),
            'include_subdomains' => env('HSTS_INCLUDE_SUBDOMAINS', true),
            'preload' => env('HSTS_PRELOAD', true),
        ],
    ],

    'session' => [
        'encryption' => env('SESSION_ENCRYPT', true),
        'secure_cookie' => env('SESSION_SECURE_COOKIE', true),
        'http_only' => env('SESSION_HTTP_ONLY', true),
        'same_site' => env('SESSION_SAME_SITE', 'lax'),
        'lifetime' => env('SESSION_LIFETIME', 60),
        'regeneration_interval' => env('SESSION_REGENERATION_INTERVAL', 600), // 10 minutes
        'expire_on_close' => env('SESSION_EXPIRE_ON_CLOSE', false),
        'timeout_warning' => env('SESSION_TIMEOUT_WARNING', 300), // 5 minutes before expiry
    ],

    'cookies' => [
        'encryption' => env('COOKIE_ENCRYPTION', true),
        'secure' => env('COOKIE_SECURE', true),
        'http_only' => env('COOKIE_HTTP_ONLY', true),
        'same_site' => env('COOKIE_SAME_SITE', 'lax'),
        'csrf_token_lifetime' => env('CSRF_TOKEN_LIFETIME', 120),
    ],

    'headers' => [
        'content_security_policy' => [
            'enabled' => env('CSP_ENABLED', true),
            'policy' => [
                'default-src' => "'self'",
                'script-src' => "'self' 'unsafe-inline' 'unsafe-eval'",
                'style-src' => "'self' 'unsafe-inline'",
                'img-src' => "'self' data: https:",
                'font-src' => "'self' data:",
                'connect-src' => "'self' https:",
                'frame-ancestors' => "'none'",
                'base-uri' => "'self'",
                'form-action' => "'self'",
            ],
        ],
        'x_frame_options' => env('X_FRAME_OPTIONS', 'DENY'),
        'x_content_type_options' => env('X_CONTENT_TYPE_OPTIONS', 'nosniff'),
        'x_xss_protection' => env('X_XSS_PROTECTION', '1; mode=block'),
        'referrer_policy' => env('REFERRER_POLICY', 'strict-origin-when-cross-origin'),
        'permissions_policy' => [
            'camera' => '()',
            'microphone' => '()',
            'geolocation' => '()',
            'payment' => '()',
            'usb' => '()',
        ],
    ],

    'cors' => [
        'allowed_origins' => array_filter(explode(',', env('CORS_ALLOWED_ORIGINS', ''))),
        'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        'allowed_headers' => ['*'],
        'exposed_headers' => [],
        'max_age' => env('CORS_MAX_AGE', 86400),
        'supports_credentials' => env('CORS_SUPPORTS_CREDENTIALS', true),
    ],

    'rate_limiting' => [
        'enabled' => env('RATE_LIMITING_ENABLED', true),
        'api_requests' => env('API_RATE_LIMIT', 60), // requests per minute
        'login_attempts' => env('LOGIN_RATE_LIMIT', 5), // attempts per minute
        'password_reset' => env('PASSWORD_RESET_RATE_LIMIT', 3), // attempts per hour
        'registration' => env('REGISTRATION_RATE_LIMIT', 3), // attempts per hour
    ],

    'authentication' => [
        'password_min_length' => env('PASSWORD_MIN_LENGTH', 8),
        'password_require_uppercase' => env('PASSWORD_REQUIRE_UPPERCASE', true),
        'password_require_lowercase' => env('PASSWORD_REQUIRE_LOWERCASE', true),
        'password_require_numbers' => env('PASSWORD_REQUIRE_NUMBERS', true),
        'password_require_symbols' => env('PASSWORD_REQUIRE_SYMBOLS', true),
        'max_login_attempts' => env('MAX_LOGIN_ATTEMPTS', 5),
        'lockout_duration' => env('LOCKOUT_DURATION', 900), // 15 minutes
        'session_timeout' => env('SESSION_TIMEOUT', 3600), // 1 hour
        'remember_token_lifetime' => env('REMEMBER_TOKEN_LIFETIME', 86400), // 24 hours
    ],

    'encryption' => [
        'algorithm' => env('ENCRYPTION_ALGORITHM', 'AES-256-CBC'),
        'key_rotation' => env('ENCRYPTION_KEY_ROTATION', false),
        'key_rotation_interval' => env('ENCRYPTION_KEY_ROTATION_INTERVAL', 2592000), // 30 days
    ],

    'file_upload' => [
        'max_file_size' => env('MAX_FILE_SIZE', 10240), // 10MB
        'allowed_extensions' => ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
        'allowed_mime_types' => [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        'scan_uploads' => env('SCAN_UPLOADS', true),
        'quarantine_suspicious' => env('QUARANTINE_SUSPICIOUS', true),
    ],

    'logging' => [
        'security_events' => env('LOG_SECURITY_EVENTS', true),
        'failed_logins' => env('LOG_FAILED_LOGINS', true),
        'suspicious_activity' => env('LOG_SUSPICIOUS_ACTIVITY', true),
        'admin_actions' => env('LOG_ADMIN_ACTIONS', true),
        'data_access' => env('LOG_DATA_ACCESS', true),
        'retention_days' => env('SECURITY_LOG_RETENTION_DAYS', 90),
    ],

    'monitoring' => [
        'intrusion_detection' => env('INTRUSION_DETECTION', true),
        'brute_force_protection' => env('BRUTE_FORCE_PROTECTION', true),
        'anomaly_detection' => env('ANOMALY_DETECTION', true),
        'real_time_monitoring' => env('REAL_TIME_MONITORING', true),
        'alert_threshold' => env('SECURITY_ALERT_THRESHOLD', 5),
    ],

    'backup' => [
        'encrypted' => env('BACKUP_ENCRYPTED', true),
        'retention_days' => env('BACKUP_RETENTION_DAYS', 30),
        'verify_integrity' => env('BACKUP_VERIFY_INTEGRITY', true),
        'offsite_storage' => env('BACKUP_OFFSITE_STORAGE', true),
    ],

    'compliance' => [
        'gdpr_compliant' => env('GDPR_COMPLIANT', true),
        'data_retention_policy' => env('DATA_RETENTION_POLICY', true),
        'audit_trail' => env('AUDIT_TRAIL', true),
        'data_encryption_at_rest' => env('DATA_ENCRYPTION_AT_REST', true),
        'data_encryption_in_transit' => env('DATA_ENCRYPTION_IN_TRANSIT', true),
    ],
];
