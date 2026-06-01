<?php

namespace Tests\Feature;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * PHPUnit Feature Test — Insight Historis & Analisis Tren (AGS-86)
 * Assignee: ketrin
 * Command : php artisan test --filter=HistoricalInsightTest
 */
class HistoricalInsightTest extends TestCase
{
    use RefreshDatabase;

    public function test_halaman_insight_historis_dapat_diakses(): void
    {
        $farmer = User::factory()->create();

        $this->actingAs($farmer)
            ->get(route('insight-historis.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->component('InsightHistoris'));
    }

    public function test_api_historical_data_mengembalikan_data_terformat(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();
        FieldObservation::factory()->forArea($area)->count(5)->create();

        $this->actingAs($farmer)
            ->getJson(route('api.historical-data'))
            ->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_filter_berdasarkan_area_id(): void
    {
        $farmer = User::factory()->create();
        $area1  = AgriculturalArea::factory()->for($farmer)->create();
        $area2  = AgriculturalArea::factory()->for($farmer)->create();
        FieldObservation::factory()->forArea($area1)->count(3)->create(['observation_date' => now()]);
        FieldObservation::factory()->forArea($area2)->count(2)->create(['observation_date' => now()]);

        $this->actingAs($farmer)
            ->getJson(route('api.historical-data', ['area_id' => $area1->id]))
            ->assertStatus(200)
            ->assertJson(['meta' => ['total_observasi' => 3]]);
    }

    public function test_filter_berdasarkan_tahun(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();

        $this->actingAs($farmer)
            ->getJson(route('api.historical-data', ['year' => 2026]))
            ->assertStatus(200);
    }

    public function test_empty_state_jika_tidak_ada_data_historis(): void
    {
        $farmer = User::factory()->create();

        $this->actingAs($farmer)
            ->getJson(route('api.historical-data'))
            ->assertStatus(200)
            ->assertJson(['data' => []]);
    }

    public function test_petani_hanya_melihat_data_lahannya_sendiri(): void
    {
        $farmer1 = User::factory()->create();
        $farmer2 = User::factory()->create();
        $area2   = AgriculturalArea::factory()->for($farmer2)->create();
        FieldObservation::factory()->forArea($area2)->count(3)->create();

        // farmer1 mencoba mengakses area milik farmer2
        $this->actingAs($farmer1)
            ->getJson(route('api.historical-data', ['area_id' => $area2->id]))
            ->assertStatus(200)
            ->assertJson(['data' => []]);
    }

    public function test_guest_diarahkan_ke_login(): void
    {
        $this->get(route('insight-historis.index'))
            ->assertRedirect(route('login'));
    }
}
