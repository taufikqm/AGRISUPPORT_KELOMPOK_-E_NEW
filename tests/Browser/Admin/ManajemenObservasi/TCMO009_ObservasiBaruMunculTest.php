<?php

namespace Tests\Browser\Admin\ManajemenObservasi;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * TC-MO-009 — Observasi Baru Muncul di Tabel (BEFORE→AFTER)
 * BEFORE: tabel 1 baris (Budi)
 * AFTER : tambah observasi Dewi via factory → reload → tabel 2 baris
 *
 * Assignee : Arjuna
 * Feature  : Manajemen Observasi Admin (AGS-111)
 * Command  : php artisan dusk --filter=TCMO009_ObservasiBaruMunculTest
 */
class TCMO009_ObservasiBaruMunculTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_observasi_baru_muncul_setelah_reload(): void
    {
        $admin   = User::factory()->admin()->create();
        $petani1 = User::factory()->create(['name' => 'Budi Santoso', 'role' => 'petani']);
        $area1   = AgriculturalArea::factory()->for($petani1)->create(['name' => 'Sawah Cidahu']);
        FieldObservation::factory()->forArea($area1)->create([
            'observation_date' => now()->toDateString(),
            'crop_condition'   => 'Baik',
        ]);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.observasi.index'))
                    ->waitForText('Manajemen Observasi', 30);

            // ── SEBELUM: 1 baris (Budi Santoso) ──
            $browser->assertSee('Budi Santoso');

            $rowsBefore = $browser->script(
                "return document.querySelectorAll('[dusk^=\"observasi-row-\"]').length"
            );
            $this->assertEquals(1, $rowsBefore[0], 'SEBELUM: harus ada 1 baris observasi');

            // ── AKSI: tambah observasi baru via factory ──
            $petani2 = User::factory()->create(['name' => 'Dewi Lestari', 'role' => 'petani']);
            $area2   = AgriculturalArea::factory()->for($petani2)->create(['name' => 'Kebun Ciamis']);
            FieldObservation::factory()->forArea($area2)->create([
                'observation_date' => now()->toDateString(),
                'crop_condition'   => 'Kritis',
            ]);

            // ── SESUDAH: reload → 2 baris ──
            $browser->visit(route('admin.observasi.index'))
                    ->waitForText('Manajemen Observasi', 30)
                    ->assertSee('Dewi Lestari');

            $rowsAfter = $browser->script(
                "return document.querySelectorAll('[dusk^=\"observasi-row-\"]').length"
            );
            $this->assertEquals(2, $rowsAfter[0], 'SESUDAH: harus ada 2 baris observasi');
        });
    }
}
