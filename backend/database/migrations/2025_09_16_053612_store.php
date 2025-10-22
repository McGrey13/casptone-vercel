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
         Schema::create('stores', function (Blueprint $table) {
            $table->id('storeID');
            $table->foreignId('seller_id')->constrained('sellers', 'sellerID')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users', 'userID')->onDelete('cascade');
            $table->string('store_name');
            $table->text('store_description')->nullable();
            $table->string('category')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('bir_path')->nullable();
            $table->string('owner_name');
            $table->string('owner_email');
            $table->string('owner_phone')->nullable();
            $table->text('owner_address')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
