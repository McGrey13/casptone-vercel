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
use Illuminate\Support\Facades\Cookie;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Exception;
use Illuminate\Support\Str;
use App\Services\EmailService;
use App\Services\TokenService;

class SecureAuthController extends Controller
{
    protected $tokenService;

    public function __construct(TokenService $tokenService)
    {
        $this->tokenService = $tokenService;
    }

    /**
     * Enhanced login with httpOnly cookies and token refresh
     */
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

        // Create access and refresh tokens
        $accessToken = $this->tokenService->createAccessToken($user);
        $refreshToken = $this->tokenService->createRefreshToken($user);

        // Check if user is a seller and has a store
        $redirectTo = null;
        if ($user->role === 'seller') {
            $seller = Seller::where('user_id', $user->userID)->first();
            if (!$seller || !$seller->store) {
                $redirectTo = '/create-store';
            }
        }

        // Determine user type for frontend routing
        $userType = $user->role === 'administrator' ? 'admin' : $user->role;

        // Create response
        $response = response()->json([
            'user' => $user,
            'userType' => $userType,
            'redirectTo' => $redirectTo,
            'token' => $accessToken, // Include token in response for frontend
            'expires_at' => now()->addMinutes((int) config('sanctum.expiration', 60))->toISOString()
        ], 200);

        // Set httpOnly cookies
        $response->cookie(
            'access_token',
            $accessToken,
            (int) config('sanctum.expiration', 60), // minutes
            '/',
            null,
            env('APP_ENV') === 'production', // secure only in production
            true, // httpOnly
            false, // raw
            'strict' // sameSite
        );

        $response->cookie(
            'refresh_token',
            $refreshToken,
            (int) config('sanctum.refresh_expiration', 1440), // 24 hours
            '/',
            null,
            env('APP_ENV') === 'production', // secure only in production
            true, // httpOnly
            false, // raw
            'strict' // sameSite
        );

        return $response;
    }

    /**
     * Token refresh endpoint
     */
    public function refreshToken(Request $request)
    {
        $refreshToken = $request->cookie('refresh_token');
        
        if (!$refreshToken) {
            return response()->json(['message' => 'Refresh token not found'], 401);
        }

        try {
            $result = $this->tokenService->refreshAccessToken($refreshToken);
            
            if (!$result['success']) {
                return response()->json(['message' => $result['message']], 401);
            }

            $response = response()->json([
                'message' => 'Token refreshed successfully',
                'token' => $result['access_token'], // Include new token in response
                'expires_at' => $result['expires_at']
            ]);

            // Set new access token cookie
            $response->cookie(
                'access_token',
                $result['access_token'],
                (int) config('sanctum.expiration', 60),
                '/',
                null,
                env('APP_ENV') === 'production', // secure only in production
                true,
                false,
                'strict'
            );

            // Set new refresh token cookie
            $response->cookie(
                'refresh_token',
                $result['refresh_token'],
                (int) config('sanctum.refresh_expiration', 1440),
                '/',
                null,
                env('APP_ENV') === 'production', // secure only in production
                true,
                false,
                'strict'
            );

            return $response;

        } catch (Exception $e) {
            Log::error('Token refresh failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Token refresh failed'], 401);
        }
    }

    /**
     * Enhanced logout with cookie clearing
     */
    public function logout(Request $request)
    {
        $refreshToken = $request->cookie('refresh_token');
        
        // Revoke tokens
        if ($refreshToken) {
            $this->tokenService->revokeRefreshToken($refreshToken);
        }

        // Revoke all user tokens
        if ($request->user()) {
            $request->user()->tokens()->delete();
        }

        $response = response()->json(['message' => 'Logged out successfully']);

        // Clear cookies
        $response->cookie('access_token', '', -1, '/', null, env('APP_ENV') === 'production', true, false, 'strict');
        $response->cookie('refresh_token', '', -1, '/', null, env('APP_ENV') === 'production', true, false, 'strict');

        return $response;
    }

    /**
     * Enhanced registration with httpOnly cookies
     */
    public function register(Request $request)
    {
        Log::info('Registration attempt', [
            'data' => $request->all(),
            'headers' => $request->headers->all()
        ]);

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
            'is_verified' => false,
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
        }

        Log::info('Registration successful', [
            'user_id' => $user->userID,
            'email' => $user->userEmail,
            'role' => $user->role
        ]);

        return response()->json([
            'message' => 'User registered successfully. Please verify with the OTP sent to your email.',
            'userEmail' => $user->userEmail, 
        ], 201);
    }

    /**
     * Enhanced OTP verification with httpOnly cookies
     */
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

        // Create tokens after successful verification
        $accessToken = $this->tokenService->createAccessToken($user);
        $refreshToken = $this->tokenService->createRefreshToken($user);

        // Check if user is a seller and has a store
        $redirectTo = null;
        if ($user->role === 'seller') {
            $seller = Seller::where('user_id', $user->userID)->first();
            if (!$seller || !$seller->store) {
                $redirectTo = '/create-store';
            }
        }

        $response = response()->json([
            'message' => 'Account verified successfully',
            'user' => $user,
            'redirectTo' => $redirectTo,
            'token' => $accessToken, // Include token in response for frontend
            'expires_at' => now()->addMinutes((int) config('sanctum.expiration', 60))->toISOString()
        ]);

        // Set httpOnly cookies
        $response->cookie(
            'access_token',
            $accessToken,
            (int) config('sanctum.expiration', 60),
            '/',
            null,
            env('APP_ENV') === 'production', // secure only in production
            true,
            false,
            'strict'
        );

        $response->cookie(
            'refresh_token',
            $refreshToken,
            (int) config('sanctum.refresh_expiration', 1440),
            '/',
            null,
            env('APP_ENV') === 'production', // secure only in production
            true,
            false,
            'strict'
        );

        return $response;
    }

    /**
     * Get user profile with token validation
     */
    public function profile(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Get customer profile picture if user is a customer
        $profilePicture = null;
        if ($user->role === 'customer') {
            $customer = \App\Models\Customer::where('user_id', $user->userID)->first();
            if ($customer && $customer->profile_picture_path) {
                $profilePicture = asset('storage/' . $customer->profile_picture_path);
            }
        }

        return response()->json([
            'id' => $user->userID,
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
            'profilePicture' => $profilePicture,
        ]);
    }
}
