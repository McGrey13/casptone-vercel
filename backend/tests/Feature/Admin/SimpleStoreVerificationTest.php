<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Seller;
use App\Models\Store;
use App\Models\Administrator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SimpleStoreVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create an admin user
        $this->admin = User::factory()->create([
            'role' => 'administrator',
            'is_verified' => true
        ]);
        
        $this->admin->administrator()->create([]);
    }

    public function test_admin_can_view_all_stores()
    {
        // Create test stores manually
        $user1 = User::factory()->create(['role' => 'seller']);
        $user2 = User::factory()->create(['role' => 'seller']);
        
        $seller1 = Seller::create([
            'user_id' => $user1->userID,
            'businessName' => 'Test Business 1',
            'story' => 'Test story 1',
            'website' => 'https://test1.com',
        ]);
        
        $seller2 = Seller::create([
            'user_id' => $user2->userID,
            'businessName' => 'Test Business 2',
            'story' => 'Test story 2',
            'website' => 'https://test2.com',
        ]);
        
        Store::create([
            'seller_id' => $seller1->sellerID,
            'user_id' => $seller1->user_id,
            'store_name' => 'Test Store 1',
            'store_description' => 'Test description 1',
            'owner_name' => 'Owner 1',
            'owner_email' => 'owner1@test.com',
            'status' => 'pending'
        ]);
        
        Store::create([
            'seller_id' => $seller2->sellerID,
            'user_id' => $seller2->user_id,
            'store_name' => 'Test Store 2',
            'store_description' => 'Test description 2',
            'owner_name' => 'Owner 2',
            'owner_email' => 'owner2@test.com',
            'status' => 'approved'
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/stores');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'storeID',
                    'store_name',
                    'status',
                    'logo_url',
                    'bir_url',
                    'dti_url',
                    'id_image_url'
                ]
            ]
        ]);
    }

    public function test_admin_can_approve_store()
    {
        $user = User::factory()->create(['role' => 'seller']);
        $seller = Seller::create([
            'user_id' => $user->userID,
            'businessName' => 'Test Business',
            'story' => 'Test story',
            'website' => 'https://test.com',
            'is_verified' => false
        ]);
        
        $store = Store::create([
            'seller_id' => $seller->sellerID,
            'user_id' => $seller->user_id,
            'store_name' => 'Test Store',
            'store_description' => 'Test description',
            'owner_name' => 'Test Owner',
            'owner_email' => 'owner@test.com',
            'status' => 'pending'
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/admin/stores/{$store->storeID}/approve");

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Store approved and seller verified successfully']);

        // Verify store status changed
        $store->refresh();
        $this->assertEquals('approved', $store->status);

        // Verify seller is verified
        $seller->refresh();
        $this->assertTrue($seller->is_verified);
    }

    public function test_admin_can_reject_store_with_reason()
    {
        $user = User::factory()->create(['role' => 'seller']);
        $seller = Seller::create([
            'user_id' => $user->userID,
            'businessName' => 'Test Business',
            'story' => 'Test story',
            'website' => 'https://test.com',
        ]);
        
        $store = Store::create([
            'seller_id' => $seller->sellerID,
            'user_id' => $seller->user_id,
            'store_name' => 'Test Store',
            'store_description' => 'Test description',
            'owner_name' => 'Test Owner',
            'owner_email' => 'owner@test.com',
            'status' => 'pending'
        ]);

        $rejectionReason = 'Incomplete documentation';

        $response = $this->actingAs($this->admin)
            ->postJson("/api/admin/stores/{$store->storeID}/reject", [
                'reason' => $rejectionReason
            ]);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Store rejected successfully']);

        // Verify store status changed
        $store->refresh();
        $this->assertEquals('rejected', $store->status);
        $this->assertEquals($rejectionReason, $store->rejection_reason);
    }

    public function test_admin_can_get_verification_stats()
    {
        // Create test data manually
        $user1 = User::factory()->create(['role' => 'seller']);
        $user2 = User::factory()->create(['role' => 'seller']);
        $user3 = User::factory()->create(['role' => 'seller']);
        
        $seller1 = Seller::create([
            'user_id' => $user1->userID,
            'businessName' => 'Business 1',
            'is_verified' => true
        ]);
        
        $seller2 = Seller::create([
            'user_id' => $user2->userID,
            'businessName' => 'Business 2',
            'is_verified' => true
        ]);
        
        $seller3 = Seller::create([
            'user_id' => $user3->userID,
            'businessName' => 'Business 3',
            'is_verified' => false
        ]);
        
        Store::create([
            'seller_id' => $seller1->sellerID,
            'user_id' => $seller1->user_id,
            'store_name' => 'Store 1',
            'owner_name' => 'Owner 1',
            'owner_email' => 'owner1@test.com',
            'status' => 'pending'
        ]);
        
        Store::create([
            'seller_id' => $seller2->sellerID,
            'user_id' => $seller2->user_id,
            'store_name' => 'Store 2',
            'owner_name' => 'Owner 2',
            'owner_email' => 'owner2@test.com',
            'status' => 'approved'
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/verification-stats');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'total_stores',
            'pending_stores',
            'approved_stores',
            'rejected_stores',
            'verified_sellers',
            'unverified_sellers'
        ]);
    }
}
