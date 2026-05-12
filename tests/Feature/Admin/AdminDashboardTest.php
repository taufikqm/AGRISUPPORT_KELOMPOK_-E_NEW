<?php

namespace Tests\Feature\Admin;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * PHPUnit Feature Test — Dashboard Admin (AGS-81)
 * Assignee: Taufik
 * Command : php artisan test --filter=AdminDashboardTest
 */
class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dapat_akses_dashboard(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Dashboard')
                ->has('totalPetani')
                ->has('totalLahan')
                ->has('totalObservasi')
            );
    }

    public function test_dashboard_menampilkan_statistik_yang_benar(): void
    {
        $admin   = User::factory()->admin()->create();
        $farmers = User::factory()->count(3)->create();

        foreach ($farmers as $farmer) {
            $area = AgriculturalArea::factory()->for($farmer)->create();
            FieldObservation::factory()->forArea($area)->create();
        }

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->where('totalPetani', 3)
                ->where('totalLahan', 3)
                ->where('totalObservasi', 3)
            );
    }

    public function test_petani_tidak_bisa_akses_dashboard_admin(): void
    {
        $farmer = User::factory()->create(['role' => 'petani']);

        $this->actingAs($farmer)
            ->get(route('admin.dashboard'))
            ->assertStatus(403);
    }

    public function test_guest_diarahkan_ke_login(): void
    {
        $this->get(route('admin.dashboard'))
            ->assertRedirect(route('login'));
    }

    public function test_login_admin_diarahkan_ke_dashboard_admin(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertRedirect(route('admin.dashboard'));
    }
}
