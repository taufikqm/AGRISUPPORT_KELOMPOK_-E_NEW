/* ─── Landing Page Data Constants ─── */

export const MODULE_TABS = [
    { key: 'semua', label: 'Semua' },
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'riwayat', label: 'Riwayat Lahan' },
    { key: 'insight', label: 'Insight' },
];

export const MODULE_CARDS = [
    {
        key: 'dashboard',
        tag: 'Dashboard',
        title: 'Dashboard Utama',
        desc: 'Pantau ringkasan kondisi cuaca, peringatan dini, dan status lahan dalam satu layar yang bersih.',
        img: '/images/landing/dashboard.png',
    },
    {
        key: 'riwayat',
        tag: 'Riwayat Lahan',
        title: 'Pemetaan Risiko',
        desc: 'Visualisasi area rentan genangan atau kekeringan dari waktu ke waktu dengan integrasi peta.',
        img: '/images/landing/riskmap.png',
    },
    {
        key: 'insight',
        tag: 'Insight',
        title: 'Analisis & Prediksi',
        desc: 'Grafik historis dan model prediksi tren iklim untuk perencanaan musim tanam yang optimal.',
        img: '/images/landing/analytics.png',
    },
];

export const TESTIMONIALS = [
    {
        name: 'Bapak Budi',
        role: 'Petani Padi, Jawa Tengah',
        quote: '"AgriSupport membantu saya menghindari gagal panen bulan lalu berkat fitur prediksi genangannya. UI-nya sangat gampang dipahami, bahkan untuk saya yang jarang pakai tablet."',
        avatar: '/images/landing/avatar_budi.png',
    },
    {
        name: 'Ibu Siti',
        role: 'Ketua Kelompok Tani',
        quote: '"Pembaruan cuaca dan rekomendasi tindakan harian sangat akurat. Kami kini bisa merencanakan penyebaran pupuk secara optimal tanpa khawatir tergerus hujan."',
        avatar: '/images/landing/avatar_siti.png',
    },
];
