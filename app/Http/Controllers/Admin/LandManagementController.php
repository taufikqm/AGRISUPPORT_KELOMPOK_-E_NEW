<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgriculturalArea;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * ============================================================
 * STUB: Admin\LandManagementController — Manajemen Lahan Admin (AGS-91)
 * ============================================================
 * ASSIGNEE : Arjuna
 * BRANCH   : feature/AGS-91-manajemen-lahan-admin
 *
 * FILE TERKAIT:
 *   - resources/js/Pages/Admin/LandManagement.jsx
 *
 * MODEL:
 *   - App\Models\AgriculturalArea
 *   - App\Models\FieldObservation
 *   - App\Models\User
 *
 * ROUTES (routes/web.php — prefix /admin):
 *   GET    /admin/lahan         → index()
 *   GET    /admin/lahan/{area}  → show()
 *   PUT    /admin/lahan/{area}  → update()
 *   DELETE /admin/lahan/{area}  → destroy()
 *
 * CATATAN:
 *   - index() menampilkan SEMUA lahan dari SEMUA petani
 *   - Dukung filter by user_id dan search by nama lahan
 *   - show() tampilkan detail lahan + semua observasi di lahan itu
 *   - destroy() hanya jika tidak ada observasi aktif (atau beri konfirmasi)
 *   - Gunakan PostGIS: ST_AsGeoJSON(geometry) untuk data peta
 * ============================================================
 */
class LandManagementController extends Controller
{
    /**
     * TODO: Tampilkan semua lahan dari semua petani dengan filter & pagination.
     * Gunakan Inertia::render('Admin/LandManagement', ['areas' => ..., 'filters' => ...]).
     */
    public function index(Request $request)
    {
        // TODO: Implementasi di sini
    }

    /**
     * TODO: Tampilkan detail lahan beserta riwayat observasinya.
     */
    public function show(AgriculturalArea $area)
    {
        // TODO: Implementasi di sini
    }

    /**
     * TODO: Update data lahan (name, area_size, soil_type, notes).
     */
    public function update(Request $request, AgriculturalArea $area)
    {
        // TODO: Implementasi di sini
    }

    /**
     * TODO: Hapus lahan beserta semua observasinya (cascade sudah di DB).
     */
    public function destroy(AgriculturalArea $area)
    {
        // TODO: Implementasi di sini
    }
}
