import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

const inputClass =
    'w-full rounded-xl bg-slate-800 border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-emerald-500 focus:border-emerald-500';

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

function StatusBadge({ active }) {
    return (
        <span dusk="status-badge" className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
            active ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-red-400 bg-red-500/10 border-red-500/30'
        }`}>
            {active ? 'Aktif' : 'Nonaktif'}
        </span>
    );
}

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Belum ada';

export default function UserManagement({ users, filters = {} }) {
    const { flash = {} } = usePage().props;

    const [search,        setSearch]        = useState(filters.search ?? '');
    const [detailTarget,  setDetailTarget]  = useState(null);
    const [editTarget,    setEditTarget]    = useState(null);
    const [deleteTarget,  setDeleteTarget]  = useState(null);
    const [confirmAksi,   setConfirmAksi]   = useState(null); // {type:'reset'|'toggle', user}

    /* ── Search & filter ── */
    const submitSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.pengguna.index'), { ...filters, search: search || undefined }, { preserveState: true, replace: true });
    };
    const applyStatus = (value) => {
        router.get(route('admin.pengguna.index'), { ...filters, status: value || undefined }, { preserveState: true, replace: true });
    };
    const resetFilter = () => { setSearch(''); router.get(route('admin.pengguna.index')); };

    /* ── Edit ── */
    const editForm = useForm({ name: '', email: '', phone_number: '' });
    const openEdit = (u) => {
        setEditTarget(u);
        editForm.setData({ name: u.name ?? '', email: u.email ?? '', phone_number: u.phone_number ?? '' });
    };
    const submitEdit = (e) => {
        e.preventDefault();
        editForm.put(route('admin.pengguna.update', editTarget.id), {
            preserveScroll: true,
            onSuccess: () => { setEditTarget(null); editForm.reset(); },
        });
    };

    /* ── Reset password & toggle status ── */
    const runAksi = () => {
        if (!confirmAksi) return;
        const { type, user } = confirmAksi;
        if (type === 'reset') {
            router.post(route('admin.pengguna.reset-password', user.id), {}, { preserveScroll: true, onFinish: () => setConfirmAksi(null) });
        } else {
            router.patch(route('admin.pengguna.toggle-status', user.id), {}, { preserveScroll: true, onFinish: () => setConfirmAksi(null) });
        }
    };

    /* ── Hapus ── */
    const handleDelete = () => {
        router.delete(route('admin.pengguna.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    };

    return (
        <AdminLayout title="Manajemen Pengguna">
            <Head title="Manajemen Pengguna" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">

                {/* Header */}
                <div className="mb-5">
                    <h1 className="text-2xl font-bold text-white">Manajemen Pengguna</h1>
                    <p className="text-sm text-slate-400">Kelola akun petani: lihat detail, edit data, reset password, nonaktifkan, atau hapus akun.</p>
                </div>

                <Flash message={flash?.success} />

                {/* Search & Filter */}
                <div className="flex flex-wrap gap-3 mb-5">
                    <form onSubmit={submitSearch} className="flex-1 min-w-[220px]">
                        <input
                            dusk="input-search-pengguna"
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama atau email petani…"
                            className={inputClass}
                        />
                    </form>

                    <select
                        dusk="filter-status-pengguna"
                        value={filters.status ?? ''}
                        onChange={(e) => applyStatus(e.target.value)}
                        className="rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="">Semua Status</option>
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                    </select>

                    {(filters.search || filters.status) && (
                        <button onClick={resetFilter} className="text-sm text-slate-400 hover:text-white px-2">Reset</button>
                    )}
                </div>

                {/* Tabel */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table dusk="pengguna-table" className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wide">
                                    <th className="px-4 py-3 text-left font-semibold">Nama</th>
                                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Lahan</th>
                                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Observasi Terakhir</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-right font-semibold sticky right-0 bg-slate-900">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td dusk="empty-state" colSpan={6} className="px-4 py-12 text-center text-slate-500">
                                            {filters.search ? 'Data petani tidak ditemukan.' : 'Belum ada data petani terdaftar.'}
                                        </td>
                                    </tr>
                                ) : users.data.map((u) => (
                                    <tr key={u.id} dusk={`pengguna-row-${u.id}`} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{u.name}</td>
                                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{u.email}</td>
                                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{u.agricultural_areas_count} lahan</td>
                                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">{fmtDate(u.last_observation_date)}</td>
                                        <td className="px-4 py-3"><StatusBadge active={u.is_active} /></td>
                                        <td className="px-4 py-3 whitespace-nowrap sticky right-0 bg-slate-900">
                                            <div className="flex items-center gap-2 justify-end">
                                                <button dusk={`btn-detail-pengguna-${u.id}`} onClick={() => setDetailTarget(u)}
                                                    className="text-xs font-semibold text-slate-300 hover:text-white">Detail</button>
                                                <span className="text-slate-700">|</span>
                                                <button dusk={`btn-edit-pengguna-${u.id}`} onClick={() => openEdit(u)}
                                                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">Edit</button>
                                                <span className="text-slate-700">|</span>
                                                <button dusk={`btn-reset-pengguna-${u.id}`} onClick={() => setConfirmAksi({ type: 'reset', user: u })}
                                                    className="text-xs font-semibold text-amber-400 hover:text-amber-300">Reset</button>
                                                <span className="text-slate-700">|</span>
                                                <button dusk={`btn-toggle-status-${u.id}`} onClick={() => setConfirmAksi({ type: 'toggle', user: u })}
                                                    className={`text-xs font-semibold ${u.is_active ? 'text-orange-400 hover:text-orange-300' : 'text-emerald-400 hover:text-emerald-300'}`}>
                                                    {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                </button>
                                                <span className="text-slate-700">|</span>
                                                <button dusk={`btn-hapus-pengguna-${u.id}`} onClick={() => setDeleteTarget(u)}
                                                    className="text-xs font-semibold text-red-400 hover:text-red-300">Hapus</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className="px-5 py-4 border-t border-slate-800 flex justify-between items-center text-sm text-slate-400">
                            <span>Halaman {users.current_page} dari {users.last_page} ({users.total} pengguna)</span>
                            <div className="flex gap-2">
                                {users.prev_page_url && (
                                    <button onClick={() => router.get(users.prev_page_url)} className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200">← Prev</button>
                                )}
                                {users.next_page_url && (
                                    <button onClick={() => router.get(users.next_page_url)} className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200">Next →</button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modal Detail ── */}
            {detailTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div dusk="modal-detail-pengguna" className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-start justify-between mb-4 gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                                    <span className="text-emerald-400 font-bold uppercase">{detailTarget.name?.charAt(0)}</span>
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white leading-tight">{detailTarget.name}</h2>
                                    <StatusBadge active={detailTarget.is_active} />
                                </div>
                            </div>
                            <button onClick={() => setDetailTarget(null)} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="bg-slate-800 rounded-xl p-3">
                                <p className="text-xs text-slate-500 mb-0.5">Email</p>
                                <p className="text-slate-200">{detailTarget.email}</p>
                            </div>
                            <div className="bg-slate-800 rounded-xl p-3">
                                <p className="text-xs text-slate-500 mb-0.5">No. Telepon</p>
                                <p className="text-slate-200">{detailTarget.phone_number || 'Belum ada'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-800 rounded-xl p-3">
                                    <p className="text-xs text-slate-500 mb-0.5">Jumlah Lahan</p>
                                    <p className="text-white font-semibold">{detailTarget.agricultural_areas_count} lahan</p>
                                </div>
                                <div className="bg-slate-800 rounded-xl p-3">
                                    <p className="text-xs text-slate-500 mb-0.5">Observasi Terakhir</p>
                                    <p className="text-white font-semibold">{fmtDate(detailTarget.last_observation_date)}</p>
                                </div>
                            </div>
                            <div className="bg-slate-800 rounded-xl p-3">
                                <p className="text-xs text-slate-500 mb-0.5">Terdaftar Sejak</p>
                                <p className="text-slate-200">{fmtDate(detailTarget.created_at)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal Edit ── */}
            {editTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div dusk="modal-edit-pengguna" className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-white">Edit Data Pengguna</h2>
                            <button onClick={() => { setEditTarget(null); editForm.reset(); }} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
                        </div>
                        <form onSubmit={submitEdit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-1.5">Nama Lengkap</label>
                                <input dusk="input-edit-nama" type="text" value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)} className={inputClass} />
                                {editForm.errors.name && <p className="text-xs text-red-400 mt-1">{editForm.errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-1.5">Email</label>
                                <input dusk="input-edit-email" type="email" value={editForm.data.email}
                                    onChange={(e) => editForm.setData('email', e.target.value)} className={inputClass} />
                                {editForm.errors.email && <p className="text-xs text-red-400 mt-1">{editForm.errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-1.5">No. Telepon</label>
                                <input dusk="input-edit-telp" type="text" value={editForm.data.phone_number}
                                    onChange={(e) => editForm.setData('phone_number', e.target.value)} className={inputClass} />
                                {editForm.errors.phone_number && <p className="text-xs text-red-400 mt-1">{editForm.errors.phone_number}</p>}
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => { setEditTarget(null); editForm.reset(); }}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800">Batal</button>
                                <button dusk="btn-simpan-edit-pengguna" type="submit" disabled={editForm.processing}
                                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold disabled:opacity-50">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Konfirmasi Reset / Toggle ── */}
            {confirmAksi && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div dusk="modal-konfirmasi-aksi" className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <h2 className="text-lg font-bold text-white mb-2">
                            {confirmAksi.type === 'reset' ? 'Reset Password?' : (confirmAksi.user.is_active ? 'Nonaktifkan Akun?' : 'Aktifkan Akun?')}
                        </h2>
                        <p className="text-sm text-slate-400 mb-5">
                            {confirmAksi.type === 'reset'
                                ? <>Password <span className="text-white font-medium">{confirmAksi.user.name}</span> akan diganti dengan password sementara acak.</>
                                : confirmAksi.user.is_active
                                    ? <><span className="text-white font-medium">{confirmAksi.user.name}</span> tidak akan bisa login sampai diaktifkan kembali.</>
                                    : <><span className="text-white font-medium">{confirmAksi.user.name}</span> akan dapat login kembali.</>}
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmAksi(null)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800">Batal</button>
                            <button dusk="btn-konfirmasi-aksi" onClick={runAksi}
                                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold">Ya, Lanjutkan</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Konfirmasi Hapus ── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div dusk="modal-konfirmasi-hapus" className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <h2 className="text-lg font-bold text-white mb-2">Hapus Akun Pengguna?</h2>
                        <p className="text-sm text-slate-400 mb-5">
                            Akun <span className="text-white font-medium">{deleteTarget.name}</span> akan dihapus permanen beserta seluruh datanya. Tindakan ini tidak bisa dibatalkan.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800">Batal</button>
                            <button dusk="btn-konfirmasi-hapus" onClick={handleDelete}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold">Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
