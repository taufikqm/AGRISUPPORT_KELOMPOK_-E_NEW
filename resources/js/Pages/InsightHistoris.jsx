import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect, useCallback } from 'react';
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Cell,
} from 'recharts';

const RISK_COLORS = {
    Aman:    '#22c55e',
    Waspada: '#f59e0b',
    Bahaya:  '#ef4444',
    Kritis:  '#7f1d1d',
};

export default function InsightHistoris({ auth, areas }) {
    const [selectedArea, setSelectedArea] = useState('');
    const [rangeMode,    setRangeMode]    = useState('year');
    const [chartData,    setChartData]    = useState([]);
    const [distribusi,   setDistribusi]   = useState([]);
    const [loading,      setLoading]      = useState(false);
    const currentYear = new Date().getFullYear();

    const fetchData = useCallback(async (areaId, mode) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (areaId) params.append('area_id', areaId);
            if (mode === '7' || mode === '30') {
                params.append('range', mode);
            } else {
                params.append('year', currentYear);
            }
            const res  = await fetch(`/api/historical-data?${params}`);
            const json = await res.json();
            setChartData(json.data ?? []);
            setDistribusi(json.distribusiRisiko ?? []);
        } catch {
            setChartData([]);
            setDistribusi([]);
        } finally {
            setLoading(false);
        }
    }, [currentYear]);

    useEffect(() => {
        fetchData(selectedArea, rangeMode);
    }, [selectedArea, rangeMode, fetchData]);

    const isEmpty = !loading && chartData.length === 0;

    return (
        <AuthenticatedLayout
            title="Insight Historis & Analisis Tren"
            currentRoute="insight-historis.index"
        >
            <Head title="Insight Historis" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select
                            dusk="filter-area"
                            value={selectedArea}
                            onChange={e => setSelectedArea(e.target.value)}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm
                                       focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Semua Lahan</option>
                            {areas.map(area => (
                                <option key={area.id} value={area.id}>{area.name}</option>
                            ))}
                        </select>
                        <select
                            dusk="filter-range"
                            value={rangeMode}
                            onChange={e => setRangeMode(e.target.value)}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm
                                       focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="year">Tahun Ini ({currentYear})</option>
                            <option value="30">30 Hari Terakhir</option>
                            <option value="7">7 Hari Terakhir</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
                            Memuat data...
                        </div>
                    ) : isEmpty ? (
                        <div dusk="empty-state"
                             className="flex flex-col items-center justify-center py-20 gap-3
                                        text-gray-400 bg-white rounded-xl shadow">
                            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="text-sm font-medium">Data belum cukup untuk membentuk tren</p>
                            <p className="text-xs">Catat observasi lapangan untuk melihat analisis tren lahan Anda.</p>
                        </div>
                    ) : (
                        <>
                            {/* Grafik 1: Tren Parameter Lingkungan */}
                            <div dusk="chart-tren-cuaca" className="bg-white rounded-xl shadow p-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                                    Tren Parameter Lingkungan
                                </h3>
                                <ResponsiveContainer width="100%" height={280}>
                                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                                        <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="suhu"
                                            name="Suhu (°C)"
                                            stroke="#f97316"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                        <Line
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="kelembapan"
                                            name="Kelembapan (%)"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="curahHujan"
                                            name="Curah Hujan (mm)"
                                            stroke="#06b6d4"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Grafik 2: Distribusi Risiko */}
                                <div dusk="chart-distribusi-risiko" className="bg-white rounded-xl shadow p-6">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-4">
                                        Distribusi Risiko
                                    </h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={distribusi} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                            <Tooltip />
                                            <Bar dataKey="jumlah" name="Observasi" radius={[4, 4, 0, 0]}>
                                                {distribusi.map((entry, i) => (
                                                    <Cell key={i} fill={RISK_COLORS[entry.status] ?? '#6b7280'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Grafik 3: Frekuensi Observasi */}
                                <div dusk="chart-frekuensi-observasi" className="bg-white rounded-xl shadow p-6">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-4">
                                        Frekuensi Observasi
                                    </h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                            <Tooltip />
                                            <Area
                                                type="monotone"
                                                dataKey="frekuensi"
                                                name="Observasi"
                                                stroke="#16a34a"
                                                fill="#dcfce7"
                                                strokeWidth={2}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
