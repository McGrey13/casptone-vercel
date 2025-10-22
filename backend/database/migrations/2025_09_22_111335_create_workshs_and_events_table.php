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
        Schema::create('work_and_events', function (Blueprint $table) {
            $table->id('works_and_events_id');
            $table->string('title');
            $table->unsignedBigInteger('seller_id');
            $table->foreign('seller_id')->references('sellerID')->on('sellers')->onDelete('cascade');
            $table->text('description');
            $table->string('image')->nullable();
            $table->string('link');
            $table->string('location');
            $table->date('date');
            $table->string('time');
            $table->integer('participants');
            $table->enum('status', ['upcoming','ongoing','completed','cancelled']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_and_events');
    }
};
