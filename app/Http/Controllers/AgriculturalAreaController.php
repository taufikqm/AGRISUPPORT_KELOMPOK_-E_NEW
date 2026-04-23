<?php

namespace App\Http\Controllers;

use App\Models\AgriculturalArea;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AgriculturalAreaController extends Controller
{
    /**
     * Menampilkan halaman Kelola Wilayah Lahan.
     * Menggunakan query PostGIS untuk menghitung centroid dan luas.
     */
    public function index()
    {
        $areas = DB::table('agricultural_areas')
            ->where('user_id', Auth::id())
            ->select([
                'id',
                'user_id',
                'name',
                'location_name',
                'area_size',
                'soil_type',
                'notes',
                DB::raw("ST_Y(ST_Centroid(geometry)) as latitude"),
                DB::raw("ST_X(ST_Centroid(geometry)) as longitude"),
                DB::raw("ST_AsGeoJSON(geometry) as geojson"),
                'created_at',
                'updated_at',
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('WilayahLahan', [
            'areas' => $areas,
        ]);
    }

    /**
     * Menyimpan wilayah lahan baru.
     * Menggunakan ST_GeomFromGeoJSON untuk konversi GeoJSON ke Geometry.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'location_name' => 'nullable|string|max:255',
            'area_size'     => 'required|numeric|min:0.01',
            'soil_type' => 'nullable|string|max:255',
            'notes'     => 'nullable|string|max:1000',
            'geojson'   => 'required|string',
        ]);

        $area = DB::table('agricultural_areas')->insertGetId([
            'user_id'    => Auth::id(),
            'name'          => $validated['name'],
            'location_name' => $validated['location_name'] ?? null,
            'area_size'     => $validated['area_size'],
            'soil_type'  => $validated['soil_type'] ?? null,
            'notes'      => $validated['notes'] ?? null,
            'geometry'   => DB::raw("ST_GeomFromGeoJSON('" . $validated['geojson'] . "')"),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->route('wilayah-lahan.index')
            ->with('success', 'Wilayah lahan berhasil ditambahkan.');
    }

    /**
     * Memperbarui wilayah lahan yang ada.
     */
    public function update(Request $request, $id)
    {
        $area = AgriculturalArea::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'location_name' => 'nullable|string|max:255',
            'area_size'     => 'required|numeric|min:0.01',
            'soil_type' => 'nullable|string|max:255',
            'notes'     => 'nullable|string|max:1000',
            'geojson'   => 'nullable|string',
        ]);

        $updateData = [
            'name'          => $validated['name'],
            'location_name' => $validated['location_name'] ?? null,
            'area_size'     => $validated['area_size'],
            'soil_type'  => $validated['soil_type'] ?? null,
            'notes'      => $validated['notes'] ?? null,
            'updated_at' => now(),
        ];

        if (!empty($validated['geojson'])) {
            $updateData['geometry'] = DB::raw("ST_GeomFromGeoJSON('" . $validated['geojson'] . "')");
        }

        DB::table('agricultural_areas')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->update($updateData);

        return redirect()->route('wilayah-lahan.index')
            ->with('success', 'Wilayah lahan berhasil diperbarui.');
    }

    /**
     * Menghapus wilayah lahan.
     */
    public function destroy($id)
    {
        AgriculturalArea::where('user_id', Auth::id())->findOrFail($id)->delete();

        return redirect()->route('wilayah-lahan.index')
            ->with('success', 'Wilayah lahan berhasil dihapus.');
    }
}
