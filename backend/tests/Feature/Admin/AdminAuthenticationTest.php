<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_login_and_access_admin_routes()
    {
        // Create admin user
        $admin = User::factory()->create([
            'userEmail' => 'adminuser@example.com',
            'userName' => 'adminuser',
            'role' => 'administrator',
            'userPassword' => bcrypt('password123')
        ]);

        // Test admin login
        $loginResponse = $this->postJson('/api/login', [
            'userEmail' => 'adminuser@example.com',
            'userPassword' => 'password123'
        ]);

        $loginResponse->assertStatus(200);
        $this->assertArrayHasKey('token', $loginResponse->json());
        $this->assertEquals('administrator', $loginResponse->json()['user']['role']);

        $token = $loginResponse->json()['token'];

        // Test accessing admin routes with token
        $statsResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json'
        ])->getJson('/api/admin/verification-stats');

        $statsResponse->assertStatus(200);
        $this->assertArrayHasKey('total_stores', $statsResponse->json());
        $this->assertArrayHasKey('pending_stores', $statsResponse->json());
        $this->assertArrayHasKey('approved_stores', $statsResponse->json());
        $this->assertArrayHasKey('rejected_stores', $statsResponse->json());
    }

    public function test_non_admin_cannot_access_admin_routes()
    {
        // Create regular user (not admin)
        $user = User::factory()->create([
            'userEmail' => 'user@example.com',
            'userName' => 'regularuser',
            'role' => 'customer',
            'userPassword' => bcrypt('password123')
        ]);

        // Test user login
        $loginResponse = $this->postJson('/api/login', [
            'userEmail' => 'user@example.com',
            'userPassword' => 'password123'
        ]);

        $loginResponse->assertStatus(200);
        $token = $loginResponse->json()['token'];

        // Test accessing admin routes with non-admin token
        $statsResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json'
        ])->getJson('/api/admin/verification-stats');

        $statsResponse->assertStatus(403);
        $this->assertStringContainsString('Admin access required', $statsResponse->json()['message']);
    }

    public function test_unauthenticated_user_cannot_access_admin_routes()
    {
        // Test accessing admin routes without token
        $statsResponse = $this->getJson('/api/admin/verification-stats');

        $statsResponse->assertStatus(401);
        $this->assertStringContainsString('Unauthenticated', $statsResponse->json()['message']);
    }

    public function test_admin_can_fetch_stores()
    {
        // Create admin user
        $admin = User::factory()->create([
            'userEmail' => 'adminuser@example.com',
            'userName' => 'adminuser',
            'role' => 'administrator',
            'userPassword' => bcrypt('password123')
        ]);

        // Login admin
        $loginResponse = $this->postJson('/api/login', [
            'userEmail' => 'adminuser@example.com',
            'userPassword' => 'password123'
        ]);

        $token = $loginResponse->json()['token'];

        // Test fetching stores
        $storesResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json'
        ])->getJson('/api/admin/stores');

        $storesResponse->assertStatus(200);
        $this->assertArrayHasKey('data', $storesResponse->json());
    }
}
