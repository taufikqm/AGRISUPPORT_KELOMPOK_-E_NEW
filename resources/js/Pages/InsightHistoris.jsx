import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect, useCallback } from 'react';
import {
    AreaChart, Area, LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const RISK_COLORS = {
    Aman:    '#22c55e',
    Waspada: '#f59e0b',
    Bahaya:  '#ef4444',
    Kritis:  '#7f1d1d',
};

/* ─── Ikon SVG ─── */
const RainIcon = () => (
    <svg className="w-5 h-5 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 .75-7.425A4.502 4.502 0 0 0 14.25 9 4.5 4.5 0 0 0 6 12.75 4.49 4.49 0 0 0 2.25 15Z" />
    </svg>
);
const HumidityIcon = () => (
    <svg className="w-5 h-5 text-[#3d5a3d]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a8 8 0 0 0 8-8c0-3.5-3-7-8-12-5 5-8 8.5-8 12a8 8 0 0 0 8 8Z" />
    </svg>
);
const RiskIcon = () => (
    <svg className="w-5 h-5 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
);
const ShieldIcon = () => (
    <svg className="w-5 h-5 text-[#22c55e]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.96 11.96 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.572-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
);
const WaterDropIcon = () => (
    <svg className="w-[18px] h-[18px] text-[#3b82f6]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a8 8 0 0 0 8-8c0-3.5-3-7-8-12-5 5-8 8.5-8 12a8 8 0 0 0 8 8Z" />
    </svg>
);
const LeafIcon = () => (
    <svg className="w-[18px] h-[18px] text-[#ef4444]" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4-4-8-8-8-13a8 8 0 0 1 16 0c0 5-4 9-8 13z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V10" />
    </svg>
);
const TrendUpIcon = () => (
    <svg className="w-[18px] h-[18px] text-[#22c55e]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
    </svg>
);
const BoltIcon = () => (
    <svg className="w-[18px] h-[18px] text-[#f59e0b]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
);
const INSIGHT_ICONS = { water: WaterDropIcon, leaf: LeafIcon, productivity: TrendUpIcon, fertilizer: BoltIcon };

/* ─── Tooltip kustom ─── */
function RainTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg text-xs">
            <p className="font-bold text-[#1e293b] mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-[#64748b]">{p.name}:</span>
                    <span className="font-semibold text-[#1e293b]">
                        {p.value}{p.name === 'Kelembapan' ? '%' : ' mm'}
                    </span>
                </p>
            ))}
        </div>
    );
}
function RiskTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    const val = payload[0]?.value ?? 0;
    const level = val >= 75 ? 'Kritis' : val >= 55 ? 'Bahaya' : val >= 30 ? 'Waspada' : 'Aman';
    const color = val >= 75 ? 'text-red-700' : val >= 55 ? 'text-red-500' : val >= 30 ? 'text-amber-500' : 'text-green-600';
    return (
        <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg text-xs">
            <p className="font-bold text-[#1e293b] mb-1">{label}</p>
            <p className="text-[#64748b]">Indeks Risiko: <span className="font-semibold text-[#1e293b]">{val}/100</span></p>
            <p className={`font-bold ${color} mt-0.5`}>Status: {level}</p>
        </div>
    );
}

/* ─── KPI Card ─── */
function KpiCard({ label, value, badge, accent, iconBg, icon, gradFrom, gradTo }) {
    return (
        <div className="relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group border border-slate-100">
            {/* subtle gradient glow top-right */}
            <div
                className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl pointer-events-none transition-opacity group-hover:opacity-30"
                style={{ background: accent }}
            />

            <div className="relative flex items-start justify-between mb-4">
                <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{ background: iconBg }}
                >
                    {icon}
                </div>
                {badge && (
                    <span
                        className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide whitespace-nowrap"
                        style={{ color: accent, backgroundColor: `${accent}18` }}
                    >
                        {badge}
                    </span>
                )}
            </div>

            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[1.5px] mb-1.5">{label}</p>
            <p className="text-[26px] font-black text-slate-800 leading-none">{value}</p>

            {/* bottom accent line */}
            <div className="absolute bottom-0 left-0 h-0.5 w-full opacity-40 rounded-b-2xl"
                style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
            />
        </div>
    );
}

/* ─── Skeleton ─── */
function SkeletonCard() {
    return (
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 animate-pulse">
            <div className="flex justify-between mb-5">
                <div className="w-10 h-10 bg-gray-100 rounded-2xl" />
                <div className="w-20 h-5 bg-gray-100 rounded-full" />
            </div>
            <div className="w-24 h-3 bg-gray-100 rounded mb-2" />
            <div className="w-16 h-6 bg-gray-100 rounded" />
        </div>
    );
}
function SkeletonChart() {
    return (
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-8 animate-pulse">
            <div className="w-48 h-5 bg-gray-100 rounded mb-2" />
            <div className="w-64 h-4 bg-gray-100 rounded mb-6" />
            <div className="w-full h-[280px] bg-gray-50 rounded-lg" />
        </div>
    );
}

/* ─── MAIN PAGE ─── */
export default function InsightHistoris({ areas = [] }) {
    const [selectedArea, setSelectedArea] = useState('');
    const [rangeMode,    setRangeMode]    = useState('year');
    const [data,         setData]         = useState(null);
    const [loading,      setLoading]      = useState(false);
    const currentYear = new Date().getFullYear();

    const fetchData = useCallback(async (areaId, mode) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (areaId) params.append('area_id', areaId);
            if (mode === '7' || mode === '30') params.append('range', mode);
            else params.append('year', currentYear);

            const res  = await fetch(`/api/historical-data?${params}`);
            const json = await res.json();
            setData(json);
        } catch {
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [currentYear]);

    useEffect(() => {
        fetchData(selectedArea, rangeMode);
    }, [selectedArea, rangeMode, fetchData]);

    const chartData    = data?.data ?? [];
    const distribusi   = data?.distribusiRisiko ?? [];
    const kpi          = data?.kpiMetrics ?? null;
    const insights     = data?.insights ?? null;
    const isEmpty      = !loading && chartData.length === 0;

    const rangeLabel = rangeMode === '7' ? '7 hari terakhir'
                     : rangeMode === '30' ? '30 hari terakhir'
                     : `Tahun ${currentYear}`;

    const granularityLabel = rangeMode === 'year' ? 'bulanan' : 'harian';

    return (
        <AuthenticatedLayout
            title="Insight Historis & Analisis Tren"
            currentRoute="insight-historis.index"
        >
            <Head title="Insight Historis" />

            <div className="bg-[#f8fafc] min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[#1e293b] tracking-tight">
                                Analisis Tren & Pola
                            </h1>
                            <p className="text-sm md:text-base text-[#64748b] mt-1">
                                Memahami perilaku lahan Anda berdasarkan data akumulasi historis.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <select
                                dusk="filter-area"
                                value={selectedArea}
                                onChange={e => setSelectedArea(e.target.value)}
                                                className="appearance-none bg-white border border-[#e2e8f0] rounded-2xl pl-4 pr-10 py-2 text-sm font-medium text-[#1e293b] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3d5a3d]/30 cursor-pointer bg-no-repeat"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2.5' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                                    backgroundPosition: 'right 12px center',
                                    backgroundSize: '14px',
                                }}
                            >
                                <option value="">Semua Lahan</option>
                                {areas.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                            <select
                                dusk="filter-range"
                                value={rangeMode}
                                onChange={e => setRangeMode(e.target.value)}
                                                className="appearance-none bg-white border border-[#e2e8f0] rounded-2xl pl-4 pr-10 py-2 text-sm font-medium text-[#1e293b] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3d5a3d]/30 cursor-pointer bg-no-repeat"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2.5' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                                    backgroundPosition: 'right 12px center',
                                    backgroundSize: '14px',
                                }}
                            >
                                <option value="year">Tahun Ini ({currentYear})</option>
                                <option value="30">30 Hari Terakhir</option>
                                <option value="7">7 Hari Terakhir</option>
                            </select>
                        </div>
                    </div>

                    {/* Loading skeleton */}
                    {loading && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <SkeletonChart />
                                <SkeletonChart />
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {isEmpty && (
                        <div
                            dusk="empty-state"
                            className="bg-white border border-[#e2e8f0] rounded-2xl py-20 px-6 flex flex-col items-center justify-center text-center"
                        >
                            <svg className="w-14 h-14 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="text-base font-semibold text-[#1e293b]">Data belum cukup untuk membentuk tren</p>
                            <p className="text-sm text-[#64748b] mt-1">Catat observasi lapangan untuk melihat analisis tren lahan Anda.</p>
                        </div>
                    )}

                    {/* Data loaded */}
                    {!loading && !isEmpty && (
                        <>
                            {/* KPI Cards */}
                            {kpi && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <KpiCard
                                        label="Total Curah Hujan"
                                        value={`${kpi.totalRain?.toLocaleString('id-ID') ?? 0} mm`}
                                        badge={kpi.rainBadge}
                                        accent="#3b82f6"
                                        iconBg="rgba(59,130,246,0.1)"
                                        icon={<RainIcon />}
                                    />
                                    <KpiCard
                                        label="Kelembapan Rerata"
                                        value={`${kpi.avgHumidity ?? 0}%`}
                                        badge={kpi.humidityBadge}
                                        accent="#3d5a3d"
                                        iconBg="rgba(61,90,61,0.1)"
                                        icon={<HumidityIcon />}
                                    />
                                    <KpiCard
                                        label="Indeks Risiko Rata-rata"
                                        value={`${kpi.avgRisk ?? 0}/100`}
                                        badge={kpi.riskBadge}
                                        accent="#f59e0b"
                                        iconBg="rgba(245,158,11,0.1)"
                                        icon={<RiskIcon />}
                                    />
                                    <KpiCard
                                        label="Skor Kesiapan Lahan"
                                        value={`${kpi.resilienceScore ?? 0}%`}
                                        badge={kpi.resilienceBadge}
                                        accent="#22c55e"
                                        iconBg="rgba(34,197,94,0.1)"
                                        icon={<ShieldIcon />}
                                    />
                                </div>
                            )}

                            {/* Charts Row 1: Tren Cuaca + Fluktuasi Risiko */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                {/* Tren Curah Hujan & Kelembapan */}
                                <div dusk="chart-tren-cuaca" className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm p-6 md:p-8">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-[#1e293b] tracking-tight">
                                                Tren Curah Hujan & Kelembapan
                                            </h3>
                                            <p className="text-sm text-[#64748b]">Perbandingan {granularityLabel} pada periode {rangeLabel}.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#64748b]">
                                                <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> Hujan
                                            </span>
                                            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#64748b]">
                                                <span className="w-2.5 h-2.5 rounded-full bg-[#3d5a3d]" /> Lembap
                                            </span>
                                        </div>
                                    </div>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="gradRain" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="gradHum" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3d5a3d" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3d5a3d" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="bulanShort" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<RainTooltip />} />
                                            <Area type="monotone" dataKey="curahHujan" name="Curah Hujan" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gradRain)" />
                                            <Area type="monotone" dataKey="kelembapan" name="Kelembapan" stroke="#3d5a3d" strokeWidth={2.5} fill="url(#gradHum)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                    <div className="mt-4 flex items-center gap-4 text-xs text-[#64748b]">
                                        <span>Suhu (°C)</span>
                                        <span>Kelembapan (%)</span>
                                    </div>
                                </div>

                                {/* Fluktuasi Indeks Risiko */}
                                <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm p-6 md:p-8">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-[#1e293b] tracking-tight">
                                                Fluktuasi Indeks Risiko
                                            </h3>
                                            <p className="text-sm text-[#64748b]">Visualisasi tingkat ancaman lahan secara kronologis.</p>
                                        </div>
                                        {insights?.summary?.criticalMonths && insights.summary.criticalMonths !== 'Tidak ada bulan kritis teridentifikasi' && (
                                            <span className="text-xs font-bold text-[#ef4444] border border-[#ef4444]/20 bg-[#ef4444]/5 px-3 py-1 rounded-full whitespace-nowrap">
                                                Peringatan Aktif
                                            </span>
                                        )}
                                    </div>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="bulanShort" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                            <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<RiskTooltip />} />
                                            <Line type="monotone" dataKey="riskIndex" name="Indeks Risiko" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Charts Row 2: Distribusi Risiko + Frekuensi Observasi */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <div dusk="chart-distribusi-risiko" className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm p-6 md:p-8">
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-[#1e293b] tracking-tight">Distribusi Risiko</h3>
                                        <p className="text-sm text-[#64748b]">Sebaran observasi per kategori status.</p>
                                    </div>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={distribusi} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="status" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                            <Tooltip />
                                            <Bar dataKey="jumlah" name="Observasi" radius={[6, 6, 0, 0]}>
                                                {distribusi.map((entry, i) => (
                                                    <Cell key={i} fill={RISK_COLORS[entry.status] ?? '#94a3b8'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div dusk="chart-frekuensi-observasi" className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm p-6 md:p-8">
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-[#1e293b] tracking-tight">Frekuensi Observasi</h3>
                                        <p className="text-sm text-[#64748b]">Aktivitas pencatatan lapangan per bulan.</p>
                                    </div>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="gradFreq" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="bulanShort" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="frekuensi" name="Observasi" stroke="#22c55e" strokeWidth={2.5} fill="url(#gradFreq)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Insight Section */}
                            {insights && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                    {/* Ringkasan Strategis */}
                                    <div className="bg-[#3d5a3d] rounded-2xl p-7 md:p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                                        <div className="absolute -top-4 -right-4 w-32 h-32 opacity-10 pointer-events-none">
                                            <svg viewBox="0 0 100 100" fill="white" className="w-full h-full">
                                                <path d="M50 10 C50 10, 80 40, 80 60 C80 76, 66 90, 50 90 C34 90, 20 76, 20 60 C20 40, 50 10, 50 10Z" />
                                            </svg>
                                        </div>
                                        <div className="relative z-10">
                                            <h3 className="text-lg md:text-xl font-semibold tracking-tight mb-4">
                                                Ringkasan Insight
                                            </h3>
                                            <p className="text-sm md:text-base leading-relaxed text-white/90">
                                                {insights.summary?.text}
                                            </p>
                                        </div>
                                        <div className="relative z-10 mt-6 space-y-2.5">
                                            <div className="flex items-center gap-3">
                                                <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                                                <span className="text-xs md:text-sm">{insights.summary?.criticalMonths}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                                                <span className="text-xs md:text-sm">{insights.summary?.accuracy}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Insight Cards */}
                                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {(insights.cards ?? []).map((card, idx) => {
                                            const Icon = INSIGHT_ICONS[card.icon] || WaterDropIcon;
                                            return (
                                                <div key={idx} className="bg-white border-2 border-[#e2e8f0] rounded-2xl p-5 shadow-sm hover:border-[#3d5a3d]/30 transition-colors">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Icon />
                                                        <h4 className="text-base font-bold text-[#1e293b]">{card.title}</h4>
                                                    </div>
                                                    <p className="text-sm text-[#64748b] leading-relaxed">{card.text}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
