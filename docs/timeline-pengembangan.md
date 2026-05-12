# Timeline Jadwal Pengembangan AgriSupport

> Sinkronisasi rencana proposal (Bab 5.1) dengan realisasi Jira (AGS) dan status aktual.
> Terakhir diperbarui: **3 Mei 2026**

---

## Keterangan

| Simbol | Keterangan |
|--------|-----------|
| ✅ Selesai | Semua subtask sudah di-commit dan PR telah dibuat |
| ⚡ Harus Selesai Segera | Sprint 1 sisa 5 hari — wajib selesai sebelum 8 Mei |
| 🔄 Dalam Pengerjaan | Sudah mulai, belum merge ke master |
| 📋 Belum Dimulai | Subtask sudah ada di Jira, belum ada commit developer |
| 🗓️ Sprint 2 | Belum masuk sprint aktif di Jira |

**Sprint 1 berlangsung: 13 Apr – 8 Mei 2026 → Sisa waktu: ~5 hari dari hari ini**

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
| 8 | PBI-02 | FR-02 | 8 | Dashboard | **Dashboard Petani** — Halaman ringkasan: cuaca hari ini, observasi terakhir, notifikasi aktif | AGS-2 | AGS-58, AGS-59, AGS-60 | Daenisty | ⚡ **Harus selesai sebelum 8 Mei** | ⚡ Harus Selesai Segera |
| 9 | PBI-05 | FR-05 | 8–9 | Notifikasi | **Notifikasi Cuaca Ekstrem** — Banner peringatan otomatis saat curah hujan atau angin melebihi batas kritis | AGS-20 | AGS-36, AGS-37 | Ketrin | ⚡ **Harus selesai sebelum 8 Mei** | ⚡ Harus Selesai Segera |
| 10 | PBI-03 | FR-03 | 10 | Administrasi | **Verifikasi Akun & Data oleh Admin** — Panel admin untuk verifikasi akun petani dan data lahan | AGS-3 | AGS-25, AGS-26, AGS-55 | Arjuna | 🔄 **Target 5–7 Mei 2026** | 🔄 Dalam Pengerjaan |

---

## Sprint 2 — Est. 12 Mei – 19 Jun 2026 (belum aktif di Jira)

| No | ID PBI | ID FR | Minggu Ke- | Fitur Utama | Nama & Deskripsi | ID Jira | Developer | Tanggal Estimasi | Status |
|----|--------|-------|-----------|-------------|-----------------|---------|-----------|-----------------|--------|
| 11 | PBI-11 | FR-11 | 11–12 | Cuaca Historis | **Riwayat Cuaca & Analisis Tren** — Histori data cuaca dan analisis pola jangka panjang | *(Sprint 2)* | Tavy | 🗓️ 12–19 Mei 2026 | 🗓️ Sprint 2 |
| 12 | PBI-12 | FR-12 | 11–12 | Profil Pengguna | **Manajemen Profil** — Edit profil, ganti password, pengaturan akun petani | *(Sprint 2)* | Ketrin | 🗓️ 12–18 Mei 2026 | 🗓️ Sprint 2 |
| 13 | PBI-13 | FR-13 | 12–13 | Visualisasi | **Peta Risiko (Heatmap)** — Visualisasi peta interaktif distribusi risiko seluruh lahan | *(Sprint 2)* | Taufik | 🗓️ 19–26 Mei 2026 | 🗓️ Sprint 2 |
| 14 | PBI-14 | FR-14 | 12–13 | Laporan | **Laporan & Ekspor Data** — Download data observasi dan risiko ke PDF/Excel | *(Sprint 2)* | Ketrin | 🗓️ 19–25 Mei 2026 | 🗓️ Sprint 2 |
| 15 | PBI-15 | FR-15 | 13–14 | Histori Lahan | **Riwayat Kondisi Lahan** — Histori observasi lapangan dan perubahan kondisi lahan | *(Sprint 2)* | Arjuna | 🗓️ 26 Mei – 2 Jun 2026 | 🗓️ Sprint 2 |
| 16 | PBI-16 | FR-16 | 13–14 | Notifikasi Lanjutan | **Pengaturan Notifikasi** — Preferensi batas dan jenis notifikasi per pengguna | *(Sprint 2)* | Ketrin | 🗓️ 26 Mei – 1 Jun 2026 | 🗓️ Sprint 2 |
| 17 | PBI-17 | FR-17 | 14–15 | Optimasi Sistem | **Penyempurnaan Mesin Risiko** — Kalibrasi bobot skor risiko dari data historis | *(Sprint 2)* | Bian | 🗓️ 2–9 Jun 2026 | 🗓️ Sprint 2 |
| 18 | PBI-18 | FR-18 | 14–15 | Integrasi Data | **Integrasi Data Eksternal** — Data indeks vegetasi NDVI dari API satelit | *(Sprint 2)* | Tavy | 🗓️ 3–10 Jun 2026 | 🗓️ Sprint 2 |

---

## Ringkasan Progress Sprint 1

| Developer | Selesai | Target Berikutnya | Deadline |
|-----------|---------|------------------|----------|
| Taufik | PBI-07 ✅, PBI-06 ✅ | — Sprint 1 selesai | — |
| Arjuna | PBI-01 ✅ | PBI-03 — **target 5–7 Mei** | 8 Mei 2026 |
| Daenisty | PBI-10 ✅ | PBI-02 — **harus selesai sekarang** | 8 Mei 2026 |
| Tavy | PBI-04 ✅ | — Sprint 1 selesai | — |
| Ketrin | PBI-09 ✅ | PBI-05 — **harus selesai sekarang** | 8 Mei 2026 |
| Bian | PBI-08 ✅ | — Sprint 1 selesai | — |

**Progress: 7 / 10 PBI selesai (70%) — 3 PBI tersisa harus selesai sebelum 8 Mei 2026**

---

## Urutan Dependensi Sprint 1 (status akhir)

```
PBI-06 ✅ (Taufik) → PBI-08 ✅ (Bian) → PBI-09 ✅ (Ketrin)
PBI-04 ✅           → PBI-05 ⚡ (Ketrin)
PBI-01 ✅           → PBI-03 🔄 (Arjuna)
PBI-10 ✅           → PBI-02 ⚡ (Daenisty)
```

---

## Catatan Penyesuaian dari Proposal Awal

- **PBI-04 (Cuaca)** — Proposal awal assign ke Bian. Realisasi dikerjakan oleh **Tavy**. Jira: AGS-19.
- **PBI-07** — Di proposal dinamai "Riwayat Lahan". Di implementasi aktual **diubah menjadi Landing Page**. Jira: AGS-22.
- **PBI-06 (Input Kondisi)** — Di proposal masuk minggu ke-9. Realisasi selesai lebih awal: **2 Mei 2026**.
- **PBI-08 (Mesin Risiko)** — Selesai bersamaan dengan PBI-06 pada **2 Mei 2026**, lebih cepat dari estimasi.
- **PBI-09 (Rekomendasi)** — Selesai **3 Mei 2026**, 4 hari sebelum deadline sprint.
- **Sprint 2** — Nama fitur PBI-11 s/d PBI-18 masih mengacu proposal; Jira sprint belum diaktifkan. Tanggal estimasi akan diperbarui saat Sprint 2 dimulai.
