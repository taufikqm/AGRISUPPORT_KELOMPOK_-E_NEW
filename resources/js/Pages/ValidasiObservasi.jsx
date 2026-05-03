import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

function ComparisonCard({ icon, title, apiLabel, apiValue, fieldLabel, fieldValue, statusText, isDifferent }) {
    const colorStyles = isDifferent ? {
        border:     'border-l-amber-500',
        bgIcon:     'bg-amber-100/50',
        textIcon:   'text-amber-600',
        badge:      'bg-amber-500',
        innerAPI:   'border-slate-200 bg-slate-50/50',
        innerField: 'border-amber-500/20 bg-amber-500/5',
        textField:  'text-amber-800',
    } : {
        border:     'border-l-green-500',
        bgIcon:     'bg-green-100/50',
        textIcon:   'text-green-600',
        badge:      'bg-green-500',
        innerAPI:   'border-slate-200 bg-slate-50/50',
        innerField: 'border-green-500/20 bg-green-500/5',
        textField:  'text-green-700',
    };

    return (
        <div className={`bg-white border border-slate-200 border-l-8 ${colorStyles.border} rounded-2xl shadow-sm overflow-hidden mb-6`}>
            <div className="flex flex-col md:flex-row md:items-center gap-6 p-6">
                <div className="flex items-center gap-4 shrink-0">
                    <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${colorStyles.bgIcon} shrink-0`}>
                        <div className={`w-7 h-7 ${colorStyles.textIcon}`}>{icon}</div>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-800 leading-tight mb-1">{title}</h4>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${colorStyles.badge} text-white`}>
                            {statusText}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row flex-1 gap-4 md:ml-6">
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{apiLabel}</p>
                        <div className={`px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 border ${colorStyles.innerAPI}`}>
                            {apiValue || '-'}
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${isDifferent ? 'text-amber-600' : 'text-green-600'}`}>{fieldLabel}</p>
                        <div className={`px-4 py-2.5 rounded-xl text-sm font-bold border ${colorStyles.innerField} ${colorStyles.textField}`}>
                            {fieldValue || '-'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ValidasiObservasi({ observation }) {
    const areaName    = observation.agricultural_area?.name || 'Area';
    const smAPI       = observation.weather_soil_moisture;
    const apiPuddle   = (observation.weather_precip_mm ?? 0) > 0 ? 'Hujan' : 'Tidak Hujan';

    let soilMoistureText = 'Tidak Ada Data';
    if (smAPI !== null && smAPI !== undefined) {
        const smPct = Math.round(smAPI * 100);
        if (smPct < 20)      soilMoistureText = `Sangat Kering (${smPct}%)`;
        else if (smPct < 40) soilMoistureText = `Rendah (${smPct}%)`;
        else if (smPct < 60) soilMoistureText = `Normal (${smPct}%)`;
        else                 soilMoistureText = `Tinggi (${smPct}%)`;
    }

    return (
        <AuthenticatedLayout title="Validasi Data" badge={areaName} currentRoute="input-kondisi.index">
            <Head title="Validasi Observasi - AgriSupport" />

            <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-24">

                {/* Page Header */}
                <div className="text-center mb-10">
                    <h1 className="text-[28px] md:text-[34px] font-black text-slate-800 tracking-tight leading-tight mb-3">Hasil Validasi & Perbandingan</h1>
                    <p className="text-[15px] md:text-[16px] text-slate-500 font-medium max-w-2xl mx-auto">Menganalisis kesesuaian antara data satelit/cuaca dengan observasi aktual Anda.</p>
                </div>

                {/* Warning Banner */}
                <div className="bg-white border-2 border-amber-500/20 rounded-[32px] p-8 md:p-12 mb-12 shadow-xl shadow-amber-500/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500/20" />

                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mb-6 border border-amber-100 shadow-sm">
                            <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-4">Perbedaan Data Terdeteksi</h2>
                        <p className="text-[16px] md:text-[18px] text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
                            Sistem mendeteksi kondisi mikro-iklim yang berbeda dari prakiraan makro. Kami akan memprioritaskan input manual Anda untuk analisis risiko.
                        </p>

                        <div className="flex flex-wrap justify-center gap-3">
                            <div className="px-5 py-3 bg-[#3D5A3D] text-white rounded-2xl shadow-lg shadow-[#3D5A3D]/20 inline-flex items-center gap-2.5">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-black uppercase tracking-wider">Prioritas Observasi Lapangan</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comparison List */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-6 w-1.5 bg-[#3D5A3D] rounded-full" />
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Perbandingan Indikator</h3>
                    </div>

                    <ComparisonCard
                        icon={<svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 13.5H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>}
                        title="Kelembapan Tanah"
                        statusText="Berbeda"
                        isDifferent={true}
                        apiLabel="Prakiraan API"
                        apiValue={soilMoistureText}
                        fieldLabel="Observasi Anda"
                        fieldValue={`${observation.soil_moisture} (Aktual)`}
                    />

                    <ComparisonCard
                        icon={<svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" /></svg>}
                        title="Kondisi Air"
                        statusText="Berbeda"
                        isDifferent={true}
                        apiLabel="Prakiraan API"
                        apiValue={apiPuddle}
                        fieldLabel="Observasi Anda"
                        fieldValue={`Genangan ${observation.water_puddle}`}
                    />

                    <ComparisonCard
                        icon={<svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>}
                        title="Suhu Sekitar"
                        statusText="Sesuai"
                        isDifferent={false}
                        apiLabel="Prakiraan API"
                        apiValue={`${observation.weather_temp || '-'}°C`}
                        fieldLabel="Observasi Anda"
                        fieldValue={`${observation.weather_temp || '-'}°C (Normal)`}
                    />
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href={route('analisis-risiko.show', observation.id)}
                        className="flex-1 px-8 py-5 bg-[#3D5A3D] text-white text-[18px] font-black rounded-[20px] hover:bg-[#2b402b] shadow-xl shadow-[#3D5A3D]/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        Lanjut ke Analisis Risiko
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </Link>
                    <Link
                        href={route('input-kondisi.index')}
                        className="px-8 py-5 bg-white text-slate-700 text-[18px] font-bold rounded-[20px] border-2 border-dashed border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        Re-Input Data
                    </Link>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
