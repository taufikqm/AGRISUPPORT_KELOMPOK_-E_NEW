<?php

namespace Tests\Feature\Admin;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * PHPUnit Feature Test — Manajemen Lahan Admin (AGS-91)
 * Assignee: Arjuna
 * Command : php artisan test --filter=AdminLandManagementTest
 */
class AdminLandManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dapat_akses_manajemen_lahan(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.lahan.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/LandManagement')
                ->has('areas')
            );
    }

    public function test_admin_melihat_lahan_semua_petani(): void
    {
        $admin   = User::factory()->admin()->create();
        $farmer1 = User::factory()->create();
        $farmer2 = User::factory()->create();
        AgriculturalArea::factory()->for($farmer1)->count(2)->create();
        AgriculturalArea::factory()->for($farmer2)->count(3)->create();

        $this->actingAs($admin)
            ->get(route('admin.lahan.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->has('areas.data', 5));
    }

    public function test_filter_lahan_berdasarkan_petani(): void
    {
        $admin   = User::factory()->admin()->create();
        $farmer1 = User::factory()->create();
        $farmer2 = User::factory()->create();
        AgriculturalArea::factory()->for($farmer1)->count(2)->create();
        AgriculturalArea::factory()->for($farmer2)->count(3)->create();

        $this->actingAs($admin)
            ->get(route('admin.lahan.index', ['user_id' => $farmer1->id]))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->has('areas.data', 2));
    }

    public function test_admin_dapat_lihat_detail_lahan_beserta_observasi(): void
    {
        $admin  = User::factory()->admin()->create();
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();
        FieldObservation::factory()->forArea($area)->count(3)->create();

        $this->actingAs($admin)
            ->get(route('admin.lahan.show', $area))
            ->assertStatus(200);
    }

    public function test_admin_dapat_hapus_lahan(): void
    {
        $admin  = User::factory()->admin()->create();
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();

        $this->actingAs($admin)
            ->delete(route('admin.lahan.destroy', $area))
            ->assertRedirect();

        $this->assertDatabaseMissing('agricultural_areas', ['id' => $area->id]);
    }

    public function test_petani_tidak_bisa_akses_manajemen_lahan_admin(): void
    {
        $farmer = User::factory()->create(['role' => 'petani']);

        $this->actingAs($farmer)
            ->get(route('admin.lahan.index'))
            ->assertStatus(403);
    }
}
