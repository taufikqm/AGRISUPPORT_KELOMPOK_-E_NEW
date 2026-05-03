import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

/* ─── Status Option Button ─── */
function StatusButton({ label, isSelected, onClick, disabled }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`px-3 py-2.5 md:px-4 md:py-3 rounded-xl border transition-all duration-200 flex-1 ${
                disabled
                    ? 'opacity-40 cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400'
                    : isSelected
                    ? 'border-[#3D6E42] bg-[#EAF2ED] text-[#3D6E42] shadow-sm font-bold'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-[#3D6E42]/40 hover:bg-[#EAF2ED]/50 cursor-pointer font-medium'
            }`}
        >
            <span className="text-[12px] md:text-[14px]">
                {label}
            </span>
        </button>
    );
}

/* ─── Section Card ─── */
function SectionCard({ icon, title, children }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
                {icon && <span className="text-[#3D6E42] shrink-0">{icon}</span>}
                <h3 className="text-[14px] md:text-[15px] font-bold text-gray-800 uppercase tracking-wide">{title}</h3>
            </div>
            {children}
        </div>
    );
}

/* ─── MAIN PAGE ─── */
export default function InputKondisi({ areas = [] }) {
    const today = new Date().toISOString().split('T')[0];
    const displayDate = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

    const { data, setData, post, processing, errors, reset } = useForm({
        agricultural_area_id: '',
        planting_cycle: 'Siklus Tanam 1 - 2026',
        observation_date: today,
        soil_moisture: '',
        water_puddle: '',
        crop_condition: '',
        pest_indication: '',
        disease_indication: '',
        notes: '',
    });

    const [selectedArea, setSelectedArea] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const hasSelectedArea = !!data.agricultural_area_id;

    const handleAreaChange = (e) => {
        const areaId = e.target.value;
        setData('agricultural_area_id', areaId);
        const area = areas.find(a => a.id == areaId);
        setSelectedArea(area || null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('input-kondisi.store'), {
            onSuccess: () => {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 4000);
                reset();
                setSelectedArea(null);
            },
        });
    };

    const soilOptions = ['Kering', 'Normal', 'Lembab', 'Sangat Basah'];
    const waterOptions = ['Tidak Ada', 'Sedikit', 'Sedang', 'Banyak'];
    const cropOptions = ['Kritis', 'Kurang Baik', 'Baik', 'Sangat Baik'];
    const pestOptions = ['Tidak Ada', 'Ringan', 'Sedang', 'Berat'];
    const diseaseOptions = ['Tidak Ada', 'Ringan', 'Sedang', 'Berat'];

    return (
        <AuthenticatedLayout
            title="Input Kondisi"
            badge={selectedArea?.name || 'Observasi Baru'}
            currentRoute="input-kondisi.index"
        >
            <Head title="Input Kondisi Lapangan" />

            <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8 pb-24">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-[24px] md:text-[28px] font-extrabold text-[#1a2f24] tracking-tight">Observasi Lapangan</h1>
                        <p className="text-[14px] md:text-[15px] text-gray-500 mt-1">
                            Catat kondisi aktual lahan untuk analisis risiko yang akurat.
                        </p>
                    </div>
                    <div className="inline-flex items-center self-start gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[13px] font-bold border border-blue-100">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                        </svg>
                        {displayDate}
                    </div>
                </div>

                {/* Success Notification */}
                {showSuccess && (
                    <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[14px] font-bold text-emerald-800">Berhasil Disimpan!</p>
                            <p className="text-[12px] text-emerald-600 font-medium">Data observasi telah tercatat dalam sistem.</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                    {/* Basic Info */}
                    <SectionCard
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>}
                        title="Informasi Dasar"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-gray-700">Wilayah Lahan</label>
                                <div className="relative">
                                    <select
                                        value={data.agricultural_area_id}
                                        onChange={handleAreaChange}
                                        className="w-full pl-4 pr-10 py-3 text-[14px] bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3D6E42]/20 focus:border-[#3D6E42] transition-all appearance-none outline-none font-medium"
                                    >
                                        <option value="" disabled>Pilih Lahan...</option>
                                        {areas.map(area => (
                                            <option key={area.id} value={area.id}>{area.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                                    </div>
                                </div>
                                {errors.agricultural_area_id && <p className="text-[11px] text-red-500 font-bold">{errors.agricultural_area_id}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-gray-700">Siklus Tanam</label>
                                <div className="relative">
                                    <select
                                        value={data.planting_cycle}
                                        onChange={e => setData('planting_cycle', e.target.value)}
                                        className="w-full pl-4 pr-10 py-3 text-[14px] bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3D6E42]/20 focus:border-[#3D6E42] transition-all appearance-none outline-none font-medium text-gray-500"
                                    >
                                        <option value="Siklus Tanam 1 - 2026">Siklus Tanam 1 - 2026</option>
                                        <option value="Siklus Tanam 2 - 2026">Siklus Tanam 2 - 2026</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Conditions */}
                    <div className="grid grid-cols-1 gap-6">
                        <SectionCard
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 13.5H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>}
                            title="Kelembapan Tanah"
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {soilOptions.map(label => (
                                    <StatusButton
                                        key={label}
                                        label={label}
                                        isSelected={data.soil_moisture === label}
                                        onClick={() => setData('soil_moisture', label)}
                                        disabled={!hasSelectedArea}
                                    />
                                ))}
                            </div>
                            {errors.soil_moisture && <p className="text-[11px] text-red-500 font-bold mt-2">{errors.soil_moisture}</p>}
                        </SectionCard>

                        <SectionCard
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" /></svg>}
                            title="Genangan Air"
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {waterOptions.map(label => (
                                    <StatusButton
                                        key={label}
                                        label={label}
                                        isSelected={data.water_puddle === label}
                                        onClick={() => setData('water_puddle', label)}
                                        disabled={!hasSelectedArea}
                                    />
                                ))}
                            </div>
                            {errors.water_puddle && <p className="text-[11px] text-red-500 font-bold mt-2">{errors.water_puddle}</p>}
                        </SectionCard>

                        <SectionCard
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>}
                            title="Kondisi Tanaman"
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {cropOptions.map(label => (
                                    <StatusButton
                                        key={label}
                                        label={label}
                                        isSelected={data.crop_condition === label}
                                        onClick={() => setData('crop_condition', label)}
                                        disabled={!hasSelectedArea}
                                    />
                                ))}
                            </div>
                            {errors.crop_condition && <p className="text-[11px] text-red-500 font-bold mt-2">{errors.crop_condition}</p>}
                        </SectionCard>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SectionCard
                                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                                title="Indikasi Hama"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    {pestOptions.map(label => (
                                        <StatusButton
                                            key={label}
                                            label={label}
                                            isSelected={data.pest_indication === label}
                                            onClick={() => setData('pest_indication', label)}
                                            disabled={!hasSelectedArea}
                                        />
                                    ))}
                                </div>
                                {errors.pest_indication && <p className="text-[11px] text-red-500 font-bold mt-2">{errors.pest_indication}</p>}
                            </SectionCard>

                            <SectionCard
                                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                                title="Indikasi Penyakit"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    {diseaseOptions.map(label => (
                                        <StatusButton
                                            key={label}
                                            label={label}
                                            isSelected={data.disease_indication === label}
                                            onClick={() => setData('disease_indication', label)}
                                            disabled={!hasSelectedArea}
                                        />
                                    ))}
                                </div>
                                {errors.disease_indication && <p className="text-[11px] text-red-500 font-bold mt-2">{errors.disease_indication}</p>}
                            </SectionCard>
                        </div>

                        <SectionCard
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
                            title="Catatan Tambahan"
                        >
                            <textarea
                                rows="3"
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                disabled={!hasSelectedArea}
                                placeholder="Jelaskan temuan spesifik di lapangan..."
                                className="w-full px-4 py-3 text-[14px] bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3D6E42]/20 focus:border-[#3D6E42] transition-all outline-none font-medium placeholder:text-gray-400"
                            />
                        </SectionCard>
                    </div>

                    {/* Submit */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
                        {!hasSelectedArea && <p className="text-[12px] font-bold text-amber-600">Silakan pilih lahan terlebih dahulu</p>}
                        <button
                            type="submit"
                            disabled={processing || !hasSelectedArea || !data.soil_moisture || !data.water_puddle || !data.crop_condition || !data.pest_indication || !data.disease_indication}
                            className="w-full sm:w-auto px-10 py-4 text-[15px] font-extrabold text-white bg-[#3D6E42] rounded-xl hover:bg-[#2b502f] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#3D6E42]/20 active:scale-95"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Observasi'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
