import React from 'react';

export default function HapusWilayahModal({ isOpen, onClose, onConfirm, area, processing }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-[400px] overflow-hidden transform transition-all">
                <div className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-[18px] font-bold text-gray-800 mb-2">Hapus Wilayah Lahan?</h3>
                    <p className="text-[13px] text-gray-500 mb-6">
                        Apakah Anda yakin ingin menghapus wilayah <strong className="text-gray-700">{area?.name}</strong> secara permanen? Data terhapus tidak dapat dikembalikan.
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="flex-1 py-2.5 text-[13px] font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={processing}
                            className="flex-1 py-2.5 text-[13px] font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 shadow-sm"
                        >
                            {processing ? 'Menghapus...' : 'Ya, Hapus'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
