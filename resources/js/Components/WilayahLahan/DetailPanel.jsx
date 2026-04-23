import React, { useEffect, useRef } from 'react';

export default function DetailPanel({ area, onEdit, onDelete }) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        if (!area || !area.geojson || !mapContainerRef.current) return;

        let L;
        const initMap = async () => {
            L = (await import('leaflet')).default;

            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
            }

            const map = L.map(mapContainerRef.current, {
                zoomControl: false,
                attributionControl: false,
            });
            mapInstanceRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

            const geojsonData = JSON.parse(area.geojson);
            const geoLayer = L.geoJSON(geojsonData, {
                style: {
                    color: '#2D5A27',
                    weight: 2,
                    fillColor: '#2D5A27',
                    fillOpacity: 0.2,
                },
            }).addTo(map);

            map.fitBounds(geoLayer.getBounds(), { padding: [20, 20] });
        };

        initMap();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [area?.id, area?.geojson]);

    if (!area) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-[14px]">
                <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                    Pilih salah satu wilayah lahan untuk melihat detail
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                            ID: {area.id}
                        </span>
                    </div>
                    <h2 className="text-[20px] font-bold text-gray-800">{area.name}</h2>
                    <div className="flex items-center gap-1.5 mt-1 text-[13px] text-gray-500">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                        {area.location_name || 'Lokasi tidak diketahui'}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => onEdit(area)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(area)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                        Hapus
                    </button>
                </div>
            </div>

            {/* Geolokasi + Catatan Row */}
            <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                    <div className="flex items-center gap-1.5 mb-3">
                        <svg className="w-4 h-4 text-[#2D5A27]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Geolokasi Wilayah</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Latitude</p>
                            <p className="text-[14px] font-bold text-gray-800">{area.latitude ? Number(area.latitude).toFixed(6) : '-'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Longitude</p>
                            <p className="text-[14px] font-bold text-gray-800">{area.longitude ? Number(area.longitude).toFixed(6) : '-'}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Catatan & Kondisi</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 h-[calc(100%-28px)]">
                        <p className="text-[13px] text-gray-600 italic leading-relaxed">"{area.notes || 'Belum ada catatan.'}"</p>
                        <p className="text-[10px] text-gray-400 mt-2">AgriSupport Note v1.0</p>
                    </div>
                </div>
            </div>

            {/* Spesifikasi */}
            <div className="mb-5">
                <div className="flex items-center gap-1.5 mb-3">
                    <svg className="w-4 h-4 text-[#2D5A27]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" /></svg>
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Spesifikasi Lahan</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Luas Total</p>
                        <p className="text-[14px] font-bold text-gray-800">{area.area_size} Hektar</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Tipe Tanah</p>
                        <p className="text-[14px] font-bold text-gray-800">{area.soil_type || '-'}</p>
                    </div>
                </div>
            </div>

            {/* Map Preview */}
            <div className="rounded-xl overflow-hidden border border-gray-200 relative">
                <div ref={mapContainerRef} className="w-full h-[200px] bg-gray-100" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2 z-[1000]">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        LIVE TRACKING ACTIVE
                    </span>
                </div>
                <div className="absolute bottom-3 right-3 z-[1000]">
                    <span className="inline-flex items-center px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-semibold rounded-full border border-gray-200">
                        Koordinat Terpeta
                    </span>
                </div>
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000]">
                    <div className="text-center">
                        <svg className="w-6 h-6 text-[#2D5A27] mx-auto drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
