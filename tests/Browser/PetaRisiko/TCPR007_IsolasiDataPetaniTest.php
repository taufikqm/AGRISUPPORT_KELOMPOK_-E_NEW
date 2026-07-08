<?php

namespace Tests\Browser\PetaRisiko;

use App\Models\AgriculturalArea;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * TC-PR-007 — Isolasi data antar-petani
 * Petani A tidak melihat lahan petani B
 *
 * SEBELUM: DB punya 2 lahan (2 petani berbeda)
 * SESUDAH: petani A hanya lihat lahannya sendiri
 *
 * Assignee : Arjuna
 * Feature  : Peta Risiko Lahan (AGS-82)
 * Command  : php artisan dusk --filter=TCPR007_IsolasiDataPetaniTest
 */
class TCPR007_IsolasiDataPetaniTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_isolasi_data_petani_tidak_lihat_lahan_petani_lain(): void
    {
        $farmerA = User::factory()->create(['name' => 'Ahmad Solihin', 'email' => 'ahmad_a@agrisupport.id']);
        $farmerB = User::factory()->create(['name' => 'Dewi Lestari',  'email' => 'dewi_b@agrisupport.id']);

        AgriculturalArea::factory()->for($farmerA)->create(['name' => 'Sawah Cidahu']);
        AgriculturalArea::factory()->for($farmerB)->create(['name' => 'Ladang Bogor']);

        $this->browse(function (Browser $browser) use ($farmerA) {
            $browser->loginAs($farmerA)
                    ->visit(route('peta-risiko.index'))
                    ->waitFor('.leaflet-container', 30)
                    // SESUDAH: hanya lahan milik Ahmad yang tampil
                    ->assertSee('Sawah Cidahu')
                    ->assertDontSee('Ladang Bogor');
        });
    }
}
