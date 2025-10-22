<?php

namespace Tests\Feature\Store;

use App\Models\User;
use App\Models\Seller;
use App\Models\Store;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StoreCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_store_with_verification_documents()
    {
        Storage::fake('public');

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

        // Create test files
        $logoFile = UploadedFile::fake()->create('logo.jpg', 1000, 'image/jpeg');
        $birFile = UploadedFile::fake()->create('bir.pdf', 1000, 'application/pdf');
        $dtiFile = UploadedFile::fake()->create('dti.pdf', 1000, 'application/pdf');
        $idFile = UploadedFile::fake()->create('id.jpg', 1000, 'image/jpeg');

        // Login the user
        $this->actingAs($user);

        // Create store with all new fields
        $response = $this->postJson('/api/stores', [
            'store_name' => 'Test Store',
            'store_description' => 'Test store description',
            'category' => 'Native Handicraft',
            'logo' => $logoFile,
            'bir' => $birFile,
            'dti' => $dtiFile,
            'id_image' => $idFile,
            'id_type' => 'UMID',
            'tin_number' => '123-456-789-000',
            'owner_name' => 'Test Owner',
            'owner_email' => 'owner@test.com',
            'owner_phone' => '1234567890',
            'owner_address' => 'Test Address',
        ]);

        $response->assertStatus(201);

        // Verify store was created with all fields
        $store = Store::first();
        $this->assertNotNull($store);
        $this->assertEquals('Test Store', $store->store_name);
        $this->assertEquals('123-456-789-000', $store->tin_number);
        $this->assertEquals('UMID', $store->id_type);
        $this->assertNotNull($store->bir_path);
        $this->assertNotNull($store->dti_path);
        $this->assertNotNull($store->id_image_path);
        $this->assertNotNull($store->logo_path);

        // Verify files were stored
        Storage::disk('public')->assertExists($store->bir_path);
        Storage::disk('public')->assertExists($store->dti_path);
        Storage::disk('public')->assertExists($store->id_image_path);
        Storage::disk('public')->assertExists($store->logo_path);
    }

    public function test_store_creation_validation_works()
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
        $this->actingAs($user);

        // Try to create store with invalid ID type
        $response = $this->postJson('/api/stores', [
            'store_name' => 'Test Store',
            'store_description' => 'Test store description',
            'id_type' => 'INVALID_TYPE',
            'tin_number' => '123-456-789-000',
            'owner_name' => 'Test Owner',
            'owner_email' => 'owner@test.com',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['id_type']);
    }
}
