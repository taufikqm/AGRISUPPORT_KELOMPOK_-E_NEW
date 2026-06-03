import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

const LEVEL_META = {
    tinggi: { label: 'Tinggi',         color: '#ef4444' },
    sedang: { label: 'Sedang',         color: '#f59e0b' },
    rendah: { label: 'Rendah',         color: '#22c55e' },
    belum:  { label: 'Belum Ada Data', color: '#9ca3af' },
};

const LEGEND_ORDER = ['tinggi', 'sedang', 'rendah', 'belum'];

const escapeHtml = (s) =>
    String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default function PetaRisiko({ areas = [], riskSummary = {} }) {
    const mapRef         = useRef(null);
    const mapInstanceRef = useRef(null);
    const layersRef      = useRef({});
    const [selectedArea, setSelectedArea] = useState('');

    const areasWithGeom = areas.filter((a) => a.geojson);
    const summary = { tinggi: 0, sedang: 0, rendah: 0, belum: 0, ...riskSummary };

    useEffect(() => {
        if (!mapRef.current || areas.length === 0) return;
        let cancelled = false;

        const initMap = async () => {
            const L = (await import('leaflet')).default;
            if (cancelled || !mapRef.current) return;

            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }

            const map = L.map(mapRef.current).setView([-7.797, 110.370], 11);
            mapInstanceRef.current = map;
            layersRef.current = {};

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap',
                maxZoom: 19,
            }).addTo(map);

            areasWithGeom.forEach((area) => {
                const meta = LEVEL_META[area.risk_level ?? 'belum'] ?? LEVEL_META.belum;
                const layer = L.geoJSON(area.geojson, {
                    style: { color: meta.color, weight: 2, fillColor: meta.color, fillOpacity: 0.45 },
                });

                const link = area.observation_id
                    ? `<a href="/analisis-risiko/${area.observation_id}" style="color:#2D5A27;font-weight:600">Lihat analisis &rarr;</a>`
                    : `<span style="color:#94a3b8">Belum ada observasi</span>`;

                layer.bindTooltip(escapeHtml(area.name), { sticky: true });
                layer.bindPopup(
                    `<div style="min-width:170px;line-height:1.5">
                        <strong>${escapeHtml(area.name)}</strong><br/>
                        Risiko: <b style="color:${meta.color}">${meta.label}</b><br/>
                        ${area.score !== null && area.score !== undefined ? `Skor: ${area.score}/100<br/>` : ''}
                        ${link}
                    </div>`
                );

                layer.addTo(map);
                layersRef.current[area.id] = layer;
            });

            const layers = Object.values(layersRef.current);
            if (layers.length) {
                map.fitBounds(L.featureGroup(layers).getBounds().pad(0.2));
            }
        };

        initMap();

        return () => {
            cancelled = true;
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
            layersRef.current = {};
        };
    }, [areas]);

    const handleSelectArea = (id) => {
        setSelectedArea(id);
        if (!id) return;
        const layer = layersRef.current[id];
        if (layer && mapInstanceRef.current) {
            mapInstanceRef.current.flyToBounds(layer.getBounds().pad(0.4));
            layer.openPopup();
        }
    };

    const handleGeolocate = () => {
        if (!navigator.geolocation || !mapInstanceRef.current) return;
        navigator.geolocation.getCurrentPosition((pos) => {
            mapInstanceRef.current.flyTo([pos.coords.latitude, pos.coords.longitude], 14);
        });
    };

    return (
        <AuthenticatedLayout title="Peta Risiko Lahan" currentRoute="peta-risiko.index">
            <Head title="Peta Risiko Lahan" />

            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                        <div>
                            <h1 className="text-2xl font-bold text-[#1e293b]">Peta Risiko Lahan</h1>
                            <p className="text-sm text-[#64748b]">
                                Visualisasi tingkat risiko tiap lahan berdasarkan observasi terbaru.
                            </p>
                        </div>
                        {areasWithGeom.length > 0 && (
                            <select
                                dusk="filter-area"
                                value={selectedArea}
                                onChange={(e) => handleSelectArea(e.target.value)}
                                className="rounded-xl border-[#e2e8f0] text-sm font-medium text-[#1e293b] focus:ring-[#2D5A27] focus:border-[#2D5A27]"
                            >
                                <option value="">Semua Lahan</option>
                                {areasWithGeom.map((a) => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {areas.length === 0 ? (
                        <div dusk="empty-state" className="bg-white border border-[#e2e8f0] rounded-2xl p-12 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-[#f0fdf4] flex items-center justify-center mx-auto mb-4">
                                <svg className="w-7 h-7 text-[#2D5A27]" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.879 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                                </svg>
                            </div>
                            <p className="font-semibold text-[#1e293b]">Belum ada lahan</p>
                            <p className="text-sm text-[#64748b] mt-1 mb-4">Tambahkan wilayah lahan dulu untuk melihat peta risikonya.</p>
                            <Link href={route('wilayah-lahan.index')} className="inline-block text-sm font-semibold px-4 py-2 rounded-xl bg-[#2D5A27] text-white hover:bg-[#244a20]">
                                Tambah Wilayah Lahan
                            </Link>
                        </div>
                    ) : (
                        <div className="relative">
                            <div
                                ref={mapRef}
                                dusk="peta-risiko-map"
                                className="h-[600px] w-full rounded-2xl overflow-hidden border border-[#e2e8f0] z-0"
                            />

                            {/* Legenda */}
                            <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur rounded-xl shadow-md border border-[#e2e8f0] p-3 w-44">
                                <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wide mb-2">Legenda</p>
                                <div className="space-y-1.5">
                                    {LEGEND_ORDER.map((key) => (
                                        <div key={key} className="flex items-center justify-between text-xs">
                                            <span className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-sm" style={{ background: LEVEL_META[key].color }} />
                                                <span className="text-[#475569]">{LEVEL_META[key].label}</span>
                                            </span>
                                            <span className="font-bold text-[#1e293b]">{summary[key] ?? 0}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tombol geolokasi */}
                            <button
                                dusk="btn-geolokasi"
                                onClick={handleGeolocate}
                                title="Lokasi saya"
                                className="absolute bottom-6 right-6 z-[1000] w-10 h-10 rounded-full bg-white shadow-md border border-[#e2e8f0] flex items-center justify-center text-[#2D5A27] hover:bg-[#f0fdf4]"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
