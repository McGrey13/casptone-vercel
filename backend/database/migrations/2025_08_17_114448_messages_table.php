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
        Schema::create('messages', function (Blueprint $table) {
            $table->id('message_id');
            $table->foreignId('conversation_id')->constrained('conversations', 'conversation_id')->onDelete('cascade');
            $table->foreignId('sender_id')->constrained('users', 'userID')->onDelete('cascade');
            $table->foreignId('receiver_id')->constrained('users', 'userID')->onDelete('cascade');
            $table->enum('message_type',['custom_request','order_update','damage_report','after_sale','general'])->default('general');
            $table->text('message');
            $table->string('attachment_url')->nullable(); 
            $table->boolean('is_read')->default(false);
            $table->timestamps();
            
            $table->index(['conversation_id', 'created_at']);
        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::dropIfExists('messages');
    }
};
