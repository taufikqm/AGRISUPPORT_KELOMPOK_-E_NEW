import { usePage } from '@inertiajs/react';
import AdminNotificationBell from '@/Components/Admin/AdminNotificationBell';

export default function AdminHeader({ title, onMenuClick }) {
    const { auth } = usePage().props;

    return (
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 lg:px-6 shrink-0">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
                {title && (
                    <h1 className="text-base font-semibold text-white">{title}</h1>
                )}
            </div>

            <div className="flex items-center gap-3">
                <AdminNotificationBell />

                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <span className="text-emerald-400 text-xs font-bold uppercase">
                            {auth?.user?.name?.charAt(0) ?? 'A'}
                        </span>
                    </div>
                    <div className="hidden sm:block text-right">
                        <p className="text-sm font-semibold text-white leading-none">
                            {auth?.user?.name ?? 'Admin'}
                        </p>
                        <p className="text-xs text-emerald-400 font-medium mt-0.5">Administrator</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
