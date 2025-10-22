<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update shipping status enum to include 'packing'
        DB::statement("ALTER TABLE shippings MODIFY COLUMN status ENUM('packing', 'to_ship', 'shipped', 'delivered') DEFAULT 'packing'");
        
        // Update shipping_histories status enum to include 'packing'
        DB::statement("ALTER TABLE shipping_histories MODIFY COLUMN status ENUM('packing', 'to_ship', 'shipped', 'delivered')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert shipping status enum
        DB::statement("ALTER TABLE shippings MODIFY COLUMN status ENUM('to_ship', 'shipped', 'delivered') DEFAULT 'to_ship'");
        
        // Revert shipping_histories status enum
        DB::statement("ALTER TABLE shipping_histories MODIFY COLUMN status ENUM('to_ship', 'shipped', 'delivered')");
    }
};
