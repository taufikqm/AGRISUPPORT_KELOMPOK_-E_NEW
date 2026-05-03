<?php

namespace App\Http\Controllers;

use App\Models\ActionLog;
use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\Recommendation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class FieldObservationController extends Controller
{
    // ------------------------------------------------------------------ AGS-2 Dashboard

    public function dashboard(Request $request)
    {
        $userId  = Auth::id();
        $areas   = AgriculturalArea::where('user_id', $userId)->get(['id', 'name']);
        $areaId  = $request->query('area_id');

        $obsQuery = FieldObservation::where('user_id', $userId)
            ->with('agriculturalArea:id,name,soil_type')
            ->latest('observation_date');

        if ($areaId && $areas->contains('id', (int) $areaId)) {
            $obsQuery->where('agricultural_area_id', $areaId);
        }

        $latestObs = $obsQuery->first();

        $weather         = null;
        $riskAlerts      = [];
        $recommendations = collect();

        if ($latestObs) {
            $metrics = $this->calculateRiskMetrics($latestObs);

            // Coba fetch cuaca live dari Open-Meteo via centroid lahan
            $liveTemp = $latestObs->weather_temp;
            $liveCond = $latestObs->weather_condition;
            $liveHum  = $latestObs->weather_humidity;
            $liveWind = $latestObs->weather_wind_kph;

            if ($liveTemp === null && $latestObs->agriculturalArea) {
                $centroid = DB::selectOne(
                    'SELECT ST_Y(ST_Centroid(geometry::geometry)) AS lat,
                            ST_X(ST_Centroid(geometry::geometry)) AS lon
                     FROM agricultural_areas WHERE id = ?',
                    [$latestObs->agriculturalArea->id]
                );

                if ($centroid && $centroid->lat && $centroid->lon) {
                    try {
                        $resp = Http::timeout(5)->get('https://api.open-meteo.com/v1/forecast', [
                            'latitude'  => $centroid->lat,
                            'longitude' => $centroid->lon,
                            'current'   => 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
                            'timezone'  => 'Asia/Jakarta',
                        ]);
                        if ($resp->successful()) {
                            $cur      = $resp->json('current', []);
                            $liveTemp = $cur['temperature_2m'] ?? null;
                            $liveCond = isset($cur['weather_code']) ? (string) $cur['weather_code'] : null;
                            $liveHum  = $cur['relative_humidity_2m'] ?? null;
                            $liveWind = $cur['wind_speed_10m'] ?? null;
                        }
                    } catch (\Exception $e) {
                        // Biarkan null jika gagal
                    }
                }
            }

            $weather = [
                'temp'      => $liveTemp,
                'condition' => $this->mapWeatherCode($liveCond),
                'humidity'  => $liveHum,
                'wind'      => $liveWind,
                'area_name' => $latestObs->agriculturalArea->name ?? 'Lahan',
            ];

            $riskItems = [
                ['name' => $metrics['relevant_disease'], 'key' => 'disease', 'score' => $metrics['disease'], 'desc' => $metrics['disease_advice']],
                ['name' => 'Risiko Genangan',            'key' => 'puddle',  'score' => $metrics['puddle'],  'desc' => 'Potensi genangan air terdeteksi pada area lahan.'],
                ['name' => 'Risiko Kekeringan',          'key' => 'drought', 'score' => $metrics['drought'], 'desc' => 'Kelembapan tanah rendah, perlu perhatian irigasi.'],
            ];
            usort($riskItems, fn($a, $b) => $b['score'] - $a['score']);

            foreach (array_slice($riskItems, 0, 2) as $risk) {
                $riskAlerts[] = [
                    'name'      => $risk['name'],
                    'score'     => $risk['score'],
                    'level'     => $risk['score'] > 70 ? 'Bahaya / Tinggi' : ($risk['score'] > 40 ? 'Waspada / Sedang' : 'Aman / Rendah'),
                    'status'    => $risk['score'] > 70 ? 'danger' : ($risk['score'] > 40 ? 'warning' : 'safe'),
                    'desc'      => $risk['desc'],
                    'area_name' => $latestObs->agriculturalArea->name ?? 'Lahan',
                ];
            }

            $completedIds = ActionLog::where('user_id', $userId)
                ->where('observation_id', $latestObs->id)
                ->pluck('recommendation_id')->toArray();

            $recommendations = $this->prepareRecommendations($latestObs, $metrics)
                ->take(4)
                ->map(fn($r) => [
                    'id'           => $r->id,
                    'title'        => $r->title,
                    'category'     => $r->category,
                    'urgency'      => $r->urgency ?? 'TERENCANA',
                    'color'        => $r->color ?? 'green',
                    'is_completed' => in_array($r->id, $completedIds),
                ])->values();
        }

        $recentActivity = ActionLog::where('user_id', $userId)
            ->with(['recommendation:id,title,category', 'observation.agriculturalArea:id,name'])
            ->latest('performed_at')
            ->take(5)
            ->get()
            ->map(fn($log) => [
                'title'     => $log->recommendation->title ?? 'Tindakan',
                'area_name' => optional($log->observation->agriculturalArea)->name ?? 'Lahan',
                'date'      => \Carbon\Carbon::parse($log->performed_at)->format('d M Y'),
                'category'  => $log->recommendation->category ?? '',
            ]);

        return Inertia::render('Dashboard', [
            'weather'             => $weather,
            'riskAlerts'          => $riskAlerts,
            'recommendations'     => $recommendations,
            'recentActivity'      => $recentActivity,
            'latestObservationId' => $latestObs?->id,
            'areas'               => $areas,
            'selectedAreaId'      => $areaId ? (int) $areaId : null,
        ]);
    }

    private function mapWeatherCode(?string $code): string
    {
        if ($code === null) return 'Tidak Diketahui';
        $c = (int) $code;
        if ($c === 0)  return 'Cerah';
        if ($c <= 3)   return 'Berawan';
        if ($c <= 48)  return 'Berkabut';
        if ($c <= 67)  return 'Hujan Ringan';
        if ($c <= 82)  return 'Hujan';
        return 'Badai';
    }

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

    // ------------------------------------------------------------------ AGS-24 ST-04 (index)

    public function indexRecommendations()
    {
        $observations = FieldObservation::where('user_id', Auth::id())
            ->with('agriculturalArea:id,name,soil_type')
            ->orderByDesc('observation_date')
            ->take(30)
            ->get();

        $items = $observations->map(function ($obs) {
            $metrics     = $this->calculateRiskMetrics($obs);
            $recs        = $this->prepareRecommendations($obs, $metrics);
            $completed   = ActionLog::where('user_id', Auth::id())
                ->where('observation_id', $obs->id)
                ->count();

            return [
                'id'             => $obs->id,
                'date'           => $obs->observation_date,
                'area_name'      => $obs->agriculturalArea->name ?? 'Lahan',
                'overall_risk'   => $metrics['overall'],
                'total_recs'     => $recs->count(),
                'completed_count'=> $completed,
            ];
        });

        return Inertia::render('RekomendasiIndex', [
            'items' => $items,
        ]);
    }

    // ------------------------------------------------------------------ AGS-24 ST-01

    public function showRecommendations(FieldObservation $observation)
    {
        if ($observation->user_id !== Auth::id()) {
            abort(403);
        }

        $metrics         = $this->calculateRiskMetrics($observation);
        $recommendations = $this->prepareRecommendations($observation, $metrics);

        $completedIds = ActionLog::where('user_id', Auth::id())
            ->where('observation_id', $observation->id)
            ->pluck('recommendation_id')
            ->toArray();

        return Inertia::render('RekomendasiTindakan', [
            'observation'     => $observation->load('agriculturalArea'),
            'metrics'         => $metrics,
            'recommendations' => $recommendations,
            'completedIds'    => $completedIds,
        ]);
    }

    // ------------------------------------------------------------------ AGS-24 ST-02

    public function markAsCompleted(Request $request)
    {
        $validated = $request->validate([
            'observation_id'    => 'required|exists:field_observations,id',
            'recommendation_id' => 'required|exists:recommendations,id',
        ]);

        $log = ActionLog::updateOrCreate([
            'user_id'           => Auth::id(),
            'observation_id'    => $validated['observation_id'],
            'recommendation_id' => $validated['recommendation_id'],
        ], [
            'action_type'  => 'completion',
            'performed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tindakan berhasil dicatat sebagai selesai.',
            'log'     => $log,
        ]);
    }

    private function prepareRecommendations(FieldObservation $observation, array $metrics): \Illuminate\Support\Collection
    {
        $area      = $observation->agriculturalArea;
        $templates = Recommendation::all();
        $filtered  = collect();

        foreach ($templates as $template) {
            $shouldInclude = false;
            $sortPriority  = 0;

            switch ($template->category) {
                case 'Proteksi Tanaman':
                    if ($metrics['disease'] > 40) { $shouldInclude = true; $sortPriority = $metrics['disease']; }
                    break;
                case 'Infrastruktur':
                    if ($metrics['puddle'] > 40)  { $shouldInclude = true; $sortPriority = $metrics['puddle']; }
                    break;
                case 'Pemupukan':
                    if ($metrics['drought'] > 40) { $shouldInclude = true; $sortPriority = $metrics['drought']; }
                    break;
                case 'Pencatatan':
                    $shouldInclude = true;
                    $sortPriority  = 10;
                    break;
            }

            if ($shouldInclude) {
                $placeholders = [
                    '{{disease}}'   => $metrics['relevant_disease'],
                    '{{soil_type}}' => $metrics['soil_type'],
                    '{{advice}}'    => $metrics['disease_advice'],
                    '{{location}}'  => $area->location_name ?? 'Lahan Anda',
                ];

                $template->title       = str_replace(array_keys($placeholders), array_values($placeholders), $template->title);
                $template->description = str_replace(array_keys($placeholders), array_values($placeholders), $template->description);

                $details = $template->details;
                if (isset($details['steps'])) {
                    foreach ($details['steps'] as &$step) {
                        $step = str_replace(array_keys($placeholders), array_values($placeholders), $step);
                    }
                }
                $template->details       = $details;
                $template->sort_priority = $sortPriority;

                if ($sortPriority > 75)      { $template->urgency = 'SEGERA'; $template->color = 'red'; }
                elseif ($sortPriority > 40)  { $template->urgency = 'TINGGI'; $template->color = 'amber'; }

                $filtered->push($template);
            }
        }

        return $filtered->sortByDesc('sort_priority')->values();
    }
}
