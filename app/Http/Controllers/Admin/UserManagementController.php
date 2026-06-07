<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActionLog;
use App\Models\AgriculturalArea;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Manajemen Pengguna (Admin) — AGS-90.
 *
 * index()         — daftar petani + search nama/email + filter status + jumlah lahan & observasi terakhir.
 * update()        — edit data petani (nama, email, no. telp).
 * resetPassword() — reset password petani ke password sementara acak.
 * toggleStatus()  — aktif/nonaktif akun petani (akun nonaktif tidak bisa login).
 * destroy()       — hapus akun petani.
 *
 * Catatan: hanya akun berperan 'petani' yang dapat dikelola di sini.
 */
class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status']);

        $query = User::query()
            ->where('role', 'petani')
            ->withCount('agriculturalAreas')
            ->withMax('fieldObservations', 'observation_date');

        if ($search = ($filters['search'] ?? null)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        if (($filters['status'] ?? null) === 'aktif') {
            $query->where('is_active', true);
        } elseif (($filters['status'] ?? null) === 'nonaktif') {
            $query->where('is_active', false);
        }

        $users = $query->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $u) => [
                'id'                     => $u->id,
                'name'                   => $u->name,
                'email'                  => $u->email,
                'phone_number'           => $u->phone_number,
                'is_active'              => $u->is_active,
                'created_at'             => $u->created_at,
                'agricultural_areas_count' => $u->agricultural_areas_count,
                'last_observation_date'  => $u->field_observations_max_observation_date,
            ]);

        // Detail lengkap satu petani — lazy, hanya dihitung saat diminta
        // (partial reload ?detail_id=) agar tabel utama tetap ringan.
        $detailId = $request->integer('detail_id') ?: null;

        return Inertia::render('Admin/UserManagement', [
            'users'   => $users,
            'filters' => $filters,
            'detail'  => fn () => $detailId ? $this->buildUserDetail($detailId) : null,
        ]);
    }

    /** Susun detail lengkap petani untuk modal (profil, statistik, lahan, kondisi terkini). */
    private function buildUserDetail(int $userId): ?array
    {
        $user = User::where('role', 'petani')->find($userId);
        if (! $user) {
            return null;
        }

        $lands = AgriculturalArea::where('user_id', $user->id)
            ->withCount('fieldObservations')
            ->orderBy('name')
            ->get(['id', 'name', 'location_name', 'area_size', 'soil_type']);

        $latest = $user->fieldObservations()
            ->with('agriculturalArea:id,name')
            ->latest('observation_date')
            ->first(['id', 'agricultural_area_id', 'observation_date', 'crop_condition', 'soil_moisture', 'water_puddle', 'pest_indication', 'disease_indication']);

        $completedRecommendations = ActionLog::where('user_id', $user->id)
            ->where('action_type', 'completion')
            ->count();

        return [
            // A. Profil akun
            'profile' => [
                'id'                => $user->id,
                'name'              => $user->name,
                'email'             => $user->email,
                'phone_number'      => $user->phone_number,
                'is_active'         => $user->is_active,
                'email_verified_at' => $user->email_verified_at,
                'created_at'        => $user->created_at,
                'updated_at'        => $user->updated_at,
            ],
            // B. Ringkasan statistik
            'stats' => [
                'lands_count'              => $lands->count(),
                'total_area'              => round((float) $lands->sum('area_size'), 2),
                'observations_count'      => $user->fieldObservations()->count(),
                'completed_recommendations' => $completedRecommendations,
                'last_observation_date'   => $latest?->observation_date,
            ],
            // C. Daftar lahan
            'lands' => $lands->map(fn ($l) => [
                'id'                 => $l->id,
                'name'               => $l->name,
                'location_name'      => $l->location_name,
                'area_size'          => $l->area_size,
                'soil_type'          => $l->soil_type,
                'observations_count' => $l->field_observations_count,
            ]),
            // D. Kondisi terkini (observasi terakhir)
            'latest_observation' => $latest ? [
                'area_name'          => $latest->agriculturalArea->name ?? '—',
                'observation_date'   => $latest->observation_date,
                'crop_condition'     => $latest->crop_condition,
                'soil_moisture'      => $latest->soil_moisture,
                'water_puddle'       => $latest->water_puddle,
                'pest_indication'    => $latest->pest_indication,
                'disease_indication' => $latest->disease_indication,
            ] : null,
        ];
    }

    /** Update data profil petani. */
    public function update(Request $request, User $user): RedirectResponse
    {
        abort_unless($user->role === 'petani', 403);

        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'email' => [
                'required', 'string', 'lowercase', 'email', 'max:255',
                Rule::unique(User::class)->ignore($user->id),
            ],
            'phone_number' => ['nullable', 'string', 'max:20'],
        ]);

        $user->update($validated);

        return back()->with('success', 'Data pengguna berhasil diperbarui.');
    }

    /** Reset password petani ke password sementara acak. */
    public function resetPassword(User $user): RedirectResponse
    {
        abort_unless($user->role === 'petani', 403);

        $temporaryPassword = Str::password(10, symbols: false);

        $user->update(['password' => $temporaryPassword]);

        return back()->with([
            'success'        => "Password {$user->name} berhasil direset. Password sementara: {$temporaryPassword}",
            'reset_password' => $temporaryPassword,
        ]);
    }

    /** Aktifkan / nonaktifkan akun petani. */
    public function toggleStatus(User $user): RedirectResponse
    {
        abort_unless($user->role === 'petani', 403);

        $user->update(['is_active' => ! $user->is_active]);

        $pesan = $user->is_active
            ? "Akun {$user->name} berhasil diaktifkan."
            : "Akun {$user->name} berhasil dinonaktifkan.";

        return back()->with('success', $pesan);
    }

    /** Hapus akun petani. */
    public function destroy(User $user): RedirectResponse
    {
        abort_unless($user->role === 'petani', 403);

        $user->delete();

        return back()->with('success', 'Akun pengguna berhasil dihapus.');
    }
}
