<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * PHPUnit Feature Test — Pengaturan Admin (AGS-96)
 * Assignee: Taufik
 * Command : php artisan test --filter=AdminSettingsTest
 */
class AdminSettingsTest extends TestCase
{
    use RefreshDatabase;

    // ── Akses ────────────────────────────────────────────────────────────────

    /** TC-01 */
    public function test_admin_settings_page_is_accessible_by_admin(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get('/admin/pengaturan')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->component('Admin/Settings'));
    }

    /** TC-03 */
    public function test_farmer_cannot_access_admin_settings(): void
    {
        $farmer = User::factory()->create(['role' => 'petani']);

        $this->actingAs($farmer)
            ->get('/admin/pengaturan')
            ->assertRedirect(route('dashboard'));
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get('/admin/pengaturan')->assertRedirect();
    }

    // ── Update Profil ──────────────────────────────────────────────────────────

    /** TC-04 & TC-05 */
    public function test_admin_profile_information_can_be_updated(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patch('/admin/pengaturan', [
                'name'  => 'Admin Baru',
                'email' => 'admin.baru@agrisupport.id',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $admin->refresh();
        $this->assertSame('Admin Baru', $admin->name);
        $this->assertSame('admin.baru@agrisupport.id', $admin->email);
    }

    /** TC-06 */
    public function test_admin_profile_update_fails_with_duplicate_email(): void
    {
        $admin = User::factory()->admin()->create();
        $other = User::factory()->create(['email' => 'sudah.dipakai@agrisupport.id']);

        $this->actingAs($admin)
            ->patch('/admin/pengaturan', [
                'name'  => $admin->name,
                'email' => 'sudah.dipakai@agrisupport.id',
            ])
            ->assertSessionHasErrors('email');
    }

    // ── Ubah Password ──────────────────────────────────────────────────────────

    /** TC-07 */
    public function test_admin_password_can_be_updated(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->put('/admin/pengaturan/password', [
                'current_password'      => 'password',
                'password'              => 'PasswordBaru123',
                'password_confirmation' => 'PasswordBaru123',
            ])
            ->assertSessionHasNoErrors();

        $this->assertTrue(Hash::check('PasswordBaru123', $admin->refresh()->password));
    }

    /** TC-08 */
    public function test_admin_password_update_requires_correct_current_password(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->put('/admin/pengaturan/password', [
                'current_password'      => 'password-salah',
                'password'              => 'PasswordBaru123',
                'password_confirmation' => 'PasswordBaru123',
            ])
            ->assertSessionHasErrors('current_password');

        $this->assertTrue(Hash::check('password', $admin->refresh()->password));
    }

    // ── Keamanan: tidak ada hapus akun ──────────────────────────────────────────

    /** TC-09 */
    public function test_admin_settings_page_does_not_contain_delete_account_section(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get('/admin/pengaturan')
            ->assertStatus(200)
            ->assertDontSee('Hapus Akun');
    }
}
