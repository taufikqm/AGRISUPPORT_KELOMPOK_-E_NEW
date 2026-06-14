<?php

namespace Tests\Browser\Admin;

use App\Models\User;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;
use Illuminate\Foundation\Testing\DatabaseMigrations;

class AdminUserManagementTest extends DuskTestCase
{
    use DatabaseMigrations;

    /**
     * DEMO GUI DUSK
     * Menampilkan:
     * - Login Admin
     * - Buka Manajemen Pengguna
     * - Cari pengguna
     * - Lihat detail
     * - Edit pengguna
     * - Reset password
     * - Nonaktifkan akun
     * - Hapus akun
     */
    public function test_demo_manajemen_pengguna(): void
    {
        $admin = User::factory()->admin()->create([
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
        ]);

        $petani = User::factory()->create([
            'role' => 'petani',
            'name' => 'Budi Santoso',
            'email' => 'budi@test.com',
            'phone_number' => '081234567890',
            'is_active' => true,
        ]);

        $this->browse(function (Browser $browser) use ($admin, $petani) {

            $browser->loginAs($admin)

                // ==========================
                // TC-01 Buka halaman pengguna
                // ==========================
                ->visit('/admin/pengguna')
                ->waitFor('@pengguna-table')
                ->pause(3000)

                // ==========================
                // TC-02 Search pengguna
                // ==========================
                ->type('@input-search-pengguna', 'Budi')
                ->pause(3000)

                ->assertSee('Budi Santoso')
                ->screenshot('TC02-search')

                // ==========================
                // TC-03 Filter status
                // ==========================
                ->select('@filter-status-pengguna', 'aktif')
                ->pause(3000)

                ->screenshot('TC03-filter')

                // reset filter
                ->visit('/admin/pengguna')
                ->waitFor('@pengguna-table')
                ->pause(2000)

                // ==========================
                // TC-04 Detail pengguna
                // ==========================
                ->click("@btn-detail-pengguna-{$petani->id}")
                ->pause(5000)

                ->assertPresent('@modal-detail-pengguna')
                ->screenshot('TC04-detail')

                // tutup modal
                ->visit('/admin/pengguna')
                ->waitFor('@pengguna-table')
                ->pause(2000)

                // ==========================
                // TC-05 Edit pengguna
                // ==========================
                ->click("@btn-edit-pengguna-{$petani->id}")
                ->pause(3000)

                ->assertPresent('@modal-edit-pengguna')

                ->clear('@input-edit-nama')
                ->type('@input-edit-nama', 'Budi Update')

                ->clear('@input-edit-email')
                ->type('@input-edit-email', 'budiupdate@test.com')

                ->clear('@input-edit-telp')
                ->type('@input-edit-telp', '081111111111')

                ->pause(2000)

                ->click('@btn-simpan-edit-pengguna')
                ->pause(5000)

                ->screenshot('TC05-edit')

                // ==========================
                // TC-06 Reset password
                // ==========================

                ->scrollIntoView("@btn-reset-pengguna-{$petani->id}")
                ->pause(1000)

                ->tap(function (Browser $browser) use ($petani) {
                    $browser->script("
                        document.querySelector('[dusk=\"btn-reset-pengguna-{$petani->id}\"]').click();
                    ");
                })

                ->pause(3000)

                ->assertPresent('@modal-konfirmasi-aksi')

                ->click('@btn-konfirmasi-aksi')
                ->pause(5000)

                ->screenshot('TC06-reset-password')

                // ==========================
                // TC-07 Nonaktifkan akun
                // ==========================
                                ->scrollIntoView("@btn-toggle-status-{$petani->id}")
                ->pause(1000)

                ->tap(function (Browser $browser) use ($petani) {
                    $browser->script("
                        document.querySelector('[dusk=\"btn-toggle-status-{$petani->id}\"]').click();
                    ");
                })

                ->pause(3000)

                ->assertPresent('@modal-konfirmasi-aksi')

                ->click('@btn-konfirmasi-aksi')
                ->pause(5000)

                ->screenshot('TC07-nonaktifkan')

                // ==========================
                // TC-08 Hapus akun
                // ==========================
                ->scrollIntoView("@btn-hapus-pengguna-{$petani->id}")
                ->pause(1000)

                ->tap(function (Browser $browser) use ($petani) {
                    $browser->script("
                        document.querySelector('[dusk=\"btn-hapus-pengguna-{$petani->id}\"]').click();
                    ");
                })

                ->pause(3000)

                ->assertPresent('@modal-konfirmasi-hapus')

                ->click('@btn-konfirmasi-hapus')
                ->pause(5000)

                ->screenshot('TC08-hapus');
        });
    }
}