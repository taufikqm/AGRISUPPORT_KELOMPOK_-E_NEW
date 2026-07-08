<?php

namespace Tests\Browser\Admin\PetaResikoGlobal;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * Dusk Browser Test — TC-PRG-010
 * Modul  : Peta Risiko Global Admin (AGS-93)
 * Skenario: Panel prioritas menampilkan lahan diurutkan dari risiko tertinggi ke rendah
 * Assignee: Arjuna
 * Command : php artisan dusk --filter=TC_PRG_010_PanelPrioritasUrutDariRisikoTertinggi
 *
 * KONDISI DINAMIS:
 *   (SEBELUM) 2 lahan terdaftar:
 *             - "Sawah Aman" (risiko rendah, soil_moisture=Lembab, water_puddle=Tidak Ada)
 *             - "Ladang Bahaya" (risiko tinggi, soil_moisture=Kering, water_puddle=Banyak)
 *   (AKSI)    Admin mengunjungi halaman Peta Risiko Global
 *   (SESUDAH) Panel menampilkan "Ladang Bahaya" SEBELUM "Sawah Aman"
 *             (urutan turun dari risiko tertinggi)
 *
 * PRASYARAT:
 *   php artisan serve (di terminal terpisah)
 *   Database: northeast (testing) — bukan production
 */
class TC_PRG_010_PanelPrioritasUrutDariRisikoTertinggi extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_panel_prioritas_diurut_dari_risiko_tertinggi(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['name' => 'Kemal Palevi', 'role' => 'petani']);

        // Lahan risiko rendah (dibuat lebih dulu)
        $areaRendah = AgriculturalArea::factory()->for($petani)->create(['name' => 'Sawah Aman']);
        FieldObservation::factory()->forArea($areaRendah)->create([
            'soil_moisture'         => 'Lembab',
            'water_puddle'          => 'Tidak Ada',
            'disease_indication'    => 'Tidak Ada',
            'observation_date'      => now()->toDateString(),
            'weather_precip_mm'     => 0,
            'weather_soil_moisture' => 0.5,
        ]);

        // Lahan risiko tinggi (dibuat setelahnya)
        $areaTinggi = AgriculturalArea::factory()->for($petani)->create(['name' => 'Ladang Bahaya']);
        FieldObservation::factory()->forArea($areaTinggi)->create([
            'soil_moisture'      => 'Kering',
            'water_puddle'       => 'Banyak',
            'disease_indication' => 'Berat',
            'observation_date'   => now()->toDateString(),
        ]);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.peta-risiko.index'))
                    ->waitForText('Peta Risiko Global', 25)
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Ladang Bahaya')
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Sawah Aman');

            // (SESUDAH) Verifikasi urutan: Ladang Bahaya (tinggi) muncul SEBELUM Sawah Aman (rendah)
            $panelText = $browser->text('[dusk="panel-prioritas"]');
            $posTinggi = strpos($panelText, 'Ladang Bahaya');
            $posRendah = strpos($panelText, 'Sawah Aman');
            $this->assertTrue(
                $posTinggi < $posRendah,
                'Lahan risiko tinggi (Ladang Bahaya) harus muncul sebelum risiko rendah (Sawah Aman) di panel prioritas'
            );
        });
    }
}
