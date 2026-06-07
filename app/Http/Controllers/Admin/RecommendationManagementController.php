<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActionLog;
use App\Models\AgriculturalArea;
use App\Models\Recommendation;
use App\Models\User;
use App\Notifications\FarmerNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Manajemen Rekomendasi (Admin) — AGS-92.
 *
 * index()   — daftar action_logs ber-recommendation (sistem + manual), filter petani & status.
 * store()   — tambah rekomendasi manual ke petani tertentu + kirim notifikasi in-app.
 * update()  — edit isi rekomendasi manual (hanya action_type='manual').
 * destroy() — hapus rekomendasi manual beserta Recommendation record-nya.
 */
class RecommendationManagementController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['petani', 'status']);

        $query = ActionLog::query()
            ->whereNotNull('recommendation_id')
            ->with([
                'user:id,name,email',
                'recommendation:id,title,category,urgency,color,description',
                'observation.agriculturalArea:id,name',
                'agriculturalArea:id,name',
            ])
            ->latest('performed_at');

        if ($filters['petani'] ?? null) {
            $query->where('user_id', $filters['petani']);
        }
        if ($filters['status'] ?? null) {
            $query->where('action_type', $filters['status']);
        }

        $logs   = $query->paginate(20)->withQueryString();
        $petani = User::where('role', 'petani')->orderBy('name')->get(['id', 'name', 'email']);
        $areas  = AgriculturalArea::whereIn('user_id', $petani->pluck('id'))
            ->orderBy('name')
            ->get(['id', 'name', 'user_id']);

        return Inertia::render('Admin/RecommendationManagement', [
            'logs'    => $logs,
            'petani'  => $petani,
            'areas'   => $areas,
            'filters' => $filters,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id'     => 'required|exists:users,id',
            'area_id'     => 'required|exists:agricultural_areas,id',
            'description' => 'required|string|max:1000',
        ]);

        $area = AgriculturalArea::findOrFail($validated['area_id']);
        if ($area->user_id !== (int) $validated['user_id']) {
            return back()->withErrors(['area_id' => 'Lahan ini bukan milik petani yang dipilih.']);
        }

        $rec = Recommendation::create([
            'category'    => 'Manual',
            'title'       => 'Rekomendasi Manual Admin',
            'description' => $validated['description'],
            'urgency'     => 'TINGGI',
            'color'       => 'blue',
        ]);

        ActionLog::create([
            'user_id'              => $validated['user_id'],
            'observation_id'       => null,
            'recommendation_id'    => $rec->id,
            'agricultural_area_id' => $validated['area_id'],
            'action_type'          => 'manual',
            'performed_at'         => now(),
        ]);

        // Notifikasi in-app ke petani penerima.
        $petani = User::findOrFail($validated['user_id']);
        $petani->notify(new FarmerNotification(
            'rekomendasi_baru',
            'Rekomendasi baru dari admin',
            "Admin memberikan rekomendasi baru untuk lahan {$area->name}.",
            route('rekomendasi-tindakan.index'),
        ));

        return back()->with('success', 'Rekomendasi manual berhasil dikirim ke petani.');
    }

    /** Edit isi rekomendasi manual — hanya boleh untuk action_type='manual'. */
    public function update(Request $request, int $id)
    {
        $log = ActionLog::where('id', $id)->where('action_type', 'manual')->firstOrFail();

        $validated = $request->validate([
            'description' => 'required|string|max:1000',
        ]);

        $log->recommendation->update(['description' => $validated['description']]);

        return back()->with('success', 'Rekomendasi berhasil diperbarui.');
    }

    /** Hapus rekomendasi manual beserta record Recommendation-nya. */
    public function destroy(int $id)
    {
        $log = ActionLog::where('id', $id)->where('action_type', 'manual')->firstOrFail();

        $rec = $log->recommendation;
        $log->delete();

        // Hapus Recommendation hanya jika tidak ada log lain yang referensi.
        if ($rec && ActionLog::where('recommendation_id', $rec->id)->doesntExist()) {
            $rec->delete();
        }

        return back()->with('success', 'Rekomendasi berhasil dihapus.');
    }
}
