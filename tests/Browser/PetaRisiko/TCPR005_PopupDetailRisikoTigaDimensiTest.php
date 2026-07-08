<?php

namespace Tests\Browser\PetaRisiko;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * TC-PR-005 — Popup detail risiko 3 dimensi
 * Lahan dengan observasi risiko tinggi → popup tampil detail Kekeringan, Genangan, Penyakit
 *
 * SEBELUM: popup belum terbuka
 * SESUDAH: popup tampil dengan detail risiko + link Analisis & Rekomendasi
 *
 * Assignee : Arjuna
 * Feature  : Peta Risiko Lahan (AGS-82)
 * Command  : php artisan dusk --filter=TCPR005_PopupDetailRisikoTigaDimensiTest
 */
class TCPR005_PopupDetailRisikoTigaDimensiTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_popup_detail_risiko_tiga_dimensi(): void
    {
        $farmer = User::factory()->create(['name' => 'Ahmad Solihin', 'email' => 'ahmad4@agrisupport.id']);
        $area   = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Sawah Cidahu']);
        $obs    = FieldObservation::factory()->forArea($area)->create([
            'observation_date'      => now()->toDateString(),
            'soil_moisture'         => 'Kering',
            'water_puddle'          => 'Banyak',
            'disease_indication'    => 'Berat',
            'weather_precip_mm'     => 20,
            'weather_soil_moisture' => 0.1,
        ]);

        $this->browse(function (Browser $browser) use ($farmer, $area) {
            $browser->loginAs($farmer)
                    ->visit(route('peta-risiko.index'))
                    ->waitFor('.leaflet-container', 30)
                    // SEBELUM: popup belum terbuka
                    ->assertMissing('.leaflet-popup-content')
                    // AKSI: pilih lahan via dropdown → popup terbuka
                    ->waitFor('[dusk="filter-area"]', 15)
                    ->select('[dusk="filter-area"]', (string) $area->id)
                    ->pause(2000)
                    // SESUDAH: popup tampil dengan detail risiko
                    ->waitFor('.leaflet-popup-content', 15)
                    ->assertSeeIn('.leaflet-popup-content', 'Sawah Cidahu')
                    ->assertSeeIn('.leaflet-popup-content', 'Tinggi')
                    ->assertSeeIn('.leaflet-popup-content', 'Kekeringan')
                    ->assertSeeIn('.leaflet-popup-content', 'Genangan')
                    ->assertSeeIn('.leaflet-popup-content', 'Penyakit')
                    // Link Analisis dan Rekomendasi ada
                    ->assertPresent('.leaflet-popup-content a[href*="analisis-risiko"]')
                    ->assertPresent('.leaflet-popup-content a[href*="rekomendasi-tindakan"]');
        });
    }
}
