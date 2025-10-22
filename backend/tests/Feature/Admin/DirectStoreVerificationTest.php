<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Seller;
use App\Models\Store;
use App\Models\Administrator;
use App\Http\Controllers\Auth\AdminController;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DirectStoreVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected $adminController;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->adminController = new AdminController();
    }

    public function test_admin_controller_can_get_all_stores()
    {
        // Create test data
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

        // Test the controller method directly
        $request = new \Illuminate\Http\Request();
        $response = $this->adminController->getAllStores($request);

        $this->assertEquals(200, $response->getStatusCode());
        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('data', $data);
        $this->assertCount(2, $data['data']);
    }

    public function test_admin_controller_can_approve_store()
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

        // Test the controller method directly
        $response = $this->adminController->approveStore($store->storeID);

        $this->assertEquals(200, $response->getStatusCode());
        $data = json_decode($response->getContent(), true);
        $this->assertEquals('Store approved and seller verified successfully', $data['message']);

        // Verify store status changed
        $store->refresh();
        $this->assertEquals('approved', $store->status);

        // Verify seller is verified
        $seller->refresh();
        $this->assertEquals(1, $seller->is_verified, "Seller is_verified should be 1, got: " . $seller->is_verified);
    }

    public function test_admin_controller_can_reject_store()
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

        // Test the controller method directly
        $request = new \Illuminate\Http\Request();
        $request->merge(['reason' => $rejectionReason]);
        $response = $this->adminController->rejectStore($request, $store->storeID);

        $this->assertEquals(200, $response->getStatusCode());
        $data = json_decode($response->getContent(), true);
        $this->assertEquals('Store rejected successfully', $data['message']);

        // Verify store status changed
        $store->refresh();
        $this->assertEquals('rejected', $store->status);
        $this->assertEquals($rejectionReason, $store->rejection_reason);
    }

    public function test_admin_controller_can_get_verification_stats()
    {
        // Create test data
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

        // Test the controller method directly
        $response = $this->adminController->getVerificationStats();

        $this->assertEquals(200, $response->getStatusCode());
        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('total_stores', $data);
        $this->assertArrayHasKey('pending_stores', $data);
        $this->assertArrayHasKey('approved_stores', $data);
        $this->assertArrayHasKey('rejected_stores', $data);
        $this->assertArrayHasKey('verified_sellers', $data);
        $this->assertArrayHasKey('unverified_sellers', $data);
    }
}
