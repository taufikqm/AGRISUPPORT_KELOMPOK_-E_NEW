import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import 'leaflet/dist/leaflet.css';

const LEVEL_META = {
    tinggi: { label: 'Tinggi',         color: '#ef4444' },
    sedang: { label: 'Sedang',         color: '#f59e0b' },
    rendah: { label: 'Rendah',         color: '#22c55e' },
    belum:  { label: 'Belum Ada Data', color: '#9ca3af' },
};
const LEGEND_ORDER = ['tinggi', 'sedang', 'rendah', 'belum'];
const RISK_RANK = { tinggi: 3, sedang: 2, rendah: 1, belum: 0 };

const escapeHtml = (s) =>
    String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dimColor = (s) => (s > 70 ? '#ef4444' : s > 40 ? '#f59e0b' : '#22c55e');

export default function GlobalRiskMap({ areas = [], riskSummary = {}, totalPetani = 0, petani = [], filters = {} }) {
    const mapRef         = useRef(null);
    const mapInstanceRef = useRef(null);
    const layersRef      = useRef({});

    const [activeLevels, setActiveLevels] = useState(() => new Set(LEGEND_ORDER));
    const [searchQuery, setSearchQuery]   = useState('');

    const summary = { tinggi: 0, sedang: 0, rendah: 0, belum: 0, ...riskSummary };
    const areasWithGeom = areas.filter((a) => a.geojson);

    const matchesSearch = (a) => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return true;
        return a.name.toLowerCase().includes(q) || a.owner.toLowerCase().includes(q);
    };

    // Daftar lahan diurut paling berisiko (untuk panel prioritas & fokus default).
    const ranked = [...areas].sort(
        (a, b) => (RISK_RANK[b.risk_level ?? 'belum'] - RISK_RANK[a.risk_level ?? 'belum']) || ((b.score ?? -1) - (a.score ?? -1))
    );
    const visibleRanked = ranked.filter((a) => activeLevels.has(a.risk_level ?? 'belum') && matchesSearch(a));

    /* ── Build peta sekali (saat areas berubah) ── */
    useEffect(() => {
        if (!mapRef.current || areasWithGeom.length === 0) return;
        let cancelled = false;
        const onResize = () => mapInstanceRef.current?.invalidateSize();

        const initMap = async () => {
            const L = (await import('leaflet')).default;
            if (cancelled || !mapRef.current) return;

            if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }

            const map = L.map(mapRef.current).setView([-7.797, 110.370], 11);
            mapInstanceRef.current = map;
            layersRef.current = {};

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap', maxZoom: 19,
            }).addTo(map);

            areasWithGeom.forEach((area) => {
                const meta = LEVEL_META[area.risk_level ?? 'belum'] ?? LEVEL_META.belum;
                const layer = L.geoJSON(area.geojson, {
                    style: { color: meta.color, weight: 2, fillColor: meta.color, fillOpacity: 0.45 },
                });

                const dims = (area.dimensions || []).map((d) =>
                    `<div style="display:flex;align-items:center;justify-content:space-between;gap:14px;font-size:12px;margin:2px 0">
                        <span style="color:#475569"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${dimColor(d.score)};margin-right:5px"></span>${escapeHtml(d.label)}</span>
                        <b style="color:#1e293b">${d.score}</b>
                     </div>`
                ).join('');

                const dateLine = area.observation_date
                    ? `<div style="font-size:11px;color:${area.is_stale ? '#ef4444' : '#94a3b8'};margin-top:4px">Observasi: ${escapeHtml(area.observation_date)} (${escapeHtml(area.observation_ago)})${area.is_stale ? ' &middot; data lama' : ''}</div>`
                    : '<div style="font-size:11px;color:#94a3b8;margin-top:4px">Belum ada observasi</div>';

                layer.bindTooltip(`${escapeHtml(area.name)} — ${escapeHtml(area.owner)}`, { sticky: true });
                layer.bindPopup(
                    `<div style="min-width:220px;line-height:1.5">
                        <strong style="font-size:14px">${escapeHtml(area.name)}</strong><br/>
                        <span style="font-size:12px;color:#64748b">Petani: <b style="color:#1e293b">${escapeHtml(area.owner)}</b></span><br/>
                        <span style="font-size:12px;color:#64748b">Lokasi: ${escapeHtml(area.location || '—')}</span><br/>
                        <span>Risiko: <b style="color:${meta.color}">${meta.label}</b>${area.score !== null && area.score !== undefined ? ` (${area.score}/100)` : ''}</span>
                        ${dims ? `<div style="margin:6px 0;padding-top:6px;border-top:1px solid #f1f5f9">${dims}</div>` : '<br/>'}
                        ${dateLine}
                        <div style="margin-top:6px"><a href="/admin/lahan?detail_id=${area.id}" style="color:#059669;font-weight:600">Lihat detail lahan &rarr;</a></div>
                     </div>`
                );

                layer.addTo(map);
                layersRef.current[area.id] = { layer, level: area.risk_level ?? 'belum', name: area.name, owner: area.owner };
            });

            const layers = Object.values(layersRef.current).map((x) => x.layer);
            if (layers.length) map.fitBounds(L.featureGroup(layers).getBounds().pad(0.2), { maxZoom: 13 });

            setTimeout(() => mapInstanceRef.current?.invalidateSize(), 150);
            window.addEventListener('resize', onResize);
        };

        initMap();
        return () => {
            cancelled = true;
            window.removeEventListener('resize', onResize);
            if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
            layersRef.current = {};
        };
    }, [areas]);

    /* ── Toggle visibilitas layer sesuai filter level + search (tanpa rebuild peta) ── */
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;
        const q = searchQuery.trim().toLowerCase();
        Object.values(layersRef.current).forEach(({ layer, level, name, owner }) => {
            const matchLevel  = activeLevels.has(level);
            const matchSearch = !q || name.toLowerCase().includes(q) || owner.toLowerCase().includes(q);
            if (matchLevel && matchSearch) {
                if (!map.hasLayer(layer)) map.addLayer(layer);
            } else if (map.hasLayer(layer)) {
                map.removeLayer(layer);
            }
        });
    }, [activeLevels, searchQuery]);

    const toggleLevel = (lvl) => {
        setActiveLevels((prev) => {
            const next = new Set(prev);
            if (next.has(lvl)) next.delete(lvl); else next.add(lvl);
            return next;
        });
    };

    const focusArea = (area) => {
        const map = mapInstanceRef.current;
        const entry = layersRef.current[area.id];
        if (!map || !entry) return;
        if (!map.hasLayer(entry.layer)) map.addLayer(entry.layer);
        map.flyToBounds(entry.layer.getBounds().pad(0.4), { maxZoom: 16 });
        entry.layer.openPopup();
    };

    const applyPetani = (value) => {
        router.get(route('admin.peta-risiko.index'), { petani: value || undefined }, { preserveState: true, replace: true });
    };

    const cards = [
        { key: 'tinggi', label: 'Risiko Tinggi' },
        { key: 'sedang', label: 'Risiko Sedang' },
        { key: 'rendah', label: 'Risiko Rendah' },
        { key: 'belum',  label: 'Belum Observasi' },
    ];

    return (
        <AdminLayout title="Peta Risiko Global">
            <Head title="Peta Risiko Global" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Peta Risiko Global</h1>
                        <p className="text-sm text-slate-400">Pantau risiko seluruh lahan semua petani dalam satu peta untuk prioritas penanganan.</p>
                    </div>
                    <select
                        dusk="filter-petani-peta"
                        value={filters.petani ?? ''}
                        onChange={(e) => applyPetani(e.target.value)}
                        className="rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="">Semua Petani ({totalPetani})</option>
                        {petani.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>

                {/* Search bar */}
                <div className="relative mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <input
                        dusk="input-search-peta"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama lahan atau petani…"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                            aria-label="Hapus pencarian"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Kartu ringkasan — klik untuk filter level */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {cards.map((c) => {
                        const active = activeLevels.has(c.key);
                        const meta = LEVEL_META[c.key];
                        return (
                            <button
                                key={c.key}
                                dusk={`kartu-risiko-${c.key}`}
                                onClick={() => toggleLevel(c.key)}
                                style={active ? { borderLeftColor: meta.color } : {}}
                                className={`flex items-center justify-between gap-3 text-left rounded-xl border border-l-2 px-3.5 py-2.5 transition-all ${
                                    active
                                        ? 'bg-slate-900 border-slate-700'
                                        : 'bg-slate-900/40 border-slate-800 opacity-40'
                                }`}
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: meta.color }} />
                                    <span className="text-xs text-slate-400 truncate">{c.label}</span>
                                </div>
                                <span className="text-lg font-bold text-white shrink-0">{summary[c.key] ?? 0}</span>
                            </button>
                        );
                    })}
                </div>

                {areas.length === 0 ? (
                    <div dusk="empty-state" className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                        Belum ada lahan terdaftar untuk ditampilkan di peta.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Peta */}
                        <div className="lg:col-span-2 relative">
                            <div ref={mapRef} dusk="peta-risiko-global-map" className="h-[60vh] lg:h-[70vh] w-full rounded-2xl overflow-hidden border border-slate-800 z-0" />

                            {/* Legenda */}
                            <div className="absolute top-4 right-4 z-[1000] bg-slate-900/95 backdrop-blur rounded-xl shadow-lg border border-slate-700 p-3 w-44">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Legenda</p>
                                <div className="space-y-1.5">
                                    {LEGEND_ORDER.map((key) => (
                                        <div key={key} className="flex items-center justify-between text-xs">
                                            <span className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-sm" style={{ background: LEVEL_META[key].color }} />
                                                <span className="text-slate-300">{LEVEL_META[key].label}</span>
                                            </span>
                                            <span className="font-bold text-white">{summary[key] ?? 0}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Panel Lahan Prioritas */}
                        <div dusk="panel-prioritas" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 h-[60vh] lg:h-[70vh] flex flex-col">
                            <h2 className="text-sm font-bold text-white mb-1">Lahan Prioritas</h2>
                            <p className="text-xs text-slate-500 mb-3">Diurut dari risiko tertinggi. Klik untuk fokus di peta.</p>
                            <div className="flex-1 overflow-y-auto scrollbar-slim space-y-2 pr-1">
                                {visibleRanked.length === 0 ? (
                                    <div className="text-center py-8 px-2">
                                        {searchQuery.trim() ? (
                                            <>
                                                <p className="text-sm text-slate-400">Tidak ditemukan hasil untuk</p>
                                                <p className="text-sm font-semibold text-white mt-1">&ldquo;{searchQuery}&rdquo;</p>
                                                <button onClick={() => setSearchQuery('')} className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 underline">Hapus pencarian</button>
                                            </>
                                        ) : (
                                            <p className="text-sm text-slate-500">Tidak ada lahan pada filter ini.</p>
                                        )}
                                    </div>
                                ) : visibleRanked.map((a) => {
                                    const meta = LEVEL_META[a.risk_level ?? 'belum'];
                                    return (
                                        <button
                                            key={a.id}
                                            dusk={`prioritas-row-${a.id}`}
                                            onClick={() => focusArea(a)}
                                            disabled={!a.geojson}
                                            className="w-full text-left bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl p-3 transition-colors"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-sm font-medium text-white truncate">{a.name}</span>
                                                <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: meta.color, background: `${meta.color}22` }}>
                                                    {a.score !== null && a.score !== undefined ? a.score : '—'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-2 mt-1">
                                                <span className="text-xs text-slate-400 truncate">{a.owner}</span>
                                                {a.is_stale && <span className="shrink-0 text-[10px] text-red-400">data lama</span>}
                                                {!a.geojson && <span className="shrink-0 text-[10px] text-slate-500">tanpa lokasi</span>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
