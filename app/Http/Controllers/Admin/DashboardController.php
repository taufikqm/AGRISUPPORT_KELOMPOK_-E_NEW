<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * ============================================================
 * STUB: Admin\DashboardController — Dashboard Admin (AGS-81)
 * ============================================================
 * ASSIGNEE : Taufik
 * BRANCH   : feature/AGS-81-dashboard-admin
 *
 * FILE TERKAIT:
 *   - resources/js/Pages/Admin/Dashboard.jsx
 *   - resources/js/Layouts/AdminLayout.jsx
 *
 * MODEL YANG DIGUNAKAN:
 *   - App\Models\User          (total petani, user baru)
 *   - App\Models\AgriculturalArea (total lahan)
 *   - App\Models\FieldObservation (total observasi, observasi terbaru)
 *
 * ROUTE (routes/web.php):
 *   GET /admin/dashboard → index()
 *
 * DATA YANG DIKIRIM KE FRONTEND:
 *   - totalPetani    : jumlah user dengan role 'petani'
 *   - totalLahan     : jumlah seluruh lahan di sistem
 *   - totalObservasi : jumlah seluruh observasi
 *   - observasiTerbaru : 5 observasi terbaru dari semua petani
 *   - petaniBaru     : 5 petani yang baru bergabung
 *   - statistikRisiko: distribusi risk level (tinggi/sedang/rendah)
 * ============================================================
 */
class DashboardController extends Controller
{
    /**
     * TODO: Tampilkan dashboard admin dengan ringkasan statistik sistem.
     * Gunakan Inertia::render('Admin/Dashboard', [...]).
     */
    public function index(Request $request)
    {
        // TODO: Implementasi di sini
    }
}
