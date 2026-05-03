import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

function RiskCircle({ score }) {
    let color = '#22c55e';
    let label = 'RISIKO RENDAH';
    let labelBg = 'bg-green-500';

    if (score > 70) {
        color = '#ef4444';
        label = 'RISIKO TINGGI';
        labelBg = 'bg-red-500';
    } else if (score > 40) {
        color = '#f59e0b';
        label = 'RISIKO SEDANG';
        labelBg = 'bg-amber-500';
    }

    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const dashArray = "24 7.41";
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center shrink-0 w-[120px] md:w-[130px]">
            <div className="relative flex items-center justify-center w-[110px] h-[110px] md:w-[128px] md:h-[128px]">
                <svg className="absolute w-[120px] h-[120px] md:w-[140px] md:h-[140px] transform -rotate-90" viewBox="0 0 140 140">
                    <defs>
                        <mask id="risk-mask">
                            <circle cx="70" cy="70" r={radius} stroke="white" strokeWidth="10" fill="transparent" strokeDasharray={dashArray} />
                        </mask>
                    </defs>
                    <circle cx="70" cy="70" r={radius} stroke="#f1f5f9" strokeWidth="10" fill="transparent" mask="url(#risk-mask)" />
                    <circle
                        cx="70" cy="70" r={radius}
                        stroke={color} strokeWidth="10" fill="transparent"
                        strokeDasharray={circumference} strokeDashoffset={offset}
                        mask="url(#risk-mask)" strokeLinecap="butt"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="text-center z-10">
                    <span className="text-[24px] md:text-[30px] font-black text-slate-800 leading-none">{score}%</span>
                </div>
            </div>
            <div className={`mt-4 w-full px-3 py-1.5 md:px-4 md:py-2 rounded-full ${labelBg} text-white text-[10px] md:text-[12px] font-black tracking-[1px] uppercase text-center shadow-sm`}>
                {label}
            </div>
        </div>
    );
}

function StatusBadge({ icon, label, value }) {
    return (
        <div className="bg-white border-[#e2e8f0] border-[0.667px] flex items-center gap-2 h-[34px] px-3.5 rounded-2xl shadow-sm hover:border-slate-300 transition-all w-full md:w-auto">
            <div className="shrink-0 size-4 flex items-center justify-center">{icon}</div>
            <p className="font-bold text-[#1e293b] text-[12px] md:text-[14px] whitespace-nowrap">
                {label}: <span className={value === 'Menurun' || value === 'Meningkat' ? 'text-amber-600' : 'text-green-600'}>{value}</span>
            </p>
        </div>
    );
}

function DetailRiskCard({ title, score, level, description, icon, colorClass }) {
    const colors = {
        green: { badge: 'bg-green-500' },
        amber: { badge: 'bg-amber-500' },
        red:   { badge: 'bg-red-500' },
    };
    const c = colors[colorClass] || colors.green;

    return (
        <div className="bg-white border-[0.5px] border-slate-200 rounded-[24px] p-5 md:p-6 shadow-sm flex flex-col h-full hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-50 flex items-center justify-center text-[#3D5A3D]">
                    {icon}
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Skor Risiko</p>
                    <p className={`text-lg md:text-xl font-black ${score > 70 ? 'text-red-500' : score > 40 ? 'text-amber-500' : 'text-green-500'}`}>
                        {score}/100
                    </p>
                </div>
            </div>
            <h4 className="text-[15px] md:text-base font-extrabold text-slate-800 mb-2 leading-tight">{title}</h4>
            <div className={`inline-flex self-start px-2 py-0.5 rounded-full ${c.badge} text-white text-[9px] font-bold uppercase tracking-wider mb-4`}>
                LEVEL: {level}
            </div>
            <p className="text-[13px] text-slate-500 leading-relaxed font-medium">{description}</p>
        </div>
    );
}

export default function AnalisisRisiko({ observation, risk_metrics }) {
    const { drought, puddle, disease, overall, readiness, summary, soil_type } = risk_metrics;
    const areaName = observation.agricultural_area?.name || 'Area Lahan';

    const getLevel  = (s) => s > 70 ? 'Tinggi' : s > 40 ? 'Sedang' : 'Rendah';
    const getColor  = (s) => s > 70 ? 'red'    : s > 40 ? 'amber'  : 'green';

    return (
        <AuthenticatedLayout title="Hasil Analisis" badge={areaName} currentRoute="input-kondisi.index">
            <Head title="Analisis Cerdas - AgriSupport" />

            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-24">
                {/* Heading */}
                <div className="mb-8 md:mb-10">
                    <h1 className="text-[26px] md:text-[32px] font-black text-slate-800 tracking-tight leading-tight mb-2">Analisis Cerdas AgriSupport</h1>
                    <p className="text-[14px] md:text-[16px] text-slate-500 font-medium">Data real-time cuaca & observasi Anda diolah dengan algoritma risiko.</p>
                </div>

                {/* Main Content Grid */}
                <div className="flex flex-col lg:flex-row gap-6 mb-12">

                    {/* Overall Risk Card */}
                    <div
                        className="w-full lg:w-[62%] border-[0.667px] border-slate-200 rounded-[24px] shadow-sm relative overflow-hidden group bg-[#f8fafc] min-h-[280px]"
                        style={{ backgroundImage: "linear-gradient(152deg, rgba(239, 68, 68, 0.05) 0%, rgba(248, 250, 252, 1) 50%, rgba(248, 250, 252, 1) 100%)" }}
                    >
                        <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none group-hover:scale-105 transition-transform duration-1000">
                            <svg className="w-[300px] h-[300px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 p-6 md:p-10 relative z-10">
                            <RiskCircle score={overall} />

                            <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
                                <h3 className="text-[20px] md:text-[24px] font-black text-[#1e293b] tracking-tight">Status Risiko Keseluruhan</h3>
                                <p className="text-[#64748b] leading-relaxed text-[15px] md:text-[16px] font-medium">
                                    {summary || "Sistem mendeteksi ancaman signifikan terhadap kesehatan tanaman Anda."}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                                    <StatusBadge
                                        label="Keamanan Lahan"
                                        value={overall > 60 ? 'Menurun' : 'Stabil'}
                                        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>}
                                    />
                                    <StatusBadge
                                        label="Tren Risiko"
                                        value={overall > 50 ? "Meningkat" : "Stabil"}
                                        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.5 4.5L21.75 8.25" /></svg>}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Readiness Card */}
                    <div className="w-full lg:w-[38%] bg-[#f0f4f0] border-[0.667px] border-[#3D5A3D]/20 rounded-[24px] p-8 shadow-sm flex flex-col items-center justify-center text-center group">
                        <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mb-6">
                            <div className="absolute bg-[#3d5a3d]/10 inset-0 rounded-[24px] shadow-inner" />
                            <svg className="relative w-8 h-8 md:w-10 md:h-10 text-[#3D5A3D]" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                        </div>
                        <h3 className="text-[18px] md:text-[20px] font-extrabold text-[#1e293b] mb-3 tracking-tight">Kesiapan Lahan</h3>
                        <p className="text-[15px] text-slate-600 leading-normal font-medium mb-6 max-w-[240px]">
                            Lahan berada dalam kondisi <span className="text-[#3D5A3D] font-black">"{readiness > 60 ? 'Optimal' : 'Waspada'}"</span>.
                        </p>
                        <div className="w-full space-y-3">
                            <div className="w-full bg-white/50 h-3 rounded-full overflow-hidden flex border border-[#3D5A3D]/10">
                                <div
                                    className="h-full bg-[#3d5a3d] transition-all duration-1000 ease-out rounded-full shadow-sm"
                                    style={{ width: `${readiness}%` }}
                                />
                            </div>
                            <span className="block text-[11px] font-black text-[#64748b] tracking-[1.5px] uppercase">{readiness}% SIAP MANDIRI</span>
                        </div>
                    </div>
                </div>

                {/* Detail Metrics */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-6 w-1.5 bg-[#3D5A3D] rounded-full" />
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Indikator Detail</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <DetailRiskCard
                            title="Risiko Kekeringan"
                            score={drought}
                            level={getLevel(drought)}
                            colorClass={getColor(drought)}
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>}
                            description={`Kelembapan tanah optimal untuk tipe ${soil_type || 'mineral'}.`}
                        />
                        <DetailRiskCard
                            title="Risiko Genangan"
                            score={puddle}
                            level={getLevel(puddle)}
                            colorClass={getColor(puddle)}
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" /></svg>}
                            description="Estimasi infiltrasi berdasarkan curah hujan & topografi."
                        />
                        <DetailRiskCard
                            title={`Risiko ${risk_metrics.relevant_disease || 'Penyakit'}`}
                            score={disease}
                            level={getLevel(disease)}
                            colorClass={getColor(disease)}
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>}
                            description={risk_metrics.disease_advice || "Waspadai anomali kelembapan tinggi."}
                        />
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-[#3D5A3D] rounded-[32px] p-8 md:p-14 text-center shadow-xl shadow-[#3D5A3D]/20 relative overflow-hidden group">
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-1000" />

                    <h4 className="text-[24px] md:text-[32px] font-black text-white mb-4 relative z-10 leading-tight">Optimalkan Hasil Panen Anda</h4>
                    <p className="text-white/80 text-[16px] md:text-[18px] mb-10 max-w-xl mx-auto font-medium relative z-10">
                        Sistem telah merumuskan langkah konkret yang harus Anda ambil sekarang.
                    </p>

                    <Link
                        href={route('rekomendasi-tindakan.show', observation.id)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-4 bg-white text-[#3D5A3D] px-10 py-5 rounded-2xl text-[18px] md:text-[20px] font-black hover:bg-white/90 active:scale-95 transition-all shadow-lg relative z-10"
                    >
                        Lihat Rekomendasi Tindakan
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
