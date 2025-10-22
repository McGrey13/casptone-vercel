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
        Schema::table('after_sale_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('after_sale_requests', 'video_path')) {
                $table->string('video_path')->nullable()->after('images');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('after_sale_requests', function (Blueprint $table) {
            if (Schema::hasColumn('after_sale_requests', 'video_path')) {
                $table->dropColumn('video_path');
            }
        });
    }
};


