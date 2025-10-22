<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Development Environment Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains development-specific configurations that disable
    | SSL enforcement and security features for local development.
    |
    */

    'security' => [
        'force_https' => false,
        'secure_cookies' => false,
        'session_encryption' => false,
        'session_lifetime' => 120,
        'session_regeneration' => false,
    ],

    'headers' => [
        'hsts' => false,
        'hsts_max_age' => 0,
        'hsts_include_subdomains' => false,
        'hsts_preload' => false,
        'csp_enabled' => false,
        'x_frame_options' => 'SAMEORIGIN',
        'x_content_type_options' => 'nosniff',
        'x_xss_protection' => '1; mode=block',
        'referrer_policy' => 'strict-origin-when-cross-origin',
    ],

    'ssl' => [
        'verify_peer' => false,
        'verify_peer_name' => false,
        'allow_self_signed' => true,
    ],

    'cors' => [
        'allowed_origins' => [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            'http://localhost:8000',
            'http://127.0.0.1:8000',
        ],
        'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        'allowed_headers' => ['*'],
        'exposed_headers' => [],
        'max_age' => 0,
        'supports_credentials' => true,
    ],

    'session' => [
        'driver' => 'file',
        'lifetime' => 120,
        'expire_on_close' => false,
        'encrypt' => false,
        'files' => storage_path('framework/sessions'),
        'connection' => null,
        'table' => 'sessions',
        'store' => null,
        'lottery' => [2, 100],
        'cookie' => 'craftconnect_session',
        'path' => '/',
        'domain' => null,
        'secure' => false,
        'http_only' => true,
        'same_site' => 'lax',
        'partitioned' => false,
    ],

    'logging' => [
        'level' => 'debug',
        'channel' => 'stack',
        'security_events' => false,
        'failed_logins' => false,
        'suspicious_activity' => false,
    ],

    'monitoring' => [
        'performance_monitoring' => false,
        'error_tracking' => false,
        'security_monitoring' => false,
        'uptime_monitoring' => false,
    ],
];
