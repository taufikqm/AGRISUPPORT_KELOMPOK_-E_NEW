<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * ============================================================
 * STUB: Admin\GlobalRiskMapController — Peta Risiko Global Admin (AGS-93)
 * ============================================================
 * ASSIGNEE : Arjuna
 * BRANCH   : feature/AGS-93-peta-risiko-global-admin
 *
 * FILE TERKAIT:
 *   - resources/js/Pages/Admin/GlobalRiskMap.jsx
 *
 * MODEL:
 *   - App\Models\AgriculturalArea  (semua lahan semua petani)
 *   - App\Models\FieldObservation  (observasi terbaru per lahan)
 *   - App\Models\User              (info pemilik lahan)
 *
 * ROUTES (routes/web.php — prefix /admin):
 *   GET /admin/peta-risiko      → index()
 *   GET /admin/api/peta-risiko  → getData()
 *
 * CATATAN:
 *   - Reuse logika calculateRiskMetrics() dari FieldObservationController
 *   - Dukung filter by petani (user_id) dan risk level
 *   - getData() return GeoJSON untuk semua lahan semua petani
 *   - Popup di peta harus menampilkan nama pemilik lahan
 *   - Gunakan PostGIS: ST_AsGeoJSON(geometry) untuk koordinat polygon
 * ============================================================
 */
class GlobalRiskMapController extends Controller
{
    /**
     * TODO: Render halaman peta risiko global admin.
     * Kirim daftar petani untuk filter dropdown.
     * Gunakan Inertia::render('Admin/GlobalRiskMap', ['petani' => ...]).
     */
    public function index(Request $request)
    {
        // TODO: Implementasi di sini
    }

    /**
     * TODO: Endpoint GeoJSON semua lahan semua petani beserta risk level.
     * Dukung query param: ?user_id=&risk_level=
     * Return: response()->json(['type' => 'FeatureCollection', 'features' => [...]]).
     */
    public function getData(Request $request)
    {
        // TODO: Implementasi di sini
    }
}
