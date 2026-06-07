import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

const STATUS_LABEL = {
    completion: 'Sistem',
    manual:     'Manual',
};

const URGENCY_COLOR = {
    SEGERA:    'text-red-400 bg-red-500/10 border-red-500/30',
    TINGGI:    'text-amber-400 bg-amber-500/10 border-amber-500/30',
    TERENCANA: 'text-green-400 bg-green-500/10 border-green-500/30',
    RENDAH:    'text-slate-400 bg-slate-500/10 border-slate-500/30',
};

function Badge({ label, colorClass }) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
            {label}
        </span>
    );
}

export default function RecommendationManagement({ logs, petani = [], areas = [], filters = {} }) {
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        user_id:     '',
        area_id:     '',
        description: '',
    });

    const areaOptions = data.user_id
        ? areas.filter((a) => String(a.user_id) === String(data.user_id))
        : [];

    const handlePetaniChange = (userId) => {
        setData(d => ({ ...d, user_id: userId, area_id: '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.rekomendasi.store'), {
            preserveScroll: true,
            onSuccess: () => { reset(); setShowModal(false); setAreaOptions([]); },
        });
    };

    const applyFilter = (key, value) => {
        router.get(route('admin.rekomendasi.index'), { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    };

    const inputClass = 'w-full rounded-xl bg-slate-800 border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-emerald-500 focus:border-emerald-500';

    return (
        <AdminLayout title="Manajemen Rekomendasi" currentRoute="admin.rekomendasi.index">
            <Head title="Manajemen Rekomendasi" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Manajemen Rekomendasi</h1>
                        <p className="text-sm text-slate-400">Monitor rekomendasi sistem dan kelola rekomendasi manual untuk petani.</p>
                    </div>
                    <button
                        dusk="btn-tambah-rekomendasi"
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
                    >
                        <span className="text-lg leading-none">+</span> Tambah Manual
                    </button>
                </div>

                {/* Filter */}
                <div className="flex flex-wrap gap-3 mb-5">
                    <select
                        dusk="filter-petani"
                        value={filters.petani ?? ''}
                        onChange={(e) => applyFilter('petani', e.target.value)}
                        className="rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="">Semua Petani</option>
                        {petani.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>

                    <select
                        dusk="filter-status"
                        value={filters.status ?? ''}
                        onChange={(e) => applyFilter('status', e.target.value)}
                        className="rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="">Semua Status</option>
                        <option value="completion">Sistem</option>
                        <option value="manual">Manual</option>
                    </select>

                    {(filters.petani || filters.status) && (
                        <button
                            onClick={() => router.get(route('admin.rekomendasi.index'))}
                            className="text-sm text-slate-400 hover:text-white transition-colors px-2"
                        >
                            Reset filter
                        </button>
                    )}
                </div>

                {/* Tabel */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wide">
                                    <th className="px-5 py-3 text-left font-semibold">Tanggal</th>
                                    <th className="px-5 py-3 text-left font-semibold">Petani</th>
                                    <th className="px-5 py-3 text-left font-semibold">Lahan</th>
                                    <th className="px-5 py-3 text-left font-semibold">Rekomendasi</th>
                                    <th className="px-5 py-3 text-left font-semibold">Urgensi</th>
                                    <th className="px-5 py-3 text-left font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td dusk="empty-state" colSpan={6} className="px-5 py-12 text-center text-slate-500">
                                            Belum ada data rekomendasi.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => {
                                        const lahan = log.agricultural_area?.name
                                            ?? log.observation?.agricultural_area?.name
                                            ?? '—';
                                        const urgency  = log.recommendation?.urgency ?? '—';
                                        const colorCls = URGENCY_COLOR[urgency] ?? URGENCY_COLOR.RENDAH;
                                        const statusCls = log.action_type === 'manual'
                                            ? 'text-blue-400 bg-blue-500/10 border-blue-500/30'
                                            : 'text-slate-400 bg-slate-500/10 border-slate-500/30';

                                        return (
                                            <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                                                <td className="px-5 py-3 text-slate-300 whitespace-nowrap">
                                                    {new Date(log.performed_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <p className="text-white font-medium">{log.user?.name ?? '—'}</p>
                                                    <p className="text-xs text-slate-500">{log.user?.email}</p>
                                                </td>
                                                <td className="px-5 py-3 text-slate-300">{lahan}</td>
                                                <td className="px-5 py-3 max-w-xs">
                                                    <p className="text-white font-medium truncate">{log.recommendation?.title ?? '—'}</p>
                                                    <p className="text-xs text-slate-500 truncate">{log.recommendation?.category}</p>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <Badge label={urgency} colorClass={colorCls} />
                                                </td>
                                                <td className="px-5 py-3">
                                                    <Badge
                                                        label={STATUS_LABEL[log.action_type] ?? log.action_type}
                                                        colorClass={statusCls}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {logs.last_page > 1 && (
                        <div className="px-5 py-4 border-t border-slate-800 flex justify-between items-center text-sm text-slate-400">
                            <span>Halaman {logs.current_page} dari {logs.last_page}</span>
                            <div className="flex gap-2">
                                {logs.prev_page_url && (
                                    <button onClick={() => router.get(logs.prev_page_url)} className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors">← Prev</button>
                                )}
                                {logs.next_page_url && (
                                    <button onClick={() => router.get(logs.next_page_url)} className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors">Next →</button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Tambah Manual */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div
                        dusk="modal-form-rekomendasi"
                        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-white">Tambah Rekomendasi Manual</h2>
                            <button onClick={() => { setShowModal(false); reset(); setAreaOptions([]); }} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
                        </div>

                        {recentlySuccessful && (
                            <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium px-4 py-3">
                                Rekomendasi berhasil dikirim.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-1">Petani</label>
                                <select
                                    dusk="input-petani-manual"
                                    value={data.user_id}
                                    onChange={(e) => handlePetaniChange(e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">— Pilih Petani —</option>
                                    {petani.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                {errors.user_id && <p className="text-xs text-red-400 mt-1">{errors.user_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-1">Lahan</label>
                                <select
                                    dusk="input-lahan-manual"
                                    value={data.area_id}
                                    onChange={(e) => setData('area_id', e.target.value)}
                                    className={inputClass}
                                    disabled={!data.user_id}
                                >
                                    <option value="">— Pilih Lahan —</option>
                                    {areaOptions.map((a) => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                                {!data.user_id && (
                                    <p className="text-xs text-slate-500 mt-1">Pilih petani terlebih dahulu.</p>
                                )}
                                {errors.area_id && <p className="text-xs text-red-400 mt-1">{errors.area_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-1">Isi Rekomendasi</label>
                                <textarea
                                    dusk="input-isi-rekomendasi"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    placeholder="Tulis rekomendasi untuk petani ini…"
                                    className={inputClass + ' resize-none'}
                                />
                                {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); reset(); setAreaOptions([]); }}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    dusk="btn-simpan-manual"
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-60"
                                >
                                    {processing ? 'Menyimpan…' : 'Simpan Rekomendasi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
