import React, { useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import WilayahFormFields from './WilayahFormFields';

export default function TambahWilayahModal({ isOpen, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        location_name: '',
        area_size: '',
        soil_type: '',
        notes: '',
        geojson: '',
    });

    const modalMapRef = useRef(null);
    const modalMapInstanceRef = useRef(null);

    useEffect(() => {
        if (!isOpen || !modalMapRef.current) return;

        let L;
        const initMap = async () => {
            L = (await import('leaflet')).default;
            await import('@geoman-io/leaflet-geoman-free');

            if (modalMapInstanceRef.current) {
                modalMapInstanceRef.current.remove();
            }

            const map = L.map(modalMapRef.current).setView([-6.8125, 107.6176], 14);
            modalMapInstanceRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap',
            }).addTo(map);

            // Enable Geoman drawing tools
            map.pm.addControls({
                position: 'topleft',
                drawCircle: false,
                drawCircleMarker: false,
                drawMarker: false,
                drawPolyline: false,
                drawRectangle: true,
                drawPolygon: true,
                editMode: true,
                dragMode: false,
                cutPolygon: false,
                rotateMode: false,
            });

            // Listen for polygon creation
            map.on('pm:create', async (e) => {
                const layer = e.layer;
                const geojson = layer.toGeoJSON();
                setData('geojson', JSON.stringify(geojson.geometry));

                // Ambil titik tengah untuk Reverse Geocoding
                const center = layer.getBounds().getCenter();
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}&zoom=14`);
                    const locationData = await response.json();
                    
                    if (locationData && locationData.address) {
                        const city = locationData.address.city || locationData.address.regency || locationData.address.county || '';
                        const district = locationData.address.village || locationData.address.suburb || locationData.address.town || '';
                        const formattedAddress = [district, city].filter(Boolean).join(', ');
                        
                        setData((prev) => ({
                            ...prev,
                            location_name: formattedAddress || locationData.display_name.split(',').slice(0,2).join(', ')
                        }));
                    }
                } catch (error) {
                    console.error("Gagal mendapatkan lokasi: ", error);
                }

                // Remove previously drawn layers (keep only latest)
                map.eachLayer((l) => {
                    if (l instanceof L.Polygon && l !== layer && !(l instanceof L.TileLayer)) {
                        map.removeLayer(l);
                    }
                });
            });

            map.on('pm:edit', (e) => {
                e.layer && setData('geojson', JSON.stringify(e.layer.toGeoJSON().geometry));
            });

            // Fix map rendering in modal
            setTimeout(() => map.invalidateSize(), 200);
        };

        initMap();

        return () => {
            if (modalMapInstanceRef.current) {
                modalMapInstanceRef.current.remove();
                modalMapInstanceRef.current = null;
            }
        };
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('wilayah-lahan.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-[680px] max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-[18px] font-bold text-gray-800">Tambah Wilayah Baru</h3>
                        <p className="text-[13px] text-gray-500 mt-0.5">Gambar area lahan Anda di peta dan lengkapi informasinya</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Map Drawing Area */}
                    <div>
                        <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-wide mb-2">
                            Gambar Area Lahan di Peta
                        </label>
                        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                            <div ref={modalMapRef} className="w-full h-[280px]" />
                        </div>
                        {!data.geojson && (
                            <p className="text-[11px] text-amber-600 mt-1.5 flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                                Gunakan alat gambar di peta untuk menandai area lahan Anda
                            </p>
                        )}
                        {data.geojson && (
                            <p className="text-[11px] text-emerald-600 mt-1.5 flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                Area lahan berhasil ditandai di peta!
                            </p>
                        )}
                        {errors.geojson && <p className="text-[11px] text-red-500 mt-1">{errors.geojson}</p>}
                    </div>

                    <WilayahFormFields data={data} setData={setData} errors={errors} />

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-[13px] font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !data.geojson}
                            className="px-5 py-2.5 text-[13px] font-bold text-white bg-[#2D5A27] rounded-lg hover:bg-[#234a1f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Wilayah'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
