<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * ============================================================
 * STUB: Admin\SettingsController — Pengaturan Admin (AGS-96)
 * ============================================================
 * ASSIGNEE : Taufik
 * BRANCH   : feature/AGS-96-pengaturan-admin
 *
 * FILE TERKAIT:
 *   - resources/js/Pages/Admin/Settings.jsx
 *
 * ROUTES (routes/web.php — prefix /admin):
 *   GET /admin/pengaturan → index()
 *   PUT /admin/pengaturan → update()
 *
 * CATATAN:
 *   - Pengaturan bisa disimpan di tabel 'settings' (buat migration jika perlu)
 *     atau di config file yang ditulis dinamis
 *   - Contoh pengaturan: nama aplikasi, logo, batas observasi per hari, dll
 *   - Admin bisa update password akun admin sendiri dari sini
 * ============================================================
 */
class SettingsController extends Controller
{
    /**
     * TODO: Tampilkan halaman pengaturan sistem.
     * Gunakan Inertia::render('Admin/Settings', ['settings' => ...]).
     */
    public function index(Request $request)
    {
        // TODO: Implementasi di sini
    }

    /**
     * TODO: Simpan perubahan pengaturan sistem.
     * Return: back() dengan flash success.
     */
    public function update(Request $request)
    {
        // TODO: Implementasi di sini
    }
}
