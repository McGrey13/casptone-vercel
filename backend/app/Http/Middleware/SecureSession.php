<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Symfony\Component\HttpFoundation\Response;

class SecureSession
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip secure session enforcement in local/development environment
        if (env('APP_ENV') === 'local' || env('APP_ENV') === 'development') {
            Config::set('session.secure', false);
            Config::set('session.http_only', true);
            Config::set('session.same_site', 'lax');
            Config::set('session.encrypt', false);
        } else {
            // Force secure session configuration in production
            if (env('APP_ENV') === 'production' || env('SESSION_SECURE_COOKIE', false)) {
                Config::set('session.secure', true);
                Config::set('session.http_only', true);
                Config::set('session.same_site', 'lax');
                Config::set('session.encrypt', true);
            }
        }

        // Set shorter session lifetime for security
        if (env('SESSION_LIFETIME')) {
            Config::set('session.lifetime', env('SESSION_LIFETIME', 60));
        }

        // Regenerate session ID periodically for security
        if (!$request->session()->isStarted()) {
            $request->session()->start();
        }

        // Regenerate session ID every 10 minutes for enhanced security
        $lastRegeneration = $request->session()->get('_session_regeneration_time');
        $now = time();
        
        if (!$lastRegeneration || ($now - $lastRegeneration) > 600) {
            $request->session()->regenerate(true);
            $request->session()->put('_session_regeneration_time', $now);
        }

        $response = $next($request);

        // Add additional security headers for session cookies
        if ($request->hasSession()) {
            $response->headers->set('Set-Cookie', $this->buildSecureCookieHeader($request));
        }

        return $response;
    }

    /**
     * Build secure cookie header with additional security attributes
     */
    private function buildSecureCookieHeader(Request $request): string
    {
        $sessionName = config('session.cookie');
        $sessionId = $request->session()->getId();
        $path = config('session.path', '/');
        $domain = config('session.domain');
        $secure = config('session.secure', true);
        $httpOnly = config('session.http_only', true);
        $sameSite = config('session.same_site', 'lax');
        
        $cookieHeader = "{$sessionName}={$sessionId}; Path={$path}";
        
        if ($domain) {
            $cookieHeader .= "; Domain={$domain}";
        }
        
        if ($secure) {
            $cookieHeader .= "; Secure";
        }
        
        if ($httpOnly) {
            $cookieHeader .= "; HttpOnly";
        }
        
        if ($sameSite) {
            $cookieHeader .= "; SameSite={$sameSite}";
        }
        
        // Set max-age for additional security
        $maxAge = config('session.lifetime', 60) * 60;
        $cookieHeader .= "; Max-Age={$maxAge}";
        
        return $cookieHeader;
    }
}
