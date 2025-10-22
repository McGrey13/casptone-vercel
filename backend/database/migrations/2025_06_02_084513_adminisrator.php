<?php

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
        Schema::create('administrators', function (Blueprint $table) {
            $table->id('adminID'); // Primary key for administrators table
            $table->foreignId('user_id')->constrained('users', 'userID')->onDelete('cascade'); // Foreign key to users table
            $table->string('profile_picture_path')->nullable(); 
            // Note: adminEmail and adminPassword are typically handled by the 'users' table if Administrator is a type of User.
            // If they are specific to the administrator record and distinct from the user's main credentials, you can add them here.
            // For this example, we assume authentication is via the 'users' table.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('administrators');
    }
};
