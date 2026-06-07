<?php

namespace Tests\Feature\Admin;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * PHPUnit Feature Test — Manajemen Lahan Admin (AGS-91 / ST-01)
 * Assignee: Arjuna
 * Command : php artisan test --filter=AdminLandManagementTest
 */
class AdminLandManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dapat_melihat_semua_lahan(): void
    {
        $admin   = User::factory()->admin()->create();
        $petani1 = User::factory()->create(['role' => 'petani']);
        $petani2 = User::factory()->create(['role' => 'petani']);
        AgriculturalArea::factory()->for($petani1)->create();
        AgriculturalArea::factory()->for($petani2)->create();

        $this->actingAs($admin)
            ->get(route('admin.lahan.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/LandManagement')
                ->where('areas.total', 2)
            );
    }

    public function test_petani_tidak_bisa_akses_manajemen_lahan(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'petani']))
            ->get(route('admin.lahan.index'))
            ->assertRedirect(route('dashboard'));
    }

    public function test_filter_lahan_berdasarkan_petani(): void
    {
        $admin   = User::factory()->admin()->create();
        $petani1 = User::factory()->create(['role' => 'petani']);
        $petani2 = User::factory()->create(['role' => 'petani']);
        AgriculturalArea::factory()->for($petani1)->create();
        AgriculturalArea::factory()->for($petani2)->create();

        $this->actingAs($admin)
            ->get(route('admin.lahan.index', ['petani' => $petani1->id]))
            ->assertInertia(fn ($page) => $page
                ->where('areas.total', 1)
                ->where('areas.data.0.owner_id', $petani1->id)
            );
    }

    public function test_search_lahan_berdasarkan_nama(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        AgriculturalArea::factory()->for($petani)->create(['name' => 'Sawah Utara']);
        AgriculturalArea::factory()->for($petani)->create(['name' => 'Kebun Selatan']);

        $this->actingAs($admin)
            ->get(route('admin.lahan.index', ['search' => 'Sawah']))
            ->assertInertia(fn ($page) => $page
                ->where('areas.total', 1)
                ->where('areas.data.0.name', 'Sawah Utara')
            );
    }

    public function test_detail_lahan_menyertakan_riwayat_observasi(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        $area   = AgriculturalArea::factory()->for($petani)->create();
        FieldObservation::factory()->forArea($area)->create(['observation_date' => '2026-05-20']);
        FieldObservation::factory()->forArea($area)->create(['observation_date' => '2026-05-25']);

        $this->actingAs($admin)
            ->get(route('admin.lahan.index', ['detail_id' => $area->id]))
            ->assertInertia(fn ($page) => $page
                ->where('detail.area.id', $area->id)
                ->where('detail.observations', fn ($obs) => count($obs) === 2)
            );
    }

    public function test_admin_dapat_mengedit_lahan(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        $area   = AgriculturalArea::factory()->for($petani)->create();

        $this->actingAs($admin)
            ->put(route('admin.lahan.update', $area->id), [
                'name'      => 'Lahan Diperbarui',
                'area_size' => 3.5,
                'soil_type' => 'Aluvial',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $this->assertDatabaseHas('agricultural_areas', [
            'id'        => $area->id,
            'name'      => 'Lahan Diperbarui',
            'soil_type' => 'Aluvial',
        ]);
    }

    public function test_edit_lahan_gagal_jika_nama_kosong(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        $area   = AgriculturalArea::factory()->for($petani)->create();

        $this->actingAs($admin)
            ->put(route('admin.lahan.update', $area->id), ['name' => ''])
            ->assertSessionHasErrors('name');
    }

    public function test_hapus_lahan_ikut_menghapus_observasi(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        $area   = AgriculturalArea::factory()->for($petani)->create();
        $obs    = FieldObservation::factory()->forArea($area)->create();

        $this->actingAs($admin)
            ->delete(route('admin.lahan.destroy', $area->id))
            ->assertRedirect();

        $this->assertDatabaseMissing('agricultural_areas', ['id' => $area->id]);
        $this->assertDatabaseMissing('field_observations', ['id' => $obs->id]);
    }
}
