import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

function ActionCard({ item, observationId, isCompleted: initialIsCompleted, isExpanded, onToggle }) {
    const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
    const [loading, setLoading]         = useState(false);

    const colorMap = {
        red:   { bar: 'bg-red-500',       badge: 'bg-red-500',       text: 'text-red-700',       bg: 'bg-red-50' },
        amber: { bar: 'bg-amber-500',     badge: 'bg-amber-500',     text: 'text-amber-700',     bg: 'bg-amber-50' },
        green: { bar: 'bg-[#3D5A3D]',     badge: 'bg-[#3D5A3D]',     text: 'text-[#3D5A3D]',     bg: 'bg-emerald-50' },
    };

    const theme   = colorMap[item.color] || colorMap.green;
    const details = item.details || { steps: [], tools: [] };

    const handleMarkComplete = async (e) => {
        e.stopPropagation();
        if (isCompleted || loading) return;

        const prev = isCompleted;
        setIsCompleted(true);
        setLoading(true);

        try {
            await axios.post(route('rekomendasi-tindakan.mark-completed'), {
                observation_id:    observationId,
                recommendation_id: item.id,
            });
        } catch (err) {
            console.error('Gagal:', err);
            setIsCompleted(prev);
            alert('Gagal menyimpan perubahan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm transition-all duration-300 overflow-hidden relative ${isExpanded ? 'pb-6' : ''}`}>
            <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${theme.bar}`} />

            {/* Header */}
            <div className="p-5 md:p-6 cursor-pointer hover:bg-slate-50 transition-colors" onClick={onToggle}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider border border-slate-200">
                                {item.category}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full ${theme.badge} text-white text-[10px] font-black uppercase tracking-wider`}>
                                {item.urgency}
                            </span>
                        </div>
                        <h4 className="text-[17px] md:text-[19px] font-extrabold text-slate-800 tracking-tight leading-tight">
                            {item.title}
                        </h4>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                        <button
                            onClick={handleMarkComplete}
                            disabled={isCompleted || loading}
                            className={`px-5 py-2.5 rounded-xl text-[13px] font-black transition-all flex items-center gap-2 shadow-sm ${
                                isCompleted
                                    ? 'bg-slate-50 text-slate-400 cursor-default border border-slate-200'
                                    : 'bg-[#3D5A3D] text-white hover:bg-[#2b402b] active:scale-95'
                            }`}
                        >
                            {isCompleted ? (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    Selesai
                                </>
                            ) : (
                                loading ? '...' : 'Tandai Selesai'
                            )}
                        </button>

                        <svg
                            className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-6 md:px-8 pb-4">
                    <div className="h-px bg-slate-100 w-full mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h5 className="text-[12px] md:text-[13px] font-black text-slate-500 flex items-center gap-2 uppercase tracking-[1.5px]">
                                <span className="w-1.5 h-4 bg-[#3D5A3D] rounded-full" />
                                Langkah Pelaksanaan
                            </h5>
                            <ol className="space-y-3">
                                {details.steps.map((step, idx) => (
                                    <li key={idx} className="flex gap-4 text-[14px] md:text-[15px] text-slate-600 leading-relaxed font-medium">
                                        <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-[#f0f4f0] text-[#3D5A3D] font-black text-[12px] border border-[#3D5A3D]/10">
                                            {idx + 1}
                                        </span>
                                        {step}
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className="space-y-4">
                            <h5 className="text-[12px] md:text-[13px] font-black text-slate-500 flex items-center gap-2 uppercase tracking-[1.5px]">
                                <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
                                Alat & Bahan
                            </h5>
                            <div className="flex flex-wrap gap-2">
                                {details.tools.map((tool, idx) => (
                                    <div key={idx} className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                                        </svg>
                                        <span className="text-[13px] font-bold text-slate-700">{tool}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function RekomendasiTindakan({ observation, recommendations, metrics, completedIds }) {
    const [expandedIndex, setExpandedIndex] = useState(0);
    const areaName = observation.agricultural_area?.name || 'Lahan';

    return (
        <AuthenticatedLayout title="Rekomendasi" badge={areaName} currentRoute="input-kondisi.index">
            <Head title="Rekomendasi Tindakan - AgriSupport" />

            <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-[26px] md:text-[32px] font-black text-slate-800 tracking-tight leading-tight">
                            Rekomendasi Tindakan Cerdas
                        </h1>
                        <p className="text-slate-500 text-[15px] md:text-[16px] mt-1 font-medium">
                            Langkah preventif dan kuratif yang dirancang khusus untuk kondisi lahan Anda.
                        </p>
                    </div>

                    <Link
                        href={route('analisis-risiko.show', observation.id)}
                        className="inline-flex items-center gap-2 text-[14px] font-black text-[#3D5A3D] bg-[#f0f4f0] px-5 py-2.5 rounded-xl hover:bg-[#e0e8e0] transition-all border border-[#3D5A3D]/10"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                        Kembali ke Analisis
                    </Link>
                </div>

                {/* Recommendation List */}
                <div className="space-y-4 md:space-y-6">
                    {recommendations.length > 0 ? (
                        recommendations.map((item, index) => (
                            <ActionCard
                                key={item.id}
                                item={item}
                                observationId={observation.id}
                                isCompleted={completedIds.includes(item.id)}
                                isExpanded={expandedIndex === index}
                                onToggle={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
                            />
                        ))
                    ) : (
                        <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-[32px]">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="font-bold text-slate-500">Tidak ada tindakan mendesak saat ini.</p>
                            <p className="text-sm text-slate-400 mt-1">Lahan Anda berada dalam kondisi aman.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
