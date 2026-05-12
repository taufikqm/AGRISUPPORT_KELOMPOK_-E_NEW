<?php

namespace Tests\Feature;

use App\Models\AgriculturalArea;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * PHPUnit Feature Test — Prediksi Waktu Tanam Terbaik (AGS-72)
 * Assignee: Daenisty
 * Command : php artisan test --filter=PlantingTimeTest
 */
class PlantingTimeTest extends TestCase
{
    use RefreshDatabase;

    public function test_halaman_waktu_tanam_dapat_diakses(): void
    {
        $farmer = User::factory()->create();

        $this->actingAs($farmer)
            ->get(route('waktu-tanam.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->component('WaktuTanam'));
    }

    public function test_analisis_waktu_tanam_berhasil_diproses(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();

        $this->actingAs($farmer)
            ->post(route('waktu-tanam.analyze'), [
                'area_id' => $area->id,
                'crop_type' => 'padi',
            ])
            ->assertStatus(200);
        // TODO: assert response punya data prediksi
    }

    public function test_analisis_gagal_jika_area_tidak_punya_geometry(): void
    {
        $farmer = User::factory()->create();

        // Area tanpa geometry (null) — edge case
        $this->actingAs($farmer)
            ->post(route('waktu-tanam.analyze'), [
                'area_id' => 999,
                'crop_type' => 'padi',
            ])
            ->assertStatus(422);
        // TODO: assert validation error untuk area_id
    }

    public function test_riwayat_analisis_tersimpan_di_action_log(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();

        $this->actingAs($farmer)
            ->post(route('waktu-tanam.analyze'), [
                'area_id' => $area->id,
                'crop_type' => 'padi',
            ]);

        // TODO: $this->assertDatabaseHas('action_logs', ['user_id' => $farmer->id]);
    }

    public function test_petani_tidak_bisa_analisis_lahan_milik_orang_lain(): void
    {
        $farmer1 = User::factory()->create();
        $farmer2 = User::factory()->create();
        $area    = AgriculturalArea::factory()->for($farmer2)->create();

        $this->actingAs($farmer1)
            ->post(route('waktu-tanam.analyze'), [
                'area_id' => $area->id,
                'crop_type' => 'padi',
            ])
            ->assertStatus(403);
    }

    public function test_guest_diarahkan_ke_login(): void
    {
        $this->get(route('waktu-tanam.index'))
            ->assertRedirect(route('login'));
    }
}
