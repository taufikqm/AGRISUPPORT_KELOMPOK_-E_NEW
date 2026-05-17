<?php

namespace App\Services;

use App\Models\FieldObservation;

class RiskCalculationService
{
    public function calculateRiskMetrics(FieldObservation $observation): array
    {
        $observation->loadMissing('agriculturalArea');
        $area     = $observation->agriculturalArea;
        $soilType = $area->soil_type ?? 'Lainnya';

        // 1. Risiko Kekeringan
        $droughtScore = match ($observation->soil_moisture) {
            'Kering'       => 70,
            'Normal'       => 30,
            'Lembab'       => 10,
            'Sangat Basah' => 0,
            default        => 0,
        };
        if ($observation->weather_soil_moisture !== null) {
            if ($observation->weather_soil_moisture < 0.20)     $droughtScore += 30;
            elseif ($observation->weather_soil_moisture < 0.30) $droughtScore += 15;
        }
        if ($soilType === 'Regosol') $droughtScore += 10;
        $droughtScore = min(100, max(0, $droughtScore));

        // 2. Risiko Genangan
        $puddleScore = match ($observation->water_puddle) {
            'Banyak'    => 80,
            'Sedang'    => 50,
            'Sedikit'   => 20,
            'Tidak Ada' => 0,
            default     => 0,
        };
        if (($observation->weather_precip_mm ?? 0) > 10) $puddleScore += 20;
        if ($soilType === 'Aluvial' && $observation->water_puddle !== 'Tidak Ada') {
            $puddleScore = max($puddleScore, 90);
        }
        $puddleScore = min(100, max(0, $puddleScore));

        // 3. Risiko Penyakit
        $diseaseScore = match ($observation->disease_indication) {
            'Berat'     => 90,
            'Sedang'    => 60,
            'Ringan'    => 30,
            'Tidak Ada' => 10,
            default     => 10,
        };

        $relevantDisease = 'Penyakit Umum';
        $diseaseAdvice   = 'Lakukan observasi rutin untuk mencegah penyebaran organisme pengganggu tanaman.';

        if ($soilType === 'Andosol') {
            $relevantDisease = 'Hawar Daun';
            if (($observation->weather_temp ?? 0) >= 15 && ($observation->weather_temp ?? 0) <= 22
                && ($observation->weather_humidity ?? 0) > 90) {
                $diseaseScore  = max($diseaseScore, 85);
                $diseaseAdvice = 'Kondisi suhu sejuk dan kelembapan tinggi sangat berisiko memicu Hawar Daun pada tanah Andosol.';
            }
        } elseif ($soilType === 'Aluvial') {
            $relevantDisease = 'Blas & Busuk Akar';
            if ($puddleScore > 70 || ($observation->weather_precip_mm ?? 0) > 15) {
                $diseaseScore  = max($diseaseScore, 90);
                $diseaseAdvice = 'Tanah Aluvial cenderung menyimpan air, waspadai Busuk Akar akibat kelembapan tanah yang ekstrem.';
            }
        } elseif ($soilType === 'Podsolik') {
            $relevantDisease = 'Akar Gada';
            if ($observation->soil_moisture === 'Sangat Basah'
                || ($observation->weather_soil_moisture ?? 0) > 0.45) {
                $diseaseScore  = max($diseaseScore, 80);
                $diseaseAdvice = 'Waspadai Akar Gada pada tanah Podsolik saat kondisi lahan sangat basah atau jenuh air.';
            }
        } elseif (in_array($soilType, ['Latosol', 'Grumusol'])) {
            $relevantDisease = 'Layu Fusarium';
            if (($observation->weather_soil_moisture ?? 0) > 0.40
                || $observation->water_puddle !== 'Tidak Ada') {
                $diseaseScore  = max($diseaseScore, 85);
                $diseaseAdvice = 'Jamur Fusarium berkembang pesat pada tanah Latosol/Grumusol yang jenuh air.';
            }
        }
        $diseaseScore = min(100, max(0, $diseaseScore));

        $overallRisk = (int) round(($droughtScore + $puddleScore + $diseaseScore) / 3);
        $readiness   = 100 - $overallRisk;

        $summary = 'Analisis sistem menunjukkan ';
        if ($overallRisk > 70)     $summary .= 'risiko tinggi pada lahan Anda. ';
        elseif ($overallRisk > 40) $summary .= 'potensi gangguan yang memerlukan perhatian. ';
        else                       $summary .= 'kondisi lahan yang stabil berdasarkan data saat ini. ';
        if ($soilType === 'Regosol') $summary .= 'Karakteristik tanah Regosol yang berpasir memerlukan manajemen irigasi lebih sering. ';
        if ($diseaseScore >= 80)     $summary .= "Terdeteksi pemicu lingkungan untuk $relevantDisease. ";
        if ($puddleScore  >= 70)     $summary .= 'Data cuaca mendukung potensi genangan air. ';

        return [
            'drought'          => $droughtScore,
            'puddle'           => $puddleScore,
            'disease'          => $diseaseScore,
            'overall'          => $overallRisk,
            'readiness'        => $readiness,
            'summary'          => $summary,
            'soil_type'        => $soilType,
            'relevant_disease' => $relevantDisease,
            'disease_advice'   => $diseaseAdvice,
        ];
    }

    /**
     * Memetakan skor overall (0–100) ke label status yang konsisten
     * dengan tampilan RiskCircle di AnalisisRisiko:
     *   > 70  → Bahaya / Kritis (merah)
     *   > 40  → Waspada (kuning)
     *   ≤ 40  → Aman (hijau)
     */
    public function statusFromOverall(int $overall): string
    {
        return match (true) {
            $overall >= 85 => 'Kritis',
            $overall > 70  => 'Bahaya',
            $overall > 40  => 'Waspada',
            default        => 'Aman',
        };
    }
}
