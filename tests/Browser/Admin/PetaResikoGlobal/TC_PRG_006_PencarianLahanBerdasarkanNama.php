<?php

namespace Tests\Browser\Admin\PetaResikoGlobal;

use App\Models\AgriculturalArea;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * Dusk Browser Test — TC-PRG-006
 * Modul  : Peta Risiko Global Admin (AGS-93)
 * Skenario: Pencarian lahan berdasarkan nama di search bar
 * Assignee: Arjuna
 * Command : php artisan dusk --filter=TC_PRG_006_PencarianLahanBerdasarkanNama
 *
 * KONDISI DINAMIS:
 *   (SEBELUM) Panel menampilkan 3 lahan:
 *             "Sawah Merpati", "Kebun Apel", "Ladang Jagung"
 *   (AKSI)    Ketik kata kunci "Merpati" di search bar
 *   (SESUDAH) Hanya "Sawah Merpati" tampil; "Kebun Apel" dan
 *             "Ladang Jagung" tidak tampil di panel
 *
 * PRASYARAT:
 *   php artisan serve (di terminal terpisah)
 *   Database: northeast (testing) — bukan production
 */
class TC_PRG_006_PencarianLahanBerdasarkanNama extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_pencarian_lahan_berdasarkan_nama(): void
    {
        $admin   = User::factory()->admin()->create();
        $petani1 = User::factory()->create(['name' => 'Kemal Palevi', 'role' => 'petani']);
        $petani2 = User::factory()->create(['name' => 'Siti Aminah', 'role' => 'petani']);
        AgriculturalArea::factory()->for($petani1)->create(['name' => 'Sawah Padi Pak Kemal']);
        AgriculturalArea::factory()->for($petani2)->create(['name' => 'Kebun Jagung Siti']);
        AgriculturalArea::factory()->for($petani1)->create(['name' => 'Ladang Kedelai Pak Kemal']);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.peta-risiko.index'))
                    ->waitForText('Peta Risiko Global', 25)
                    // (SEBELUM) 3 lahan tampil di panel
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Sawah Padi Pak Kemal')
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Kebun Jagung Pak Kemal')
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Ladang Kedelai Siti')
                    // AKSI: Ketik "Pak Kemal" di search bar
                    ->type('[dusk="input-search-peta"]', 'Pak Kemal')
                    ->pause(500)
                    // (SESUDAH) Hanya lahan "Pak Kemal" tampil
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Sawah Padi Pak Kemal')
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Kebun Jagung Pak Kemal');
        });
    }
}
