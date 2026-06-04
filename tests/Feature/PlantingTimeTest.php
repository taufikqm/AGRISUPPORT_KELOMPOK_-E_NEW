<?php

namespace Tests\Feature;

use App\Models\AgriculturalArea;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * PHPUnit Feature Test — Prediksi Waktu Tanam Terbaik (AGS-72)
 * Assignee: Daenisty
 * Command : php artisan test --filter=PlantingTimeTest
 */
class PlantingTimeTest extends TestCase
{
    use RefreshDatabase;

    /** Stub Open-Meteo Archive agar test deterministik & tidak memanggil API nyata. */
    private function fakeArchiveSukses(): void
    {
        $times = [];
        $rain  = [];
        $temp  = [];
        $awal  = now()->subYears(2)->startOfMonth();

        for ($i = 0; $i < 24; $i++) {
            $times[] = $awal->copy()->addMonths($i)->toDateString();
            $rain[]  = 6.0;
            $temp[]  = 27.0;
        }

        Http::fake([
            'archive-api.open-meteo.com/*' => Http::response([
                'daily' => [
                    'time'                => $times,
                    'precipitation_sum'   => $rain,
                    'temperature_2m_mean' => $temp,
                ],
            ], 200),
        ]);
    }

    public function test_halaman_waktu_tanam_dapat_diakses(): void
    {
        $farmer = User::factory()->create();

        $this->actingAs($farmer)
            ->get(route('waktu-tanam.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->component('WaktuTanam')->has('areas'));
    }

    public function test_analisis_waktu_tanam_berhasil_diproses(): void
    {
        $this->fakeArchiveSukses();

        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();

        $this->actingAs($farmer)
            ->postJson(route('waktu-tanam.analyze'), ['area_id' => $area->id, 'crop_type' => 'padi'])
            ->assertStatus(200)
            ->assertJsonStructure([
                'area' => ['id', 'name'],
                'prediction' => [
                    'start_date', 'end_date', 'confidence_score',
                    'confidence_label', 'basis', 'tips', 'limited_data',
                ],
            ]);
    }

    public function test_analisis_gagal_jika_area_tidak_punya_geometry(): void
    {
        $farmer = User::factory()->create();

        $this->actingAs($farmer)
            ->postJson(route('waktu-tanam.analyze'), ['area_id' => 999, 'crop_type' => 'padi'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('area_id');
    }

    public function test_riwayat_analisis_tersimpan_di_action_log(): void
    {
        $this->fakeArchiveSukses();

        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();

        $this->actingAs($farmer)
            ->postJson(route('waktu-tanam.analyze'), ['area_id' => $area->id, 'crop_type' => 'padi'])
            ->assertStatus(200);

        $this->assertDatabaseHas('action_logs', [
            'user_id'              => $farmer->id,
            'agricultural_area_id' => $area->id,
            'action_type'          => 'planting_schedule',
        ]);
    }

    public function test_klik_berulang_tidak_menduplikasi_action_log(): void
    {
        $this->fakeArchiveSukses();

        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();

        $this->actingAs($farmer)->postJson(route('waktu-tanam.analyze'), ['area_id' => $area->id]);
        $this->actingAs($farmer)->postJson(route('waktu-tanam.analyze'), ['area_id' => $area->id]);

        $this->assertDatabaseCount('action_logs', 1);
    }

    public function test_analisis_tetap_jalan_saat_open_meteo_gagal(): void
    {
        Http::fake(['archive-api.open-meteo.com/*' => Http::response([], 500)]);

        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();

        $this->actingAs($farmer)
            ->postJson(route('waktu-tanam.analyze'), ['area_id' => $area->id, 'crop_type' => 'padi'])
            ->assertStatus(200)
            ->assertJson(['prediction' => ['limited_data' => true]]);
    }

    public function test_petani_tidak_bisa_analisis_lahan_milik_orang_lain(): void
    {
        $farmer1 = User::factory()->create();
        $farmer2 = User::factory()->create();
        $area    = AgriculturalArea::factory()->for($farmer2)->create();

        $this->actingAs($farmer1)
            ->postJson(route('waktu-tanam.analyze'), ['area_id' => $area->id, 'crop_type' => 'padi'])
            ->assertStatus(403);
    }

    public function test_guest_diarahkan_ke_login(): void
    {
        $this->get(route('waktu-tanam.index'))
            ->assertRedirect(route('login'));
    }
}
