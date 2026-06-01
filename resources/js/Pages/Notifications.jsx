import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

/* ─── Metadata per tipe notifikasi (ikon + warna) ─── */
const TYPE_META = {
    cuaca_ekstrem: {
        label: 'Cuaca Ekstrem',
        color: '#3b82f6',
        bg: '#eff6ff',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 .75-7.425A4.5 4.5 0 0 0 14.25 9 4.5 4.5 0 0 0 6 12.75 4.49 4.49 0 0 0 2.25 15Z" />
        ),
    },
    rekomendasi_baru: {
        label: 'Rekomendasi Baru',
        color: '#22c55e',
        bg: '#f0fdf4',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.4 14.4 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        ),
    },
    pesan_admin: {
        label: 'Pesan Admin',
        color: '#6366f1',
        bg: '#eef2ff',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.8 20.8 0 0 1-1.444-4.282m3.106.49a48.6 48.6 0 0 1 7.658 1.46c.55.213 1.024-.27.943-.846a25.4 25.4 0 0 1 0-7.114c.081-.576-.392-1.059-.943-.847a48.6 48.6 0 0 1-7.658 1.461m0 5.886-.001-5.886m0 0L10.34 8.16" />
        ),
    },
    reminder_observasi: {
        label: 'Pengingat Observasi',
        color: '#64748b',
        bg: '#f8fafc',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        ),
    },
    risiko_meningkat: {
        label: 'Risiko Meningkat',
        color: '#ef4444',
        bg: '#fef2f2',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        ),
    },
    umum: {
        label: 'Umum',
        color: '#2D5A27',
        bg: '#f0fdf4',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.85 23.85 0 0 0 5.454-1.31A8.97 8.97 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.97 8.97 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24 24 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        ),
    },
};

const FILTER_OPTIONS = [
    { value: '',                  label: 'Semua' },
    { value: 'cuaca_ekstrem',     label: 'Cuaca Ekstrem' },
    { value: 'rekomendasi_baru',  label: 'Rekomendasi Baru' },
    { value: 'pesan_admin',       label: 'Pesan Admin' },
    { value: 'reminder_observasi',label: 'Pengingat Observasi' },
    { value: 'risiko_meningkat',  label: 'Risiko Meningkat' },
];

function NotifIcon({ type }) {
    const meta = TYPE_META[type] ?? TYPE_META.umum;
    return (
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: meta.bg }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke={meta.color}>
                {meta.icon}
            </svg>
        </div>
    );
}

export default function Notifications({ notifications = [], unreadCount = 0, filterType = '' }) {
    const handleMarkAsRead = (id) => {
        router.post(route('notifikasi.mark-read', id), {}, { preserveScroll: true });
    };

    const handleMarkAllAsRead = () => {
        router.post(route('notifikasi.mark-all-read'), {}, { preserveScroll: true });
    };

    const handleFilter = (type) => {
        router.get(route('notifikasi.index'), type ? { type } : {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout title="Notifikasi" currentRoute="notifikasi.index">
            <Head title="Notifikasi" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1e293b]">Notifikasi</h1>
                        <p className="text-sm text-[#64748b]">
                            {unreadCount > 0
                                ? `${unreadCount} notifikasi belum dibaca`
                                : 'Semua notifikasi sudah dibaca'}
                        </p>
                    </div>
                    <button
                        dusk="btn-baca-semua"
                        onClick={handleMarkAllAsRead}
                        disabled={unreadCount === 0}
                        className="text-sm font-semibold px-4 py-2 rounded-xl border border-[#e2e8f0] text-[#2D5A27] hover:bg-[#f0fdf4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Tandai Semua Dibaca
                    </button>
                </div>

                {/* Filter tipe */}
                <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
                    {FILTER_OPTIONS.map((opt) => (
                        <button
                            key={opt.value || 'all'}
                            dusk={`filter-tipe-${opt.value || 'semua'}`}
                            onClick={() => handleFilter(opt.value)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap border transition-colors ${
                                (filterType || '') === opt.value
                                    ? 'bg-[#2D5A27] text-white border-[#2D5A27]'
                                    : 'bg-white text-[#64748b] border-[#e2e8f0] hover:border-[#2D5A27]/40'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Daftar / Empty state */}
                {notifications.length === 0 ? (
                    <div dusk="empty-state" className="bg-white border border-[#e2e8f0] rounded-2xl p-12 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-[#f0fdf4] flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-[#2D5A27]" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.85 23.85 0 0 0 5.454-1.31A8.97 8.97 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.97 8.97 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24 24 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                            </svg>
                        </div>
                        <p className="font-semibold text-[#1e293b]">Belum ada notifikasi</p>
                        <p className="text-sm text-[#64748b] mt-1">Notifikasi tentang lahan Anda akan muncul di sini.</p>
                    </div>
                ) : (
                    <div dusk="notif-list" className="space-y-2">
                        {notifications.map((n) => {
                            const isUnread = !n.read_at;
                            const meta = TYPE_META[n.type] ?? TYPE_META.umum;
                            const Body = (
                                <>
                                    <NotifIcon type={n.type} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-sm truncate ${isUnread ? 'font-bold text-[#1e293b]' : 'font-semibold text-[#475569]'}`}>
                                                {n.title}
                                            </p>
                                            {isUnread && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: meta.color }} />}
                                        </div>
                                        <p className="text-sm text-[#64748b] line-clamp-2">{n.message}</p>
                                        <p className="text-[11px] text-[#94a3b8] mt-1">{n.time_ago}</p>
                                    </div>
                                </>
                            );

                            return (
                                <div
                                    key={n.id}
                                    dusk="notif-item"
                                    className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors ${
                                        isUnread ? 'bg-white border-[#2D5A27]/20' : 'bg-[#f8fafc] border-[#e2e8f0]'
                                    }`}
                                >
                                    {n.url ? (
                                        <Link href={n.url} className="flex items-start gap-3 flex-1 min-w-0">{Body}</Link>
                                    ) : (
                                        <div className="flex items-start gap-3 flex-1 min-w-0">{Body}</div>
                                    )}
                                    {isUnread && (
                                        <button
                                            dusk={`btn-baca-${n.id}`}
                                            onClick={() => handleMarkAsRead(n.id)}
                                            className="text-[11px] font-semibold text-[#2D5A27] hover:underline shrink-0 mt-1"
                                        >
                                            Tandai Dibaca
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
