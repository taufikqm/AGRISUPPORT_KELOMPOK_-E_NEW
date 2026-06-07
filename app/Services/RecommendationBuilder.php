<?php

namespace App\Services;

use App\Models\FieldObservation;
use App\Models\Recommendation;
use Illuminate\Support\Collection;

/**
 * Membangun daftar rekomendasi tindakan untuk sebuah observasi.
 *
 * Logika ini sebelumnya privat di FieldObservationController; dipindah ke service
 * agar bisa dipakai ulang (mis. menghitung rekomendasi belum selesai di admin).
 */
class RecommendationBuilder
{
    /**
     * @param  array  $metrics  Hasil RiskCalculationService::calculateRiskMetrics().
     */
    public function forObservation(FieldObservation $observation, array $metrics): Collection
    {
        $observation->loadMissing('agriculturalArea');
        $area      = $observation->agriculturalArea;
        $soilType  = $metrics['soil_type'];
        $templates = Recommendation::all()->keyBy('category');

        $candidates = [
            // Penyakit — berdasarkan field disease_indication langsung
            'Penyakit - Berat'  => $observation->disease_indication === 'Berat',
            'Penyakit - Sedang' => $observation->disease_indication === 'Sedang',
            'Penyakit - Ringan' => $observation->disease_indication === 'Ringan',

            // Hama — berdasarkan field pest_indication langsung
            'Hama - Berat'  => $observation->pest_indication === 'Berat',
            'Hama - Sedang' => $observation->pest_indication === 'Sedang',

            // Genangan — berdasarkan field water_puddle langsung
            'Genangan - Banyak'  => $observation->water_puddle === 'Banyak',
            'Genangan - Sedang'  => $observation->water_puddle === 'Sedang',
            'Genangan - Sedikit' => $observation->water_puddle === 'Sedikit',

            // Kekeringan — berdasarkan field soil_moisture langsung
            'Kekeringan - Kering'  => $observation->soil_moisture === 'Kering',
            'Kekeringan - Regosol' => $soilType === 'Regosol' && $metrics['drought'] > 0,

            // Kondisi tanaman — berdasarkan field crop_condition langsung
            'Tanaman - Kritis'      => $observation->crop_condition === 'Kritis',
            'Tanaman - Kurang Baik' => $observation->crop_condition === 'Kurang Baik',

            // Monitoring — selalu ada
            'Monitoring' => true,
        ];

        // Sort priority per kategori (berdasarkan skor risiko aktual)
        $priorities = [
            'Tanaman - Kritis'     => 95,
            'Hama - Berat'         => 90,
            'Penyakit - Berat'     => $metrics['disease'],
            'Genangan - Banyak'    => $metrics['puddle'],
            'Kekeringan - Kering'  => $metrics['drought'],
            'Hama - Sedang'        => 60,
            'Penyakit - Sedang'    => $metrics['disease'],
            'Tanaman - Kurang Baik'=> 55,
            'Genangan - Sedang'    => $metrics['puddle'],
            'Kekeringan - Regosol' => 35,
            'Genangan - Sedikit'   => 20,
            'Penyakit - Ringan'    => 20,
            'Monitoring'           => 5,
        ];

        $placeholders = [
            '{{disease}}'   => $metrics['relevant_disease'],
            '{{soil_type}}' => $soilType,
            '{{advice}}'    => $metrics['disease_advice'],
            '{{location}}'  => $area->location_name ?? $area->name ?? 'Lahan Anda',
        ];

        $filtered = collect();

        foreach ($candidates as $category => $include) {
            if (! $include) continue;
            if (! isset($templates[$category])) continue;

            $template = clone $templates[$category];
            $priority = $priorities[$category] ?? 10;

            $template->title       = str_replace(array_keys($placeholders), array_values($placeholders), $template->title);
            $template->description = str_replace(array_keys($placeholders), array_values($placeholders), $template->description);

            $details = $template->details;
            if (isset($details['steps'])) {
                foreach ($details['steps'] as &$step) {
                    $step = str_replace(array_keys($placeholders), array_values($placeholders), $step);
                }
                unset($step);
            }
            $template->details       = $details;
            $template->sort_priority = $priority;

            $filtered->push($template);
        }

        return $filtered->sortByDesc('sort_priority')->values();
    }
}
