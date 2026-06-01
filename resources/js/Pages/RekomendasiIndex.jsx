import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useEffect, useMemo, useRef, useState } from 'react';

function RiskBadge({ score }) {
    if (score > 70) return (
        <span className="px-2.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black uppercase tracking-wider">Tinggi</span>
    );
    if (score > 40) return (
        <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider">Sedang</span>
    );
    return (
        <span className="px-2.5 py-0.5 rounded-full bg-[#3D5A3D] text-white text-[10px] font-black uppercase tracking-wider">Rendah</span>
    );
}

function ObservationCard({ item, index }) {
    const barColor = item.overall_risk > 70 ? 'bg-red-500' : item.overall_risk > 40 ? 'bg-amber-500' : 'bg-[#3D5A3D]';
    const progress = item.total_recs > 0 ? Math.round((item.completed_count / item.total_recs) * 100) : 0;

    const date = new Date(item.date);
    const formatted = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden relative">
            <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${barColor}`} />

            <div className="p-5 md:p-6 pl-7 flex flex-col md:flex-row md:items-center gap-4">
                {/* Numbering */}
                <div className="shrink-0 flex md:flex-col items-center gap-2 md:gap-0 md:w-12">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">No.</span>
                    <span className="text-[24px] md:text-[28px] font-black text-[#3D5A3D] leading-none">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-[13px] font-black text-slate-800">{item.area_name}</span>
                        <RiskBadge score={item.overall_risk} />
                    </div>
                    <p className="text-[13px] text-slate-400 font-medium mb-3">{formatted}</p>

                    {item.total_recs > 0 ? (
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                                    Progress Tindakan
                                </span>
                                <span className="text-[11px] font-black text-slate-500">
                                    {item.completed_count}/{item.total_recs} selesai
                                </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#3D5A3D] rounded-full transition-all duration-700"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <p className="text-[12px] text-slate-400 italic">Tidak ada rekomendasi aktif</p>
                    )}
                </div>

                {/* Action */}
                <Link
                    href={route('rekomendasi-tindakan.show', item.id)}
                    className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3D5A3D] text-white text-[13px] font-black rounded-xl hover:bg-[#2b402b] active:scale-95 transition-all shadow-sm"
                >
                    Lihat Rekomendasi
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}

/* ─── Chip filter dengan overflow popover ─── */
function AreaFilter({ areas, selectedAreaId, onSelect, totalItems }) {
    const [visibleCount, setVisibleCount] = useState(areas.length);
    const [popoverOpen,  setPopoverOpen]  = useState(false);
    const containerRef = useRef(null);
    const measureRef   = useRef(null);
    const popoverRef   = useRef(null);

    // Hitung berapa chip yang muat dalam 1 baris
    useEffect(() => {
        const measure = () => {
            if (!containerRef.current || !measureRef.current) return;

            const containerWidth = containerRef.current.offsetWidth;
            const chips = Array.from(measureRef.current.children);
            const overflowChipWidth = 110; // estimasi lebar tombol "+N lainnya"
            const gap = 8;

            let used = 0;
            let fits = 0;
            for (let i = 0; i < chips.length; i++) {
                const w = chips[i].offsetWidth;
                const next = used + w + (i === 0 ? 0 : gap);
                // sisakan ruang untuk overflow button jika ada chip yang ga muat
                if (next + (i < chips.length - 1 ? overflowChipWidth + gap : 0) > containerWidth) {
                    break;
                }
                used = next;
                fits = i + 1;
            }
            setVisibleCount(Math.max(1, fits));
        };

        measure();
        const ro = new ResizeObserver(measure);
        if (containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [areas]);

    // Tutup popover saat klik di luar
    useEffect(() => {
        const handler = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                setPopoverOpen(false);
            }
        };
        if (popoverOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [popoverOpen]);

    if (areas.length <= 1) return null;

    const visible  = areas.slice(0, visibleCount);
    const overflow = areas.slice(visibleCount);

    const Chip = ({ area, active, onClick, children, className = '' }) => (
        <button
            type="button"
            onClick={onClick}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold border transition-all whitespace-nowrap ${
                active
                    ? 'bg-[#3D5A3D] text-white border-[#3D5A3D] shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#3D5A3D] hover:text-[#3D5A3D]'
            } ${className}`}
        >
            {children}
            {area && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                    {area.count}
                </span>
            )}
        </button>
    );

    return (
        <>
            {/* hidden measurer untuk hitung lebar chip asli */}
            <div
                ref={measureRef}
                aria-hidden="true"
                className="absolute -left-[9999px] -top-[9999px] flex gap-2 opacity-0 pointer-events-none"
            >
                {areas.map(a => (
                    <Chip key={`m-${a.id}`} area={a}>{a.name}</Chip>
                ))}
            </div>

            <div ref={containerRef} className="relative">
                <div className="flex items-center gap-2 flex-nowrap overflow-hidden">
                    <Chip
                        active={selectedAreaId === null}
                        onClick={() => onSelect(null)}
                    >
                        Semua
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                            selectedAreaId === null ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                            {totalItems}
                        </span>
                    </Chip>

                    {visible.map(a => (
                        <Chip
                            key={a.id}
                            area={a}
                            active={selectedAreaId === a.id}
                            onClick={() => onSelect(a.id)}
                        >
                            {a.name}
                        </Chip>
                    ))}

                    {overflow.length > 0 && (
                        <div ref={popoverRef} className="relative shrink-0">
                            <button
                                type="button"
                                onClick={() => setPopoverOpen(v => !v)}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold border transition-all whitespace-nowrap ${
                                    overflow.some(a => a.id === selectedAreaId)
                                        ? 'bg-[#3D5A3D] text-white border-[#3D5A3D]'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#3D5A3D]'
                                }`}
                            >
                                +{overflow.length} lainnya
                                <svg className={`w-3 h-3 transition-transform ${popoverOpen ? 'rotate-180' : ''}`}
                                     fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>

                            {popoverOpen && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-20 max-h-[280px] overflow-y-auto">
                                    {overflow.map(a => (
                                        <button
                                            key={a.id}
                                            type="button"
                                            onClick={() => { onSelect(a.id); setPopoverOpen(false); }}
                                            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                                                selectedAreaId === a.id
                                                    ? 'bg-[#3D5A3D] text-white'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            <span className="truncate text-left">{a.name}</span>
                                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                                                selectedAreaId === a.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {a.count}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default function RekomendasiIndex({ items, areas = [] }) {
    const [selectedAreaId, setSelectedAreaId] = useState(null);

    const filteredItems = useMemo(() => {
        if (selectedAreaId === null) return items;
        return items.filter(i => i.area_id === selectedAreaId);
    }, [items, selectedAreaId]);

    return (
        <AuthenticatedLayout title="Rekomendasi" currentRoute="rekomendasi-tindakan.index">
            <Head title="Riwayat Rekomendasi - AgriSupport" />

            <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-24">
                {/* Header */}
                <div className="mb-6 md:mb-8">
                    <h1 className="text-[26px] md:text-[32px] font-black text-slate-800 tracking-tight leading-tight">
                        Riwayat Rekomendasi Tindakan
                    </h1>
                    <p className="text-slate-500 text-[15px] md:text-[16px] mt-1 font-medium">
                        Daftar rekomendasi diurutkan berdasarkan prioritas risiko.
                    </p>
                </div>

                {/* Filter Lahan */}
                {areas.length > 1 && (
                    <div className="mb-6">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">
                            Filter Lahan
                        </p>
                        <AreaFilter
                            areas={areas}
                            selectedAreaId={selectedAreaId}
                            onSelect={setSelectedAreaId}
                            totalItems={items.length}
                        />
                    </div>
                )}

                {/* List */}
                {items.length === 0 ? (
                    <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-[32px]">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                            </svg>
                        </div>
                        <p className="font-bold text-slate-500">Belum ada data rekomendasi.</p>
                        <p className="text-sm text-slate-400 mt-1">Lakukan input kondisi lapangan terlebih dahulu.</p>
                        <Link
                            href={route('input-kondisi.index')}
                            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#3D5A3D] text-white text-[14px] font-black rounded-xl hover:bg-[#2b402b] transition-all"
                        >
                            Input Kondisi Sekarang
                        </Link>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="p-10 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
                        <p className="font-bold text-slate-500">Tidak ada rekomendasi untuk lahan ini.</p>
                        <button
                            type="button"
                            onClick={() => setSelectedAreaId(null)}
                            className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-slate-100 text-slate-700 text-[13px] font-bold rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            Tampilkan Semua
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[12px] font-bold text-slate-500">
                                Menampilkan <span className="text-[#3D5A3D]">{filteredItems.length}</span> rekomendasi
                                {selectedAreaId !== null && areas.find(a => a.id === selectedAreaId) && (
                                    <> untuk <span className="text-[#3D5A3D]">{areas.find(a => a.id === selectedAreaId).name}</span></>
                                )}
                            </p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                Urut: Prioritas Tertinggi
                            </p>
                        </div>
                        <div className="space-y-4">
                            {filteredItems.map((item, idx) => (
                                <ObservationCard key={item.id} item={item} index={idx} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
