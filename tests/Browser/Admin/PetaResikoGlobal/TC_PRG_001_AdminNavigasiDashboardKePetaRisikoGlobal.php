<?php

namespace Tests\Browser\Admin\PetaResikoGlobal;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * Dusk Browser Test — TC-PRG-001
 * Modul  : Peta Risiko Global Admin (AGS-93)
 * Skenario: Admin navigasi dari Dashboard ke Peta Risiko Global
 * Assignee: Arjuna
 * Command : php artisan dusk --filter=TC_PRG_001_AdminNavigasiDashboardKePetaRisikoGlobal
 *
 * KONDISI DINAMIS:
 *   (SEBELUM) Admin berada di halaman /admin/dashboard
 *   (AKSI)    Klik menu "Peta Risiko" di sidebar
 *   (SESUDAH) Halaman berpindah ke /admin/peta-risiko, judul "Peta Risiko Global" tampil
 *
 * PRASYARAT:
 *   php artisan serve (di terminal terpisah)
 *   Database: northeast (testing) — bukan production
 */
class TC_PRG_001_AdminNavigasiDashboardKePetaRisikoGlobal extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_admin_navigasi_dari_dashboard_ke_peta_risiko_global(): void
    {
        $admin = User::factory()->admin()->create(['name' => 'Kemal Palevi']);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit('/admin/dashboard')
                    ->waitForText('Dashboard', 25)
                    // (SEBELUM) Admin berada di halaman Dashboard Admin
                    ->assertPathIs('/admin/dashboard')
                    // AKSI: Klik menu "Peta Risiko" di sidebar
                    ->click('[dusk="nav-peta-risiko"]')
                    // (SESUDAH) Halaman berpindah ke /admin/peta-risiko
                    ->waitForLocation('/admin/peta-risiko', 30)
                    ->assertPathIs('/admin/peta-risiko')
                    ->assertSee('Peta Risiko Global');
        });
    }
}
