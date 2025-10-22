<?php

// Migration for Customer Profiles: create_customer_profiles_table
// Run: php artisan make:migration create_customer_profiles_table
// Then, update the generated migration file:


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id('customerID'); // Primary key for customers table
            $table->foreignId('user_id')->constrained('users', 'userID')->onDelete('cascade'); // Foreign key to users table
            $table->string('profile_picture_path')->nullable(); 
            // Note: customerEmail and customerPassword are typically handled by the 'users' table.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};