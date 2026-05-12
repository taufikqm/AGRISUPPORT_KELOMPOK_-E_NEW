import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

/**
 * ============================================================
 * STUB: Admin/Settings.jsx — Pengaturan Admin (AGS-96)
 * ============================================================
 * ASSIGNEE : Taufik
 * BRANCH   : feature/AGS-96-pengaturan-admin
 *
 * BACKEND TERKAIT:
 *   - app/Http/Controllers/Admin/SettingsController.php
 *
 * PROPS:
 *   @param {Object} auth       — data user admin
 *   @param {Object} settings   — data pengaturan saat ini
 *
 * FITUR YANG PERLU DIIMPLEMENTASI:
 *   [ ] Form pengaturan umum (nama aplikasi, deskripsi)
 *   [ ] Ubah password admin (dusk="input-password-lama", "input-password-baru")
 *   [ ] Tombol simpan (dusk="btn-simpan-pengaturan")
 *   [ ] Flash message sukses/gagal setelah simpan
 * ============================================================
 */
export default function Settings({ auth, settings }) {
    const { data, setData, put, processing } = useForm({
        app_name: settings?.app_name ?? '',
        app_description: settings?.app_description ?? '',
    });

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route('admin.pengaturan.update'));
    };

    return (
        <AdminLayout title="Pengaturan" currentRoute="admin.pengaturan.index">
            <Head title="Pengaturan Admin" />
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                {/* TODO: Implementasi form pengaturan admin di sini */}
                {/* dusk="btn-simpan-pengaturan" untuk tombol simpan */}
            </div>
        </AdminLayout>
    );
}
