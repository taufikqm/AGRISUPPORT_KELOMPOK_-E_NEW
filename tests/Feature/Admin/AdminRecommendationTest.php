<?php

namespace Tests\Feature\Admin;

use App\Models\ActionLog;
use App\Models\AgriculturalArea;
use App\Models\Recommendation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * PHPUnit Feature Test — Manajemen Rekomendasi Admin (AGS-92)
 * Assignee: Daenisty
 * Command : php artisan test --filter=AdminRecommendationTest
 */
class AdminRecommendationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dapat_akses_halaman_manajemen_rekomendasi(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.rekomendasi.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/RecommendationManagement')
                ->has('logs')
                ->has('petani')
                ->has('areas')
            );
    }

    public function test_admin_dapat_tambah_rekomendasi_manual(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        $area   = AgriculturalArea::factory()->for($petani)->create();

        $this->actingAs($admin)
            ->post(route('admin.rekomendasi.store'), [
                'user_id'     => $petani->id,
                'area_id'     => $area->id,
                'description' => 'Segera perbaiki drainase lahan sebelum musim hujan.',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('recommendations', [
            'category' => 'Manual',
            'description' => 'Segera perbaiki drainase lahan sebelum musim hujan.',
        ]);
        $this->assertDatabaseHas('action_logs', [
            'user_id'              => $petani->id,
            'agricultural_area_id' => $area->id,
            'action_type'          => 'manual',
        ]);
    }

    public function test_filter_berdasarkan_petani_hanya_tampil_log_petani_tersebut(): void
    {
        $admin   = User::factory()->admin()->create();
        $petani1 = User::factory()->create(['role' => 'petani']);
        $petani2 = User::factory()->create(['role' => 'petani']);
        $rec     = Recommendation::create([
            'category' => 'Manual', 'title' => 'Test', 'description' => 'desc', 'urgency' => 'TINGGI', 'color' => 'blue',
        ]);

        ActionLog::create(['user_id' => $petani1->id, 'recommendation_id' => $rec->id, 'action_type' => 'manual', 'performed_at' => now()]);
        ActionLog::create(['user_id' => $petani2->id, 'recommendation_id' => $rec->id, 'action_type' => 'manual', 'performed_at' => now()]);

        $this->actingAs($admin)
            ->get(route('admin.rekomendasi.index', ['petani' => $petani1->id]))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->where('logs.data.0.user_id', $petani1->id)
                ->where('logs.total', 1)
            );
    }

    public function test_filter_berdasarkan_status_sistem_hanya_tampil_completion(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        $rec    = Recommendation::create([
            'category' => 'Penyakit', 'title' => 'Rekomendasi Sistem', 'description' => 'desc', 'urgency' => 'SEGERA', 'color' => 'red',
        ]);

        ActionLog::create(['user_id' => $petani->id, 'recommendation_id' => $rec->id, 'action_type' => 'completion', 'performed_at' => now()]);
        ActionLog::create(['user_id' => $petani->id, 'recommendation_id' => $rec->id, 'action_type' => 'manual', 'performed_at' => now()]);

        $this->actingAs($admin)
            ->get(route('admin.rekomendasi.index', ['status' => 'completion']))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->where('logs.total', 1));
    }

    public function test_store_gagal_jika_deskripsi_kosong(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        $area   = AgriculturalArea::factory()->for($petani)->create();

        $this->actingAs($admin)
            ->postJson(route('admin.rekomendasi.store'), [
                'user_id'     => $petani->id,
                'area_id'     => $area->id,
                'description' => '',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('description');
    }

    public function test_store_gagal_jika_lahan_bukan_milik_petani(): void
    {
        $admin   = User::factory()->admin()->create();
        $petani1 = User::factory()->create(['role' => 'petani']);
        $petani2 = User::factory()->create(['role' => 'petani']);
        $area    = AgriculturalArea::factory()->for($petani2)->create();

        $this->actingAs($admin)
            ->post(route('admin.rekomendasi.store'), [
                'user_id'     => $petani1->id,
                'area_id'     => $area->id,
                'description' => 'Test rekomendasi.',
            ])
            ->assertSessionHasErrors('area_id');
    }

    public function test_petani_tidak_bisa_akses_halaman_manajemen_rekomendasi(): void
    {
        $petani = User::factory()->create(['role' => 'petani']);

        $this->actingAs($petani)
            ->get(route('admin.rekomendasi.index'))
            ->assertRedirect();
    }

    public function test_guest_diarahkan_ke_login(): void
    {
        $this->get(route('admin.rekomendasi.index'))
            ->assertRedirect();
    }
}
