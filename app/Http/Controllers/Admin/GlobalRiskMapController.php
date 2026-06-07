<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use App\Services\RiskCalculationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Peta Risiko Global (Admin) — AGS-93.
 *
 * Menampilkan SELURUH lahan dari SEMUA petani di satu peta Leaflet,
 * diwarnai sesuai level risiko observasi terbaru, agar admin dapat
 * men-triase lahan paling berisiko untuk prioritas intervensi.
 *
 * Data dikirim via Inertia props (bukan API terpisah) — konsisten dgn
 * RiskMapController petani (AGS-82).
 */
class GlobalRiskMapController extends Controller
{
    public function __construct(private RiskCalculationService $riskService) {}

    public function index(Request $request)
    {
        $filters  = $request->only(['petani']);
        $petaniId = $filters['petani'] ?? null;

        $areas = AgriculturalArea::query()
            ->join('users', 'users.id', '=', 'agricultural_areas.user_id')
            ->when($petaniId, fn ($q) => $q->where('agricultural_areas.user_id', $petaniId))
            ->orderBy('users.name')
            ->selectRaw("
                agricultural_areas.id,
                agricultural_areas.name,
                agricultural_areas.location_name,
                agricultural_areas.soil_type,
                agricultural_areas.user_id,
                users.name as owner_name,
                ST_Y(ST_Centroid(geometry)) as latitude,
                ST_X(ST_Centroid(geometry)) as longitude,
                ST_AsGeoJSON(geometry) as geojson
            ")
            ->get();

        $summary = ['tinggi' => 0, 'sedang' => 0, 'rendah' => 0, 'belum' => 0];

        $areasWithRisk = $areas->map(function ($area) use (&$summary) {
            $latestObs = FieldObservation::where('agricultural_area_id', $area->id)
                ->with('agriculturalArea:id,soil_type')
                ->orderByDesc('observation_date')
                ->orderByDesc('id')
                ->first();

            $score = $status = $level = null;
            $dimensions = [];
            $obsDate = $obsAgo = null;
            $isStale = false;

            if ($latestObs) {
                $metrics = $this->riskService->calculateRiskMetrics($latestObs);
                $score   = $metrics['overall'];
                $status  = $this->riskService->statusFromOverall($score);
                $level   = $this->levelFromScore($score);

                $dimensions = [
                    ['label' => 'Kekeringan', 'score' => (int) round($metrics['drought'])],
                    ['label' => 'Genangan',   'score' => (int) round($metrics['puddle'])],
                    ['label' => 'Penyakit',   'score' => (int) round($metrics['disease'])],
                ];

                $obsDate = $latestObs->observation_date?->locale('id')->translatedFormat('d M Y');
                $obsAgo  = $latestObs->observation_date?->locale('id')->diffForHumans();
                $isStale = $latestObs->observation_date?->lt(now()->subDays(14)) ?? false;
            }

            $summary[$level ?? 'belum']++;

            $meta = $this->levelMeta($level);

            return [
                'id'               => $area->id,
                'name'             => $area->name,
                'owner'            => $area->owner_name,
                'owner_id'         => $area->user_id,
                'location'         => $area->location_name,
                'soil_type'        => $area->soil_type,
                'lat'              => $area->latitude !== null ? (float) $area->latitude : null,
                'lon'              => $area->longitude !== null ? (float) $area->longitude : null,
                'geojson'          => $area->geojson ? json_decode($area->geojson) : null,
                'observation_id'   => $latestObs?->id,
                'observation_date' => $obsDate,
                'observation_ago'  => $obsAgo,
                'is_stale'         => $isStale,
                'risk_level'       => $level,
                'risk_label'       => $meta['label'],
                'color'            => $meta['color'],
                'score'            => $score !== null ? (int) round($score) : null,
                'status'           => $status,
                'dimensions'       => $dimensions,
            ];
        })->values();

        $petani = User::where('role', 'petani')
            ->whereHas('agriculturalAreas')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Admin/GlobalRiskMap', [
            'areas'       => $areasWithRisk,
            'riskSummary' => $summary,
            'totalPetani' => $petani->count(),
            'petani'      => $petani,
            'filters'     => $filters,
        ]);
    }

    /** Petakan overall score (0-100) ke level risiko peta. */
    private function levelFromScore(int $score): string
    {
        return match (true) {
            $score > 70 => 'tinggi',
            $score > 40 => 'sedang',
            default     => 'rendah',
        };
    }

    /** Label & warna tiap level (abu-abu bila belum ada observasi). */
    private function levelMeta(?string $level): array
    {
        return match ($level) {
            'tinggi' => ['label' => 'Tinggi', 'color' => '#ef4444'],
            'sedang' => ['label' => 'Sedang', 'color' => '#f59e0b'],
            'rendah' => ['label' => 'Rendah', 'color' => '#22c55e'],
            default  => ['label' => 'Belum Ada Data', 'color' => '#9ca3af'],
        };
    }
}
