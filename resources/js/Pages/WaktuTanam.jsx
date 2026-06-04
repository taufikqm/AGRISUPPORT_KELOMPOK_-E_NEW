import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect, useCallback } from 'react';

const CROPS = [
    { value: 'padi',    label: 'Padi' },
    { value: 'jagung',  label: 'Jagung' },
    { value: 'kedelai', label: 'Kedelai' },
];

const CROP_LABEL = { padi: 'Padi', jagung: 'Jagung', kedelai: 'Kedelai' };

function csrfToken() {
    const m = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : '';
}

/* Ikon garis tipis ala desain Figma (stroke currentColor). */
const Icon = {
    leaf: 'M2.25 21A12 12 0 0 1 14.25 9h2.25v2.25A12 12 0 0 1 4.5 23.25H2.25V21Zm0 0 9.75-9.75',
    drop: 'M12 2.25c3.5 4 6 7.2 6 10.5a6 6 0 0 1-12 0c0-3.3 2.5-6.5 6-10.5Z',
    sun:  'M12 3v2.25m0 13.5V21m9-9h-2.25M5.25 12H3m14.83-6.36-1.59 1.59M7.76 16.24l-1.59 1.59m12.66 0-1.59-1.59M7.76 7.76 6.17 6.17M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z',
    shield: 'M12 2.25 4.5 5.25v6c0 4.5 3 8.4 7.5 10.5 4.5-2.1 7.5-6 7.5-10.5v-6L12 2.25Z',
    calStart: 'M6.75 3v2.25M17.25 3v2.25M3 9h18M5.25 5.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25A2.25 2.25 0 0 1 18.75 21H5.25A2.25 2.25 0 0 1 3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25Z',
    flag: 'M3 3v18M3 4.5h12l-1.5 4.5L15 13.5H3',
    clipboard: 'M9 3.75H7.5A2.25 2.25 0 0 0 5.25 6v13.5A2.25 2.25 0 0 0 7.5 21.75h9a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 16.5 3.75H15m-6 0A1.5 1.5 0 0 1 10.5 2.25h3A1.5 1.5 0 0 1 15 3.75m-6 0A1.5 1.5 0 0 0 9 5.25h6V3.75',
    check: 'M4.5 12.75l6 6 9-13.5',
    spark: 'M12 3v4.5m0 9V21m9-9h-4.5m-9 0H3m13.5-6.36-3.18 3.18m-4.14 4.14L6 17.66m12 0-3.18-3.18M9.32 9.32 6.14 6.14',
};

function IconSvg({ d, className = 'w-5 h-5', strokeWidth = 1.7 }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={strokeWidth} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
    );
}

function confColor(score) {
    if (score >= 80) return '#16a34a';
    if (score >= 65) return '#28a75a';
    if (score >= 45) return '#f59e0b';
    return '#ef4444';
}

/* Pisahkan "15 Apr 2026" → { day:"15", rest:"Apr 2026" } untuk chip tanggal. */
function splitDate(label = '') {
    const parts = label.split(' ');
    return { day: parts[0] ?? '', rest: parts.slice(1).join(' ') };
}

export default function WaktuTanam({ areas = [] }) {
    const [areaId, setAreaId]   = useState(areas[0]?.id ?? '');
    const [crop, setCrop]       = useState('padi');
    const [loading, setLoading] = useState(false);
    const [result, setResult]   = useState(null);
    const [error, setError]     = useState(null);
    const [saved, setSaved]     = useState(false);

    const analyze = useCallback(async (id, cropType) => {
        if (!id) return;
        setLoading(true);
        setError(null);
        setSaved(false);
        try {
            const res = await fetch(route('waktu-tanam.analyze'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': csrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ area_id: id, crop_type: cropType }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                setResult(null);
                setError(json.message || 'Prediksi tidak tersedia saat ini. Coba lagi nanti.');
                return;
            }
            setResult(json);
        } catch {
            setResult(null);
            setError('Prediksi tidak tersedia saat ini. Coba lagi nanti.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (areaId) analyze(areaId, crop);
    }, [areaId, crop, analyze]);

    const p    = result?.prediction;
    const area = result?.area;
    const cc   = p ? confColor(p.confidence_score) : '#28a75a';
    const start = splitDate(p?.start_label);
    const end   = splitDate(p?.end_label);

    return (
        <AuthenticatedLayout title="Prediksi Waktu Tanam" currentRoute="waktu-tanam.index">
            <Head title="Prediksi Waktu Tanam" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-5">

                {/* ── HERO ─────────────────────────────── */}
                <div className="grid lg:grid-cols-[1fr_360px] gap-5 items-start">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#eef4ef] text-[#2f6b45] text-xs font-bold px-3 py-1.5">
                            <IconSvg d={Icon.leaf} className="w-3.5 h-3.5" />
                            DSS Waktu Tanam
                        </span>
                        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold leading-tight text-[#18231d] max-w-xl">
                            Pilih lahan, lihat jendela tanam yang paling aman.
                        </h1>
                        <p className="mt-3 text-sm text-[#68766e] max-w-xl leading-relaxed">
                            Prediksi fokus pada keputusan inti petani: kapan mulai tanam berdasarkan
                            pola curah hujan, suhu, dan risiko cuaca dari data historis lahan Anda.
                        </p>
                    </div>

                    {/* Panel lahan aktif (filter) */}
                    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm">
                        <p className="flex items-center gap-2 text-xs font-bold text-[#2f6b45] uppercase tracking-wide mb-3">
                            <IconSvg d={Icon.leaf} className="w-3.5 h-3.5" /> Lahan aktif
                        </p>

                        {areas.length === 0 ? (
                            <p dusk="empty-state" className="text-sm text-[#68766e]">
                                Belum ada lahan. Tambahkan wilayah lahan dulu untuk memakai fitur ini.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                <select
                                    dusk="filter-lahan"
                                    value={areaId}
                                    onChange={(e) => setAreaId(Number(e.target.value))}
                                    className="w-full rounded-xl border-[#e2e8f0] text-sm font-semibold text-[#18231d] focus:ring-[#2f6b45] focus:border-[#2f6b45]"
                                >
                                    {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="rounded-xl bg-[#f8faf8] border border-[#eef4ef] px-3 py-2">
                                        <p className="font-bold text-[#18231d]">{CROP_LABEL[crop]}</p>
                                        <p className="text-xs text-[#68766e]">Komoditas</p>
                                    </div>
                                    <div className="rounded-xl bg-[#f8faf8] border border-[#eef4ef] px-3 py-2 truncate">
                                        <p className="font-bold text-[#18231d] truncate">{area?.location || '—'}</p>
                                        <p className="text-xs text-[#68766e]">Wilayah</p>
                                    </div>
                                </div>
                                <select
                                    dusk="filter-komoditas"
                                    value={crop}
                                    onChange={(e) => setCrop(e.target.value)}
                                    className="w-full rounded-xl border-[#e2e8f0] text-sm focus:ring-[#2f6b45] focus:border-[#2f6b45]"
                                >
                                    {CROPS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {loading && (
                    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-12 text-center text-sm text-[#68766e] animate-pulse">
                        Menganalisis pola cuaca historis…
                    </div>
                )}

                {!loading && error && (
                    <div className="bg-white border border-red-200 rounded-2xl p-8 text-center">
                        <p className="text-sm text-red-500 mb-3">{error}</p>
                        <button onClick={() => analyze(areaId, crop)} className="text-sm font-bold text-[#2f6b45] hover:underline">Coba Lagi</button>
                    </div>
                )}

                {!loading && !error && p && (
                    <>
                        {/* ── PREDIKSI + PERSIAPAN ──────────── */}
                        <div className="grid lg:grid-cols-[1fr_360px] gap-5 items-start">

                            {/* Kartu utama: panel hijau + panel kepercayaan */}
                            <div className="rounded-[20px] border border-[#2f6b45]/10 bg-white shadow-[0_20px_25px_-5px_rgba(47,107,69,0.05)] overflow-hidden grid md:grid-cols-2">

                                {/* Panel hijau — jendela tanam */}
                                <div className="relative bg-[#2f6b45] p-6 text-white overflow-hidden">
                                    <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10" />
                                    <div className="absolute right-6 bottom-6 text-white/10">
                                        <IconSvg d={Icon.leaf} className="w-28 h-28" strokeWidth={1} />
                                    </div>
                                    <div className="relative">
                                        <span className="inline-block rounded-full bg-white/20 text-xs font-semibold px-2.5 py-0.5">Siap disiapkan</span>
                                        <p className="mt-4 text-sm font-semibold text-white/75">Rekomendasi jendela tanam</p>
                                        <p className="mt-1 text-[34px] leading-none font-extrabold tracking-tight">
                                            {start.day}<span className="text-white/80">–</span>{end.day}
                                        </p>
                                        <p className="text-lg font-bold text-white/90 mt-1">{end.rest}</p>

                                        <div className="mt-6 flex gap-3">
                                            <div className="flex-1 rounded-2xl bg-white/12 p-4">
                                                <IconSvg d={Icon.calStart} className="w-4.5 h-4.5 text-white/80" />
                                                <p className="mt-2 text-xs text-white/70">Mulai ideal</p>
                                                <p className="text-xl font-extrabold">{start.day} {start.rest.split(' ')[0]}</p>
                                            </div>
                                            <div className="flex-1 rounded-2xl bg-white/12 p-4">
                                                <IconSvg d={Icon.flag} className="w-4.5 h-4.5 text-white/80" />
                                                <p className="mt-2 text-xs text-white/70">Batas aman</p>
                                                <p className="text-xl font-extrabold">{end.day} {end.rest.split(' ')[0]}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Panel putih — kepercayaan & metrik */}
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#68766e]">Kepercayaan DSS</p>
                                            <div className="flex items-end gap-2 mt-1">
                                                <span className="text-5xl font-extrabold text-[#18231d] leading-none" style={{ color: cc }}>{p.confidence_score}%</span>
                                                <span className="text-sm font-bold text-[#2f6b45] mb-1">{p.confidence_label}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 h-3 w-full rounded-full bg-[#eef4ef] overflow-hidden">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${p.confidence_score}%`, background: cc }} />
                                    </div>

                                    {/* Grid metrik 2×2 */}
                                    <div className="mt-5 grid grid-cols-2 gap-3">
                                        <Metric icon={Icon.drop}   label="Curah hujan" value={p.climate ? `${p.climate.rain} mm/hari` : '—'} />
                                        <Metric icon={Icon.sun}    label="Suhu"        value={p.climate ? `${p.climate.temp}°C` : '—'} />
                                        <Metric icon={Icon.leaf}   label="Kecocokan"   value={p.match_label || '—'} />
                                        <Metric icon={Icon.shield} label="Komoditas"   value={CROP_LABEL[p.crop_type] || p.crop_type} />
                                    </div>

                                    {/* Arahan hari ini */}
                                    <div className="mt-5 rounded-2xl bg-[#ecfdf5] border border-[#a4f4cf] p-4">
                                        <p className="flex items-center gap-2 text-sm font-extrabold text-[#006045]">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#28a75a]" /> Arahan hari ini
                                        </p>
                                        <p className="mt-2 text-sm text-[#006045]/90 leading-relaxed">{p.tips[0]}</p>
                                    </div>

                                    {p.limited_data && (
                                        <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                            Data historis terbatas — gunakan rekomendasi ini sebagai panduan awal.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Kolom kanan — persiapan + dasar prediksi */}
                            <div className="space-y-5">
                                <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm">
                                    <p className="flex items-center gap-2 text-sm font-extrabold text-[#18231d] mb-4">
                                        <span className="text-[#2f6b45]"><IconSvg d={Icon.clipboard} /></span> Rencana persiapan
                                    </p>
                                    <ol className="space-y-4">
                                        {p.tips.map((t, i) => (
                                            <li key={i} className="flex gap-3">
                                                <span className="shrink-0 w-9 h-9 rounded-xl bg-[#eef4ef] text-[#2f6b45] text-sm font-extrabold flex items-center justify-center">{i + 1}</span>
                                                <p className="text-sm text-[#475569] leading-snug pt-1">{t}</p>
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm">
                                    <p className="flex items-center gap-2 text-sm font-extrabold text-[#18231d] mb-4">
                                        <span className="text-[#2f6b45]"><IconSvg d={Icon.spark} /></span> Dasar prediksi
                                    </p>
                                    <ul className="space-y-3">
                                        {p.basis.map((b, i) => (
                                            <li key={i} className="flex gap-2.5 text-sm text-[#475569] leading-snug">
                                                <span className="text-[#28a75a] mt-0.5 shrink-0"><IconSvg d={Icon.check} className="w-4 h-4" strokeWidth={2.2} /></span>
                                                <span>{b}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* ── AKSI ──────────────────────────── */}
                        <button
                            dusk="btn-gunakan-rekomendasi"
                            onClick={() => { analyze(areaId, crop); setSaved(true); }}
                            className="w-full inline-flex items-center justify-center gap-2 text-sm font-bold px-5 py-3.5 rounded-2xl bg-[#2f6b45] text-white hover:bg-[#255838] transition-colors shadow-sm"
                        >
                            {saved ? '✓ Jadwal tanam tercatat' : 'Gunakan rekomendasi ini'}
                            {!saved && <IconSvg d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" className="w-4 h-4" strokeWidth={2} />}
                        </button>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

function Metric({ icon, label, value }) {
    return (
        <div className="rounded-2xl bg-[#eef4ef]/40 border border-[#dde8e0] p-3.5">
            <span className="text-[#2f6b45]"><IconSvg d={icon} className="w-5 h-5" /></span>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-[#68766e]">{label}</p>
            <p className="text-[15px] font-extrabold text-[#18231d] leading-tight mt-0.5">{value}</p>
        </div>
    );
}
