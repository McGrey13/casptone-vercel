<?php

namespace Tests\Feature\Admin;

use Tests\TestCase;
use App\Models\User;
use App\Models\Seller;
use App\Models\Customer;
use App\Models\Store;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AdminStatsTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create an admin user
        $this->admin = User::factory()->create([
            'role' => 'administrator',
            'userEmail' => 'admin@test.com',
            'userName' => 'Test Admin'
        ]);

        // Create some test users with different roles
        User::factory()->create(['role' => 'customer']);
        User::factory()->create(['role' => 'customer']);
        User::factory()->create(['role' => 'seller']);
        User::factory()->create(['role' => 'seller']);
        
        // Create seller records
        $seller1 = Seller::factory()->create(['user_id' => User::where('role', 'seller')->first()->userID]);
        $seller2 = Seller::factory()->create(['user_id' => User::where('role', 'seller')->skip(1)->first()->userID]);
        
        // Create customer records
        Customer::factory()->create(['user_id' => User::where('role', 'customer')->first()->userID]);
        Customer::factory()->create(['user_id' => User::where('role', 'customer')->skip(1)->first()->userID]);
        
        // Create stores
        Store::factory()->create([
            'seller_id' => $seller1->sellerID,
            'user_id' => $seller1->user_id,
            'status' => 'pending'
        ]);
        
        Store::factory()->create([
            'seller_id' => $seller2->sellerID,
            'user_id' => $seller2->user_id,
            'status' => 'approved'
        ]);

        $this->token = $this->admin->createToken('test')->plainTextToken;
    }

    public function test_admin_can_get_verification_stats_with_user_counts()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json'
        ])->get('/api/admin/verification-stats');

        $response->assertStatus(200);
        
        $data = $response->json();
        
        // Check that all expected fields are present
        $this->assertArrayHasKey('total_stores', $data);
        $this->assertArrayHasKey('pending_stores', $data);
        $this->assertArrayHasKey('approved_stores', $data);
        $this->assertArrayHasKey('rejected_stores', $data);
        $this->assertArrayHasKey('verified_sellers', $data);
        $this->assertArrayHasKey('unverified_sellers', $data);
        $this->assertArrayHasKey('total_customers', $data);
        $this->assertArrayHasKey('total_artisans', $data);
        
        // Check the counts
        $this->assertEquals(2, $data['total_stores']);
        $this->assertEquals(1, $data['pending_stores']);
        $this->assertEquals(1, $data['approved_stores']);
        $this->assertEquals(0, $data['rejected_stores']);
        $this->assertEquals(2, $data['total_customers']);
        $this->assertEquals(2, $data['total_artisans']);
    }

    public function test_non_admin_cannot_access_stats()
    {
        $customer = User::where('role', 'customer')->first();
        $customerToken = $customer->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $customerToken,
            'Accept' => 'application/json'
        ])->get('/api/admin/verification-stats');

        $response->assertStatus(403);
    }
}
