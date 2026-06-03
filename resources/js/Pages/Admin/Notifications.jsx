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

    return (
        <AdminLayout title="Sistem Notifikasi" currentRoute="admin.notifikasi.index">
            <Head title="Sistem Notifikasi" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-[#1e293b]">Sistem Notifikasi</h1>
                    <p className="text-sm text-[#64748b]">Kirim pengumuman/peringatan ke petani dan lihat riwayat pengiriman.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-5 border-b border-[#e2e8f0]">
                    <button
                        onClick={() => setTab('kirim')}
                        className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 ${tab === 'kirim' ? 'border-[#2D5A27] text-[#2D5A27]' : 'border-transparent text-[#64748b]'}`}
                    >
                        Kirim Notifikasi
                    </button>
                    <button
                        dusk="tab-riwayat-notif"
                        onClick={() => setTab('riwayat')}
                        className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 ${tab === 'riwayat' ? 'border-[#2D5A27] text-[#2D5A27]' : 'border-transparent text-[#64748b]'}`}
                    >
                        Riwayat Terkirim
                    </button>
                </div>

                {tab === 'kirim' ? (
                    <form onSubmit={handleSend} className="bg-white border border-[#e2e8f0] rounded-2xl p-6 space-y-5">
                        {recentlySuccessful && (
                            <div className="rounded-xl bg-[#f0fdf4] border border-[#2D5A27]/20 text-[#2D5A27] text-sm font-medium px-4 py-3">
                                Notifikasi berhasil dikirim.
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-[#1e293b] mb-1">Judul</label>
                            <input
                                dusk="input-judul-notif"
                                type="text"
                                value={data.judul}
                                onChange={(e) => setData('judul', e.target.value)}
                                className="w-full rounded-xl border-[#e2e8f0] focus:ring-[#2D5A27] focus:border-[#2D5A27]"
                                placeholder="Mis. Peringatan Cuaca Ekstrem"
                            />
                            {errors.judul && <p className="text-xs text-red-500 mt-1">{errors.judul}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#1e293b] mb-1">Pesan</label>
                            <textarea
                                dusk="input-pesan-notif"
                                rows={4}
                                value={data.pesan}
                                onChange={(e) => setData('pesan', e.target.value)}
                                className="w-full rounded-xl border-[#e2e8f0] focus:ring-[#2D5A27] focus:border-[#2D5A27]"
                                placeholder="Tulis isi pengumuman untuk petani..."
                            />
                            {errors.pesan && <p className="text-xs text-red-500 mt-1">{errors.pesan}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#1e293b] mb-1">Target Penerima</label>
                            <select
                                dusk="select-target-notif"
                                value={data.target}
                                onChange={(e) => setData('target', e.target.value)}
                                className="w-full rounded-xl border-[#e2e8f0] focus:ring-[#2D5A27] focus:border-[#2D5A27]"
                            >
                                <option value="all">Semua Petani ({petani.length})</option>
                                <option value="specific">Pilih Petani Tertentu</option>
                            </select>
                        </div>

                        {data.target === 'specific' && (
                            <div className="max-h-56 overflow-y-auto rounded-xl border border-[#e2e8f0] divide-y divide-[#f1f5f9]">
                                {petani.length === 0 ? (
                                    <p className="p-4 text-sm text-[#64748b]">Belum ada petani terdaftar.</p>
                                ) : (
                                    petani.map((p) => (
                                        <label key={p.id} className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer hover:bg-[#f8fafc]">
                                            <input
                                                type="checkbox"
                                                checked={data.target_ids.includes(p.id)}
                                                onChange={() => toggleTarget(p.id)}
                                                className="rounded border-[#cbd5e1] text-[#2D5A27] focus:ring-[#2D5A27]"
                                            />
                                            <span className="text-[#1e293b] font-medium">{p.name}</span>
                                            <span className="text-[#94a3b8] text-xs">{p.email}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        )}
                        {errors.target_ids && <p className="text-xs text-red-500 mt-1">{errors.target_ids}</p>}

                        <button
                            dusk="btn-kirim-notifikasi"
                            type="submit"
                            disabled={processing}
                            className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-[#2D5A27] text-white hover:bg-[#244a20] disabled:opacity-50"
                        >
                            {processing ? 'Mengirim...' : 'Kirim Notifikasi'}
                        </button>
                    </form>
                ) : (
                    <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden">
                        {history.length === 0 ? (
                            <p className="p-8 text-center text-sm text-[#64748b]">Belum ada notifikasi terkirim.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-[#f8fafc] text-[#64748b] text-xs uppercase tracking-wide">
                                    <tr>
                                        <th className="text-left font-semibold px-4 py-3">Judul</th>
                                        <th className="text-left font-semibold px-4 py-3">Penerima</th>
                                        <th className="text-left font-semibold px-4 py-3">Dibaca</th>
                                        <th className="text-left font-semibold px-4 py-3">Dikirim</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f1f5f9]">
                                    {history.map((h, i) => (
                                        <tr key={i} className="hover:bg-[#f8fafc]">
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-[#1e293b]">{h.judul}</p>
                                                <p className="text-[#64748b] text-xs line-clamp-1">{h.pesan}</p>
                                            </td>
                                            <td className="px-4 py-3 text-[#475569]">{h.jumlah_penerima}</td>
                                            <td className="px-4 py-3 text-[#475569]">{h.jumlah_dibaca}/{h.jumlah_penerima}</td>
                                            <td className="px-4 py-3 text-[#64748b] text-xs">{h.dikirim_pada}</td>
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
