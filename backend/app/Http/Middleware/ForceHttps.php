<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceHttps
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip HTTPS enforcement in local/development environment
        if (env('APP_ENV') === 'local' || env('APP_ENV') === 'development') {
            return $next($request);
        }

        // Force HTTPS in production environment
        if (env('APP_ENV') === 'production' && !$request->secure()) {
            return redirect()->secure($request->getRequestUri(), 301);
        }

        // Force HTTPS if FORCE_HTTPS is enabled (but not in development)
        if (env('FORCE_HTTPS', false) && !$request->secure() && env('APP_ENV') !== 'local' && env('APP_ENV') !== 'development') {
            return redirect()->secure($request->getRequestUri(), 301);
        }

        return $next($request);
    }
}

