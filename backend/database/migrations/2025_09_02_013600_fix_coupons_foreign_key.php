<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Drop existing foreign key constraint if it exists
        Schema::table('coupons', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
        });

        // Re-add the foreign key with correct reference
        Schema::table('coupons', function (Blueprint $table) {
            $table->foreign('created_by')
                  ->references('userID')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
        });
    }
};
