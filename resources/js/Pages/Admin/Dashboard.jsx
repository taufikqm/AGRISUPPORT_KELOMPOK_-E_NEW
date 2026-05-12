import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

/**
 * ============================================================
 * STUB: Admin/Dashboard.jsx — Dashboard Admin (AGS-81)
 * ============================================================
 * ASSIGNEE : Taufik
 * BRANCH   : feature/AGS-81-dashboard-admin
 *
 * BACKEND TERKAIT:
 *   - app/Http/Controllers/Admin/DashboardController.php
 *
 * PROPS:
 *   @param {Object} auth             — data user admin
 *   @param {number} totalPetani      — jumlah petani terdaftar
 *   @param {number} totalLahan       — jumlah total lahan di sistem
 *   @param {number} totalObservasi   — jumlah total observasi
 *   @param {Array}  observasiTerbaru — 5 observasi terbaru [{id, user, area, date, risk}]
 *   @param {Array}  petaniBaru       — 5 petani terbaru [{id, name, email, created_at}]
 *   @param {Object} statistikRisiko  — {tinggi: N, sedang: N, rendah: N}
 *
 * FITUR YANG PERLU DIIMPLEMENTASI:
 *   [ ] Card statistik (total petani, lahan, observasi)
 *   [ ] Grafik distribusi risiko (pie/donut chart — Recharts)
 *   [ ] Tabel observasi terbaru dari semua petani
 *   [ ] Tabel petani baru yang baru bergabung
 *   [ ] Navigasi cepat ke modul admin lainnya
 * ============================================================
 */
export default function Dashboard({
    auth,
    totalPetani,
    totalLahan,
    totalObservasi,
    observasiTerbaru,
    petaniBaru,
    statistikRisiko,
}) {
    return (
        <AdminLayout title="Dashboard Admin" currentRoute="admin.dashboard">
            <Head title="Dashboard Admin" />
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                {/* TODO: Implementasi dashboard admin di sini */}
            </div>
        </AdminLayout>
    );
}
