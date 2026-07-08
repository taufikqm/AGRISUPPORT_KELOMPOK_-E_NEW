<?php

namespace Tests\Browser\PetaRisiko;

use App\Models\AgriculturalArea;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * TC-PR-009 — Dropdown kembali ke "Semua Lahan"
 * Peta kembali ke overview setelah dropdown di-reset
 *
 * SEBELUM: filter = lahan tertentu
 * SESUDAH: filter = "Semua Lahan"
 *
 * Assignee : Arjuna
 * Feature  : Peta Risiko Lahan (AGS-82)
 * Command  : php artisan dusk --filter=TCPR009_DropdownKembaliSemuaLahanTest
 */
class TCPR009_DropdownKembaliSemuaLahanTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_dropdown_kembali_semua_lahan(): void
    {
        $farmer = User::factory()->create(['name' => 'Ahmad Solihin', 'email' => 'ahmad7@agrisupport.id']);
        $area1  = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Sawah Cidahu']);
        $area2  = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Kebun Ciamis']);

        $this->browse(function (Browser $browser) use ($farmer, $area1) {
            $browser->loginAs($farmer)
                    ->visit(route('peta-risiko.index'))
                    ->waitFor('.leaflet-container', 30)
                    ->waitFor('[dusk="filter-area"]', 15)
                    // SEBELUM: pilih satu lahan
                    ->select('[dusk="filter-area"]', (string) $area1->id)
                    ->pause(2000)
                    ->waitFor('.leaflet-popup-content', 15)
                    ->assertSeeIn('.leaflet-popup-content', 'Sawah Cidahu')
                    // AKSI: pilih kembali "Semua Lahan"
                    ->select('[dusk="filter-area"]', '')
                    ->pause(2000)
                    // SESUDAH: popup tidak lagi menampilkan satu lahan tertentu
                    // dan dropdown kembali ke "Semua Lahan"
                    ->assertSelected('[dusk="filter-area"]', '');
        });
    }
}
