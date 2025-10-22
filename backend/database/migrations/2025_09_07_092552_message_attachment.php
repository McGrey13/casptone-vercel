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
        Schema::create('message_attachments', function (Blueprint $table) {
            $table->id('message_attachment_Id');
        
            $table->foreignId('message_id')->constrained('messages', 'message_id')->onDelete('cascade');
            $table->string('messageAttachment'); 
            $table->enum('file_type', ['image', 'document', 'other'])->default('other');
            $table->timestamp('created_at')->useCurrent(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('message_attachments');
    }
};
