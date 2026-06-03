<?php

namespace App\Http\Controllers;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Services\RiskCalculationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Peta Risiko Lahan (AGS-82).
 *
 * Menampilkan semua lahan milik petani sebagai polygon di peta Leaflet,
 * diwarnai sesuai level risiko dari observasi terbaru tiap lahan.
 */
class RiskMapController extends Controller
{
    public function __construct(private RiskCalculationService $riskService) {}

    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $areas = AgriculturalArea::where('user_id', $userId)
            ->selectRaw("
                id, name, location_name, soil_type,
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

            $score  = null;
            $status = null;
            $level  = null;

            if ($latestObs) {
                $score  = $this->riskService->calculateRiskMetrics($latestObs)['overall'];
                $status = $this->riskService->statusFromOverall($score);
                $level  = $this->levelFromScore($score);
            }

            $summary[$level ?? 'belum']++;

            $meta = $this->levelMeta($level);

            return [
                'id'             => $area->id,
                'name'           => $area->name,
                'location'       => $area->location_name,
                'soil_type'      => $area->soil_type,
                'lat'            => $area->latitude !== null ? (float) $area->latitude : null,
                'lon'            => $area->longitude !== null ? (float) $area->longitude : null,
                'geojson'        => $area->geojson ? json_decode($area->geojson) : null,
                'observation_id' => $latestObs?->id,
                'risk_level'     => $level,                       // tinggi|sedang|rendah|null
                'risk_label'     => $meta['label'],
                'color'          => $meta['color'],
                'score'          => $score !== null ? (int) round($score) : null,
                'status'         => $status,                      // Aman|Waspada|Bahaya|Kritis|null
            ];
        });

        return Inertia::render('PetaRisiko', [
            'areas'       => $areasWithRisk,
            'riskSummary' => $summary,
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

    /** Label & warna untuk tiap level (abu-abu bila belum ada data). */
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
