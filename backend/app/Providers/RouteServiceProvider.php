<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to your application's "home" route.
     *
     * This is used by Laravel authentication to redirect users after login.
     *
     * @var string
     */
    public const HOME = '/home';

    /**
     * The path to redirect to after registration.
     *
     * @var string
     */
    public const REGISTER = '/email/verify';

    /**
     * The path to redirect to after email verification.
     *
     * @var string
     */
    public const VERIFY_EMAIL = '/home';

    /**
     * The path to redirect to after phone verification.
     *
     * @var string
     */
    public const VERIFY_PHONE = '/home';

    /**
     * The controller namespace for the application.
     *
     * When present, controller route declarations will automatically be prefixed with this namespace.
     *
     * @var string|null
     */
    protected $namespace = 'App\\Http\\Controllers';

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     *
     * @return void
     */
    public function boot()
    {
        $this->configureRateLimiting();

        $this->routes(function () {
            Route::prefix('api')
                ->middleware('api')
                ->namespace($this->namespace)
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->namespace($this->namespace)
                ->group(base_path('routes/web.php'));
        });
    }

    /**
     * Configure the rate limiters for the application.
     *
     * @return void
     */
    protected function configureRateLimiting()
    {
        // General API rate limit - increased for development
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(300)->by(optional($request->user())->id ?: $request->ip());
        });

        // Rate limiting for login attempts
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(10)->by($request->input('email').'|'.$request->ip());
        });

        // Rate limiting for verification attempts
        RateLimiter::for('verification', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });
        
        // Rate limiting for CSRF cookie endpoint - very permissive for SPAs
        RateLimiter::for('csrf', function (Request $request) {
            return Limit::perMinute(100)->by($request->ip());
        });
    }
}
