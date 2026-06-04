import { useState, useEffect, useCallback } from 'react';
import { Link, router } from '@inertiajs/react';

/**
 * Bell notifikasi admin (AGS-95) — tema gelap AdminHeader.
 * Mengambil ringkasan dari GET /admin/api/notifikasi/unread-count → { count, recent[] }.
 */
export default function AdminNotificationBell() {
    const [open, setOpen]     = useState(false);
    const [count, setCount]   = useState(0);
    const [recent, setRecent] = useState([]);
    const [error, setError]   = useState(false);

    const fetchSummary = useCallback(async () => {
        try {
            const res = await fetch(route('admin.api.notifikasi.unread-count'), {
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

    useEffect(() => {
        fetchSummary();
        const stop = router.on('success', () => fetchSummary());
        const interval = setInterval(fetchSummary, 30_000);
        return () => {
            stop();
            clearInterval(interval);
        };
    }, [fetchSummary]);

    return (
        <div className="relative">
            <button
                dusk="btn-bell-admin"
                onClick={() => setOpen((v) => !v)}
                className="relative flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Notifikasi"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.85 23.85 0 0 0 5.454-1.31A8.97 8.97 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.97 8.97 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24 24 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                {count > 0 && (
                    <span
                        dusk="badge-unread-admin"
                        className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
                    >
                        {count > 9 ? '9+' : count}
                    </span>
                )}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-slate-900 border border-slate-800 rounded-2xl shadow-xl z-40 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                            <p className="text-sm font-bold text-white">Notifikasi</p>
                            {count > 0 && <span className="text-[11px] font-semibold text-red-400">{count} baru</span>}
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            {error ? (
                                <div className="p-6 text-center">
                                    <p className="text-sm text-slate-400 mb-2">Gagal memuat notifikasi.</p>
                                    <button onClick={fetchSummary} className="text-xs font-semibold text-emerald-400 hover:underline">Coba Lagi</button>
                                </div>
                            ) : recent.length === 0 ? (
                                <p className="p-6 text-center text-sm text-slate-400">Belum ada notifikasi</p>
                            ) : (
                                recent.map((n) => (
                                    <Link
                                        key={n.id}
                                        href={n.url || route('admin.notifikasi.index')}
                                        onClick={() => setOpen(false)}
                                        className={`block px-4 py-3 border-b border-slate-800/60 hover:bg-slate-800 transition-colors ${n.read_at ? '' : 'bg-emerald-500/5'}`}
                                    >
                                        <p className={`text-sm truncate ${n.read_at ? 'text-slate-400' : 'font-semibold text-white'}`}>{n.title}</p>
                                        <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
                                        <p className="text-[10px] text-slate-600 mt-0.5">{n.time_ago}</p>
                                    </Link>
                                ))
                            )}
                        </div>

                        <Link
                            href={route('admin.notifikasi.index')}
                            onClick={() => setOpen(false)}
                            className="block px-4 py-3 text-center text-sm font-semibold text-emerald-400 hover:bg-slate-800 border-t border-slate-800"
                        >
                            Lihat Semua Notifikasi
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
