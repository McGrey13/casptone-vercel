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
            // Add background image field
            
            // Remove unwanted fields if they exist
            if (Schema::hasColumn('stores', 'banner_image_path')) {
                $table->dropColumn('banner_image_path');
            }
            if (Schema::hasColumn('stores', 'favicon_path')) {
                $table->dropColumn('favicon_path');
            }
            if (Schema::hasColumn('stores', 'custom_css')) {
                $table->dropColumn('custom_css');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            // Remove background image field
            $table->dropColumn('background_image_path');
            
            // Add back the removed fields
            $table->string('banner_image_path')->nullable()->after('logo_path');
            $table->string('favicon_path')->nullable()->after('banner_image_path');
            $table->text('custom_css')->nullable()->after('product_card_style');
        });
    }
};