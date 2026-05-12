<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * ============================================================
 * STUB: Admin\UserManagementController — Manajemen Pengguna (AGS-90)
 * ============================================================
 * ASSIGNEE : Bian
 * BRANCH   : feature/AGS-90-manajemen-pengguna-admin
 *
 * FILE TERKAIT:
 *   - resources/js/Pages/Admin/UserManagement.jsx
 *
 * MODEL:
 *   - App\Models\User
 *
 * ROUTES (routes/web.php — prefix /admin):
 *   GET   /admin/pengguna           → index()
 *   GET   /admin/pengguna/{user}    → show()
 *   PUT   /admin/pengguna/{user}    → update()
 *   PATCH /admin/pengguna/{user}/status → toggleStatus()
 *
 * CATATAN:
 *   - Dukung search by name/email via query param ?search=
 *   - Dukung pagination (15 per halaman)
 *   - toggleStatus() aktifkan/nonaktifkan akun petani
 *   - Admin tidak boleh edit/disable akun admin lain
 * ============================================================
 */
class UserManagementController extends Controller
{
    /**
     * TODO: Tampilkan daftar semua pengguna (petani) dengan pagination & search.
     * Gunakan Inertia::render('Admin/UserManagement', ['users' => ..., 'filters' => ...]).
     */
    public function index(Request $request)
    {
        // TODO: Implementasi di sini
    }

    /**
     * TODO: Tampilkan detail pengguna beserta lahan dan observasinya.
     * Gunakan Inertia::render('Admin/UserManagement', ['user' => ..., 'lands' => ...]).
     */
    public function show(User $user)
    {
        // TODO: Implementasi di sini
    }

    /**
     * TODO: Update data pengguna (name, email, phone_number).
     * Validasi input, simpan, return back() dengan flash.
     */
    public function update(Request $request, User $user)
    {
        // TODO: Implementasi di sini
    }

    /**
     * TODO: Aktifkan atau nonaktifkan akun pengguna.
     * Toggle field 'email_verified_at' atau gunakan field 'is_active' jika ditambahkan.
     */
    public function toggleStatus(Request $request, User $user)
    {
        // TODO: Implementasi di sini
    }
}
