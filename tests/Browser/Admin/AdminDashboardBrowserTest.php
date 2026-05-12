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
 *   Database: agrisupport_dusk + PostGIS extension aktif
 */
class AdminDashboardBrowserTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_admin_login_langsung_masuk_dashboard_admin(): void
    {
        $admin = User::factory()->admin()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit('/')
                    ->waitForLocation('/admin/dashboard')
                    ->assertPathIs('/admin/dashboard')
                    ->assertSee('Dashboard Admin');
        });
    }

    public function test_card_statistik_tampil_di_dashboard(): void
    {
        $admin   = User::factory()->admin()->create();
        $farmer  = User::factory()->create();
        $area    = AgriculturalArea::factory()->for($farmer)->create();
        FieldObservation::factory()->forArea($area)->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.dashboard'))
                    ->waitForText('Dashboard Admin');
                    // TODO: ->assertSeeIn('[dusk="card-total-petani"]', '1')
                    // ->assertSeeIn('[dusk="card-total-lahan"]', '1')
                    // ->assertSeeIn('[dusk="card-total-observasi"]', '1');
        });
    }

    public function test_navigasi_ke_manajemen_pengguna_dari_dashboard(): void
    {
        $admin = User::factory()->admin()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.dashboard'))
                    ->waitForText('Dashboard Admin');
                    // TODO: ->click('@link-manajemen-pengguna')
                    // ->assertPathIs('/admin/pengguna');
        });
    }
}
