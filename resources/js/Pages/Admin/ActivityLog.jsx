import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

/**
 * ============================================================
 * STUB: Admin/ActivityLog.jsx — Riwayat Aktivitas & Laporan (AGS-94)
 * ============================================================
 * ASSIGNEE : Bian
 * BRANCH   : feature/AGS-94-laporan-aktivitas-admin
 *
 * BACKEND TERKAIT:
 *   - app/Http/Controllers/Admin/ActivityLogController.php
 *
 * PROPS:
 *   @param {Object} auth       — data user admin
 *   @param {Object} logs       — paginated action logs {data, links, meta}
 *   @param {Array}  petaniList — daftar petani untuk filter
 *   @param {Object} filters    — {date_from, date_to, user_id, land_id}
 *
 * FITUR YANG PERLU DIIMPLEMENTASI:
 *   [ ] Filter: range tanggal (dusk="input-date-from" & "input-date-to")
 *   [ ] Filter: petani (dusk="filter-petani-log")
 *   [ ] Tabel log (waktu, petani, lahan, tipe aktivitas, detail)
 *   [ ] Pagination
 *   [ ] Grafik bar aktivitas per hari/minggu (Recharts)
 *   [ ] Tombol Export CSV (dusk="btn-export-csv")
 * ============================================================
 */
export default function ActivityLog({ auth, logs, petaniList, filters }) {
    const handleExportCsv = () => {
        window.location.href = route('admin.laporan.export', filters);
    };

    return (
        <AdminLayout title="Laporan Aktivitas" currentRoute="admin.laporan.index">
            <Head title="Laporan Aktivitas" />
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                {/* TODO: Implementasi laporan aktivitas di sini */}
                {/* dusk="btn-export-csv" untuk tombol export */}
                {/* dusk="input-date-from" & dusk="input-date-to" untuk filter tanggal */}
                {/* dusk="filter-petani-log" untuk filter dropdown */}
            </div>
        </AdminLayout>
    );
}
