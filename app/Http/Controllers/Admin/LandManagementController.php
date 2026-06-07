<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgriculturalArea;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Manajemen Lahan (Admin) — AGS-91 (ST-01).
 *
 * index()   — semua lahan dari semua petani, filter by petani + search nama lahan.
 * update()  — edit data lahan (nama, lokasi, luas, jenis tanah, catatan).
 * destroy() — hapus lahan (observasi & action_logs ikut terhapus via cascade DB).
 *
 * Detail lahan + riwayat observasi dimuat lazy via ?detail_id= (partial reload).
 */
class LandManagementController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'petani']);

        $query = AgriculturalArea::query()
            ->with('user:id,name')
            ->withCount('fieldObservations');

        if ($search = ($filters['search'] ?? null)) {
            $query->where('name', 'ilike', "%{$search}%");
        }
        if ($petaniId = ($filters['petani'] ?? null)) {
            $query->where('user_id', $petaniId);
        }

        $areas = $query->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (AgriculturalArea $a) => [
                'id'                 => $a->id,
                'name'               => $a->name,
                'location_name'      => $a->location_name,
                'area_size'          => $a->area_size,
                'soil_type'          => $a->soil_type,
                'owner'              => $a->user?->name,
                'owner_id'           => $a->user_id,
                'observations_count' => $a->field_observations_count,
            ]);

        $petani = \App\Models\User::where('role', 'petani')
            ->whereHas('agriculturalAreas')
            ->orderBy('name')
            ->get(['id', 'name']);

        $detailId = $request->integer('detail_id') ?: null;

        return Inertia::render('Admin/LandManagement', [
            'areas'   => $areas,
            'petani'  => $petani,
            'filters' => $filters,
            'detail'  => fn () => $detailId ? $this->buildLandDetail($detailId) : null,
        ]);
    }

    /** Detail satu lahan + riwayat observasinya. */
    private function buildLandDetail(int $areaId): ?array
    {
        $area = AgriculturalArea::with('user:id,name,email')->find($areaId);
        if (! $area) {
            return null;
        }

        $observations = $area->fieldObservations()
            ->latest('observation_date')
            ->get(['id', 'observation_date', 'crop_condition', 'soil_moisture', 'water_puddle', 'pest_indication', 'disease_indication']);

        return [
            'area' => [
                'id'            => $area->id,
                'name'          => $area->name,
                'location_name' => $area->location_name,
                'area_size'     => $area->area_size,
                'soil_type'     => $area->soil_type,
                'notes'         => $area->notes,
                'owner'         => $area->user?->name,
                'owner_email'   => $area->user?->email,
                'created_at'    => $area->created_at,
            ],
            'observations' => $observations->map(fn ($o) => [
                'id'                 => $o->id,
                'observation_date'   => $o->observation_date,
                'crop_condition'     => $o->crop_condition,
                'soil_moisture'      => $o->soil_moisture,
                'water_puddle'       => $o->water_puddle,
                'pest_indication'    => $o->pest_indication,
                'disease_indication' => $o->disease_indication,
            ]),
        ];
    }

    public function update(Request $request, AgriculturalArea $area): RedirectResponse
    {
        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'location_name' => ['nullable', 'string', 'max:255'],
            'area_size'     => ['nullable', 'numeric', 'min:0'],
            'soil_type'     => ['nullable', 'string', 'max:255'],
            'notes'         => ['nullable', 'string', 'max:2000'],
        ]);

        $area->update($validated);

        return back()->with('success', 'Data lahan berhasil diperbarui.');
    }

    public function destroy(AgriculturalArea $area): RedirectResponse
    {
        // Observasi & action_logs terkait ikut terhapus via FK cascade di database.
        $area->delete();

        return back()->with('success', 'Lahan berhasil dihapus beserta seluruh observasinya.');
    }
}
