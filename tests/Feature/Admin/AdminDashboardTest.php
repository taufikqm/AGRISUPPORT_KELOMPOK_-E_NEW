<?php

namespace Tests\Feature\Admin;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

/**
 * PHPUnit Feature Test — Dashboard Admin (AGS-81)
 * Assignee: Taufik
 * Command : php artisan test --filter=AdminDashboardTest
 */
class AdminDashboardTest extends TestCase
{
    use DatabaseTransactions;

    public function test_admin_dapat_akses_dashboard(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Dashboard')
                ->has('stats')
                ->has('stats.total_farmers')
                ->has('stats.total_areas')
                ->has('stats.total_observations')
                ->has('stats.total_completed')
                ->has('riskDistribution')
                ->has('weeklyTrend')
                ->has('recentActivities')
            );
    }

    public function test_dashboard_statistik_sesuai_jumlah_di_database(): void
    {
        $admin = User::factory()->admin()->create();

        $basePetani = User::where('role', 'petani')->count();
        $baseLahan  = AgriculturalArea::count();
        $baseObs    = FieldObservation::count();

        $farmers = User::factory()->count(3)->create(['role' => 'petani']);
        foreach ($farmers as $farmer) {
            $area = AgriculturalArea::factory()->for($farmer)->create();
            FieldObservation::factory()->forArea($area)->create();
        }

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->where('stats.total_farmers',      $basePetani + 3)
                ->where('stats.total_areas',        $baseLahan  + 3)
                ->where('stats.total_observations', $baseObs    + 3)
            );
    }

    public function test_dashboard_returns_latest_10_activities(): void
    {
        $admin  = User::factory()->admin()->create();
        $farmer = User::factory()->create(['role' => 'petani']);
        $area   = AgriculturalArea::factory()->for($farmer)->create();

        FieldObservation::factory()->forArea($area)->count(15)->create();

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->where('recentActivities', fn ($acts) => count($acts) <= 10)
            );
    }

    public function test_dashboard_dengan_database_kosong_tidak_error(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->where('stats.total_farmers',      fn ($v) => is_int($v))
                ->where('stats.total_observations', fn ($v) => is_int($v))
            );
    }

    public function test_petani_tidak_bisa_akses_dashboard_admin(): void
    {
        $farmer = User::factory()->create(['role' => 'petani']);

        $this->actingAs($farmer)
            ->get(route('admin.dashboard'))
            ->assertRedirect(route('dashboard'));
    }

    public function test_guest_diarahkan_ke_login(): void
    {
        $this->get(route('admin.dashboard'))
            ->assertRedirect(route('login'));
    }
}
