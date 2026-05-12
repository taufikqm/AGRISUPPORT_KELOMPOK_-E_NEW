<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * PHPUnit Feature Test — Manajemen Pengguna Admin (AGS-90)
 * Assignee: Bian
 * Command : php artisan test --filter=AdminUserManagementTest
 */
class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dapat_akses_halaman_manajemen_pengguna(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.pengguna.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/UserManagement')
                ->has('users')
            );
    }

    public function test_daftar_pengguna_menampilkan_semua_petani(): void
    {
        $admin   = User::factory()->admin()->create();
        $farmers = User::factory()->count(5)->create(['role' => 'petani']);

        $this->actingAs($admin)
            ->get(route('admin.pengguna.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->has('users.data', 5));
    }

    public function test_search_pengguna_by_nama_berfungsi(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create(['name' => 'Budi Santoso', 'role' => 'petani']);
        User::factory()->create(['name' => 'Siti Rahayu', 'role' => 'petani']);

        $this->actingAs($admin)
            ->get(route('admin.pengguna.index', ['search' => 'Budi']))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->has('users.data', 1));
    }

    public function test_admin_dapat_lihat_detail_pengguna(): void
    {
        $admin  = User::factory()->admin()->create();
        $farmer = User::factory()->create(['role' => 'petani']);

        $this->actingAs($admin)
            ->get(route('admin.pengguna.show', $farmer))
            ->assertStatus(200);
    }

    public function test_admin_dapat_update_data_pengguna(): void
    {
        $admin  = User::factory()->admin()->create();
        $farmer = User::factory()->create(['role' => 'petani']);

        $this->actingAs($admin)
            ->put(route('admin.pengguna.update', $farmer), [
                'name'  => 'Nama Baru',
                'email' => $farmer->email,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('users', ['id' => $farmer->id, 'name' => 'Nama Baru']);
    }

    public function test_petani_tidak_bisa_akses_manajemen_pengguna(): void
    {
        $farmer = User::factory()->create(['role' => 'petani']);

        $this->actingAs($farmer)
            ->get(route('admin.pengguna.index'))
            ->assertStatus(403);
    }
}
