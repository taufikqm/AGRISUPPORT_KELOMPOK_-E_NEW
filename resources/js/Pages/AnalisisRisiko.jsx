import { Link, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const LEVEL_CONFIG = {
    Rendah: { bar: 'bg-green-500',  badge: 'bg-green-100 text-green-700',   ring: 'border-green-200' },
    Sedang: { bar: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700', ring: 'border-yellow-200' },
    Tinggi: { bar: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700', ring: 'border-orange-200' },
    Kritis: { bar: 'bg-red-500',    badge: 'bg-red-100 text-red-700',       ring: 'border-red-200' },
};

function RiskCard({ label, icon, risk }) {
    const cfg = LEVEL_CONFIG[risk.level] ?? LEVEL_CONFIG.Rendah;

    return (
        <div className={`bg-white rounded-2xl border p-5 shadow-sm ${cfg.ring}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <span className="text-sm font-semibold text-gray-700">{label}</span>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                    {risk.level}
                </span>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                <div
                    className={`h-2.5 rounded-full transition-all duration-700 ${cfg.bar}`}
                    style={{ width: `${risk.score}%` }}
                />
            </div>
            <div className="flex justify-between text-[11px] text-gray-400 mb-3">
                <span>0</span>
                <span className="font-semibold text-gray-600">{risk.score} / 100</span>
                <span>100</span>
            </div>

            <p className="text-xs text-gray-500">{risk.description}</p>
        </div>
    );
}

export default function AnalisisRisiko({ observation, riskAnalysis }) {
    const area    = observation.agricultural_area ?? {};
    const overall = LEVEL_CONFIG[riskAnalysis.overall_risk_level] ?? LEVEL_CONFIG.Rendah;

    const fmtDate = d => d
        ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        : '-';

    return (
        <AuthenticatedLayout title="Analisis Risiko" currentRoute="input-kondisi.index">
            <Head title="Analisis Risiko" />

            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto space-y-5">

                    {/* Sub-header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">{area.name}</p>
                            <p className="text-xs text-gray-500">{fmtDate(observation.observation_date)}</p>
                        </div>
                        <Link
                            href={route('validasi-observasi.show', observation.id)}
                            className="text-xs text-gray-500 hover:text-gray-700 underline"
                        >
                            ← Kembali
                        </Link>
                    </div>

                    {/* 3 Indikator Risiko */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <RiskCard label="Risiko Kekeringan" icon="🌾" risk={riskAnalysis.drought_risk} />
                        <RiskCard label="Risiko Genangan"   icon="🌊" risk={riskAnalysis.flood_risk} />
                        <RiskCard label="Risiko Penyakit"   icon="🦠" risk={riskAnalysis.disease_risk} />
                    </div>

                    {/* Risiko Keseluruhan */}
                    <div className={`bg-white rounded-2xl border shadow-sm p-5 ${overall.ring}`}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-700">Risiko Keseluruhan</h3>
                            <span className={`text-sm font-bold px-3 py-1 rounded-full ${overall.badge}`}>
                                {riskAnalysis.overall_risk_level} — {riskAnalysis.overall_risk_score}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
                            <div
                                className={`h-3 rounded-full transition-all duration-700 ${overall.bar}`}
                                style={{ width: `${riskAnalysis.overall_risk_score}%` }}
                            />
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{riskAnalysis.analysis_summary}</p>
                    </div>

                    {/* Aksi */}
                    <Link
                        href={route('rekomendasi-tindakan.show', observation.id)}
                        className="block w-full text-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                        Lihat Rekomendasi Tindakan →
                    </Link>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
