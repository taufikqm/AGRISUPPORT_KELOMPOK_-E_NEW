<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

/**
 * Prediksi jendela waktu tanam (AGS-72).
 *
 * Menghitung bulan tanam terbaik dari pola curah hujan & suhu historis
 * (Open-Meteo Archive API, 2 tahun terakhir). Jika API gagal, mengembalikan
 * rekomendasi fallback bertingkat-kepercayaan rendah tanpa crash.
 */
class PlantingTimeService
{
    /** Target curah hujan harian ideal saat mulai tanam (mm/hari) per komoditas. */
    private const IDEAL_RAIN = ['padi' => 6.0, 'jagung' => 3.5, 'kedelai' => 3.0];

    public function predict(float $lat, float $lon, string $cropType = 'padi'): array
    {
        $monthly = $this->fetchMonthlyClimate($lat, $lon);

        if (empty($monthly)) {
            return $this->fallback($cropType);
        }

        $idealRain = self::IDEAL_RAIN[$cropType] ?? 5.0;
        $now       = Carbon::now();

        // Cari bulan mendatang dengan curah hujan paling mendekati ideal.
        $best = null;
        for ($ahead = 0; $ahead < 12; $ahead++) {
            $month = (int) $now->copy()->addMonths($ahead)->format('n');
            if (! isset($monthly[$month])) {
                continue;
            }
            $selisih = abs($monthly[$month]['rain'] - $idealRain);
            if ($best === null || $selisih < $best['selisih']) {
                $best = ['ahead' => $ahead, 'selisih' => $selisih, 'data' => $monthly[$month]];
            }
        }

        if ($best === null) {
            return $this->fallback($cropType);
        }

        $start = $now->copy()->addMonths($best['ahead'])->startOfMonth()->addDays(9);
        if ($start->lessThan($now)) {
            $start = $now->copy()->addDays(7);
        }
        $end = $start->copy()->addDays(20);

        $totalDays  = array_sum(array_map(fn ($m) => $m['days'], $monthly));
        $limited    = $totalDays < 600;
        $confidence = $this->confidenceScore($best['selisih'], $totalDays, $limited);

        return [
            'start_date'       => $start->toDateString(),
            'start_label'      => $start->locale('id')->translatedFormat('d M Y'),
            'end_date'         => $end->toDateString(),
            'end_label'        => $end->locale('id')->translatedFormat('d M Y'),
            'confidence_score' => $confidence,
            'confidence_label' => $this->confidenceLabel($confidence),
            'basis'            => $this->basis($best['data'], $idealRain),
            'tips'             => $this->tips($cropType),
            'limited_data'     => $limited,
            'crop_type'        => $cropType,
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

    private function confidenceScore(float $selisih, int $totalDays, bool $limited): int
    {
        $base = 90 - (int) round($selisih * 6);
        if ($limited) {
            $base -= 25;
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

    private function basis(array $data, float $idealRain): array
    {
        return [
            "Rata-rata curah hujan bulan terpilih {$data['rain']} mm/hari (ideal sekitar {$idealRain} mm/hari untuk mulai tanam).",
            "Rata-rata suhu {$data['temp']}\u{00B0}C — sesuai untuk pertumbuhan awal tanaman.",
            'Dihitung dari data cuaca historis 2 tahun terakhir (Open-Meteo Archive).',
        ];
    }

    private function tips(string $cropType): array
    {
        $umum = [
            'Siapkan lahan dan saluran drainase sebelum tanggal mulai.',
            'Pantau prakiraan cuaca seminggu sebelum tanam.',
        ];

        return match ($cropType) {
            'padi'   => array_merge(['Pastikan ketersediaan air irigasi untuk fase awal padi.'], $umum),
            'jagung' => array_merge(['Hindari tanam saat curah hujan terlalu tinggi agar benih tidak busuk.'], $umum),
            default  => $umum,
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
            'basis'            => ['Data cuaca historis tidak tersedia saat ini. Rekomendasi bersifat umum, silakan coba lagi nanti.'],
            'tips'             => $this->tips($cropType),
            'limited_data'     => true,
            'crop_type'        => $cropType,
        ];
    }
}
