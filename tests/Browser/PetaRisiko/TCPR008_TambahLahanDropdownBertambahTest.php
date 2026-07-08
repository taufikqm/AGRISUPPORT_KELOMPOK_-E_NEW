<?php

namespace Tests\Browser\PetaRisiko;

use App\Models\AgriculturalArea;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * TC-PR-008 — Dinamis BEFORE→AFTER: tambah lahan baru → dropdown bertambah
 *
 * SEBELUM: 1 lahan di dropdown
 * SESUDAH: 2 lahan di dropdown
 *
 * Assignee : Arjuna
 * Feature  : Peta Risiko Lahan (AGS-82)
 * Command  : php artisan dusk --filter=TCPR008_TambahLahanDropdownBertambahTest
 */
class TCPR008_TambahLahanDropdownBertambahTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_tambah_lahan_baru_dropdown_bertambah(): void
    {
        $farmer = User::factory()->create(['name' => 'Ahmad Solihin', 'email' => 'ahmad6@agrisupport.id']);
        AgriculturalArea::factory()->for($farmer)->create(['name' => 'Sawah Cidahu']);

        $this->browse(function (Browser $browser) use ($farmer) {
            // ── SEBELUM: dropdown punya 1 lahan ──
            $browser->loginAs($farmer)
                    ->visit(route('peta-risiko.index'))
                    ->waitFor('.leaflet-container', 30)
                    ->waitFor('[dusk="filter-area"]', 15)
                    ->assertSee('Sawah Cidahu');

            // Verifikasi hanya 1 option lahan (+ "Semua Lahan")
            $optionsBefore = $browser->script(
                "return document.querySelector('[dusk=\"filter-area\"]').options.length"
            );
            $this->assertEquals(2, $optionsBefore[0], 'SEBELUM: dropdown harus punya 2 opsi (Semua + 1 lahan)');

            // ── AKSI: tambah lahan baru via factory ──
            AgriculturalArea::factory()->for($farmer)->create(['name' => 'Tegalan Sumedang']);

            // ── SESUDAH: reload → dropdown punya 2 lahan ──
            $browser->visit(route('peta-risiko.index'))
                    ->waitFor('.leaflet-container', 30)
                    ->waitFor('[dusk="filter-area"]', 15)
                    ->assertSee('Tegalan Sumedang');

            $optionsAfter = $browser->script(
                "return document.querySelector('[dusk=\"filter-area\"]').options.length"
            );
            $this->assertEquals(3, $optionsAfter[0], 'SESUDAH: dropdown harus punya 3 opsi (Semua + 2 lahan)');
        });
    }
}
