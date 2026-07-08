<?php

namespace Tests\Browser\PetaRisiko;

use App\Models\AgriculturalArea;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * TC-PR-001 — Akses halaman Peta Risiko
 * Petani memiliki lahan → peta Leaflet tampil
 *
 * SEBELUM: di Dashboard
 * SESUDAH: di /peta-risiko, peta ter-render
 *
 * Assignee : Arjuna
 * Feature  : Peta Risiko Lahan (AGS-82)
 * Command  : php artisan dusk --filter=TCPR001_AksesHalamanPetaRisikoTest
 */
class TCPR001_AksesHalamanPetaRisikoTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_halaman_peta_risiko_dapat_diakses_dengan_peta_leaflet(): void
    {
        $farmer = User::factory()->create(['name' => 'Ahmad Solihin', 'email' => 'ahmad@agrisupport.id']);
        AgriculturalArea::factory()->for($farmer)->create(['name' => 'Sawah Cidahu']);

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    // SEBELUM: di Dashboard
                    ->visit(route('dashboard'))
                    ->waitForText('Dashboard', 25)
                    // AKSI: navigasi ke Peta Risiko
                    ->visit(route('peta-risiko.index'))
                    // SESUDAH: halaman Peta Risiko tampil dengan peta Leaflet
                    ->waitFor('.leaflet-container', 30)
                    ->assertPathIs('/peta-risiko')
                    ->assertSee('Peta Risiko Lahan')
                    ->assertPresent('.leaflet-container');
        });
    }
}
