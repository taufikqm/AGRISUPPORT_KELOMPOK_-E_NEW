import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

/**
 * ============================================================
 * STUB: Admin/UserManagement.jsx — Manajemen Pengguna Admin (AGS-90)
 * ============================================================
 * ASSIGNEE : Bian
 * BRANCH   : feature/AGS-90-manajemen-pengguna-admin
 *
 * BACKEND TERKAIT:
 *   - app/Http/Controllers/Admin/UserManagementController.php
 *
 * PROPS (mode list):
 *   @param {Object} auth       — data user admin
 *   @param {Object} users      — paginated users {data, links, meta}
 *   @param {Object} filters    — {search: string} dari query param
 *
 * PROPS (mode detail — jika show() mengirim user):
 *   @param {Object} user       — detail user
 *   @param {Array}  lands      — lahan milik user tersebut
 *
 * FITUR YANG PERLU DIIMPLEMENTASI:
 *   [ ] Tabel daftar pengguna (name, email, phone, tanggal daftar, status)
 *   [ ] Search by nama/email (dusk="input-search-pengguna")
 *   [ ] Pagination
 *   [ ] Tombol Detail per baris (dusk="btn-detail-pengguna-{id}")
 *   [ ] Modal/slide edit data pengguna (dusk="btn-edit-pengguna-{id}")
 *   [ ] Tombol aktif/nonaktif akun (dusk="btn-toggle-status-{id}")
 *   [ ] Halaman detail: info pengguna + daftar lahannya
 * ============================================================
 */
export default function UserManagement({ auth, users, filters, user, lands }) {
    return (
        <AdminLayout title="Manajemen Pengguna" currentRoute="admin.pengguna.index">
            <Head title="Manajemen Pengguna" />
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                {/* TODO: Implementasi manajemen pengguna di sini */}
                {/* dusk="input-search-pengguna" untuk field pencarian */}
                {/* dusk="btn-detail-pengguna-{id}" untuk tombol detail */}
            </div>
        </AdminLayout>
    );
}
