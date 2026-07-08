<?php

namespace Tests\Browser\Admin\PetaResikoGlobal;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * Dusk Browser Test — TC-PRG-008
 * Modul  : Peta Risiko Global Admin (AGS-93)
 * Skenario: Empty state tampil saat tidak ada lahan terdaftar sama sekali
 * Assignee: Arjuna
 * Command : php artisan dusk --filter=TC_PRG_008_EmptyStateSaatTidakAdaLahan
 *
 * KONDISI DINAMIS:
 *   (SEBELUM) Database tidak memiliki data AgriculturalArea sama sekali
 *   (AKSI)    Admin mengunjungi halaman /admin/peta-risiko
 *   (SESUDAH) Empty state tampil dengan pesan
 *             "Belum ada lahan terdaftar untuk ditampilkan di peta";
 *             semua kartu (Tinggi, Sedang, Rendah, Belum) menunjukkan nilai 0
 *
 * PRASYARAT:
 *   php artisan serve (di terminal terpisah)
 *   Database: northeast (testing) — bukan production
 */
class TC_PRG_008_EmptyStateSaatTidakAdaLahan extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_empty_state_saat_tidak_ada_lahan(): void
    {
        $admin = User::factory()->admin()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.peta-risiko.index'))
                    ->waitForText('Peta Risiko Global', 25)
                    // (SESUDAH) Empty state tampil, peta tidak ditampilkan
                    ->assertPresent('[dusk="empty-state"]')
                    ->assertSee('Belum ada lahan terdaftar untuk ditampilkan di peta')
                    // Semua kartu menunjukkan 0
                    ->assertSeeIn('[dusk="kartu-risiko-tinggi"]', '0')
                    ->assertSeeIn('[dusk="kartu-risiko-sedang"]', '0')
                    ->assertSeeIn('[dusk="kartu-risiko-rendah"]', '0')
                    ->assertSeeIn('[dusk="kartu-risiko-belum"]', '0');
        });
    }
}
