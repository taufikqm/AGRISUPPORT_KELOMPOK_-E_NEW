import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const BADGE = {
    observasi:                  { label: 'Observasi Lahan',       cls: 'bg-blue-500/20 text-blue-400' },
    completion:                 { label: 'Selesai Rekomendasi',   cls: 'bg-emerald-500/20 text-emerald-400' },
    auth_login:                 { label: 'Login Sistem',          cls: 'bg-slate-500/30 text-slate-300' },
    auth_logout:                { label: 'Logout',                cls: 'bg-slate-500/30 text-slate-300' },
    fieldobservation_created:   { label: 'Tambah Observasi',      cls: 'bg-blue-500/20 text-blue-400' },
    fieldobservation_updated:   { label: 'Edit Observasi',        cls: 'bg-sky-500/20 text-sky-400' },
    fieldobservation_deleted:   { label: 'Hapus Observasi',       cls: 'bg-red-500/20 text-red-400' },
    agriculturalarea_created:   { label: 'Tambah Lahan',          cls: 'bg-teal-500/20 text-teal-400' },
    agriculturalarea_updated:   { label: 'Edit Lahan',            cls: 'bg-teal-500/20 text-teal-400' },
    agriculturalarea_deleted:   { label: 'Hapus Lahan',           cls: 'bg-red-500/20 text-red-400' },
    user_status_changed:        { label: 'Status Pengguna',       cls: 'bg-amber-500/20 text-amber-400' },
    user_password_reset:        { label: 'Reset Password',        cls: 'bg-amber-500/20 text-amber-400' },
    warning_sent:               { label: 'Peringatan Dikirim',    cls: 'bg-orange-500/20 text-orange-400' },
};
const badgeFor = (type) => BADGE[type] ?? { label: (type ?? '').replace(/_/g, ' '), cls: 'bg-amber-500/20 text-amber-400' };

const FIELD_LABEL = {
    agricultural_area_id:       'Lahan',
    user_id:                    null,
    id:                         null,
    observation_date:           'Tanggal Observasi',
    planting_cycle:             'Siklus Tanam',
    soil_moisture:              'Kelembapan Tanah',
    water_puddle:               'Genangan Air',
    crop_condition:             'Kondisi Tanaman',
    pest_indication:            'Indikasi Hama',
    disease_indication:         'Indikasi Penyakit',
    notes:                      'Catatan',
    weather_temp:               'Suhu (°C)',
    weather_condition:          'Kondisi Cuaca',
    weather_precip_mm:          'Curah Hujan (mm)',
    weather_humidity:           'Kelembapan Udara (%)',
    recommendations_viewed_at:  null,
    is_active:                  'Status Akun',
    name:                       'Nama',
    email:                      'Email',
    role:                       'Peran',
};
const SKIP = ['updated_at', 'created_at'];
const fieldLabel = (k) => (k in FIELD_LABEL ? FIELD_LABEL[k] : k.replace(/_/g, ' '));

export default function ActivityLog({ logs, petaniList, filters }) {
    const [queryParams, setQueryParams] = useState({
        user_id:   filters.user_id  || '',
        date_from: filters.date_from || '',
        date_to:   filters.date_to   || '',
    });
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const q = new URLSearchParams({ ...queryParams }).toString();
        fetch(route('admin.api.laporan') + '?' + q)
            .then((r) => r.json())
            .then((d) => setChartData(d.chart_data || []));
    }, []);

    const totalObservasi = chartData.reduce((s, d) => s + (d.observasi || 0), 0);
    const totalTindakan  = chartData.reduce((s, d) => s + (d.tindakan  || 0), 0);
    const totalSistem    = chartData.reduce((s, d) => s + (d.sistem    || 0), 0);

    const applyFilters = () =>
        router.get(route('admin.laporan.index'), queryParams, { preserveState: true, preserveScroll: true });

    const handleExport = () => {
        window.location.href = route('admin.laporan.export') + '?' + new URLSearchParams(queryParams).toString();
    };

    const cards = [
        { label: 'Total Aktivitas',   value: logs.total,    color: '#fff',      dim: 'text-white' },
        { label: 'Observasi Lahan',   value: totalObservasi, color: '#60a5fa',  dim: 'text-blue-400' },
        { label: 'Selesai Tindakan',  value: totalTindakan,  color: '#34d399',  dim: 'text-emerald-400' },
        { label: 'Aktivitas Sistem',  value: totalSistem,    color: '#fbbf24',  dim: 'text-amber-400' },
    ];

    return (
        <AdminLayout title="Laporan Aktivitas">
            <Head title="Laporan Aktivitas" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-5">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-white">Laporan Aktivitas</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Pantau seluruh aktivitas petani dan rekam jejak tindakan di platform.</p>
                </div>

                {/* Filter Bar */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="flex-1 min-w-[160px]">
                            <label className="block text-xs text-slate-400 mb-1.5">Petani</label>
                            <select
                                dusk="filter-petani-log"
                                value={queryParams.user_id}
                                onChange={(e) => setQueryParams((p) => ({ ...p, user_id: e.target.value }))}
                                className="w-full rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="">Semua Petani</option>
                                {petaniList.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1 min-w-[140px]">
                            <label className="block text-xs text-slate-400 mb-1.5">Dari Tanggal</label>
                            <input
                                dusk="input-date-from"
                                type="date"
                                value={queryParams.date_from}
                                onChange={(e) => setQueryParams((p) => ({ ...p, date_from: e.target.value }))}
                                className="w-full rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 [color-scheme:dark]"
                            />
                        </div>

                        <div className="flex-1 min-w-[140px]">
                            <label className="block text-xs text-slate-400 mb-1.5">Sampai Tanggal</label>
                            <input
                                dusk="input-date-to"
                                type="date"
                                value={queryParams.date_to}
                                onChange={(e) => setQueryParams((p) => ({ ...p, date_to: e.target.value }))}
                                className="w-full rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 [color-scheme:dark]"
                            />
                        </div>

                        <button
                            onClick={applyFilters}
                            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors whitespace-nowrap"
                        >
                            Terapkan Filter
                        </button>

                        <button
                            dusk="btn-export-csv"
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-colors whitespace-nowrap"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Unduh CSV
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {cards.map((c) => (
                        <div key={c.label} className="flex items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
                            <span className="text-xs text-slate-400 leading-tight">{c.label}</span>
                            <span className={`text-xl font-bold shrink-0 ${c.dim}`}>{c.value}</span>
                        </div>
                    ))}
                </div>

                {/* Chart */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white mb-5">Tren Aktivitas Platform</h3>
                    <div className="h-64 w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fill: '#64748b', fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={{ stroke: '#1e293b' }}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fill: '#64748b', fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#e2e8f0' }}
                                        labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                                    <Line type="monotone" name="Observasi Lahan"      dataKey="observasi" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                    <Line type="monotone" name="Selesai Rekomendasi"  dataKey="tindakan"  stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                    <Line type="monotone" name="Aktivitas Sistem"     dataKey="sistem"    stroke="#fbbf24" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                                Belum ada aktivitas terekam.
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabel */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-800">
                        <h3 className="text-sm font-bold text-white">Detail Riwayat Aktivitas</h3>
                    </div>

                    <div className="overflow-x-auto scrollbar-slim">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase tracking-wide border-b border-slate-700">
                                <tr>
                                    <th className="px-5 py-3">Waktu</th>
                                    <th className="px-5 py-3">Petani</th>
                                    <th className="px-5 py-3">Lahan</th>
                                    <th className="px-5 py-3">Jenis</th>
                                    <th className="px-5 py-3">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {logs.data.length > 0 ? logs.data.map((log) => {
                                    const badge = badgeFor(log.action_type);
                                    return (
                                        <tr key={`${log.action_type}-${log.id}`} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="px-5 py-3.5 whitespace-nowrap text-slate-400 text-xs">
                                                {new Date(log.performed_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </td>
                                            <td className="px-5 py-3.5 font-medium text-white whitespace-nowrap">{log.user_name}</td>
                                            <td className="px-5 py-3.5 text-slate-400">{log.area_name || '—'}</td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-400 max-w-xs">
                                                <span>{log.detail}</span>
                                                {log.new_values && (() => {
                                                    const newVal = typeof log.new_values === 'string' ? JSON.parse(log.new_values) : log.new_values;
                                                    const oldVal = typeof log.old_values === 'string' ? JSON.parse(log.old_values ?? '{}') : (log.old_values || {});
                                                    const keys = Object.keys(newVal).filter((k) => !SKIP.includes(k) && FIELD_LABEL[k] !== null);
                                                    if (!keys.length) return null;
                                                    return (
                                                        <div className="mt-2 text-xs bg-slate-800 rounded-lg border border-slate-700 p-2.5 space-y-1">
                                                            {keys.map((k) => {
                                                                const nv = String(newVal[k] ?? '—');
                                                                const ov = oldVal[k] !== undefined ? String(oldVal[k] ?? '—') : null;
                                                                return (
                                                                    <div key={k} className="flex items-start gap-2">
                                                                        <span className="text-slate-500 w-36 shrink-0 truncate">{fieldLabel(k)}:</span>
                                                                        <span className="flex items-center gap-1.5 flex-wrap min-w-0">
                                                                            {ov !== null && ov !== nv && (
                                                                                <>
                                                                                    <span className="text-red-400 line-through break-all">{ov}</span>
                                                                                    <span className="text-slate-600">→</span>
                                                                                </>
                                                                            )}
                                                                            <span className="text-emerald-400 break-all">{nv}</span>
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-10 text-center text-slate-500">
                                            Tidak ada riwayat aktivitas ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {logs.links && logs.links.length > 3 && (
                        <div className="px-5 py-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                            <span className="text-xs text-slate-500">
                                Menampilkan <span className="text-slate-300">{logs.from ?? 0}</span>–<span className="text-slate-300">{logs.to ?? 0}</span> dari <span className="text-slate-300">{logs.total}</span>
                            </span>
                            <div className="flex items-center gap-1">
                                {logs.links.map((link, i) =>
                                    link.url === null ? (
                                        <span key={i} className="px-3 py-1 text-xs text-slate-600 bg-slate-800 border border-slate-700 rounded-lg" dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ) : (
                                        <button
                                            key={i}
                                            onClick={() => router.get(link.url, queryParams, { preserveScroll: true, preserveState: true })}
                                            className={`px-3 py-1 text-xs border rounded-lg transition-colors ${
                                                link.active
                                                    ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}
