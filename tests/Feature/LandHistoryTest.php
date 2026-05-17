<?php

namespace Tests\Feature;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

/**
 * PHPUnit Feature Test — Riwayat Kondisi Lahan (AGS-71)
 * Assignee: Bian
 * Command : php artisan test --filter=LandHistoryTest
 */
class LandHistoryTest extends TestCase
{
    use DatabaseTransactions;

    public function test_halaman_riwayat_lahan_dapat_diakses(): void
    {
        $farmer = User::factory()->create();

        $this->actingAs($farmer)
            ->get(route('riwayat-lahan.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->component('RiwayatLahan'));
    }

    public function test_api_land_history_mengembalikan_data_json(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();
        FieldObservation::factory()->forArea($area)->count(3)->create();

        $this->actingAs($farmer)
            ->getJson(route('api.land-history'))
            ->assertStatus(200)
            ->assertJsonStructure(['data'])
            ->assertJsonCount(3, 'data');
    }

    public function test_filter_berdasarkan_area_id_berfungsi(): void
    {
        $farmer = User::factory()->create();
        $area1  = AgriculturalArea::factory()->for($farmer)->create();
        $area2  = AgriculturalArea::factory()->for($farmer)->create();
        FieldObservation::factory()->forArea($area1)->count(2)->create();
        FieldObservation::factory()->forArea($area2)->count(3)->create();

        $this->actingAs($farmer)
            ->getJson(route('api.land-history', ['area_id' => $area1->id]))
            ->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_halaman_kosong_jika_tidak_ada_observasi(): void
    {
        $farmer = User::factory()->create();

        $this->actingAs($farmer)
            ->getJson(route('api.land-history'))
            ->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_petani_hanya_melihat_riwayat_lahannya_sendiri(): void
    {
        $farmer1 = User::factory()->create();
        $farmer2 = User::factory()->create();
        $area2   = AgriculturalArea::factory()->for($farmer2)->create();
        FieldObservation::factory()->forArea($area2)->count(3)->create();

        $this->actingAs($farmer1)
            ->getJson(route('api.land-history'))
            ->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_guest_diarahkan_ke_login(): void
    {
        $this->get(route('riwayat-lahan.index'))
            ->assertRedirect(route('login'));
    }
}
