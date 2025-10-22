<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\AbstractProvider;

class FacebookController extends Controller
{
    private const GRAPH_BASE = 'https://graph.facebook.com/v19.0';

    public function redirect(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Use POSTING app credentials
        $clientId = config('services.facebook_posting.client_id');
        $clientSecret = config('services.facebook_posting.client_secret');
        $redirectUri = config('services.facebook_posting.redirect');
        
        if (!$clientId || !$clientSecret || !$redirectUri) {
            return response()->json([
                'message' => 'Facebook posting app credentials not configured',
                'hint' => 'Set FB_POSTING_CLIENT_ID, FB_POSTING_CLIENT_SECRET, FB_POSTING_REDIRECT_URI in .env',
            ], 500);
        }

        $state = Str::random(40);
        Cache::put("fb_oauth_state:" . $state, [
            'user_id' => $user->userID,
            'purpose' => 'social_connect'
        ], now()->addMinutes(10));

        $scopes = [
            'public_profile',
            'email',
            'pages_show_list',
            'pages_read_engagement', 
            'pages_manage_posts',
            'pages_read_user_content',
            'pages_manage_metadata',
        ];

        $params = http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'scope' => implode(',', $scopes),
            'response_type' => 'code',
            'state' => $state,
            'auth_type' => 'rerequest',
        ]);

        $url = 'https://www.facebook.com/v19.0/dialog/oauth?' . $params;

        return response()->json(['url' => $url]);
    }

    public function callback(Request $request)
    {
        $state = $request->input('state');
        $code = $request->input('code');
        $error = $request->input('error');
        $errorReason = $request->input('error_reason');
        $errorDescription = $request->input('error_description');
        
        // Handle user cancellation or denial
        if ($error) {
            Log::info('Facebook OAuth: User cancelled or denied', [
                'error' => $error,
                'error_reason' => $errorReason,
                'error_description' => $errorDescription
            ]);
            
            // Redirect back to frontend with cancellation message
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect($frontendUrl . '/seller/social-media?cancelled=1&reason=' . urlencode($errorReason ?? 'user_denied'));
        }
        
        if (!$state || !$code) {
            Log::error('Facebook OAuth: Missing state or code', [
                'has_state' => !!$state,
                'has_code' => !!$code
            ]);
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect($frontendUrl . '/seller/social-media?error=1&message=' . urlencode('Authentication failed. Please try again.'));
        }

        $stateData = Cache::pull("fb_oauth_state:" . $state);
        if (!$stateData) {
            Log::error('Facebook OAuth: Invalid or expired state', ['state' => $state]);
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect($frontendUrl . '/seller/social-media?error=1&message=' . urlencode('Session expired. Please try again.'));
        }

        $userId = $stateData['user_id'];
        $purpose = $stateData['purpose'] ?? 'social_connect';
        
        Log::info('Facebook OAuth callback', [
            'user_id' => $userId,
            'purpose' => $purpose,
            'state' => $state,
            'callback_url' => $request->fullUrl()
        ]);

        try {
            // Exchange code for access token - MUST use the exact same redirect_uri as the initial request
            // Use POSTING app credentials (NOT auth credentials)
            $redirectUri = config('services.facebook_posting.redirect');
            $tokenResponse = Http::timeout(30)->asForm()->get(self::GRAPH_BASE . '/oauth/access_token', [
                'client_id' => config('services.facebook_posting.client_id'),
                'client_secret' => config('services.facebook_posting.client_secret'),
                'redirect_uri' => $redirectUri,
                'code' => $code,
            ]);

            if (!$tokenResponse->ok()) {
                Log::error('Facebook token exchange failed', ['response' => $tokenResponse->json()]);
                return response('Failed to exchange code for token', 400);
            }

            $accessToken = $tokenResponse->json('access_token');
            if (!$accessToken) {
                return response('No access token received', 400);
            }

            // Get user info
            $userResponse = Http::timeout(30)->get(self::GRAPH_BASE . '/me', [
                'access_token' => $accessToken,
                'fields' => 'id,name,email',
            ]);

            if (!$userResponse->ok()) {
                Log::error('Facebook user info failed', ['response' => $userResponse->json()]);
                return response('Failed to get user info', 400);
            }

            $userData = $userResponse->json();

            // Try to exchange for long-lived token (optional, don't fail if it times out)
            // Use POSTING app credentials (NOT auth credentials)
            try {
                $exchange = Http::timeout(10)->asForm()->get(self::GRAPH_BASE . '/oauth/access_token', [
                    'grant_type' => 'fb_exchange_token',
                    'client_id' => config('services.facebook_posting.client_id'),
                    'client_secret' => config('services.facebook_posting.client_secret'),
                    'fb_exchange_token' => $accessToken,
                ]);
                
                if ($exchange->ok() && isset($exchange['access_token'])) {
                    $accessToken = $exchange['access_token'];
                    Log::info('Facebook: Exchanged for long-lived token');
                }
            } catch (\Exception $e) {
                // Log the error but continue with the short-lived token
                Log::warning('Facebook: Failed to get long-lived token, using short-lived', [
                    'error' => $e->getMessage()
                ]);
            }

            // For social media connection, just link the account to existing user
            if ($purpose === 'social_connect') {
                // Get the existing user from the stored user ID
                $user = User::find($userId);
                if (!$user) {
                    Log::error('Facebook Social Connect: User not found', ['user_id' => $userId]);
                    return response('User not found. Please log in to CraftConnect first.', 400);
                }

                Log::info('Facebook Social Connect: Linking account', [
                    'user_id' => $userId,
                    'user_email' => $user->userEmail,
                    'facebook_id' => $userData['id'],
                    'user_role' => $user->userRole
                ]);

                // Link Facebook account to existing user
                SocialAccount::updateOrCreate(
                    ['user_id' => $userId, 'provider' => 'facebook'],
                    [
                        'provider_user_id' => (string) $userData['id'],
                        'access_token' => $accessToken,
                    ]
                );

                // Redirect back to seller social media page
                $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
                Log::info('Facebook Social Connect: Redirecting to frontend', [
                    'frontend_url' => $frontendUrl . '/seller/social-media?connected=facebook&success=1'
                ]);
                return redirect($frontendUrl . '/seller/social-media?connected=facebook&success=1');
            } else {
                // This should not happen in social connect flow
                return response('Invalid social media connection flow', 400);
            }
        } catch (\Throwable $e) {
            Log::error('Facebook OAuth callback error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            
            // Check if it's a timeout error
            if (str_contains($e->getMessage(), 'timeout') || str_contains($e->getMessage(), 'SSL connection timeout')) {
                return response('Facebook API timed out. Your account may already be connected. Please check the Social Media page.', 500);
            }
            
            return response('Facebook authentication failed: ' . $e->getMessage(), 500);
        }
    }

    public function status(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $account = SocialAccount::where('user_id', $user->userID)->where('provider', 'facebook')->first();
        return response()->json([
            'connected' => (bool) $account,
            'page' => $account ? [
                'id' => $account->page_id,
                'name' => $account->page_name,
                'url' => $account->page_id ? 'https://www.facebook.com/' . $account->page_id : null,
            ] : null,
        ]);
    }

    public function pages(Request $request)
    {
        Log::info('Facebook pages request received');
        
        $user = Auth::user();
        if (!$user) {
            Log::error('Facebook pages: Unauthorized');
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        Log::info('Facebook pages: Checking account', ['user_id' => $user->userID]);
        
        $account = SocialAccount::where('user_id', $user->userID)->where('provider', 'facebook')->first();
        if (!$account || !$account->access_token) {
            Log::error('Facebook pages: Not connected', [
                'user_id' => $user->userID,
                'has_account' => !!$account
            ]);
            return response()->json(['message' => 'Facebook not connected'], 400);
        }

        // Check what permissions the token has
        $permissionsResponse = Http::timeout(30)->get(self::GRAPH_BASE . '/me/permissions', [
            'access_token' => $account->access_token,
        ]);
        
        if ($permissionsResponse->ok()) {
            $permissions = $permissionsResponse->json('data', []);
            $grantedPermissions = array_filter($permissions, function($perm) {
                return $perm['status'] === 'granted';
            });
            Log::info('Facebook permissions check', [
                'user_id' => $user->userID,
                'granted_permissions' => array_column($grantedPermissions, 'permission')
            ]);
        }

        Log::info('Facebook pages: Fetching from Facebook API', [
            'user_id' => $user->userID,
            'has_token' => !!$account->access_token
        ]);

        // Try different approaches to get pages
        $response = Http::timeout(30)->get(self::GRAPH_BASE . '/me/accounts', [
            'access_token' => $account->access_token,
            'fields' => 'id,name,access_token',
        ]);
        
        // If that fails, try with basic permissions
        if (!$response->ok()) {
            Log::info('Facebook pages: Trying alternative approach', [
                'user_id' => $user->userID,
                'original_status' => $response->status(),
                'original_response' => $response->json()
            ]);
            
            // Try with different Graph API version
            $response = Http::timeout(30)->get('https://graph.facebook.com/v18.0/me', [
                'access_token' => $account->access_token,
                'fields' => 'id,name,accounts{id,name,access_token}',
            ]);
            
            // If still fails, try with even older version
            if (!$response->ok()) {
                Log::info('Facebook pages: Trying v17.0 approach', [
                    'user_id' => $user->userID,
                    'v18_status' => $response->status()
                ]);
                
                $response = Http::timeout(30)->get('https://graph.facebook.com/v17.0/me', [
                    'access_token' => $account->access_token,
                    'fields' => 'id,name,accounts{id,name,access_token}',
                ]);
            }
        }
        
        if (!$response->ok()) {
            Log::error('Facebook pages: Failed to fetch', [
                'user_id' => $user->userID,
                'status' => $response->status(),
                'response' => $response->json()
            ]);
            return response()->json(['message' => 'Failed to fetch pages', 'error' => $response->json()], 400);
        }
        
        $pages = $response->json('data', []);
        Log::info('Facebook pages: Retrieved successfully', [
            'user_id' => $user->userID,
            'pages_count' => count($pages),
            'pages' => $pages
        ]);
        
        return response()->json($pages);
    }

    public function disconnect(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $account = SocialAccount::where('user_id', $user->userID)->where('provider', 'facebook')->first();
        if ($account) {
            $account->delete();
            Log::info('Facebook account disconnected', ['user_id' => $user->userID]);
        }

        return response()->json(['success' => true, 'message' => 'Facebook account disconnected']);
    }

    public function debugPermissions(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $account = SocialAccount::where('user_id', $user->userID)->where('provider', 'facebook')->first();
        if (!$account || !$account->access_token) {
            return response()->json(['message' => 'Facebook not connected'], 400);
        }

        // Check permissions
        $permissionsResponse = Http::timeout(30)->get(self::GRAPH_BASE . '/me/permissions', [
            'access_token' => $account->access_token,
        ]);
        
        $permissions = [];
        if ($permissionsResponse->ok()) {
            $permissions = $permissionsResponse->json('data', []);
        }

        // Try to get pages with different approaches
        $pagesResponse1 = Http::timeout(30)->get(self::GRAPH_BASE . '/me/accounts', [
            'access_token' => $account->access_token,
            'fields' => 'id,name,access_token',
        ]);

        $pagesResponse2 = Http::timeout(30)->get(self::GRAPH_BASE . '/me', [
            'access_token' => $account->access_token,
            'fields' => 'id,name,accounts',
        ]);

        return response()->json([
            'permissions' => $permissions,
            'pages_approach_1' => $pagesResponse1->json(),
            'pages_approach_2' => $pagesResponse2->json(),
            'pages_status_1' => $pagesResponse1->status(),
            'pages_status_2' => $pagesResponse2->status(),
        ]);
    }

    public function selectPage(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $data = $request->validate([
            'page_id' => 'required|string',
        ]);

        $account = SocialAccount::where('user_id', $user->userID)->where('provider', 'facebook')->first();
        if (!$account || !$account->access_token) {
            return response()->json(['message' => 'Facebook not connected'], 400);
        }

        Log::info('Selecting Facebook page', [
            'user_id' => $user->userID,
            'page_id' => $data['page_id'],
            'has_access_token' => !!$account->access_token
        ]);

        // Fetch page details including access token
        $response = Http::get(self::GRAPH_BASE . '/' . $data['page_id'], [
            'fields' => 'name,access_token',
            'access_token' => $account->access_token,
        ]);
        if (!$response->ok()) {
            Log::error('Failed to fetch page details', [
                'user_id' => $user->userID,
                'page_id' => $data['page_id'],
                'response' => $response->json()
            ]);
            return response()->json(['message' => 'Failed to fetch page details', 'error' => $response->json()], 400);
        }

        $pageName = $response->json('name');
        $pageAccessToken = $response->json('access_token');

        $account->update([
            'page_id' => $data['page_id'],
            'page_name' => $pageName,
            'page_access_token' => $pageAccessToken,
        ]);

        Log::info('Facebook page selected successfully', [
            'user_id' => $user->userID,
            'page_id' => $account->page_id,
            'page_name' => $account->page_name
        ]);

        return response()->json(['success' => true, 'page' => [
            'id' => $account->page_id,
            'name' => $account->page_name,
            'url' => 'https://www.facebook.com/' . $account->page_id, // Facebook page URL
        ]]);
    }

    public function post(Request $request)
    {
        Log::info('Facebook post request received', [
            'has_user' => !!Auth::user(),
            'request_data' => $request->except(['image']) // Don't log image data
        ]);
        
        $user = Auth::user();
        if (!$user) {
            Log::error('Facebook post: Unauthorized');
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        Log::info('Facebook post: Validating request', ['user_id' => $user->userID]);
        
        $payload = $request->validate([
            'message' => 'required|string|max:2000',
            'link' => 'nullable|url',
            'image' => 'nullable|image|max:10240', // 10MB max
        ]);

        Log::info('Facebook post: Checking social account', ['user_id' => $user->userID]);
        
        $account = SocialAccount::where('user_id', $user->userID)->where('provider', 'facebook')->first();
        
        // Enhanced logging for debugging
        if (!$account) {
            Log::error('Facebook post: No Facebook account found', ['user_id' => $user->userID]);
            return response()->json([
                'message' => 'Please connect your Facebook account first. Go to "Connected Accounts" tab and click "Connect Facebook".',
                'error_code' => 'NO_ACCOUNT'
            ], 400);
        }
        
        if (!$account->page_id || !$account->page_access_token) {
            Log::error('Facebook post: No page selected', [
                'user_id' => $user->userID,
                'has_account' => true,
                'page_id' => $account->page_id ?? null,
                'page_name' => $account->page_name ?? null,
                'has_access_token' => !!$account->access_token,
                'has_page_token' => !!$account->page_access_token
            ]);
            
            // Try to auto-select the first available page
            Log::info('Attempting to fetch and auto-select first available page', ['user_id' => $user->userID]);
            
            try {
                $pagesResponse = Http::timeout(30)->get(self::GRAPH_BASE . '/me/accounts', [
                    'access_token' => $account->access_token,
                    'fields' => 'id,name,access_token',
                ]);
                
                if ($pagesResponse->ok()) {
                    $pages = $pagesResponse->json('data', []);
                    Log::info('Found pages', ['user_id' => $user->userID, 'pages_count' => count($pages)]);
                    
                    if (!empty($pages)) {
                        $firstPage = $pages[0];
                        $account->update([
                            'page_id' => $firstPage['id'],
                            'page_name' => $firstPage['name'],
                            'page_access_token' => $firstPage['access_token'] ?? null,
                        ]);
                        
                        Log::info('Auto-selected first page', [
                            'user_id' => $user->userID,
                            'page_id' => $firstPage['id'],
                            'page_name' => $firstPage['name']
                        ]);
                        
                        // Reload account to get updated data
                        $account->refresh();
                    } else {
                        Log::warning('No pages available for user', ['user_id' => $user->userID]);
                        return response()->json([
                            'message' => 'No Facebook Pages found. Please create a Facebook Page or request page permissions.',
                            'error_code' => 'NO_PAGES'
                        ], 400);
                    }
                } else {
                    Log::error('Failed to fetch pages for auto-selection', [
                        'user_id' => $user->userID,
                        'status' => $pagesResponse->status(),
                        'response' => $pagesResponse->json()
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Exception while auto-selecting page', [
                    'user_id' => $user->userID,
                    'error' => $e->getMessage()
                ]);
            }
            
            // Check again after auto-selection attempt
            if (!$account->page_id || !$account->page_access_token) {
                return response()->json([
                    'message' => 'Please select a Facebook Page first. Go to "Connected Accounts" tab and click "Manage Pages".',
                    'error_code' => 'NO_PAGE_SELECTED'
                ], 400);
            }
        }

        try {
            $params = [
                'message' => $payload['message'],
                'access_token' => $account->page_access_token,
            ];
            
            if (!empty($payload['link'])) {
                $params['link'] = $payload['link'];
            }

            // Handle image upload
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                
                // Upload image to Facebook first
                $uploadResponse = Http::attach('source', file_get_contents($image->getPathname()), $image->getClientOriginalName())
                    ->post(self::GRAPH_BASE . '/' . $account->page_id . '/photos', [
                        'message' => $payload['message'],
                        'access_token' => $account->page_access_token,
                    ]);

                if (!$uploadResponse->ok()) {
                    Log::warning('Facebook image upload failed', ['response' => $uploadResponse->json()]);
                    return response()->json(['message' => 'Failed to upload image to Facebook', 'error' => $uploadResponse->json()], 400);
                }

                return response()->json(['success' => true, 'post_id' => $uploadResponse->json('id')]);
            } else {
                // Regular text post
                $response = Http::asForm()->post(self::GRAPH_BASE . '/' . $account->page_id . '/feed', $params);
                if (!$response->ok()) {
                    Log::warning('Facebook post failed', ['response' => $response->json()]);
                    return response()->json(['message' => 'Failed to create post', 'error' => $response->json()], 400);
                }

                return response()->json(['success' => true, 'post_id' => $response->json('id')]);
            }
        } catch (\Exception $e) {
            Log::error('Facebook post error', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to create post: ' . $e->getMessage()], 500);
        }
    }

    public function postToInstagram(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        $payload = $request->validate([
            'message' => 'required|string|max:2000',
            'image' => 'required|image|max:10240', // Instagram requires image
        ]);

        $account = SocialAccount::where('user_id', $user->userID)->where('provider', 'facebook')->first();
        if (!$account || !$account->page_id || !$account->page_access_token) {
            return response()->json(['message' => 'Select a Facebook Page first'], 400);
        }

        try {
            // Get Instagram Business Account ID
            $instagramResponse = Http::get(self::GRAPH_BASE . '/' . $account->page_id, [
                'fields' => 'instagram_business_account',
                'access_token' => $account->page_access_token,
            ]);

            if (!$instagramResponse->ok()) {
                return response()->json(['message' => 'Failed to get Instagram account'], 400);
            }

            $instagramAccountId = $instagramResponse->json('instagram_business_account.id');
            if (!$instagramAccountId) {
                return response()->json(['message' => 'No Instagram Business account connected to this Facebook page'], 400);
            }

            // Create Instagram media container
            $image = $request->file('image');
            $mediaResponse = Http::attach('image_url', file_get_contents($image->getPathname()), $image->getClientOriginalName())
                ->post(self::GRAPH_BASE . '/' . $instagramAccountId . '/media', [
                    'caption' => $payload['message'],
                    'access_token' => $account->page_access_token,
                ]);

            if (!$mediaResponse->ok()) {
                Log::warning('Instagram media creation failed', ['response' => $mediaResponse->json()]);
                return response()->json(['message' => 'Failed to create Instagram media', 'error' => $mediaResponse->json()], 400);
            }

            $mediaId = $mediaResponse->json('id');

            // Publish the media
            $publishResponse = Http::asForm()->post(self::GRAPH_BASE . '/' . $instagramAccountId . '/media_publish', [
                'creation_id' => $mediaId,
                'access_token' => $account->page_access_token,
            ]);

            if (!$publishResponse->ok()) {
                Log::warning('Instagram publish failed', ['response' => $publishResponse->json()]);
                return response()->json(['message' => 'Failed to publish to Instagram', 'error' => $publishResponse->json()], 400);
            }

            return response()->json(['success' => true, 'post_id' => $publishResponse->json('id')]);
        } catch (\Exception $e) {
            Log::error('Instagram post error', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to post to Instagram: ' . $e->getMessage()], 500);
        }
    }
}


