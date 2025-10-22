<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('seller_follows', function (Blueprint $table) {
        $table->id();
        $table->foreignId('userID')->constrained('users', 'userID')->onDelete('cascade');
        $table->foreignId('sellerID')->constrained('sellers', 'sellerID')->onDelete('cascade');
        $table->timestamps();
        $table->unique(['userID', 'sellerID']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seller_follows');
    }
};
