<?php

namespace App\Http\Controllers;

use App\Models\AgriculturalArea;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class WeatherController extends Controller
{
    public function index()
    {
        $areas = DB::table('agricultural_areas')
            ->where('user_id', Auth::id())
            ->select([
                'id',
                'name',
                'location_name',
                DB::raw("ST_Y(ST_Centroid(geometry)) as latitude"),
                DB::raw("ST_X(ST_Centroid(geometry)) as longitude"),
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('CuacaPrediksi', [
            'areas' => $areas,
        ]);
    }

    public function getWeather(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lon' => 'required|numeric',
        ]);

        try {
            $response = Http::withoutVerifying()
                ->withOptions(['curl' => [CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4]])
                ->get('https://api.open-meteo.com/v1/forecast', [
                    'latitude'  => $request->lat,
                    'longitude' => $request->lon,
                    'current'   => 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
                    'hourly'    => 'temperature_2m,precipitation_probability,weather_code',
                    'daily'     => 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
                    'timezone'  => 'auto',
                ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json(['error' => 'Gagal mengambil data cuaca.'], $response->status());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Koneksi ke API cuaca gagal: ' . $e->getMessage()], 500);
        }
    }
}
