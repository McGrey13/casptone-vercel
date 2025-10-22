<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Production Environment Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains production-specific configurations for security,
    | performance, and reliability.
    |
    */

    'security' => [
        'force_https' => env('FORCE_HTTPS', true),
        'secure_cookies' => env('SESSION_SECURE_COOKIE', true),
        'session_encryption' => env('SESSION_ENCRYPT', true),
        'session_lifetime' => env('SESSION_LIFETIME', 60),
        'session_regeneration' => env('SESSION_REGENERATION', true),
    ],

    'headers' => [
        'hsts' => env('HSTS_ENABLED', true),
        'hsts_max_age' => env('HSTS_MAX_AGE', 31536000),
        'hsts_include_subdomains' => env('HSTS_INCLUDE_SUBDOMAINS', true),
        'hsts_preload' => env('HSTS_PRELOAD', true),
        'csp_enabled' => env('CSP_ENABLED', true),
        'x_frame_options' => env('X_FRAME_OPTIONS', 'DENY'),
        'x_content_type_options' => env('X_CONTENT_TYPE_OPTIONS', 'nosniff'),
        'x_xss_protection' => env('X_XSS_PROTECTION', '1; mode=block'),
        'referrer_policy' => env('REFERRER_POLICY', 'strict-origin-when-cross-origin'),
    ],

    'ssl' => [
        'certificate_path' => env('SSL_CERTIFICATE_PATH'),
        'private_key_path' => env('SSL_PRIVATE_KEY_PATH'),
        'chain_path' => env('SSL_CHAIN_PATH'),
        'verify_peer' => env('SSL_VERIFY_PEER', true),
        'verify_peer_name' => env('SSL_VERIFY_PEER_NAME', true),
        'allow_self_signed' => env('SSL_ALLOW_SELF_SIGNED', false),
    ],

    'cors' => [
        'allowed_origins' => [
            env('APP_URL'),
            'https://' . parse_url(env('APP_URL'), PHP_URL_HOST),
            'https://www.' . parse_url(env('APP_URL'), PHP_URL_HOST),
        ],
        'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        'allowed_headers' => ['*'],
        'exposed_headers' => [],
        'max_age' => 86400, // 24 hours
        'supports_credentials' => true,
    ],

    'session' => [
        'driver' => env('SESSION_DRIVER', 'database'),
        'lifetime' => env('SESSION_LIFETIME', 60),
        'expire_on_close' => env('SESSION_EXPIRE_ON_CLOSE', false),
        'encrypt' => env('SESSION_ENCRYPT', true),
        'files' => storage_path('framework/sessions'),
        'connection' => env('SESSION_CONNECTION'),
        'table' => env('SESSION_TABLE', 'sessions'),
        'store' => env('SESSION_STORE'),
        'lottery' => [2, 100],
        'cookie' => env('SESSION_COOKIE', 'craftconnect_session'),
        'path' => env('SESSION_PATH', '/'),
        'domain' => env('SESSION_DOMAIN'),
        'secure' => env('SESSION_SECURE_COOKIE', true),
        'http_only' => env('SESSION_HTTP_ONLY', true),
        'same_site' => env('SESSION_SAME_SITE', 'lax'),
        'partitioned' => env('SESSION_PARTITIONED_COOKIE', false),
    ],

    'logging' => [
        'level' => env('LOG_LEVEL', 'error'),
        'channel' => env('LOG_CHANNEL', 'stack'),
        'security_events' => env('LOG_SECURITY_EVENTS', true),
        'failed_logins' => env('LOG_FAILED_LOGINS', true),
        'suspicious_activity' => env('LOG_SUSPICIOUS_ACTIVITY', true),
    ],

    'monitoring' => [
        'performance_monitoring' => env('PERFORMANCE_MONITORING', true),
        'error_tracking' => env('ERROR_TRACKING', true),
        'security_monitoring' => env('SECURITY_MONITORING', true),
        'uptime_monitoring' => env('UPTIME_MONITORING', true),
    ],

    'cache' => [
        'driver' => env('CACHE_STORE', 'redis'),
        'prefix' => env('CACHE_PREFIX', 'craftconnect_prod'),
        'ttl' => env('CACHE_TTL', 3600),
        'session_cache' => env('SESSION_CACHE', true),
    ],

    'queue' => [
        'connection' => env('QUEUE_CONNECTION', 'redis'),
        'retry_after' => env('QUEUE_RETRY_AFTER', 90),
        'timeout' => env('QUEUE_TIMEOUT', 60),
        'max_tries' => env('QUEUE_MAX_TRIES', 3),
    ],
];
