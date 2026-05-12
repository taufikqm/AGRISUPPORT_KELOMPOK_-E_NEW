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
                ->has('petaniList')
            );
    }

    public function test_api_peta_risiko_mengembalikan_semua_lahan_semua_petani(): void
    {
        $admin   = User::factory()->admin()->create();
        $farmer1 = User::factory()->create();
        $farmer2 = User::factory()->create();
        AgriculturalArea::factory()->for($farmer1)->count(2)->create();
        AgriculturalArea::factory()->for($farmer2)->count(3)->create();

        $this->actingAs($admin)
            ->getJson(route('admin.api.peta-risiko'))
            ->assertStatus(200)
            ->assertJsonStructure(['type', 'features']);
    }

    public function test_risk_level_dihitung_benar_di_peta_global(): void
    {
        $admin  = User::factory()->admin()->create();
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();
        FieldObservation::factory()->forArea($area)->create([
            'crop_condition' => 'Kritis',
        ]);

        $this->actingAs($admin)
            ->getJson(route('admin.api.peta-risiko'))
            ->assertStatus(200);
        // TODO: assert features[0].properties.risk_level === 'tinggi'
    }

    public function test_filter_by_petani_berfungsi(): void
    {
        $admin   = User::factory()->admin()->create();
        $farmer1 = User::factory()->create();
        $farmer2 = User::factory()->create();
        AgriculturalArea::factory()->for($farmer1)->count(2)->create();
        AgriculturalArea::factory()->for($farmer2)->count(3)->create();

        $this->actingAs($admin)
            ->getJson(route('admin.api.peta-risiko', ['user_id' => $farmer1->id]))
            ->assertStatus(200);
        // TODO: assert count features === 2
    }

    public function test_petani_tidak_bisa_akses_peta_risiko_global_admin(): void
    {
        $farmer = User::factory()->create(['role' => 'petani']);

        $this->actingAs($farmer)
            ->get(route('admin.peta-risiko.index'))
            ->assertStatus(403);
    }
}
