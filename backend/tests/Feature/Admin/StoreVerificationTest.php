<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Seller;
use App\Models\Store;
use App\Models\Administrator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StoreVerificationTest extends TestCase
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
        // Create test stores
        $seller1 = Seller::factory()->create();
        $seller2 = Seller::factory()->create();
        
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
        $seller = Seller::factory()->create();
        $store = Store::factory()->create([
            'seller_id' => $seller->sellerID,
            'user_id' => $seller->user_id,
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
        $seller = Seller::factory()->create();
        $store = Store::factory()->create([
            'seller_id' => $seller->sellerID,
            'user_id' => $seller->user_id,
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

    public function test_admin_can_view_store_documents()
    {
        $seller = Seller::factory()->create();
        $store = Store::factory()->create([
            'seller_id' => $seller->sellerID,
            'user_id' => $seller->user_id,
            'logo_path' => 'stores/logos/test.jpg',
            'bir_path' => 'stores/bir/test.pdf',
            'dti_path' => 'stores/dti/test.pdf',
            'id_image_path' => 'stores/id_images/test.jpg',
            'id_type' => 'UMID',
            'tin_number' => '123-456-789-000'
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/stores/{$store->storeID}/documents");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'store_id',
            'store_name',
            'owner_name',
            'tin_number',
            'documents' => [
                'logo',
                'bir_permit',
                'dti_permit',
                'id_document'
            ]
        ]);
    }

    public function test_admin_can_get_verification_stats()
    {
        // Create test data
        Seller::factory()->count(3)->create(['is_verified' => true]);
        Seller::factory()->count(2)->create(['is_verified' => false]);
        
        Store::factory()->count(2)->create(['status' => 'pending']);
        Store::factory()->count(3)->create(['status' => 'approved']);
        Store::factory()->count(1)->create(['status' => 'rejected']);

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

    public function test_seller_cannot_add_product_without_verified_store()
    {
        $seller = Seller::factory()->create(['is_verified' => false]);
        $user = $seller->user;
        
        // Create a pending store (not approved)
        Store::factory()->create([
            'seller_id' => $seller->sellerID,
            'user_id' => $user->userID,
            'status' => 'pending'
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/products', [
                'productName' => 'Test Product',
                'productDescription' => 'Test Description',
                'productPrice' => 100.00,
                'productQuantity' => 10,
                'category' => 'Test Category'
            ]);

        $response->assertStatus(403);
        $response->assertJson([
            'error' => 'Store verification required'
        ]);
    }

    public function test_seller_can_add_product_with_verified_store()
    {
        $seller = Seller::factory()->create(['is_verified' => true]);
        $user = $seller->user;
        
        // Create an approved store
        Store::factory()->create([
            'seller_id' => $seller->sellerID,
            'user_id' => $user->userID,
            'status' => 'approved'
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/products', [
                'productName' => 'Test Product',
                'productDescription' => 'Test Description',
                'productPrice' => 100.00,
                'productQuantity' => 10,
                'category' => 'Test Category'
            ]);

        $response->assertStatus(201);
    }
}
