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
        Schema::create('most_selling_product_analytics', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('period_type'); // daily, monthly, quarterly, yearly
            $table->unsignedBigInteger('product_id');
            $table->string('product_name');
            $table->unsignedBigInteger('seller_id');
            $table->string('seller_name');
            $table->string('category');
            $table->integer('total_orders')->default(0);
            $table->integer('total_quantity_sold')->default(0);
            $table->decimal('total_revenue', 10, 2)->default(0);
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->integer('total_reviews')->default(0);
            $table->string('month_year')->nullable();
            $table->integer('year')->nullable();
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['date', 'period_type']);
            $table->index(['product_id', 'date']);
            $table->index(['seller_id', 'date']);
            $table->index(['category', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('most_selling_product_analytics');
    }
};
