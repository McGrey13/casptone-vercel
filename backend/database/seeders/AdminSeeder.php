<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Administrator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admins = [
            [
                'userName' => 'Super Admin',
                'userEmail' => 'admin@craftconnect.com',
                'userContactNumber' => '09123456788',
                'userAddress' => 'Admin Office, CraftConnect HQ',
                'userCity' => 'Manila',
                'userProvince' => 'Metro Manila',
            ],
            [
                'userName' => 'Support Admin',
                'userEmail' => 'support@craftconnect.com',
                'userContactNumber' => '09123456787',
                'userAddress' => 'Support Center, CraftConnect',
                'userCity' => 'Makati City',
                'userProvince' => 'Metro Manila',
            ],
        ];

        foreach ($admins as $adminData) {
            // Check if user already exists
            $existingUser = User::where('userEmail', $adminData['userEmail'])->first();
            
            if (!$existingUser) {
                $user = User::create([
                    'userName' => $adminData['userName'],
                    'userEmail' => $adminData['userEmail'],
                    'userPassword' => Hash::make('admin123'),
                    'userContactNumber' => $adminData['userContactNumber'],
                    'userAddress' => $adminData['userAddress'],
                    'userCity' => $adminData['userCity'],
                    'userProvince' => $adminData['userProvince'],
                    'role' => 'administrator',
                    'is_verified' => true,
                ]);

                // Create administrator profile
                Administrator::create([
                    'user_id' => $user->userID,
                    'profile_picture_path' => null,
                ]);

                // Generate Sanctum token
                $token = $user->createToken('adminToken')->plainTextToken;

                echo "\n=================================\n";
                echo "Administrator Created:\n";
                echo "Name: {$adminData['userName']}\n";
                echo "Email: {$adminData['userEmail']}\n";
                echo "Password: admin123\n";
                echo "API Token: {$token}\n";
                echo "=================================\n";
            } else {
                echo "Administrator with email {$adminData['userEmail']} already exists.\n";
            }
        }
    }
}