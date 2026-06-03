<?php

namespace Tests\Feature;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * PHPUnit Feature Test — Peta Risiko Lahan (AGS-82)
 * Assignee: Arjuna
 * Command : php artisan test --filter=RiskMapTest
 */
class RiskMapTest extends TestCase
{
    use RefreshDatabase;

    public function test_halaman_peta_risiko_dapat_diakses(): void
    {
        $farmer = User::factory()->create();

        $this->actingAs($farmer)
            ->get(route('peta-risiko.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('PetaRisiko')
                ->has('areas')
            );
    }

    public function test_data_lahan_dikirim_sebagai_geojson(): void
    {
        $farmer = User::factory()->create();
        AgriculturalArea::factory()->for($farmer)->count(2)->create();

        $this->actingAs($farmer)
            ->get(route('peta-risiko.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('PetaRisiko')
                ->has('areas', 2)
            );
    }

    public function test_risk_level_dihitung_benar_berdasarkan_observasi(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();
        FieldObservation::factory()->forArea($area)->create([
            'soil_moisture'         => 'Kering',
            'water_puddle'          => 'Banyak',
            'disease_indication'    => 'Berat',
            'weather_precip_mm'     => 20,
            'weather_soil_moisture' => 0.1,
        ]);

        $this->actingAs($farmer)
            ->get(route('peta-risiko.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('PetaRisiko')
                ->where('areas.0.risk_level', 'tinggi')
                ->where('areas.0.color', '#ef4444')
                ->has('areas.0.dimensions', 3)
                ->has('areas.0.observation_date')
            );
    }

    public function test_lahan_tanpa_observasi_tetap_tampil(): void
    {
        $farmer = User::factory()->create();
        AgriculturalArea::factory()->for($farmer)->create(); // tanpa observasi

        $this->actingAs($farmer)
            ->get(route('peta-risiko.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->has('areas', 1));
    }

    public function test_petani_tidak_bisa_akses_lahan_petani_lain(): void
    {
        $farmer1 = User::factory()->create();
        $farmer2 = User::factory()->create();
        AgriculturalArea::factory()->for($farmer2)->count(3)->create();

        $response = $this->actingAs($farmer1)
            ->get(route('peta-risiko.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->has('areas', 0));
    }

    public function test_guest_diarahkan_ke_login(): void
    {
        $this->get(route('peta-risiko.index'))
            ->assertRedirect(route('login'));
    }
}
