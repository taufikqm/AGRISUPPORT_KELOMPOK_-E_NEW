import { useState } from 'react';
import AdminSidebar from '@/Components/Admin/AdminSidebar';
import AdminHeader from '@/Components/Admin/AdminHeader';

export default function AdminLayout({ children, title }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="bg-slate-950 font-['Inter',sans-serif] min-h-screen flex overflow-hidden">
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <div className={`flex flex-col flex-1 h-screen overflow-hidden transition-all duration-300 ease-in-out
                ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-60'}`}
            >
                <AdminHeader
                    title={title}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                <main className="flex-1 overflow-y-auto w-full bg-slate-950">
                    {children}
                </main>
            </div>
        </div>
    );
}
