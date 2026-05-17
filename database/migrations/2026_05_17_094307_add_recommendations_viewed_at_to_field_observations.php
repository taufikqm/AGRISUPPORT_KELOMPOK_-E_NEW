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
        Schema::table('field_observations', function (Blueprint $table) {
            $table->timestamp('recommendations_viewed_at')->nullable()->after('observation_date');
        });
    }

    public function down(): void
    {
        Schema::table('field_observations', function (Blueprint $table) {
            $table->dropColumn('recommendations_viewed_at');
        });
    }
};
