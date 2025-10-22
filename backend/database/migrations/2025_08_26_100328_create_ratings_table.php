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
     Schema::create('ratings', function (Blueprint $table) {
    $table->id('ratings_id');
    $table->foreignId('product_id')->references('product_id')->on('products')->onDelete('cascade');
    $table->foreignId('userID')->references('userID')->on('users')->onDelete('cascade');
    $table->integer('stars')->unsigned()->default(0);
    $table->text('comment')->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};
