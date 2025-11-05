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
        Schema::create('riders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('seller_id');
            $table->string('rider_name');
            $table->string('rider_phone');
            $table->string('rider_email')->nullable();
            $table->string('rider_company')->nullable();
            $table->string('vehicle_type');
            $table->string('vehicle_number');
            $table->integer('delivery_count')->default(0); // Track how many times this rider was used
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Foreign key to sellers table
            $table->foreign('seller_id')->references('sellerID')->on('sellers')->onDelete('cascade');
            
            // Indexes for faster queries
            $table->index('seller_id');
            $table->index('rider_phone');
            
            // Unique constraint: same seller shouldn't have duplicate riders (by phone number)
            $table->unique(['seller_id', 'rider_phone'], 'seller_rider_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('riders');
    }
};
