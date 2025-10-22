<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Customer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $customers = [
            [
                'userName' => 'John Dela Cruz',
                'userEmail' => 'john.customer@example.com',
                'userContactNumber' => '09123456789',
                'userAddress' => 'Blk 5 Lot 12 Phase 2, Barangay Commonwealth',
                'userCity' => 'Quezon City',
                'userProvince' => 'Metro Manila',
            ],
            [
                'userName' => 'Jane Santos',
                'userEmail' => 'jane.customer@example.com',
                'userContactNumber' => '09234567890',
                'userAddress' => 'Unit 4B Tower 1 Ayala Center, Legazpi Village',
                'userCity' => 'Makati City',
                'userProvince' => 'Metro Manila',
            ],
            [
                'userName' => 'Mike Reyes',
                'userEmail' => 'mike.customer@example.com',
                'userContactNumber' => '09345678901',
                'userAddress' => '789 Colon Street, Barangay Pardo',
                'userCity' => 'Cebu City',
                'userProvince' => 'Cebu',
            ],
            [
                'userName' => 'Maria Garcia',
                'userEmail' => 'maria.garcia@example.com',
                'userContactNumber' => '09456789012',
                'userAddress' => 'Blk 71 Lot 52 Mabuhay City Phase 1, Barangay Baclaran',
                'userCity' => 'Cabuyao',
                'userProvince' => 'Laguna',
            ],
            [
                'userName' => 'Carlos Martinez',
                'userEmail' => 'carlos.martinez@example.com',
                'userContactNumber' => '09567890123',
                'userAddress' => '456 Bonifacio Drive, BGC',
                'userCity' => 'Taguig City',
                'userProvince' => 'Metro Manila',
            ],
            [
                'userName' => 'Elena Rivera',
                'userEmail' => 'elena.rivera@example.com',
                'userContactNumber' => '09678901234',
                'userAddress' => 'Blk 8 Lot 25 Villa Homes Subdivision',
                'userCity' => 'Calamba',
                'userProvince' => 'Laguna',
            ],
            [
                'userName' => 'Pedro Lopez',
                'userEmail' => 'pedro.lopez@example.com',
                'userContactNumber' => '09789012345',
                'userAddress' => '234 National Highway, Barangay San Isidro',
                'userCity' => 'San Pedro',
                'userProvince' => 'Laguna',
            ],
            [
                'userName' => 'Rosa Mendoza',
                'userEmail' => 'rosa.mendoza@example.com',
                'userContactNumber' => '09890123456',
                'userAddress' => 'Purok 3 Barangay San Jose',
                'userCity' => 'Antipolo',
                'userProvince' => 'Rizal',
            ],
            [
                'userName' => 'Luis Torres',
                'userEmail' => 'luis.torres@example.com',
                'userContactNumber' => '09901234567',
                'userAddress' => '567 Commonwealth Avenue, Barangay Holy Spirit',
                'userCity' => 'Quezon City',
                'userProvince' => 'Metro Manila',
            ],
            [
                'userName' => 'Sofia Hernandez',
                'userEmail' => 'sofia.hernandez@example.com',
                'userContactNumber' => '09012345678',
                'userAddress' => 'Blk 15 Lot 7 Green Valley Subdivision',
                'userCity' => 'Lipa',
                'userProvince' => 'Batangas',
            ],
        ];

        foreach ($customers as $customerData) {
            // Check if user already exists
            $existingUser = User::where('userEmail', $customerData['userEmail'])->first();
            
            if (!$existingUser) {
                $user = User::create([
                    'userName' => $customerData['userName'],
                    'userEmail' => $customerData['userEmail'],
                    'userPassword' => Hash::make('password123'),
                    'userContactNumber' => $customerData['userContactNumber'],
                    'userAddress' => $customerData['userAddress'],
                    'userCity' => $customerData['userCity'],
                    'userProvince' => $customerData['userProvince'],
                    'role' => 'customer',
                    'is_verified' => true,
                ]);

                // Create customer profile
                Customer::create([
                    'user_id' => $user->userID,
                    'profile_picture_path' => null,
                ]);

                // Generate Sanctum token
                $token = $user->createToken('customerToken')->plainTextToken;

                echo "\n=================================\n";
                echo "Customer Created:\n";
                echo "Name: {$customerData['userName']}\n";
                echo "Email: {$customerData['userEmail']}\n";
                echo "Password: password123\n";
                echo "API Token: {$token}\n";
                echo "=================================\n";
            } else {
                echo "Customer with email {$customerData['userEmail']} already exists.\n";
            }
        }
    }
}