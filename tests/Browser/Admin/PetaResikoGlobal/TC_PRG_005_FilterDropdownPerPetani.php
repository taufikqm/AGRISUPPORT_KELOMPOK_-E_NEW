<?php

namespace Tests\Browser\Admin\PetaResikoGlobal;

use App\Models\AgriculturalArea;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * Dusk Browser Test — TC-PRG-005
 * Modul  : Peta Risiko Global Admin (AGS-93)
 * Skenario: Filter dropdown per petani memfilter lahan yang tampil di panel
 * Assignee: Arjuna
 * Command : php artisan dusk --filter=TC_PRG_005_FilterDropdownPerPetani
 *
 * KONDISI DINAMIS:
 *   (SEBELUM) Panel menampilkan 3 lahan dari semua petani:
 *             "Sawah Budi", "Kebun Budi" (milik Kemal Palevi),
 *             "Ladang Siti" (milik Siti Aminah)
 *   (AKSI)    Pilih "Kemal Palevi" di dropdown filter petani
 *   (SESUDAH) Hanya lahan milik Budi tampil (Sawah Budi, Kebun Budi);
 *             "Ladang Siti" tidak tampil di panel
 *
 * PRASYARAT:
 *   php artisan serve (di terminal terpisah)
 *   Database: northeast (testing) — bukan production
 */
class TC_PRG_005_FilterDropdownPerPetani extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_filter_dropdown_per_petani(): void
    {
        $admin   = User::factory()->admin()->create();
        $petani1 = User::factory()->create(['name' => 'Kemal Palevi', 'role' => 'petani']);
        $petani2 = User::factory()->create(['name' => 'Siti Aminah', 'role' => 'petani']);
        AgriculturalArea::factory()->for($petani1)->create(['name' => 'Sawah Padi Pak Kemal']);
        AgriculturalArea::factory()->for($petani1)->create(['name' => 'Kebun Jagung Pak Kemal']);
        AgriculturalArea::factory()->for($petani2)->create(['name' => 'Ladang Kedelai Siti']);

        $this->browse(function (Browser $browser) use ($admin, $petani1) {
            $browser->loginAs($admin)
                    ->visit(route('admin.peta-risiko.index'))
                    ->waitForText('Peta Risiko Global', 25)
                    // (SEBELUM) Panel menampilkan 3 lahan dari semua petani
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Sawah Padi Pak Kemal')
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Ladang Kedelai Siti')
                    // AKSI: Pilih "Kemal Palevi" di dropdown filter petani
                    ->select('[dusk="filter-petani-peta"]', $petani1->id)
                    ->pause(3000)
                    // (SESUDAH) Hanya lahan milik Budi tampil
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Sawah Padi Pak Kemal')
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Kebun Jagung Pak Kemal');
        });
    }
}
