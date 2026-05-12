<?php

namespace Tests\Feature\Admin;

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

    public function test_admin_dapat_akses_manajemen_rekomendasi(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.rekomendasi.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/RecommendationManagement')
                ->has('recommendations')
            );
    }

    public function test_admin_dapat_tambah_template_rekomendasi(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.rekomendasi.store'), [
                'title'       => 'Atasi Banjir Ringan',
                'description' => 'Perbaiki saluran drainase sekitar lahan.',
                'category'    => 'banjir',
                'risk_type'   => 'flood',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('recommendations', ['title' => 'Atasi Banjir Ringan']);
    }

    public function test_filter_rekomendasi_berdasarkan_kategori(): void
    {
        $admin = User::factory()->admin()->create();
        // TODO: buat beberapa rekomendasi dengan kategori berbeda

        $this->actingAs($admin)
            ->get(route('admin.rekomendasi.index', ['category' => 'banjir']))
            ->assertStatus(200);
        // TODO: assert hanya kategori banjir yang tampil
    }

    public function test_admin_dapat_edit_template_rekomendasi(): void
    {
        $admin = User::factory()->admin()->create();
        // TODO: create recommendation dulu
        // $rec = Recommendation::factory()->create();

        // $this->actingAs($admin)
        //     ->put(route('admin.rekomendasi.update', $rec->id), [...])
        //     ->assertRedirect();
        $this->assertTrue(true); // placeholder
    }

    public function test_admin_dapat_hapus_template_rekomendasi(): void
    {
        $admin = User::factory()->admin()->create();
        // TODO: create recommendation dulu, lalu hapus
        $this->assertTrue(true); // placeholder
    }

    public function test_petani_tidak_bisa_akses_manajemen_rekomendasi_admin(): void
    {
        $farmer = User::factory()->create(['role' => 'petani']);

        $this->actingAs($farmer)
            ->get(route('admin.rekomendasi.index'))
            ->assertStatus(403);
    }
}
