<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

/**
 * Prediksi jendela waktu tanam (AGS-72).
 *
 * Menghitung bulan tanam terbaik dari pola curah hujan & suhu historis
 * (Open-Meteo Archive API, 2 tahun terakhir). Skor kesesuaian tiap kandidat
 * bulan menimbang tiga faktor:
 *   1. Kedekatan curah hujan bulan mulai dengan kebutuhan ideal komoditas (45%).
 *   2. Kesesuaian suhu rata-rata sepanjang siklus terhadap rentang ideal (30%).
 *   3. Kontinuitas air sepanjang siklus tanam — bukan hanya bulan mulai (25%).
 * Untuk komoditas berair-rendah (kedelai) diberi penalti bila bulan panen basah.
 *
 * Jika API gagal, mengembalikan rekomendasi fallback berkepercayaan rendah
 * tanpa crash.
 */
class PlantingTimeService
{
    /**
     * Profil agronomi per komoditas.
     *  - rain_ideal   : curah hujan harian ideal saat mulai tanam (mm/hari).
     *  - temp_min/max : rentang suhu rata-rata ideal (°C).
     *  - cycle_months : panjang siklus tanam (bulan) untuk evaluasi kontinuitas air.
     *  - water_need   : narasi kebutuhan air (tinggi/sedang/rendah).
     */
    private const PROFILES = [
        'padi'    => ['rain_ideal' => 6.0, 'temp_min' => 22.0, 'temp_max' => 30.0, 'cycle_months' => 4, 'water_need' => 'tinggi'],
        'jagung'  => ['rain_ideal' => 3.5, 'temp_min' => 21.0, 'temp_max' => 30.0, 'cycle_months' => 3, 'water_need' => 'sedang'],
        'kedelai' => ['rain_ideal' => 3.0, 'temp_min' => 23.0, 'temp_max' => 30.0, 'cycle_months' => 3, 'water_need' => 'rendah'],
    ];

    public function predict(float $lat, float $lon, string $cropType = 'padi'): array
    {
        $profile = self::PROFILES[$cropType] ?? self::PROFILES['padi'];
        $monthly = $this->fetchMonthlyClimate($lat, $lon);

        if (empty($monthly)) {
            return $this->fallback($cropType);
        }

        $now = Carbon::now();

        // Cari bulan mendatang (0–11 ke depan) dengan skor kesesuaian tertinggi.
        $best = null;
        for ($ahead = 0; $ahead < 12; $ahead++) {
            $month = (int) $now->copy()->addMonths($ahead)->format('n');
            if (! isset($monthly[$month])) {
                continue;
            }
            $score = $this->scoreMonth($monthly, $month, $profile);
            if ($score['suitability'] <= 0) {
                continue;
            }
            if ($best === null || $score['suitability'] > $best['suitability']) {
                $best = $score + ['ahead' => $ahead, 'month' => $month];
            }
        }

        if ($best === null) {
            return $this->fallback($cropType);
        }

        // Mulai tanam: dasarian ke-2 (tanggal 10) bulan terpilih; jika sudah lewat, +7 hari.
        $start = $now->copy()->addMonths($best['ahead'])->startOfMonth()->addDays(9);
        if ($start->lessThan($now)) {
            $start = $now->copy()->addDays(7);
        }
        $end = $start->copy()->addDays(20); // jendela tanam optimal ±2 dasarian.

        $totalDays  = array_sum(array_map(fn ($m) => $m['days'], $monthly));
        $limited    = $totalDays < 600;
        $confidence = $this->confidence($best['suitability'], $limited, $totalDays);

        return [
            'start_date'       => $start->toDateString(),
            'start_label'      => $start->locale('id')->translatedFormat('d M Y'),
            'end_date'         => $end->toDateString(),
            'end_label'        => $end->locale('id')->translatedFormat('d M Y'),
            'confidence_score' => $confidence,
            'confidence_label' => $this->confidenceLabel($confidence),
            'climate'          => [
                'rain' => $best['startRain'],
                'temp' => $best['startTemp'],
            ],
            'match_label'      => $this->matchLabel($best['suitability']),
            'basis'            => $this->basis($best, $profile),
            'tips'             => $this->tips($cropType),
            'limited_data'     => $limited,
            'crop_type'        => $cropType,
        ];
    }

    /**
     * Skor kesesuaian satu kandidat bulan mulai (0..1) beserta data pendukung.
     *
     * @return array{suitability: float, startRain?: float, startTemp?: float, avgCycleRain?: float, tempOk?: bool}
     */
    private function scoreMonth(array $monthly, int $startMonth, array $p): array
    {
        // Kumpulkan hujan & suhu sepanjang siklus tanam.
        $rains = [];
        $temps = [];
        for ($k = 0; $k < $p['cycle_months']; $k++) {
            $m = (($startMonth - 1 + $k) % 12) + 1;
            if (! isset($monthly[$m])) {
                continue;
            }
            $rains[] = $monthly[$m]['rain'];
            $temps[] = $monthly[$m]['temp'];
        }

        if (empty($rains)) {
            return ['suitability' => 0.0];
        }

        $startRain = $monthly[$startMonth]['rain'];
        $startTemp = $monthly[$startMonth]['temp'];

        // 1. Kedekatan hujan bulan mulai ke ideal (1 = tepat, 0 = meleset sejauh ideal).
        $rainScore = max(0.0, 1.0 - abs($startRain - $p['rain_ideal']) / $p['rain_ideal']);

        // 2. Fraksi bulan siklus dengan suhu rata-rata di rentang ideal.
        $tempOkCount = 0;
        foreach ($temps as $t) {
            if ($t >= $p['temp_min'] && $t <= $p['temp_max']) {
                $tempOkCount++;
            }
        }
        $tempScore = $tempOkCount / count($temps);

        // 3. Kontinuitas air: rata-rata hujan siklus terhadap kebutuhan minimum (40% ideal).
        $avgCycleRain = array_sum($rains) / count($rains);
        $minNeed      = max(0.1, $p['rain_ideal'] * 0.4);
        $waterScore   = max(0.0, min(1.0, $avgCycleRain / $minNeed));

        // Penalti komoditas berair-rendah bila bulan panen (akhir siklus) terlalu basah.
        $penalty = 0.0;
        if ($p['water_need'] === 'rendah' && end($rains) > $p['rain_ideal'] * 2.0) {
            $penalty = 0.15;
        }

        $suitability = (0.45 * $rainScore) + (0.30 * $tempScore) + (0.25 * $waterScore) - $penalty;
        $suitability = max(0.0, min(1.0, $suitability));

        return [
            'suitability'  => $suitability,
            'startRain'    => $startRain,
            'startTemp'    => $startTemp,
            'avgCycleRain' => round($avgCycleRain, 2),
            'tempOk'       => $startTemp >= $p['temp_min'] && $startTemp <= $p['temp_max'],
        ];
    }

    /** @return array<int, array{rain: float, temp: float, days: int}> */
    private function fetchMonthlyClimate(float $lat, float $lon): array
    {
        try {
            $end   = Carbon::now()->subDays(5);
            $start = $end->copy()->subYears(2);

            $resp = Http::withoutVerifying()->timeout(8)->get('https://archive-api.open-meteo.com/v1/archive', [
                'latitude'   => $lat,
                'longitude'  => $lon,
                'start_date' => $start->toDateString(),
                'end_date'   => $end->toDateString(),
                'daily'      => 'precipitation_sum,temperature_2m_mean',
                'timezone'   => 'Asia/Jakarta',
            ]);

            if (! $resp->successful()) {
                return [];
            }

            $times = $resp->json('daily.time', []);
            $rain  = $resp->json('daily.precipitation_sum', []);
            $temp  = $resp->json('daily.temperature_2m_mean', []);

            $agg = [];
            foreach ($times as $i => $date) {
                $m = (int) Carbon::parse($date)->format('n');
                $agg[$m] ??= ['rainSum' => 0.0, 'tempSum' => 0.0, 'days' => 0];
                $agg[$m]['rainSum'] += (float) ($rain[$i] ?? 0);
                $agg[$m]['tempSum'] += (float) ($temp[$i] ?? 0);
                $agg[$m]['days']++;
            }

            $monthly = [];
            foreach ($agg as $m => $a) {
                if ($a['days'] === 0) {
                    continue;
                }
                $monthly[$m] = [
                    'rain' => round($a['rainSum'] / $a['days'], 2),
                    'temp' => round($a['tempSum'] / $a['days'], 1),
                    'days' => $a['days'],
                ];
            }

            return $monthly;
        } catch (\Throwable $e) {
            report($e);
            return [];
        }
    }

    /** Skor kepercayaan = kesesuaian (0..1) dikalibrasi, dikurangi penalti kelengkapan data. */
    private function confidence(float $suitability, bool $limited, int $totalDays): int
    {
        $base = (int) round($suitability * 100);
        if ($limited) {
            $base -= 20;
        }
        if ($totalDays < 300) {
            $base -= 15;
        }

        return max(20, min(95, $base));
    }

    private function confidenceLabel(int $score): string
    {
        return match (true) {
            $score >= 80 => 'Sangat Tinggi',
            $score >= 65 => 'Tinggi',
            $score >= 45 => 'Sedang',
            default      => 'Rendah',
        };
    }

    private function matchLabel(float $suitability): string
    {
        return match (true) {
            $suitability >= 0.80 => 'Sangat sesuai',
            $suitability >= 0.65 => 'Sesuai',
            $suitability >= 0.45 => 'Cukup',
            default              => 'Kurang ideal',
        };
    }

    private function basis(array $best, array $p): array
    {
        $tmin = $p['temp_min'];
        $tmax = $p['temp_max'];

        $tempLine = $best['tempOk']
            ? "Suhu rata-rata {$best['startTemp']}\u{00B0}C berada dalam rentang ideal {$tmin}\u{2013}{$tmax}\u{00B0}C."
            : "Suhu rata-rata {$best['startTemp']}\u{00B0}C di luar rentang ideal {$tmin}\u{2013}{$tmax}\u{00B0}C \u{2014} pertumbuhan awal perlu perhatian ekstra.";

        return [
            "Curah hujan awal tanam {$best['startRain']} mm/hari (ideal sekitar {$p['rain_ideal']} mm/hari).",
            $tempLine,
            "Rata-rata hujan sepanjang ~{$p['cycle_months']} bulan siklus {$best['avgCycleRain']} mm/hari \u{2014} kebutuhan air komoditas tergolong {$p['water_need']}.",
            'Dihitung dari pola cuaca historis 2 tahun terakhir (Open-Meteo Archive).',
        ];
    }

    private function tips(string $cropType): array
    {
        $umum = [
            'Siapkan lahan dan saluran drainase sebelum tanggal mulai.',
            'Pantau prakiraan cuaca seminggu sebelum tanam.',
        ];

        return match ($cropType) {
            'padi'    => array_merge(['Pastikan ketersediaan air irigasi untuk fase awal padi.'], $umum),
            'jagung'  => array_merge(['Hindari tanam saat curah hujan terlalu tinggi agar benih tidak busuk.'], $umum),
            'kedelai' => array_merge(['Jaga drainase baik; kedelai sensitif genangan terutama saat pengisian polong.'], $umum),
            default   => $umum,
        };
    }

    private function fallback(string $cropType): array
    {
        $start = Carbon::now()->addDays(14);
        $end   = $start->copy()->addDays(20);

        return [
            'start_date'       => $start->toDateString(),
            'start_label'      => $start->locale('id')->translatedFormat('d M Y'),
            'end_date'         => $end->toDateString(),
            'end_label'        => $end->locale('id')->translatedFormat('d M Y'),
            'confidence_score' => 30,
            'confidence_label' => 'Rendah',
            'climate'          => null,
            'match_label'      => null,
            'basis'            => ['Data cuaca historis tidak tersedia saat ini. Rekomendasi bersifat umum, silakan coba lagi nanti.'],
            'tips'             => $this->tips($cropType),
            'limited_data'     => true,
            'crop_type'        => $cropType,
        ];
    }
}
