import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

/**
 * ============================================================
 * STUB: Admin/GlobalRiskMap.jsx — Peta Risiko Global Admin (AGS-93)
 * ============================================================
 * ASSIGNEE : Arjuna
 * BRANCH   : feature/AGS-93-peta-risiko-global-admin
 *
 * BACKEND TERKAIT:
 *   - app/Http/Controllers/Admin/GlobalRiskMapController.php
 *
 * PROPS:
 *   @param {Object} auth       — data user admin
 *   @param {Array}  petaniList — daftar petani untuk filter
 *
 * DATA PETA:
 *   Fetch GeoJSON dari GET /admin/api/peta-risiko?user_id=&risk_level=
 *   Response: { type: 'FeatureCollection', features: [{...}] }
 *   Tiap feature: { geometry: Polygon, properties: { name, owner, risk_level } }
 *
 * FITUR YANG PERLU DIIMPLEMENTASI:
 *   [ ] Leaflet map fullscreen menampilkan SEMUA lahan semua petani
 *   [ ] Polygon per lahan berwarna sesuai risk level
 *   [ ] Popup klik: nama lahan, nama pemilik, risk level
 *   [ ] Filter by petani (dusk="filter-petani-global") — reload GeoJSON
 *   [ ] Filter by risk level (dusk="filter-risk-level") — reload GeoJSON
 *   [ ] Legenda peta (merah=tinggi, kuning=sedang, hijau=rendah)
 * ============================================================
 */
export default function GlobalRiskMap({ auth, petaniList }) {
    return (
        <AdminLayout title="Peta Risiko Global" currentRoute="admin.peta-risiko.index">
            <Head title="Peta Risiko Global" />
            <div className="h-screen flex flex-col">
                {/* TODO: Filter bar (petani + risk level) di atas peta */}
                {/* dusk="filter-petani-global" */}
                {/* dusk="filter-risk-level" */}

                {/* TODO: Leaflet map container */}
                <div id="admin-global-map" className="flex-1" dusk="map-container">
                    {/* Leaflet render di sini */}
                </div>
            </div>
        </AdminLayout>
    );
}
