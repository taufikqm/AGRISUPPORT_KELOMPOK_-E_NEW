import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import LahanCard from '@/Components/WilayahLahan/LahanCard';
import DetailPanel from '@/Components/WilayahLahan/DetailPanel';
import TambahWilayahModal from '@/Components/WilayahLahan/TambahWilayahModal';
import EditWilayahModal from '@/Components/WilayahLahan/EditWilayahModal';
import HapusWilayahModal from '@/Components/WilayahLahan/HapusWilayahModal';

export default function WilayahLahan({ auth, areas = [] }) {
    const [selectedArea, setSelectedArea] = useState(areas.length > 0 ? areas[0] : null);
    
    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Sync selected area if areas prop changes (e.g., after update/delete)
    const handleModalClose = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Kelola Wilayah Lahan</h2>}
        >
            <Head title="Wilayah Lahan" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header Controls */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Daftar Lahan Anda</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Kelola batas koordinat lahan, pantau cuaca, dan lihat detail wilayah.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center gap-2 bg-[#2D5A27] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-[#234a1f] transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Tambah Wilayah Baru
                        </button>
                    </div>

                    {/* Main Content Area */}
                    {areas.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Belum Ada Lahan Terdaftar</h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                Mulai kelola pertanian Anda dengan mendaftarkan lokasi lahan pertama Anda ke dalam sistem.
                            </p>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="inline-flex items-center gap-2 bg-[#2D5A27] text-white px-6 py-3 rounded-lg text-sm font-bold shadow-md hover:bg-[#234a1f] transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Buat Wilayah Lahan Pertama
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Kiri: List of Areas */}
                            <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
                                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                    <div className="relative">
                                        <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                        </svg>
                                        <input 
                                            type="text" 
                                            placeholder="Cari nama wilayah..." 
                                            className="w-full pl-10 pr-4 py-2 border-gray-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-emerald-500 bg-white"
                                        />
                                    </div>
                                </div>
                                <div className="p-4 overflow-y-auto flex-1 space-y-3">
                                    {areas.map(area => (
                                        <LahanCard 
                                            key={area.id} 
                                            area={area} 
                                            isSelected={selectedArea?.id === area.id}
                                            onClick={() => setSelectedArea(area)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Kanan: Detail Panel */}
                            <div className="lg:col-span-2">
                                {selectedArea ? (
                                    <DetailPanel 
                                        area={selectedArea} 
                                        onEdit={() => setIsEditModalOpen(true)}
                                        onDelete={() => setIsDeleteModalOpen(true)}
                                    />
                                ) : (
                                    <div className="h-[600px] bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-center p-8">
                                        <div>
                                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-6-6m0 0l6-6m-6 6h12" />
                                            </svg>
                                            <p className="text-gray-500">Pilih salah satu lahan dari daftar di sebelah kiri untuk melihat detail, cuaca, dan statistik lengkapnya.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <TambahWilayahModal 
                isOpen={isAddModalOpen} 
                onClose={handleModalClose} 
            />

            {selectedArea && (
                <>
                    <EditWilayahModal 
                        isOpen={isEditModalOpen} 
                        onClose={handleModalClose} 
                        area={selectedArea}
                    />
                    <HapusWilayahModal 
                        isOpen={isDeleteModalOpen} 
                        onClose={() => {
                            handleModalClose();
                            setSelectedArea(null); // Clear selection after delete
                        }} 
                        area={selectedArea}
                    />
                </>
            )}

        </AuthenticatedLayout>
    );
}