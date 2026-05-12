<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * ============================================================
 * STUB: Admin\ActivityLogController — Riwayat Aktivitas & Laporan (AGS-94)
 * ============================================================
 * ASSIGNEE : Bian
 * BRANCH   : feature/AGS-94-laporan-aktivitas-admin
 *
 * FILE TERKAIT:
 *   - resources/js/Pages/Admin/ActivityLog.jsx
 *
 * MODEL:
 *   - App\Models\ActionLog
 *   - App\Models\FieldObservation
 *   - App\Models\User
 *
 * ROUTES (routes/web.php — prefix /admin):
 *   GET /admin/laporan         → index()
 *   GET /admin/api/laporan     → getData()
 *   GET /admin/laporan/export  → exportCsv()
 *
 * CATATAN:
 *   - Filter: tanggal (range), user_id, lahan_id, tipe aktivitas
 *   - Pagination 20 data per halaman
 *   - exportCsv() download file CSV dengan filter yang sama
 *   - getData() untuk grafik aktivitas (bar chart per hari/minggu)
 *   - Cek migration 2026_04_08_105406 untuk struktur tabel action_logs
 * ============================================================
 */
class ActivityLogController extends Controller
{
    /**
     * TODO: Tampilkan halaman riwayat aktivitas dengan filter & pagination.
     * Gunakan Inertia::render('Admin/ActivityLog', ['logs' => ..., 'filters' => ...]).
     */
    public function index(Request $request)
    {
        // TODO: Implementasi di sini
    }

    /**
     * TODO: API data aktivitas terformat untuk grafik.
     * Return: response()->json(['daily' => [...], 'weekly' => [...]]).
     */
    public function getData(Request $request)
    {
        // TODO: Implementasi di sini
    }

    /**
     * TODO: Export data aktivitas ke CSV.
     * Return: response()->streamDownload() atau Storage file.
     */
    public function exportCsv(Request $request)
    {
        // TODO: Implementasi di sini
    }
}
