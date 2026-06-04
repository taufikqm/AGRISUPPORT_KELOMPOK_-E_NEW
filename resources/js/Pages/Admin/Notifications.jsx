import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

const TYPE_LABEL = {
    petani_baru:        'Petani Baru',
    observasi_masuk:    'Observasi Masuk',
    anomali_cuaca:      'Anomali Cuaca',
    petani_tidak_aktif: 'Petani Tidak Aktif',
    pesan_admin:        'Pesan Admin',
};

export default function Notifications({ petani = [], kotakMasuk = [], unreadCount = 0, history = [] }) {
    const [tab, setTab] = useState('kirim');

    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        judul: '',
        pesan: '',
        target: 'all',
        target_ids: [],
    });

    const toggleTarget = (id) => {
        setData(
            'target_ids',
            data.target_ids.includes(id)
                ? data.target_ids.filter((x) => x !== id)
                : [...data.target_ids, id]
        );
    };

    const handleSend = (e) => {
        e.preventDefault();
        post(route('admin.notifikasi.send'), { preserveScroll: true, onSuccess: () => reset() });
    };

    const markRead = (id) => router.post(route('admin.notifikasi.mark-read', id), {}, { preserveScroll: true });
    const markAllRead = () => router.post(route('admin.notifikasi.mark-all-read'), {}, { preserveScroll: true });

    const inputClass =
        'w-full rounded-xl bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500';

    const tabBtn = (key, label, badge = 0) => (
        <button
            dusk={key === 'masuk' ? 'tab-kotak-masuk' : key === 'riwayat' ? 'tab-riwayat-notif' : undefined}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 flex items-center gap-2 ${tab === key ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
            {label}
            {badge > 0 && <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{badge > 9 ? '9+' : badge}</span>}
        </button>
    );

    return (
        <AdminLayout title="Sistem Notifikasi" currentRoute="admin.notifikasi.index">
            <Head title="Sistem Notifikasi" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white">Sistem Notifikasi</h1>
                    <p className="text-sm text-slate-400">Kirim pengumuman ke petani, dan pantau notifikasi masuk untuk admin.</p>
                </div>

                <div className="flex gap-2 mb-5 border-b border-slate-800">
                    {tabBtn('kirim', 'Kirim Notifikasi')}
                    {tabBtn('masuk', 'Kotak Masuk', unreadCount)}
                    {tabBtn('riwayat', 'Riwayat Terkirim')}
                </div>

                {tab === 'kirim' && (
                    <form onSubmit={handleSend} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                        {recentlySuccessful && (
                            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium px-4 py-3">
                                Notifikasi berhasil dikirim.
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-slate-200 mb-1">Judul</label>
                            <input dusk="input-judul-notif" type="text" value={data.judul} onChange={(e) => setData('judul', e.target.value)} className={inputClass} placeholder="Mis. Peringatan Cuaca Ekstrem" />
                            {errors.judul && <p className="text-xs text-red-400 mt-1">{errors.judul}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-200 mb-1">Pesan</label>
                            <textarea dusk="input-pesan-notif" rows={4} value={data.pesan} onChange={(e) => setData('pesan', e.target.value)} className={inputClass} placeholder="Tulis isi pengumuman untuk petani..." />
                            {errors.pesan && <p className="text-xs text-red-400 mt-1">{errors.pesan}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-200 mb-1">Target Penerima</label>
                            <select dusk="select-target-notif" value={data.target} onChange={(e) => setData('target', e.target.value)} className={inputClass}>
                                <option value="all">Semua Petani ({petani.length})</option>
                                <option value="specific">Pilih Petani Tertentu</option>
                            </select>
                        </div>

                        {data.target === 'specific' && (
                            <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-700 divide-y divide-slate-800">
                                {petani.length === 0 ? (
                                    <p className="p-4 text-sm text-slate-400">Belum ada petani terdaftar.</p>
                                ) : (
                                    petani.map((p) => (
                                        <label key={p.id} className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-800">
                                            <input type="checkbox" checked={data.target_ids.includes(p.id)} onChange={() => toggleTarget(p.id)} className="rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-emerald-500" />
                                            <span className="text-slate-100 font-medium">{p.name}</span>
                                            <span className="text-slate-500 text-xs">{p.email}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        )}
                        {errors.target_ids && <p className="text-xs text-red-400 mt-1">{errors.target_ids}</p>}

                        <button dusk="btn-kirim-notifikasi" type="submit" disabled={processing} className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50">
                            {processing ? 'Mengirim...' : 'Kirim Notifikasi'}
                        </button>
                    </form>
                )}

                {tab === 'masuk' && (
                    <div className="space-y-3">
                        <div className="flex justify-end">
                            <button
                                dusk="btn-baca-semua-admin"
                                onClick={markAllRead}
                                disabled={unreadCount === 0}
                                className="text-sm font-semibold px-4 py-2 rounded-xl border border-slate-700 text-emerald-400 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Tandai Semua Dibaca
                            </button>
                        </div>

                        {kotakMasuk.length === 0 ? (
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-sm text-slate-400">
                                Belum ada notifikasi masuk.
                            </div>
                        ) : (
                            kotakMasuk.map((n) => (
                                <div key={n.id} className={`flex items-start justify-between gap-3 p-4 rounded-2xl border ${n.read_at ? 'bg-slate-900 border-slate-800' : 'bg-slate-800/40 border-emerald-500/30'}`}>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-400">{TYPE_LABEL[n.type] ?? 'Notifikasi'}</span>
                                            {!n.read_at && <span className="w-2 h-2 rounded-full bg-red-500" />}
                                        </div>
                                        <p className={`text-sm ${n.read_at ? 'text-slate-300' : 'font-semibold text-white'}`}>{n.title}</p>
                                        <p className="text-xs text-slate-400 line-clamp-2">{n.message}</p>
                                        <p className="text-[11px] text-slate-600 mt-1">{n.time_ago}</p>
                                    </div>
                                    {!n.read_at && (
                                        <button onClick={() => markRead(n.id)} className="text-[11px] font-semibold text-emerald-400 hover:underline shrink-0 mt-1">
                                            Tandai Dibaca
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {tab === 'riwayat' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        {history.length === 0 ? (
                            <p className="p-8 text-center text-sm text-slate-400">Belum ada notifikasi terkirim.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wide">
                                    <tr>
                                        <th className="text-left font-semibold px-4 py-3">Judul</th>
                                        <th className="text-left font-semibold px-4 py-3">Penerima</th>
                                        <th className="text-left font-semibold px-4 py-3">Dibaca</th>
                                        <th className="text-left font-semibold px-4 py-3">Dikirim</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {history.map((h, i) => (
                                        <tr key={i} className="hover:bg-slate-800/50">
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-slate-100">{h.judul}</p>
                                                <p className="text-slate-400 text-xs line-clamp-1">{h.pesan}</p>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300">{h.jumlah_penerima}</td>
                                            <td className="px-4 py-3 text-slate-300">{h.jumlah_dibaca}/{h.jumlah_penerima}</td>
                                            <td className="px-4 py-3 text-slate-400 text-xs">{h.dikirim_pada}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
