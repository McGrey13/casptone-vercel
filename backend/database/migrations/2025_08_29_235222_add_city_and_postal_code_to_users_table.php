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
        Schema::table('users', function (Blueprint $table) {
            $table->string('userRegion')->nullable()->after('userAddress');
            $table->string('userProvince')->nullable()->after('userAddress');
            $table->string('userCity')->nullable()->after('userAddress');
            $table->string('userPostalCode')->nullable()->after('userCity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['userRegion', 'userProvince', 'userCity', 'userPostalCode']);
        });
    }
};
