<?php

namespace App\Http\Middleware;

use App\Providers\RouteServiceProvider;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
    //  * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
    //  */
    // public function handle(Request $request, Closure $next, string ...$guards): Response
    // {
    //     $guards = empty($guards) ? [null] : $guards;

    //     foreach ($guards as $guard) {
            // if (Auth::guard($guard)->check()) {
            //     $user = Auth::user();
                
    //             // Redirect based on user type
    //             switch ($user->userType) {
    //                 case 'admin':
    //                     return redirect()->route('admin.dashboard');
    //                 case 'seller':
    //                     return redirect()->route('seller.dashboard');
    //                 case 'customer':
    //                     return redirect()->route('customer.dashboard');
    //                 default:
    //                     return redirect(RouteServiceProvider::HOME);
    //             }
    //         }
    //     }

    //     return $next($request);
    // }
}
