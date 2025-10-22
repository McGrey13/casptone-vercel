<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CustomerProfileController extends Controller
{
    /**
     * Get customer profile with profile picture
     */
    public function getProfile(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Get or create customer profile
        $customer = Customer::firstOrCreate(
            ['user_id' => $user->userID],
            ['profile_picture_path' => null]
        );

        return response()->json([
            'user' => $user,
            'customer' => $customer,
            'profile_picture_url' => $customer->profile_picture_path 
                ? asset('storage/' . $customer->profile_picture_path) 
                : null
        ]);
    }

    /**
     * Update customer profile picture
     */
    public function updateProfilePicture(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        Log::info('Profile picture update request', [
            'user_id' => $user->userID,
            'has_file' => $request->hasFile('profile_picture'),
            'files' => $request->allFiles()
        ]);

        $request->validate([
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:5120', // 5MB max
        ]);

        try {
            // Get or create customer profile
            $customer = Customer::firstOrCreate(
                ['user_id' => $user->userID],
                ['profile_picture_path' => null]
            );

            // Delete old profile picture if exists
            if ($customer->profile_picture_path) {
                $oldPath = public_path('storage/' . $customer->profile_picture_path);
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                    Log::info('Deleted old profile picture', ['path' => $oldPath]);
                }
            }

            // Store new profile picture
            $file = $request->file('profile_picture');
            $filename = 'customer_' . $user->userID . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('customer-profile-pictures', $filename, 'public');
            
            Log::info('Profile picture stored', [
                'path' => $path,
                'filename' => $filename
            ]);

            // Update customer profile
            $customer->update(['profile_picture_path' => $path]);

            return response()->json([
                'message' => 'Profile picture updated successfully',
                'profile_picture_path' => $path,
                'profile_picture_url' => asset('storage/' . $path)
            ], 200);

        } catch (\Exception $e) {
            Log::error('Profile picture update failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to update profile picture',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update customer profile information
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        Log::info('Profile update request', [
            'user_id' => $user->userID,
            'has_file' => $request->hasFile('profile_picture'),
            'request_keys' => array_keys($request->all()),
            'files' => $request->allFiles(),
            'content_type' => $request->header('Content-Type')
        ]);

        // Debug file details if present
        if ($request->hasFile('profile_picture')) {
            $file = $request->file('profile_picture');
            Log::info('File details', [
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'extension' => $file->getClientOriginalExtension(),
                'is_valid' => $file->isValid(),
                'error' => $file->getError()
            ]);
        }

        // Custom validation for profile picture
        $profilePictureValid = true;
        $profilePictureError = null;
        
        if ($request->hasFile('profile_picture')) {
            $file = $request->file('profile_picture');
            $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
            
            if (!$file->isValid()) {
                $profilePictureValid = false;
                $profilePictureError = 'File upload failed';
            } elseif (!in_array($file->getMimeType(), $allowedTypes)) {
                $profilePictureValid = false;
                $profilePictureError = 'Invalid file type: ' . $file->getMimeType();
            } elseif (!in_array(strtolower($file->getClientOriginalExtension()), $allowedExtensions)) {
                $profilePictureValid = false;
                $profilePictureError = 'Invalid file extension: ' . $file->getClientOriginalExtension();
            } elseif ($file->getSize() > 5120 * 1024) { // 5MB
                $profilePictureValid = false;
                $profilePictureError = 'File too large';
            }
        }
        
        if (!$profilePictureValid) {
            return response()->json([
                'message' => 'Profile picture validation failed',
                'error' => $profilePictureError
            ], 422);
        }

        $request->validate([
            'userName' => 'nullable|string|max:100',
            'userEmail' => 'nullable|email|max:100|unique:users,userEmail,' . $user->userID . ',userID',
            'userContactNumber' => 'nullable|string|max:20',
            'userAddress' => 'nullable|string|max:255',
            'userCity' => 'nullable|string|max:100',
            'userPostalCode' => 'nullable|string|max:20',
        ]);

        try {
            // Get or create customer profile
            $customer = Customer::firstOrCreate(
                ['user_id' => $user->userID],
                ['profile_picture_path' => null]
            );

            // Update user information
            $updateData = [];
            if ($request->has('userName')) $updateData['userName'] = $request->userName;
            if ($request->has('userEmail')) $updateData['userEmail'] = $request->userEmail;
            if ($request->has('userContactNumber')) $updateData['userContactNumber'] = $request->userContactNumber;
            if ($request->has('userAddress')) $updateData['userAddress'] = $request->userAddress;
            if ($request->has('userCity')) $updateData['userCity'] = $request->userCity;
            if ($request->has('userPostalCode')) $updateData['userPostalCode'] = $request->userPostalCode;

            if (!empty($updateData)) {
                $user->update($updateData);
            }

            // Handle profile picture upload
            if ($request->hasFile('profile_picture')) {
                Log::info('Profile picture file detected', [
                    'user_id' => $user->userID,
                    'original_name' => $request->file('profile_picture')->getClientOriginalName(),
                    'size' => $request->file('profile_picture')->getSize()
                ]);
                
                // Delete old profile picture if exists
                if ($customer->profile_picture_path) {
                    $oldPath = public_path('storage/' . $customer->profile_picture_path);
                    if (file_exists($oldPath)) {
                        unlink($oldPath);
                    }
                }

                // Store new profile picture
                $file = $request->file('profile_picture');
                $filename = 'customer_' . $user->userID . '_' . time() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('customer-profile-pictures', $filename, 'public');
                
                Log::info('Profile picture stored', [
                    'path' => $path,
                    'filename' => $filename
                ]);
                
                $customer->update(['profile_picture_path' => $path]);
            }

            // Refresh data
            $user->refresh();
            $customer->refresh();

            Log::info('Profile update completed', [
                'user_id' => $user->userID,
                'profile_picture_path' => $customer->profile_picture_path,
                'profile_picture_url' => $customer->profile_picture_path 
                    ? asset('storage/' . $customer->profile_picture_path) 
                    : null
            ]);

            $response = [
                'message' => 'Profile updated successfully',
                'user' => $user,
                'customer' => $customer,
                'profile_picture_url' => $customer->profile_picture_path 
                    ? asset('storage/' . $customer->profile_picture_path) 
                    : null
            ];

            Log::info('Sending response', $response);

            return response()->json($response, 200);

        } catch (\Exception $e) {
            Log::error('Profile update failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete customer profile picture
     */
    public function deleteProfilePicture(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        try {
            $customer = Customer::where('user_id', $user->userID)->first();
            
            if (!$customer || !$customer->profile_picture_path) {
                return response()->json(['message' => 'No profile picture to delete'], 404);
            }

            // Delete the file
            $oldPath = public_path('storage/' . $customer->profile_picture_path);
            if (file_exists($oldPath)) {
                unlink($oldPath);
            }

            // Update database
            $customer->update(['profile_picture_path' => null]);

            return response()->json([
                'message' => 'Profile picture deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete profile picture',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

