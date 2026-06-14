<?php

namespace Tests\Browser\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * Dusk Browser Test — Pengaturan Admin (AGS-96)
 * Assignee: Taufik
 * Command : php artisan dusk --filter=AdminSettingsBrowserTest
 *
 * PRASYARAT:
 *   php artisan serve (di terminal terpisah)
 *   Database: northeast (testing) — bukan production
 *
 * Catatan: User::factory()->admin() memakai password default "password".
 */
class AdminSettingsBrowserTest extends DuskTestCase
{
    use DatabaseMigrations;

    // TC-PENGATURAN-001
    public function test_halaman_pengaturan_menampilkan_dua_section(): void
    {
        $admin = User::factory()->admin()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.pengaturan.index'))
                    ->waitForText('Pengaturan Admin', 25)
                    ->assertPresent('@section-profil')
                    ->assertPresent('@section-password')
                    ->assertSee('Informasi Profil')
                    ->assertSee('Ubah Password');
        });
    }

    // TC-PENGATURAN-002
    public function test_update_profil_berhasil(): void
    {
        $admin = User::factory()->admin()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.pengaturan.index'))
                    ->waitForText('Informasi Profil', 25)
                    ->clear('@input-nama')
                    ->type('@input-nama', 'Admin AgriSupport')
                    ->clear('@input-email')
                    ->type('@input-email', 'admin.baru@agrisupport.id')
                    ->click('@btn-simpan-profil')
                    ->waitForText('Profil tersimpan', 25)
                    ->assertSee('Profil tersimpan');
        });
    }

    // TC-PENGATURAN-003
    public function test_update_profil_gagal_nama_kosong(): void
    {
        $admin = User::factory()->admin()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.pengaturan.index'))
                    ->waitForText('Informasi Profil', 25)
                    ->clear('@input-nama')
                    ->click('@btn-simpan-profil')
                    ->pause(3000)
                    ->assertDontSee('Profil tersimpan')
                    ->assertPathIs('/admin/pengaturan');
        });
    }

    // TC-PENGATURAN-004
    public function test_update_profil_gagal_email_tidak_valid(): void
    {
        $admin = User::factory()->admin()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.pengaturan.index'))
                    ->waitForText('Informasi Profil', 25)
                    ->clear('@input-email')
                    ->type('@input-email', 'adminagrisupport')
                    ->click('@btn-simpan-profil')
                    ->pause(3000)
                    ->assertDontSee('Profil tersimpan')
                    ->assertPathIs('/admin/pengaturan');
        });
    }

    // TC-PENGATURAN-005
    public function test_ubah_password_berhasil(): void
    {
        $admin = User::factory()->admin()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.pengaturan.index'))
                    ->waitForText('Ubah Password', 25)
                    ->type('@input-password-lama', 'password')
                    ->type('@input-password-baru', 'PasswordBaru123')
                    ->type('@input-password-konfirmasi', 'PasswordBaru123')
                    ->click('@btn-simpan-password')
                    ->waitForText('Password tersimpan', 25)
                    ->assertSee('Password tersimpan');
        });
    }

    // TC-PENGATURAN-006
    public function test_ubah_password_gagal_password_lama_salah(): void
    {
        $admin = User::factory()->admin()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.pengaturan.index'))
                    ->waitForText('Ubah Password', 25)
                    ->type('@input-password-lama', 'salah123')
                    ->type('@input-password-baru', 'PasswordBaru123')
                    ->type('@input-password-konfirmasi', 'PasswordBaru123')
                    ->click('@btn-simpan-password')
                    ->pause(3000)
                    ->assertDontSee('Password tersimpan')
                    ->assertPathIs('/admin/pengaturan');
        });
    }

    // TC-PENGATURAN-007
    public function test_ubah_password_gagal_konfirmasi_tidak_cocok(): void
    {
        $admin = User::factory()->admin()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.pengaturan.index'))
                    ->waitForText('Ubah Password', 25)
                    ->type('@input-password-lama', 'password')
                    ->type('@input-password-baru', 'PasswordBaru123')
                    ->type('@input-password-konfirmasi', 'PasswordSalah999')
                    ->click('@btn-simpan-password')
                    ->pause(3000)
                    ->assertDontSee('Password tersimpan')
                    ->assertPathIs('/admin/pengaturan');
        });
    }

    // TC-PENGATURAN-008
    public function test_ubah_password_gagal_password_lemah(): void
    {
        $admin = User::factory()->admin()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.pengaturan.index'))
                    ->waitForText('Ubah Password', 25)
                    ->type('@input-password-lama', 'password')
                    ->type('@input-password-baru', '123')
                    ->type('@input-password-konfirmasi', '123')
                    ->click('@btn-simpan-password')
                    ->pause(3000)
                    ->assertDontSee('Password tersimpan')
                    ->assertPathIs('/admin/pengaturan');
        });
    }

    // TC-PENGATURAN-009
    public function test_update_profil_gagal_email_kosong(): void
    {
        $admin = User::factory()->admin()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.pengaturan.index'))
                    ->waitForText('Informasi Profil', 25)
                    ->clear('@input-email')
                    ->click('@btn-simpan-profil')
                    ->pause(3000)
                    ->assertDontSee('Profil tersimpan')
                    ->assertPathIs('/admin/pengaturan');
        });
    }

    // TC-PENGATURAN-010
    public function test_update_profil_gagal_email_huruf_besar(): void
    {
        $admin = User::factory()->admin()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.pengaturan.index'))
                    ->waitForText('Informasi Profil', 25)
                    ->clear('@input-email')
                    ->type('@input-email', 'ADMIN@AGRISUPPORT.ID')
                    ->click('@btn-simpan-profil')
                    ->pause(3000)
                    ->assertDontSee('Profil tersimpan')
                    ->assertPathIs('/admin/pengaturan');
        });
    }

    // TC-PENGATURAN-011
    public function test_update_profil_gagal_email_sudah_dipakai(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create(['email' => 'petani.lain@agrisupport.id']);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.pengaturan.index'))
                    ->waitForText('Informasi Profil', 25)
                    ->clear('@input-email')
                    ->type('@input-email', 'petani.lain@agrisupport.id')
                    ->click('@btn-simpan-profil')
                    ->pause(3000)
                    ->assertDontSee('Profil tersimpan')
                    ->assertPathIs('/admin/pengaturan');
        });
    }

    // TC-PENGATURAN-012
    public function test_ubah_password_gagal_password_lama_kosong(): void
    {
        $admin = User::factory()->admin()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.pengaturan.index'))
                    ->waitForText('Ubah Password', 25)
                    ->type('@input-password-baru', 'PasswordBaru123')
                    ->type('@input-password-konfirmasi', 'PasswordBaru123')
                    ->click('@btn-simpan-password')
                    ->pause(3000)
                    ->assertDontSee('Password tersimpan')
                    ->assertPathIs('/admin/pengaturan');
        });
    }
}
