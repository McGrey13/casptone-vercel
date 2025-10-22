<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureUserIsSeller
{
 // app/Http/Middleware/EnsureUserIsSeller.php

public function handle(Request $request, Closure $next): mixed
{
    if (!Auth::check()) {
        return response()->json(['message' => 'Unauthenticated.'], 401);
    }

    // Fix: Check for the existence of the seller relationship
    if (!Auth::user()->seller) {
        return response()->json(['message' => 'Forbidden - You are not a seller.'], 403);
    }

    return $next($request);
}
}