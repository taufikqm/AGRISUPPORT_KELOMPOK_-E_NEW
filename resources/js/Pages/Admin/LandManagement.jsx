import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

/**
 * ============================================================
 * STUB: Admin/LandManagement.jsx — Manajemen Lahan Admin (AGS-91)
 * ============================================================
 * ASSIGNEE : Arjuna
 * BRANCH   : feature/AGS-91-manajemen-lahan-admin
 *
 * BACKEND TERKAIT:
 *   - app/Http/Controllers/Admin/LandManagementController.php
 *
 * PROPS (mode list):
 *   @param {Object} auth       — data user admin
 *   @param {Object} areas      — paginated areas {data, links, meta}
 *   @param {Array}  petaniList — daftar petani untuk filter dropdown
 *   @param {Object} filters    — {search, user_id} dari query param
 *
 * PROPS (mode detail):
 *   @param {Object} area         — detail lahan
 *   @param {Array}  observations — riwayat observasi di lahan tersebut
 *
 * FITUR YANG PERLU DIIMPLEMENTASI:
 *   [ ] Tabel semua lahan (nama, pemilik, luas, soil type, jumlah observasi)
 *   [ ] Filter by petani (dusk="filter-petani")
 *   [ ] Search by nama lahan (dusk="input-search-lahan")
 *   [ ] Tombol Detail lahan (dusk="btn-detail-lahan-{id}")
 *   [ ] Modal edit lahan (dusk="btn-edit-lahan-{id}")
 *   [ ] Tombol hapus dengan konfirmasi (dusk="btn-hapus-lahan-{id}")
 *   [ ] Halaman detail: info lahan + peta + riwayat observasi
 * ============================================================
 */
export default function LandManagement({ auth, areas, petaniList, filters, area, observations }) {
    return (
        <AdminLayout title="Manajemen Lahan" currentRoute="admin.lahan.index">
            <Head title="Manajemen Lahan" />
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                {/* TODO: Implementasi manajemen lahan di sini */}
                {/* dusk="filter-petani" untuk dropdown filter */}
                {/* dusk="input-search-lahan" untuk search */}
                {/* dusk="btn-hapus-lahan-{id}" untuk tombol hapus */}
                {/* dusk="modal-konfirmasi-hapus" untuk modal konfirmasi */}
            </div>
        </AdminLayout>
    );
}
