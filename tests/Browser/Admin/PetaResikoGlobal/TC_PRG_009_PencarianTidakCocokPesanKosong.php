<?php

namespace Tests\Browser\Admin\PetaResikoGlobal;

use App\Models\AgriculturalArea;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * Dusk Browser Test — TC-PRG-009
 * Modul  : Peta Risiko Global Admin (AGS-93)
 * Skenario: Pencarian dengan kata kunci yang tidak cocok menampilkan
 *           pesan "Tidak ditemukan hasil"
 * Assignee: Arjuna
 * Command : php artisan dusk --filter=TC_PRG_009_PencarianTidakCocokPesanKosong
 *
 * KONDISI DINAMIS:
 *   (SEBELUM) Panel menampilkan 2 lahan: "Sawah Budi", "Kebun Budi"
 *   (AKSI)    Ketik keyword "xyz123tidakada" di search bar (tidak ada lahan cocok)
 *   (SESUDAH) Panel menampilkan pesan "Tidak ditemukan hasil untuk xyz123tidakada";
 *             kedua lahan tidak tampil lagi
 *
 * PRASYARAT:
 *   php artisan serve (di terminal terpisah)
 *   Database: northeast (testing) — bukan production
 */
class TC_PRG_009_PencarianTidakCocokPesanKosong extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_pencarian_tidak_cocok_menampilkan_pesan_kosong(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['name' => 'Kemal Palevi', 'role' => 'petani']);
        AgriculturalArea::factory()->for($petani)->create(['name' => 'Sawah Padi Pak Kemal']);
        AgriculturalArea::factory()->for($petani)->create(['name' => 'Kebun Jagung Pak Kemal']);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.peta-risiko.index'))
                    ->waitForText('Peta Risiko Global', 25)
                    // (SEBELUM) 2 lahan tampil di panel
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Sawah Padi Pak Kemal')
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Kebun Jagung Pak Kemal')
                    // AKSI: Ketik pencarian yang tidak cocok
                    ->type('[dusk="input-search-peta"]', 'xyz123tidakada')
                    ->pause(500)
                    // (SESUDAH) Pesan "Tidak ditemukan hasil untuk xyz123tidakada" muncul
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Tidak ditemukan hasil untuk')
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'xyz123tidakada');
        });
    }
}
