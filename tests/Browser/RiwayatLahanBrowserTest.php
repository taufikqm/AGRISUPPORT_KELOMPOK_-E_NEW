<?php

namespace Tests\Browser;

use App\Models\ActionLog;
use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\Recommendation;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * Dusk Browser Test — Riwayat Kondisi Lahan (AGS-71)
 * Assignee: Bian
 * Command : php artisan dusk --filter=RiwayatLahanBrowserTest
 *
 * PRASYARAT:
 *   php artisan serve (di terminal terpisah)
 *   npm run build  ATAU  npm run dev (di terminal terpisah)
 *   Database: agrisupport_dusk + PostGIS extension aktif
 *
 * Cakupan:
 *   AGS-74 — Komponen UI (tab, tabel, badge, empty state)
 *   AGS-75 — Filter lahan, pencarian debounce, tombol bersihkan
 */
class RiwayatLahanBrowserTest extends DuskTestCase
{
    use DatabaseMigrations;

    // =========================================================
    // AGS-74: Komponen UI — Tab, Tabel, Badge, Empty State
    // =========================================================

    /** TC-01: Halaman render dengan header dan 4 tab navigasi */
    public function test_halaman_riwayat_lahan_ter_render(): void
    {
        $farmer = User::factory()->create();

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('riwayat-lahan.index'))
                    ->waitFor('@tab-observasi', 15)
                    ->assertSee('Histori Aktivitas')
                    ->assertPresent('@tab-observasi')
                    ->assertPresent('@tab-validasi')
                    ->assertPresent('@tab-risiko')
                    ->assertPresent('@tab-rekomendasi')
                    ->assertSee('Observasi')
                    ->assertSee('Validasi')
                    ->assertSee('Risiko')
                    ->assertSee('Rekomendasi');
        });
    }

    /** TC-02: Tab Observasi aktif secara default saat halaman dibuka */
    public function test_tab_observasi_aktif_secara_default(): void
    {
        $farmer = User::factory()->create();

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('riwayat-lahan.index'))
                    ->waitFor('@tab-observasi', 15)
                    ->assertAttributeContains('@tab-observasi', 'class', 'text-green-700');
        });
    }

    /** TC-03: Tabel tampil dengan baris data jika ada observasi */
    public function test_tabel_tampil_dengan_data_observasi(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Sawah Utama']);
        FieldObservation::factory()->forArea($area)->count(3)
            ->create(['recommendations_viewed_at' => now()]);

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('riwayat-lahan.index'))
                    ->waitFor('@history-table', 15)
                    ->assertPresent('@history-table')
                    ->assertPresent('@history-row')
                    ->assertSee('Observasi');
        });
    }

    /** TC-04: Badge status tampil pada setiap baris tabel */
    public function test_badge_status_tampil_pada_baris_tabel(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();
        FieldObservation::factory()->forArea($area)->count(2)
            ->create(['recommendations_viewed_at' => now()]);

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('riwayat-lahan.index'))
                    ->waitFor('@status-badge', 15)
                    ->assertPresent('@status-badge');
        });
    }

    /** TC-05: Empty state tampil dengan pesan dan link jika tidak ada data */
    public function test_empty_state_tampil_saat_tidak_ada_data(): void
    {
        $farmer = User::factory()->create();

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('riwayat-lahan.index'))
                    ->waitFor('@empty-state', 15)
                    ->assertPresent('@empty-state')
                    ->assertSee('Belum ada data riwayat.')
                    ->assertSee('Mulai catat kondisi lapangan');
        });
    }

    // =========================================================
    // AGS-75: Filter, Pencarian, Debounce, Tab Switching
    // =========================================================

    /** TC-06: Klik tab Validasi mengubah tab yang aktif */
    public function test_klik_tab_validasi_mengganti_tab_aktif(): void
    {
        $farmer = User::factory()->create();

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('riwayat-lahan.index'))
                    ->waitFor('@tab-validasi', 15)
                    ->click('@tab-validasi')
                    ->waitUntil("document.querySelector('[dusk=\"tab-validasi\"]').classList.contains('text-green-700')", 10)
                    ->assertAttributeContains('@tab-validasi', 'class', 'text-green-700')
                    ->assertAttributeContains('@tab-observasi', 'class', 'text-gray-500');
        });
    }

    /** TC-07: Klik tab Risiko menampilkan kolom skor risiko */
    public function test_klik_tab_risiko_mengganti_tab_aktif(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();
        FieldObservation::factory()->forArea($area)->count(2)->create();

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('riwayat-lahan.index'))
                    ->waitFor('@tab-risiko', 15)
                    ->click('@tab-risiko')
                    ->waitUntil("document.querySelector('[dusk=\"tab-risiko\"]').classList.contains('text-green-700')", 10)
                    ->assertAttributeContains('@tab-risiko', 'class', 'text-green-700')
                    ->assertSee('Risiko');
        });
    }

    /** TC-08: Tab Rekomendasi menampilkan data action log */
    public function test_klik_tab_rekomendasi_menampilkan_data(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();
        $obs    = FieldObservation::factory()->forArea($area)->create();

        $rec = Recommendation::create([
            'category'    => 'Irigasi',
            'title'       => 'Perbaikan Saluran Air',
            'description' => 'Perbaiki saluran irigasi yang tersumbat',
            'urgency'     => 'Tinggi',
            'color'       => '#EF4444',
        ]);

        ActionLog::create([
            'user_id'           => $farmer->id,
            'observation_id'    => $obs->id,
            'recommendation_id' => $rec->id,
            'performed_at'      => now(),
        ]);

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('riwayat-lahan.index'))
                    ->waitFor('@tab-rekomendasi', 15)
                    ->click('@tab-rekomendasi')
                    ->waitFor('@history-table', 15)
                    ->assertSee('Rekomendasi')
                    ->assertSee('Perbaikan Saluran Air');
        });
    }

    /** TC-09: Search input memfilter baris tabel sesuai kata kunci */
    public function test_search_input_memfilter_data(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Sawah Selatan']);
        FieldObservation::factory()->forArea($area)->create([
            'crop_condition'          => 'Baik',
            'notes'                   => 'kondisi padi sangat subur',
            'recommendations_viewed_at' => now(),
        ]);
        FieldObservation::factory()->forArea($area)->create([
            'crop_condition'          => 'Kritis',
            'notes'                   => 'tanaman layu parah',
            'recommendations_viewed_at' => now(),
        ]);

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('riwayat-lahan.index'))
                    ->waitFor('@history-table', 15)
                    ->type('@search-input', 'Sawah Selatan')
                    ->pause(600)
                    ->waitFor('@history-row', 15)
                    ->assertSee('Sawah Selatan');
        });
    }

    /** TC-10: Tekan Escape pada search input membersihkan kata kunci */
    public function test_escape_membersihkan_search(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();
        FieldObservation::factory()->forArea($area)->count(2)->create();

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('riwayat-lahan.index'))
                    ->waitFor('@search-input', 15)
                    ->type('@search-input', 'test pencarian')
                    ->pause(100)
                    ->keys('@search-input', '{escape}')
                    ->pause(200)
                    ->assertInputValue('@search-input', '');
        });
    }

    /** TC-11: Dropdown filter area menyaring data berdasarkan lahan */
    public function test_dropdown_filter_area_berfungsi(): void
    {
        $farmer = User::factory()->create();
        $area1  = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Lahan A']);
        $area2  = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Lahan B']);
        FieldObservation::factory()->forArea($area1)->count(2)->create(['recommendations_viewed_at' => now()]);
        FieldObservation::factory()->forArea($area2)->count(3)->create(['recommendations_viewed_at' => now()]);

        $this->browse(function (Browser $browser) use ($farmer, $area1) {
            $browser->loginAs($farmer)
                    ->visit(route('riwayat-lahan.index'))
                    ->waitFor('@history-table', 15)
                    ->select('@area-filter', (string) $area1->id)
                    ->waitForText('Menampilkan 2 hasil', 20)
                    ->assertSee('Menampilkan 2 hasil');
        });
    }

    /** TC-12: Tombol "Bersihkan filter" mereset search dan dropdown ke kondisi awal */
    public function test_tombol_bersihkan_filter_mereset_semua(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Lahan Test']);
        FieldObservation::factory()->forArea($area)->count(3)->create();

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('riwayat-lahan.index'))
                    ->waitFor('@search-input', 15)
                    ->type('@search-input', 'kata kunci')
                    ->pause(200)
                    ->waitFor('@clear-filter-btn', 10)
                    ->click('@clear-filter-btn')
                    ->pause(200)
                    ->assertInputValue('@search-input', '')
                    ->assertNotPresent('@clear-filter-btn');
        });
    }
}
