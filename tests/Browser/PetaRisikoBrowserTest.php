<?php

namespace Tests\Browser;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * Dusk Browser Test — Peta Risiko Lahan (AGS-82)
 * Assignee: Arjuna
 * Command : php artisan dusk --filter=PetaRisikoBrowserTest
 *
 * PRASYARAT:
 *   php artisan serve (di terminal terpisah)
 *   Database: northeast (testing) + PostGIS extension aktif
 *
 * Semua test menggunakan factory untuk setup data (full-automated, tanpa pause manual).
 * Pola BEFORE→AFTER diterapkan pada TC dinamis (TC-PR-003, TC-PR-008).
 */
class PetaRisikoBrowserTest extends DuskTestCase
{
    use DatabaseMigrations;

    // =========================================================================
    // TC-PR-001
    // Akses halaman Peta Risiko — petani memiliki lahan → peta Leaflet tampil
    // SEBELUM: di Dashboard  →  SESUDAH: di /peta-risiko, peta ter-render
    // =========================================================================
    public function test_halaman_peta_risiko_dapat_diakses_dengan_peta_leaflet(): void
    {
        $farmer = User::factory()->create(['name' => 'Ahmad Solihin', 'email' => 'ahmad@agrisupport.id']);
        AgriculturalArea::factory()->for($farmer)->create(['name' => 'Sawah Cidahu']);

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    // SEBELUM: di Dashboard
                    ->visit(route('dashboard'))
                    ->waitForText('Dashboard', 25)
                    // AKSI: navigasi ke Peta Risiko
                    ->visit(route('peta-risiko.index'))
                    // SESUDAH: halaman Peta Risiko tampil dengan peta Leaflet
                    ->waitFor('.leaflet-container', 30)
                    ->assertPathIs('/peta-risiko')
                    ->assertSee('Peta Risiko Lahan')
                    ->assertPresent('.leaflet-container');
        });
    }

    // =========================================================================
    // TC-PR-002
    // Empty state — petani belum punya lahan → tampil pesan & link tambah
    // SEBELUM: jumlah lahan = 0  →  SESUDAH: empty state tampil
    // =========================================================================
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

    // =========================================================================
    // TC-PR-003
    // Legenda dinamis — BEFORE: 1 lahan observasi tinggi + 1 belum observasi
    //                   AFTER : tambah observasi rendah → legenda berubah
    // =========================================================================
    public function test_legenda_dinamis_setelah_observasi_baru(): void
    {
        $farmer = User::factory()->create(['name' => 'Ahmad Solihin', 'email' => 'ahmad2@agrisupport.id']);

        // Lahan 1: observasi risiko Tinggi (Kering + Banyak + Berat → skor > 70)
        $areaHigh = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Sawah Cidahu']);
        FieldObservation::factory()->forArea($areaHigh)->create([
            'observation_date'      => now()->toDateString(),
            'soil_moisture'         => 'Kering',
            'water_puddle'          => 'Banyak',
            'disease_indication'    => 'Berat',
            'weather_precip_mm'     => 20,
            'weather_soil_moisture' => 0.1,
        ]);

        // Lahan 2: belum ada observasi (Belum Ada Data)
        $areaEmpty = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Kebun Ciamis']);

        $this->browse(function (Browser $browser) use ($farmer, $areaEmpty) {
            // ── SEBELUM: legenda Tinggi=1, Belum=1 ──
            $browser->loginAs($farmer)
                    ->visit(route('peta-risiko.index'))
                    ->waitFor('[dusk="legenda-peta-risiko"]', 30)
                    ->assertSeeIn('[dusk="legenda-count-tinggi"]', '1')
                    ->assertSeeIn('[dusk="legenda-count-belum"]', '1')
                    ->assertSeeIn('[dusk="legenda-count-rendah"]', '0');

            // ── AKSI: tambah observasi rendah di Kebun Ciamis (via factory) ──
            FieldObservation::factory()->forArea($areaEmpty)->create([
                'observation_date'      => now()->toDateString(),
                'soil_moisture'         => 'Normal',
                'water_puddle'          => 'Tidak Ada',
                'disease_indication'    => 'Tidak Ada',
                'weather_precip_mm'     => 0,
                'weather_soil_moisture' => 0.35,
            ]);

            // ── SESUDAH: reload → legenda berubah: Tinggi=1, Rendah=1, Belum=0 ──
            $browser->visit(route('peta-risiko.index'))
                    ->waitFor('[dusk="legenda-peta-risiko"]', 30)
                    ->assertSeeIn('[dusk="legenda-count-tinggi"]', '1')
                    ->assertSeeIn('[dusk="legenda-count-rendah"]', '1')
                    ->assertSeeIn('[dusk="legenda-count-belum"]', '0');
        });
    }

    // =========================================================================
    // TC-PR-004
    // Dropdown filter area — pilih lahan → popup terbuka
    // SEBELUM: dropdown = "Semua Lahan"  →  SESUDAH: dropdown = lahan terpilih
    // =========================================================================
    public function test_dropdown_filter_area_zoom_ke_lahan(): void
    {
        $farmer = User::factory()->create(['name' => 'Ahmad Solihin', 'email' => 'ahmad3@agrisupport.id']);
        $area1  = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Sawah Cidahu']);
        $area2  = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Kebun Ciamis']);

        // Beri observasi agar polygon ter-render penuh
        FieldObservation::factory()->forArea($area1)->create([
            'observation_date' => now()->toDateString(),
            'soil_moisture'    => 'Normal',
            'water_puddle'     => 'Tidak Ada',
            'disease_indication' => 'Tidak Ada',
        ]);

        $this->browse(function (Browser $browser) use ($farmer, $area1) {
            $browser->loginAs($farmer)
                    ->visit(route('peta-risiko.index'))
                    ->waitFor('.leaflet-container', 30)
                    // SEBELUM: dropdown menunjukkan "Semua Lahan"
                    ->waitFor('[dusk="filter-area"]', 15)
                    // AKSI: pilih "Sawah Cidahu"
                    ->select('[dusk="filter-area"]', (string) $area1->id)
                    ->pause(2000) // tunggu flyToBounds + openPopup selesai
                    // SESUDAH: popup terbuka menampilkan nama lahan
                    ->waitFor('.leaflet-popup-content', 15)
                    ->assertSeeIn('.leaflet-popup-content', 'Sawah Cidahu');
        });
    }

    // =========================================================================
    // TC-PR-005
    // Popup detail risiko 3 dimensi — lahan dengan observasi risiko tinggi
    // SEBELUM: popup belum terbuka  →  SESUDAH: popup tampil dengan detail
    // =========================================================================
    public function test_popup_detail_risiko_tiga_dimensi(): void
    {
        $farmer = User::factory()->create(['name' => 'Ahmad Solihin', 'email' => 'ahmad4@agrisupport.id']);
        $area   = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Sawah Cidahu']);
        $obs    = FieldObservation::factory()->forArea($area)->create([
            'observation_date'      => now()->toDateString(),
            'soil_moisture'         => 'Kering',
            'water_puddle'          => 'Banyak',
            'disease_indication'    => 'Berat',
            'weather_precip_mm'     => 20,
            'weather_soil_moisture' => 0.1,
        ]);

        $this->browse(function (Browser $browser) use ($farmer, $area) {
            $browser->loginAs($farmer)
                    ->visit(route('peta-risiko.index'))
                    ->waitFor('.leaflet-container', 30)
                    // SEBELUM: popup belum terbuka
                    ->assertMissing('.leaflet-popup-content')
                    // AKSI: pilih lahan via dropdown → popup terbuka
                    ->waitFor('[dusk="filter-area"]', 15)
                    ->select('[dusk="filter-area"]', (string) $area->id)
                    ->pause(2000)
                    // SESUDAH: popup tampil dengan detail risiko
                    ->waitFor('.leaflet-popup-content', 15)
                    ->assertSeeIn('.leaflet-popup-content', 'Sawah Cidahu')
                    ->assertSeeIn('.leaflet-popup-content', 'Tinggi')
                    ->assertSeeIn('.leaflet-popup-content', 'Kekeringan')
                    ->assertSeeIn('.leaflet-popup-content', 'Genangan')
                    ->assertSeeIn('.leaflet-popup-content', 'Penyakit')
                    // Link Analisis dan Rekomendasi ada
                    ->assertPresent('.leaflet-popup-content a[href*="analisis-risiko"]')
                    ->assertPresent('.leaflet-popup-content a[href*="rekomendasi-tindakan"]');
        });
    }

    // =========================================================================
    // TC-PR-006
    // Popup lahan tanpa observasi — ajakan input kondisi
    // SEBELUM: popup belum terbuka  →  SESUDAH: popup "Belum Ada Data" + link
    // =========================================================================
    public function test_popup_lahan_tanpa_observasi_ajakan_input(): void
    {
        $farmer = User::factory()->create(['name' => 'Ahmad Solihin', 'email' => 'ahmad5@agrisupport.id']);
        $area   = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Kebun Ciamis']);
        // Tidak membuat observasi → risk_level = null, label "Belum Ada Data"

        $this->browse(function (Browser $browser) use ($farmer, $area) {
            $browser->loginAs($farmer)
                    ->visit(route('peta-risiko.index'))
                    ->waitFor('.leaflet-container', 30)
                    // SEBELUM: popup belum terbuka
                    ->assertMissing('.leaflet-popup-content')
                    // AKSI: pilih lahan via dropdown
                    ->waitFor('[dusk="filter-area"]', 15)
                    ->select('[dusk="filter-area"]', (string) $area->id)
                    ->pause(2000)
                    // SESUDAH: popup tampil dengan "Belum Ada Data" + link input kondisi
                    ->waitFor('.leaflet-popup-content', 15)
                    ->assertSeeIn('.leaflet-popup-content', 'Kebun Ciamis')
                    ->assertSeeIn('.leaflet-popup-content', 'Belum Ada Data')
                    ->assertPresent('.leaflet-popup-content a[href*="input-kondisi"]');
        });
    }

    // =========================================================================
    // TC-PR-007
    // Isolasi data — petani A tidak melihat lahan petani B
    // SEBELUM: DB punya 2 lahan (2 petani berbeda)
    // SESUDAH: petani A hanya lihat lahannya sendiri
    // =========================================================================
    public function test_isolasi_data_petani_tidak_lihat_lahan_petani_lain(): void
    {
        $farmerA = User::factory()->create(['name' => 'Ahmad Solihin', 'email' => 'ahmad_a@agrisupport.id']);
        $farmerB = User::factory()->create(['name' => 'Dewi Lestari',  'email' => 'dewi_b@agrisupport.id']);

        AgriculturalArea::factory()->for($farmerA)->create(['name' => 'Sawah Cidahu']);
        AgriculturalArea::factory()->for($farmerB)->create(['name' => 'Ladang Bogor']);

        $this->browse(function (Browser $browser) use ($farmerA) {
            $browser->loginAs($farmerA)
                    ->visit(route('peta-risiko.index'))
                    ->waitFor('.leaflet-container', 30)
                    // SESUDAH: hanya lahan milik Ahmad yang tampil
                    ->assertSee('Sawah Cidahu')
                    ->assertDontSee('Ladang Bogor');
        });
    }

    // =========================================================================
    // TC-PR-008
    // Dinamis BEFORE→AFTER: tambah lahan baru → dropdown bertambah
    // SEBELUM: 1 lahan di dropdown  →  SESUDAH: 2 lahan di dropdown
    // =========================================================================
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

    // =========================================================================
    // TC-PR-009
    // Dropdown kembali ke "Semua Lahan" — peta kembali ke overview
    // SEBELUM: filter = lahan tertentu  →  SESUDAH: filter = "Semua Lahan"
    // =========================================================================
    public function test_dropdown_kembali_semua_lahan(): void
    {
        $farmer = User::factory()->create(['name' => 'Ahmad Solihin', 'email' => 'ahmad7@agrisupport.id']);
        $area1  = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Sawah Cidahu']);
        $area2  = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Kebun Ciamis']);

        $this->browse(function (Browser $browser) use ($farmer, $area1) {
            $browser->loginAs($farmer)
                    ->visit(route('peta-risiko.index'))
                    ->waitFor('.leaflet-container', 30)
                    ->waitFor('[dusk="filter-area"]', 15)
                    // SEBELUM: pilih satu lahan
                    ->select('[dusk="filter-area"]', (string) $area1->id)
                    ->pause(2000)
                    ->waitFor('.leaflet-popup-content', 15)
                    ->assertSeeIn('.leaflet-popup-content', 'Sawah Cidahu')
                    // AKSI: pilih kembali "Semua Lahan"
                    ->select('[dusk="filter-area"]', '')
                    ->pause(2000)
                    // SESUDAH: popup tidak lagi menampilkan satu lahan tertentu
                    // dan dropdown kembali ke "Semua Lahan"
                    ->assertSelected('[dusk="filter-area"]', '');
        });
    }
}