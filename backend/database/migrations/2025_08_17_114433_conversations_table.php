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
       Schema::create('conversations', function (Blueprint $table) {
            $table->id('conversation_id');
            $table->foreignId('sender_id')->constrained('users', 'userID')->onDelete('cascade');
            $table->foreignId('recever_id')->constrained('users', 'userID')->onDelete('cascade');
            $table->foreignId('orderID')->nullable()->constrained('orders', 'orderID')->onDelete('set null');
            $table->foreignId('product_id')->nullable()->constrained('products', 'product_id')->onDelete('cascade');
            $table->timestamps();
});

    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
