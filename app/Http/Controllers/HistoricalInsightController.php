<?php

namespace App\Http\Controllers;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Services\RiskCalculationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HistoricalInsightController extends Controller
{
    public function __construct(private RiskCalculationService $riskService) {}

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
        $year   = (int) $request->query('year', now()->year);
        $range  = $request->query('range');

        if ($areaId) {
            $owns = AgriculturalArea::where('id', $areaId)
                ->where('user_id', $userId)
                ->exists();

            if (! $owns) {
                return response()->json($this->emptyResponse());
            }
        }

        $query = FieldObservation::where('user_id', $userId);
        if ($areaId) {
            $query->where('agricultural_area_id', (int) $areaId);
        }
        if ($range) {
            $query->where('observation_date', '>=', now()->subDays((int) $range)->toDateString());
        } else {
            $query->whereYear('observation_date', $year);
        }

        $observations = $query->with('agriculturalArea:id,soil_type')
            ->orderBy('observation_date')
            ->get();

        if ($observations->isEmpty()) {
            return response()->json($this->emptyResponse());
        }

        // Hitung sekali metrics tiap observasi pakai service kanonik
        $scored = $observations->map(function ($obs) {
            $metrics = $this->riskService->calculateRiskMetrics($obs);

            return [
                'observation' => $obs,
                'overall'     => $metrics['overall'],
                'status'      => $this->riskService->statusFromOverall($metrics['overall']),
                'drought'     => $metrics['drought'],
                'puddle'      => $metrics['puddle'],
                'disease'     => $metrics['disease'],
            ];
        });

        // Granularitas adaptif: rentang harian (7/30) dikelompokkan per hari,
        // "Tahun Ini" dikelompokkan per bulan agar tren sesuai skala filter.
        $isDaily = (bool) $range;
        $keyFmt  = $isDaily ? 'Y-m-d' : 'Y-m';

        $grouped = $scored->groupBy(fn ($row) => $row['observation']->observation_date->format($keyFmt));

        $trendData = $grouped->map(function ($group, $key) use ($isDaily, $keyFmt) {
            $dt  = Carbon::createFromFormat($keyFmt, $key);
            $obs = $group->pluck('observation');

            return [
                'bulan'      => $isDaily ? $dt->translatedFormat('d M Y') : $dt->translatedFormat('M Y'),
                'bulanShort' => $isDaily ? $dt->translatedFormat('d M')   : $dt->translatedFormat('M'),
                'suhu'       => round($obs->avg('weather_temp') ?? 0, 1),
                'kelembapan' => round($obs->avg('weather_humidity') ?? 0, 1),
                'curahHujan' => round($obs->sum('weather_precip_mm') ?? 0, 1),
                'riskIndex'  => (int) round($group->avg('overall')),
                'frekuensi'  => $group->count(),
            ];
        })->values();

        $riskCounts = ['Aman' => 0, 'Waspada' => 0, 'Bahaya' => 0, 'Kritis' => 0];
        foreach ($scored as $row) {
            $riskCounts[$row['status']]++;
        }
        $distribusi = collect($riskCounts)
            ->map(fn ($jumlah, $status) => ['status' => $status, 'jumlah' => $jumlah])
            ->values();

        $kpiMetrics = $this->calculateKpiMetrics($trendData, $observations);
        $insights   = $this->generateInsights($trendData, $observations);

        return response()->json([
            'data'             => $trendData,
            'distribusiRisiko' => $distribusi,
            'kpiMetrics'       => $kpiMetrics,
            'insights'         => $insights,
            'meta'             => ['total_observasi' => $observations->count()],
        ]);
    }

    private function emptyResponse(): array
    {
        return [
            'data'             => [],
            'distribusiRisiko' => [],
            'kpiMetrics'       => null,
            'insights'         => null,
            'meta'             => ['total_observasi' => 0],
        ];
    }

    private function calculateKpiMetrics($trendData, $observations): array
    {
        $totalRain   = $trendData->sum('curahHujan');
        $avgHumidity = $trendData->avg('kelembapan') ?? 0;
        $avgRisk     = $trendData->avg('riskIndex') ?? 0;

        $months    = $trendData->count();
        $rainTrend = 0;
        if ($months >= 2) {
            $half           = intdiv($months, 2);
            $firstHalfRain  = $trendData->take($half)->sum('curahHujan');
            $secondHalfRain = $trendData->slice($half)->sum('curahHujan');
            $rainTrend = $firstHalfRain > 0
                ? (int) round((($secondHalfRain - $firstHalfRain) / $firstHalfRain) * 100)
                : 0;
        }

        $humidityStatus = match (true) {
            $avgHumidity >= 85 => 'Tinggi',
            $avgHumidity >= 65 => 'Stabil',
            $avgHumidity > 0   => 'Rendah',
            default            => 'Tidak Ada Data',
        };

        $riskTrend = 0;
        if ($trendData->count() >= 2) {
            $firstRisk = $trendData->first()['riskIndex'] ?? 0;
            $lastRisk  = $trendData->last()['riskIndex'] ?? 0;
            $riskTrend = $firstRisk > 0
                ? (int) round((($lastRisk - $firstRisk) / $firstRisk) * 100)
                : 0;
        }

        $resilienceScore = max(0, 100 - (int) round($avgRisk));
        $resilienceBadge = match (true) {
            $resilienceScore >= 80 => 'Optimis',
            $resilienceScore >= 60 => 'Waspada',
            default                => 'Kritis',
        };

        return [
            'totalRain'       => round($totalRain, 1),
            'rainBadge'       => ($rainTrend >= 0 ? '+' : '') . $rainTrend . '% vs Awal',
            'avgHumidity'     => round($avgHumidity, 1),
            'humidityBadge'   => $humidityStatus,
            'avgRisk'         => (int) round($avgRisk),
            'riskBadge'       => ($riskTrend >= 0 ? '+' : '') . $riskTrend . '% vs Awal',
            'resilienceScore' => $resilienceScore,
            'resilienceBadge' => $resilienceBadge,
        ];
    }

    private function generateInsights($trendData, $observations): array
    {
        $highRainMonths = $trendData
            ->filter(fn ($m) => $m['curahHujan'] > 200)
            ->pluck('bulanShort')
            ->values();

        $highTempMonths = $trendData
            ->filter(fn ($m) => $m['suhu'] > 32)
            ->pluck('bulanShort')
            ->values();

        $criticalMonths = $trendData
            ->filter(fn ($m) => $m['riskIndex'] >= 55)
            ->pluck('bulanShort')
            ->values();

        $peakRisk = $trendData->sortByDesc('riskIndex')->first();
        $avgHumidity = $trendData->avg('kelembapan') ?? 0;

        $summaryText = 'Berdasarkan data periode ini, ';
        if ($highRainMonths->count() >= 2 && $avgHumidity > 80) {
            $summaryText .= 'lahan Anda cenderung mengalami lonjakan risiko penyakit jamur saat curah hujan tinggi (>200mm) bertepatan dengan kelembapan di atas 80%.';
        } elseif ($peakRisk && $peakRisk['riskIndex'] >= 55) {
            $summaryText .= 'lahan Anda menunjukkan puncak risiko di bulan ' . $peakRisk['bulanShort'] . ' yang perlu diantisipasi dengan langkah mitigasi dini.';
        } else {
            $summaryText .= 'lahan Anda dalam kondisi relatif stabil dengan risiko agro-klimat yang terkendali.';
        }

        $obsCount = $observations->count();
        $accuracy = min(95, 50 + $obsCount * 3);

        $puddleReports = $observations->filter(fn ($o) => $o->water_puddle && $o->water_puddle !== 'Tidak Ada')->count();
        $diseaseReports = $observations->filter(fn ($o) => $o->disease_indication && $o->disease_indication !== 'Tidak Ada')->count();
        $pestReports = $observations->filter(fn ($o) => $o->pest_indication && $o->pest_indication !== 'Tidak Ada')->count();
        $goodCrops = $observations->filter(fn ($o) => in_array($o->crop_condition, ['Baik', 'Sangat Baik']))->count();
        $optimalHumidityMonths = $trendData
            ->filter(fn ($m) => $m['kelembapan'] >= 70 && $m['kelembapan'] <= 80)
            ->pluck('bulanShort')
            ->values();

        $puddleInsight = $puddleReports > 0
            ? "Tercatat {$puddleReports} laporan genangan dalam periode ini. "
              . ($highRainMonths->count() > 0
                  ? 'Genangan meningkat saat curah hujan tinggi di bulan ' . $highRainMonths->implode(', ') . '. Pertimbangkan perbaikan drainase.'
                  : 'Pertimbangkan perbaikan drainase untuk mengurangi risiko genangan.')
            : 'Tidak ada laporan genangan signifikan. Sistem drainase lahan berfungsi baik.';

        $diseaseInsight = $diseaseReports > 0
            ? "Terdapat {$diseaseReports} laporan indikasi penyakit. "
              . ($highTempMonths->count() > 0
                  ? 'Korelasi dengan suhu tinggi (>32°C) di bulan ' . $highTempMonths->implode(', ') . '. Aplikasi fungisida preventif disarankan.'
                  : 'Pemantauan berkala dan fungisida preventif direkomendasikan.')
            : 'Tidak ada indikasi penyakit signifikan. Kondisi tanaman sehat.';

        $productivityInsight = $obsCount > 0
            ? "Dari {$obsCount} observasi, {$goodCrops} menunjukkan kondisi tanaman baik. "
              . ($obsCount > 0 && $goodCrops / max($obsCount, 1) > 0.6
                  ? 'Pola tanam saat ini stabil dan disarankan dipertahankan.'
                  : 'Evaluasi pola tanam dan pemupukan diperlukan untuk meningkatkan produktivitas.')
            : 'Belum ada observasi cukup untuk analisis produktivitas.';

        $fertilizerInsight = $optimalHumidityMonths->count() > 0
            ? 'Aplikasi pupuk paling efektif saat kelembapan 70-80%. Bulan ideal: ' . $optimalHumidityMonths->implode(', ') . '.'
            : 'Kelembapan di luar rentang optimal (70-80%) untuk pemupukan. Sesuaikan jadwal aplikasi pupuk.';

        return [
            'summary' => [
                'text'           => $summaryText,
                'criticalMonths' => $criticalMonths->count() > 0
                    ? 'Bulan Kritis: ' . $criticalMonths->implode(' - ')
                    : 'Tidak ada bulan kritis teridentifikasi',
                'accuracy'       => 'Akurasi Prediksi: ' . $accuracy . '%',
            ],
            'cards' => [
                ['title' => 'Pola Genangan',      'icon' => 'water',        'text' => $puddleInsight],
                ['title' => 'Anomali Hawar Daun', 'icon' => 'leaf',         'text' => $diseaseInsight],
                ['title' => 'Produktivitas Lahan','icon' => 'productivity', 'text' => $productivityInsight],
                ['title' => 'Efisiensi Pupuk',    'icon' => 'fertilizer',   'text' => $fertilizerInsight],
            ],
        ];
    }
}
