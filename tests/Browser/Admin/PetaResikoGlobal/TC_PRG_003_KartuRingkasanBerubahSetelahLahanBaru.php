<?php

namespace Tests\Browser\Admin\PetaResikoGlobal;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * Dusk Browser Test — TC-PRG-003
 * Modul  : Peta Risiko Global Admin (AGS-93)
 * Skenario: Kartu ringkasan "Belum Observasi" berubah setelah lahan baru ditambahkan
 * Assignee: Arjuna
 * Command : php artisan dusk --filter=TC_PRG_003_KartuRingkasanBerubahSetelahLahanBaru
 *
 * KONDISI DINAMIS:
 *   (SEBELUM) Kartu "Belum Observasi" = 1 (hanya Sawah Siti yang belum observasi)
 *   (AKSI)    Tambah 1 lahan baru milik "Rina Wati" tanpa observasi
 *   (SESUDAH) Reload → Kartu "Belum Observasi" naik menjadi 2
 *
 * PRASYARAT:
 *   php artisan serve (di terminal terpisah)
 *   Database: northeast (testing) — bukan production
 */
class TC_PRG_003_KartuRingkasanBerubahSetelahLahanBaru extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_kartu_ringkasan_berubah_setelah_lahan_baru_ditambahkan(): void
    {
        $admin   = User::factory()->admin()->create();
        $petani1 = User::factory()->create(['name' => 'Kemal Palevi', 'role' => 'petani']);
        $area1   = AgriculturalArea::factory()->for($petani1)->create(['name' => 'Sawah Pak Kemal']);
        // Sawah Budi sudah punya observasi → tidak masuk "Belum Observasi"
        FieldObservation::factory()->forArea($area1)->create([
            'soil_moisture'      => 'Kering',
            'water_puddle'       => 'Banyak',
            'disease_indication' => 'Berat',
            'observation_date'   => now()->toDateString(),
        ]);

        $petani2 = User::factory()->create(['name' => 'Siti Aminah', 'role' => 'petani']);
        AgriculturalArea::factory()->for($petani2)->create(['name' => 'Sawah Siti']);
        // Sawah Siti belum ada observasi → "Belum Observasi" = 1

        $this->browse(function (Browser $browser) use ($admin) {
            // (SEBELUM) Kartu Belum Observasi = 1
            $browser->loginAs($admin)
                    ->visit(route('admin.peta-risiko.index'))
                    ->waitForText('Peta Risiko Global', 25)
                    ->assertSeeIn('[dusk="kartu-risiko-belum"]', '1');

            // AKSI: Tambah 1 lahan baru milik "Rina Wati" (belum ada observasi)
            $petani3 = User::factory()->create(['name' => 'Rina Wati', 'role' => 'petani']);
            AgriculturalArea::factory()->for($petani3)->create(['name' => 'Kebun Rina']);

            // (SESUDAH) Reload → Kartu Belum Observasi = 2 (naik dari 1)
            $browser->visit(route('admin.peta-risiko.index'))
                    ->waitForText('Peta Risiko Global', 25)
                    ->assertSeeIn('[dusk="kartu-risiko-belum"]', '2');
        });
    }
}
