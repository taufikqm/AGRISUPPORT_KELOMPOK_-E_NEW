import { useState } from 'react';

/**
 * ============================================================
 * STUB: AdminLayout.jsx — Layout khusus halaman Admin
 * ============================================================
 *
 * TUGAS TIM (AGS-81 / Taufik):
 *   Implementasikan layout admin dengan sidebar dan header
 *   yang berbeda dari AuthenticatedLayout petani.
 *
 * KOMPONEN YANG PERLU DIBUAT:
 *   - @/Components/Admin/AdminSidebar   (navigasi menu admin)
 *   - @/Components/Admin/AdminHeader    (topbar admin)
 *
 * MENU SIDEBAR ADMIN:
 *   - Dashboard Admin       → /admin/dashboard
 *   - Manajemen Pengguna    → /admin/pengguna
 *   - Manajemen Lahan       → /admin/lahan
 *   - Manajemen Rekomendasi → /admin/rekomendasi
 *   - Peta Risiko Global    → /admin/peta-risiko
 *   - Laporan Aktivitas     → /admin/laporan
 *   - Notifikasi            → /admin/notifikasi
 *   - Pengaturan            → /admin/pengaturan
 *
 * PROPS:
 *   @param {ReactNode} children     — konten halaman
 *   @param {string}    title        — judul halaman
 *   @param {string}    currentRoute — nama route aktif untuk highlight menu
 * ============================================================
 */
export default function AdminLayout({ children, title, currentRoute }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="bg-gray-100 font-['Inter',sans-serif] min-h-screen flex overflow-hidden">
            {/* TODO: Ganti dengan AdminSidebar setelah dibuat */}
            {/* <AdminSidebar
                currentRoute={currentRoute}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            /> */}

            <div className={`flex flex-col flex-1 h-screen overflow-hidden transition-all duration-300 ease-in-out
                ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-60'}`}
            >
                {/* TODO: Ganti dengan AdminHeader setelah dibuat */}
                {/* <AdminHeader title={title} onMenuClick={() => setIsSidebarOpen(true)} /> */}

                <main className="flex-1 overflow-y-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
