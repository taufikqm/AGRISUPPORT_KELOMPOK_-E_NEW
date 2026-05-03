<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
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
            'auth' => [
                'user' => $request->user(),
                'latest_observation_id' => $request->user() ? \App\Models\FieldObservation::where('user_id', $request->user()->id)->latest()->value('id') : null,
            ],
            'weatherAlerts' => $request->user() ? $this->detectWeatherAlerts($request->user()->id) : [],
        ];
    }

    private function detectWeatherAlerts(int $userId): array
    {
        $observations = \App\Models\FieldObservation::where('user_id', $userId)
            ->whereNotNull('weather_precip_mm')
            ->with('agriculturalArea:id,name')
            ->latest('observation_date')
            ->get()
            ->unique('agricultural_area_id')
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
                'area_name' => $area,
                'level'     => $level,
                'type'      => $type,
            ];
        }

        return $alerts;
    }
}
