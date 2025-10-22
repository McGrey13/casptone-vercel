<?php 

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Administrator;
use App\Models\Seller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;
use Laravel\Socialite\Facades\Socialite;
use Exception;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Services\EmailService;

use function Pest\Laravel\withHeaders;

class AuthController extends Controller
{
    /**
     * Show the registration form.
     *
     * @return \Illuminate\View\View
     */

    public function getCustomers()
    {
        try {
            $customers = User::where('role', 'customer')
                ->with(['customer.orders' => function($query) {
                    $query->select('orderID', 'customer_id', 'totalAmount', 'status', 'created_at');
                }])
                ->get()
                ->map(function ($user) {
                    $customer = $user->customer;
                    
                    // Calculate total spent
                    $totalSpent = $customer ? $customer->orders->sum('totalAmount') : 0;
                    
                    // Get last purchase
                    $lastPurchase = null;
                    if ($customer && $customer->orders->isNotEmpty()) {
                        $lastPurchase = $customer->orders->sortByDesc('created_at')->first()->created_at;
                    }
                    
                    // Determine status
                    $status = 'inactive';
                    if ($customer && $customer->orders->isNotEmpty()) {
                        $lastOrder = $customer->orders->sortByDesc('created_at')->first();
                        $daysSinceLastOrder = $lastOrder->created_at->diffInDays(now());
                        
                        if ($daysSinceLastOrder <= 30) {
                            $status = 'active';
                        } elseif ($daysSinceLastOrder <= 90) {
                            $status = 'inactive';
                        } else {
                            $status = 'dormant';
                        }
                    }

                    // Construct profile image URL
                    $profileImageUrl = null;
                    if ($customer && $customer->profile_picture_path) {
                        $profileImageUrl = asset('storage/' . $customer->profile_picture_path);
                    }

                    return [
                        'userID' => $user->userID,
                        'userName' => $user->userName,
                        'userEmail' => $user->userEmail,
                        'userAddress' => $user->userAddress,
                        'userContactNumber' => $user->userContactNumber,
                        'created_at' => $user->created_at,
                        'updated_at' => $user->updated_at,
                        'profile_image_url' => $profileImageUrl,
                        'total_spent' => $totalSpent,
                        'last_purchase' => $lastPurchase,
                        'status' => $status,
                        'orders_count' => $customer ? $customer->orders->count() : 0
                    ];
                });

            return response()->json($customers);
        } catch (\Exception $e) {
            Log::error('Error fetching customers:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error fetching customers: ' . $e->getMessage()], 500);
        }
    }

public function getSellers()
{
    try {
        $sellers = Seller::with(['user', 'products'])->get()->map(function ($seller) {
            // Get seller orders and calculate metrics
            $sellerOrders = $seller->getSellerOrders();
            $totalRevenue = $sellerOrders->sum(function($order) {
                return $order->products->sum(function($product) {
                    return $product->pivot->quantity * $product->pivot->price;
                });
            });
            
            $totalOrders = $sellerOrders->count();
            $lastSale = $sellerOrders->sortByDesc('created_at')->first();
            $lastSaleDate = $lastSale ? $lastSale->created_at : null;
            
            // Determine performance status
            $status = 'inactive';
            if ($totalOrders > 0 && $lastSaleDate) {
                $daysSinceLastSale = $lastSaleDate->diffInDays(now());
                if ($daysSinceLastSale <= 30) {
                    $status = 'active';
                } elseif ($daysSinceLastSale <= 90) {
                    $status = 'inactive';
                } else {
                    $status = 'dormant';
                }
            }

            return [
                'sellerID' => $seller->sellerID,
                'businessName' => $seller->businessName,
                'created_at' => $seller->created_at,
                'updated_at' => $seller->updated_at,
                'profile_image_url' => $seller->profile_image_url,
                'products_count' => $seller->products->count(),
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'last_sale' => $lastSaleDate,
                'status' => $status,
                'user' => [
                    'userID' => $seller->user->userID,
                    'userName' => $seller->user->userName,
                    'userEmail' => $seller->user->userEmail,
                    'userAddress' => $seller->user->userAddress ?? null,
                    'userContactNumber' => $seller->user->userContactNumber,
                ]
            ];
        });

        return response()->json($sellers);
    } catch (\Exception $e) {
        Log::error('Error fetching sellers:', ['error' => $e->getMessage()]);
        return response()->json(['message' => 'Error fetching sellers: ' . $e->getMessage()], 500);
    }
}


    public function getSellerById($id)
    {
        try {
            $seller = Seller::where('user_id', $id)
                ->with('user') // eager load the user relationship
                ->first();

            if (!$seller) {
                return response()->json(['message' => 'Seller not found'], 404);
            }

            return response()->json([
                'id' => $seller->id,
                'shop_name' => $seller->shop_name ?? null,
                'shop_description' => $seller->shop_description ?? null,
                'created_at' => $seller->created_at,
                'updated_at' => $seller->updated_at,

                // pull user fields
                'user' => [
                    'id' => $seller->user->id,
                    'userName' => $seller->user->userName,
                    'userEmail' => $seller->user->userEmail,
                    'userAddress' => $seller->user->userAddress,
                    'userContactNumber' => $seller->user->userContactNumber,
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error fetching seller: ' . $e->getMessage()
            ], 500);
        }
    }


    public function getAdmins()
    {
        return response()->json(User::where('role', 'admin')->get());
    }

    public function show(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Return only the basic user data to avoid potential relationship errors
        // You can add more columns here if needed.
        $profileData = [
            'id' => $user->userID,  // Use correct primary key
            'userID' => $user->userID,
            'userName' => $user->userName,
            'userEmail' => $user->userEmail,
            'role' => $user->role,
            'userBirthday' => $user->userBirthday,
            'userContactNumber' => $user->userContactNumber,
            'userAddress' => $user->userAddress,
            'userCity' => $user->userCity ?? null,
            'userRegion' => $user->userRegion ?? null,
            'userProvince' => $user->userProvince ?? null,
            'userPostalCode' => $user->userPostalCode ?? null,
        ];
        
        return response()->json($profileData);
    }


    /**
     * Handle user registration.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     * @throws \Illuminate\Validation\ValidationException
     */
    public function register(Request $request)
{
    $request->validate([
        'userName' => 'required|string|max:255',
        'userEmail' => 'required|string|email|max:255|unique:users,userEmail',
        'userPassword' => 'required|string|min:8|confirmed',
        'userContactNumber' => 'required|string|max:15',
        'role' => 'required|string|in:administrator,seller,customer',
    ]);

    $otp = rand(100000, 999999);

    $user = User::create([
        'userName' => $request->userName,
        'userEmail' => $request->userEmail,
        'userPassword' => Hash::make($request->userPassword),
        'userContactNumber' => $request->userContactNumber,
        'role' => $request->role,
        'otp' => $otp,
        'otp_expires_at' => Carbon::now()->addMinutes(10),
        'is_verified' => false, // default
    ]);

    // Assign role relationships
    if ($request->role === 'administrator') {
        Administrator::create(['user_id' => $user->userID]);
    } elseif ($request->role === 'seller') {
        Seller::create(['user_id' => $user->userID]);
    } elseif ($request->role === 'customer') {
        Customer::create(['user_id' => $user->userID]);
    }

    // Send OTP using EmailService
    $emailResult = EmailService::sendOtpEmail($user->userEmail, $user->userName, $otp);
    
    if (!$emailResult['success']) {
        Log::warning('OTP email failed to send, but registration was successful', [
            'email' => $user->userEmail,
            'error' => $emailResult['error'] ?? 'Unknown error'
        ]);
        // Don't fail registration if email fails - user can retry OTP
    }

    session(['otp_email' => $user->userEmail]);

    return response()->json([
        'message' => 'User registered successfully. Please verify with the OTP sent to your email.',
        'userEmail' => $user->userEmail, 
    ], 201);
}

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'userEmail' => ['required', 'email'],
            'userPassword' => ['required'],
        ]);

        // Check if user exists and password is correct
        $user = User::where('userEmail', $credentials['userEmail'])->first();
        
        if (!$user || !Hash::check($credentials['userPassword'], $user->userPassword)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        if (!$user->is_verified) {
            return response()->json(['message' => 'Please verify your account before logging in.'], 403);
        }

        // Create token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Check if user is a seller and has a store
        $redirectTo = null;
        if ($user->role === 'seller') {
            $seller = Seller::where('user_id', $user->userID)->first();
            if (!$seller || !$seller->store) {
                $redirectTo = '/create-store';
            }
        }

        // Determine user type for frontend routing
        $userType = $user->role === 'administrator'
            ? 'admin'
            : $user->role; 

        return response()->json([
            'user' => $user,
            'token' => $token,
            'userType' => $userType,
            'redirectTo' => $redirectTo
        ], 200);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'userEmail' => 'required|email',
            'otp' => 'required'
        ]);
    
        $user = User::where('userEmail', $request->userEmail)->first();
    
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
    
        if ($user->otp !== $request->otp || Carbon::now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['message' => 'Invalid or expired OTP'], 400);
        }
    
        $user->is_verified = true;
        $user->otp = null;
        $user->otp_expires_at = null;
        $user->save();
    
        // 🔑 Create token after successful verification
        $token = $user->createToken('auth_token')->plainTextToken;
    
        // Check if user is a seller and has a store
        $redirectTo = null;
        if ($user->role === 'seller') {
            $seller = Seller::where('user_id', $user->userID)->first();
            if (!$seller || !$seller->store) {
                $redirectTo = '/create-store';
            }
        }
    
        return response()->json([
            'message' => 'Account verified successfully',
            'token' => $token,
            'user' => $user,
            'redirectTo' => $redirectTo
        ]);
    }
    
    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
    public function redirectToGoogle(Request $request)
    {
        // Capture desired role from query (?role=seller|customer) and pass via OAuth state
        $selectedRole = $request->query('role');
        $statePayload = base64_encode(json_encode([
            'role' => in_array($selectedRole, ['seller', 'customer']) ? $selectedRole : null,
            'purpose' => 'login_register' // Different from social_connect
        ]));

        return Socialite::driver('google')
            ->stateless()
            ->with([
                'state' => $statePayload,
                // Force Google to show the account chooser every time
                'prompt' => 'select_account'
            ])
            ->redirect();
    }

    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
    
            $user = User::where('userEmail', $googleUser->getEmail())->first();
    
            // Extract selected role and purpose from OAuth state (if provided)
            $stateRole = null;
            $purpose = 'login_register';
            $stateRaw = $request->get('state');
            if ($stateRaw) {
                $decoded = json_decode(base64_decode($stateRaw), true);
                if (is_array($decoded)) {
                    if (isset($decoded['role']) && in_array($decoded['role'], ['seller', 'customer'])) {
                        $stateRole = $decoded['role'];
                    }
                    if (isset($decoded['purpose'])) {
                        $purpose = $decoded['purpose'];
                    }
                }
            }

            if (!$user) {
                $newUserRole = $stateRole ?: 'customer';
                $user = User::create([
                    'userName'      => $googleUser->getName(),
                    'userEmail'     => $googleUser->getEmail(),
                    'userPassword'  => bcrypt(Str::random(16)),
                    'role'          => $newUserRole,
                ]);

                // Create role relationship for new users
                if ($newUserRole === 'seller') {
                    Seller::create(['user_id' => $user->userID]);
                } else {
                    Customer::create(['user_id' => $user->userID]);
                }
            }

            // Link Google account to user (for both new and existing users)
            if ($purpose === 'login_register') {
                \App\Models\SocialAccount::updateOrCreate(
                    ['user_id' => $user->userID, 'provider' => 'google'],
                    [
                        'provider_user_id' => (string) $googleUser->getId(),
                        'access_token' => $googleUser->token,
                    ]
                );
            }
    
            $token = $user->createToken('auth_token')->plainTextToken;
    
            // Determine the final destination after login
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            $finalPath = '/home'; // Default for customers
            
            if ($user->role === 'seller') {
                $seller = Seller::where('user_id', $user->userID)->first();
                if (!$seller || !$seller->store) {
                    $finalPath = '/create-store';
                } else {
                    $finalPath = '/seller';
                }
            } elseif ($user->role === 'administrator') {
                $finalPath = '/admin';
            }
    
            // IMPORTANT: Redirect to /login so Login.jsx can process the OAuth callback
            $redirectUrl = "{$frontendUrl}/login?token={$token}&user_id={$user->userID}&user_type={$user->role}&redirect_to=" . urlencode($finalPath);
    
            return redirect($redirectUrl);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function redirectToFacebook(Request $request)
    {
        // Capture desired role from query (?role=seller|customer) and pass via OAuth state
        $selectedRole = $request->query('role');
        $statePayload = base64_encode(json_encode([
            'role' => in_array($selectedRole, ['seller', 'customer']) ? $selectedRole : null,
            'purpose' => 'login_register' // Different from social_connect
        ]));

        return Socialite::driver('facebook')
            ->stateless()
            ->scopes(['email', 'public_profile']) // Explicitly request email and public profile
            ->with([
                'state' => $statePayload,
            ])
            ->redirect();
    }

    public function handleFacebookCallback(Request $request)
    {
        try {
            Log::info('Facebook OAuth callback started', [
                'has_code' => $request->has('code'),
                'has_state' => $request->has('state'),
                'has_error' => $request->has('error'),
                'session_id' => session()->getId(),
                'fb_client_id' => config('services.facebook.client_id'),
                'fb_redirect' => config('services.facebook.redirect')
            ]);

            // Check for errors from Facebook
            if ($request->has('error')) {
                Log::error('Facebook returned error', [
                    'error' => $request->get('error'),
                    'error_description' => $request->get('error_description')
                ]);
                return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/login?error=facebook&message=' . urlencode($request->get('error_description', 'Facebook authentication failed')));
            }

            // Get the Facebook user - using stateless to avoid session issues
            $facebookUser = Socialite::driver('facebook')
                ->fields(['name', 'email', 'id'])
                ->stateless()
                ->user();
            
            Log::info('Facebook user retrieved', [
                'has_email' => !empty($facebookUser->getEmail()),
                'user_id' => $facebookUser->getId()
            ]);
            
            // Check if email is available
            if (!$facebookUser->getEmail()) {
                Log::warning('Facebook did not provide email');
                return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/login?error=no_email&message=' . urlencode('Facebook did not provide your email. Please ensure your Facebook account has a verified email address.'));
            }
    
            $user = User::where('userEmail', $facebookUser->getEmail())->first();
    
            // Extract selected role and purpose from OAuth state (if provided)
            $stateRole = null;
            $purpose = 'login_register';
            $stateRaw = $request->get('state');
            if ($stateRaw) {
                $decoded = json_decode(base64_decode($stateRaw), true);
                if (is_array($decoded)) {
                    if (isset($decoded['role']) && in_array($decoded['role'], ['seller', 'customer'])) {
                        $stateRole = $decoded['role'];
                    }
                    if (isset($decoded['purpose'])) {
                        $purpose = $decoded['purpose'];
                    }
                }
            }

            if (!$user) {
                $newUserRole = $stateRole ?: 'customer';
                $user = User::create([
                    'userName'      => $facebookUser->getName(),
                    'userEmail'     => $facebookUser->getEmail(),
                    'userPassword'  => bcrypt(Str::random(16)),
                    'role'          => $newUserRole,
                    'is_verified'   => true,  // Auto-verify for OAuth users
                ]);

                Log::info('New user created via Facebook', [
                    'user_id' => $user->userID,
                    'role' => $newUserRole,
                    'email' => $facebookUser->getEmail()
                ]);

                // Create role relationship for new users
                if ($newUserRole === 'seller') {
                    Seller::create(['user_id' => $user->userID]);
                } else {
                    Customer::create(['user_id' => $user->userID]);
                }
            }
            
            // Also ensure existing users are verified
            if (!$user->is_verified) {
                $user->is_verified = true;
                $user->save();
                Log::info('Verified existing user via Facebook', ['user_id' => $user->userID]);
            }

            // Link Facebook account to user (for both new and existing users)
            if ($purpose === 'login_register') {
                \App\Models\SocialAccount::updateOrCreate(
                    ['user_id' => $user->userID, 'provider' => 'facebook'],
                    [
                        'provider_user_id' => (string) $facebookUser->getId(),
                        'access_token' => $facebookUser->token,
                    ]
                );
            }
    
            $token = $user->createToken('auth_token')->plainTextToken;
            
            Log::info('Token generated for Facebook user', [
                'user_id' => $user->userID,
                'token_length' => strlen($token),
                'user_role' => $user->role,
                'is_verified' => $user->is_verified
            ]);
    
            // Determine the final destination after login
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            $finalPath = '/home'; // Default for customers
            
            if ($user->role === 'seller') {
                $seller = Seller::where('user_id', $user->userID)->first();
                if (!$seller || !$seller->store) {
                    $finalPath = '/create-store';
                } else {
                    $finalPath = '/seller';
                }
            } elseif ($user->role === 'administrator') {
                $finalPath = '/admin';
            }
    
            // IMPORTANT: Redirect to /login so Login.jsx can process the OAuth callback
            // Login.jsx will then redirect to the final destination
            $redirectUrl = "{$frontendUrl}/login?token={$token}&user_id={$user->userID}&user_type={$user->role}&redirect_to=" . urlencode($finalPath);
            
            Log::info('Facebook login successful - Redirecting to /login for processing', [
                'redirect_url' => substr($redirectUrl, 0, 100) . '...',
                'user_id' => $user->userID,
                'final_destination' => $finalPath
            ]);
    
            return redirect($redirectUrl);
        } catch (Exception $e) {
            Log::error('Facebook OAuth callback error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/login?error=facebook_error&message=' . urlencode('Failed to login with Facebook: ' . $e->getMessage()));
        }
    }
    
    public function deactivate(Request $request)
    {
        $userId = Auth::id();
        $user = User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user->status = 'inactive';
        $user->save();

        if (method_exists($user, 'tokens')) {
            $user->tokens()->delete();
        }

        Log::info('User deactivated account.', ['userID' => $user->id]);

        return response()->json(['message' => 'Account deactivated successfully.']);
    }

    public function destroy(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        
        if ($user instanceof \App\Models\User) {
            if (method_exists($user, 'tokens')) {
                $user->tokens()->delete();
            }
            $user->delete();
        } else {
            return response()->json(['message' => 'User instance not found.'], 500);
        }

        Log::info('User deleted account.', ['userID' => $user->id]);

        return response()->json(['message' => 'Account deleted successfully.']);
    }

    /**
     * Send OTP for password reset
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'userEmail' => 'required|email|exists:users,userEmail'
        ]);

        try {
            $user = User::where('userEmail', $request->userEmail)->first();
            
            if (!$user) {
                return response()->json([
                    'message' => 'User not found'
                ], 404);
            }

            // Generate new OTP
            $otp = rand(100000, 999999);
            $user->otp = $otp;
            $user->otp_expires_at = Carbon::now()->addMinutes(10);
            $user->save();

            // Send OTP via email
            $emailResult = EmailService::sendOtpEmail($user->userEmail, $user->userName, $otp, 'Password Reset');
            
            if (!$emailResult['success']) {
                Log::warning('Password reset OTP email failed to send', [
                    'email' => $user->userEmail,
                    'error' => $emailResult['error'] ?? 'Unknown error'
                ]);
                
                return response()->json([
                    'message' => 'Failed to send OTP. Please try again.'
                ], 500);
            }

            return response()->json([
                'message' => 'OTP sent successfully to your email address',
                'userEmail' => $user->userEmail
            ]);

        } catch (Exception $e) {
            Log::error('Forgot password error', [
                'email' => $request->userEmail,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'An error occurred. Please try again.'
            ], 500);
        }
    }

    /**
     * Reset password with OTP verification and last password confirmation
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'userEmail' => 'required|email|exists:users,userEmail',
            'otp' => 'required|string|size:6',
            'lastPassword' => 'required|string',
            'newPassword' => 'required|string|min:8|confirmed'
        ]);

        try {
            $user = User::where('userEmail', $request->userEmail)->first();
            
            if (!$user) {
                return response()->json([
                    'message' => 'User not found'
                ], 404);
            }

            // Verify OTP
            if ($user->otp !== $request->otp || Carbon::now()->greaterThan($user->otp_expires_at)) {
                return response()->json([
                    'message' => 'Invalid or expired OTP'
                ], 400);
            }

            // Verify last password
            if (!Hash::check($request->lastPassword, $user->userPassword)) {
                return response()->json([
                    'message' => 'Last password is incorrect'
                ], 400);
            }

            // Check if new password is different from current password
            if (Hash::check($request->newPassword, $user->userPassword)) {
                return response()->json([
                    'message' => 'New password must be different from current password'
                ], 400);
            }

            // Update password
            $user->userPassword = Hash::make($request->newPassword);
            $user->otp = null; // Clear OTP after successful reset
            $user->otp_expires_at = null;
            $user->save();

            // Invalidate all existing tokens for security
            if (method_exists($user, 'tokens')) {
                $user->tokens()->delete();
            }

            Log::info('Password reset successful', [
                'userID' => $user->userID,
                'email' => $user->userEmail
            ]);

            return response()->json([
                'message' => 'Password reset successfully. Please log in with your new password.'
            ]);

        } catch (Exception $e) {
            Log::error('Password reset error', [
                'email' => $request->userEmail,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'An error occurred. Please try again.'
            ], 500);
        }
    }

    /**
     * Change user password
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function changePassword(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $request->validate([
            'currentPassword' => 'required|string',
            'newPassword' => 'required|string|min:8|confirmed',
        ]);

        try {
            // Verify current password
            if (!Hash::check($request->currentPassword, $user->userPassword)) {
                return response()->json([
                    'message' => 'Current password is incorrect'
                ], 400);
            }

            // Check if new password is different from current password
            if (Hash::check($request->newPassword, $user->userPassword)) {
                return response()->json([
                    'message' => 'New password must be different from current password'
                ], 400);
            }

            // Update password
            $user->userPassword = Hash::make($request->newPassword);
            $user->save();

            // Invalidate all existing tokens for security
            if (method_exists($user, 'tokens')) {
                $user->tokens()->delete();
            }

            Log::info('Password changed successfully', [
                'userID' => $user->userID,
                'email' => $user->userEmail
            ]);

            return response()->json([
                'message' => 'Password changed successfully. Please log in again.'
            ]);

        } catch (Exception $e) {
            Log::error('Password change error', [
                'userID' => $user->userID,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'An error occurred. Please try again.'
            ], 500);
        }
    }

    /**
     * Update user profile
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $request->validate([
            'userName' => 'nullable|string|max:100',
            'userEmail' => 'nullable|email|max:100|unique:users,userEmail,' . $user->userID . ',userID',
            'userContactNumber' => 'nullable|string|max:20',
            'userAddress' => 'nullable|string|max:255',
            'userCity' => 'nullable|string|max:100',
            'userRegion' => 'nullable|string|max:100',
            'userProvince' => 'nullable|string|max:100',
            'userPostalCode' => 'nullable|string|max:20',
        ]);

        try {
            // Prepare update data
            $updateData = [];
            if ($request->has('userName')) $updateData['userName'] = $request->userName;
            if ($request->has('userEmail')) $updateData['userEmail'] = $request->userEmail;
            if ($request->has('userContactNumber')) $updateData['userContactNumber'] = $request->userContactNumber;
            if ($request->has('userAddress')) $updateData['userAddress'] = $request->userAddress;
            if ($request->has('userCity')) $updateData['userCity'] = $request->userCity;
            if ($request->has('userRegion')) $updateData['userRegion'] = $request->userRegion;
            if ($request->has('userProvince')) $updateData['userProvince'] = $request->userProvince;
            if ($request->has('userPostalCode')) $updateData['userPostalCode'] = $request->userPostalCode;

            // Update user
            $user->update($updateData);

            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => $user->fresh()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user location information
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateLocation(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $request->validate([
            'userCity' => 'nullable|string|max:100',
            'userRegion' => 'nullable|string|max:100',
            'userProvince' => 'nullable|string|max:100',
            'userPostalCode' => 'nullable|string|max:20',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        try {
            // Prepare update data
            $updateData = [];
            
            // Update location fields
            if ($request->has('userAddress')) {
                $updateData['userAddress'] = $request->userAddress;
            }
            if ($request->has('userCity')) {
                $updateData['userCity'] = $request->userCity;
            }
            if ($request->has('userRegion')) {
                $updateData['userRegion'] = $request->userRegion;
            }
            if ($request->has('userProvince')) {
                $updateData['userProvince'] = $request->userProvince;
            }
            if ($request->has('userPostalCode')) {
                $updateData['userPostalCode'] = $request->userPostalCode;
            }

            // Update the user
            if (!empty($updateData)) {
                User::where('userID', $user->userID)->update($updateData);
                $user = User::find($user->userID); // Refresh user data
            }

            // Log the location update
            Log::info('User location updated', [
                'userID' => $user->userID,
                'userCity' => $request->userCity,
                'userProvince' => $request->userProvince,
                'userRegion' => $request->userRegion,
                'coordinates' => $request->latitude && $request->longitude ? 
                    ['lat' => $request->latitude, 'lng' => $request->longitude] : null
            ]);

            return response()->json([
                'message' => 'Location updated successfully',
                'user' => [
                    'id' => $user->userID,
                    'userName' => $user->userName,
                    'userEmail' => $user->userEmail,
                    'userAddress' => $user->userAddress,
                    'userContactNumber' => $user->userContactNumber,
                    'userCity' => $user->userCity,
                    'userRegion' => $user->userRegion,
                    'userProvince' => $user->userProvince,
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Failed to update user location', [
                'userID' => $user->userID,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to update location: ' . $e->getMessage()
            ], 500);
        }
    }
}

