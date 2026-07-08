<?php

namespace Tests\Browser\Admin;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * Dusk Browser Test — Peta Risiko Global Admin (AGS-93)
 * Assignee: Arjuna
 * Command : php artisan dusk --filter=GlobalRiskMapBrowserTest
 *
 * PRASYARAT:
 *   php artisan serve (di terminal terpisah)
 *   Database: northeast (testing) — bukan production
 */
class GlobalRiskMapBrowserTest extends DuskTestCase
{
    use DatabaseMigrations;

    // ─── TC-PRG-001 ─────────────────────────────────────────────
    // Admin navigasi dari Dashboard ke Peta Risiko Global
    public function test_admin_navigasi_dari_dashboard_ke_peta_risiko_global(): void
    {
        $admin = User::factory()->admin()->create(['name' => 'Kemal Palevi']);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit('/admin/dashboard')
                    ->waitForText('Dashboard', 25)
                    // (SEBELUM) Admin berada di halaman Dashboard Admin
                    ->assertPathIs('/admin/dashboard')
                    // Klik menu "Peta Risiko" di sidebar
                    ->click('[dusk="nav-peta-risiko"]')
                    // (SESUDAH) Halaman berpindah ke /admin/peta-risiko
                    ->waitForLocation('/admin/peta-risiko', 30)
                    ->assertPathIs('/admin/peta-risiko')
                    ->assertSee('Peta Risiko Global');
        });
    }

    // ─── TC-PRG-002 ─────────────────────────────────────────────
    // Petani (non-admin) tidak bisa akses Peta Risiko Global
    public function test_petani_tidak_bisa_akses_peta_risiko_global(): void
    {
        $petani = User::factory()->create(['name' => 'Budi Santoso', 'role' => 'petani']);

        $this->browse(function (Browser $browser) use ($petani) {
            $browser->loginAs($petani)
                    ->visit('/dashboard')
                    ->waitForText('Dashboard', 25)
                    // (SEBELUM) Petani di halaman /dashboard
                    ->assertPathIs('/dashboard')
                    // Coba akses langsung /admin/peta-risiko
                    ->visit('/admin/peta-risiko')
                    // (SESUDAH) Di-redirect kembali ke /dashboard
                    ->waitForLocation('/dashboard', 30)
                    ->assertPathIs('/dashboard')
                    ->assertDontSee('Peta Risiko Global');
        });
    }

    // ─── TC-PRG-003 ─────────────────────────────────────────────
    // Kartu ringkasan berubah setelah lahan baru ditambahkan
    // BEFORE: Belum Observasi = 1 → AFTER: Belum Observasi = 2
    public function test_kartu_ringkasan_berubah_setelah_lahan_baru_ditambahkan(): void
    {
        $admin   = User::factory()->admin()->create();
        $petani1 = User::factory()->create(['name' => 'Budi Santoso', 'role' => 'petani']);
        $area1   = AgriculturalArea::factory()->for($petani1)->create(['name' => 'Sawah Budi']);
        FieldObservation::factory()->forArea($area1)->create([
            'soil_moisture'      => 'Kering',
            'water_puddle'       => 'Banyak',
            'disease_indication' => 'Berat',
            'observation_date'   => now()->toDateString(),
        ]);

        $petani2 = User::factory()->create(['name' => 'Siti Aminah', 'role' => 'petani']);
        AgriculturalArea::factory()->for($petani2)->create(['name' => 'Sawah Siti']);

        $this->browse(function (Browser $browser) use ($admin) {
            // (SEBELUM) Kartu Belum Observasi = 1
            $browser->loginAs($admin)
                    ->visit(route('admin.peta-risiko.index'))
                    ->waitForText('Peta Risiko Global', 25)
                    ->assertSeeIn('[dusk="kartu-risiko-belum"]', '1');

            // AKSI: Tambah 1 lahan baru milik petani baru (belum ada observasi)
            $petani3 = User::factory()->create(['name' => 'Rina Wati', 'role' => 'petani']);
            AgriculturalArea::factory()->for($petani3)->create(['name' => 'Kebun Rina']);

            // (SESUDAH) Reload → Kartu Belum Observasi = 2 (naik dari 1)
            $browser->visit(route('admin.peta-risiko.index'))
                    ->waitForText('Peta Risiko Global', 25)
                    ->assertSeeIn('[dusk="kartu-risiko-belum"]', '2');
        });
    }

    // ─── TC-PRG-004 ─────────────────────────────────────────────
    // Level risiko berubah setelah observasi baru ditambahkan
    // BEFORE: Belum Observasi = 1 → AFTER: Risiko Tinggi = 1
    public function test_level_risiko_berubah_setelah_observasi_baru(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['name' => 'Budi Santoso', 'role' => 'petani']);
        $area   = AgriculturalArea::factory()->for($petani)->create(['name' => 'Sawah Merpati']);

        $this->browse(function (Browser $browser) use ($admin, $area) {
            // (SEBELUM) Belum ada observasi
            $browser->loginAs($admin)
                    ->visit(route('admin.peta-risiko.index'))
                    ->waitForText('Peta Risiko Global', 25)
                    ->assertSeeIn('[dusk="kartu-risiko-belum"]', '1')
                    ->assertSeeIn('[dusk="kartu-risiko-tinggi"]', '0');

            // AKSI: Tambah observasi risiko tinggi
            FieldObservation::factory()->forArea($area)->create([
                'soil_moisture'      => 'Kering',
                'water_puddle'       => 'Banyak',
                'disease_indication' => 'Berat',
                'observation_date'   => now()->toDateString(),
            ]);

            // (SESUDAH) Reload → Belum = 0, Tinggi = 1
            $browser->visit(route('admin.peta-risiko.index'))
                    ->waitForText('Peta Risiko Global', 25)
                    ->assertSeeIn('[dusk="kartu-risiko-belum"]', '0')
                    ->assertSeeIn('[dusk="kartu-risiko-tinggi"]', '1');
        });
    }

    // ─── TC-PRG-005 ─────────────────────────────────────────────
    // Filter dropdown per petani memfilter lahan yang tampil
    // BEFORE: 3 lahan (semua petani) → AFTER: 2 lahan (Budi saja)
    public function test_filter_dropdown_per_petani(): void
    {
        $admin   = User::factory()->admin()->create();
        $petani1 = User::factory()->create(['name' => 'Budi Santoso', 'role' => 'petani']);
        $petani2 = User::factory()->create(['name' => 'Siti Aminah', 'role' => 'petani']);
        AgriculturalArea::factory()->for($petani1)->create(['name' => 'Sawah Budi']);
        AgriculturalArea::factory()->for($petani1)->create(['name' => 'Kebun Budi']);
        AgriculturalArea::factory()->for($petani2)->create(['name' => 'Ladang Siti']);

        $this->browse(function (Browser $browser) use ($admin, $petani1) {
            $browser->loginAs($admin)
                    ->visit(route('admin.peta-risiko.index'))
                    ->waitForText('Peta Risiko Global', 25)
                    // (SEBELUM) Panel menampilkan 3 lahan dari semua petani
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Sawah Budi')
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Ladang Siti')
                    // AKSI: Pilih "Budi Santoso" di dropdown filter
                    ->select('[dusk="filter-petani-peta"]', $petani1->id)
                    ->pause(3000)
                    // (SESUDAH) Hanya lahan milik Budi tampil
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Sawah Budi')
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Kebun Budi')
                    ->assertDontSeeIn('[dusk="panel-prioritas"]', 'Ladang Siti');
        });
    }

    // ─── TC-PRG-006 ─────────────────────────────────────────────
    // Pencarian lahan berdasarkan nama di search bar
    // BEFORE: 3 lahan tampil → AFTER: 1 lahan sesuai pencarian
    public function test_pencarian_lahan_berdasarkan_nama(): void
    {
        $admin   = User::factory()->admin()->create();
        $petani1 = User::factory()->create(['name' => 'Budi Santoso', 'role' => 'petani']);
        $petani2 = User::factory()->create(['name' => 'Siti Aminah', 'role' => 'petani']);
        AgriculturalArea::factory()->for($petani1)->create(['name' => 'Sawah Merpati']);
        AgriculturalArea::factory()->for($petani2)->create(['name' => 'Kebun Apel']);
        AgriculturalArea::factory()->for($petani1)->create(['name' => 'Ladang Jagung']);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.peta-risiko.index'))
                    ->waitForText('Peta Risiko Global', 25)
                    // (SEBELUM) 3 lahan tampil di panel
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Sawah Merpati')
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Kebun Apel')
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Ladang Jagung')
                    // AKSI: Ketik "Merpati" di search bar
                    ->type('[dusk="input-search-peta"]', 'Merpati')
                    ->pause(500)
                    // (SESUDAH) Hanya "Sawah Merpati" tampil
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Sawah Merpati')
                    ->assertDontSeeIn('[dusk="panel-prioritas"]', 'Kebun Apel')
                    ->assertDontSeeIn('[dusk="panel-prioritas"]', 'Ladang Jagung');
        });
    }

    // ─── TC-PRG-007 ─────────────────────────────────────────────
    // Toggle kartu risiko menyembunyikan/menampilkan level tertentu
    // BEFORE: 2 lahan → toggle OFF tinggi → 1 lahan → toggle ON → 2 lahan
    public function test_toggle_kartu_risiko_menyembunyikan_level(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['name' => 'Budi Santoso', 'role' => 'petani']);

        // Lahan risiko tinggi
        $area1 = AgriculturalArea::factory()->for($petani)->create(['name' => 'Ladang Bahaya']);
        FieldObservation::factory()->forArea($area1)->create([
            'soil_moisture'      => 'Kering',
            'water_puddle'       => 'Banyak',
            'disease_indication' => 'Berat',
            'observation_date'   => now()->toDateString(),
        ]);

        // Lahan belum observasi
        AgriculturalArea::factory()->for($petani)->create(['name' => 'Sawah Baru']);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.peta-risiko.index'))
                    ->waitForText('Peta Risiko Global', 25)
                    // (SEBELUM) Kedua lahan tampil di panel
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Ladang Bahaya')
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Sawah Baru')
                    // AKSI: Klik kartu Risiko Tinggi (toggle OFF)
                    ->click('[dusk="kartu-risiko-tinggi"]')
                    ->pause(500)
                    // (SESUDAH) Ladang Bahaya tersembunyi, Sawah Baru tetap
                    ->assertDontSeeIn('[dusk="panel-prioritas"]', 'Ladang Bahaya')
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Sawah Baru')
                    // AKSI: Klik lagi (toggle ON)
                    ->click('[dusk="kartu-risiko-tinggi"]')
                    ->pause(500)
                    // (SESUDAH-2) Ladang Bahaya kembali tampil
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Ladang Bahaya');
        });
    }

    // ─── TC-PRG-008 ─────────────────────────────────────────────
    // Empty state saat tidak ada lahan sama sekali
    public function test_empty_state_saat_tidak_ada_lahan(): void
    {
        $admin = User::factory()->admin()->create();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.peta-risiko.index'))
                    ->waitForText('Peta Risiko Global', 25)
                    // (SESUDAH) Empty state tampil, peta tidak ditampilkan
                    ->assertPresent('[dusk="empty-state"]')
                    ->assertSee('Belum ada lahan terdaftar untuk ditampilkan di peta')
                    // Semua kartu menunjukkan 0
                    ->assertSeeIn('[dusk="kartu-risiko-tinggi"]', '0')
                    ->assertSeeIn('[dusk="kartu-risiko-sedang"]', '0')
                    ->assertSeeIn('[dusk="kartu-risiko-rendah"]', '0')
                    ->assertSeeIn('[dusk="kartu-risiko-belum"]', '0');
        });
    }

    // ─── TC-PRG-009 ─────────────────────────────────────────────
    // Pencarian tidak cocok menampilkan pesan "Tidak ditemukan hasil"
    // BEFORE: 2 lahan tampil → AFTER: 0 lahan, pesan muncul
    public function test_pencarian_tidak_cocok_menampilkan_pesan_kosong(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['name' => 'Budi Santoso', 'role' => 'petani']);
        AgriculturalArea::factory()->for($petani)->create(['name' => 'Sawah Budi']);
        AgriculturalArea::factory()->for($petani)->create(['name' => 'Kebun Budi']);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.peta-risiko.index'))
                    ->waitForText('Peta Risiko Global', 25)
                    // (SEBELUM) 2 lahan tampil di panel
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Sawah Budi')
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Kebun Budi')
                    // AKSI: Ketik pencarian yang tidak cocok
                    ->type('[dusk="input-search-peta"]', 'xyz123tidakada')
                    ->pause(500)
                    // (SESUDAH) Pesan "Tidak ditemukan hasil" muncul
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Tidak ditemukan hasil untuk')
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'xyz123tidakada');
        });
    }

    // ─── TC-PRG-010 ─────────────────────────────────────────────
    // Panel prioritas menampilkan lahan diurut dari risiko tertinggi
    public function test_panel_prioritas_diurut_dari_risiko_tertinggi(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['name' => 'Budi Santoso', 'role' => 'petani']);

        // Lahan risiko rendah (skor ≤ 40)
        $areaRendah = AgriculturalArea::factory()->for($petani)->create(['name' => 'Sawah Aman']);
        FieldObservation::factory()->forArea($areaRendah)->create([
            'soil_moisture'         => 'Lembab',
            'water_puddle'          => 'Tidak Ada',
            'disease_indication'    => 'Tidak Ada',
            'observation_date'      => now()->toDateString(),
            'weather_precip_mm'     => 0,
            'weather_soil_moisture' => 0.5,
        ]);

        // Lahan risiko tinggi (skor > 70)
        $areaTinggi = AgriculturalArea::factory()->for($petani)->create(['name' => 'Ladang Bahaya']);
        FieldObservation::factory()->forArea($areaTinggi)->create([
            'soil_moisture'      => 'Kering',
            'water_puddle'       => 'Banyak',
            'disease_indication' => 'Berat',
            'observation_date'   => now()->toDateString(),
        ]);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit(route('admin.peta-risiko.index'))
                    ->waitForText('Peta Risiko Global', 25)
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Ladang Bahaya')
                    ->assertSeeIn('[dusk="panel-prioritas"]', 'Sawah Aman');

            // Verifikasi urutan: Ladang Bahaya (tinggi) muncul SEBELUM Sawah Aman (rendah)
            $panelText = $browser->text('[dusk="panel-prioritas"]');
            $posTinggi = strpos($panelText, 'Ladang Bahaya');
            $posRendah = strpos($panelText, 'Sawah Aman');
            $this->assertTrue(
                $posTinggi < $posRendah,
                'Lahan risiko tinggi (Ladang Bahaya) harus muncul sebelum risiko rendah (Sawah Aman) di panel prioritas'
            );
        });
    }
}
