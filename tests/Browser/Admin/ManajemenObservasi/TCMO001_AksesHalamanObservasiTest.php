<?php

namespace Tests\Browser\Admin\ManajemenObservasi;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * TC-MO-001 — Akses Halaman Manajemen Observasi
 * Admin login → navigasi ke /admin/observasi → tabel observasi tampil
 *
 * SEBELUM: di Dashboard Admin
 * SESUDAH: di /admin/observasi, tabel ter-render
 *
 * Assignee : Arjuna
 * Feature  : Manajemen Observasi Admin (AGS-111)
 * Command  : php artisan dusk --filter=TCMO001_AksesHalamanObservasiTest
 */
class TCMO001_AksesHalamanObservasiTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_admin_dapat_mengakses_halaman_manajemen_observasi(): void
    {
        $admin   = User::factory()->admin()->create();
        $petani1 = User::factory()->create(['name' => 'Budi Santoso', 'role' => 'petani']);
        $petani2 = User::factory()->create(['name' => 'Dewi Lestari', 'role' => 'petani']);
        $area1   = AgriculturalArea::factory()->for($petani1)->create(['name' => 'Sawah Cidahu']);
        $area2   = AgriculturalArea::factory()->for($petani2)->create(['name' => 'Kebun Ciamis']);
        FieldObservation::factory()->forArea($area1)->create([
            'observation_date'   => now()->toDateString(),
            'crop_condition'     => 'Baik',
            'pest_indication'    => 'Tidak Ada',
            'disease_indication' => 'Ringan',
        ]);
        FieldObservation::factory()->forArea($area2)->create([
            'observation_date'   => now()->toDateString(),
            'crop_condition'     => 'Kritis',
            'pest_indication'    => 'Berat',
            'disease_indication' => 'Sedang',
        ]);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    // SEBELUM: di Dashboard Admin
                    ->visit(route('admin.dashboard'))
                    ->waitForText('Dashboard', 25)
                    // AKSI: navigasi ke Manajemen Observasi
                    ->visit(route('admin.observasi.index'))
                    // SESUDAH: halaman tampil dengan tabel
                    ->waitForText('Manajemen Observasi', 30)
                    ->assertPathIs('/admin/observasi')
                    ->assertSee('Manajemen Observasi')
                    ->assertPresent('[dusk="observasi-table"]')
                    ->assertSee('Budi Santoso')
                    ->assertSee('Dewi Lestari');
        });
    }
}
