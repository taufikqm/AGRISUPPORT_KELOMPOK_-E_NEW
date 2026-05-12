import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

/**
 * ============================================================
 * STUB: Admin/Notifications.jsx — Sistem Notifikasi Admin (AGS-95)
 * ============================================================
 * ASSIGNEE : Taufik
 * BRANCH   : feature/AGS-95-sistem-notifikasi-admin
 *
 * BACKEND TERKAIT:
 *   - app/Http/Controllers/Admin/NotificationController.php
 *
 * PROPS (mode kirim):
 *   @param {Object} auth       — data user admin
 *   @param {Array}  petani     — daftar petani untuk target pilihan
 *
 * PROPS (mode riwayat):
 *   @param {Object} history    — paginated riwayat notifikasi terkirim
 *
 * FITUR YANG PERLU DIIMPLEMENTASI:
 *   [ ] Form kirim notifikasi broadcast:
 *       - Judul pesan (dusk="input-judul-notif")
 *       - Isi pesan (dusk="input-pesan-notif")
 *       - Target: Semua Petani / Pilih Petani (dusk="select-target-notif")
 *       - Tombol kirim (dusk="btn-kirim-notifikasi")
 *   [ ] Tab "Riwayat Terkirim" (dusk="tab-riwayat-notif")
 *   [ ] Tabel riwayat: judul, target, waktu kirim, status dibaca
 *   [ ] Indikator status pengiriman (terkirim/gagal)
 * ============================================================
 */
export default function Notifications({ auth, petani, history }) {
    const { data, setData, post, processing } = useForm({
        judul: '',
        pesan: '',
        target: 'all',
        target_ids: [],
    });

    const handleSend = (e) => {
        e.preventDefault();
        post(route('admin.notifikasi.send'));
    };

    return (
        <AdminLayout title="Sistem Notifikasi" currentRoute="admin.notifikasi.index">
            <Head title="Sistem Notifikasi" />
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                {/* TODO: Implementasi form broadcast dan riwayat notifikasi di sini */}
                {/* dusk="input-judul-notif" untuk input judul */}
                {/* dusk="input-pesan-notif" untuk textarea pesan */}
                {/* dusk="select-target-notif" untuk pilih target */}
                {/* dusk="btn-kirim-notifikasi" untuk tombol kirim */}
                {/* dusk="tab-riwayat-notif" untuk tab riwayat */}
            </div>
        </AdminLayout>
    );
}
