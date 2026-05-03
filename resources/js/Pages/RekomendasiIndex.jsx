import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

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

function ObservationCard({ item }) {
    const barColor = item.overall_risk > 70 ? 'bg-red-500' : item.overall_risk > 40 ? 'bg-amber-500' : 'bg-[#3D5A3D]';
    const progress = item.total_recs > 0 ? Math.round((item.completed_count / item.total_recs) * 100) : 0;

    const date = new Date(item.date);
    const formatted = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden relative">
            <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${barColor}`} />

            <div className="p-5 md:p-6 pl-7">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
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

                    <Link
                        href={route('rekomendasi-tindakan.show', item.id)}
                        className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-[#3D5A3D] text-white text-[13px] font-black rounded-xl hover:bg-[#2b402b] active:scale-95 transition-all shadow-sm"
                    >
                        Lihat Rekomendasi
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function RekomendasiIndex({ items }) {
    return (
        <AuthenticatedLayout title="Rekomendasi" currentRoute="rekomendasi-tindakan.index">
            <Head title="Riwayat Rekomendasi - AgriSupport" />

            <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-24">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-[26px] md:text-[32px] font-black text-slate-800 tracking-tight leading-tight">
                        Riwayat Rekomendasi Tindakan
                    </h1>
                    <p className="text-slate-500 text-[15px] md:text-[16px] mt-1 font-medium">
                        Daftar seluruh rekomendasi berdasarkan observasi lapangan yang telah dilakukan.
                    </p>
                </div>

                {/* List */}
                {items.length > 0 ? (
                    <div className="space-y-4">
                        {items.map((item) => (
                            <ObservationCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
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
                )}
            </div>
        </AuthenticatedLayout>
    );
}
