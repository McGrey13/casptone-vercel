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
        Schema::create('after_sale_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_id')->unique(); // ASR-XXXXXX format
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('product_id')->nullable();
            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('seller_id');
            $table->enum('request_type', ['return', 'exchange', 'refund', 'support', 'complaint'])->default('support');
            $table->enum('status', ['pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled'])->default('pending');
            $table->string('subject');
            $table->text('description');
            $table->string('reason')->nullable(); // Return/exchange reason
            $table->json('images')->nullable(); // Images of damaged/wrong items
            $table->string('video_path')->nullable(); // Unboxing/proof video
            $table->decimal('refund_amount', 10, 2)->nullable();
            $table->text('seller_response')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('order_id')->references('orderID')->on('orders')->onDelete('cascade');
            $table->foreign('product_id')->references('product_id')->on('products')->onDelete('set null');
            $table->foreign('customer_id')->references('customerID')->on('customers')->onDelete('cascade');
            $table->foreign('seller_id')->references('sellerID')->on('sellers')->onDelete('cascade');

            // Indexes
            $table->index('request_id');
            $table->index('order_id');
            $table->index('customer_id');
            $table->index('seller_id');
            $table->index('status');
            $table->index('request_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('after_sale_requests');
    }
};

