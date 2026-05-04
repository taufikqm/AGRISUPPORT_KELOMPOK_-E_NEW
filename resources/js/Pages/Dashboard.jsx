import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import WeatherAlertBanner from '@/Components/Weather/WeatherAlertBanner';
import { WiDaySunny, WiCloudy, WiRain, WiSprinkle, WiThunderstorm, WiFog } from 'react-icons/wi';

function WeatherIcon({ condition }) {
    const cls = "text-[80px] drop-shadow-sm";
    if (condition === 'Cerah')       return <WiDaySunny    className={`${cls} text-yellow-300`} />;
    if (condition === 'Berawan')     return <WiCloudy       className={`${cls} text-white/70`} />;
    if (condition === 'Hujan Ringan')return <WiSprinkle     className={`${cls} text-blue-200`} />;
    if (condition === 'Hujan')       return <WiRain         className={`${cls} text-blue-300`} />;
    if (condition === 'Badai')       return <WiThunderstorm className={`${cls} text-yellow-200`} />;
    if (condition === 'Berkabut')    return <WiFog          className={`${cls} text-white/50`} />;
    return                                  <WiCloudy       className={`${cls} text-white/40`} />;
}

function WeatherCard({ weather }) {
    if (!weather) return (
        <div className="bg-[#3D5A3D] rounded-2xl p-6 flex flex-col justify-center items-center text-center text-white/60 min-h-[220px]">
            <svg className="w-10 h-10 mb-3 text-white/30" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 .75-7.425A4.502 4.502 0 0 0 14.25 9 4.5 4.5 0 0 0 6 12.75 4.49 4.49 0 0 0 2.25 15Z" />
            </svg>
            <p className="text-sm font-bold">Belum ada data cuaca</p>
            <p className="text-xs mt-1">Lakukan input kondisi lapangan terlebih dahulu</p>
        </div>
    );

    const prediction = weather.humidity > 80
        ? 'Kelembapan tinggi terdeteksi. Waspadai potensi hujan.'
        : (weather.condition === 'Hujan' || weather.condition === 'Hujan Ringan')
            ? 'Hujan sedang berlangsung. Persiapkan drainase lahan Anda.'
            : 'Kondisi cuaca mendukung aktivitas pertanian hari ini.';

    return (
        <div className="bg-[#3D5A3D] rounded-2xl p-6 text-white flex flex-col justify-between min-h-[220px]">
            <p className="text-[10px] font-black uppercase tracking-[2px] text-white/50 mb-2">Cuaca Hari Ini</p>

            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-[38px] font-black leading-none">
                        {weather.temp !== null ? `${Math.round(weather.temp)}°C` : '--°C'}
                    </p>
                    <p className="text-[15px] font-bold text-white/75 mt-1">{weather.condition}</p>
                </div>
                <WeatherIcon condition={weather.condition} />
            </div>

            <div className="flex gap-2 mb-4">
                <div className="flex-1 bg-white/10 rounded-xl px-3 py-2">
                    <p className="text-[9px] font-black uppercase tracking-wider text-white/50 mb-0.5">Kelembaban</p>
                    <p className="text-[15px] font-black">{weather.humidity !== null ? `${weather.humidity}%` : '--'}</p>
                </div>
                <div className="flex-1 bg-white/10 rounded-xl px-3 py-2">
                    <p className="text-[9px] font-black uppercase tracking-wider text-white/50 mb-0.5">Kecepatan Angin</p>
                    <p className="text-[15px] font-black">{weather.wind !== null ? `${weather.wind} km/j` : '--'}</p>
                </div>
            </div>

            <p className="text-[11px] text-white/55 italic leading-relaxed">"{prediction}"</p>
        </div>
    );
}

function RiskAlertCard({ alert }) {
    const isDanger  = alert.status === 'danger';
    const isWarning = alert.status === 'warning';

    const badgeClass = isDanger  ? 'bg-red-500'   : isWarning ? 'bg-amber-500'   : 'bg-[#3D5A3D]';
    const iconColor  = isDanger  ? 'text-red-500'  : isWarning ? 'text-amber-500' : 'text-[#3D5A3D]';
    const iconBg     = isDanger  ? 'bg-red-50'     : isWarning ? 'bg-amber-50'    : 'bg-emerald-50';

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[220px]">
            <div>
                <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
                        {!isDanger && !isWarning ? (
                            <svg className={`w-5 h-5 ${iconColor}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                            </svg>
                        ) : (
                            <svg className={`w-5 h-5 ${iconColor}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                        )}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full ${badgeClass} text-white text-[10px] font-black uppercase tracking-wide`}>
                        {alert.level}
                    </span>
                </div>

                <h3 className="text-[15px] font-extrabold text-slate-800 mb-2 leading-tight">{alert.name}</h3>
                <p className="text-[12px] text-slate-500 leading-relaxed font-medium line-clamp-3">{alert.desc}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Lokasi</p>
                    <p className="text-[11px] font-bold text-slate-600">{alert.area_name}</p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Terakhir Update</p>
                    <p className="text-[11px] font-bold text-slate-600">Observasi Terakhir</p>
                </div>
            </div>
        </div>
    );
}

const categoryIcons = {
    'Proteksi Tanaman': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
    ),
    'Infrastruktur': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 .75-7.425A4.502 4.502 0 0 0 14.25 9 4.5 4.5 0 0 0 6 12.75 4.49 4.49 0 0 0 2.25 15Z" />
        </svg>
    ),
    'Pemupukan': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
    ),
    'Pencatatan': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
        </svg>
    ),
};

function RecommendationCard({ rec, obsId }) {
    const isUrgent = rec.urgency === 'SEGERA' || rec.urgency === 'TINGGI';
    const icon = categoryIcons[rec.category] || categoryIcons['Pencatatan'];

    return (
        <div className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all ${rec.is_completed ? 'opacity-55' : ''}`}>
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        {icon}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                        isUrgent ? 'bg-red-500 text-white' : 'bg-blue-100 text-blue-600'
                    }`}>
                        {isUrgent ? 'SEGERA' : 'TERENCANA'}
                    </span>
                </div>
                <h4 className="text-[13px] font-extrabold text-slate-800 leading-tight line-clamp-2">{rec.title}</h4>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{rec.category}</span>
                {obsId && (
                    <Link
                        href={route('rekomendasi-tindakan.show', obsId)}
                        className="text-[11px] font-black text-[#3D5A3D] hover:underline flex items-center gap-0.5"
                    >
                        Detail
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                    </Link>
                )}
            </div>
        </div>
    );
}

const quickLinks = [
    {
        name: 'Wilayah Lahan', route: 'wilayah-lahan.index',
        icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>,
    },
    {
        name: 'Pemantauan Cuaca', route: 'cuaca.index',
        icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 .75-7.425A4.502 4.502 0 0 0 14.25 9 4.5 4.5 0 0 0 6 12.75 4.49 4.49 0 0 0 2.25 15Z" /></svg>,
    },
    {
        name: 'Input Kondisi', route: 'input-kondisi.index',
        icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>,
    },
    {
        name: 'Riwayat', route: 'riwayat-lahan.index',
        icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
    },
];

export default function Dashboard({ auth, weather, riskAlerts, recommendations, recentActivity, latestObservationId, areas, selectedAreaId }) {
    const name    = auth.user.name;
    const noLand  = !areas || areas.length === 0;
    const oneOnly = areas && areas.length === 1;

    const [loading,  setLoading]  = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        if (!selectedAreaId && !noLand) {
            const saved = localStorage.getItem('agrisupport_area');
            if (saved && areas.some(a => String(a.id) === saved)) {
                router.get(route('dashboard'), { area_id: saved }, { preserveScroll: true, replace: true });
            }
        }
    }, []);

    useEffect(() => {
        const off1 = router.on('start',  () => { setLoading(true);  setErrorMsg(null); });
        const off2 = router.on('finish', () => setLoading(false));
        const off3 = router.on('error',  () => { setLoading(false); setErrorMsg('Gagal memuat data. Data sebelumnya masih ditampilkan.'); });
        return () => { off1(); off2(); off3(); };
    }, []);

    const handleAreaChange = (e) => {
        const val = e.target.value;
        val ? localStorage.setItem('agrisupport_area', val)
            : localStorage.removeItem('agrisupport_area');
        router.get(route('dashboard'), val ? { area_id: val } : {}, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout title="Dashboard Pertanian" currentRoute="dashboard">
            <Head title="Dashboard - AgriSupport" />

            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-24">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-[24px] md:text-[28px] font-black text-slate-800 tracking-tight leading-tight">
                            Selamat Datang Kembali, {name}!
                        </h1>
                        <p className="text-[14px] md:text-[15px] text-slate-400 font-medium mt-1">
                            Hari ini adalah hari yang baik untuk memeriksa kondisi lahan Anda.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        {!noLand && (
                            <div className="relative">
                                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                </svg>
                                <select
                                    value={selectedAreaId ?? ''}
                                    onChange={handleAreaChange}
                                    disabled={oneOnly}
                                    className={`pl-9 pr-8 py-2.5 text-[13px] font-bold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm appearance-none transition-all
                                        ${oneOnly ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:border-[#3D5A3D]/40 focus:outline-none focus:ring-2 focus:ring-[#3D5A3D]/20 focus:border-[#3D5A3D]'}`}
                                >
                                    {!oneOnly && <option value="">Semua Lahan (Terbaru)</option>}
                                    {areas.map(area => (
                                        <option key={area.id} value={area.id}>
                                            {area.name}{area.location_name ? ` — ${area.location_name}` : ''}
                                        </option>
                                    ))}
                                </select>
                                {!oneOnly && (
                                    <svg className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                )}
                            </div>
                        )}
                        <Link
                            href={route('input-kondisi.index')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3D5A3D] text-white text-[14px] font-black rounded-xl hover:bg-[#2b402b] active:scale-95 transition-all shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Input Observasi
                        </Link>
                    </div>
                </div>

                {/* Error banner */}
                {errorMsg && (
                    <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium px-4 py-3 rounded-xl">
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                        {errorMsg}
                    </div>
                )}

                {/* No-land empty state */}
                {noLand ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
                            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                        </div>
                        <h2 className="text-[18px] font-black text-slate-700 mb-2">Anda belum memiliki lahan terdaftar</h2>
                        <p className="text-[14px] text-slate-400 font-medium mb-6 max-w-xs">Daftarkan lahan pertama Anda untuk mulai memantau kondisi dan mendapatkan rekomendasi.</p>
                        <Link
                            href={route('wilayah-lahan.index')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#3D5A3D] text-white text-[14px] font-black rounded-xl hover:bg-[#2b402b] active:scale-95 transition-all shadow-sm"
                        >
                            Daftar Lahan Pertama Anda
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>
                    </div>
                ) : (
                <div className={`relative transition-opacity duration-150 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full border-4 border-[#3D5A3D]/20 border-t-[#3D5A3D] animate-spin" />
                    </div>
                )}

                {/* Weather alerts hanya untuk lahan yang sedang dipilih */}
                <WeatherAlertBanner areaId={selectedAreaId} />

                {/* Row 1: Cuaca + 2 Risk Alert */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <WeatherCard weather={weather} />
                    {riskAlerts.length > 0
                        ? riskAlerts.map((alert, i) => <RiskAlertCard key={i} alert={alert} />)
                        : [0, 1].map(i => (
                            <div key={i} className="bg-white border border-dashed border-slate-200 rounded-2xl p-5 flex items-center justify-center text-slate-300 min-h-[220px]">
                                <p className="text-[13px] font-medium text-center">Belum ada data risiko</p>
                            </div>
                        ))
                    }
                </div>

                {/* Row 2: Rekomendasi Tindakan */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[17px] font-black text-slate-800">Rekomendasi Tindakan</h2>
                        <Link
                            href={route('rekomendasi-tindakan.index')}
                            className="text-[13px] font-black text-[#3D5A3D] hover:underline flex items-center gap-1"
                        >
                            Lihat Semua
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>
                    </div>

                    {recommendations.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {recommendations.map((rec) => (
                                <RecommendationCard key={rec.id} rec={rec} obsId={latestObservationId} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center">
                            <p className="text-[13px] text-slate-400 font-medium">Belum ada rekomendasi. Lakukan input kondisi lapangan untuk mendapatkan rekomendasi.</p>
                        </div>
                    )}
                </div>

                {/* Row 3: Akses Cepat */}
                <div className="mb-8">
                    <h2 className="text-[17px] font-black text-slate-800 mb-4">Akses Cepat</h2>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {quickLinks.map((link) => {
                            const href = link.route ? route(link.route) : '#';
                            return (
                                <Link
                                    key={link.name}
                                    href={href}
                                    className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md hover:border-[#3D5A3D]/30 transition-all group"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#f0f4f0] group-hover:text-[#3D5A3D] transition-colors">
                                        {link.icon}
                                    </div>
                                    <span className="text-[11px] font-black text-slate-600 text-center leading-tight">{link.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Row 4: Riwayat */}
                <div className="grid grid-cols-1 gap-6">

                    {/* Riwayat & Observasi */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h3 className="text-[15px] font-black text-slate-800">Riwayat & Observasi</h3>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {recentActivity.length > 0 ? (
                                recentActivity.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between px-5 py-3.5">
                                        <div>
                                            <p className="text-[13px] font-bold text-slate-800 line-clamp-1">{item.title}</p>
                                            <p className="text-[11px] text-slate-400 font-medium">{item.date}</p>
                                        </div>
                                        <span className="shrink-0 ml-3 px-2.5 py-0.5 bg-emerald-50 text-[#3D5A3D] text-[10px] font-black rounded-full border border-emerald-100">
                                            Selesai
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="px-5 py-8 text-center">
                                    <p className="text-[13px] text-slate-400 font-medium">Belum ada aktivitas tindakan.</p>
                                </div>
                            )}
                        </div>
                        <div className="px-5 py-3 border-t border-slate-100">
                            <Link
                                href={route('riwayat-lahan.index')}
                                className="text-[12px] font-black text-[#3D5A3D] hover:underline flex items-center justify-center gap-1"
                            >
                                Lihat Riwayat Lengkap
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                </div>
                </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
