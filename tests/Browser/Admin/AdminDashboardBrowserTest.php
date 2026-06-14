<?php

namespace Tests\Browser\Admin;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * Dusk Browser Test — Dashboard Admin (AGS-81)
 * Assignee: Taufik
 * Command : php artisan dusk --filter=AdminDashboardBrowserTest
 *
 * PRASYARAT:
 *   php artisan serve (di terminal terpisah)
 *   Database: northeast (testing) — bukan production
 */
class AdminDashboardBrowserTest extends DuskTestCase
{
    use DatabaseMigrations;

    // TC-DASHBOARD-001
    public function test_admin_login_langsung_masuk_dashboard_admin(): void
    {
        $admin = User::factory()->admin()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit('/')
                    ->waitForLocation('/admin/dashboard', 30)
                    ->assertPathIs('/admin/dashboard')
                    ->assertSee('Dashboard');
        });
    }

    // TC-DASHBOARD-002
    public function test_card_statistik_tampil_di_dashboard(): void
    {
        $admin   = User::factory()->admin()->create();
        $farmer  = User::factory()->create();
        $area    = AgriculturalArea::factory()->for($farmer)->create();
        FieldObservation::factory()->forArea($area)->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.dashboard'))
                    ->waitForText('Dashboard', 25)
                    ->assertPresent('[dusk="card-total-petani"]')
                    ->assertPresent('[dusk="card-total-lahan"]')
                    ->assertPresent('[dusk="card-total-observasi"]')
                    ->assertPresent('[dusk="card-tindakan-selesai"]');
        });
    }

    // TC-DASHBOARD-003
    public function test_grafik_distribusi_risiko_lahan_tampil(): void
    {
        $admin  = User::factory()->admin()->create();
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();
        FieldObservation::factory()->forArea($area)->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.dashboard'))
                    ->waitForText('Dashboard', 25)
                    ->assertPresent('[dusk="risk-chart-section"]')
                    ->assertSee('Distribusi Risiko Lahan');
        });
    }

    // TC-DASHBOARD-004
    public function test_grafik_tren_observasi_mingguan_tampil(): void
    {
        $admin  = User::factory()->admin()->create();
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();
        FieldObservation::factory()->forArea($area)->create([
            'observation_date' => now()->toDateString(),
        ]);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.dashboard'))
                    ->waitForText('Dashboard', 25)
                    ->assertPresent('[dusk="trend-chart-section"]')
                    ->assertSee('Tren Observasi');
        });
    }

    // TC-DASHBOARD-005
    public function test_tabel_aktivitas_observasi_terbaru_tampil(): void
    {
        $admin  = User::factory()->admin()->create();
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();
        FieldObservation::factory()->forArea($area)->create([
            'observation_date' => now()->toDateString(),
        ]);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.dashboard'))
                    ->waitForText('Dashboard', 25)
                    ->assertPresent('[dusk="recent-activities-section"]')
                    ->assertSee('Aktivitas Observasi Terbaru');
        });
    }

    // TC-DASHBOARD-006
    public function test_navigasi_ke_manajemen_pengguna_dari_dashboard(): void
    {
        $admin = User::factory()->admin()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.dashboard'))
                    ->waitForText('Dashboard', 25)
                    ->click('[dusk="nav-pengguna"]')
                    ->waitForLocation('/admin/pengguna', 20)
                    ->assertPathIs('/admin/pengguna');
        });
    }

    // TC-DASHBOARD-007
    public function test_link_lihat_semua_mengarah_ke_halaman_laporan(): void
    {
        $admin  = User::factory()->admin()->create();
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();
        FieldObservation::factory()->forArea($area)->create([
            'observation_date' => now()->toDateString(),
        ]);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.dashboard'))
                    ->waitForText('Dashboard', 25)
                    ->scrollIntoView('[dusk="link-lihat-semua"]')
                    ->click('[dusk="link-lihat-semua"]')
                    ->waitForLocation('/admin/laporan', 30)
                    ->assertPathIs('/admin/laporan');
        });
    }
}
