import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

/**
 * ============================================================
 * STUB: Notifications.jsx — Halaman Notifikasi Petani (AGS-87)
 * ============================================================
 * ASSIGNEE : ketrin
 * BRANCH   : feature/AGS-87-sistem-notifikasi-petani
 *
 * BACKEND TERKAIT:
 *   - app/Http/Controllers/NotificationController.php
 *
 * PROPS:
 *   @param {Object} auth             — data user login
 *   @param {Array}  notifications    — semua notifikasi user
 *                   [{id, type, data:{title,message}, read_at, created_at}]
 *   @param {number} unreadCount      — jumlah belum dibaca
 *
 * FITUR YANG PERLU DIIMPLEMENTASI:
 *   [ ] Daftar notifikasi (read & unread, dibedakan visual)
 *   [ ] Tombol "Tandai Dibaca" per notifikasi (dusk="btn-baca-{id}")
 *   [ ] Tombol "Tandai Semua Dibaca" (dusk="btn-baca-semua")
 *   [ ] Badge jumlah unread di header (via AppHeader — sudah ada)
 *   [ ] Empty state jika belum ada notifikasi
 *   [ ] Icon/warna berbeda per tipe notifikasi (cuaca, sistem, dll)
 * ============================================================
 */
export default function Notifications({ auth, notifications, unreadCount }) {
    const handleMarkAsRead = (id) => {
        router.post(route('notifikasi.mark-read', id));
    };

    const handleMarkAllAsRead = () => {
        router.post(route('notifikasi.mark-all-read'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            title="Notifikasi"
            currentRoute="notifikasi.index"
        >
            <Head title="Notifikasi" />
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                {/* TODO: Implementasi UI notifikasi di sini */}
                {/* Gunakan dusk="btn-baca-semua" pada tombol tandai semua dibaca */}
                {/* Gunakan dusk="btn-baca-{id}" pada tombol tandai per notifikasi */}
            </div>
        </AuthenticatedLayout>
    );
}
