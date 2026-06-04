<?php

namespace App\Http\Controllers;

use App\Models\ActionLog;
use App\Models\AgriculturalArea;
use App\Services\PlantingTimeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * Prediksi Waktu Tanam Terbaik (AGS-72).
 *
 * index()   — halaman + daftar lahan petani.
 * analyze() — hitung jendela tanam dari cuaca historis (Open-Meteo) lalu kembalikan JSON,
 *             sekaligus mencatat jadwal ke action_logs (action_type = 'planting_schedule').
 */
class PlantingTimeController extends Controller
{
    public function __construct(private PlantingTimeService $service) {}

    public function index(Request $request)
    {
        $areas = AgriculturalArea::where('user_id', $request->user()->id)
            ->get(['id', 'name', 'location_name']);

        return Inertia::render('WaktuTanam', [
            'areas' => $areas,
        ]);
    }

    public function analyze(Request $request)
    {
        $validated = $request->validate([
            'area_id'   => 'required|exists:agricultural_areas,id',
            'crop_type' => 'nullable|string|in:padi,jagung,kedelai',
        ]);

        $area = AgriculturalArea::findOrFail($validated['area_id']);

        if ($area->user_id !== $request->user()->id) {
            abort(403);
        }

        // Koordinat centroid lahan dari PostGIS.
        $centroid = DB::selectOne(
            'SELECT ST_Y(ST_Centroid(geometry)) AS lat, ST_X(ST_Centroid(geometry)) AS lon
             FROM agricultural_areas WHERE id = ?',
            [$area->id]
        );

        if (! $centroid || $centroid->lat === null || $centroid->lon === null) {
            return response()->json([
                'message'  => 'Lahan ini belum memiliki lokasi peta. Lengkapi dulu di menu Wilayah Lahan.',
                'redirect' => route('wilayah-lahan.index'),
            ], 422);
        }

        $cropType   = $validated['crop_type'] ?? 'padi';
        $prediction = $this->service->predict((float) $centroid->lat, (float) $centroid->lon, $cropType);

        // Catat jadwal tanam (dedup per lahan agar klik berulang tidak menduplikasi).
        ActionLog::firstOrCreate(
            [
                'user_id'              => $request->user()->id,
                'agricultural_area_id' => $area->id,
                'action_type'          => 'planting_schedule',
            ],
            [
                'observation_id'    => null,
                'recommendation_id' => null,
                'performed_at'      => now(),
            ]
        );

        return response()->json([
            'area' => [
                'id'       => $area->id,
                'name'     => $area->name,
                'location' => $area->location_name,
            ],
            'prediction' => $prediction,
        ]);
    }
}
