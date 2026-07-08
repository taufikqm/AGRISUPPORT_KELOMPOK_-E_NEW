<?php

namespace Tests\Browser\Admin\PetaResikoGlobal;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * Dusk Browser Test — TC-PRG-007
 * Modul  : Peta Risiko Global Admin (AGS-93)
 * Skenario: Toggle kartu risiko menyembunyikan/menampilkan lahan per level risiko
 * Assignee: Arjuna
 * Command : php artisan dusk --filter=TC_PRG_007_ToggleKartuRisikoMenyembunyikanLevel
 *
 * KONDISI DINAMIS:
 *   (SEBELUM)   2 lahan tampil: "Ladang Bahaya" (risiko tinggi), "Sawah Baru" (belum)
 *   (AKSI-1)    Klik kartu "Risiko Tinggi" → toggle OFF
 *   (SESUDAH-1) "Ladang Bahaya" tersembunyi; "Sawah Baru" tetap tampil
 *   (AKSI-2)    Klik kartu "Risiko Tinggi" lagi → toggle ON
 *   (SESUDAH-2) "Ladang Bahaya" kembali tampil di panel
 *
 * PRASYARAT:
 *   php artisan serve (di terminal terpisah)
 *   Database: northeast (testing) — bukan production
 */
class TC_PRG_007_ToggleKartuRisikoMenyembunyikanLevel extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_toggle_kartu_risiko_menyembunyikan_level(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['name' => 'Kemal Palevi', 'role' => 'petani']);

        // Lahan risiko tinggi
        $area1 = AgriculturalArea::factory()->for($petani)->create(['name' => 'Ladang Bahaya']);
        FieldObservation::factory()->forArea($area1)->create([
            'soil_moisture'      => 'Kering',
            'water_puddle'       => 'Banyak',
            'disease_indication' => 'Berat',
            'observation_date'   => now()->toDateString(),
        ]);

        // Lahan belum observasi
        AgriculturalArea::factory()->for($petani)->create(['name' => 'Sawah Baru']);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.peta-risiko.index'))
                    ->waitForText('Peta Risiko Global', 25)
                    // (SEBELUM) Kedua lahan tampil di panel
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Ladang Bahaya')
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Sawah Baru')
                    // AKSI-1: Klik kartu Risiko Tinggi (toggle OFF)
                    ->click('[dusk="kartu-risiko-tinggi"]')
                    ->pause(500)
                    // (SESUDAH-1) Ladang Bahaya tersembunyi, Sawah Baru tetap
                    ->assertDontSeeIn('[dusk="panel-prioritas"]', 'Ladang Bahaya')
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Sawah Baru')
                    // AKSI-2: Klik lagi (toggle ON)
                    ->click('[dusk="kartu-risiko-tinggi"]')
                    ->pause(500)
                    // (SESUDAH-2) Ladang Bahaya kembali tampil
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Ladang Bahaya');
        });
    }
}
