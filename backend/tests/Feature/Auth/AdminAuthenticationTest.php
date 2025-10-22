<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\Administrator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_registration()
    {
        $response = $this->postJson('/api/admin/register', [
            'userFirstName' => 'Admin',
            'userLastName' => 'Test',
            'userAge' => 25,
            'userBirthDay' => '1998-01-01',
            'userContactNumber' => '+1234567890',
            'userAddress' => '123 Test Street',
            'email' => 'admin@test.com',
            'password' => 'password123'
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => [
                    'id',
                    'userFirstName',
                    'userLastName',
                    'email',
                    'userType'
                ]
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'admin@test.com',
            'userType' => 'admin'
        ]);

        $this->assertDatabaseHas('administrators', [
            'adminEmail' => 'admin@test.com'
        ]);
    }

    public function test_admin_login_without_verification()
    {
        // Create an unverified admin
        $user = User::create([
            'userFirstName' => 'Admin',
            'userLastName' => 'Test',
            'userAge' => 25,
            'userBirthDay' => '1998-01-01',
            'userContactNumber' => '+1234567890',
            'userAddress' => '123 Test Street',
            'email' => 'admin@test.com',
            'userType' => 'admin'
        ]);

        Administrator::create([
            'user_id' => $user->id,
            'adminEmail' => 'admin@test.com',
            'adminPassword' => bcrypt('password123')
        ]);

        $response = $this->postJson('/api/admin/login', [
            'email' => 'admin@test.com',
            'password' => 'password123'
        ]);

        $response->assertStatus(403)
            ->assertJsonStructure([
                'message',
                'needs_verification',
                'email_verified',
                'phone_verified'
            ]);
    }

    public function test_admin_login_with_verification()
    {
        // Create a verified admin
        $user = User::create([
            'userFirstName' => 'Admin',
            'userLastName' => 'Test',
            'userAge' => 25,
            'userBirthDay' => '1998-01-01',
            'userContactNumber' => '+1234567890',
            'userAddress' => '123 Test Street',
            'email' => 'admin@test.com',
            'userType' => 'admin',
            'email_verified_at' => now(),
            'user_contact_number_verified_at' => now()
        ]);

        Administrator::create([
            'user_id' => $user->id,
            'adminEmail' => 'admin@test.com',
            'adminPassword' => bcrypt('password123')
        ]);

        $response = $this->postJson('/api/admin/login', [
            'email' => 'admin@test.com',
            'password' => 'password123'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'token',
                'user' => [
                    'id',
                    'userFirstName',
                    'userLastName',
                    'email',
                    'userType'
                ]
            ]);
    }

    public function test_email_verification()
    {
        // Create an admin with verification code
        $user = User::create([
            'userFirstName' => 'Admin',
            'userLastName' => 'Test',
            'userAge' => 25,
            'userBirthDay' => '1998-01-01',
            'userContactNumber' => '+1234567890',
            'userAddress' => '123 Test Street',
            'email' => 'admin@test.com',
            'userType' => 'admin',
            'email_verification_code' => '123456'
        ]);

        Administrator::create([
            'user_id' => $user->id,
            'adminEmail' => 'admin@test.com',
            'adminPassword' => bcrypt('password123')
        ]);

        $response = $this->postJson('/api/admin/verify-email', [
            'email' => 'admin@test.com',
            'code' => '123456'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Email verified successfully'
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'admin@test.com',
            'email_verified_at' => now()
        ]);
    }

    public function test_sms_verification()
    {
        // Create an admin with SMS verification code
        $user = User::create([
            'userFirstName' => 'Admin',
            'userLastName' => 'Test',
            'userAge' => 25,
            'userBirthDay' => '1998-01-01',
            'userContactNumber' => '+1234567890',
            'userAddress' => '123 Test Street',
            'email' => 'admin@test.com',
            'userType' => 'admin',
            'sms_verification_code' => '123456',
            'sms_code_expires_at' => now()->addHours(24)
        ]);

        Administrator::create([
            'user_id' => $user->id,
            'adminEmail' => 'admin@test.com',
            'adminPassword' => bcrypt('password123')
        ]);

        $response = $this->postJson('/api/admin/verify-sms', [
            'phone_number' => '+1234567890',
            'code' => '123456'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Phone number verified successfully'
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'admin@test.com',
            'user_contact_number_verified_at' => now()
        ]);
    }

    public function test_logout()
    {
        // Create a verified admin
        $user = User::create([
            'userFirstName' => 'Admin',
            'userLastName' => 'Test',
            'userAge' => 25,
            'userBirthDay' => '1998-01-01',
            'userContactNumber' => '+1234567890',
            'userAddress' => '123 Test Street',
            'email' => 'admin@test.com',
            'userType' => 'admin',
            'email_verified_at' => now(),
            'user_contact_number_verified_at' => now()
        ]);

        Administrator::create([
            'user_id' => $user->id,
            'adminEmail' => 'admin@test.com',
            'adminPassword' => bcrypt('password123')
        ]);

        // Login to get token
        $loginResponse = $this->postJson('/api/admin/login', [
            'email' => 'admin@test.com',
            'password' => 'password123'
        ]);

        $token = $loginResponse->json('token');

        // Test logout
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/admin/logout');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Logged out successfully'
            ]);
    }
} 