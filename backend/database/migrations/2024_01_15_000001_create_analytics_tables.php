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
        // Revenue Analytics Table
        Schema::create('revenue_analytics', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('period_type'); // daily, monthly, quarterly, yearly
            $table->decimal('total_revenue', 15, 2)->default(0);
            $table->decimal('platform_commission', 15, 2)->default(0);
            $table->decimal('payment_processing_fees', 15, 2)->default(0);
            $table->integer('total_orders')->default(0);
            $table->decimal('average_order_value', 10, 2)->default(0);
            $table->timestamps();
            
            $table->index(['date', 'period_type']);
        });

        // Seller Revenue Analytics Table
        Schema::create('seller_revenue_analytics', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('seller_id');
            $table->date('date');
            $table->string('period_type'); // daily, monthly, quarterly, yearly
            $table->decimal('total_revenue', 15, 2)->default(0);
            $table->decimal('commission_earned', 15, 2)->default(0);
            $table->integer('total_orders')->default(0);
            $table->decimal('average_order_value', 10, 2)->default(0);
            $table->integer('products_sold')->default(0);
            $table->timestamps();
            
            // Don't add foreign key constraint here - add it later
            $table->index(['seller_id', 'date', 'period_type']);
        });

        // Order Analytics Table
        Schema::create('order_analytics', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('period_type'); // daily, monthly, quarterly, yearly
            $table->integer('total_orders')->default(0);
            $table->integer('completed_orders')->default(0);
            $table->integer('cancelled_orders')->default(0);
            $table->integer('refunded_orders')->default(0);
            $table->integer('pending_orders')->default(0);
            $table->integer('processing_orders')->default(0);
            $table->integer('shipped_orders')->default(0);
            $table->decimal('completion_rate', 5, 2)->default(0);
            $table->decimal('cancellation_rate', 5, 2)->default(0);
            $table->decimal('refund_rate', 5, 2)->default(0);
            $table->decimal('average_order_value', 10, 2)->default(0);
            $table->timestamps();
            
            $table->index(['date', 'period_type']);
        });

        // Review Analytics Table
        Schema::create('review_analytics', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('period_type'); // daily, monthly, quarterly, yearly
            $table->integer('total_reviews')->default(0);
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->integer('five_star_reviews')->default(0);
            $table->integer('four_star_reviews')->default(0);
            $table->integer('three_star_reviews')->default(0);
            $table->integer('two_star_reviews')->default(0);
            $table->integer('one_star_reviews')->default(0);
            $table->integer('reviews_with_comments')->default(0);
            $table->integer('reviews_without_comments')->default(0);
            $table->decimal('response_rate', 5, 2)->default(0);
            $table->timestamps();
            
            $table->index(['date', 'period_type']);
        });

        // Product Analytics Table
        Schema::create('product_analytics', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('period_type'); // daily, monthly, quarterly, yearly
            $table->integer('total_products')->default(0);
            $table->integer('active_products')->default(0);
            $table->integer('inactive_products')->default(0);
            $table->integer('out_of_stock_products')->default(0);
            $table->integer('low_stock_products')->default(0);
            $table->integer('featured_products')->default(0);
            $table->integer('products_with_images')->default(0);
            $table->integer('products_with_videos')->default(0);
            $table->integer('products_without_images')->default(0);
            $table->decimal('average_product_rating', 3, 2)->default(0);
            $table->timestamps();
            
            $table->index(['date', 'period_type']);
        });

        // Content Moderation Analytics Table
        Schema::create('content_moderation_analytics', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('period_type'); // daily, monthly, quarterly, yearly
            $table->integer('products_pending_approval')->default(0);
            $table->integer('products_approved')->default(0);
            $table->integer('products_rejected')->default(0);
            $table->integer('reviews_flagged')->default(0);
            $table->integer('reviews_approved')->default(0);
            $table->integer('reviews_removed')->default(0);
            $table->integer('users_suspended')->default(0);
            $table->integer('users_reactivated')->default(0);
            $table->decimal('approval_rate', 5, 2)->default(0);
            $table->decimal('rejection_rate', 5, 2)->default(0);
            $table->timestamps();
            
            $table->index(['date', 'period_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content_moderation_analytics');
        Schema::dropIfExists('product_analytics');
        Schema::dropIfExists('review_analytics');
        Schema::dropIfExists('order_analytics');
        Schema::dropIfExists('seller_revenue_analytics');
        Schema::dropIfExists('revenue_analytics');
    }
};