<?php

namespace Tests\Feature;

use App\Services\PlantingTimeService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Unit-level test algoritma inti Prediksi Waktu Tanam (AGS-72).
 *
 * Menguji logika pemilihan bulan & kalibrasi kepercayaan secara langsung pada
 * PlantingTimeService dengan data iklim historis yang dikontrol (Http::fake) —
 * menutup gap bahwa test feature sebelumnya hanya memakai data seragam.
 *
 * Command: php artisan test --filter=PlantingTimeServiceTest
 */
class PlantingTimeServiceTest extends TestCase
{
    private PlantingTimeService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new PlantingTimeService();
    }

    /**
     * Susun respons Open-Meteo Archive palsu: 24 bulan (2 tahun), 28 hari/bulan,
     * dengan curah hujan & suhu per-bulan-kalender dapat ditimpa.
     *
     * @param array<int, float> $rainByMonth  mm/hari per bulan kalender (1–12)
     * @param array<int, float> $tempByMonth  °C per bulan kalender (1–12)
     */
    private function fakeArchive(array $rainByMonth, array $tempByMonth, float $defaultRain, float $defaultTemp): void
    {
        $times = [];
        $rain  = [];
        $temp  = [];
        $awal  = Carbon::now()->subYears(2)->startOfMonth();

        for ($i = 0; $i < 24; $i++) {
            $bulan = $awal->copy()->addMonths($i);
            for ($d = 0; $d < 28; $d++) {
                $tgl = $bulan->copy()->addDays($d);
                $m   = (int) $tgl->format('n');
                $times[] = $tgl->toDateString();
                $rain[]  = $rainByMonth[$m] ?? $defaultRain;
                $temp[]  = $tempByMonth[$m] ?? $defaultTemp;
            }
        }

        Http::fake([
            'archive-api.open-meteo.com/*' => Http::response([
                'daily' => [
                    'time'                => $times,
                    'precipitation_sum'   => $rain,
                    'temperature_2m_mean' => $temp,
                ],
            ], 200),
        ]);
    }

    public function test_memilih_bulan_dengan_hujan_dan_suhu_paling_sesuai(): void
    {
        $target = (int) Carbon::now()->addMonths(3)->format('n');

        // Hanya bulan target yang ideal (padi: 6 mm/hari, 26°C); lainnya kering.
        $this->fakeArchive([$target => 6.0], [$target => 26.0], defaultRain: 0.5, defaultTemp: 26.0);

        $p = $this->service->predict(-6.9, 107.6, 'padi');

        $this->assertSame($target, (int) Carbon::parse($p['start_date'])->format('n'));
        $this->assertGreaterThanOrEqual(70, $p['confidence_score']);
        $this->assertSame(6.0, $p['climate']['rain']);
        $this->assertContains($p['match_label'], ['Sangat sesuai', 'Sesuai']);
    }

    public function test_mempertimbangkan_kontinuitas_air_sepanjang_siklus(): void
    {
        // Dua bulan dengan kondisi MULAI identik-ideal, tapi:
        //  - bulan A (target)  : bulan-bulan berikutnya kering (kekeringan tengah siklus)
        //  - bulan B (target+6): air bertahan sepanjang siklus
        // Algoritma matang harus memilih B, bukan A.
        $a  = (int) Carbon::now()->addMonths(1)->format('n');
        $b  = (int) Carbon::now()->addMonths(7)->format('n');
        $b1 = (int) Carbon::now()->addMonths(8)->format('n');
        $b2 = (int) Carbon::now()->addMonths(9)->format('n');
        $b3 = (int) Carbon::now()->addMonths(10)->format('n');

        $this->fakeArchive(
            [$a => 6.0, $b => 6.0, $b1 => 6.0, $b2 => 6.0, $b3 => 6.0],
            [],
            defaultRain: 0.5,
            defaultTemp: 26.0,
        );

        $p = $this->service->predict(-6.9, 107.6, 'padi');

        $this->assertSame($b, (int) Carbon::parse($p['start_date'])->format('n'),
            'Seharusnya memilih jendela dengan air bertahan sepanjang siklus, bukan yang kering di tengah.');
    }

    public function test_suhu_di_luar_rentang_menurunkan_kepercayaan_dan_ditandai(): void
    {
        $target = (int) Carbon::now()->addMonths(3)->format('n');

        // Hujan ideal di bulan target, tapi suhu ekstrem (40°C) di seluruh bulan.
        $this->fakeArchive([$target => 6.0], [], defaultRain: 0.5, defaultTemp: 40.0);

        $p = $this->service->predict(-6.9, 107.6, 'padi');

        $this->assertFalse($p['climate']['temp'] >= 22 && $p['climate']['temp'] <= 30);
        $this->assertLessThan(75, $p['confidence_score']);
        $this->assertStringContainsString('di luar rentang ideal', implode(' ', $p['basis']));
    }

    public function test_profil_komoditas_berbeda_punya_target_hujan_berbeda(): void
    {
        $target = (int) Carbon::now()->addMonths(2)->format('n');

        // Jagung ideal ~3.5 mm/hari — bulan target dipasang tepat di angka itu.
        $this->fakeArchive([$target => 3.5], [$target => 26.0], defaultRain: 0.3, defaultTemp: 26.0);

        $p = $this->service->predict(-6.9, 107.6, 'jagung');

        $this->assertSame($target, (int) Carbon::parse($p['start_date'])->format('n'));
        $this->assertSame('jagung', $p['crop_type']);
        $this->assertSame(3.5, $p['climate']['rain']);
        $this->assertContains($p['match_label'], ['Sangat sesuai', 'Sesuai']);
    }

    public function test_api_gagal_mengembalikan_fallback_kepercayaan_rendah(): void
    {
        Http::fake(['archive-api.open-meteo.com/*' => Http::response([], 500)]);

        $p = $this->service->predict(-6.9, 107.6, 'padi');

        $this->assertTrue($p['limited_data']);
        $this->assertSame(30, $p['confidence_score']);
        $this->assertNull($p['climate']);
    }
}
