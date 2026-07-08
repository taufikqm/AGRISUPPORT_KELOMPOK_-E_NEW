<?php

namespace Tests\Browser\PetaRisiko;

use App\Models\AgriculturalArea;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * TC-PR-006 — Popup lahan tanpa observasi
 * Lahan yang belum punya observasi → popup menampilkan ajakan input kondisi
 *
 * SEBELUM: popup belum terbuka
 * SESUDAH: popup "Belum Ada Data" + link input kondisi
 *
 * Assignee : Arjuna
 * Feature  : Peta Risiko Lahan (AGS-82)
 * Command  : php artisan dusk --filter=TCPR006_PopupLahanTanpaObservasiTest
 */
class TCPR006_PopupLahanTanpaObservasiTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_popup_lahan_tanpa_observasi_ajakan_input(): void
    {
        $farmer = User::factory()->create(['name' => 'Ahmad Solihin', 'email' => 'ahmad5@agrisupport.id']);
        $area   = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Kebun Ciamis']);
        // Tidak membuat observasi → risk_level = null, label "Belum Ada Data"

        $this->browse(function (Browser $browser) use ($farmer, $area) {
            $browser->loginAs($farmer)
                    ->visit(route('peta-risiko.index'))
                    ->waitFor('.leaflet-container', 30)
                    // SEBELUM: popup belum terbuka
                    ->assertMissing('.leaflet-popup-content')
                    // AKSI: pilih lahan via dropdown
                    ->waitFor('[dusk="filter-area"]', 15)
                    ->select('[dusk="filter-area"]', (string) $area->id)
                    ->pause(2000)
                    // SESUDAH: popup tampil dengan "Belum Ada Data" + link input kondisi
                    ->waitFor('.leaflet-popup-content', 15)
                    ->assertSeeIn('.leaflet-popup-content', 'Kebun Ciamis')
                    ->assertSeeIn('.leaflet-popup-content', 'Belum Ada Data')
                    ->assertPresent('.leaflet-popup-content a[href*="input-kondisi"]');
        });
    }
}
