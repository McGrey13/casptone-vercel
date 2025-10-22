<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DisableSessionsForApi
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Allow sessions for Sanctum authentication routes
        $authRoutes = [
            'auth/login',
            'auth/register', 
            'auth/verify-otp',
            'auth/refresh-token',
            'auth/profile',
            'auth/logout'
        ];
        
        $currentPath = $request->path();
        $isAuthRoute = false;
        
        foreach ($authRoutes as $route) {
            if (str_contains($currentPath, $route)) {
                $isAuthRoute = true;
                break;
            }
        }
        
        // Only disable sessions for non-auth routes
        if (!$isAuthRoute) {
            config(['session.driver' => 'array']);
            config(['session.lifetime' => 0]);
            
            // Remove any session cookies
            if ($request->hasSession()) {
                $request->session()->flush();
            }
        }
        
        return $next($request);
    }
}
