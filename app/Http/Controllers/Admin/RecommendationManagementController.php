<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActionLog;
use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\Recommendation;
use App\Models\User;
use App\Notifications\FarmerNotification;
use App\Services\RecommendationBuilder;
use App\Services\RiskCalculationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Manajemen Rekomendasi (Admin) — AGS-92.
 *
 * index()   — daftar action_logs ber-recommendation (sistem + manual), filter petani & status.
 * store()   — tambah rekomendasi manual ke petani tertentu + kirim notifikasi in-app.
 * update()  — edit isi rekomendasi manual (hanya action_type='manual').
 * destroy() — hapus rekomendasi manual beserta Recommendation record-nya.
 * warn()    — kirim notifikasi peringatan ke petani yang masih punya rekomendasi belum selesai.
 */
class RecommendationManagementController extends Controller
{
    public function __construct(
        private RiskCalculationService $riskService,
        private RecommendationBuilder $recommendationBuilder,
    ) {}

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

    /**
     * Kirim notifikasi peringatan ke setiap petani yang masih memiliki
     * rekomendasi tindakan belum diselesaikan.
     */
    public function warn()
    {
        $petani = User::where('role', 'petani')->get();
        $terkirim = 0;

        foreach ($petani as $p) {
            $pending = $this->pendingRecommendationCount($p->id);

            if ($pending > 0) {
                $p->notify(new FarmerNotification(
                    'peringatan_rekomendasi',
                    'Pengingat: rekomendasi belum diselesaikan',
                    "Anda masih memiliki {$pending} rekomendasi tindakan yang belum diselesaikan. Segera tindak lanjuti untuk menjaga kondisi lahan Anda.",
                    route('rekomendasi-tindakan.index'),
                ));
                $terkirim++;
            }
        }

        $pesan = $terkirim > 0
            ? "Peringatan berhasil dikirim ke {$terkirim} petani yang memiliki rekomendasi belum selesai."
            : 'Tidak ada petani dengan rekomendasi belum selesai — tidak ada peringatan yang dikirim.';

        return back()->with('success', $pesan);
    }

    /**
     * Hitung total rekomendasi belum selesai milik seorang petani
     * (mengikuti logika yang sama dengan halaman rekomendasi petani).
     */
    private function pendingRecommendationCount(int $userId): int
    {
        $observations = FieldObservation::where('user_id', $userId)
            ->with('agriculturalArea:id,name,soil_type,location_name')
            ->orderByDesc('observation_date')
            ->take(30)
            ->get();

        $pending = 0;

        foreach ($observations as $obs) {
            $metrics   = $this->riskService->calculateRiskMetrics($obs);
            $totalRecs = $this->recommendationBuilder->forObservation($obs, $metrics)->count();
            $completed = ActionLog::where('user_id', $userId)
                ->where('observation_id', $obs->id)
                ->count();

            $pending += max(0, $totalRecs - $completed);
        }

        return $pending;
    }
}
