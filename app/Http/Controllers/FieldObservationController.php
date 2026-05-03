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

    // ------------------------------------------------------------------ AGS-23

    public function showRiskAnalysis(FieldObservation $observation)
    {
        if ($observation->user_id !== Auth::id()) {
            abort(403);
        }

        $risk_metrics = $this->calculateRiskMetrics($observation);

        return Inertia::render('AnalisisRisiko', [
            'observation'  => $observation->load('agriculturalArea'),
            'risk_metrics' => $risk_metrics,
        ]);
    }

    private function calculateRiskMetrics(FieldObservation $observation): array
    {
        $observation->load('agriculturalArea');
        $area     = $observation->agriculturalArea;
        $soilType = $area->soil_type ?? 'Lainnya';

        // 1. Risiko Kekeringan
        $droughtScore = match($observation->soil_moisture) {
            'Kering'       => 70,
            'Normal'       => 30,
            'Lembab'       => 10,
            'Sangat Basah' => 0,
            default        => 0,
        };
        if ($observation->weather_soil_moisture !== null) {
            if ($observation->weather_soil_moisture < 0.20)      $droughtScore += 30;
            elseif ($observation->weather_soil_moisture < 0.30)  $droughtScore += 15;
        }
        if ($soilType === 'Regosol') $droughtScore += 10;
        $droughtScore = min(100, max(0, $droughtScore));

        // 2. Risiko Genangan
        $puddleScore = match($observation->water_puddle) {
            'Banyak'    => 80,
            'Sedang'    => 50,
            'Sedikit'   => 20,
            'Tidak Ada' => 0,
            default     => 0,
        };
        if (($observation->weather_precip_mm ?? 0) > 10) $puddleScore += 20;
        if ($soilType === 'Aluvial' && $observation->water_puddle !== 'Tidak Ada') {
            $puddleScore = max($puddleScore, 90);
        }
        $puddleScore = min(100, max(0, $puddleScore));

        // 3. Risiko Penyakit
        $diseaseScore = match($observation->disease_indication) {
            'Berat'     => 90,
            'Sedang'    => 60,
            'Ringan'    => 30,
            'Tidak Ada' => 10,
            default     => 10,
        };

        $relevantDisease = 'Penyakit Umum';
        $diseaseAdvice   = 'Lakukan observasi rutin untuk mencegah penyebaran organisme pengganggu tanaman.';

        if ($soilType === 'Andosol') {
            $relevantDisease = 'Hawar Daun';
            if (($observation->weather_temp ?? 0) >= 15 && ($observation->weather_temp ?? 0) <= 22 && ($observation->weather_humidity ?? 0) > 90) {
                $diseaseScore  = max($diseaseScore, 85);
                $diseaseAdvice = 'Kondisi suhu sejuk dan kelembapan tinggi sangat berisiko memicu Hawar Daun pada tanah Andosol.';
            }
        } elseif ($soilType === 'Aluvial') {
            $relevantDisease = 'Blas & Busuk Akar';
            if ($puddleScore > 70 || ($observation->weather_precip_mm ?? 0) > 15) {
                $diseaseScore  = max($diseaseScore, 90);
                $diseaseAdvice = 'Tanah Aluvial cenderung menyimpan air, waspadai Busuk Akar akibat kelembapan tanah yang ekstrem.';
            }
        } elseif ($soilType === 'Podsolik') {
            $relevantDisease = 'Akar Gada';
            if ($observation->soil_moisture === 'Sangat Basah' || ($observation->weather_soil_moisture ?? 0) > 0.45) {
                $diseaseScore  = max($diseaseScore, 80);
                $diseaseAdvice = 'Waspadai Akar Gada pada tanah Podsolik saat kondisi lahan sangat basah atau jenuh air.';
            }
        } elseif ($soilType === 'Latosol' || $soilType === 'Grumusol') {
            $relevantDisease = 'Layu Fusarium';
            if (($observation->weather_soil_moisture ?? 0) > 0.40 || $observation->water_puddle !== 'Tidak Ada') {
                $diseaseScore  = max($diseaseScore, 85);
                $diseaseAdvice = 'Jamur Fusarium berkembang pesat pada tanah Latosol/Grumusol yang jenuh air.';
            }
        }
        $diseaseScore = min(100, max(0, $diseaseScore));

        $overallRisk = (int) round(($droughtScore + $puddleScore + $diseaseScore) / 3);
        $readiness   = 100 - $overallRisk;

        $summary = 'Analisis sistem menunjukkan ';
        if ($overallRisk > 70)      $summary .= 'risiko tinggi pada lahan Anda. ';
        elseif ($overallRisk > 40)  $summary .= 'potensi gangguan yang memerlukan perhatian. ';
        else                        $summary .= 'kondisi lahan yang stabil berdasarkan data saat ini. ';
        if ($soilType === 'Regosol')  $summary .= 'Karakteristik tanah Regosol yang berpasir memerlukan manajemen irigasi lebih sering. ';
        if ($diseaseScore >= 80)      $summary .= "Terdeteksi pemicu lingkungan untuk $relevantDisease. ";
        if ($puddleScore  >= 70)      $summary .= 'Data cuaca mendukung potensi genangan air. ';

        return [
            'drought'          => $droughtScore,
            'puddle'           => $puddleScore,
            'disease'          => $diseaseScore,
            'overall'          => $overallRisk,
            'readiness'        => $readiness,
            'summary'          => $summary,
            'soil_type'        => $soilType,
            'relevant_disease' => $relevantDisease,
            'disease_advice'   => $diseaseAdvice,
        ];
    }
}
