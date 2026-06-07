<?php

namespace Tests\Feature\Admin;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * PHPUnit Feature Test — Manajemen Pengguna Admin (AGS-90)
 * Assignee: Bian
 * Command : php artisan test --filter=AdminUserManagementTest
 */
class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    // ── Akses & daftar ──────────────────────────────────────────────────────────

    /** TC-01 */
    public function test_admin_dapat_melihat_daftar_petani(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->count(2)->create(['role' => 'petani']);

        $this->actingAs($admin)
            ->get(route('admin.pengguna.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/UserManagement')
                ->where('users.total', 2) // admin tidak ikut terdaftar
            );
    }

    public function test_petani_tidak_bisa_akses_manajemen_pengguna(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'petani']))
            ->get(route('admin.pengguna.index'))
            ->assertRedirect(route('dashboard'));
    }

    /** TC-02 */
    public function test_pencarian_petani_berdasarkan_nama(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create(['role' => 'petani', 'name' => 'Budi Santoso']);
        User::factory()->create(['role' => 'petani', 'name' => 'Siti Aminah']);

        $this->actingAs($admin)
            ->get(route('admin.pengguna.index', ['search' => 'Budi']))
            ->assertInertia(fn ($page) => $page
                ->where('users.total', 1)
                ->where('users.data.0.name', 'Budi Santoso')
            );
    }

    /** TC-03 */
    public function test_filter_status_nonaktif(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create(['role' => 'petani', 'is_active' => true]);
        User::factory()->create(['role' => 'petani', 'is_active' => false]);

        $this->actingAs($admin)
            ->get(route('admin.pengguna.index', ['status' => 'nonaktif']))
            ->assertInertia(fn ($page) => $page
                ->where('users.total', 1)
                ->where('users.data.0.is_active', false)
            );
    }

    /** TC-04 */
    public function test_daftar_menampilkan_jumlah_lahan_dan_observasi_terakhir(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        $area   = AgriculturalArea::factory()->for($petani)->create();
        FieldObservation::factory()->forArea($area)->create(['observation_date' => '2026-05-20']);

        $this->actingAs($admin)
            ->get(route('admin.pengguna.index'))
            ->assertInertia(fn ($page) => $page
                ->where('users.data.0.agricultural_areas_count', 1)
                ->where('users.data.0.last_observation_date', fn ($d) => str_starts_with((string) $d, '2026-05-20'))
            );
    }

    /** Detail lengkap: profil, statistik, daftar lahan, kondisi terkini */
    public function test_detail_pengguna_menyajikan_data_lengkap(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        $area   = AgriculturalArea::factory()->for($petani)->create(['area_size' => 2.5]);
        FieldObservation::factory()->forArea($area)->create([
            'observation_date' => '2026-05-20',
            'crop_condition'   => 'Baik',
        ]);

        $this->actingAs($admin)
            ->get(route('admin.pengguna.index', ['detail_id' => $petani->id]))
            ->assertInertia(fn ($page) => $page
                ->where('detail.profile.id', $petani->id)
                ->where('detail.stats.lands_count', 1)
                ->where('detail.stats.observations_count', 1)
                ->where('detail.lands.0.observations_count', 1)
                ->where('detail.latest_observation.crop_condition', 'Baik')
            );
    }

    public function test_detail_null_tanpa_detail_id(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create(['role' => 'petani']);

        $this->actingAs($admin)
            ->get(route('admin.pengguna.index'))
            ->assertInertia(fn ($page) => $page->where('detail', null));
    }

    // ── Update ───────────────────────────────────────────────────────────────────

    /** TC-05 */
    public function test_admin_dapat_mengedit_profil_petani(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);

        $this->actingAs($admin)
            ->put(route('admin.pengguna.update', $petani->id), [
                'name'         => 'Nama Diperbarui',
                'email'        => 'baru@petani.id',
                'phone_number' => '081234567890',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $petani->refresh();
        $this->assertSame('Nama Diperbarui', $petani->name);
        $this->assertSame('baru@petani.id', $petani->email);
    }

    public function test_edit_gagal_jika_email_sudah_dipakai(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        User::factory()->create(['email' => 'dipakai@petani.id']);

        $this->actingAs($admin)
            ->put(route('admin.pengguna.update', $petani->id), [
                'name'  => $petani->name,
                'email' => 'dipakai@petani.id',
            ])
            ->assertSessionHasErrors('email');
    }

    // ── Reset password ────────────────────────────────────────────────────────────

    /** TC-06 */
    public function test_admin_dapat_reset_password_petani(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        $oldHash = $petani->password;

        $this->actingAs($admin)
            ->post(route('admin.pengguna.reset-password', $petani->id))
            ->assertSessionHas('reset_password');

        $newPassword = session('reset_password');
        $this->assertTrue(Hash::check($newPassword, $petani->refresh()->password));
        $this->assertNotSame($oldHash, $petani->password);
    }

    // ── Toggle status ──────────────────────────────────────────────────────────────

    /** TC-07 */
    public function test_admin_dapat_menonaktifkan_akun_petani(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani', 'is_active' => true]);

        $this->actingAs($admin)
            ->patch(route('admin.pengguna.toggle-status', $petani->id))
            ->assertRedirect();

        $this->assertFalse($petani->refresh()->is_active);
    }

    // ── Destroy ──────────────────────────────────────────────────────────────────

    /** TC-08 */
    public function test_admin_dapat_menghapus_akun_petani(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);

        $this->actingAs($admin)
            ->delete(route('admin.pengguna.destroy', $petani->id))
            ->assertRedirect();

        $this->assertDatabaseMissing('users', ['id' => $petani->id]);
    }

    // ── Keamanan: tidak bisa mengelola akun admin lain ──────────────────────────────

    public function test_admin_tidak_bisa_menghapus_akun_admin_lain(): void
    {
        $admin  = User::factory()->admin()->create();
        $target = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->delete(route('admin.pengguna.destroy', $target->id))
            ->assertStatus(403);

        $this->assertDatabaseHas('users', ['id' => $target->id]);
    }

    public function test_admin_tidak_bisa_menonaktifkan_akun_admin_lain(): void
    {
        $admin  = User::factory()->admin()->create();
        $target = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patch(route('admin.pengguna.toggle-status', $target->id))
            ->assertStatus(403);
    }

    // ── Login diblokir untuk akun nonaktif ──────────────────────────────────────────

    public function test_akun_nonaktif_tidak_bisa_login(): void
    {
        $petani = User::factory()->create([
            'role'      => 'petani',
            'is_active' => false,
        ]);

        $this->post('/login', [
            'email'    => $petani->email,
            'password' => 'password',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }
}
