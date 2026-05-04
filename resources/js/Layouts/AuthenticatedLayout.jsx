import { useState } from 'react';
import AppSidebar from '@/Components/AppSidebar';
import AppHeader from '@/Components/AppHeader';

export default function AuthenticatedLayout({ children, title, badge, currentRoute, headerActions }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="bg-[#f8fafc] font-['Inter',sans-serif] min-h-screen flex overflow-hidden">
            {/* Sidebar Component */}
            <AppSidebar 
                currentRoute={currentRoute} 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            {/* Main Content Area */}
            <div className={`flex flex-col flex-1 h-screen overflow-hidden transition-all duration-300 ease-in-out
                ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-60'}`}
            >
                <AppHeader 
                    title={title} 
                    badge={badge} 
                    headerActions={headerActions}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                <main className="flex-1 overflow-y-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
