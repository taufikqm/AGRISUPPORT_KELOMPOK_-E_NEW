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

    public function showRecommendations(FieldObservation $observation)
    {
        abort_if($observation->user_id !== Auth::id(), 403);

        $observation->load('agriculturalArea:id,name,soil_type');

        $riskAnalysis   = $this->calculateRisk($observation);
        $completedIds   = ActionLog::where('user_id', Auth::id())
            ->where('observation_id', $observation->id)
            ->pluck('recommendation_id')
            ->all();

        $disease  = $riskAnalysis['disease_name'];
        $location = $observation->agriculturalArea->name;
        $soilType = $observation->agriculturalArea->soil_type ?? 'umum';

        $scoreByCategory = [
            'Proteksi Tanaman' => $riskAnalysis['disease_risk']['score'],
            'Infrastruktur'    => $riskAnalysis['flood_risk']['score'],
            'Pemupukan'        => $riskAnalysis['drought_risk']['score'],
            'Pencatatan'       => 0,
        ];

        $recommendations = Recommendation::all()
            ->filter(fn($rec) => $rec->category === 'Pencatatan' || ($scoreByCategory[$rec->category] ?? 0) > 40)
            ->map(function ($rec) use ($disease, $location, $soilType, $scoreByCategory, $completedIds) {
                $score = $scoreByCategory[$rec->category] ?? 0;

                $urgency = match(true) {
                    $score > 75 => 'SEGERA',
                    $score > 40 => 'TINGGI',
                    default     => $rec->urgency,
                };
                $color = match($urgency) {
                    'SEGERA' => 'red',
                    'TINGGI' => 'amber',
                    default  => 'green',
                };

                $replace = fn(string $text) => str_replace(
                    ['{{disease}}', '{{location}}', '{{soil_type}}'],
                    [$disease, $location, $soilType],
                    $text
                );

                $details = $rec->details ?? [];
                $steps   = array_map($replace, $details['steps'] ?? []);
                $tools   = $details['tools'] ?? [];

                return [
                    'id'           => $rec->id,
                    'category'     => $rec->category,
                    'title'        => $replace($rec->title),
                    'description'  => $replace($rec->description),
                    'urgency'      => $urgency,
                    'color'        => $color,
                    'steps'        => $steps,
                    'tools'        => $tools,
                    'is_completed' => in_array($rec->id, $completedIds),
                ];
            })
            ->sortBy(fn($rec) => match($rec['urgency']) {
                'SEGERA'    => 0,
                'TINGGI'    => 1,
                'TERENCANA' => 2,
                default     => 3,
            })
            ->values()
            ->all();

        return Inertia::render('RekomendasiTindakan', [
            'observation'     => $observation,
            'riskAnalysis'    => $riskAnalysis,
            'recommendations' => $recommendations,
        ]);
    }

    public function markAsCompleted(Request $request)
    {
        $validated = $request->validate([
            'observation_id'    => 'required|exists:field_observations,id',
            'recommendation_id' => 'required|exists:recommendations,id',
        ]);

        $observation = FieldObservation::where('id', $validated['observation_id'])
            ->where('user_id', Auth::id())
            ->firstOrFail();

        ActionLog::updateOrCreate(
            [
                'user_id'           => Auth::id(),
                'observation_id'    => $observation->id,
                'recommendation_id' => $validated['recommendation_id'],
            ],
            [
                'action_type'  => 'completion',
                'performed_at' => now(),
            ]
        );

        return response()->json(['status' => 'ok']);
    }

}
