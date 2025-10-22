<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Seller;
use App\Models\Store;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminStoreFetchingBypassTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_fetch_stores_without_middleware()
    {
        // Create admin user
        $admin = User::factory()->create(['role' => 'administrator']);

        // Create some test stores
        $seller1 = Seller::create([
            'user_id' => User::factory()->create(['role' => 'seller'])->userID,
            'businessName' => 'Test Business 1',
            'story' => 'Test story 1',
            'website' => 'https://test1.com',
            'is_verified' => false
        ]);

        $seller2 = Seller::create([
            'user_id' => User::factory()->create(['role' => 'seller'])->userID,
            'businessName' => 'Test Business 2',
            'story' => 'Test story 2',
            'website' => 'https://test2.com',
            'is_verified' => false
        ]);

        // Create stores with different statuses
        $store1 = Store::create([
            'seller_id' => $seller1->sellerID,
            'user_id' => $seller1->user_id,
            'store_name' => 'Test Store 1',
            'store_description' => 'Test store 1 description',
            'owner_name' => 'Test Owner 1',
            'owner_email' => 'owner1@test.com',
            'status' => 'pending'
        ]);

        $store2 = Store::create([
            'seller_id' => $seller2->sellerID,
            'user_id' => $seller2->user_id,
            'store_name' => 'Test Store 2',
            'store_description' => 'Test store 2 description',
            'owner_name' => 'Test Owner 2',
            'owner_email' => 'owner2@test.com',
            'status' => 'approved'
        ]);

        // Test fetching all stores by directly calling the controller
        $response = $this->actingAs($admin)
            ->withoutMiddleware()
            ->getJson('/api/admin/stores');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'storeID',
                    'store_name',
                    'status',
                    'owner_name',
                    'owner_email',
                    'created_at',
                    'updated_at'
                ]
            ]
        ]);

        $stores = $response->json('data');
        $this->assertCount(2, $stores);
    }

    public function test_admin_can_filter_stores_by_status_without_middleware()
    {
        // Create admin user
        $admin = User::factory()->create(['role' => 'administrator']);

        // Create test stores with different statuses
        $seller1 = Seller::create([
            'user_id' => User::factory()->create(['role' => 'seller'])->userID,
            'businessName' => 'Test Business 1',
            'story' => 'Test story 1',
            'website' => 'https://test1.com',
            'is_verified' => false
        ]);

        $seller2 = Seller::create([
            'user_id' => User::factory()->create(['role' => 'seller'])->userID,
            'businessName' => 'Test Business 2',
            'story' => 'Test story 2',
            'website' => 'https://test2.com',
            'is_verified' => false
        ]);

        $store1 = Store::create([
            'seller_id' => $seller1->sellerID,
            'user_id' => $seller1->user_id,
            'store_name' => 'Pending Store',
            'store_description' => 'Pending store description',
            'owner_name' => 'Pending Owner',
            'owner_email' => 'pending@test.com',
            'status' => 'pending'
        ]);

        $store2 = Store::create([
            'seller_id' => $seller2->sellerID,
            'user_id' => $seller2->user_id,
            'store_name' => 'Approved Store',
            'store_description' => 'Approved store description',
            'owner_name' => 'Approved Owner',
            'owner_email' => 'approved@test.com',
            'status' => 'approved'
        ]);

        // Test filtering by pending status
        $response = $this->actingAs($admin)
            ->withoutMiddleware()
            ->getJson('/api/admin/stores?status=pending');

        $response->assertStatus(200);
        $stores = $response->json('data');
        $this->assertCount(1, $stores);
        $this->assertEquals('pending', $stores[0]['status']);

        // Test filtering by approved status
        $response = $this->actingAs($admin)
            ->withoutMiddleware()
            ->getJson('/api/admin/stores?status=approved');

        $response->assertStatus(200);
        $stores = $response->json('data');
        $this->assertCount(1, $stores);
        $this->assertEquals('approved', $stores[0]['status']);
    }

    public function test_admin_can_search_stores_without_middleware()
    {
        // Create admin user
        $admin = User::factory()->create(['role' => 'administrator']);

        // Create test stores
        $seller1 = Seller::create([
            'user_id' => User::factory()->create(['role' => 'seller'])->userID,
            'businessName' => 'Test Business 1',
            'story' => 'Test story 1',
            'website' => 'https://test1.com',
            'is_verified' => false
        ]);

        $seller2 = Seller::create([
            'user_id' => User::factory()->create(['role' => 'seller'])->userID,
            'businessName' => 'Test Business 2',
            'story' => 'Test story 2',
            'website' => 'https://test2.com',
            'is_verified' => false
        ]);

        $store1 = Store::create([
            'seller_id' => $seller1->sellerID,
            'user_id' => $seller1->user_id,
            'store_name' => 'Craft Store',
            'store_description' => 'Craft store description',
            'owner_name' => 'John Doe',
            'owner_email' => 'john@test.com',
            'status' => 'pending'
        ]);

        $store2 = Store::create([
            'seller_id' => $seller2->sellerID,
            'user_id' => $seller2->user_id,
            'store_name' => 'Art Store',
            'store_description' => 'Art store description',
            'owner_name' => 'Jane Smith',
            'owner_email' => 'jane@test.com',
            'status' => 'pending'
        ]);

        // Test searching by store name
        $response = $this->actingAs($admin)
            ->withoutMiddleware()
            ->getJson('/api/admin/stores?search=Craft');

        $response->assertStatus(200);
        $stores = $response->json('data');
        $this->assertCount(1, $stores);
        $this->assertEquals('Craft Store', $stores[0]['store_name']);

        // Test searching by owner name
        $response = $this->actingAs($admin)
            ->withoutMiddleware()
            ->getJson('/api/admin/stores?search=Jane');

        $response->assertStatus(200);
        $stores = $response->json('data');
        $this->assertCount(1, $stores);
        $this->assertEquals('Jane Smith', $stores[0]['owner_name']);
    }

    public function test_admin_can_get_verification_stats_without_middleware()
    {
        // Create admin user
        $admin = User::factory()->create(['role' => 'administrator']);

        // Create test stores with different statuses
        $seller1 = Seller::create([
            'user_id' => User::factory()->create(['role' => 'seller'])->userID,
            'businessName' => 'Test Business 1',
            'story' => 'Test story 1',
            'website' => 'https://test1.com',
            'is_verified' => false
        ]);

        $seller2 = Seller::create([
            'user_id' => User::factory()->create(['role' => 'seller'])->userID,
            'businessName' => 'Test Business 2',
            'story' => 'Test story 2',
            'website' => 'https://test2.com',
            'is_verified' => false
        ]);

        $seller3 = Seller::create([
            'user_id' => User::factory()->create(['role' => 'seller'])->userID,
            'businessName' => 'Test Business 3',
            'story' => 'Test story 3',
            'website' => 'https://test3.com',
            'is_verified' => false
        ]);

        $store1 = Store::create([
            'seller_id' => $seller1->sellerID,
            'user_id' => $seller1->user_id,
            'store_name' => 'Pending Store',
            'store_description' => 'Pending store description',
            'owner_name' => 'Pending Owner',
            'owner_email' => 'pending@test.com',
            'status' => 'pending'
        ]);

        $store2 = Store::create([
            'seller_id' => $seller2->sellerID,
            'user_id' => $seller2->user_id,
            'store_name' => 'Approved Store',
            'store_description' => 'Approved store description',
            'owner_name' => 'Approved Owner',
            'owner_email' => 'approved@test.com',
            'status' => 'approved'
        ]);

        $store3 = Store::create([
            'seller_id' => $seller3->sellerID,
            'user_id' => $seller3->user_id,
            'store_name' => 'Rejected Store',
            'store_description' => 'Rejected store description',
            'owner_name' => 'Rejected Owner',
            'owner_email' => 'rejected@test.com',
            'status' => 'rejected'
        ]);

        // Test getting verification stats
        $response = $this->actingAs($admin)
            ->withoutMiddleware()
            ->getJson('/api/admin/verification-stats');

        $response->assertStatus(200);
        $stats = $response->json();
        
        $this->assertArrayHasKey('total_stores', $stats);
        $this->assertArrayHasKey('pending_stores', $stats);
        $this->assertArrayHasKey('approved_stores', $stats);
        $this->assertArrayHasKey('rejected_stores', $stats);
        
        $this->assertEquals(3, $stats['total_stores']);
        $this->assertEquals(1, $stats['pending_stores']);
        $this->assertEquals(1, $stats['approved_stores']);
        $this->assertEquals(1, $stats['rejected_stores']);
    }
}
