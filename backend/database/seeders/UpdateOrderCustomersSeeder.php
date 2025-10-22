<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Customer;
use App\Models\Order;
use Carbon\Carbon;
use Faker\Factory as Faker;

class UpdateOrderCustomersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        $this->command->info('🔄 Starting Order Customer Update Seeder...');
        
        // Update existing orders with proper customer relationships
        $this->updateExistingOrders();
        
        $this->command->info('✅ Order Customer Update completed successfully!');
    }

    private function updateExistingOrders()
    {
        $this->command->info('📝 Updating existing orders with proper customer relationships...');

        // Get all orders that might have missing customer relationships
        $orders = Order::whereDoesntHave('customer')->orWhereHas('customer', function($query) {
            $query->whereDoesntHave('user');
        })->get();

        if ($orders->isEmpty()) {
            $this->command->info('✅ All orders already have proper customer relationships!');
            return;
        }

        $this->command->info("Found {$orders->count()} orders to update...");

        // Get existing customers
        $existingCustomers = Customer::with('user')->get();
        
        if ($existingCustomers->isEmpty()) {
            $this->command->warn('⚠️ No existing customers found. Creating new customers...');
            $this->createCustomersForOrders($orders);
            return;
        }

        // Update orders with existing customers
        foreach ($orders as $order) {
            $customer = $existingCustomers->random();
            
            $order->update([
                'customer_id' => $customer->customerID,
                'updated_at' => Carbon::now(),
            ]);

            $this->command->info("✅ Updated order #{$order->orderID} with customer: {$customer->user->userName}");
        }
    }

    private function createCustomersForOrders($orders)
    {
        $faker = Faker::create();
        
        // Create customers for orders that don't have them
        $customerCount = max(10, ceil($orders->count() / 3)); // At least 10 customers
        
        for ($i = 0; $i < $customerCount; $i++) {
            // Create user with customer role
            $user = User::create([
                'userName' => $faker->name(),
                'userEmail' => $faker->unique()->safeEmail(),
                'userPassword' => bcrypt('password123'),
                'role' => 'customer',
                'userContactNumber' => $faker->phoneNumber(),
                'userAddress' => $faker->address(),
                'userCity' => $faker->city(),
                'userProvince' => $faker->state(),
                'is_verified' => true,
                'created_at' => Carbon::now()->subDays(rand(1, 90)),
                'updated_at' => Carbon::now()->subDays(rand(1, 30)),
            ]);

            // Create customer record
            $customer = Customer::create([
                'user_id' => $user->userID,
                'profile_picture_path' => null,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ]);

            $this->command->info("👤 Created customer: {$user->userName} (ID: {$customer->customerID})");
        }

        // Now update orders with the new customers
        $newCustomers = Customer::with('user')->get();
        
        foreach ($orders as $order) {
            $customer = $newCustomers->random();
            
            $order->update([
                'customer_id' => $customer->customerID,
                'updated_at' => Carbon::now(),
            ]);

            $this->command->info("✅ Updated order #{$order->orderID} with customer: {$customer->user->userName}");
        }
    }
}
