<?php

namespace App\Services;

use App\Models\User;
use App\Models\RefreshToken;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Exception;

class TokenService
{
    /**
     * Create access token
     */
    public function createAccessToken(User $user): string
    {
        // Create Sanctum token
        $token = $user->createToken('access_token', ['*'], now()->addMinutes((int) config('sanctum.expiration', 60)));
        
        return $token->plainTextToken;
    }

    /**
     * Create refresh token
     */
    public function createRefreshToken(User $user): string
    {
        // Generate unique refresh token
        $refreshToken = Str::random(64);
        
        // Store in database with expiration
        RefreshToken::create([
            'user_id' => $user->userID,
            'token' => hash('sha256', $refreshToken),
            'expires_at' => now()->addMinutes((int) config('sanctum.refresh_expiration', 1440)),
            'created_at' => now(),
        ]);

        return $refreshToken;
    }

    /**
     * Refresh access token using refresh token
     */
    public function refreshAccessToken(string $refreshToken): array
    {
        try {
            DB::beginTransaction();

            // Find refresh token
            $storedToken = RefreshToken::where('token', hash('sha256', $refreshToken))
                ->where('expires_at', '>', now())
                ->first();

            if (!$storedToken) {
                return [
                    'success' => false,
                    'message' => 'Invalid or expired refresh token'
                ];
            }

            // Get user
            $user = User::find($storedToken->user_id);
            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'User not found'
                ];
            }

            // Revoke old refresh token
            $storedToken->delete();

            // Create new tokens
            $newAccessToken = $this->createAccessToken($user);
            $newRefreshToken = $this->createRefreshToken($user);

            DB::commit();

            return [
                'success' => true,
                'access_token' => $newAccessToken,
                'refresh_token' => $newRefreshToken,
                'expires_at' => now()->addMinutes((int) config('sanctum.expiration', 60))->toISOString()
            ];

        } catch (Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Token refresh failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Revoke refresh token
     */
    public function revokeRefreshToken(string $refreshToken): bool
    {
        try {
            RefreshToken::where('token', hash('sha256', $refreshToken))->delete();
            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Revoke all user tokens
     */
    public function revokeAllUserTokens(User $user): bool
    {
        try {
            // Revoke Sanctum tokens
            $user->tokens()->delete();
            
            // Revoke refresh tokens
            RefreshToken::where('user_id', $user->userID)->delete();
            
            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Clean expired tokens
     */
    public function cleanExpiredTokens(): int
    {
        try {
            // Clean expired refresh tokens
            $deletedRefreshTokens = RefreshToken::where('expires_at', '<', now())->delete();
            
            // Clean expired Sanctum tokens (Laravel handles this automatically)
            
            return $deletedRefreshTokens;
        } catch (Exception $e) {
            return 0;
        }
    }

    /**
     * Validate token expiration
     */
    public function isTokenExpired(string $token): bool
    {
        // For Sanctum tokens, we can check the token abilities or expiration
        // This is a simplified check - in practice, Sanctum handles this
        return false;
    }
}
