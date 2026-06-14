<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * AGS-94 — ActivityLogController selects old_values & new_values dari action_logs.
 * Kolom ini belum ada di migration awal, sehingga query /admin/laporan crash (SQLSTATE 42703).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('action_logs', 'old_values')) {
            Schema::table('action_logs', function (Blueprint $table) {
                $table->text('old_values')->nullable()->after('detail');
            });
        }

        if (!Schema::hasColumn('action_logs', 'new_values')) {
            Schema::table('action_logs', function (Blueprint $table) {
                $table->text('new_values')->nullable()->after('old_values');
            });
        }
    }

    public function down(): void
    {
        Schema::table('action_logs', function (Blueprint $table) {
            $table->dropColumn(['old_values', 'new_values']);
        });
    }
};
