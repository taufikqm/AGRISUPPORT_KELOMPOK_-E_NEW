<?php

namespace Tests\Browser\Admin\PetaResikoGlobal;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * Dusk Browser Test — TC-PRG-004
 * Modul  : Peta Risiko Global Admin (AGS-93)
 * Skenario: Kartu Risiko bergeser dari "Belum Observasi" ke "Risiko Tinggi"
 *           setelah observasi baru dengan parameter kritis ditambahkan
 * Assignee: Arjuna
 * Command : php artisan dusk --filter=TC_PRG_004_LevelRisikoBerubahSetelahObservasiBaru
 *
 * KONDISI DINAMIS:
 *   (SEBELUM) Belum Observasi = 1, Risiko Tinggi = 0
 *             (Sawah Merpati belum punya observasi)
 *   (AKSI)    Tambah observasi dengan parameter kritis:
 *             soil_moisture=Kering, water_puddle=Banyak, disease_indication=Berat
 *   (SESUDAH) Reload → Belum Observasi = 0, Risiko Tinggi = 1
 *
 * PRASYARAT:
 *   php artisan serve (di terminal terpisah)
 *   Database: northeast (testing) — bukan production
 */
class TC_PRG_004_LevelRisikoBerubahSetelahObservasiBaru extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_level_risiko_berubah_setelah_observasi_baru(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['name' => 'Kemal Palevi', 'role' => 'petani']);
        $area   = AgriculturalArea::factory()->for($petani)->create(['name' => 'Sawah Pak Kemal']);

        $this->browse(function (Browser $browser) use ($admin, $area) {
            // (SEBELUM) Belum ada observasi → Belum = 1, Tinggi = 0
            $browser->loginAs($admin)
                    ->visit(route('admin.peta-risiko.index'))
                    ->waitForText('Peta Risiko Global', 25)
                    ->assertSeeIn('[dusk="kartu-risiko-belum"]', '1')
                    ->assertSeeIn('[dusk="kartu-risiko-tinggi"]', '0');

            // AKSI: Tambah observasi risiko tinggi (semua parameter kritis)
            FieldObservation::factory()->forArea($area)->create([
                'soil_moisture'      => 'Kering',
                'water_puddle'       => 'Banyak',
                'disease_indication' => 'Berat',
                'observation_date'   => now()->toDateString(),
            ]);

            // (SESUDAH) Reload → Belum Observasi = 0, Risiko Tinggi = 1
            $browser->visit(route('admin.peta-risiko.index'))
                    ->waitForText('Peta Risiko Global', 25)
                    ->assertSeeIn('[dusk="kartu-risiko-belum"]', '0')
                    ->assertSeeIn('[dusk="kartu-risiko-tinggi"]', '1');
        });
    }
}
