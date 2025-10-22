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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders', 'orderID')->onDelete('cascade');
            $table->foreignId('seller_id')->constrained('sellers', 'sellerID')->onDelete('cascade');
            $table->string('paymongo_payment_id')->nullable();
            $table->string('paymongo_intent_id')->nullable();
            $table->integer('gross_amount'); // amount in centavos
            $table->integer('admin_fee'); // in centavos (2%)
            $table->integer('seller_amount'); // gross - admin_fee
            $table->enum('status', ['pending', 'succeeded', 'failed', 'refunded'])->default('pending');
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['seller_id', 'status']);
            $table->index(['order_id']);
            $table->index(['paymongo_payment_id']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
