<?php

namespace Tests\Browser\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * Dusk Browser Test — Role System & Autentikasi Admin (AGS-89)
 * Assignee: Taufik Qurohman
 * Command : php artisan dusk --filter=AdminAuthBrowserTest
 *
 * PRASYARAT:
 *   php artisan serve (di terminal terpisah)
 *   Database: agrisupport_dusk + PostGIS extension aktif
 */
class AdminAuthBrowserTest extends DuskTestCase
{
    use DatabaseMigrations;

    /**
     * TC-09 — Deteksi role otomatis saat login
     *
     * Skenario: Login di /login sebagai admin → sistem redirect otomatis ke /admin/dashboard
     */
    public function test_login_admin_di_halaman_login_terpadu_redirect_ke_admin_dashboard(): void
    {
        $admin = User::factory()->state(['role' => 'admin'])->create([
            'password' => bcrypt('password'),
        ]);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->visit('/login')
                    ->assertPathIs('/login')
                    ->assertSee('AgriSupport')
                    ->assertSee('Sistem mendeteksi peran secara otomatis setelah login')
                    ->type('email', $admin->email)
                    ->type('password', 'password')
                    ->press('Masuk ke Sistem')
                    ->waitForLocation('/admin/dashboard', 10)
                    ->assertPathIs('/admin/dashboard');
        });
    }

    /**
     * TC-10 — AdminLayout tampil benar
     *
     * Skenario: Login admin, buka halaman admin, cek sidebar + topbar tampil dengan benar
     */
    public function test_adminlayout_sidebar_dan_header_tampil_setelah_login_admin(): void
    {
        $admin = User::factory()->state(['role' => 'admin'])->create([
            'name'     => 'Taufik Admin',
            'password' => bcrypt('password'),
        ]);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit('/admin/dashboard')
                    ->waitForText('AgriSupport', 10)
                    // Sidebar — brand
                    ->assertSee('AgriSupport')
                    ->assertSee('Admin')
                    // Sidebar — menu items
                    ->assertSee('Dashboard')
                    ->assertSee('Pengguna')
                    ->assertSee('Lahan')
                    ->assertSee('Rekomendasi')
                    ->assertSee('Peta Risiko')
                    ->assertSee('Laporan')
                    ->assertSee('Notifikasi')
                    ->assertSee('Pengaturan')
                    ->assertSee('Keluar')
                    // Header — nama admin dan label role
                    ->assertSee('Taufik Admin')
                    ->assertSee('Administrator');
        });
    }
}
