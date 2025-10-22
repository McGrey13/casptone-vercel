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
        Schema::table('stores', function (Blueprint $table) {
            // Store branding
            $table->string('background_image_path')->nullable()->after('logo_path');
            
            // Color scheme
            $table->string('primary_color')->default('#6366f1')->after('background_image_path');
            $table->string('secondary_color')->default('#f43f5e')->after('primary_color');
            $table->string('background_color')->default('#ffffff')->after('secondary_color');
            $table->string('text_color')->default('#1f2937')->after('background_color');
            $table->string('accent_color')->default('#0ea5e9')->after('text_color');
            
            // Typography
            $table->string('heading_font')->default('Inter')->after('accent_color');
            $table->string('body_font')->default('Inter')->after('heading_font');
            $table->integer('heading_size')->default(18)->after('body_font');
            $table->integer('body_size')->default(16)->after('heading_size');
            
            // Layout settings
            $table->boolean('show_hero_section')->default(true)->after('body_size');
            $table->boolean('show_featured_products')->default(true)->after('show_hero_section');
            $table->integer('desktop_columns')->default(4)->after('show_featured_products');
            $table->integer('mobile_columns')->default(2)->after('desktop_columns');
            $table->string('product_card_style')->default('minimal')->after('mobile_columns');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn([
                'background_image_path',
                'primary_color',
                'secondary_color',
                'background_color',
                'text_color',
                'accent_color',
                'heading_font',
                'body_font',
                'heading_size',
                'body_size',
                'show_hero_section',
                'show_featured_products',
                'desktop_columns',
                'mobile_columns',
                'product_card_style'
            ]);
        });
    }
};