import { useState, useEffect, useCallback } from 'react';
import { Link } from '@inertiajs/react';

/**
 * Bell icon + badge unread + dropdown panel notifikasi (AGS-87).
 * Mengambil ringkasan dari GET /api/notifikasi/unread-count → { count, recent[] }.
 */
export default function NotificationBell() {
    const [open, setOpen]     = useState(false);
    const [count, setCount]   = useState(0);
    const [recent, setRecent] = useState([]);
    const [error, setError]   = useState(false);

    const fetchSummary = useCallback(async () => {
        try {
            const res = await fetch(route('api.notifikasi.unread-count'), {
                headers: { Accept: 'application/json' },
            });
            if (!res.ok) throw new Error('gagal');
            const json = await res.json();
            setCount(json.count ?? 0);
            setRecent(json.recent ?? []);
            setError(false);
        } catch {
            setError(true);
        }
    }, []);

    useEffect(() => { fetchSummary(); }, [fetchSummary]);

    return (
        <div className="relative">
            <button
                dusk="btn-bell"
                onClick={() => setOpen((v) => !v)}
                className="relative p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Notifikasi"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.85 23.85 0 0 0 5.454-1.31A8.97 8.97 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.97 8.97 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24 24 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                {count > 0 && (
                    <span
                        dusk="badge-unread"
                        className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
                    >
                        {count > 9 ? '9+' : count}
                    </span>
                )}
            </button>

            {open && (
                <>
                    {/* click-away overlay */}
                    <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />

                    <div
                        dusk="dropdown-notif"
                        className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white border border-gray-200 rounded-2xl shadow-lg z-40 overflow-hidden"
                    >
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                            <p className="text-sm font-bold text-gray-800">Notifikasi</p>
                            {count > 0 && (
                                <span className="text-[11px] font-semibold text-red-500">{count} baru</span>
                            )}
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            {error ? (
                                <div className="p-6 text-center">
                                    <p className="text-sm text-gray-500 mb-2">Gagal memuat notifikasi.</p>
                                    <button onClick={fetchSummary} className="text-xs font-semibold text-[#2D5A27] hover:underline">
                                        Coba Lagi
                                    </button>
                                </div>
                            ) : recent.length === 0 ? (
                                <p dusk="dropdown-empty" className="p-6 text-center text-sm text-gray-500">
                                    Belum ada notifikasi
                                </p>
                            ) : (
                                recent.map((n) => (
                                    <Link
                                        key={n.id}
                                        href={n.url || route('notifikasi.index')}
                                        onClick={() => setOpen(false)}
                                        className={`block px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                                            n.read_at ? '' : 'bg-[#f0fdf4]/50'
                                        }`}
                                    >
                                        <p className={`text-sm truncate ${n.read_at ? 'text-gray-600' : 'font-semibold text-gray-800'}`}>
                                            {n.title}
                                        </p>
                                        <p className="text-xs text-gray-500 line-clamp-2">{n.message}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{n.time_ago}</p>
                                    </Link>
                                ))
                            )}
                        </div>

                        <Link
                            href={route('notifikasi.index')}
                            onClick={() => setOpen(false)}
                            className="block px-4 py-3 text-center text-sm font-semibold text-[#2D5A27] hover:bg-[#f0fdf4] border-t border-gray-100"
                        >
                            Lihat Semua Notifikasi
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
