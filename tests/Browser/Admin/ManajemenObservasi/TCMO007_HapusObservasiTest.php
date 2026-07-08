<?php

namespace Tests\Browser\Admin\ManajemenObservasi;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * TC-MO-007 — Hapus Observasi (BEFORE→AFTER)
 * BEFORE: tabel 2 baris (Budi + Dewi)
 * AFTER : hapus Dewi → flash success, tabel 1 baris (hanya Budi)
 *
 * Assignee : Arjuna
 * Feature  : Manajemen Observasi Admin (AGS-111)
 * Command  : php artisan dusk --filter=TCMO007_HapusObservasiTest
 */
class TCMO007_HapusObservasiTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_hapus_observasi_mengurangi_baris_tabel(): void
    {
        $admin   = User::factory()->admin()->create();
        $petani1 = User::factory()->create(['name' => 'Budi Santoso', 'role' => 'petani']);
        $petani2 = User::factory()->create(['name' => 'Dewi Lestari', 'role' => 'petani']);
        $area1   = AgriculturalArea::factory()->for($petani1)->create(['name' => 'Sawah Cidahu']);
        $area2   = AgriculturalArea::factory()->for($petani2)->create(['name' => 'Kebun Ciamis']);

        FieldObservation::factory()->forArea($area1)->create([
            'observation_date' => now()->toDateString(),
            'crop_condition'   => 'Baik',
        ]);
        $obsDewi = FieldObservation::factory()->forArea($area2)->create([
            'observation_date' => now()->toDateString(),
            'crop_condition'   => 'Kritis',
        ]);

        $this->browse(function (Browser $browser) use ($admin, $obsDewi) {
            $browser->loginAs($admin)
                    ->visit(route('admin.observasi.index'))
                    ->waitForText('Manajemen Observasi', 30);

            // ── SEBELUM: 2 baris tampil ──
            $browser->assertSee('Budi Santoso')
                    ->assertSee('Dewi Lestari');

            // ── AKSI: klik hapus pada Dewi ──
            $browser->click('[dusk="btn-hapus-obs-' . $obsDewi->id . '"]')
                    ->waitFor('[dusk="modal-konfirmasi-hapus-obs"]', 15)
                    ->assertSeeIn('[dusk="modal-konfirmasi-hapus-obs"]', 'Dewi Lestari');

            // Konfirmasi hapus
            $browser->click('[dusk="btn-konfirmasi-hapus-obs"]')
                    ->pause(3000);

            // ── SESUDAH: flash + Dewi hilang, Budi masih ada ──
            $browser->waitForText('Observasi berhasil dihapus', 15)
                    ->assertSee('Observasi berhasil dihapus')
                    ->assertSee('Budi Santoso')
                    ->assertDontSee('Dewi Lestari');
        });
    }
}
