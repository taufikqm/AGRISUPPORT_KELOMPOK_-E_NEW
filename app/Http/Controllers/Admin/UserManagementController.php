<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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

        return Inertia::render('Admin/UserManagement', [
            'users'   => $users,
            'filters' => $filters,
        ]);
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
