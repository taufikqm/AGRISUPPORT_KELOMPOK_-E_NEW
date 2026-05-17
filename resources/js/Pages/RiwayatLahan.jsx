import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect, useCallback } from 'react';

const TABS = [
    { key: 'observasi',   label: 'Observasi' },
    { key: 'validasi',    label: 'Validasi' },
    { key: 'risiko',      label: 'Risiko' },
    { key: 'rekomendasi', label: 'Rekomendasi' },
];

const STATUS_STYLE = {
    Aman:        'bg-green-100 text-green-800',
    Waspada:     'bg-yellow-100 text-yellow-800',
    Bahaya:      'bg-red-100 text-red-800',
    Kritis:      'bg-red-200 text-red-900 font-semibold',
    Selesai:     'bg-blue-100 text-blue-800',
};

export default function RiwayatLahan({ auth, areas }) {
    const [activeTab,     setActiveTab]     = useState('observasi');
    const [selectedArea,  setSelectedArea]  = useState('');
    const [searchQuery,   setSearchQuery]   = useState('');
    const [data,          setData]          = useState([]);
    const [loading,       setLoading]       = useState(false);

    const fetchData = useCallback(async (tab, areaId, search) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ tab });
            if (areaId) params.append('area_id', areaId);
            if (search)  params.append('search',  search);

            const res  = await fetch(`/api/land-history?${params}`);
            const json = await res.json();
            setData(json.data ?? []);
        } catch {
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(activeTab, selectedArea, searchQuery);
    }, [activeTab, selectedArea]);

    useEffect(() => {
        const timer = setTimeout(
            () => fetchData(activeTab, selectedArea, searchQuery),
            400
        );
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchQuery('');
    };

    return (
        <AuthenticatedLayout
            title="Histori Aktivitas & Analisis"
            currentRoute="riwayat-lahan.index"
        >
            <Head title="Riwayat Lahan" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-4">

                    {/* Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            dusk="search-input"
                            type="text"
                            placeholder="Cari kata kunci..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Escape' && setSearchQuery('')}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm
                                       focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <select
                            dusk="area-filter"
                            value={selectedArea}
                            onChange={e => setSelectedArea(e.target.value)}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm
                                       focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Semua Lahan</option>
                            {areas.map(area => (
                                <option key={area.id} value={area.id}>
                                    {area.name}
                                </option>
                            ))}
                        </select>
                        {(searchQuery || selectedArea) && (
                            <button
                                dusk="clear-filter-btn"
                                onClick={() => { setSearchQuery(''); setSelectedArea(''); }}
                                className="px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg
                                           hover:bg-gray-50 transition-colors whitespace-nowrap"
                            >
                                Bersihkan filter
                            </button>
                        )}
                    </div>

                    {/* Result Count */}
                    {!loading && (
                        <p dusk="result-count" className="text-xs text-gray-400">
                            {data.length > 0
                                ? `Menampilkan ${data.length} hasil`
                                : null}
                        </p>
                    )}

                    {/* Tab Buttons */}
                    <div className="flex gap-1 border-b border-gray-200">
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                dusk={`tab-${tab.key}`}
                                onClick={() => handleTabChange(tab.key)}
                                className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === tab.key
                                        ? 'border-green-600 text-green-700'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Table Area */}
                    <div className="bg-white rounded-xl shadow overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                                Memuat data...
                            </div>
                        ) : data.length === 0 ? (
                            <div dusk="empty-state" className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-sm">Belum ada data riwayat.</p>
                                <Link
                                    href="/input-kondisi"
                                    className="text-sm text-green-600 hover:underline font-medium"
                                >
                                    Mulai catat kondisi lapangan →
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table dusk="history-table" className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {['Tanggal', 'Jenis', 'Wilayah', 'Ringkasan', 'Status'].map(col => (
                                                <th
                                                    key={col}
                                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                                >
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.map(row => (
                                            <tr
                                                key={`${row.jenis}-${row.id}`}
                                                dusk="history-row"
                                                onClick={() => window.location.href = row.link}
                                                className="hover:bg-green-50 cursor-pointer transition-colors"
                                            >
                                                <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                                    {row.tanggal}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {row.jenis}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {row.wilayah}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                                                    {row.ringkasan}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        dusk="status-badge"
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                        ${STATUS_STYLE[row.status] ?? 'bg-gray-100 text-gray-700'}`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
