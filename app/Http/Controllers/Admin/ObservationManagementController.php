<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Manajemen Observasi (Admin) — AGS-91 (ST-02).
 *
 * index()   — semua observasi dari semua petani, filter by petani / lahan / tanggal.
 * update()  — edit data observasi (kondisi lapangan).
 * destroy() — hapus observasi (action_logs terkait ikut terhapus via cascade DB).
 *
 * Detail observasi lengkap dimuat lazy via ?detail_id= (partial reload).
 */
class ObservationManagementController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['petani', 'lahan', 'tanggal']);

        $query = FieldObservation::query()
            ->with(['user:id,name', 'agriculturalArea:id,name']);

        if ($petaniId = ($filters['petani'] ?? null)) {
            $query->where('user_id', $petaniId);
        }
        if ($lahanId = ($filters['lahan'] ?? null)) {
            $query->where('agricultural_area_id', $lahanId);
        }
        if ($tanggal = ($filters['tanggal'] ?? null)) {
            $query->whereDate('observation_date', $tanggal);
        }

        $observations = $query->latest('observation_date')
            ->latest('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (FieldObservation $o) => [
                'id'                 => $o->id,
                'observation_date'   => $o->observation_date,
                'petani'             => $o->user?->name,
                'lahan'              => $o->agriculturalArea?->name,
                'crop_condition'     => $o->crop_condition,
                'pest_indication'    => $o->pest_indication,
                'disease_indication' => $o->disease_indication,
            ]);

        $petani = User::where('role', 'petani')
            ->whereHas('fieldObservations')
            ->orderBy('name')
            ->get(['id', 'name']);

        $lahan = AgriculturalArea::orderBy('name')->get(['id', 'name', 'user_id']);

        $detailId = $request->integer('detail_id') ?: null;

        return Inertia::render('Admin/ObservationManagement', [
            'observations' => $observations,
            'petani'       => $petani,
            'lahan'        => $lahan,
            'filters'      => $filters,
            'detail'       => fn () => $detailId ? $this->buildObservationDetail($detailId) : null,
        ]);
    }

    /** Detail lengkap satu observasi (semua field termasuk cuaca snapshot). */
    private function buildObservationDetail(int $id): ?array
    {
        $o = FieldObservation::with(['user:id,name,email', 'agriculturalArea:id,name'])->find($id);
        if (! $o) {
            return null;
        }

        return [
            'id'                 => $o->id,
            'petani'             => $o->user?->name,
            'petani_email'       => $o->user?->email,
            'lahan'              => $o->agriculturalArea?->name,
            'observation_date'   => $o->observation_date,
            'planting_cycle'     => $o->planting_cycle,
            'soil_moisture'      => $o->soil_moisture,
            'water_puddle'       => $o->water_puddle,
            'crop_condition'     => $o->crop_condition,
            'pest_indication'    => $o->pest_indication,
            'disease_indication' => $o->disease_indication,
            'notes'              => $o->notes,
            'weather' => [
                'temp'          => $o->weather_temp,
                'humidity'      => $o->weather_humidity,
                'wind_kph'      => $o->weather_wind_kph,
                'precip_mm'     => $o->weather_precip_mm,
                'soil_moisture' => $o->weather_soil_moisture,
            ],
        ];
    }

    public function update(Request $request, FieldObservation $observation): RedirectResponse
    {
        $validated = $request->validate([
            'observation_date'   => ['required', 'date'],
            'planting_cycle'     => ['nullable', 'string', 'max:50'],
            'soil_moisture'      => ['nullable', 'string', 'max:50'],
            'water_puddle'       => ['nullable', 'string', 'max:50'],
            'crop_condition'     => ['nullable', 'string', 'max:50'],
            'pest_indication'    => ['nullable', 'string', 'max:50'],
            'disease_indication' => ['nullable', 'string', 'max:50'],
            'notes'              => ['nullable', 'string', 'max:2000'],
        ]);

        $observation->update($validated);

        return back()->with('success', 'Data observasi berhasil diperbarui.');
    }

    public function destroy(FieldObservation $observation): RedirectResponse
    {
        // action_logs terkait ikut terhapus via FK cascade di database.
        $observation->delete();

        return back()->with('success', 'Observasi berhasil dihapus.');
    }
}
