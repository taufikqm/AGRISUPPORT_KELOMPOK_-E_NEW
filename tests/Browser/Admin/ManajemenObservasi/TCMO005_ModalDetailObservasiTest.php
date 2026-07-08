<?php

namespace Tests\Browser\Admin\ManajemenObservasi;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * TC-MO-005 — Modal Detail Observasi (BEFORE→AFTER)
 * BEFORE: modal detail belum terbuka
 * AFTER : klik tombol detail → modal terbuka, menampilkan kondisi lapangan & cuaca
 *
 * Assignee : Arjuna
 * Feature  : Manajemen Observasi Admin (AGS-111)
 * Command  : php artisan dusk --filter=TCMO005_ModalDetailObservasiTest
 */
class TCMO005_ModalDetailObservasiTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_modal_detail_observasi_menampilkan_data_lengkap(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['name' => 'Budi Santoso', 'role' => 'petani']);
        $area   = AgriculturalArea::factory()->for($petani)->create(['name' => 'Sawah Cidahu']);
        $obs    = FieldObservation::factory()->forArea($area)->create([
            'observation_date'   => now()->toDateString(),
            'crop_condition'     => 'Baik',
            'soil_moisture'      => 'Normal',
            'weather_temp'       => 28.5,
        ]);

        $this->browse(function (Browser $browser) use ($admin, $obs) {
            $browser->loginAs($admin)
                    ->visit(route('admin.observasi.index'))
                    ->waitForText('Manajemen Observasi', 30);

            // ── SEBELUM: modal detail belum terbuka ──
            $browser->assertMissing('[dusk="modal-detail-obs"]');

            // ── AKSI: klik tombol detail ──
            $browser->click('[dusk="btn-detail-obs-' . $obs->id . '"]')
                    ->pause(3000);

            // ── SESUDAH: modal terbuka dengan data lengkap ──
            $browser->waitFor('[dusk="modal-detail-obs"]', 30)
                    ->assertPresent('[dusk="modal-detail-obs"]')
                    ->assertSee('[dusk="modal-detail-obs"]', 'Budi Santoso')
                    ->assertSee('[dusk="modal-detail-obs"]', 'KONDISI LAPANGAN')
                    ->assertSee('[dusk="modal-detail-obs"]', 'CUACA SAAT OBSERVASI');
        });
    }
}
