import { usePage } from '@inertiajs/react';
import NotificationBell from '@/Components/NotificationBell';

export default function AppHeader({ title, badge, onMenuClick, headerActions }) {
    const { auth } = usePage().props;

    return (
        <header className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0 z-20">
            {/* Left: Burger (Mobile) + Page Title + Badge */}
            <div className="flex items-center gap-3 min-w-0">
                <button 
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-400 hover:text-gray-600 lg:hidden shrink-0"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <div className="flex items-center gap-2 min-w-0">
                    <h2 className="text-[14px] md:text-[15px] font-bold text-gray-800 truncate">{title || 'Dashboard'}</h2>
                    {badge && (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] text-[10px] font-bold whitespace-nowrap">
                            {badge}
                        </span>
                    )}
                </div>
            </div>

            {/* Middle/Right: Actions and Profile */}
            <div className="flex items-center gap-2 md:gap-4 ml-auto">
                {headerActions && (
                    <div className="hidden md:block">
                        {headerActions}
                    </div>
                )}

                <NotificationBell />

                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                    <div className="hidden sm:block text-right">
                        <p className="text-[12px] font-bold text-gray-800 leading-tight truncate max-w-[100px]">{auth?.user?.name || 'Petani'}</p>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none">Petani</p>
                    </div>
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#2D5A27]/10 flex items-center justify-center border border-[#2D5A27]/20">
                        <svg className="w-5 h-5 text-[#2D5A27]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                    </div>
                </div>
            </div>
        </header>
    );
}
