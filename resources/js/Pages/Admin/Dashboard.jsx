import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    PieChart, Pie, Cell, Tooltip as PieTooltip, Legend as PieLegend, ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip,
} from 'recharts';

const RISK_META = {
    tinggi: { label: 'Tinggi', color: '#ef4444', cls: 'bg-red-500/20 text-red-400' },
    sedang: { label: 'Sedang', color: '#f59e0b', cls: 'bg-amber-500/20 text-amber-400' },
    rendah: { label: 'Rendah', color: '#22c55e', cls: 'bg-emerald-500/20 text-emerald-400' },
};
const riskMeta = (lvl) => RISK_META[lvl] ?? { label: lvl, color: '#64748b', cls: 'bg-slate-500/20 text-slate-400' };

const CROP_LABEL = {
    Baik: 'Baik', Sedang: 'Sedang', Buruk: 'Buruk',
    'Sangat Baik': 'Sangat Baik', 'Sangat Buruk': 'Sangat Buruk',
};

/* ── Stat card kecil ── */
function StatCard({ icon, label, value, accent }) {
    return (
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs text-slate-400 leading-tight">{label}</p>
                <p className="text-2xl font-bold text-white leading-tight mt-0.5">{value}</p>
            </div>
        </div>
    );
}

export default function Dashboard({ stats = {}, riskDistribution = [], weeklyTrend = [], recentActivities = [] }) {
    const totalRisk = riskDistribution.reduce((s, d) => s + (d.value || 0), 0);
    const hasRisk   = totalRisk > 0;
    const hasTrend  = weeklyTrend.some((w) => w.count > 0);

    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard Admin" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Ringkasan kondisi platform AgriSupport secara keseluruhan.</p>
                </div>

                {/* ── Row 1: Stat Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard
                        label="Total Petani"
                        value={stats.total_farmers ?? 0}
                        accent="bg-emerald-500/15"
                        icon={
                            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Total Lahan"
                        value={stats.total_areas ?? 0}
                        accent="bg-sky-500/15"
                        icon={
                            <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Total Observasi"
                        value={stats.total_observations ?? 0}
                        accent="bg-violet-500/15"
                        icon={
                            <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Tindakan Selesai"
                        value={stats.total_completed ?? 0}
                        accent="bg-amber-500/15"
                        icon={
                            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        }
                    />
                </div>

                {/* ── Row 2: Donut + Line Chart ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

                    {/* Donut — distribusi risiko */}
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
                        <h2 className="text-sm font-bold text-white mb-1">Distribusi Risiko Lahan</h2>
                        <p className="text-xs text-slate-500 mb-4">Berdasarkan observasi terbaru tiap lahan.</p>

                        {hasRisk ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={riskDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {riskDistribution.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <PieTooltip
                                        contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', color: '#e2e8f0', fontSize: 12 }}
                                        formatter={(value, name) => [`${value} lahan`, name]}
                                    />
                                    <PieLegend
                                        iconType="circle"
                                        iconSize={8}
                                        wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 8 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[220px] text-slate-500 text-sm">
                                Belum ada data observasi.
                            </div>
                        )}

                        {/* Legenda ringkas */}
                        {hasRisk && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {riskDistribution.map((d) => (
                                    <div key={d.name} className="flex items-center justify-between bg-slate-800/60 rounded-xl px-3 py-2">
                                        <span className="flex items-center gap-2 text-xs text-slate-400">
                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                                            {d.name}
                                        </span>
                                        <span className="text-sm font-bold text-white">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Line chart — tren observasi 7 minggu */}
                    <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5">
                        <h2 className="text-sm font-bold text-white mb-1">Tren Observasi (7 Minggu Terakhir)</h2>
                        <p className="text-xs text-slate-500 mb-4">Jumlah observasi baru yang masuk per minggu.</p>

                        {hasTrend ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <LineChart data={weeklyTrend} margin={{ top: 5, right: 16, left: -16, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                    <XAxis
                                        dataKey="week"
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
                                    <LineTooltip
                                        contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', color: '#e2e8f0', fontSize: 12 }}
                                        formatter={(v) => [`${v} observasi`, 'Jumlah']}
                                        labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        name="Observasi"
                                        stroke="#34d399"
                                        strokeWidth={2.5}
                                        dot={{ r: 4, fill: '#34d399', strokeWidth: 0 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[240px] text-slate-500 text-sm">
                                Belum ada observasi dalam 7 minggu terakhir.
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Row 3: Tabel 10 Aktivitas Terbaru ── */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-white">Aktivitas Observasi Terbaru</h2>
                            <p className="text-xs text-slate-500 mt-0.5">10 observasi terbaru dari seluruh petani.</p>
                        </div>
                        <Link
                            href={route('admin.laporan.index')}
                            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                        >
                            Lihat Semua →
                        </Link>
                    </div>

                    <div className="overflow-x-auto scrollbar-slim">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase tracking-wide border-b border-slate-700">
                                <tr>
                                    <th className="px-5 py-3">Petani</th>
                                    <th className="px-5 py-3">Lahan</th>
                                    <th className="px-5 py-3">Tanggal</th>
                                    <th className="px-5 py-3">Kondisi Tanaman</th>
                                    <th className="px-5 py-3">Risiko</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {recentActivities.length > 0 ? recentActivities.map((act) => {
                                    const meta = riskMeta(act.risk_level);
                                    return (
                                        <tr key={act.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="px-5 py-3.5 font-medium text-white whitespace-nowrap">{act.petani}</td>
                                            <td className="px-5 py-3.5 text-slate-400">{act.lahan}</td>
                                            <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">{act.tanggal}</td>
                                            <td className="px-5 py-3.5 text-slate-300">{CROP_LABEL[act.crop_condition] ?? act.crop_condition}</td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${meta.cls}`}>
                                                        {meta.label}
                                                    </span>
                                                    <span className="text-xs text-slate-500">{act.risk_score}/100</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-10 text-center text-slate-500">
                                            Belum ada observasi tercatat.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
