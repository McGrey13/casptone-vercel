<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnhancedSecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Skip security headers in development for easier debugging
        if (env('APP_ENV') === 'local' || env('APP_ENV') === 'development') {
            return $this->addBasicHeaders($response);
        }

        return $this->addFullSecurityHeaders($response, $request);
    }

    /**
     * Add basic security headers for development
     */
    private function addBasicHeaders(Response $response): Response
    {
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        
        return $response;
    }

    /**
     * Add full security headers for production
     */
    private function addFullSecurityHeaders(Response $response, Request $request): Response
    {
        // Content Security Policy (configurable via env)
        if (env('CSP_ENABLED', false)) {
            $this->addContentSecurityPolicy($response);
        }

        // HSTS (HTTP Strict Transport Security) - configurable via env
        if (env('HSTS_ENABLED', false)) {
            $this->addHstsHeaders($response, $request);
        }

        // X-Frame-Options
        $this->addFrameOptions($response);

        // Other security headers
        $this->addOtherSecurityHeaders($response);

        // Permissions Policy (formerly Feature Policy)
        $this->addPermissionsPolicy($response);

        return $response;
    }

    /**
     * Add Content Security Policy
     */
    private function addContentSecurityPolicy(Response $response): void
    {
        $csp = $this->buildCspPolicy();
        $response->headers->set('Content-Security-Policy', $csp);
        
        // Report-only mode for testing (optional)
        if (env('CSP_REPORT_ONLY', false)) {
            $response->headers->set('Content-Security-Policy-Report-Only', $csp);
        }
    }

    /**
     * Build CSP policy based on environment
     */
    private function buildCspPolicy(): string
    {
        $baseUrl = env('APP_URL', 'http://localhost');
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        
        $allowedOrigins = [
            "'self'",
            $baseUrl,
            $frontendUrl,
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://cdn.jsdelivr.net',
            'https://unpkg.com',
        ];

        // Add Google OAuth domains if enabled
        if (env('GOOGLE_CLIENT_ID')) {
            $allowedOrigins[] = 'https://accounts.google.com';
            $allowedOrigins[] = 'https://www.googleapis.com';
        }

        $allowedOriginsString = implode(' ', array_unique($allowedOrigins));

        $cspDirectives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' {$allowedOriginsString}",
            "style-src 'self' 'unsafe-inline' {$allowedOriginsString}",
            "img-src 'self' data: blob: https:",
            "font-src 'self' {$allowedOriginsString}",
            "connect-src 'self' {$allowedOriginsString} wss: ws:",
            "media-src 'self' blob:",
            "object-src 'none'",
            "frame-src 'self' {$allowedOriginsString}",
            "frame-ancestors 'none'",
            "form-action 'self'",
            "base-uri 'self'",
            "manifest-src 'self'",
            "worker-src 'self' blob:",
            "child-src 'self' blob:",
        ];

        // Add report-uri if configured
        if (env('CSP_REPORT_URI')) {
            $cspDirectives[] = "report-uri " . env('CSP_REPORT_URI');
        }

        return implode('; ', $cspDirectives);
    }

    /**
     * Add HSTS headers
     */
    private function addHstsHeaders(Response $response, Request $request): void
    {
        if ($request->secure() || env('FORCE_HTTPS', false)) {
            $maxAge = env('HSTS_MAX_AGE', 31536000); // 1 year
            $includeSubdomains = env('HSTS_INCLUDE_SUBDOMAINS', true) ? '; includeSubDomains' : '';
            $preload = env('HSTS_PRELOAD', false) ? '; preload' : '';

            $response->headers->set('Strict-Transport-Security', "max-age={$maxAge}{$includeSubdomains}{$preload}");
        }
    }

    /**
     * Add X-Frame-Options
     */
    private function addFrameOptions(Response $response): void
    {
        $frameOptions = env('X_FRAME_OPTIONS', 'DENY');
        $response->headers->set('X-Frame-Options', $frameOptions);
    }

    /**
     * Add other security headers
     */
    private function addOtherSecurityHeaders(Response $response): void
    {
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', env('REFERRER_POLICY', 'strict-origin-when-cross-origin'));
        $response->headers->set('X-Download-Options', 'noopen');
        $response->headers->set('X-Permitted-Cross-Domain-Policies', 'none');
        $response->headers->set('Cross-Origin-Embedder-Policy', 'require-corp');
        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');
        $response->headers->set('Cross-Origin-Resource-Policy', 'same-origin');
        
        // Remove server information
        $response->headers->remove('Server');
        $response->headers->remove('X-Powered-By');
    }

    /**
     * Add Permissions Policy
     */
    private function addPermissionsPolicy(Response $response): void
    {
        $permissions = [
            'accelerometer' => "'none'",
            'ambient-light-sensor' => "'none'",
            'autoplay' => "'none'",
            'battery' => "'none'",
            'camera' => "'none'",
            'cross-origin-isolated' => "'none'",
            'display-capture' => "'none'",
            'document-domain' => "'none'",
            'encrypted-media' => "'none'",
            'execution-while-not-rendered' => "'none'",
            'execution-while-out-of-viewport' => "'none'",
            'fullscreen' => "'self'",
            'geolocation' => "'none'",
            'gyroscope' => "'none'",
            'magnetometer' => "'none'",
            'microphone' => "'none'",
            'midi' => "'none'",
            'navigation-override' => "'none'",
            'payment' => "'none'",
            'picture-in-picture' => "'none'",
            'publickey-credentials-get' => "'none'",
            'screen-wake-lock' => "'none'",
            'sync-xhr' => "'none'",
            'usb' => "'none'",
            'web-share' => "'none'",
            'xr-spatial-tracking' => "'none'",
        ];

        $policyString = implode(', ', array_map(
            fn($feature, $allowlist) => "{$feature}=({$allowlist})",
            array_keys($permissions),
            array_values($permissions)
        ));

        $response->headers->set('Permissions-Policy', $policyString);
    }
}
