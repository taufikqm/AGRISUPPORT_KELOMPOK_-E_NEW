<?php

namespace Tests\Browser\Admin\ManajemenObservasi;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * TC-MO-004 — Filter Berdasarkan Tanggal (BEFORE→AFTER)
 * BEFORE: tabel menampilkan 2 observasi (tanggal berbeda)
 * AFTER : filter tanggal 2026-06-15 → hanya observasi tanggal itu yang tampil
 *
 * Assignee : Arjuna
 * Feature  : Manajemen Observasi Admin (AGS-111)
 * Command  : php artisan dusk --filter=TCMO004_FilterTanggalTest
 */
class TCMO004_FilterTanggalTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_filter_tanggal_menyaring_tabel(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['name' => 'Budi Santoso', 'role' => 'petani']);
        $area   = AgriculturalArea::factory()->for($petani)->create(['name' => 'Sawah Cidahu']);

        // Observasi tanggal 15 Juni
        FieldObservation::factory()->forArea($area)->create([
            'observation_date' => '2026-06-15',
            'crop_condition'   => 'Baik',
        ]);
        // Observasi tanggal 10 Juni
        FieldObservation::factory()->forArea($area)->create([
            'observation_date' => '2026-06-10',
            'crop_condition'   => 'Kritis',
        ]);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.observasi.index'))
                    ->waitForText('Manajemen Observasi', 30);

            // ── SEBELUM: 2 baris observasi tampil ──
            $browser->assertSee('Budi Santoso');

            $rowsBefore = $browser->script(
                "return document.querySelectorAll('[dusk^=\"observasi-row-\"]').length"
            );
            $this->assertEquals(2, $rowsBefore[0], 'SEBELUM: harus ada 2 baris observasi');

            // ── AKSI: isi filter tanggal 2026-06-15 ──
            $browser->type('[dusk="filter-tanggal-obs"]', '15-06-2026')
                    ->pause(3000);

            // ── SESUDAH: hanya 1 baris tampil ──
            $rowsAfter = $browser->script(
                "return document.querySelectorAll('[dusk^=\"observasi-row-\"]').length"
            );
            $this->assertEquals(1, $rowsAfter[0], 'SESUDAH: harus ada 1 baris observasi (tanggal 15 Jun)');
        });
    }
}
