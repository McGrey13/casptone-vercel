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
            // Add DTI image field
            $table->string('dti_path')->nullable()->after('bir_path');
            
            // Add ID verification fields
            $table->string('id_image_path')->nullable()->after('dti_path');
            $table->enum('id_type', [
                'UMID',
                'SSS',
                'GSIS',
                'LTO',
                'Postal',
                'Passport',
                'PhilHealth',
                'PhilID',
                'PRC',
                'Alien',
                'Foreign_Passport'
            ])->nullable()->after('id_image_path');
            
            // Add TIN number field
            $table->string('tin_number')->nullable()->after('id_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn([
                'dti_path',
                'id_image_path', 
                'id_type',
                'tin_number'
            ]);
        });
    }
};