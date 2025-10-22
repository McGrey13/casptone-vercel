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
        Schema::create('payments', function (Blueprint $table) {
            $table->id('payment_id');
            $table->foreignId('userID')->constrained('users', 'userID')->onDelete('cascade');
            $table->foreignId('orderID')->constrained('orders', 'orderID')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('PHP');
            $table->string('paymentMethod');
            $table->enum('paymentStatus', ['pending', 'processing', 'paid', 'failed', 'cancelled'])->default('pending');
            $table->timestamp('orderDate')->nullable();
            $table->string('paymongo_source_id')->nullable();
            $table->string('paymongo_payment_intent_id')->nullable();
            $table->json('payment_details')->nullable();
            $table->string('failure_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
