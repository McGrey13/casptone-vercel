<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\Seller;
use App\Models\Store;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SellerRedirectTest extends TestCase
{
    use RefreshDatabase;

    public function test_seller_without_store_gets_redirected_to_create_store()
    {
        // Create a user with seller role
        $user = User::factory()->create([
            'role' => 'seller',
            'is_verified' => true
        ]);

        // Create a seller record for the user
        $seller = Seller::create([
            'user_id' => $user->userID,
            'businessName' => 'Test Business',
            'story' => 'Test story',
            'website' => 'https://test.com',
        ]);

        // Login the user
        $response = $this->postJson('/api/login', [
            'userEmail' => $user->userEmail,
            'userPassword' => 'password', // Assuming default password
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'redirectTo' => '/create-store'
        ]);
    }

    public function test_seller_with_store_does_not_get_redirected()
    {
        // Create a user with seller role
        $user = User::factory()->create([
            'role' => 'seller',
            'is_verified' => true
        ]);

        // Create a seller record for the user
        $seller = Seller::create([
            'user_id' => $user->userID,
            'businessName' => 'Test Business',
            'story' => 'Test story',
            'website' => 'https://test.com',
        ]);

        // Create a store for the seller
        Store::create([
            'seller_id' => $seller->sellerID,
            'user_id' => $user->userID,
            'store_name' => 'Test Store',
            'store_description' => 'Test store description',
            'owner_name' => 'Test Owner',
            'owner_email' => 'owner@test.com',
            'status' => 'approved',
        ]);

        // Login the user
        $response = $this->postJson('/api/login', [
            'userEmail' => $user->userEmail,
            'userPassword' => 'password', // Assuming default password
        ]);

        $response->assertStatus(200);
        $response->assertJsonMissing(['redirectTo']);
    }

    public function test_customer_does_not_get_redirected()
    {
        // Create a user with customer role
        $user = User::factory()->create([
            'role' => 'customer',
            'is_verified' => true
        ]);

        // Login the user
        $response = $this->postJson('/api/login', [
            'userEmail' => $user->userEmail,
            'userPassword' => 'password', // Assuming default password
        ]);

        $response->assertStatus(200);
        $response->assertJsonMissing(['redirectTo']);
    }
}
