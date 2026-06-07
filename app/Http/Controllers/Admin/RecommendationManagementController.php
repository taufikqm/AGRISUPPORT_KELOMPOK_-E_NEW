<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActionLog;
use App\Models\AgriculturalArea;
use App\Models\Recommendation;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Manajemen Rekomendasi (Admin) — AGS-92.
 *
 * index()  — daftar action_logs yang punya recommendation_id (sistem + manual),
 *            dengan filter petani & status.
 * store()  — tambah rekomendasi manual dari admin ke petani tertentu.
 */
class RecommendationManagementController extends Controller
{
    /** Daftar semua rekomendasi yang sudah diberikan/dijalankan, dengan filter. */
    public function index(Request $request)
    {
        $filters = $request->only(['petani', 'status']);

        $query = ActionLog::query()
            ->whereNotNull('recommendation_id')
            ->with([
                'user:id,name,email',
                'recommendation:id,title,category,urgency,color',
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

        return Inertia::render('Admin/RecommendationManagement', [
            'logs'    => $logs,
            'petani'  => $petani,
            'filters' => $filters,
        ]);
    }

    /**
     * Simpan rekomendasi manual dari admin ke petani + lahan tertentu.
     * Membuat record Recommendation (category=Manual) lalu ActionLog (action_type='manual').
     */
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

        return back()->with('success', 'Rekomendasi manual berhasil dikirim ke petani.');
    }
}
