import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import WilayahFormFields from './WilayahFormFields';

export default function EditWilayahModal({ isOpen, onClose, area }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: '',
        location_name: '',
        area_size: '',
        soil_type: '',
        notes: '',
    });

    useEffect(() => {
        if (isOpen && area) {
            setData({
                name: area.name || '',
                location_name: area.location_name || '',
                area_size: area.area_size || '',
                soil_type: area.soil_type || '',
                notes: area.notes || '',
            });
        }
    }, [isOpen, area]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('wilayah-lahan.update', area.id), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-[560px] max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-[18px] font-bold text-gray-800">Edit Wilayah Lahan</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg mb-2">
                        <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                            <span className="font-bold">Info:</span> Lokasi geografis (peta) tidak dapat diubah di sini. Jika posisi lahan salah, silakan hapus dan buat wilayah baru.
                        </p>
                    </div>

                    <WilayahFormFields data={data} setData={setData} errors={errors} />

                    <div className="flex items-center gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 py-2.5 text-[13px] font-bold text-white bg-[#2D5A27] rounded-lg hover:bg-[#234a1f] transition-colors disabled:opacity-50 shadow-sm"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 text-[13px] font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
