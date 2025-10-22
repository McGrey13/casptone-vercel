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
        Schema::create('seller_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('sellers', 'sellerID')->onDelete('cascade')->unique();
            $table->integer('available_balance')->default(0); // centavos available for payout
            $table->integer('pending_balance')->default(0); // waiting for settlement
            $table->timestamps();
            
            // Index for better performance
            $table->index(['seller_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seller_balances');
    }
};
