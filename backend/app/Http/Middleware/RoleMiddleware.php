<?php

namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Check if the user is authenticated
        if (!Auth::check()) {
            // Return JSON response for API routes
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $user = Auth::user();

        // Check the user's role
        switch ($role) {
            case 'administrator':
                if (!$user->administrator) {
                    abort(403, 'Unauthorized: You do not have administrator access.');
                }
                break;
            case 'seller':
                if (!$user->seller) {
                    abort(403, 'Unauthorized: You do not have seller access.');
                }
                break;
            case 'customer':
                if (!$user->customer) {
                    abort(403, 'Unauthorized: You do not have customer access.');
                }
                break;
            default:
                abort(403, 'Unauthorized: Invalid role specified.');
        }

        return $next($request);
    }
}
