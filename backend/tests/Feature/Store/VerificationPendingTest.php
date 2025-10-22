<?php

namespace Tests\Feature\Store;

use App\Models\User;
use App\Models\Seller;
use App\Models\Store;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VerificationPendingTest extends TestCase
{
    use RefreshDatabase;

    public function test_seller_with_pending_store_redirects_to_verification_pending()
    {
        // Create a user with seller role
        $user = User::factory()->create([
            'role' => 'seller',
            'is_verified' => true
        ]);

        // Create a seller record
        $seller = Seller::create([
            'user_id' => $user->userID,
            'businessName' => 'Test Business',
            'story' => 'Test story',
            'website' => 'https://test.com',
            'is_verified' => false
        ]);

        // Create a pending store
        $store = Store::create([
            'seller_id' => $seller->sellerID,
            'user_id' => $user->userID,
            'store_name' => 'Test Store',
            'store_description' => 'Test store description',
            'owner_name' => 'Test Owner',
            'owner_email' => 'owner@test.com',
            'status' => 'pending'
        ]);

        // Login the user
        $this->actingAs($user);

        // Test accessing seller routes - should be allowed but store is pending
        $response = $this->getJson('/api/stores/me');
        
        $response->assertStatus(200);
        $this->assertEquals('pending', $response->json('store.status'));
    }

    public function test_seller_with_approved_store_has_full_access()
    {
        // Create a user with seller role
        $user = User::factory()->create([
            'role' => 'seller',
            'is_verified' => true
        ]);

        // Create a verified seller
        $seller = Seller::create([
            'user_id' => $user->userID,
            'businessName' => 'Test Business',
            'story' => 'Test story',
            'website' => 'https://test.com',
            'is_verified' => true
        ]);

        // Create an approved store
        $store = Store::create([
            'seller_id' => $seller->sellerID,
            'user_id' => $user->userID,
            'store_name' => 'Test Store',
            'store_description' => 'Test store description',
            'owner_name' => 'Test Owner',
            'owner_email' => 'owner@test.com',
            'status' => 'approved'
        ]);

        // Login the user
        $this->actingAs($user);

        // Test accessing seller routes - should work normally
        $response = $this->getJson('/api/stores/me');
        
        $response->assertStatus(200);
        $this->assertEquals('approved', $response->json('store.status'));
    }

    public function test_seller_without_store_redirects_to_create_store()
    {
        // Create a user with seller role
        $user = User::factory()->create([
            'role' => 'seller',
            'is_verified' => true
        ]);

        // Create a seller record without store
        $seller = Seller::create([
            'user_id' => $user->userID,
            'businessName' => 'Test Business',
            'story' => 'Test story',
            'website' => 'https://test.com',
            'is_verified' => false
        ]);

        // Login the user
        $this->actingAs($user);

        // Test accessing stores/me - should return 404 since no store exists
        $response = $this->getJson('/api/stores/me');
        
        $response->assertStatus(404);
    }

    public function test_verification_workflow_complete()
    {
        // Create a user with seller role
        $user = User::factory()->create([
            'role' => 'seller',
            'is_verified' => true
        ]);

        // Create an unverified seller
        $seller = Seller::create([
            'user_id' => $user->userID,
            'businessName' => 'Test Business',
            'story' => 'Test story',
            'website' => 'https://test.com',
            'is_verified' => false
        ]);
        
        // Ensure seller is not verified
        $seller->update(['is_verified' => false]);

        // Create a pending store
        $store = Store::create([
            'seller_id' => $seller->sellerID,
            'user_id' => $user->userID,
            'store_name' => 'Test Store',
            'store_description' => 'Test store description',
            'owner_name' => 'Test Owner',
            'owner_email' => 'owner@test.com',
            'status' => 'pending'
        ]);

        // Login the user
        $this->actingAs($user);

        // Verify store is pending
        $response = $this->getJson('/api/stores/me');
        $response->assertStatus(200);
        $this->assertEquals('pending', $response->json('store.status'));
        // Seller should not be verified yet (store pending)
        $freshSeller = $seller->fresh();
        $this->assertEquals(0, $freshSeller->is_verified, "Seller is_verified should be 0, got: " . $freshSeller->is_verified);

        // Admin approves the store
        $admin = User::factory()->create(['role' => 'administrator']);
        $admin->administrator()->create([]);
        
        $approveResponse = $this->actingAs($admin)
            ->postJson("/api/admin/stores/{$store->storeID}/approve");
        
        $approveResponse->assertStatus(200);

        // Verify store and seller are now approved/verified
        $store->refresh();
        $seller->refresh();
        
        $this->assertEquals('approved', $store->status);
        $this->assertEquals(1, $seller->is_verified);
    }
}
