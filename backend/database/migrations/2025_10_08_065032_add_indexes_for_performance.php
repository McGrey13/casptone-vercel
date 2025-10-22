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
        // Add indexes to orders table
        Schema::table('orders', function (Blueprint $table) {
            $table->index('status');
            $table->index('created_at');
            $table->index(['status', 'created_at']);
        });

        // Add indexes to products table
        Schema::table('products', function (Blueprint $table) {
            $table->index('seller_id');
            $table->index('status');
            $table->index('approval_status');
            $table->index('created_at');
            $table->index(['seller_id', 'status']);
        });

        // Add indexes to stores table
        Schema::table('stores', function (Blueprint $table) {
            $table->index('status');
            $table->index('seller_id');
            $table->index('created_at');
            $table->index(['status', 'created_at']);
        });

        // Add indexes to reviews table
        Schema::table('reviews', function (Blueprint $table) {
            $table->index('product_id');
            $table->index('rating');
            $table->index('created_at');
        });

        // Add indexes to sellers table
        Schema::table('sellers', function (Blueprint $table) {
            $table->index('is_verified');
            $table->index('created_at');
        });

        // Add indexes to users table
        Schema::table('users', function (Blueprint $table) {
            $table->index('role');
            $table->index('is_verified');
            $table->index('created_at');
            $table->index(['role', 'is_verified']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes from orders table
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['status', 'created_at']);
        });

        // Drop indexes from products table
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['seller_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['approval_status']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['seller_id', 'status']);
        });

        // Drop indexes from stores table
        Schema::table('stores', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['seller_id']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['status', 'created_at']);
        });

        // Drop indexes from reviews table
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex(['product_id']);
            $table->dropIndex(['rating']);
            $table->dropIndex(['created_at']);
        });

        // Drop indexes from sellers table
        Schema::table('sellers', function (Blueprint $table) {
            $table->dropIndex(['is_verified']);
            $table->dropIndex(['created_at']);
        });

        // Drop indexes from users table
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropIndex(['is_verified']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['role', 'is_verified']);
        });
    }
};
