<?php

namespace App\Http\Controllers;

use App\Models\ActionLog;
use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LandHistoryController extends Controller
{
    public function index(Request $request)
    {
        $areas = AgriculturalArea::where('user_id', Auth::id())
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('RiwayatLahan', [
            'areas' => $areas,
        ]);
    }

    public function getData(Request $request)
    {
        $tab    = $request->input('tab', 'observasi');
        $areaId = $request->input('area_id');
        $search = $request->input('search');

        if ($tab === 'rekomendasi') {
            return response()->json([
                'data' => $this->getDataRekomendasi($areaId, $search),
            ]);
        }

        return response()->json([
            'data' => $this->getDataObservasi($tab, $areaId, $search),
        ]);
    }

    private function getDataObservasi(string $tab, ?string $areaId, ?string $search): array
    {
        $query = FieldObservation::with('agriculturalArea')
            ->where('user_id', Auth::id());

        if ($tab === 'validasi') {
            $query->whereNotNull('weather_temp');
        }

        if ($areaId) {
            $query->where('agricultural_area_id', $areaId);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('crop_condition', 'ilike', "%{$search}%")
                  ->orWhere('notes', 'ilike', "%{$search}%")
                  ->orWhereHas('agriculturalArea', fn ($q2) =>
                      $q2->where('name', 'ilike', "%{$search}%")
                  );
            });
        }

        return $query->orderByDesc('observation_date')
            ->get()
            ->map(function ($obs) use ($tab) {
                $skor   = $this->hitungSkorRisiko($obs);
                $status = $this->statusDariSkor($skor);
                $jenis  = match ($tab) {
                    'validasi' => 'Validasi',
                    'risiko'   => 'Risiko',
                    default    => 'Observasi',
                };
                $link = $tab === 'risiko'
                    ? "/analisis-risiko/{$obs->id}"
                    : "/validasi-observasi/{$obs->id}";

                return [
                    'id'        => $obs->id,
                    'tanggal'   => $obs->observation_date?->format('d M Y'),
                    'jenis'     => $jenis,
                    'wilayah'   => $obs->agriculturalArea?->name ?? '-',
                    'ringkasan' => "{$obs->crop_condition}, {$obs->soil_moisture}",
                    'status'    => $status,
                    'skor'      => $tab === 'risiko' ? $skor : null,
                    'link'      => $link,
                ];
            })
            ->toArray();
    }

    private function getDataRekomendasi(?string $areaId, ?string $search): array
    {
        $query = ActionLog::with(['observation.agriculturalArea', 'recommendation'])
            ->where('user_id', Auth::id());

        if ($areaId) {
            $query->whereHas('observation', fn ($q) =>
                $q->where('agricultural_area_id', $areaId)
            );
        }

        if ($search) {
            $query->whereHas('recommendation', fn ($q) =>
                $q->where('title', 'ilike', "%{$search}%")
                  ->orWhere('category', 'ilike', "%{$search}%")
            );
        }

        return $query->orderByDesc('performed_at')
            ->get()
            ->map(fn ($log) => [
                'id'        => $log->id,
                'tanggal'   => $log->performed_at?->format('d M Y'),
                'jenis'     => 'Rekomendasi',
                'wilayah'   => $log->observation?->agriculturalArea?->name ?? '-',
                'ringkasan' => $log->recommendation?->title ?? '-',
                'status'    => 'Selesai',
                'skor'      => null,
                'link'      => "/analisis-risiko/{$log->observation_id}",
            ])
            ->toArray();
    }

    private function hitungSkorRisiko(FieldObservation $obs): int
    {
        $skor = 0;

        $skor += match ($obs->soil_moisture) {
            'Kering'       => 2,
            'Sangat Basah' => 3,
            'Lembab'       => 1,
            default        => 0,
        };

        $skor += match ($obs->water_puddle) {
            'Banyak' => 3,
            'Sedang' => 2,
            'Sedikit' => 1,
            default  => 0,
        };

        $skor += match ($obs->crop_condition) {
            'Kritis'      => 3,
            'Kurang Baik' => 2,
            default       => 0,
        };

        $skor += match ($obs->pest_indication) {
            'Berat'  => 3,
            'Sedang' => 2,
            'Ringan' => 1,
            default  => 0,
        };

        $skor += match ($obs->disease_indication) {
            'Berat'  => 3,
            'Sedang' => 2,
            'Ringan' => 1,
            default  => 0,
        };

        return $skor;
    }

    private function statusDariSkor(int $skor): string
    {
        return match (true) {
            $skor >= 10 => 'Kritis',
            $skor >= 7  => 'Bahaya',
            $skor >= 4  => 'Waspada',
            default     => 'Aman',
        };
    }
}
