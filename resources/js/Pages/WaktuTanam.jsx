import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect, useCallback } from 'react';

const CROPS = [
    { value: 'padi',    label: 'Padi' },
    { value: 'jagung',  label: 'Jagung' },
    { value: 'kedelai', label: 'Kedelai' },
];

function csrfToken() {
    const m = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : '';
}

function confColor(score) {
    if (score >= 80) return '#16a34a';
    if (score >= 65) return '#22c55e';
    if (score >= 45) return '#f59e0b';
    return '#ef4444';
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

    const p = result?.prediction;

    return (
        <AuthenticatedLayout title="Prediksi Waktu Tanam" currentRoute="waktu-tanam.index">
            <Head title="Prediksi Waktu Tanam" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
                <div className="mb-4">
                    <h1 className="text-xl font-bold text-[#1e293b]">Prediksi Waktu Tanam</h1>
                    <p className="text-xs text-[#64748b]">Rekomendasi jendela tanam terbaik dari pola cuaca historis lahan Anda.</p>
                </div>

                {areas.length === 0 ? (
                    <div dusk="empty-state" className="bg-white border border-[#e2e8f0] rounded-2xl p-10 text-center">
                        <p className="font-semibold text-[#1e293b]">Belum ada lahan</p>
                        <p className="text-sm text-[#64748b] mt-1">Tambahkan wilayah lahan dulu untuk memakai fitur ini.</p>
                    </div>
                ) : (
                    <>
                        {/* Filter lahan + komoditas */}
                        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-3 flex flex-wrap gap-3 mb-3">
                            <div className="flex-1 min-w-[160px]">
                                <label className="block text-xs font-semibold text-[#64748b] mb-1">Lahan</label>
                                <select
                                    dusk="filter-lahan"
                                    value={areaId}
                                    onChange={(e) => setAreaId(Number(e.target.value))}
                                    className="w-full rounded-xl border-[#e2e8f0] text-sm focus:ring-[#2D5A27] focus:border-[#2D5A27]"
                                >
                                    {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                            <div className="w-40">
                                <label className="block text-xs font-semibold text-[#64748b] mb-1">Komoditas</label>
                                <select
                                    dusk="filter-komoditas"
                                    value={crop}
                                    onChange={(e) => setCrop(e.target.value)}
                                    className="w-full rounded-xl border-[#e2e8f0] text-sm focus:ring-[#2D5A27] focus:border-[#2D5A27]"
                                >
                                    {CROPS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                        </div>

                        {loading && (
                            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-10 text-center text-sm text-[#64748b] animate-pulse">
                                Menganalisis pola cuaca historis...
                            </div>
                        )}

                        {!loading && error && (
                            <div className="bg-white border border-red-200 rounded-2xl p-6 text-center">
                                <p className="text-sm text-red-500 mb-3">{error}</p>
                                <button onClick={() => analyze(areaId, crop)} className="text-sm font-semibold text-[#2D5A27] hover:underline">Coba Lagi</button>
                            </div>
                        )}

                        {!loading && !error && p && (
                            <div className="space-y-3">
                                {/* Kartu jendela tanam */}
                                <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5" style={{ borderTopWidth: 4, borderTopColor: confColor(p.confidence_score) }}>
                                    <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wide mb-2">Jendela Tanam Terbaik</p>
                                    <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
                                        <div>
                                            <p className="text-xs text-[#94a3b8]">Mulai Tanam</p>
                                            <p className="text-xl font-bold text-[#1e293b]">{p.start_label}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#94a3b8]">Batas Ideal</p>
                                            <p className="text-xl font-bold text-[#1e293b]">{p.end_label}</p>
                                        </div>
                                        <div className="ml-auto text-right">
                                            <p className="text-xs text-[#94a3b8]">Tingkat Kepercayaan</p>
                                            <p className="text-2xl font-bold" style={{ color: confColor(p.confidence_score) }}>
                                                {p.confidence_score}% <span className="text-sm font-semibold">· {p.confidence_label}</span>
                                            </p>
                                        </div>
                                    </div>
                                    {p.limited_data && (
                                        <p className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                            Data historis terbatas — gunakan rekomendasi ini sebagai panduan awal.
                                        </p>
                                    )}
                                </div>

                                {/* Dasar prediksi + Tips (2 kolom) */}
                                <div className="grid md:grid-cols-2 gap-3">
                                    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
                                        <p className="text-sm font-bold text-[#1e293b] mb-2">Dasar Prediksi</p>
                                        <ul className="space-y-1.5">
                                            {p.basis.map((b, i) => (
                                                <li key={i} className="flex gap-2 text-xs text-[#475569]">
                                                    <span className="text-[#2D5A27]">›</span>{b}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
                                        <p className="text-sm font-bold text-[#1e293b] mb-2">Tips Persiapan</p>
                                        <ul className="space-y-1.5">
                                            {p.tips.map((t, i) => (
                                                <li key={i} className="flex gap-2 text-xs text-[#475569]">
                                                    <span className="text-[#2D5A27]">✓</span>{t}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <button
                                    dusk="btn-gunakan-rekomendasi"
                                    onClick={() => { analyze(areaId, crop); setSaved(true); }}
                                    className="w-full text-sm font-semibold px-5 py-2.5 rounded-xl bg-[#2D5A27] text-white hover:bg-[#244a20]"
                                >
                                    {saved ? '✓ Jadwal tanam tercatat' : 'Gunakan Rekomendasi Ini'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
