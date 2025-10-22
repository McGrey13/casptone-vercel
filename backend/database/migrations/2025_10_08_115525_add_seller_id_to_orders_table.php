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
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('sellerID')->nullable()->after('customer_id');
            $table->foreign('sellerID')->references('sellerID')->on('sellers')->onDelete('cascade');
            $table->index('sellerID');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['sellerID']);
            $table->dropIndex(['sellerID']);
            $table->dropColumn('sellerID');
        });
    }
};
