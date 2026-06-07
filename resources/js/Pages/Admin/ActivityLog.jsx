import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ActivityLog({ auth, logs, petaniList, filters }) {
    const [queryParams, setQueryParams] = useState({
        user_id: filters.user_id || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || ''
    });

    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        // Fetch chart data
        const query = new URLSearchParams(queryParams).toString();
        fetch(route('admin.api.laporan') + '?' + query)
            .then(res => res.json())
            .then(data => setChartData(data.chart_data || []));
    }, [queryParams]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setQueryParams(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        router.get(route('admin.laporan.index'), queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExportCsv = () => {
        const query = new URLSearchParams(queryParams).toString();
        window.location.href = route('admin.laporan.export') + '?' + query;
    };

    return (
        <AdminLayout title="Laporan Aktivitas" currentRoute="admin.laporan.index">
            <Head title="Laporan Aktivitas" />
            
            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex flex-wrap gap-4 items-end w-full md:w-auto">
                        <div className="w-full sm:w-48">
                            <InputLabel htmlFor="user_id" value="Petani" className="text-slate-500 mb-1" />
                            <select
                                id="user_id"
                                name="user_id"
                                value={queryParams.user_id}
                                onChange={handleFilterChange}
                                className="w-full border-slate-200 focus:border-green-500 focus:ring-green-500 rounded-xl shadow-sm transition-all"
                                dusk="filter-petani-log"
                            >
                                <option value="">Semua Petani</option>
                                {petaniList.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-full sm:w-40">
                            <InputLabel htmlFor="date_from" value="Dari Tanggal" className="text-slate-500 mb-1" />
                            <TextInput
                                id="date_from"
                                name="date_from"
                                type="date"
                                value={queryParams.date_from}
                                onChange={handleFilterChange}
                                className="w-full rounded-xl"
                                dusk="input-date-from"
                            />
                        </div>
                        <div className="w-full sm:w-40">
                            <InputLabel htmlFor="date_to" value="Sampai Tanggal" className="text-slate-500 mb-1" />
                            <TextInput
                                id="date_to"
                                name="date_to"
                                type="date"
                                value={queryParams.date_to}
                                onChange={handleFilterChange}
                                className="w-full rounded-xl"
                                dusk="input-date-to"
                            />
                        </div>
                        <PrimaryButton 
                            onClick={applyFilters}
                            className="bg-green-600 hover:bg-green-700 rounded-xl h-[42px]"
                        >
                            Terapkan Filter
                        </PrimaryButton>
                    </div>
                    
                    <button
                        onClick={handleExportCsv}
                        className="flex items-center gap-2 bg-white text-slate-700 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-green-600 transition-all font-medium whitespace-nowrap shadow-sm h-[42px]"
                        dusk="btn-export-csv"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Unduh CSV
                    </button>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Tren Aktivitas Platform</h3>
                    <div className="h-72 w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis 
                                        dataKey="date" 
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={{ stroke: '#cbd5e1' }}
                                    />
                                    <YAxis 
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                                    <Line 
                                        type="monotone" 
                                        name="Observasi Lahan"
                                        dataKey="observasi" 
                                        stroke="#3b82f6" 
                                        strokeWidth={3}
                                        dot={{ r: 4, strokeWidth: 2 }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        name="Rekomendasi / Lainnya"
                                        dataKey="tindakan" 
                                        stroke="#10b981" 
                                        strokeWidth={3}
                                        dot={{ r: 4, strokeWidth: 2 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                Belum ada aktivitas terekam.
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-white">
                        <h3 className="text-lg font-bold text-slate-800">Detail Riwayat Aktivitas</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Waktu</th>
                                    <th className="px-6 py-4">Petani</th>
                                    <th className="px-6 py-4">Lahan</th>
                                    <th className="px-6 py-4">Jenis Aktivitas</th>
                                    <th className="px-6 py-4">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.data.length > 0 ? (
                                    logs.data.map((log) => (
                                        <tr key={log.action_type + '-' + log.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                                {new Date(log.performed_at).toLocaleString('id-ID', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-800">
                                                {log.user_name}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {log.area_name || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                                    log.action_type === 'observasi' 
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : log.action_type === 'completion'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-slate-100 text-slate-800'
                                                }`}>
                                                    {log.action_type === 'completion' ? 'Selesai Rekomendasi' : log.action_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {log.detail}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                                            Tidak ada riwayat aktivitas yang ditemukan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {logs.links && logs.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center md:justify-between flex-wrap gap-4">
                            <span className="text-sm text-slate-500">
                                Menampilkan <span className="font-medium text-slate-700">{logs.from || 0}</span> sampai <span className="font-medium text-slate-700">{logs.to || 0}</span> dari <span className="font-medium text-slate-700">{logs.total}</span> data
                            </span>
                            <div className="flex items-center space-x-1">
                                {logs.links.map((link, i) => {
                                    if (link.url === null) {
                                        return (
                                            <span key={i} className="px-3 py-1 text-sm text-slate-400 bg-white border border-slate-200 rounded-md" dangerouslySetInnerHTML={{ __html: link.label }} />
                                        );
                                    }
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => router.get(link.url, queryParams, { preserveScroll: true, preserveState: true })}
                                            className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                                                link.active 
                                                    ? 'bg-green-50 text-green-600 border-green-200 font-medium' 
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
