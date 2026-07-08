<?php

namespace Tests\Browser\Admin\ManajemenObservasi;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * TC-MO-006 — Edit Observasi (BEFORE→AFTER)
 * BEFORE: crop_condition = "Baik"
 * AFTER : edit menjadi "Kritis" → flash success + tabel berubah
 *
 * Assignee : Arjuna
 * Feature  : Manajemen Observasi Admin (AGS-111)
 * Command  : php artisan dusk --filter=TCMO006_EditObservasiTest
 */
class TCMO006_EditObservasiTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_edit_observasi_mengubah_data_di_tabel(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['name' => 'Budi Santoso', 'role' => 'petani']);
        $area   = AgriculturalArea::factory()->for($petani)->create(['name' => 'Sawah Cidahu']);
        $obs    = FieldObservation::factory()->forArea($area)->create([
            'observation_date'   => now()->toDateString(),
            'crop_condition'     => 'Baik',
            'pest_indication'    => 'Tidak Ada',
            'disease_indication' => 'Tidak Ada',
        ]);

        $this->browse(function (Browser $browser) use ($admin, $obs) {
            $browser->loginAs($admin)
                    ->visit(route('admin.observasi.index'))
                    ->waitForText('Manajemen Observasi', 30);

            // ── SEBELUM: tabel menampilkan "Baik" ──
            $browser->assertSeeIn('[dusk="observasi-row-' . $obs->id . '"]', 'Baik');

            // ── AKSI: klik edit → modal terbuka ──
            $browser->click('[dusk="btn-edit-obs-' . $obs->id . '"]')
                    ->waitFor('[dusk="modal-edit-obs"]', 15)
                    ->pause(2000) // tunggu prefill data dari server
                    ->assertPresent('[dusk="modal-edit-obs"]');

            // Ubah Kondisi Tanaman dari "Baik" ke "Kritis"
            $browser->within('[dusk="modal-edit-obs"]', function (Browser $modal) {
                // Select Kondisi Tanaman — field ke-1 dalam grid ke-2
                $modal->script("
                    const selects = document.querySelector('[dusk=\"modal-edit-obs\"]').querySelectorAll('select');
                    // selects[0] = planting_cycle, selects[1] = crop_condition
                    if (selects[1]) {
                        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
                        nativeInputValueSetter.call(selects[1], 'Kritis');
                        selects[1].dispatchEvent(new Event('change', { bubbles: true }));
                    }
                ");
            });

            $browser->pause(500)
                    ->click('[dusk="btn-simpan-edit-obs"]')
                    ->pause(3000);

            // ── SESUDAH: flash success + tabel berubah ──
            $browser->waitForText('Data observasi berhasil diperbarui', 15)
                    ->assertSee('Data observasi berhasil diperbarui')
                    ->assertSeeIn('[dusk="observasi-row-' . $obs->id . '"]', 'Kritis');
        });
    }
}
