<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Seller;
use App\Models\Store;
use App\Http\Controllers\Auth\AdminController;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminStoreFetchingDirectTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_controller_can_get_all_stores()
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

        // Create a request with admin user
        $request = new \Illuminate\Http\Request();
        $request->setUserResolver(function () use ($admin) {
            return $admin;
        });

        // Test the controller method directly
        $controller = new AdminController();
        $response = $controller->getAllStores($request);

        $this->assertEquals(200, $response->getStatusCode());
        
        $data = $response->getData(true);
        $this->assertArrayHasKey('data', $data);
        $this->assertCount(2, $data['data']);
    }

    public function test_admin_controller_can_filter_stores_by_status()
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

        // Create a request with status filter
        $request = new \Illuminate\Http\Request(['status' => 'pending']);
        $request->setUserResolver(function () use ($admin) {
            return $admin;
        });

        // Test the controller method directly
        $controller = new AdminController();
        $response = $controller->getAllStores($request);

        $this->assertEquals(200, $response->getStatusCode());
        
        $data = $response->getData(true);
        $this->assertArrayHasKey('data', $data);
        $this->assertCount(1, $data['data']);
        $this->assertEquals('pending', $data['data'][0]['status']);
    }

    public function test_admin_controller_can_search_stores()
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

        // Create a request with search term
        $request = new \Illuminate\Http\Request(['search' => 'Craft']);
        $request->setUserResolver(function () use ($admin) {
            return $admin;
        });

        // Test the controller method directly
        $controller = new AdminController();
        $response = $controller->getAllStores($request);

        $this->assertEquals(200, $response->getStatusCode());
        
        $data = $response->getData(true);
        $this->assertArrayHasKey('data', $data);
        $this->assertCount(1, $data['data']);
        $this->assertEquals('Craft Store', $data['data'][0]['store_name']);
    }
}
