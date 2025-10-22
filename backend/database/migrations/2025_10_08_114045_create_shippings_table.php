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
        Schema::create('shippings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id');
            $table->string('tracking_number')->unique();
            $table->string('rider_name');
            $table->string('rider_phone');
            $table->string('rider_email')->nullable();
            $table->string('vehicle_type');
            $table->string('vehicle_number');
            $table->text('delivery_address');
            $table->string('delivery_city');
            $table->string('delivery_province');
            $table->text('delivery_notes')->nullable();
            $table->datetime('estimated_delivery')->nullable();
            $table->enum('status', ['to_ship', 'shipped', 'delivered'])->default('to_ship');
            $table->datetime('assigned_at')->nullable();
            $table->datetime('shipped_at')->nullable();
            $table->datetime('delivered_at')->nullable();
            $table->timestamps();

            $table->foreign('order_id')->references('orderID')->on('orders')->onDelete('cascade');
            $table->index(['tracking_number', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shippings');
    }
};
