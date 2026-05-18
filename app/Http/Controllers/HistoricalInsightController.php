<?php

namespace App\Http\Controllers;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HistoricalInsightController extends Controller
{
    public function index(Request $request)
    {
        $areas = AgriculturalArea::where('user_id', $request->user()->id)
            ->get(['id', 'name']);

        return Inertia::render('InsightHistoris', [
            'areas' => $areas,
        ]);
    }

    public function getHistoricalData(Request $request)
    {
        $userId = $request->user()->id;
        $areaId = $request->query('area_id');
        $year   = $request->query('year', now()->year);
        $range  = $request->query('range');

        if ($areaId) {
            $owns = AgriculturalArea::where('id', $areaId)
                ->where('user_id', $userId)
                ->exists();

            if (! $owns) {
                return response()->json([
                    'data'             => [],
                    'distribusiRisiko' => [],
                    'meta'             => ['total_observasi' => 0],
                ]);
            }
        }

        $query = FieldObservation::where('user_id', $userId);

        if ($areaId) {
            $query->where('agricultural_area_id', (int) $areaId);
        }

        if ($range) {
            $query->where('observation_date', '>=', now()->subDays((int) $range)->toDateString());
        } else {
            $query->whereYear('observation_date', (int) $year);
        }

        $observations = $query->orderBy('observation_date')->get();

        if ($observations->isEmpty()) {
            return response()->json([
                'data'             => [],
                'distribusiRisiko' => [],
                'meta'             => ['total_observasi' => 0],
            ]);
        }

        $grouped   = $observations->groupBy(fn ($obs) => $obs->observation_date->format('Y-m'));
        $trendData = $grouped->map(function ($group, $key) {
            $dt = \Carbon\Carbon::createFromFormat('Y-m', $key);

            return [
                'bulan'      => $dt->format('M Y'),
                'suhu'       => round($group->avg('weather_temp') ?? 0, 1),
                'kelembapan' => round($group->avg('weather_humidity') ?? 0, 1),
                'curahHujan' => round($group->sum('weather_precip_mm') ?? 0, 1),
                'frekuensi'  => $group->count(),
            ];
        })->values();

        $riskCounts = ['Aman' => 0, 'Waspada' => 0, 'Bahaya' => 0, 'Kritis' => 0];
        foreach ($observations as $obs) {
            $score  = $this->quickRiskScore($obs);
            $status = match (true) {
                $score >= 85 => 'Kritis',
                $score > 70  => 'Bahaya',
                $score > 40  => 'Waspada',
                default      => 'Aman',
            };
            $riskCounts[$status]++;
        }

        $distribusi = collect($riskCounts)
            ->map(fn ($jumlah, $status) => ['status' => $status, 'jumlah' => $jumlah])
            ->values();

        return response()->json([
            'data'             => $trendData,
            'distribusiRisiko' => $distribusi,
            'meta'             => ['total_observasi' => $observations->count()],
        ]);
    }

    private function quickRiskScore(FieldObservation $obs): int
    {
        $drought = match ($obs->soil_moisture) {
            'Kering'       => 70,
            'Normal'       => 30,
            'Lembab'       => 10,
            'Sangat Basah' => 0,
            default        => 0,
        };

        $puddle = match ($obs->water_puddle) {
            'Banyak'    => 80,
            'Sedang'    => 50,
            'Sedikit'   => 20,
            'Tidak Ada' => 0,
            default     => 0,
        };

        $disease = match ($obs->disease_indication) {
            'Berat'     => 90,
            'Sedang'    => 60,
            'Ringan'    => 30,
            'Tidak Ada' => 10,
            default     => 10,
        };

        return (int) round(($drought + $puddle + $disease) / 3);
    }
}
