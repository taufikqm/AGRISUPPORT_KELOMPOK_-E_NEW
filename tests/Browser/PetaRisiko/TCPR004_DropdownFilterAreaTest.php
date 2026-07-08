<?php

namespace Tests\Browser\PetaRisiko;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * TC-PR-004 — Dropdown filter area
 * Pilih lahan → popup terbuka
 *
 * SEBELUM: dropdown = "Semua Lahan"
 * SESUDAH: dropdown = lahan terpilih, popup terbuka
 *
 * Assignee : Arjuna
 * Feature  : Peta Risiko Lahan (AGS-82)
 * Command  : php artisan dusk --filter=TCPR004_DropdownFilterAreaTest
 */
class TCPR004_DropdownFilterAreaTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_dropdown_filter_area_zoom_ke_lahan(): void
    {
        $farmer = User::factory()->create(['name' => 'Ahmad Solihin', 'email' => 'ahmad3@agrisupport.id']);
        $area1  = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Sawah Cidahu']);
        $area2  = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Kebun Ciamis']);

        // Beri observasi agar polygon ter-render penuh
        FieldObservation::factory()->forArea($area1)->create([
            'observation_date'   => now()->toDateString(),
            'soil_moisture'      => 'Normal',
            'water_puddle'       => 'Tidak Ada',
            'disease_indication' => 'Tidak Ada',
        ]);

        $this->browse(function (Browser $browser) use ($farmer, $area1) {
            $browser->loginAs($farmer)
                    ->visit(route('peta-risiko.index'))
                    ->waitFor('.leaflet-container', 30)
                    // SEBELUM: dropdown menunjukkan "Semua Lahan"
                    ->waitFor('[dusk="filter-area"]', 15)
                    // AKSI: pilih "Sawah Cidahu"
                    ->select('[dusk="filter-area"]', (string) $area1->id)
                    ->pause(2000) // tunggu flyToBounds + openPopup selesai
                    // SESUDAH: popup terbuka menampilkan nama lahan
                    ->waitFor('.leaflet-popup-content', 15)
                    ->assertSeeIn('.leaflet-popup-content', 'Sawah Cidahu');
        });
    }
}
