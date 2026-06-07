<?php

namespace Tests\Feature\Admin;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * PHPUnit Feature Test — Peta Risiko Global Admin (AGS-93)
 * Assignee: Arjuna
 * Command : php artisan test --filter=AdminGlobalRiskMapTest
 */
class AdminGlobalRiskMapTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dapat_akses_peta_risiko_global(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.peta-risiko.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/GlobalRiskMap')
                ->has('areas')
                ->has('riskSummary')
                ->has('petani')
            );
    }

    public function test_petani_tidak_bisa_akses_peta_risiko_global(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'petani']))
            ->get(route('admin.peta-risiko.index'))
            ->assertRedirect(route('dashboard'));
    }

    public function test_peta_menampilkan_lahan_semua_petani_dengan_pemilik_dan_geojson(): void
    {
        $admin   = User::factory()->admin()->create();
        $petani1 = User::factory()->create(['role' => 'petani', 'name' => 'Budi Tani']);
        $petani2 = User::factory()->create(['role' => 'petani']);
        AgriculturalArea::factory()->for($petani1)->create();
        AgriculturalArea::factory()->for($petani2)->create();

        $this->actingAs($admin)
            ->get(route('admin.peta-risiko.index'))
            ->assertInertia(fn ($page) => $page
                ->has('areas', 2)
                ->where('totalPetani', 2)
                ->where('areas.0.owner', fn ($owner) => is_string($owner) && $owner !== '')
                ->where('areas.0.geojson', fn ($g) => $g !== null)
            );
    }

    public function test_lahan_tanpa_observasi_dihitung_belum_ada_data(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        AgriculturalArea::factory()->for($petani)->create();

        $this->actingAs($admin)
            ->get(route('admin.peta-risiko.index'))
            ->assertInertia(fn ($page) => $page
                ->where('riskSummary.belum', 1)
                ->where('areas.0.risk_level', null)
            );
    }

    public function test_lahan_dengan_observasi_punya_level_dan_skor_risiko(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        $area   = AgriculturalArea::factory()->for($petani)->create();
        FieldObservation::factory()->forArea($area)->create();

        $this->actingAs($admin)
            ->get(route('admin.peta-risiko.index'))
            ->assertInertia(fn ($page) => $page
                ->where('areas.0.risk_level', fn ($lvl) => in_array($lvl, ['tinggi', 'sedang', 'rendah'], true))
                ->where('areas.0.score', fn ($s) => is_int($s))
            );
    }

    public function test_filter_berdasarkan_petani(): void
    {
        $admin   = User::factory()->admin()->create();
        $petani1 = User::factory()->create(['role' => 'petani']);
        $petani2 = User::factory()->create(['role' => 'petani']);
        AgriculturalArea::factory()->for($petani1)->create();
        AgriculturalArea::factory()->for($petani2)->create();

        $this->actingAs($admin)
            ->get(route('admin.peta-risiko.index', ['petani' => $petani1->id]))
            ->assertInertia(fn ($page) => $page
                ->has('areas', 1)
                ->where('areas.0.owner_id', $petani1->id)
            );
    }
}
