import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Notifications({ petani = [], history = [] }) {
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
        post(route('admin.notifikasi.send'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const inputClass =
        'w-full rounded-xl bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500';

    return (
        <AdminLayout title="Sistem Notifikasi" currentRoute="admin.notifikasi.index">
            <Head title="Sistem Notifikasi" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white">Sistem Notifikasi</h1>
                    <p className="text-sm text-slate-400">Kirim pengumuman/peringatan ke petani dan lihat riwayat pengiriman.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-5 border-b border-slate-800">
                    <button
                        onClick={() => setTab('kirim')}
                        className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 ${tab === 'kirim' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                        Kirim Notifikasi
                    </button>
                    <button
                        dusk="tab-riwayat-notif"
                        onClick={() => setTab('riwayat')}
                        className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 ${tab === 'riwayat' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                        Riwayat Terkirim
                    </button>
                </div>

                {tab === 'kirim' ? (
                    <form onSubmit={handleSend} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                        {recentlySuccessful && (
                            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium px-4 py-3">
                                Notifikasi berhasil dikirim.
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-slate-200 mb-1">Judul</label>
                            <input
                                dusk="input-judul-notif"
                                type="text"
                                value={data.judul}
                                onChange={(e) => setData('judul', e.target.value)}
                                className={inputClass}
                                placeholder="Mis. Peringatan Cuaca Ekstrem"
                            />
                            {errors.judul && <p className="text-xs text-red-400 mt-1">{errors.judul}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-200 mb-1">Pesan</label>
                            <textarea
                                dusk="input-pesan-notif"
                                rows={4}
                                value={data.pesan}
                                onChange={(e) => setData('pesan', e.target.value)}
                                className={inputClass}
                                placeholder="Tulis isi pengumuman untuk petani..."
                            />
                            {errors.pesan && <p className="text-xs text-red-400 mt-1">{errors.pesan}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-200 mb-1">Target Penerima</label>
                            <select
                                dusk="select-target-notif"
                                value={data.target}
                                onChange={(e) => setData('target', e.target.value)}
                                className={inputClass}
                            >
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
                                            <input
                                                type="checkbox"
                                                checked={data.target_ids.includes(p.id)}
                                                onChange={() => toggleTarget(p.id)}
                                                className="rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                                            />
                                            <span className="text-slate-100 font-medium">{p.name}</span>
                                            <span className="text-slate-500 text-xs">{p.email}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        )}
                        {errors.target_ids && <p className="text-xs text-red-400 mt-1">{errors.target_ids}</p>}

                        <button
                            dusk="btn-kirim-notifikasi"
                            type="submit"
                            disabled={processing}
                            className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
                        >
                            {processing ? 'Mengirim...' : 'Kirim Notifikasi'}
                        </button>
                    </form>
                ) : (
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
