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
    private function buildQuery(Request $request)
    {
        $obsQuery = \Illuminate\Support\Facades\DB::table('field_observations')
            ->join('users', 'field_observations.user_id', '=', 'users.id')
            ->join('agricultural_areas', 'field_observations.agricultural_area_id', '=', 'agricultural_areas.id')
            ->select(
                'field_observations.id',
                'field_observations.user_id',
                'users.name as user_name',
                'agricultural_areas.name as area_name',
                \Illuminate\Support\Facades\DB::raw("'observasi' as action_type"),
                'field_observations.observation_date as performed_at',
                \Illuminate\Support\Facades\DB::raw("CONCAT('Observasi: Curah hujan ', COALESCE(field_observations.weather_precip_mm, 0), ' mm') as detail")
            );

        $actQuery = \Illuminate\Support\Facades\DB::table('action_logs')
            ->join('users', 'action_logs.user_id', '=', 'users.id')
            ->leftJoin('agricultural_areas', 'action_logs.agricultural_area_id', '=', 'agricultural_areas.id')
            ->leftJoin('recommendations', 'action_logs.recommendation_id', '=', 'recommendations.id')
            ->select(
                'action_logs.id',
                'action_logs.user_id',
                'users.name as user_name',
                \Illuminate\Support\Facades\DB::raw("COALESCE(agricultural_areas.name, '-') as area_name"),
                'action_logs.action_type',
                'action_logs.performed_at',
                \Illuminate\Support\Facades\DB::raw("COALESCE(recommendations.title, 'Jadwal/Tindakan Lainnya') as detail")
            );

        if ($request->filled('user_id')) {
            $obsQuery->where('field_observations.user_id', $request->user_id);
            $actQuery->where('action_logs.user_id', $request->user_id);
        }
        
        if ($request->filled('date_from')) {
            $obsQuery->whereDate('field_observations.observation_date', '>=', $request->date_from);
            $actQuery->whereDate('action_logs.performed_at', '>=', $request->date_from);
        }
        
        if ($request->filled('date_to')) {
            $obsQuery->whereDate('field_observations.observation_date', '<=', $request->date_to);
            $actQuery->whereDate('action_logs.performed_at', '<=', $request->date_to);
        }

        $unionQuery = $obsQuery->unionAll($actQuery);

        return \Illuminate\Support\Facades\DB::table(\Illuminate\Support\Facades\DB::raw("({$unionQuery->toSql()}) as activities"))
            ->mergeBindings($unionQuery);
    }

    public function index(Request $request)
    {
        $activities = $this->buildQuery($request)
            ->orderByDesc('performed_at')
            ->paginate(20)
            ->withQueryString();

        $petaniList = \App\Models\User::where('role', 'petani')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/ActivityLog', [
            'logs' => $activities,
            'petaniList' => $petaniList,
            'filters' => $request->only(['user_id', 'date_from', 'date_to']),
        ]);
    }

    public function getData(Request $request)
    {
        $data = $this->buildQuery($request)
            ->select(
                \Illuminate\Support\Facades\DB::raw("DATE(performed_at) as date"),
                'action_type',
                \Illuminate\Support\Facades\DB::raw("COUNT(*) as total")
            )
            ->groupBy('date', 'action_type')
            ->orderBy('date')
            ->get();

        // Process data into a format suitable for Recharts
        $grouped = $data->groupBy('date');
        $chartData = [];
        foreach ($grouped as $date => $items) {
            $entry = ['date' => $date, 'observasi' => 0, 'tindakan' => 0];
            foreach ($items as $item) {
                if ($item->action_type === 'observasi') {
                    $entry['observasi'] += $item->total;
                } else {
                    $entry['tindakan'] += $item->total;
                }
            }
            $chartData[] = $entry;
        }

        return response()->json(['chart_data' => $chartData]);
    }

    public function exportCsv(Request $request)
    {
        $activities = $this->buildQuery($request)
            ->orderByDesc('performed_at')
            ->get();

        $filename = "laporan_aktivitas_" . date('Ymd_His') . ".csv";

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function () use ($activities) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Tanggal', 'Petani', 'Lahan', 'Jenis Aktivitas', 'Detail']);

            foreach ($activities as $row) {
                fputcsv($file, [
                    $row->performed_at,
                    $row->user_name,
                    $row->area_name,
                    $row->action_type,
                    $row->detail
                ]);
            }
            fclose($file);
        };

        return response()->streamDownload($callback, $filename, $headers);
    }
}
