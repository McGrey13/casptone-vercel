<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Seller;
use App\Models\Customer;
use App\Models\Administrator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'userName' => 'Gio Mc Grey O. Calugas',
                'userEmail' => 'giocalugas@example.com',
                'role' => 'customer',
                'userContactNumber' => '09123456789',
                'userAddress' => 'Blk 71 Lot 52, Mabuhay City, Phase 1, Barangay Baclaran',
                'userCity' => 'Cabuyao City',
                'userProvince' => 'Laguna',
            ],

            [
                'userName' => 'Shewiliz Antinero',
                'userEmail' => 'shewilizantin@example.com',
                'role' => 'customer',
                'userContactNumber' => '09234567890',
                'userAddress' => 'Blk 12 Lot 8 Springville Subdivision, Barangay Marinig',
                'userCity' => 'Cabuyao City',
                'userProvince' => 'Laguna',
            ],

            [
                'userName' => 'Denisse Kaith Malabana',
                'userEmail' => 'denissekaith@example.com',
                'role' => 'customer',
                'userContactNumber' => '09345678901',
                'userAddress' => 'Blk 25 Lot 15 Vista Verde Executive Village, Barangay Pulo',
                'userCity' => 'Cabuyao',
                'userProvince' => 'Laguna',
            ],

            [
                'userName' => 'Alex Manalo',
                'userEmail' => 'alexmanalo@example.com',
                'role' => 'seller',
                'userContactNumber' => '09456789012',
                'userAddress' => '234 Real Street, Barangay Real',
                'userCity' => 'Calamba City',
                'userProvince' => 'Laguna',
            ],

            [
                'userName' => 'Galan Joaquin',
                'userEmail' => 'kuyagala@example.com',
                'role' => 'seller',
                'userContactNumber' => '09567890123',
                'userAddress' => 'Purok 2, Barangay San Antonio',
                'userCity' => 'Pila',
                'userProvince' => 'Laguna',
            ],

            [
                'userName' => 'Renel Baltralo',
                'userEmail' => 'renel@example.com',
                'role' => 'seller',
                'userContactNumber' => '09678901234',
                'userAddress' => 'Sitio Malvar, Barangay Mojon',
                'userCity' => 'Pila',
                'userProvince' => 'Laguna',
            ],

            [
                'userName' => 'Tatay Cesar',
                'userEmail' => 'tataycesar@example.com',
                'role' => 'seller',
                'userContactNumber' => '09789012345',
                'userAddress' => '456 Rizal Avenue, Barangay Labuin',
                'userCity' => 'Pila',
                'userProvince' => 'Laguna',
            ],

            [
                'userName' => 'Tatay Tiko',
                'userEmail' => 'tataytiko@example.com',
                'role' => 'seller',
                'userContactNumber' => '09890123456',
                'userAddress' => 'Purok 5 Duhat, Barangay Duhat',
                'userCity' => 'Sta. Cruz',
                'userProvince' => 'Laguna',
            ],

            [
                'userName' => 'Mami Baby',
                'userEmail' => 'mamibaby@example.com',
                'role' => 'seller',
                'userContactNumber' => '09901234567',
                'userAddress' => 'Blk 3 Lot 18 Southville Subdivision, Barangay Canlalay',
                'userCity' => 'Binan City',
                'userProvince' => 'Laguna',
            ],

            [
                'userName' => 'Woodcrafters ',
                'userEmail' => 'woodcrafter@example.com',
                'role' => 'seller',
                'userContactNumber' => '09012345678',
                'userAddress' => '789 Platero Street, Barangay Platero',
                'userCity' => 'Binan City',
                'userProvince' => 'Laguna',
            ],


            [
                'userName' => 'adminuser',
                'userEmail' => 'adminuser@example.com',
                'role' => 'administrator',
                'userContactNumber' => '09123456791',
                'userAddress' => '789 Admin Boulevard, Manila',
                'userCity' => 'Manila',
                'userProvince' => 'Metro Manila',
            ],
        ];

        foreach ($users as $userData) {
            // Check if user already exists
            $existingUser = User::where('userEmail', $userData['userEmail'])->first();
            
            if ($existingUser) {
                echo "User with email {$userData['userEmail']} already exists. Skipping...\n";
                continue;
            }

            $user = User::create([
                'userName' => $userData['userName'],
                'userEmail' => $userData['userEmail'],
                'userPassword' => Hash::make('password123'),
                'userContactNumber' => $userData['userContactNumber'],
                'userAddress' => $userData['userAddress'],
                'userCity' => $userData['userCity'],
                'userProvince' => $userData['userProvince'],
                'role' => $userData['role'],
                'is_verified' => true, // bypass 2FA
            ]);

            // Create role-specific profile only if table exists
            switch ($user->role) {
                case 'customer':
                    if (Schema::hasTable('customers')) {
                        Customer::create([
                            'user_id' => $user->userID,
                            'profile_picture_path' => null,
                        ]);
                    } else {
                        echo "Warning: customers table does not exist. Skipping customer profile creation.\n";
                    }
                    break;

                case 'seller':
                    if (Schema::hasTable('sellers')) {
                        Seller::create([
                            'user_id' => $user->userID,
                            'businessName' => $user->userName . "'s Shop",
                            'story' => 'This is the story of ' . $user->userName,
                            'website' => null,
                            'profile_picture_path' => null,
                            'background_picture_path' => null,
                            'promotional_video_path' => null,
                        ]);
                    } else {
                        echo "Warning: sellers table does not exist. Skipping seller profile creation.\n";
                    }
                    break;

                case 'administrator':
                    if (Schema::hasTable('administrators')) {
                        Administrator::create([
                            'user_id' => $user->userID,
                            'profile_picture_path' => null,
                        ]);
                    } else {
                        echo "Warning: administrators table does not exist. Skipping administrator profile creation.\n";
                    }
                    break;
            }

            // Generate Sanctum token
            $token = $user->createToken($userData['role'] . 'Token')->plainTextToken;

            // Print info in console
            echo "\n=================================\n";
            echo ucfirst($userData['role']) . " User Created:\n";
            echo "Name: {$userData['userName']}\n";
            echo "Email: {$userData['userEmail']}\n";
            echo "Password: password123\n";
            echo "API Token: {$token}\n";
            echo "=================================\n";
        }
        
        // Run customer seeder to create additional customers
        $this->call([
            \Database\Seeders\CustomerSeeder::class,
        ]);
        
        // Run product seeder after creating users and sellers
        $this->call([
            \Database\Seeders\ProductSeeder::class,
        ]);

        // Run analytics data seeder after creating products
        $this->call([
            \Database\Seeders\AnalyticsDataSeeder::class,
        ]);

        // Run commission data seeder after creating all data
        $this->call([
            \Database\Seeders\CommissionDataSeeder::class,
        ]);
    }
}