<?php

namespace App\Http\Controllers;

use App\Models\ActionLog;
use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\Recommendation;
use App\Services\RecommendationBuilder;
use App\Services\RiskCalculationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class FieldObservationController extends Controller
{
    public function __construct(
        private RiskCalculationService $riskService,
        private RecommendationBuilder $recommendationBuilder,
    ) {}
    // ------------------------------------------------------------------ AGS-2 Dashboard

    public function dashboard(Request $request)
    {
        if (Auth::user()->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        $userId  = Auth::id();
        $areas   = AgriculturalArea::where('user_id', $userId)->get(['id', 'name', 'location_name']);
        $areaId  = $request->query('area_id');

        $obsQuery = FieldObservation::where('user_id', $userId)
            ->with('agriculturalArea:id,name,soil_type')
            ->orderBy('observation_date', 'desc')
            ->orderBy('id', 'desc');

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
                'area_name' => optional(optional($log->observation)->agriculturalArea)->name ?? 'Lahan',
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
            $response = Http::connectTimeout(3)->timeout(4)->get('https://api.open-meteo.com/v1/forecast', [
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

        $userId = Auth::id();
        $observation = FieldObservation::create(array_merge($validated, $weatherData, [
            'user_id' => $userId,
        ]));

        Cache::forget("weather_alerts_{$userId}");
        Cache::forget("latest_obs_{$userId}");

        // Picu notifikasi otomatis (cuaca ekstrem, risiko meningkat, rekomendasi baru).
        // Dibungkus try/catch agar kegagalan notifikasi tidak pernah menggagalkan simpan observasi.
        try {
            app(\App\Services\NotificationTriggerService::class)->afterObservation($observation);

            // Beri tahu admin: observasi masuk, dan anomali bila cuaca ekstrem.
            $adminNotifier = app(\App\Services\AdminNotifier::class);
            $adminNotifier->observasiMasuk($observation);
            if (($observation->weather_precip_mm ?? 0) > 10 || ($observation->weather_wind_kph ?? 0) > 60) {
                $adminNotifier->anomaliCuaca($observation);
            }
        } catch (\Throwable $e) {
            report($e);
        }

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
        return $this->riskService->calculateRiskMetrics($observation);
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
                'area_id'        => $obs->agricultural_area_id,
                'area_name'      => $obs->agriculturalArea->name ?? 'Lahan',
                'overall_risk'   => $metrics['overall'],
                'total_recs'     => $recs->count(),
                'completed_count'=> $completed,
            ];
        })
        ->sortByDesc(fn ($i) => [$i['overall_risk'], $i['date']])
        ->values();

        $areas = $items
            ->groupBy('area_id')
            ->map(fn ($group, $id) => [
                'id'    => (int) $id,
                'name'  => $group->first()['area_name'],
                'count' => $group->count(),
            ])
            ->sortByDesc('count')
            ->values();

        return Inertia::render('RekomendasiIndex', [
            'items' => $items,
            'areas' => $areas,
        ]);
    }

    // ------------------------------------------------------------------ AGS-24 ST-01

    public function showRecommendations(FieldObservation $observation)
    {
        if ($observation->user_id !== Auth::id()) {
            abort(403);
        }

        if (is_null($observation->recommendations_viewed_at)) {
            $observation->update(['recommendations_viewed_at' => now()]);
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
        return $this->recommendationBuilder->forObservation($observation, $metrics);
    }
}
