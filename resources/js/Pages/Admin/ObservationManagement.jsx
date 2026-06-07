import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

const inputClass =
    'w-full rounded-xl bg-slate-800 border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-emerald-500 focus:border-emerald-500';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const OPSI = {
    planting_cycle:     ['MT1', 'MT2', 'MT3'],
    soil_moisture:      ['Kering', 'Normal', 'Lembab', 'Sangat Basah'],
    water_puddle:       ['Tidak Ada', 'Sedikit', 'Sedang', 'Banyak'],
    crop_condition:     ['Kritis', 'Kurang Baik', 'Baik', 'Sangat Baik'],
    pest_indication:    ['Tidak Ada', 'Ringan', 'Sedang', 'Berat'],
    disease_indication: ['Tidak Ada', 'Ringan', 'Sedang', 'Berat'],
};

const LABEL = {
    crop_condition:     'Kondisi Tanaman',
    soil_moisture:      'Kelembapan Tanah',
    water_puddle:       'Genangan Air',
    pest_indication:    'Indikasi Hama',
    disease_indication: 'Indikasi Penyakit',
};

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

export default function ObservationManagement({ observations, petani = [], lahan = [], filters = {}, detail = null }) {
    const { flash = {} } = usePage().props;

    const [detailRow,     setDetailRow]     = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [editTarget,    setEditTarget]    = useState(null);
    const [deleteTarget,  setDeleteTarget]  = useState(null);

    const lahanOptions = filters.petani
        ? lahan.filter((l) => String(l.user_id) === String(filters.petani))
        : lahan;

    /* ── Filter ── */
    const applyFilter = (key, value) => {
        const next = { ...filters, [key]: value || undefined };
        if (key === 'petani') next.lahan = undefined; // reset lahan saat ganti petani
        router.get(route('admin.observasi.index'), next, { preserveState: true, replace: true });
    };
    const resetFilter = () => router.get(route('admin.observasi.index'));

    /* ── Detail (lazy) ── */
    const openDetail = (o) => {
        setDetailRow(o);
        setDetailLoading(true);
        router.reload({ only: ['detail'], data: { detail_id: o.id }, preserveScroll: true, onFinish: () => setDetailLoading(false) });
    };

    /* ── Edit ── */
    const editForm = useForm({
        observation_date: '', planting_cycle: '', soil_moisture: '', water_puddle: '',
        crop_condition: '', pest_indication: '', disease_indication: '', notes: '',
    });
    const openEdit = (o) => {
        setDetailRow(null);
        setEditTarget(o);
        // ambil detail untuk prefill lengkap
        router.reload({ only: ['detail'], data: { detail_id: o.id }, preserveScroll: true });
    };
    // prefill form saat detail untuk editTarget tiba
    useEffect(() => {
        if (editTarget && detail && detail.id === editTarget.id) {
            editForm.setData({
                observation_date:   detail.observation_date ? String(detail.observation_date).substring(0, 10) : '',
                planting_cycle:     detail.planting_cycle ?? '',
                soil_moisture:      detail.soil_moisture ?? '',
                water_puddle:       detail.water_puddle ?? '',
                crop_condition:     detail.crop_condition ?? '',
                pest_indication:    detail.pest_indication ?? '',
                disease_indication: detail.disease_indication ?? '',
                notes:              detail.notes ?? '',
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editTarget, detail]);

    const submitEdit = (e) => {
        e.preventDefault();
        editForm.put(route('admin.observasi.update', editTarget.id), {
            preserveScroll: true,
            onSuccess: () => { setEditTarget(null); editForm.reset(); },
        });
    };

    /* ── Hapus ── */
    const handleDelete = () => {
        router.delete(route('admin.observasi.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    };

    const d = (!detailLoading && detail && detail.id === detailRow?.id) ? detail : null;

    return (
        <AdminLayout title="Manajemen Observasi">
            <Head title="Manajemen Observasi" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <div className="mb-5">
                    <h1 className="text-2xl font-bold text-white">Manajemen Observasi</h1>
                    <p className="text-sm text-slate-400">Pantau dan kelola seluruh observasi lapangan dari semua petani.</p>
                </div>

                <Flash message={flash?.success} />

                {/* Filter */}
                <div className="flex flex-wrap gap-3 mb-5">
                    <select dusk="filter-petani-obs" value={filters.petani ?? ''} onChange={(e) => applyFilter('petani', e.target.value)}
                        className="rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500">
                        <option value="">Semua Petani</option>
                        {petani.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select dusk="filter-lahan-obs" value={filters.lahan ?? ''} onChange={(e) => applyFilter('lahan', e.target.value)}
                        className="rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500">
                        <option value="">Semua Lahan</option>
                        {lahanOptions.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    <input dusk="filter-tanggal-obs" type="date" value={filters.tanggal ?? ''} onChange={(e) => applyFilter('tanggal', e.target.value)}
                        className="rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500" />
                    {(filters.petani || filters.lahan || filters.tanggal) && (
                        <button onClick={resetFilter} className="text-sm text-slate-400 hover:text-white px-2">Reset</button>
                    )}
                </div>

                {/* Tabel */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto scrollbar-slim">
                        <table dusk="observasi-table" className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wide">
                                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Tanggal</th>
                                    <th className="px-4 py-3 text-left font-semibold">Petani</th>
                                    <th className="px-4 py-3 text-left font-semibold">Lahan</th>
                                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Kondisi Tanaman</th>
                                    <th className="px-4 py-3 text-left font-semibold">Hama</th>
                                    <th className="px-4 py-3 text-left font-semibold">Penyakit</th>
                                    <th className="px-4 py-3 text-right font-semibold sticky right-0 bg-slate-900">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {observations.data.length === 0 ? (
                                    <tr>
                                        <td dusk="empty-state" colSpan={7} className="px-4 py-12 text-center text-slate-500">
                                            Belum ada data observasi.
                                        </td>
                                    </tr>
                                ) : observations.data.map((o) => (
                                    <tr key={o.id} dusk={`observasi-row-${o.id}`} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">{fmtDate(o.observation_date)}</td>
                                        <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{o.petani ?? '—'}</td>
                                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{o.lahan ?? '—'}</td>
                                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{o.crop_condition ?? '—'}</td>
                                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{o.pest_indication ?? '—'}</td>
                                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{o.disease_indication ?? '—'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap sticky right-0 bg-slate-900">
                                            <div className="flex items-center gap-1 justify-end">
                                                <IconAction dusk={`btn-detail-obs-${o.id}`} title="Detail" onClick={() => openDetail(o)} colorClass="text-slate-300 hover:text-white">{icons.detail}</IconAction>
                                                <IconAction dusk={`btn-edit-obs-${o.id}`} title="Edit observasi" onClick={() => openEdit(o)} colorClass="text-emerald-400 hover:text-emerald-300">{icons.edit}</IconAction>
                                                <IconAction dusk={`btn-hapus-obs-${o.id}`} title="Hapus observasi" onClick={() => setDeleteTarget(o)} colorClass="text-red-400 hover:text-red-300">{icons.trash}</IconAction>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {observations.last_page > 1 && (
                        <div className="px-5 py-4 border-t border-slate-800 flex justify-between items-center text-sm text-slate-400">
                            <span>Halaman {observations.current_page} dari {observations.last_page} ({observations.total} observasi)</span>
                            <div className="flex gap-2">
                                {observations.prev_page_url && <button onClick={() => router.get(observations.prev_page_url)} className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200">← Prev</button>}
                                {observations.next_page_url && <button onClick={() => router.get(observations.next_page_url)} className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200">Next →</button>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modal Detail ── */}
            {detailRow && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
                    <div dusk="modal-detail-obs" className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[88vh] overflow-y-auto scrollbar-slim">
                        <div className="flex items-start justify-between mb-5 gap-3">
                            <div>
                                <h2 className="text-lg font-bold text-white leading-tight">Observasi {fmtDate(detailRow.observation_date)}</h2>
                                <p className="text-sm text-slate-400">{detailRow.petani ?? '—'} · {detailRow.lahan ?? '—'}</p>
                            </div>
                            <button onClick={() => setDetailRow(null)} className="text-slate-400 hover:text-white text-xl leading-none shrink-0">×</button>
                        </div>

                        {!d ? (
                            <div className="py-10 text-center text-slate-500 text-sm">Memuat detail…</div>
                        ) : (
                            <div className="space-y-5 text-sm">
                                <section>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Kondisi Lapangan</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-800 rounded-xl p-3"><p className="text-xs text-slate-500 mb-0.5">Musim Tanam</p><p className="text-slate-200">{d.planting_cycle || '—'}</p></div>
                                        <div className="bg-slate-800 rounded-xl p-3"><p className="text-xs text-slate-500 mb-0.5">Kondisi Tanaman</p><p className="text-slate-200">{d.crop_condition || '—'}</p></div>
                                        <div className="bg-slate-800 rounded-xl p-3"><p className="text-xs text-slate-500 mb-0.5">Kelembapan Tanah</p><p className="text-slate-200">{d.soil_moisture || '—'}</p></div>
                                        <div className="bg-slate-800 rounded-xl p-3"><p className="text-xs text-slate-500 mb-0.5">Genangan Air</p><p className="text-slate-200">{d.water_puddle || '—'}</p></div>
                                        <div className="bg-slate-800 rounded-xl p-3"><p className="text-xs text-slate-500 mb-0.5">Indikasi Hama</p><p className="text-slate-200">{d.pest_indication || '—'}</p></div>
                                        <div className="bg-slate-800 rounded-xl p-3"><p className="text-xs text-slate-500 mb-0.5">Indikasi Penyakit</p><p className="text-slate-200">{d.disease_indication || '—'}</p></div>
                                        <div className="bg-slate-800 rounded-xl p-3 col-span-2"><p className="text-xs text-slate-500 mb-0.5">Catatan</p><p className="text-slate-200 whitespace-pre-line">{d.notes || '—'}</p></div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Cuaca Saat Observasi</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        <div className="bg-slate-800 rounded-xl p-3"><p className="text-xs text-slate-500 mb-0.5">Suhu</p><p className="text-slate-200">{d.weather.temp ?? '—'} °C</p></div>
                                        <div className="bg-slate-800 rounded-xl p-3"><p className="text-xs text-slate-500 mb-0.5">Kelembapan</p><p className="text-slate-200">{d.weather.humidity ?? '—'} %</p></div>
                                        <div className="bg-slate-800 rounded-xl p-3"><p className="text-xs text-slate-500 mb-0.5">Angin</p><p className="text-slate-200">{d.weather.wind_kph ?? '—'} kph</p></div>
                                        <div className="bg-slate-800 rounded-xl p-3"><p className="text-xs text-slate-500 mb-0.5">Curah Hujan</p><p className="text-slate-200">{d.weather.precip_mm ?? '—'} mm</p></div>
                                        <div className="bg-slate-800 rounded-xl p-3"><p className="text-xs text-slate-500 mb-0.5">Lembab Tanah</p><p className="text-slate-200">{d.weather.soil_moisture ?? '—'}</p></div>
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Modal Edit ── */}
            {editTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
                    <div dusk="modal-edit-obs" className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[88vh] overflow-y-auto scrollbar-slim">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-white">Edit Observasi</h2>
                            <button onClick={() => { setEditTarget(null); editForm.reset(); }} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
                        </div>
                        <form onSubmit={submitEdit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-200 mb-1.5">Tanggal Observasi</label>
                                    <input dusk="input-edit-tanggal-obs" type="date" value={editForm.data.observation_date} onChange={(e) => editForm.setData('observation_date', e.target.value)} className={inputClass} />
                                    {editForm.errors.observation_date && <p className="text-xs text-red-400 mt-1">{editForm.errors.observation_date}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-200 mb-1.5">Musim Tanam</label>
                                    <select value={editForm.data.planting_cycle} onChange={(e) => editForm.setData('planting_cycle', e.target.value)} className={inputClass}>
                                        <option value="">—</option>
                                        {OPSI.planting_cycle.map((v) => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {['crop_condition', 'soil_moisture', 'water_puddle', 'pest_indication', 'disease_indication'].map((field) => (
                                    <div key={field}>
                                        <label className="block text-sm font-semibold text-slate-200 mb-1.5">{LABEL[field]}</label>
                                        <select value={editForm.data[field]} onChange={(e) => editForm.setData(field, e.target.value)} className={inputClass}>
                                            <option value="">—</option>
                                            {OPSI[field].map((v) => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-1.5">Catatan</label>
                                <textarea rows={3} value={editForm.data.notes} onChange={(e) => editForm.setData('notes', e.target.value)} className={inputClass} />
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => { setEditTarget(null); editForm.reset(); }} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800">Batal</button>
                                <button dusk="btn-simpan-edit-obs" type="submit" disabled={editForm.processing} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold disabled:opacity-50">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Konfirmasi Hapus ── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div dusk="modal-konfirmasi-hapus-obs" className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <h2 className="text-lg font-bold text-white mb-2">Hapus Observasi?</h2>
                        <p className="text-sm text-slate-400 mb-5">
                            Observasi <span className="text-white font-medium">{fmtDate(deleteTarget.observation_date)}</span> milik <span className="text-white font-medium">{deleteTarget.petani}</span> akan dihapus permanen.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800">Batal</button>
                            <button dusk="btn-konfirmasi-hapus-obs" onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold">Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
