<?php

namespace Tests\Feature\Admin;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * PHPUnit Feature Test — Riwayat Aktivitas & Laporan Admin (AGS-94)
 * Assignee: Bian
 * Command : php artisan test --filter=AdminActivityLogTest
 */
class AdminActivityLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dapat_akses_halaman_laporan(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.laporan.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/ActivityLog')
                ->has('logs')
            );
    }

    public function test_filter_berdasarkan_tanggal_berfungsi(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.laporan.index', [
                'date_from' => '2026-05-01',
                'date_to'   => '2026-05-31',
            ]))
            ->assertStatus(200);
    }

    public function test_filter_berdasarkan_petani_berfungsi(): void
    {
        $admin  = User::factory()->admin()->create();
        $farmer = User::factory()->create();

        $this->actingAs($admin)
            ->get(route('admin.laporan.index', ['user_id' => $farmer->id]))
            ->assertStatus(200);
    }

    public function test_api_data_laporan_mengembalikan_json(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->getJson(route('admin.api.laporan'))
            ->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_export_csv_mengembalikan_file_download(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.laporan.export'))
            ->assertStatus(200)
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        // TODO: pastikan Content-Disposition ada 'attachment'
    }

    public function test_petani_tidak_bisa_akses_laporan_admin(): void
    {
        $farmer = User::factory()->create(['role' => 'petani']);

        $this->actingAs($farmer)
            ->get(route('admin.laporan.index'))
            ->assertStatus(403);
    }
}
