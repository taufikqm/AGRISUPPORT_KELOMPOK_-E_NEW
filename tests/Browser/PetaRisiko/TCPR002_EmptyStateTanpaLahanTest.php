<?php

namespace Tests\Browser\PetaRisiko;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * TC-PR-002 — Empty state
 * Petani belum punya lahan → tampil pesan & link tambah
 *
 * SEBELUM: jumlah lahan = 0
 * SESUDAH: empty state tampil
 *
 * Assignee : Arjuna
 * Feature  : Peta Risiko Lahan (AGS-82)
 * Command  : php artisan dusk --filter=TCPR002_EmptyStateTanpaLahanTest
 */
class TCPR002_EmptyStateTanpaLahanTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_empty_state_tampil_jika_petani_belum_punya_lahan(): void
    {
        $farmer = User::factory()->create(['name' => 'Budi Santoso', 'email' => 'budi@agrisupport.id']);
        // Tidak membuat lahan → lahan = 0

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('peta-risiko.index'))
                    // SESUDAH: empty state tampil
                    ->waitFor('[dusk="empty-state"]', 25)
                    ->assertPresent('[dusk="empty-state"]')
                    ->assertSee('Belum ada lahan')
                    ->assertSee('Tambah Wilayah Lahan')
                    // Peta Leaflet TIDAK tampil (karena tidak ada lahan)
                    ->assertMissing('.leaflet-container');
        });
    }
}
