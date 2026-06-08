<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use App\Services\RiskCalculationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * Dashboard Admin (AGS-81).
 *
 * Menampilkan ringkasan platform: statistik agregasi, distribusi risiko lahan,
 * tren observasi mingguan, dan 10 aktivitas observasi terbaru dari semua petani.
 */
class DashboardController extends Controller
{
    public function __construct(private RiskCalculationService $riskService) {}

    public function index()
    {
        return Inertia::render('Admin/Dashboard', [
            'stats'             => $this->buildStats(),
            'riskDistribution'  => $this->buildRiskDistribution(),
            'weeklyTrend'       => $this->buildWeeklyTrend(),
            'recentActivities'  => $this->buildRecentActivities(),
        ]);
    }

    private function buildStats(): array
    {
        return [
            'total_farmers'      => User::where('role', 'petani')->count(),
            'total_areas'        => AgriculturalArea::count(),
            'total_observations' => FieldObservation::count(),
            'total_completed'    => DB::table('action_logs')->where('action_type', 'completion')->count(),
        ];
    }

    private function buildRiskDistribution(): array
    {
        $dist = ['tinggi' => 0, 'sedang' => 0, 'rendah' => 0, 'belum' => 0];

        AgriculturalArea::all('id')->each(function ($area) use (&$dist) {
            $obs = FieldObservation::where('agricultural_area_id', $area->id)
                ->with('agriculturalArea:id,soil_type')
                ->latest('observation_date')
                ->first();

            if (!$obs) {
                $dist['belum']++;
                return;
            }

            $score = $this->riskService->calculateRiskMetrics($obs)['overall'];
            $dist[$score > 70 ? 'tinggi' : ($score > 40 ? 'sedang' : 'rendah')]++;
        });

        return [
            ['name' => 'Rendah',          'value' => $dist['rendah'], 'color' => '#22c55e'],
            ['name' => 'Sedang',          'value' => $dist['sedang'], 'color' => '#f59e0b'],
            ['name' => 'Tinggi',          'value' => $dist['tinggi'], 'color' => '#ef4444'],
            ['name' => 'Belum Observasi', 'value' => $dist['belum'],  'color' => '#64748b'],
        ];
    }

    private function buildWeeklyTrend(): array
    {
        return collect(range(6, 0))->map(function ($weeksAgo) {
            $start = now()->subWeeks($weeksAgo)->startOfWeek(Carbon::MONDAY);
            $end   = $start->copy()->endOfWeek(Carbon::SUNDAY);

            return [
                'week'  => $start->locale('id')->translatedFormat('d M'),
                'count' => FieldObservation::whereBetween('observation_date', [
                    $start->toDateString(),
                    $end->toDateString(),
                ])->count(),
            ];
        })->values()->toArray();
    }

    private function buildRecentActivities(): array
    {
        return FieldObservation::with([
            'agriculturalArea:id,name,soil_type,user_id',
            'agriculturalArea.user:id,name',
        ])
        ->latest('observation_date')
        ->limit(10)
        ->get()
        ->map(function ($obs) {
            $score = $this->riskService->calculateRiskMetrics($obs)['overall'];
            $level = $score > 70 ? 'tinggi' : ($score > 40 ? 'sedang' : 'rendah');

            return [
                'id'             => $obs->id,
                'petani'         => $obs->agriculturalArea?->user?->name ?? '—',
                'lahan'          => $obs->agriculturalArea?->name ?? '—',
                'tanggal'        => $obs->observation_date?->locale('id')->translatedFormat('d M Y') ?? '—',
                'risk_level'     => $level,
                'risk_score'     => (int) round($score),
                'crop_condition' => $obs->crop_condition ?? '—',
            ];
        })
        ->toArray();
    }
}
