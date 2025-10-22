<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Cache;
use App\Models\User;
use App\Models\SocialAccount;

Route::get('/debug/facebook-config', function () {
    return response()->json([
        'client_id' => config('services.facebook.client_id'),
        'client_secret' => config('services.facebook.client_secret'),
        'redirect_uri' => config('services.facebook.redirect'),
        'social_redirect_uri' => config('services.facebook.social_redirect'),
        'expected_social_redirect' => 'http://localhost:8000/api/social/facebook/callback',
        'expected_login_redirect' => 'http://localhost:8000/api/auth/facebook/callback',
    ]);
});

Route::get('/debug/facebook-redirect', function () {
    $user = auth()->user();
    if (!$user) {
        return response()->json(['error' => 'Not authenticated']);
    }

    $state = Str::random(40);
    Cache::put("fb_oauth_state:" . $state, [
        'user_id' => $user->userID,
        'purpose' => 'social_connect'
    ], now()->addMinutes(10));

    $redirectUri = config('services.facebook.social_redirect') ?: 'http://localhost:8000/api/social/facebook/callback';
    $clientId = config('services.facebook.client_id');
    
    $params = http_build_query([
        'client_id' => $clientId,
        'redirect_uri' => $redirectUri,
        'scope' => 'public_profile,pages_show_list,pages_read_engagement,pages_manage_posts',
        'response_type' => 'code',
        'state' => $state,
    ]);

    $url = 'https://www.facebook.com/v19.0/dialog/oauth?' . $params;

    return response()->json([
        'user_id' => $user->userID,
        'user_email' => $user->userEmail,
        'state' => $state,
        'redirect_uri' => $redirectUri,
        'facebook_url' => $url,
    ]);
});

