<?php

namespace Tests\Browser;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * Dusk Browser Test — Insight Historis & Analisis Tren (AGS-86)
 * Assignee: ketrin
 * Command : php artisan dusk --filter=InsightHistorisBrowserTest
 *
 * PRASYARAT:
 *   php artisan serve (di terminal terpisah)
 *   npm run build  ATAU  npm run dev (di terminal terpisah)
 *
 * Cakupan: TC-08 s/d TC-16 dari Jira AGS-86
 */
class InsightHistorisBrowserTest extends DuskTestCase
{
    use DatabaseMigrations;

    /** TC-08: Halaman ter-render dengan ketiga grafik saat ada data */
    public function test_ketiga_grafik_ter_render_di_halaman(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();
        FieldObservation::factory()->forArea($area)->count(5)->create([
            'observation_date' => now()->format('Y-m-d'),
        ]);

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('insight-historis.index'))
                    ->waitFor('@chart-tren-cuaca', 20)
                    ->assertPresent('@chart-tren-cuaca')
                    ->assertPresent('@chart-distribusi-risiko')
                    ->assertPresent('@chart-frekuensi-observasi')
                    ->assertSee('Tren Parameter Lingkungan')
                    ->assertSee('Distribusi Risiko')
                    ->assertSee('Frekuensi Observasi');
        });
    }

    /** TC-09: Grafik Tren Cuaca tampil dengan data observasi yang benar */
    public function test_grafik_tren_cuaca_tampil_dengan_data(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();
        FieldObservation::factory()->forArea($area)->count(3)->create([
            'observation_date'  => now()->format('Y-m-d'),
            'weather_temp'      => 30.5,
            'weather_humidity'  => 75.0,
            'weather_precip_mm' => 10.0,
        ]);

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('insight-historis.index'))
                    ->waitFor('@chart-tren-cuaca', 20)
                    ->assertPresent('@chart-tren-cuaca')
                    ->assertSee('Suhu (°C)')
                    ->assertSee('Kelembapan (%)');
        });
    }

    /** TC-10: SVG grafik ter-render dan siap menerima interaksi */
    public function test_svg_grafik_ter_render(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();
        FieldObservation::factory()->forArea($area)->count(3)->create([
            'observation_date' => now()->format('Y-m-d'),
        ]);

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('insight-historis.index'))
                    ->waitFor('@chart-tren-cuaca', 20)
                    ->waitFor('.recharts-wrapper', 10)
                    ->assertPresent('.recharts-wrapper');
        });
    }

    /** TC-11: Empty state tampil dengan pesan saat belum ada data observasi */
    public function test_empty_state_tampil_saat_tidak_ada_data(): void
    {
        $farmer = User::factory()->create();

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('insight-historis.index'))
                    ->waitFor('@empty-state', 20)
                    ->assertPresent('@empty-state')
                    ->assertSee('Data belum cukup untuk membentuk tren');
        });
    }

    /** TC-12: Filter lahan mengubah data semua grafik tanpa reload halaman */
    public function test_filter_lahan_mengubah_data_grafik(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Sawah Filter']);
        FieldObservation::factory()->forArea($area)->count(3)->create([
            'observation_date' => now()->format('Y-m-d'),
        ]);

        $this->browse(function (Browser $browser) use ($farmer, $area) {
            $browser->loginAs($farmer)
                    ->visit(route('insight-historis.index'))
                    ->waitFor('@filter-area', 15)
                    ->select('@filter-area', (string) $area->id)
                    ->waitFor('@chart-tren-cuaca', 20)
                    ->assertPresent('@chart-tren-cuaca')
                    ->assertSelected('@filter-area', (string) $area->id);
        });
    }

    /** TC-13: Filter rentang waktu 7 hari menampilkan grafik */
    public function test_filter_rentang_waktu_7_hari(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();
        FieldObservation::factory()->forArea($area)->count(3)->create([
            'observation_date' => now()->subDays(3)->format('Y-m-d'),
        ]);

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('insight-historis.index'))
                    ->waitFor('@filter-range', 15)
                    ->select('@filter-range', '7')
                    ->waitFor('@chart-tren-cuaca', 20)
                    ->assertPresent('@chart-tren-cuaca')
                    ->assertSelected('@filter-range', '7');
        });
    }

    /** TC-14: Grafik Distribusi Risiko menampilkan data status lahan yang benar */
    public function test_grafik_distribusi_risiko_tampil_dengan_data(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();
        FieldObservation::factory()->forArea($area)->count(3)->create([
            'observation_date'   => now()->format('Y-m-d'),
            'soil_moisture'      => 'Normal',
            'water_puddle'       => 'Tidak Ada',
            'disease_indication' => 'Tidak Ada',
        ]);

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('insight-historis.index'))
                    ->waitFor('@chart-distribusi-risiko', 20)
                    ->assertPresent('@chart-distribusi-risiko')
                    ->assertSee('Distribusi Risiko');
        });
    }

    /** TC-15: Grafik Frekuensi Observasi tampil sesuai data */
    public function test_grafik_frekuensi_observasi_tampil(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();
        FieldObservation::factory()->forArea($area)->count(4)->create([
            'observation_date' => now()->format('Y-m-d'),
        ]);

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('insight-historis.index'))
                    ->waitFor('@chart-frekuensi-observasi', 20)
                    ->assertPresent('@chart-frekuensi-observasi')
                    ->assertSee('Frekuensi Observasi');
        });
    }

    /** TC-16: Reset filter area ke "Semua Lahan" mengembalikan grafik ke default */
    public function test_reset_filter_ke_kondisi_default(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Lahan Reset']);
        FieldObservation::factory()->forArea($area)->count(2)->create([
            'observation_date' => now()->format('Y-m-d'),
        ]);

        $this->browse(function (Browser $browser) use ($farmer, $area) {
            $browser->loginAs($farmer)
                    ->visit(route('insight-historis.index'))
                    ->waitFor('@filter-area', 15)
                    ->select('@filter-area', (string) $area->id)
                    ->waitFor('@chart-tren-cuaca', 20)
                    ->select('@filter-area', '')
                    ->waitFor('@chart-tren-cuaca', 20)
                    ->assertPresent('@chart-tren-cuaca')
                    ->assertSelected('@filter-area', '')
                    ->assertSelected('@filter-range', 'year');
        });
    }
}
