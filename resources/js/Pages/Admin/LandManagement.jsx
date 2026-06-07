import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

const inputClass =
    'w-full rounded-xl bg-slate-800 border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-emerald-500 focus:border-emerald-500';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function Flash({ message }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        if (!message) return;
        setVisible(true);
        const t = setTimeout(() => setVisible(false), 6000);
        return () => clearTimeout(t);
    }, [message]);
    if (!message || !visible) return null;
    return (
        <div className="mb-4 flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-medium px-4 py-3">
            <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</span>
            <span className="flex-1 leading-snug">{message}</span>
            <button onClick={() => setVisible(false)} className="shrink-0 text-emerald-400/70 hover:text-emerald-200 text-lg leading-none">×</button>
        </div>
    );
}

function IconAction({ title, onClick, colorClass, dusk, children }) {
    return (
        <button dusk={dusk} onClick={onClick} title={title} aria-label={title}
            className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${colorClass}`}>
            {children}
        </button>
    );
}

const icons = {
    detail: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>,
    edit:   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>,
    trash:  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>,
};

export default function LandManagement({ areas, petani = [], filters = {}, detail = null }) {
    const { flash = {} } = usePage().props;

    const [search,        setSearch]        = useState(filters.search ?? '');
    const [detailRow,     setDetailRow]     = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [editTarget,    setEditTarget]    = useState(null);
    const [deleteTarget,  setDeleteTarget]  = useState(null);

    /* ── Filter & search ── */
    const submitSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.lahan.index'), { ...filters, search: search || undefined }, { preserveState: true, replace: true });
    };
    const applyPetani = (value) => {
        router.get(route('admin.lahan.index'), { ...filters, petani: value || undefined }, { preserveState: true, replace: true });
    };
    const resetFilter = () => { setSearch(''); router.get(route('admin.lahan.index')); };

    /* ── Detail (lazy) ── */
    const openDetail = (a) => {
        setDetailRow(a);
        setDetailLoading(true);
        router.reload({ only: ['detail'], data: { detail_id: a.id }, preserveScroll: true, onFinish: () => setDetailLoading(false) });
    };

    /* ── Edit ── */
    const editForm = useForm({ name: '', location_name: '', area_size: '', soil_type: '', notes: '' });
    const openEdit = (a) => {
        setEditTarget(a);
        editForm.setData({
            name: a.name ?? '', location_name: a.location_name ?? '',
            area_size: a.area_size ?? '', soil_type: a.soil_type ?? '', notes: a.notes ?? '',
        });
    };
    const submitEdit = (e) => {
        e.preventDefault();
        editForm.put(route('admin.lahan.update', editTarget.id), {
            preserveScroll: true,
            onSuccess: () => { setEditTarget(null); editForm.reset(); },
        });
    };

    /* ── Hapus ── */
    const handleDelete = () => {
        router.delete(route('admin.lahan.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    };

    const d = (!detailLoading && detail && detail.area?.id === detailRow?.id) ? detail : null;

    return (
        <AdminLayout title="Manajemen Lahan">
            <Head title="Manajemen Lahan" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <div className="mb-5">
                    <h1 className="text-2xl font-bold text-white">Manajemen Lahan</h1>
                    <p className="text-sm text-slate-400">Pantau dan kelola seluruh lahan dari semua petani.</p>
                </div>

                <Flash message={flash?.success} />

                {/* Filter */}
                <div className="flex flex-wrap gap-3 mb-5">
                    <form onSubmit={submitSearch} className="flex-1 min-w-[220px]">
                        <input dusk="input-search-lahan" type="text" value={search}
                            onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama lahan…" className={inputClass} />
                    </form>
                    <select dusk="filter-petani-lahan" value={filters.petani ?? ''} onChange={(e) => applyPetani(e.target.value)}
                        className="rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500">
                        <option value="">Semua Petani</option>
                        {petani.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    {(filters.search || filters.petani) && (
                        <button onClick={resetFilter} className="text-sm text-slate-400 hover:text-white px-2">Reset</button>
                    )}
                </div>

                {/* Tabel */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto scrollbar-slim">
                        <table dusk="lahan-table" className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wide">
                                    <th className="px-4 py-3 text-left font-semibold">Petani</th>
                                    <th className="px-4 py-3 text-left font-semibold">Lahan</th>
                                    <th className="px-4 py-3 text-left font-semibold">Lokasi</th>
                                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Luas (ha)</th>
                                    <th className="px-4 py-3 text-left font-semibold">Jenis Tanah</th>
                                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Observasi</th>
                                    <th className="px-4 py-3 text-right font-semibold sticky right-0 bg-slate-900">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {areas.data.length === 0 ? (
                                    <tr>
                                        <td dusk="empty-state" colSpan={7} className="px-4 py-12 text-center text-slate-500">
                                            {filters.search ? 'Lahan tidak ditemukan.' : 'Belum ada data lahan.'}
                                        </td>
                                    </tr>
                                ) : areas.data.map((a) => (
                                    <tr key={a.id} dusk={`lahan-row-${a.id}`} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{a.owner ?? '—'}</td>
                                        <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{a.name}</td>
                                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{a.location_name || '—'}</td>
                                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{a.area_size ?? '—'}</td>
                                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{a.soil_type || '—'}</td>
                                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{a.observations_count}</td>
                                        <td className="px-4 py-3 whitespace-nowrap sticky right-0 bg-slate-900">
                                            <div className="flex items-center gap-1 justify-end">
                                                <IconAction dusk={`btn-detail-lahan-${a.id}`} title="Detail" onClick={() => openDetail(a)} colorClass="text-slate-300 hover:text-white">{icons.detail}</IconAction>
                                                <IconAction dusk={`btn-edit-lahan-${a.id}`} title="Edit lahan" onClick={() => openEdit(a)} colorClass="text-emerald-400 hover:text-emerald-300">{icons.edit}</IconAction>
                                                <IconAction dusk={`btn-hapus-lahan-${a.id}`} title="Hapus lahan" onClick={() => setDeleteTarget(a)} colorClass="text-red-400 hover:text-red-300">{icons.trash}</IconAction>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {areas.last_page > 1 && (
                        <div className="px-5 py-4 border-t border-slate-800 flex justify-between items-center text-sm text-slate-400">
                            <span>Halaman {areas.current_page} dari {areas.last_page} ({areas.total} lahan)</span>
                            <div className="flex gap-2">
                                {areas.prev_page_url && <button onClick={() => router.get(areas.prev_page_url)} className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200">← Prev</button>}
                                {areas.next_page_url && <button onClick={() => router.get(areas.next_page_url)} className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200">Next →</button>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modal Detail ── */}
            {detailRow && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
                    <div dusk="modal-detail-lahan" className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[88vh] overflow-y-auto scrollbar-slim">
                        <div className="flex items-start justify-between mb-5 gap-3">
                            <div>
                                <h2 className="text-lg font-bold text-white leading-tight">{detailRow.name}</h2>
                                <p className="text-sm text-slate-400">Milik {detailRow.owner ?? '—'}</p>
                            </div>
                            <button onClick={() => setDetailRow(null)} className="text-slate-400 hover:text-white text-xl leading-none shrink-0">×</button>
                        </div>

                        {!d ? (
                            <div className="py-10 text-center text-slate-500 text-sm">Memuat detail…</div>
                        ) : (
                            <div className="space-y-5 text-sm">
                                <section>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Informasi Lahan</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-800 rounded-xl p-3"><p className="text-xs text-slate-500 mb-0.5">Lokasi</p><p className="text-slate-200">{d.area.location_name || '—'}</p></div>
                                        <div className="bg-slate-800 rounded-xl p-3"><p className="text-xs text-slate-500 mb-0.5">Luas</p><p className="text-slate-200">{d.area.area_size ?? '—'} ha</p></div>
                                        <div className="bg-slate-800 rounded-xl p-3"><p className="text-xs text-slate-500 mb-0.5">Jenis Tanah</p><p className="text-slate-200">{d.area.soil_type || '—'}</p></div>
                                        <div className="bg-slate-800 rounded-xl p-3"><p className="text-xs text-slate-500 mb-0.5">Terdaftar</p><p className="text-slate-200">{fmtDate(d.area.created_at)}</p></div>
                                        <div className="bg-slate-800 rounded-xl p-3 col-span-2"><p className="text-xs text-slate-500 mb-0.5">Catatan</p><p className="text-slate-200 whitespace-pre-line">{d.area.notes || '—'}</p></div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Riwayat Observasi ({d.observations.length})</h3>
                                    {d.observations.length > 0 ? (
                                        <div className="space-y-2">
                                            {d.observations.map((o) => (
                                                <div key={o.id} className="bg-slate-800 rounded-xl p-3">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="text-slate-200 font-medium">{fmtDate(o.observation_date)}</span>
                                                        <span className="text-xs text-slate-400">{o.crop_condition ?? '—'}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-400">
                                                        <span>Kelembapan: <span className="text-slate-300">{o.soil_moisture ?? '—'}</span></span>
                                                        <span>Genangan: <span className="text-slate-300">{o.water_puddle ?? '—'}</span></span>
                                                        <span>Hama: <span className="text-slate-300">{o.pest_indication ?? '—'}</span></span>
                                                        <span>Penyakit: <span className="text-slate-300">{o.disease_indication ?? '—'}</span></span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 bg-slate-800 rounded-xl p-3">Belum ada observasi pada lahan ini.</p>
                                    )}
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Modal Edit ── */}
            {editTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div dusk="modal-edit-lahan" className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-white">Edit Data Lahan</h2>
                            <button onClick={() => { setEditTarget(null); editForm.reset(); }} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
                        </div>
                        <form onSubmit={submitEdit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-1.5">Nama Lahan</label>
                                <input dusk="input-edit-nama-lahan" type="text" value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} className={inputClass} />
                                {editForm.errors.name && <p className="text-xs text-red-400 mt-1">{editForm.errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-1.5">Lokasi</label>
                                <input type="text" value={editForm.data.location_name} onChange={(e) => editForm.setData('location_name', e.target.value)} className={inputClass} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-200 mb-1.5">Luas (ha)</label>
                                    <input type="number" step="0.01" min="0" value={editForm.data.area_size} onChange={(e) => editForm.setData('area_size', e.target.value)} className={inputClass} />
                                    {editForm.errors.area_size && <p className="text-xs text-red-400 mt-1">{editForm.errors.area_size}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-200 mb-1.5">Jenis Tanah</label>
                                    <input type="text" value={editForm.data.soil_type} onChange={(e) => editForm.setData('soil_type', e.target.value)} className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-1.5">Catatan</label>
                                <textarea rows={3} value={editForm.data.notes} onChange={(e) => editForm.setData('notes', e.target.value)} className={inputClass} />
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => { setEditTarget(null); editForm.reset(); }} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800">Batal</button>
                                <button dusk="btn-simpan-edit-lahan" type="submit" disabled={editForm.processing} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold disabled:opacity-50">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Konfirmasi Hapus ── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div dusk="modal-konfirmasi-hapus-lahan" className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <h2 className="text-lg font-bold text-white mb-2">Hapus Lahan?</h2>
                        <p className="text-sm text-slate-400 mb-5">
                            Lahan <span className="text-white font-medium">{deleteTarget.name}</span> beserta <span className="text-white font-medium">seluruh observasinya</span> akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800">Batal</button>
                            <button dusk="btn-konfirmasi-hapus-lahan" onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold">Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
