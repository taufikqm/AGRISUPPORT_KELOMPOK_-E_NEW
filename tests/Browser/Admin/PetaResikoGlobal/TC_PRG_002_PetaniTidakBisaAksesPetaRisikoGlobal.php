<?php

namespace Tests\Browser\Admin\PetaResikoGlobal;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * Dusk Browser Test — TC-PRG-002
 * Modul  : Peta Risiko Global Admin (AGS-93)
 * Skenario: Petani (non-admin) tidak bisa akses Peta Risiko Global
 * Assignee: Arjuna
 * Command : php artisan dusk --filter=TC_PRG_002_PetaniTidakBisaAksesPetaRisikoGlobal
 *
 * KONDISI DINAMIS:
 *   (SEBELUM) Petani "Kemal Palevi" login dan berada di /dashboard
 *   (AKSI)    Coba akses langsung URL /admin/peta-risiko
 *   (SESUDAH) Di-redirect kembali ke /dashboard, halaman Peta Risiko Global TIDAK tampil
 *
 * PRASYARAT:
 *   php artisan serve (di terminal terpisah)
 *   Database: northeast (testing) — bukan production
 */
class TC_PRG_002_PetaniTidakBisaAksesPetaRisikoGlobal extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_petani_tidak_bisa_akses_peta_risiko_global(): void
    {
        $petani = User::factory()->create(['name' => 'Kemal Palevi', 'role' => 'petani']);

        $this->browse(function (Browser $browser) use ($petani) {
            $browser->loginAs($petani)
                    ->visit('/dashboard')
                    ->waitForText('Dashboard', 25)
                    // (SEBELUM) Petani di halaman /dashboard
                    ->assertPathIs('/dashboard')
                    // AKSI: Coba akses langsung /admin/peta-risiko
                    ->visit('/admin/peta-risiko')
                    // (SESUDAH) Di-redirect kembali ke /dashboard
                    ->waitForLocation('/dashboard', 30)
                    ->assertPathIs('/dashboard')
                    ->assertDontSee('Peta Risiko Global');
        });
    }
}
