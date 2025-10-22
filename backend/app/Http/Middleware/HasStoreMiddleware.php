<?php

namespace App\Http\Middleware;

use App\Models\Store;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class HasStoreMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $user = Auth::user();

        // Check if user is a seller
        if ($user->role !== 'seller') {
            return response()->json(['error' => 'Access denied. Seller role required.'], 403);
        }

        // Check if seller has a store
        $hasStore = Store::where('user_id', $user->userID)->exists();

        if (!$hasStore) {
            return response()->json([
                'error' => 'Store required',
                'message' => 'You need to create a store before accessing seller features.',
                'redirectTo' => '/create-store'
            ], 403);
        }

        return $next($request);
    }
}
