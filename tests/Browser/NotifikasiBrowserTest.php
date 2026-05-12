<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * Dusk Browser Test — Sistem Notifikasi Petani (AGS-87)
 * Assignee: ketrin
 * Command : php artisan dusk --filter=NotifikasiBrowserTest
 *
 * PRASYARAT:
 *   php artisan serve (di terminal terpisah)
 *   Database: agrisupport_dusk + PostGIS extension aktif
 */
class NotifikasiBrowserTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_badge_notifikasi_tampil_di_header(): void
    {
        $farmer = User::factory()->create();
        // TODO: buat notifikasi unread untuk farmer

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('dashboard'))
                    ->waitForText('Dashboard');
                    // TODO: assert badge jumlah unread tampil di header
                    // ->assertPresent('[dusk="notif-badge"]')
                    // ->assertSeeIn('[dusk="notif-badge"]', '1');
        });
    }

    public function test_halaman_notifikasi_tampil_dengan_daftar(): void
    {
        $farmer = User::factory()->create();
        // TODO: buat beberapa notifikasi untuk farmer

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('notifikasi.index'))
                    ->waitForText('Notifikasi');
                    // TODO: assert daftar notifikasi tampil
        });
    }

    public function test_klik_tandai_dibaca_mengubah_status(): void
    {
        $farmer = User::factory()->create();
        // TODO: buat notifikasi unread

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('notifikasi.index'))
                    ->waitForText('Notifikasi');
                    // TODO: ->click('@btn-baca-{id}')
                    // ->waitForText('Berhasil')
                    // ->assertSee status berubah jadi dibaca
        });
    }

    public function test_klik_tandai_semua_dibaca(): void
    {
        $farmer = User::factory()->create();

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('notifikasi.index'))
                    ->waitForText('Notifikasi');
                    // TODO: ->click('@btn-baca-semua')
                    // ->waitForReload()
                    // ->assertSee('Semua notifikasi dibaca')
        });
    }
}
