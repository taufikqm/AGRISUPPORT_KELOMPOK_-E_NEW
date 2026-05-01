<?php

namespace App\Http\Controllers;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class FieldObservationController extends Controller
{
    // ------------------------------------------------------------------ ST-01

    public function index()
    {
        $areas = AgriculturalArea::where('user_id', Auth::id())
            ->get(['id', 'name', 'soil_type']);

        $recentObservations = FieldObservation::where('user_id', Auth::id())
            ->with('agriculturalArea:id,name')
            ->orderByDesc('observation_date')
            ->take(10)
            ->get();

        return Inertia::render('InputKondisi', [
            'areas'              => $areas,
            'recentObservations' => $recentObservations,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'agricultural_area_id' => 'required|exists:agricultural_areas,id',
            'observation_date'     => 'required|date',
            'planting_cycle'       => 'nullable|string|max:100',
            'soil_moisture'        => 'required|in:Kering,Normal,Lembab,Sangat Basah',
            'water_puddle'         => 'required|in:Tidak Ada,Sedikit,Sedang,Banyak',
            'crop_condition'       => 'required|in:Kritis,Kurang Baik,Baik,Sangat Baik',
            'pest_indication'      => 'required|in:Tidak Ada,Ringan,Sedang,Berat',
            'disease_indication'   => 'required|in:Tidak Ada,Ringan,Sedang,Berat',
            'notes'                => 'nullable|string|max:1000',
        ]);

        $area = AgriculturalArea::where('id', $validated['agricultural_area_id'])
            ->where('user_id', Auth::id())
            ->firstOrFail();

        // Ambil koordinat centroid lahan dari PostGIS
        $centroid = DB::selectOne(
            'SELECT ST_Y(ST_Centroid(geometry::geometry)) AS lat,
                    ST_X(ST_Centroid(geometry::geometry)) AS lon
             FROM agricultural_areas WHERE id = ?',
            [$area->id]
        );

        if (! $centroid || ! $centroid->lat || ! $centroid->lon) {
            return back()->withErrors([
                'agricultural_area_id' => 'Lahan ini belum memiliki lokasi peta. Tambahkan lokasi di menu Wilayah Lahan terlebih dahulu.',
            ])->withInput();
        }

        // Ambil snapshot cuaca dari Open-Meteo — jika gagal, observasi tetap tersimpan
        $weatherData = [
            'weather_temp'          => null,
            'weather_condition'     => null,
            'weather_humidity'      => null,
            'weather_wind_kph'      => null,
            'weather_precip_mm'     => null,
            'weather_soil_moisture' => null,
        ];

        try {
            $response = Http::timeout(5)->get('https://api.open-meteo.com/v1/forecast', [
                'latitude'  => $centroid->lat,
                'longitude' => $centroid->lon,
                'current'   => 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code,soil_moisture_0_to_1cm',
                'timezone'  => 'Asia/Jakarta',
            ]);

            if ($response->successful()) {
                $current = $response->json('current', []);
                $weatherData = [
                    'weather_temp'          => $current['temperature_2m'] ?? null,
                    'weather_condition'     => isset($current['weather_code']) ? (string) $current['weather_code'] : null,
                    'weather_humidity'      => $current['relative_humidity_2m'] ?? null,
                    'weather_wind_kph'      => $current['wind_speed_10m'] ?? null,
                    'weather_precip_mm'     => $current['precipitation'] ?? null,
                    'weather_soil_moisture' => $current['soil_moisture_0_to_1cm'] ?? null,
                ];
            }
        } catch (\Exception $e) {
            // Cuaca gagal diambil — observasi tersimpan dengan data cuaca kosong
        }

        $observation = FieldObservation::create(array_merge($validated, $weatherData, [
            'user_id' => Auth::id(),
        ]));

        return redirect()->route('validasi-observasi.show', $observation);
    }

    // ------------------------------------------------------------------ ST-02

    public function showValidation(FieldObservation $observation)
    {
        abort_if($observation->user_id !== Auth::id(), 403);

        $observation->load('agriculturalArea:id,name,soil_type');

        return Inertia::render('ValidasiObservasi', [
            'observation' => $observation,
        ]);
    }

    // ------------------------------------------------------------------ AGS-23 ST-01

    public function showRiskAnalysis(FieldObservation $observation)
    {
        abort_if($observation->user_id !== Auth::id(), 403);

        $observation->load('agriculturalArea:id,name,soil_type');

        return Inertia::render('AnalisisRisiko', [
            'observation'  => $observation,
            'riskAnalysis' => $this->calculateRisk($observation),
        ]);
    }

    private function calculateRisk(FieldObservation $observation): array
    {
        $soilType = strtolower($observation->agriculturalArea->soil_type ?? '');

        // Skor Kekeringan (0–100) — berdasarkan kelembapan tanah dan data cuaca
        $droughtScore = match($observation->soil_moisture) {
            'Kering'       => 80,
            'Normal'       => 40,
            'Lembab'       => 20,
            'Sangat Basah' => 5,
            default        => 40,
        };
        if (str_contains($soilType, 'regosol'))               $droughtScore += 15; // Regosol lebih rentan kekeringan
        if (($observation->weather_soil_moisture ?? 1) < 0.1) $droughtScore += 20;
        elseif (($observation->weather_soil_moisture ?? 0) > 0.3) $droughtScore -= 20;
        if (($observation->weather_precip_mm ?? 0) > 10)      $droughtScore -= 15;
        $droughtScore = max(0, min(100, $droughtScore));

        // Skor Genangan (0–100) — berdasarkan kondisi genangan dan curah hujan
        $floodScore = match($observation->water_puddle) {
            'Tidak Ada' => 5,
            'Sedikit'   => 30,
            'Sedang'    => 60,
            'Banyak'    => 85,
            default     => 5,
        };
        if (str_contains($soilType, 'aluvial'))               $floodScore += 15; // Aluvial lebih rentan genangan
        if (($observation->weather_precip_mm ?? 0) > 15)      $floodScore += 25;
        elseif (($observation->weather_precip_mm ?? 0) > 5)   $floodScore += 10;
        if ($observation->soil_moisture === 'Sangat Basah')    $floodScore += 10;
        $floodScore = max(0, min(100, $floodScore));

        // Skor Penyakit (0–100) — berdasarkan indikasi penyakit dan kondisi spesifik jenis tanah
        $diseaseScore = match($observation->disease_indication) {
            'Tidak Ada' => 5,
            'Ringan'    => 30,
            'Sedang'    => 60,
            'Berat'     => 90,
            default     => 5,
        };
        $diseaseName = 'Hama Umum';
        $temp        = $observation->weather_temp ?? 0;
        $humidity    = $observation->weather_humidity ?? 0;
        $precip      = $observation->weather_precip_mm ?? 0;

        if (str_contains($soilType, 'andosol') && $temp >= 15 && $temp <= 22 && $humidity > 90) {
            $diseaseScore += 20;
            $diseaseName   = 'Hawar Daun'; // Andosol dingin+lembap → rentan hawar daun
        } elseif (str_contains($soilType, 'aluvial') && (in_array($observation->water_puddle, ['Sedang', 'Banyak']) || $precip > 15)) {
            $diseaseScore += 20;
            $diseaseName   = 'Blas & Busuk Akar'; // Aluvial basah → rentan blas & busuk akar
        } elseif (str_contains($soilType, 'podsolik') && $observation->soil_moisture === 'Sangat Basah') {
            $diseaseScore += 15;
            $diseaseName   = 'Akar Gada'; // Podsolik sangat basah → rentan akar gada
        } elseif ((str_contains($soilType, 'latosol') || str_contains($soilType, 'grumusol')) && $observation->soil_moisture === 'Sangat Basah') {
            $diseaseScore += 15;
            $diseaseName   = 'Layu Fusarium'; // Latosol/Grumusol sangat basah → rentan layu fusarium
        }
        $diseaseScore = max(0, min(100, $diseaseScore));

        $overallScore = (int) round(($droughtScore + $floodScore + $diseaseScore) / 3);
        $levelLabel   = fn(int $s) => match(true) {
            $s >= 75 => 'Kritis',
            $s >= 50 => 'Tinggi',
            $s >= 25 => 'Sedang',
            default  => 'Rendah',
        };

        return [
            'drought_risk' => [
                'score'       => $droughtScore,
                'level'       => $levelLabel($droughtScore),
                'description' => 'Risiko kekurangan air pada lahan',
            ],
            'flood_risk' => [
                'score'       => $floodScore,
                'level'       => $levelLabel($floodScore),
                'description' => 'Risiko genangan atau banjir pada lahan',
            ],
            'disease_risk' => [
                'score'       => $diseaseScore,
                'level'       => $levelLabel($diseaseScore),
                'description' => 'Risiko serangan penyakit tanaman',
            ],
            'overall_risk_score' => $overallScore,
            'overall_risk_level' => $levelLabel($overallScore),
            'analysis_summary'   => $this->buildSummary($droughtScore, $floodScore, $diseaseScore, $observation->agriculturalArea->name),
            'disease_name'       => $diseaseName,
        ];
    }

    private function buildSummary(int $drought, int $flood, int $disease, string $areaName): string
    {
        $parts = [];
        if ($drought >= 50) $parts[] = 'risiko kekeringan yang perlu diwaspadai';
        if ($flood   >= 50) $parts[] = 'potensi genangan air yang cukup tinggi';
        if ($disease >= 50) $parts[] = 'indikasi serangan penyakit tanaman';

        if (empty($parts)) {
            return "Kondisi lahan {$areaName} secara umum baik. Tetap lakukan pemantauan rutin untuk menjaga produktivitas.";
        }

        return 'Lahan ' . $areaName . ' menunjukkan ' . implode(', ', $parts) . '. Segera tinjau rekomendasi tindakan untuk penanganan yang tepat.';
    }
}
