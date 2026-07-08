<?php

namespace Tests\Browser\PetaRisiko;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * TC-PR-003 — Legenda dinamis
 * BEFORE: 1 lahan observasi tinggi + 1 belum observasi
 * AFTER : tambah observasi rendah → legenda berubah
 *
 * Assignee : Arjuna
 * Feature  : Peta Risiko Lahan (AGS-82)
 * Command  : php artisan dusk --filter=TCPR003_LegendaDinamisObservasiBaruTest
 */
class TCPR003_LegendaDinamisObservasiBaruTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_legenda_dinamis_setelah_observasi_baru(): void
    {
        $farmer = User::factory()->create(['name' => 'Ahmad Solihin', 'email' => 'ahmad2@agrisupport.id']);

        // Lahan 1: observasi risiko Tinggi (Kering + Banyak + Berat → skor > 70)
        $areaHigh = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Sawah Cidahu']);
        FieldObservation::factory()->forArea($areaHigh)->create([
            'observation_date'      => now()->toDateString(),
            'soil_moisture'         => 'Kering',
            'water_puddle'          => 'Banyak',
            'disease_indication'    => 'Berat',
            'weather_precip_mm'     => 20,
            'weather_soil_moisture' => 0.1,
        ]);

        // Lahan 2: belum ada observasi (Belum Ada Data)
        $areaEmpty = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Kebun Ciamis']);

        $this->browse(function (Browser $browser) use ($farmer, $areaEmpty) {
            // ── SEBELUM: legenda Tinggi=1, Belum=1 ──
            $browser->loginAs($farmer)
                    ->visit(route('peta-risiko.index'))
                    ->waitFor('[dusk="legenda-peta-risiko"]', 30)
                    ->assertSeeIn('[dusk="legenda-count-tinggi"]', '1')
                    ->assertSeeIn('[dusk="legenda-count-belum"]', '1')
                    ->assertSeeIn('[dusk="legenda-count-rendah"]', '0');

            // ── AKSI: tambah observasi rendah di Kebun Ciamis (via factory) ──
            FieldObservation::factory()->forArea($areaEmpty)->create([
                'observation_date'      => now()->toDateString(),
                'soil_moisture'         => 'Normal',
                'water_puddle'          => 'Tidak Ada',
                'disease_indication'    => 'Tidak Ada',
                'weather_precip_mm'     => 0,
                'weather_soil_moisture' => 0.35,
            ]);

            // ── SESUDAH: reload → legenda berubah: Tinggi=1, Rendah=1, Belum=0 ──
            $browser->visit(route('peta-risiko.index'))
                    ->waitFor('[dusk="legenda-peta-risiko"]', 30)
                    ->assertSeeIn('[dusk="legenda-count-tinggi"]', '1')
                    ->assertSeeIn('[dusk="legenda-count-rendah"]', '1')
                    ->assertSeeIn('[dusk="legenda-count-belum"]', '0');
        });
    }
}
