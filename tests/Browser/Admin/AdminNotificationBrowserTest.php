<?php

namespace Tests\Browser\Admin;

use App\Models\User;
use App\Notifications\FarmerNotification;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * Dusk Browser Test — Sistem Notifikasi Admin (AGS-95)
 * Assignee: Taufik
 * Command : php artisan dusk --filter=AdminNotificationBrowserTest
 *
 * PRASYARAT:
 *   php artisan serve (di terminal terpisah)
 *   Database: northeast (testing) — bukan production
 */
class AdminNotificationBrowserTest extends DuskTestCase
{
    use DatabaseMigrations;

    // TC-NOTIFADMIN-001
    public function test_halaman_notifikasi_menampilkan_tiga_tab(): void
    {
        $admin = User::factory()->admin()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.notifikasi.index'))
                    ->waitForText('Sistem Notifikasi', 25)
                    ->assertSee('Kirim Notifikasi')
                    ->assertSee('Kotak Masuk')
                    ->assertSee('Riwayat Terkirim')
                    ->assertPresent('@input-judul-notif')
                    ->assertPresent('@input-pesan-notif');
        });
    }

    // TC-NOTIFADMIN-002
    public function test_kirim_broadcast_ke_semua_petani_berhasil(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.notifikasi.index'))
                    ->waitForText('Kirim Notifikasi', 25)
                    ->type('@input-judul-notif', 'Peringatan Cuaca Ekstrem')
                    ->type('@input-pesan-notif', 'Harap waspada hujan deras 3 hari ke depan')
                    ->select('@select-target-notif', 'all')
                    ->click('@btn-kirim-notifikasi')
                    ->waitForText('Notifikasi berhasil dikirim', 25)
                    ->assertSee('Notifikasi berhasil dikirim');
        });
    }

    // TC-NOTIFADMIN-003
    public function test_kirim_gagal_judul_kosong(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.notifikasi.index'))
                    ->waitForText('Kirim Notifikasi', 25)
                    ->type('@input-pesan-notif', 'Isi pengumuman')
                    ->click('@btn-kirim-notifikasi')
                    ->pause(3000)
                    ->assertDontSee('Notifikasi berhasil dikirim');
        });
    }

    // TC-NOTIFADMIN-004
    public function test_kirim_gagal_pesan_kosong(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.notifikasi.index'))
                    ->waitForText('Kirim Notifikasi', 25)
                    ->type('@input-judul-notif', 'Pengumuman')
                    ->click('@btn-kirim-notifikasi')
                    ->pause(3000)
                    ->assertDontSee('Notifikasi berhasil dikirim');
        });
    }

    // TC-NOTIFADMIN-005
    public function test_kirim_ke_petani_tertentu_berhasil(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create(['name' => 'Petani Satu']);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.notifikasi.index'))
                    ->waitForText('Kirim Notifikasi', 25)
                    ->type('@input-judul-notif', 'Info Lahan')
                    ->type('@input-pesan-notif', 'Mohon cek kondisi lahan Anda')
                    ->select('@select-target-notif', 'specific')
                    ->waitFor('input[type="checkbox"]', 10)
                    ->click('input[type="checkbox"]')
                    ->click('@btn-kirim-notifikasi')
                    ->waitForText('Notifikasi berhasil dikirim', 25)
                    ->assertSee('Notifikasi berhasil dikirim');
        });
    }

    // TC-NOTIFADMIN-006
    public function test_kirim_gagal_target_tertentu_tanpa_pilih_petani(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.notifikasi.index'))
                    ->waitForText('Kirim Notifikasi', 25)
                    ->type('@input-judul-notif', 'Info')
                    ->type('@input-pesan-notif', 'Isi pesan')
                    ->select('@select-target-notif', 'specific')
                    ->click('@btn-kirim-notifikasi')
                    ->pause(3000)
                    ->assertDontSee('Notifikasi berhasil dikirim');
        });
    }

    // TC-NOTIFADMIN-007
    public function test_kotak_masuk_menampilkan_notifikasi_admin(): void
    {
        $admin = User::factory()->admin()->create();
        $admin->notify(new FarmerNotification('petani_baru', 'Petani baru terdaftar', 'Budi baru saja mendaftar sebagai petani.', null));

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.notifikasi.index'))
                    ->waitForText('Sistem Notifikasi', 25)
                    ->click('@tab-kotak-masuk')
                    ->waitForText('Petani baru terdaftar', 15)
                    ->assertSee('Petani baru terdaftar');
        });
    }

    // TC-NOTIFADMIN-008
    public function test_tandai_satu_notifikasi_dibaca(): void
    {
        $admin = User::factory()->admin()->create();
        $admin->notify(new FarmerNotification('petani_baru', 'Petani baru terdaftar', 'Budi baru saja mendaftar.', null));

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.notifikasi.index'))
                    ->waitForText('Sistem Notifikasi', 25)
                    ->click('@tab-kotak-masuk')
                    ->waitForText('Tandai Dibaca', 15)
                    ->press('Tandai Dibaca')
                    ->waitUntilMissingText('Tandai Dibaca', 20)
                    ->assertDontSee('Tandai Dibaca');
        });
    }

    // TC-NOTIFADMIN-009
    public function test_tandai_semua_notifikasi_dibaca(): void
    {
        $admin = User::factory()->admin()->create();
        $admin->notify(new FarmerNotification('petani_baru', 'Petani baru terdaftar', 'A mendaftar.', null));
        $admin->notify(new FarmerNotification('observasi_masuk', 'Observasi baru masuk', 'B mencatat observasi.', null));

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.notifikasi.index'))
                    ->waitForText('Sistem Notifikasi', 25)
                    ->click('@tab-kotak-masuk')
                    ->waitFor('@btn-baca-semua-admin', 15)
                    ->click('@btn-baca-semua-admin')
                    ->waitUntilMissingText('Tandai Dibaca', 20)
                    ->assertDontSee('Tandai Dibaca');
        });
    }

    // TC-NOTIFADMIN-010
    public function test_kotak_masuk_kosong_empty_state(): void
    {
        $admin = User::factory()->admin()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.notifikasi.index'))
                    ->waitForText('Sistem Notifikasi', 25)
                    ->click('@tab-kotak-masuk')
                    ->waitForText('Belum ada notifikasi masuk', 15)
                    ->assertSee('Belum ada notifikasi masuk');
        });
    }

    // TC-NOTIFADMIN-011
    public function test_riwayat_menampilkan_broadcast_terkirim(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create();
        $petani->notify(new FarmerNotification('pesan_admin', 'Pengumuman Penting', 'Isi pengumuman broadcast.', null));

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.notifikasi.index'))
                    ->waitForText('Sistem Notifikasi', 25)
                    ->click('@tab-riwayat-notif')
                    ->waitForText('Pengumuman Penting', 15)
                    ->assertSee('Pengumuman Penting');
        });
    }

    // TC-NOTIFADMIN-012
    public function test_riwayat_kosong_empty_state(): void
    {
        $admin = User::factory()->admin()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.notifikasi.index'))
                    ->waitForText('Sistem Notifikasi', 25)
                    ->click('@tab-riwayat-notif')
                    ->waitForText('Belum ada notifikasi terkirim', 15)
                    ->assertSee('Belum ada notifikasi terkirim');
        });
    }
}
