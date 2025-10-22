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
        Schema::create('highest_sales_seller_analytics', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('period_type'); // daily, monthly, quarterly, yearly
            $table->unsignedBigInteger('seller_id');
            $table->string('seller_name');
            $table->string('business_name');
            $table->decimal('total_revenue', 10, 2)->default(0);
            $table->integer('total_orders')->default(0);
            $table->integer('total_products_sold')->default(0);
            $table->integer('unique_products')->default(0);
            $table->decimal('average_order_value', 10, 2)->default(0);
            $table->decimal('completion_rate', 5, 2)->default(0);
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->integer('total_reviews')->default(0);
            $table->string('top_category')->nullable();
            $table->string('month_year')->nullable();
            $table->integer('year')->nullable();
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['date', 'period_type']);
            $table->index(['seller_id', 'date']);
            $table->index(['top_category', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('highest_sales_seller_analytics');
    }
};
