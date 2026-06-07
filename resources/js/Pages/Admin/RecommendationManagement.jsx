import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

const STATUS_LABEL = { completion: 'Sistem', manual: 'Manual' };

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

function Flash({ message }) {
    if (!message) return null;
    return (
        <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium px-4 py-3">
            {message}
        </div>
    );
}

export default function RecommendationManagement({ logs, petani = [], areas = [], filters = {}, flash = {} }) {
    const [showAddModal,  setShowAddModal]  = useState(false);
    const [editTarget,    setEditTarget]    = useState(null);   // { id, description }
    const [deleteTarget,  setDeleteTarget]  = useState(null);   // { id, title }

    /* ── Form tambah manual ─── */
    const addForm = useForm({ user_id: '', area_id: '', description: '' });
    const areaOptions = addForm.data.user_id
        ? areas.filter((a) => String(a.user_id) === String(addForm.data.user_id))
        : [];

    const handleAddSubmit = (e) => {
        e.preventDefault();
        addForm.post(route('admin.rekomendasi.store'), {
            preserveScroll: true,
            onSuccess: () => { addForm.reset(); setShowAddModal(false); },
        });
    };

    /* ── Form edit ─── */
    const editForm = useForm({ description: '' });

    const openEdit = (log) => {
        setEditTarget(log);
        editForm.setData('description', log.recommendation?.description ?? '');
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        editForm.put(route('admin.rekomendasi.update', editTarget.id), {
            preserveScroll: true,
            onSuccess: () => { setEditTarget(null); editForm.reset(); },
        });
    };

    /* ── Hapus ─── */
    const confirmDelete = (log) => setDeleteTarget(log);

    const handleDelete = () => {
        router.delete(route('admin.rekomendasi.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    };

    /* ── Filter ─── */
    const applyFilter = (key, value) => {
        router.get(route('admin.rekomendasi.index'), { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    };

    const inputClass = 'w-full rounded-xl bg-slate-800 border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-emerald-500 focus:border-emerald-500';

    return (
        <AdminLayout title="Manajemen Rekomendasi" currentRoute="admin.rekomendasi.index">
            <Head title="Manajemen Rekomendasi" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">

                {/* Header */}
                <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Manajemen Rekomendasi</h1>
                        <p className="text-sm text-slate-400">Monitor rekomendasi sistem dan kelola rekomendasi manual untuk petani.</p>
                    </div>
                    <button
                        dusk="btn-tambah-rekomendasi"
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
                    >
                        <span className="text-lg leading-none">+</span> Tambah Manual
                    </button>
                </div>

                <Flash message={flash?.success} />

                {/* Filter */}
                <div className="flex flex-wrap gap-3 mb-5">
                    <select
                        dusk="filter-petani"
                        value={filters.petani ?? ''}
                        onChange={(e) => applyFilter('petani', e.target.value)}
                        className="rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="">Semua Petani</option>
                        {petani.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
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
                        <button onClick={() => router.get(route('admin.rekomendasi.index'))} className="text-sm text-slate-400 hover:text-white px-2">
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
                                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Tanggal</th>
                                    <th className="px-4 py-3 text-left font-semibold">Petani</th>
                                    <th className="px-4 py-3 text-left font-semibold">Lahan</th>
                                    <th className="px-4 py-3 text-left font-semibold">Rekomendasi</th>
                                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Urgensi</th>
                                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold sticky right-0 bg-slate-900">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td dusk="empty-state" colSpan={7} className="px-4 py-12 text-center text-slate-500">
                                            Belum ada data rekomendasi.
                                        </td>
                                    </tr>
                                ) : logs.data.map((log) => {
                                    const lahan    = log.agricultural_area?.name ?? log.observation?.agricultural_area?.name ?? '—';
                                    const urgency  = log.recommendation?.urgency ?? '—';
                                    const colorCls = URGENCY_COLOR[urgency] ?? URGENCY_COLOR.RENDAH;
                                    const isManual = log.action_type === 'manual';
                                    const statusCls = isManual
                                        ? 'text-blue-400 bg-blue-500/10 border-blue-500/30'
                                        : 'text-slate-400 bg-slate-500/10 border-slate-500/30';

                                    return (
                                        <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                                            <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">
                                                {new Date(log.performed_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                            </td>
                                            <td className="px-4 py-3 text-white font-medium whitespace-nowrap">
                                                {log.user?.name ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{lahan}</td>
                                            <td className="px-4 py-3 max-w-[260px]">
                                                <p className="text-white font-medium truncate">{log.recommendation?.title ?? '—'}</p>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <Badge label={urgency} colorClass={colorCls} />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <Badge label={STATUS_LABEL[log.action_type] ?? log.action_type} colorClass={statusCls} />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap sticky right-0 bg-slate-900 group-hover:bg-slate-800/40">
                                                {isManual ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            dusk={`btn-edit-rekomendasi-${log.id}`}
                                                            onClick={() => openEdit(log)}
                                                            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <span className="text-slate-700">|</span>
                                                        <button
                                                            dusk={`btn-hapus-rekomendasi-${log.id}`}
                                                            onClick={() => confirmDelete(log)}
                                                            className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-600">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {logs.last_page > 1 && (
                        <div className="px-5 py-4 border-t border-slate-800 flex justify-between items-center text-sm text-slate-400">
                            <span>Halaman {logs.current_page} dari {logs.last_page} ({logs.total} data)</span>
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

            {/* ── Modal Tambah Manual ── */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div dusk="modal-form-rekomendasi" className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-white">Tambah Rekomendasi Manual</h2>
                            <button onClick={() => { setShowAddModal(false); addForm.reset(); }} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-1">Petani</label>
                                <select
                                    dusk="input-petani-manual"
                                    value={addForm.data.user_id}
                                    onChange={(e) => addForm.setData(d => ({ ...d, user_id: e.target.value, area_id: '' }))}
                                    className={inputClass}
                                >
                                    <option value="">— Pilih Petani —</option>
                                    {petani.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                {addForm.errors.user_id && <p className="text-xs text-red-400 mt-1">{addForm.errors.user_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-1">Lahan</label>
                                <select
                                    dusk="input-lahan-manual"
                                    value={addForm.data.area_id}
                                    onChange={(e) => addForm.setData('area_id', e.target.value)}
                                    className={inputClass}
                                    disabled={!addForm.data.user_id}
                                >
                                    <option value="">— Pilih Lahan —</option>
                                    {areaOptions.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                                {!addForm.data.user_id && <p className="text-xs text-slate-500 mt-1">Pilih petani terlebih dahulu.</p>}
                                {addForm.errors.area_id && <p className="text-xs text-red-400 mt-1">{addForm.errors.area_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-1">Isi Rekomendasi</label>
                                <textarea
                                    dusk="input-isi-rekomendasi"
                                    value={addForm.data.description}
                                    onChange={(e) => addForm.setData('description', e.target.value)}
                                    rows={4}
                                    placeholder="Tulis rekomendasi untuk petani ini…"
                                    className={inputClass + ' resize-none'}
                                />
                                {addForm.errors.description && <p className="text-xs text-red-400 mt-1">{addForm.errors.description}</p>}
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => { setShowAddModal(false); addForm.reset(); }}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-colors">
                                    Batal
                                </button>
                                <button dusk="btn-simpan-manual" type="submit" disabled={addForm.processing}
                                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                                    {addForm.processing ? 'Menyimpan…' : 'Simpan Rekomendasi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Modal Edit ── */}
            {editTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div dusk="modal-edit-rekomendasi" className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-white">Edit Rekomendasi</h2>
                            <button onClick={() => { setEditTarget(null); editForm.reset(); }} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
                        </div>

                        <p className="text-xs text-slate-500 mb-4">
                            Petani: <span className="text-slate-300 font-medium">{editTarget.user?.name}</span>
                            {' · '}
                            Lahan: <span className="text-slate-300 font-medium">
                                {editTarget.agricultural_area?.name ?? editTarget.observation?.agricultural_area?.name ?? '—'}
                            </span>
                        </p>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-1">Isi Rekomendasi</label>
                                <textarea
                                    dusk="input-edit-rekomendasi"
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                    rows={4}
                                    className={inputClass + ' resize-none'}
                                />
                                {editForm.errors.description && <p className="text-xs text-red-400 mt-1">{editForm.errors.description}</p>}
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => { setEditTarget(null); editForm.reset(); }}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-colors">
                                    Batal
                                </button>
                                <button dusk="btn-simpan-edit" type="submit" disabled={editForm.processing}
                                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                                    {editForm.processing ? 'Menyimpan…' : 'Perbarui'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Konfirmasi Hapus ── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div dusk="modal-konfirmasi-hapus" className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <h2 className="text-lg font-bold text-white mb-2">Hapus Rekomendasi?</h2>
                        <p className="text-sm text-slate-400 mb-5">
                            Rekomendasi untuk <span className="text-white font-medium">{deleteTarget.user?.name}</span> akan dihapus permanen.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-colors">
                                Batal
                            </button>
                            <button dusk="btn-konfirmasi-hapus" onClick={handleDelete}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors">
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
