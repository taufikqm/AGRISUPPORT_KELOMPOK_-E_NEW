<?php

namespace App\Services;

use App\Models\FieldObservation;
use App\Models\User;
use App\Notifications\FarmerNotification;

/**
 * Memicu notifikasi otomatis untuk petani (AGS-87).
 *
 * Logika trigger dipisah dari controller agar:
 *  - mudah diuji secara langsung (deterministik, tanpa HTTP Open-Meteo),
 *  - pemanggilan di controller bisa dibungkus try/catch sehingga kegagalan
 *    notifikasi tidak pernah mengganggu alur penyimpanan observasi.
 */
class NotificationTriggerService
{
    /** Urutan level risiko untuk mendeteksi kenaikan. */
    private const RISK_RANK = ['Aman' => 0, 'Waspada' => 1, 'Bahaya' => 2, 'Kritis' => 3];

    public function __construct(private RiskCalculationService $riskService) {}

    /**
     * Dipanggil setelah satu observasi baru tersimpan.
     * Mengevaluasi & membuat notifikasi cuaca ekstrem, risiko meningkat,
     * dan rekomendasi baru bila kondisinya terpenuhi.
     */
    public function afterObservation(FieldObservation $observation): void
    {
        $user = $observation->user;
        if (! $user) {
            return;
        }

        $observation->loadMissing('agriculturalArea');
        $areaName = $observation->agriculturalArea->name ?? 'Lahan Anda';

        $this->cuacaEkstrem($observation, $user, $areaName);
        $this->risikoMeningkat($observation, $user, $areaName);
        $this->rekomendasiBaru($observation, $user, $areaName);
    }

    private function cuacaEkstrem(FieldObservation $observation, User $user, string $areaName): void
    {
        $precip = (float) ($observation->weather_precip_mm ?? 0);
        $wind   = (float) ($observation->weather_wind_kph ?? 0);

        if ($precip <= 10 && $wind <= 60) {
            return;
        }

        $penyebab = $precip > 10 ? 'Curah hujan ekstrem' : 'Angin kencang';

        $user->notify(new FarmerNotification(
            type: 'cuaca_ekstrem',
            title: "Peringatan cuaca ekstrem - {$areaName}",
            message: "{$penyebab} terdeteksi di {$areaName}. Periksa drainase dan amankan tanaman Anda.",
            url: route('analisis-risiko.show', $observation->id),
        ));
    }

    private function risikoMeningkat(FieldObservation $observation, User $user, string $areaName): void
    {
        $previous = FieldObservation::where('agricultural_area_id', $observation->agricultural_area_id)
            ->where('id', '!=', $observation->id)
            ->with('agriculturalArea')
            ->orderByDesc('observation_date')
            ->orderByDesc('id')
            ->first();

        if (! $previous) {
            return;
        }

        $statusBaru = $this->riskService->statusFromOverall(
            $this->riskService->calculateRiskMetrics($observation)['overall']
        );
        $statusLama = $this->riskService->statusFromOverall(
            $this->riskService->calculateRiskMetrics($previous)['overall']
        );

        if ((self::RISK_RANK[$statusBaru] ?? 0) <= (self::RISK_RANK[$statusLama] ?? 0)) {
            return;
        }

        $user->notify(new FarmerNotification(
            type: 'risiko_meningkat',
            title: "Risiko {$areaName} meningkat",
            message: "Status risiko {$areaName} naik dari {$statusLama} ke {$statusBaru}. Tinjau rekomendasi tindakan.",
            url: route('analisis-risiko.show', $observation->id),
        ));
    }

    private function rekomendasiBaru(FieldObservation $observation, User $user, string $areaName): void
    {
        $user->notify(new FarmerNotification(
            type: 'rekomendasi_baru',
            title: "Rekomendasi baru untuk {$areaName}",
            message: "Tersedia rekomendasi tindakan terbaru berdasarkan observasi {$areaName}.",
            url: route('rekomendasi-tindakan.show', $observation->id),
        ));
    }
}
