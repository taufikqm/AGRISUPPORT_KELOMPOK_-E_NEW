<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Pengaturan Admin — AGS-96.
 *
 * index()          — halaman pengaturan: 2 section (Informasi Profil + Ubah Password).
 * update()         — simpan perubahan nama & email admin.
 * updatePassword() — ganti password admin (validasi password saat ini).
 *
 * Catatan: tidak ada opsi hapus akun admin — penghapusan hanya via seeder/database.
 */
class SettingsController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Admin/Settings', [
            'status' => session('status'),
        ]);
    }

    /** Update informasi profil admin (nama & email). */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'email' => [
                'required', 'string', 'lowercase', 'email', 'max:255',
                Rule::unique(User::class)->ignore($request->user()->id),
            ],
        ]);

        $request->user()->update($validated);

        return back()->with('status', 'profil-tersimpan');
    }

    /** Ganti password admin. */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => $validated['password'],
        ]);

        return back()->with('status', 'password-tersimpan');
    }
}
