<?php

namespace Tests\Browser\Admin\ManajemenObservasi;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * TC-MO-002 — Empty State Observasi
 * Tidak ada data observasi → tabel menampilkan pesan kosong
 *
 * SEBELUM: database kosong (0 observasi)
 * SESUDAH: empty state tampil
 *
 * Assignee : Arjuna
 * Feature  : Manajemen Observasi Admin (AGS-111)
 * Command  : php artisan dusk --filter=TCMO002_EmptyStateObservasiTest
 */
class TCMO002_EmptyStateObservasiTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_empty_state_tampil_jika_tidak_ada_observasi(): void
    {
        $admin = User::factory()->admin()->create();
        // Tidak membuat observasi → data = 0

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.observasi.index'))
                    ->waitForText('Manajemen Observasi', 30)
                    // SESUDAH: empty state tampil
                    ->assertPresent('[dusk="empty-state"]')
                    ->assertSee('Belum ada data observasi.');
        });
    }
}
