<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * AGS-72 — Prediksi Waktu Tanam menyimpan jadwal tanam ke `action_logs`
 * dengan action_type = 'planting_schedule'.
 *
 *  - observation_id & recommendation_id dibuat nullable (jadwal tanam tak punya keduanya).
 *  - Tambah agricultural_area_id (nullable) agar jadwal tercatat per lahan & bisa di-dedup.
 *
 * Backward-compatible: data lama tetap mengisi observation_id/recommendation_id.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE action_logs ALTER COLUMN observation_id DROP NOT NULL');
        DB::statement('ALTER TABLE action_logs ALTER COLUMN recommendation_id DROP NOT NULL');

        Schema::table('action_logs', function (Blueprint $table) {
            $table->foreignId('agricultural_area_id')
                ->nullable()
                ->constrained('agricultural_areas')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('action_logs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('agricultural_area_id');
        });

        DB::statement('ALTER TABLE action_logs ALTER COLUMN recommendation_id SET NOT NULL');
        DB::statement('ALTER TABLE action_logs ALTER COLUMN observation_id SET NOT NULL');
    }
};
