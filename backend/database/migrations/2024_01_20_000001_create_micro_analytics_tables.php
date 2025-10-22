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
        // Detailed Review Analytics Table
        Schema::create('detailed_review_analytics', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('period_type'); // daily, monthly, quarterly, yearly
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('seller_id');
            $table->integer('rating'); // 1-5 stars
            $table->text('review_text')->nullable();
            $table->boolean('is_verified_purchase')->default(false);
            $table->integer('helpful_votes')->default(0);
            $table->text('response_text')->nullable();
            $table->timestamp('response_date')->nullable();
            $table->string('category');
            $table->string('product_name');
            $table->string('seller_name');
            $table->string('user_name');
            $table->timestamps();
            
            $table->index(['date', 'period_type']);
            $table->index(['rating', 'date']);
            $table->index(['seller_id', 'date']);
            $table->index(['product_id', 'date']);
            $table->index(['user_id', 'date']);
        });

        // Seller Comparison Analytics Table
        Schema::create('seller_comparison_analytics', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('period_type'); // daily, monthly, quarterly, yearly
            $table->unsignedBigInteger('product_id');
            $table->string('product_name');
            $table->string('category');
            $table->unsignedBigInteger('seller_id');
            $table->string('seller_name');
            $table->decimal('total_revenue', 15, 2)->default(0);
            $table->integer('total_orders')->default(0);
            $table->integer('total_quantity_sold')->default(0);
            $table->decimal('average_price', 10, 2)->default(0);
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->integer('total_reviews')->default(0);
            $table->decimal('market_share_percentage', 5, 2)->default(0);
            $table->integer('revenue_rank')->default(0);
            $table->integer('orders_rank')->default(0);
            $table->integer('rating_rank')->default(0);
            $table->decimal('growth_rate', 5, 2)->default(0);
            $table->decimal('previous_period_revenue', 15, 2)->default(0);
            $table->boolean('is_top_seller')->default(false);
            $table->integer('competitor_count')->default(0);
            $table->timestamps();
            
            $table->index(['date', 'period_type']);
            $table->index(['product_id', 'date']);
            $table->index(['seller_id', 'date']);
            $table->index(['category', 'date']);
            $table->index(['total_revenue', 'date']);
        });

        // Category Performance Analytics Table
        Schema::create('category_performance_analytics', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('period_type'); // daily, monthly, quarterly, yearly
            $table->string('category');
            $table->integer('total_sellers')->default(0);
            $table->integer('total_products')->default(0);
            $table->decimal('total_revenue', 15, 2)->default(0);
            $table->integer('total_orders')->default(0);
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->integer('total_reviews')->default(0);
            $table->decimal('average_price', 10, 2)->default(0);
            $table->decimal('market_share_percentage', 5, 2)->default(0);
            $table->decimal('growth_rate', 5, 2)->default(0);
            $table->integer('top_seller_count')->default(0);
            $table->timestamps();
            
            $table->index(['date', 'period_type']);
            $table->index(['category', 'date']);
            $table->index(['total_revenue', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category_performance_analytics');
        Schema::dropIfExists('seller_comparison_analytics');
        Schema::dropIfExists('detailed_review_analytics');
    }
};

