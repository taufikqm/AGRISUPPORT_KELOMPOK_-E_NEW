<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
            'auth' => [
                'user' => $request->user(),
                'latest_observation_id' => $request->user()
                    ? Cache::remember("latest_obs_{$request->user()->id}", 60, fn() =>
                        \App\Models\FieldObservation::where('user_id', $request->user()->id)->latest()->value('id')
                    )
                    : null,
            ],
            'weatherAlerts' => $request->user()
                ? Cache::remember("weather_alerts_{$request->user()->id}", 300, fn() =>
                    $this->detectWeatherAlerts($request->user()->id)
                )
                : [],
        ];
    }

    private function detectWeatherAlerts(int $userId): array
    {
        $observations = \App\Models\FieldObservation::where('user_id', $userId)
            ->whereNotNull('weather_precip_mm')
            ->with('agriculturalArea:id,name')
            ->orderBy('observation_date', 'desc')
            ->orderBy('id', 'desc')
            ->get()
            ->uniqueStrict('agricultural_area_id')
            ->take(5);

        $alerts = [];

        foreach ($observations as $obs) {
            $precip   = (float) ($obs->weather_precip_mm ?? 0);
            $wind     = (float) ($obs->weather_wind_kph  ?? 0);
            $temp     = (float) ($obs->weather_temp      ?? 25);
            $humidity = (float) ($obs->weather_humidity  ?? 60);
            $area     = $obs->agriculturalArea->name ?? 'Lahan Anda';

            if ($precip > 10 || $wind > 60) {
                $type  = $precip > 10 ? 'hujan_lebat' : 'angin_kencang';
                $level = 'critical';
            } elseif ($precip > 3 || $humidity > 85 || $temp > 35) {
                if ($precip > 3)    $type = 'hujan_ringan';
                elseif ($temp > 35) $type = 'suhu_tinggi';
                else                $type = 'kelembapan_tinggi';
                $level = 'warning';
            } else {
                continue;
            }

            $alerts[] = [
                'area_id'   => $obs->agricultural_area_id,
                'area_name' => $area,
                'level'     => $level,
                'type'      => $type,
                'message'   => $this->getAlertMessage($type, $area),
                'action'    => $this->getAlertAction($type),
            ];
        }

        return $alerts;
    }

    private function getAlertMessage(string $type, string $area): string
    {
        return match($type) {
            'hujan_lebat'       => "Curah hujan ekstrem terdeteksi di {$area}. Risiko banjir dan kerusakan tanaman sangat tinggi.",
            'angin_kencang'     => "Kecepatan angin berbahaya terdeteksi di {$area}. Tanaman rentan roboh dan patah.",
            'hujan_ringan'      => "Hujan terdeteksi di {$area}. Pastikan drainase lahan berfungsi dengan baik.",
            'suhu_tinggi'       => "Suhu ekstrem terdeteksi di {$area}. Tanaman berisiko mengalami stres panas dan kekeringan.",
            'kelembapan_tinggi' => "Kelembapan sangat tinggi di {$area}. Waspadai perkembangan penyakit jamur pada tanaman.",
            default             => "Kondisi cuaca tidak normal terdeteksi di {$area}.",
        };
    }

    private function getAlertAction(string $type): string
    {
        return match($type) {
            'hujan_lebat'       => 'Segera periksa saluran drainase dan amankan tanaman dari risiko genangan.',
            'angin_kencang'     => 'Pasang penyangga tanaman dan hindari aktivitas di lahan terbuka.',
            'hujan_ringan'      => 'Kurangi irigasi sementara dan pantau kondisi tanah.',
            'suhu_tinggi'       => 'Tingkatkan frekuensi irigasi dan berikan naungan jika memungkinkan.',
            'kelembapan_tinggi' => 'Lakukan pemangkasan untuk sirkulasi udara dan pantau gejala penyakit.',
            default             => 'Pantau kondisi lahan secara berkala.',
        };
    }
}
