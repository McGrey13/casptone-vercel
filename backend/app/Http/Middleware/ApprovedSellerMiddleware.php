<?php

namespace App\Http\Middleware;

use App\Models\Store;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ApprovedSellerMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect('/');
        }

        $user = Auth::user();
        $hasApprovedStore = Store::where('user_id', $user->userID)->where('status', 'approved')->exists();

        if (!$hasApprovedStore) {
            return redirect('/');
        }

        return $next($request);
    }
}


