# Timeline Jadwal Pengembangan AgriSupport

> Sinkronisasi rencana proposal (Bab 5.1) dengan realisasi Jira (AGS) dan status aktual.
> Terakhir diperbarui: **14 Mei 2026**

---

## Keterangan

| Simbol | Keterangan |
|--------|-----------|
| ✅ Selesai | Semua subtask sudah di-commit dan PR telah dibuat |
| 🔵 Sprint 2 | Issue aktif di AGS Sprint 2, belum mulai coding |
| 🔄 Dalam Pengerjaan | Sudah mulai, belum merge ke master |
| 📋 Belum Dimulai | Subtask sudah ada di Jira, belum ada commit developer |

**Sprint 1 selesai: 13 Apr – 8 Mei 2026 → 10/10 PBI selesai ✅**
**Sprint 2 aktif: 10 Mei – 8 Jun 2026 → 15 PBI, 154 SP**

---

## Sprint 1 — 13 Apr – 8 Mei 2026

| No | ID PBI | ID FR | Minggu Ke- | Fitur Utama | Nama & Deskripsi | ID Jira | Subtask Jira | Developer | Tanggal Pengerjaan | Status |
|----|--------|-------|-----------|-------------|-----------------|---------|-------------|-----------|-------------------|--------|
| 1 | PBI-10 | FR-10 | 6 | Autentikasi | **Register & Login** — Sistem autentikasi & pendaftaran petani | AGS-51 | AGS-51 ST-01 ✅, ST-02 ✅ | Daenisty | ✅ Selesai 23 Apr 2026 | ✅ Selesai |
| 2 | PBI-07 | FR-07 | 6–7 | Landing Page | **Landing Page** — Halaman publik beranda AgriSupport (hero, fitur, cara kerja, CTA, footer) | AGS-22 | AGS-63 ✅, AGS-64 ✅, AGS-65 ✅, AGS-66 ✅ | Taufik | ✅ Selesai 23 Apr 2026 | ✅ Selesai |
| 3 | PBI-01 | FR-01 | 7–8 | Manajemen Lahan | **Pengelolaan Wilayah Lahan** — CRUD data lahan pertanian dengan peta interaktif Leaflet + PostGIS | AGS-1 | AGS-27 ✅, AGS-28 ✅, AGS-29 ✅ | Arjuna | ✅ Selesai 23 Apr 2026 | ✅ Selesai |
| 4 | PBI-04 | FR-04 | 7–8 | Cuaca & Prakiraan | **Pemantauan Cuaca & Prakiraan 5 Hari** — Data cuaca real-time dan prakiraan via Open-Meteo API | AGS-19 | AGS-33 ✅, AGS-34 ✅, AGS-35 ✅ | Tavy | ✅ Selesai 25 Apr 2026 | ✅ Selesai |
| 5 | PBI-06 | FR-06 | 8–9 | Analisis Risiko & Form Kondisi | **Input Kondisi Lapangan & Validasi** — Form observasi, snapshot cuaca, dan halaman validasi perbandingan API vs lapangan | AGS-21 | AGS-21 ST-01 ✅, ST-02 ✅, ST-03 ✅ | Taufik | ✅ Selesai 2 Mei 2026 | ✅ Selesai |
| 6 | PBI-08 | FR-08 | 9 | Kalkulasi Risiko | **Mesin Penghitung Risiko Otomatis** — Algoritma kalkulasi skor risiko kekeringan, genangan & penyakit dari observasi + cuaca | AGS-23 | AGS-23 ST-01 ✅, ST-02 ✅, ST-03 ✅ | Bian | ✅ Selesai 2 Mei 2026 | ✅ Selesai |
| 7 | PBI-09 | FR-09 | 9–10 | Rekomendasi | **Rekomendasi Tindakan Pertanian** — Daftar saran tindakan spesifik berdasarkan level risiko, dapat ditandai selesai | AGS-24 | AGS-24 ST-01 ✅, ST-02 ✅, ST-03 ✅, ST-04 ✅ | Ketrin | ✅ Selesai 3 Mei 2026 | ✅ Selesai |
| 8 | PBI-02 | FR-02 | 8 | Dashboard | **Dashboard Petani** — Halaman ringkasan: cuaca hari ini, observasi terakhir, notifikasi aktif | AGS-2 | AGS-58 ✅, AGS-59 ✅, AGS-60 ✅ | Daenisty | ✅ Selesai 8 Mei 2026 | ✅ Selesai |
| 9 | PBI-05 | FR-05 | 8–9 | Notifikasi | **Notifikasi Cuaca Ekstrem** — Banner peringatan otomatis saat curah hujan atau angin melebihi batas kritis | AGS-20 | AGS-36 ✅, AGS-37 ✅ | Ketrin | ✅ Selesai 8 Mei 2026 | ✅ Selesai |
| 10 | PBI-03 | FR-03 | 10 | Administrasi | **Verifikasi Akun & Data oleh Admin** — Panel admin untuk verifikasi akun petani dan data lahan | AGS-3 | AGS-25 ✅, AGS-26 ✅, AGS-55 ✅ | Arjuna | ✅ Selesai 8 Mei 2026 | ✅ Selesai |

---

## Sprint 2 — 10 Mei – 8 Jun 2026 (aktif di Jira)

> Diurutkan berdasarkan Priority Jira (Highest → High → Medium → Low) sesuai urutan wave pengerjaan.
> Total: 15 PBI, 154 Story Points.

| No | ID PBI | ID FR | Minggu Ke- | Fitur Utama | Nama & Deskripsi | ID Jira | Subtask Jira | Developer | Tanggal Estimasi | Status | Priority |
|----|--------|-------|-----------|-------------|-----------------|---------|-------------|-----------|-----------------|--------|----------|
| 11 | PBI-21 | FR-21 | 11–12 | Autentikasi Admin | **Role System & Autentikasi Admin** — Middleware AdminOnly, halaman `/admin/login` terpisah, AdminLayout dengan sidebar & topbar, seeder akun admin | AGS-89 | ST-01, ST-02, ST-03, ST-04 | Taufik | 11–22 Mei 2026 | 🔵 Sprint 2 | ⬆ Highest |
| 12 | PBI-11 | FR-11 | 11 | Histori Lahan | **Riwayat Kondisi Lahan** — Tabel histori semua observasi dengan 4 tab (Observasi, Validasi, Risiko, Rekomendasi), filter lahan & pencarian | AGS-71 | AGS-73, AGS-74, AGS-75, AGS-76 | Bian | 11–17 Mei 2026 | 🔵 Sprint 2 | ↑ High |
| 13 | PBI-20 | FR-20 | 11–12 | Pengaturan Pengguna | **Pengaturan Profil Petani** — Edit nama, email, foto profil, ganti password, dan manajemen akun petani | AGS-88 | AGS-104 (ST-01), AGS-105 (ST-02) | Tavy | 11–22 Mei 2026 | 🔵 Sprint 2 | ↑ High |
| 14 | PBI-13 | FR-13 | 11–12 | Visualisasi Risiko | **Peta Risiko Lahan** — Peta interaktif Leaflet polygon per lahan dengan warna risiko (hijau/kuning/merah), popup detail, legenda | AGS-82 | ST-01, ST-02, ST-03 | Arjuna | 11–22 Mei 2026 | 🔵 Sprint 2 | ↑ High |
| 15 | PBI-18 | FR-18 | 11–12 | Analisis Historis | **Insight Historis & Analisis Tren Lahan** — Grafik tren cuaca (Recharts), distribusi risiko, frekuensi observasi dengan filter lahan & rentang waktu | AGS-86 | ST-01, ST-02, ST-03 | Ketrin | 11–22 Mei 2026 | 🔵 Sprint 2 | ↑ High |
| 16 | PBI-12 | FR-12 | 11–13 | Prediksi Pertanian | **Prediksi Waktu Tanam Terbaik** — Analisis cuaca historis Open-Meteo + kondisi lahan untuk rekomendasi jendela tanam optimal dengan tingkat kepercayaan | AGS-72 | AGS-77, AGS-78, AGS-79, AGS-80 | Daenisty | 11–31 Mei 2026 | 🔵 Sprint 2 | ↑ High |
| 17 | PBI-19 | FR-19 | 12–13 | Notifikasi Petani | **Sistem Notifikasi Petani** — Bell icon + badge unread di topbar, dropdown panel, halaman `/notifikasi`, mark as read, 5 jenis trigger notifikasi otomatis | AGS-87 | ST-01, ST-02, ST-03 | Ketrin | 18–31 Mei 2026 | 🔵 Sprint 2 | ↑ High |
| 18 | PBI-15 | FR-15 | 13–14 | Dashboard Admin | **Dashboard Admin** — 4 kartu statistik (total petani/lahan/observasi/risiko tinggi), grafik donut distribusi risiko, grafik line tren 7 minggu, tabel 10 aktivitas terbaru | AGS-81 | ST-01, ST-02, ST-03 | Taufik | 25 Mei – 4 Jun 2026 | 🔵 Sprint 2 | → Medium |
| 19 | PBI-22 | FR-22 | 13–14 | Manajemen Admin | **Manajemen Pengguna (Admin)** — Daftar semua petani terdaftar, search/filter, detail profil, edit data, nonaktifkan akun | AGS-90 | ST-01, ST-02, ST-03 | Bian | 25 Mei – 7 Jun 2026 | 🔵 Sprint 2 | → Medium |
| 20 | PBI-23 | FR-23 | 13–14 | Manajemen Admin | **Manajemen Lahan & Observasi (Admin)** — Tabel semua lahan semua petani, filter by petani, detail lahan + riwayat observasi, edit, hapus dengan konfirmasi | AGS-91 | ST-01, ST-02, ST-03 | Arjuna | 25 Mei – 7 Jun 2026 | 🔵 Sprint 2 | → Medium |
| 21 | PBI-24 | FR-24 | 13–14 | Manajemen Admin | **Manajemen Rekomendasi (Admin)** — Daftar template rekomendasi, CRUD template, filter by kategori, monitor tindakan yang diambil petani | AGS-92 | ST-01, ST-02, ST-03 | Daenisty | 25 Mei – 4 Jun 2026 | 🔵 Sprint 2 | → Medium |
| 22 | PBI-26 | FR-26 | 13–14 | Laporan Admin | **Riwayat Aktivitas & Laporan Admin** — Timeline aktivitas platform semua petani, grafik tren (Recharts), filter by petani/waktu, ekspor CSV | AGS-94 | ST-01, ST-02, ST-03, ST-04 | Bian | 25 Mei – 4 Jun 2026 | 🔵 Sprint 2 | → Medium |
| 23 | PBI-25 | FR-25 | 14 | Visualisasi Admin | **Peta Risiko Global (Admin)** — Leaflet global map semua lahan semua petani, marker warna per risk level, filter by petani/risiko, popup nama pemilik & detail | AGS-93 | ST-01, ST-02, ST-03 | Arjuna | 1–7 Jun 2026 | 🔵 Sprint 2 | ↓ Low |
| 24 | PBI-27 | FR-27 | 13–14 | Notifikasi Admin | **Sistem Notifikasi Admin** — Bell + dropdown di AdminLayout, form broadcast ke semua/petani tertentu, riwayat notifikasi terkirim, queue async | AGS-95 | AGS-108 (ST-01), AGS-109 (ST-02), AGS-110 (ST-03) | Taufik | 1–7 Jun 2026 | 🔵 Sprint 2 | ↓ Low |
| 25 | PBI-28 | FR-28 | 14 | Pengaturan Admin | **Pengaturan Admin** — Edit profil admin (nama, email, password) via `/admin/pengaturan`, 2 section form, tanpa opsi hapus akun | AGS-96 | ST-01, ST-02 | Taufik | 1–7 Jun 2026 | 🔵 Sprint 2 | ↓ Low |

---

## Ringkasan Progress Sprint 1 (Final — 8 Mei 2026)

| Developer | PBI Selesai di Sprint 1 | SP |
|-----------|------------------------|----|
| Taufik | PBI-07 ✅, PBI-06 ✅ | 10 SP |
| Arjuna | PBI-01 ✅, PBI-03 ✅ | 16 SP |
| Daenisty | PBI-10 ✅, PBI-02 ✅ | 13 SP |
| Tavy | PBI-04 ✅ | 8 SP |
| Ketrin | PBI-09 ✅, PBI-05 ✅ | 16 SP |
| Bian | PBI-08 ✅ | 8 SP |

**Sprint 1 selesai: 10 / 10 PBI (100%) ✅**

---

## Beban Kerja Sprint 2 per Developer

| Developer | PBI Sprint 2 | Total SP |
|-----------|-------------|---------|
| Taufik | AGS-89 (13), AGS-81 (8), AGS-95 (13), AGS-96 (5) | 39 SP |
| Arjuna | AGS-82 (13), AGS-91 (13), AGS-93 (8) | 34 SP |
| Bian | AGS-71 (8), AGS-90 (13), AGS-94 (8) | 29 SP |
| Ketrin | AGS-86 (13), AGS-87 (13) | 26 SP |
| Daenisty | AGS-72 (13), AGS-92 (8) | 21 SP |
| Tavy | AGS-88 (5) | 5 SP |

**Total Sprint 2: 154 SP**

---

## Urutan Dependensi Sprint 2

```
Wave 1 — Paralel, Minggu 11–12 (11–24 Mei):
  AGS-89 ⬆ (Taufik)   ← BLOCKER semua fitur admin
  AGS-71 ↑ (Bian)
  AGS-88 ↑ (Taufik)
  AGS-82 ↑ (Arjuna)
  AGS-86 ↑ (Ketrin)

Wave 2 — Minggu 12–13 (18–31 Mei):
  AGS-72 ↑ (Daenisty)  ← bisa mulai sejak Minggu 11
  AGS-87 ↑ (Ketrin)    ← mulai setelah AGS-86 selesai

Wave 3 — Minggu 13–14 (25 Mei – 7 Jun), setelah AGS-89 merge:
  AGS-81 → (Taufik)
  AGS-90 → (Bian)
  AGS-91 → (Arjuna)
  AGS-92 → (Daenisty)
  AGS-94 → (Bian)

Wave 4 — Minggu 14 (1–7 Jun):
  AGS-93 ↓ (Arjuna)   ← setelah AGS-82 + AGS-91 selesai
  AGS-95 ↓ (Taufik)   ← setelah AGS-87 + AGS-89 selesai
  AGS-96 ↓ (Taufik)   ← setelah AGS-89 selesai
```

---

## Catatan Penyesuaian dari Proposal Awal

### Sprint 1
- **PBI-04 (Cuaca)** — Proposal awal assign ke Bian. Realisasi dikerjakan oleh **Tavy**. Jira: AGS-19.
- **PBI-07** — Di proposal dinamai "Riwayat Lahan". Di implementasi aktual **diubah menjadi Landing Page**. Jira: AGS-22.
- **PBI-06 (Input Kondisi)** — Di proposal masuk minggu ke-9. Realisasi selesai lebih awal: **2 Mei 2026**.
- **PBI-08 (Mesin Risiko)** — Selesai bersamaan dengan PBI-06 pada **2 Mei 2026**, lebih cepat dari estimasi.
- **PBI-09 (Rekomendasi)** — Selesai **3 Mei 2026**, 4 hari sebelum deadline sprint.

### Sprint 2
- **Scope berubah signifikan dari proposal** — Sprint 2 aktual fokus pada fitur panel admin (PBI-21 s/d PBI-28) + lanjutan fitur petani (PBI-11, PBI-12, PBI-13, PBI-18, PBI-19, PBI-20), bukan PBI-11 s/d PBI-18 seperti di proposal awal.
- **Tim aktif Sprint 2: 6 orang** — Taufik, Bian, Daenisty, Arjuna, Ketrin, dan Tavy (assign PBI-20 Pengaturan Profil Petani / AGS-88).
- **AGS-89 (PBI-21) sebagai BLOCKER** — Seluruh 8 fitur admin (AGS-81, 90, 91, 92, 93, 94, 95, 96) bergantung pada AGS-89 selesai dan di-merge ke master terlebih dahulu.
- **Total Story Points Sprint 2: 154 SP** — Lebih besar dari Sprint 1. Taufik menanggung beban terbesar (44 SP) karena sebagai PM sekaligus developer fitur admin.
