<?php

namespace Database\Seeders;

use App\Models\ActionLog;
use App\Models\Recommendation;
use Illuminate\Database\Seeder;

class RecommendationSeeder extends Seeder
{
    public function run(): void
    {
        // Hapus template lama yang tidak direferensikan action_logs
        $usedIds = ActionLog::pluck('recommendation_id')->filter()->unique()->values()->toArray();
        Recommendation::whereNotIn('id', $usedIds)
            ->whereIn('category', ['Proteksi Tanaman', 'Infrastruktur', 'Pemupukan', 'Pencatatan'])
            ->delete();

        $templates = [

            // ── PENYAKIT ──────────────────────────────────────────────
            [
                'category' => 'Penyakit - Berat',
                'title'    => 'Penanganan Segera: Serangan {{disease}} Tingkat Berat',
                'description' => '{{advice}} Indikasi serangan berat {{disease}} terdeteksi pada lahan bertanah {{soil_type}}. '
                    . 'Tindakan pengobatan harus dilakukan dalam 24–48 jam untuk mencegah gagal panen.',
                'urgency' => 'SEGERA',
                'color'   => 'red',
                'details' => [
                    'steps' => [
                        'Identifikasi dan tandai area yang paling parah terdampak {{disease}}',
                        'Gunakan APD lengkap (masker, sarung tangan, kacamata) sebelum penyemprotan',
                        'Semprotkan fungisida/pestisida dengan dosis sesuai label produk',
                        'Ulangi aplikasi setelah 5–7 hari jika serangan belum mereda',
                        'Segera hubungi penyuluh pertanian jika gejala menyebar ke area lain',
                    ],
                    'tools' => ['Fungisida / Pestisida relevan', 'Sprayer punggung', 'APD lengkap', 'Bendera penanda area'],
                ],
            ],
            [
                'category' => 'Penyakit - Sedang',
                'title'    => 'Pencegahan Penyebaran {{disease}} — Indikasi Sedang',
                'description' => 'Ditemukan indikasi {{disease}} tingkat sedang pada tanah {{soil_type}}. {{advice}} '
                    . 'Lakukan langkah pencegahan segera sebelum berkembang menjadi serangan berat.',
                'urgency' => 'TINGGI',
                'color'   => 'amber',
                'details' => [
                    'steps' => [
                        'Periksa seluruh area lahan dan catat lokasi kemunculan gejala {{disease}}',
                        'Lakukan penyemprotan fungisida preventif pada area sekitar gejala',
                        'Pastikan jarak tanam cukup untuk sirkulasi udara optimal',
                        'Monitor perkembangan gejala setiap 2–3 hari dan catat hasilnya',
                    ],
                    'tools' => ['Fungisida preventif', 'Sprayer', 'Buku catatan monitoring'],
                ],
            ],
            [
                'category' => 'Penyakit - Ringan',
                'title'    => 'Pemantauan Dini {{disease}} — Indikasi Ringan',
                'description' => 'Terdeteksi indikasi awal {{disease}} dalam skala ringan pada tanah {{soil_type}}. '
                    . 'Pantau perkembangan dan siapkan tindakan pencegahan sebelum menyebar.',
                'urgency' => 'TERENCANA',
                'color'   => 'green',
                'details' => [
                    'steps' => [
                        'Tandai tanaman yang menunjukkan gejala awal untuk pemantauan rutin',
                        'Pastikan sanitasi lahan terjaga — bersihkan dan buang sisa tanaman yang terinfeksi',
                        'Siapkan fungisida sebagai antisipasi jika gejala memburuk',
                        'Catat perkembangan setiap minggu untuk referensi tindak lanjut',
                    ],
                    'tools' => ['Fungisida preventif', 'Alat sanitasi lahan', 'Buku catatan'],
                ],
            ],

            // ── HAMA ─────────────────────────────────────────────────
            [
                'category' => 'Hama - Berat',
                'title'    => 'Pengendalian Segera: Serangan Hama Tingkat Berat',
                'description' => 'Terdeteksi serangan hama tingkat berat pada lahan {{location}}. '
                    . 'Populasi hama yang tinggi dapat menyebabkan kehilangan hasil panen signifikan. Tindakan segera wajib dilakukan.',
                'urgency' => 'SEGERA',
                'color'   => 'red',
                'details' => [
                    'steps' => [
                        'Identifikasi jenis hama yang menyerang dan hitung populasinya per m²',
                        'Gunakan APD lengkap sebelum aplikasi insektisida',
                        'Semprotkan insektisida dengan dosis dan waktu aplikasi yang tepat (pagi atau sore hari)',
                        'Pasang perangkap massal di sekitar lahan untuk menekan populasi hama',
                        'Evaluasi hasil pengendalian setelah 3–5 hari dan ulangi jika diperlukan',
                    ],
                    'tools' => ['Insektisida sesuai jenis hama', 'Sprayer', 'Perangkap hama massal', 'APD lengkap'],
                ],
            ],
            [
                'category' => 'Hama - Sedang',
                'title'    => 'Pengendalian Terpadu: Hama Tingkat Sedang',
                'description' => 'Ditemukan indikasi serangan hama tingkat sedang di lahan {{location}}. '
                    . 'Lakukan pengendalian hama terpadu (PHT) sebelum populasi hama meningkat ke level berbahaya.',
                'urgency' => 'TINGGI',
                'color'   => 'amber',
                'details' => [
                    'steps' => [
                        'Lakukan pengamatan visual menyeluruh untuk menentukan sebaran dan jenis hama',
                        'Prioritaskan penggunaan agen hayati atau musuh alami jika tersedia',
                        'Jika diperlukan, semprotkan insektisida hanya pada area yang terinfeksi',
                        'Pasang sticky trap untuk memantau dinamika populasi hama',
                        'Evaluasi setiap 3 hari dan eskalasi ke penanganan berat jika populasi meningkat',
                    ],
                    'tools' => ['Insektisida / Agen hayati', 'Yellow sticky trap', 'Sprayer'],
                ],
            ],

            // ── GENANGAN ─────────────────────────────────────────────
            [
                'category' => 'Genangan - Banyak',
                'title'    => 'Drainase Darurat: Genangan Parah Terdeteksi',
                'description' => 'Lahan Anda mengalami genangan air parah. Kondisi ini memicu busuk akar dan penyebaran penyakit '
                    . 'pada tanah {{soil_type}}. {{advice}} Tindakan drainase darurat harus segera dilakukan.',
                'urgency' => 'SEGERA',
                'color'   => 'red',
                'details' => [
                    'steps' => [
                        'Periksa dan buka semua saluran pembuangan air yang tersumbat',
                        'Buat saluran sementara untuk mengalirkan air keluar dari lahan',
                        'Periksa kondisi tanggul — perbaiki bagian yang jebol atau bocor',
                        'Hindari aktivitas mekanisasi di lahan yang masih tergenang untuk mencegah pemadatan tanah',
                        'Setelah air surut, periksa kondisi akar tanaman dari potensi busuk akar',
                    ],
                    'tools' => ['Cangkul & sekop', 'Pompa air portabel (jika tersedia)', 'Sepatu boot', 'Sarung tangan'],
                ],
            ],
            [
                'category' => 'Genangan - Sedang',
                'title'    => 'Perbaikan Drainase: Genangan Sedang Terdeteksi',
                'description' => 'Terdeteksi genangan air tingkat sedang pada lahan bertanah {{soil_type}}. '
                    . 'Perbaiki saluran drainase segera untuk mencegah kondisi memburuk.',
                'urgency' => 'TINGGI',
                'color'   => 'amber',
                'details' => [
                    'steps' => [
                        'Bersihkan sedimen dan sampah pada saluran pembuangan utama',
                        'Periksa kemiringan saluran — pastikan air mengalir lancar keluar lahan',
                        'Perbaiki bagian tanggul atau parit yang mengalami erosi',
                        'Pantau perubahan level air setiap 6 jam dan catat hasilnya',
                    ],
                    'tools' => ['Cangkul', 'Sekop', 'Sepatu boot'],
                ],
            ],
            [
                'category' => 'Genangan - Sedikit',
                'title'    => 'Pemeriksaan Drainase: Potensi Genangan Ringan',
                'description' => 'Ditemukan genangan ringan di lahan {{location}}. '
                    . 'Lakukan pemeriksaan rutin saluran drainase untuk mencegah genangan berkembang menjadi masalah serius.',
                'urgency' => 'TERENCANA',
                'color'   => 'green',
                'details' => [
                    'steps' => [
                        'Periksa jalur aliran air dari seluruh area lahan menuju saluran pembuangan',
                        'Bersihkan daun dan ranting yang menyumbat saluran kecil',
                        'Catat lokasi genangan ringan untuk evaluasi pada musim hujan berikutnya',
                    ],
                    'tools' => ['Cangkul ringan', 'Sekop kecil', 'Buku catatan'],
                ],
            ],

            // ── KEKERINGAN ────────────────────────────────────────────
            [
                'category' => 'Kekeringan - Kering',
                'title'    => 'Irigasi Segera: Tanah dalam Kondisi Kering',
                'description' => 'Tanah lahan Anda dalam kondisi kering. Kelembapan rendah menyebabkan stres air pada tanaman '
                    . 'dan dapat berujung pada gagal panen jika tidak segera ditangani.',
                'urgency' => 'SEGERA',
                'color'   => 'red',
                'details' => [
                    'steps' => [
                        'Lakukan irigasi segera dengan volume air cukup hingga zona akar (20–30 cm)',
                        'Pasang mulsa organik untuk menekan penguapan dari permukaan tanah',
                        'Periksa sumber air irigasi — pastikan debit mencukupi kebutuhan lahan',
                        'Kurangi aktivitas pengolahan tanah saat kering untuk meminimalkan penguapan',
                        'Pertimbangkan irigasi tetes untuk efisiensi penggunaan air',
                    ],
                    'tools' => ['Sistem irigasi / gembor', 'Mulsa jerami atau plastik', 'Soil moisture meter'],
                ],
            ],
            [
                'category' => 'Kekeringan - Regosol',
                'title'    => 'Manajemen Irigasi Khusus: Tanah Regosol Berpasir',
                'description' => 'Tanah Regosol di lahan {{location}} memiliki daya simpan air yang rendah akibat teksturnya yang berpasir. '
                    . 'Meskipun tampak normal, tanah ini mudah kehilangan air dan membutuhkan irigasi lebih sering.',
                'urgency' => 'TERENCANA',
                'color'   => 'amber',
                'details' => [
                    'steps' => [
                        'Terapkan irigasi fraksional: frekuensi lebih sering dengan volume lebih kecil per sesi',
                        'Tambahkan bahan organik (kompos) untuk meningkatkan kapasitas menahan air tanah Regosol',
                        'Pasang mulsa tebal (5–10 cm) untuk menekan laju penguapan',
                        'Monitor kelembapan tanah secara rutin — jangan hanya mengandalkan tampilan permukaan',
                    ],
                    'tools' => ['Kompos organik', 'Mulsa jerami', 'Soil moisture meter', 'Jadwal irigasi terprogram'],
                ],
            ],

            // ── KONDISI TANAMAN ───────────────────────────────────────
            [
                'category' => 'Tanaman - Kritis',
                'title'    => 'Triage Tanaman: Kondisi Kritis — Tindakan Darurat',
                'description' => 'Kondisi tanaman di lahan {{location}} dilaporkan KRITIS. Identifikasi penyebab utama '
                    . '(penyakit, hama, kekeringan, atau genangan) dan ambil tindakan segera untuk menyelamatkan hasil panen.',
                'urgency' => 'SEGERA',
                'color'   => 'red',
                'details' => [
                    'steps' => [
                        'Lakukan survei cepat untuk menentukan penyebab utama kerusakan tanaman',
                        'Prioritaskan tindakan berdasarkan ancaman terbesar (lihat rekomendasi lain di halaman ini)',
                        'Hubungi penyuluh pertanian atau dinas terkait untuk asistensi lapangan',
                        'Dokumentasikan kondisi dengan foto untuk keperluan pelaporan dan klaim asuransi',
                        'Evaluasi kelayakan penyulaman tanaman yang tidak dapat diselamatkan',
                    ],
                    'tools' => ['Kamera / HP untuk dokumentasi', 'Kontak penyuluh pertanian', 'Alat survei lapangan'],
                ],
            ],
            [
                'category' => 'Tanaman - Kurang Baik',
                'title'    => 'Pemulihan Tanaman: Kondisi Kurang Baik',
                'description' => 'Kondisi tanaman di lahan {{location}} kurang baik dan memerlukan perhatian intensif. '
                    . 'Lakukan serangkaian tindakan perawatan untuk memulihkan vitalitas tanaman.',
                'urgency' => 'TINGGI',
                'color'   => 'amber',
                'details' => [
                    'steps' => [
                        'Periksa kebutuhan nutrisi — lakukan pemupukan susulan jika tanaman kekurangan hara',
                        'Pastikan ketersediaan air mencukupi dan sistem drainase berfungsi dengan baik',
                        'Periksa dan tangani indikasi penyakit atau hama yang menjadi penyebab kondisi kurang baik',
                        'Evaluasi kondisi tanaman setiap 3–5 hari untuk memantau pemulihan',
                    ],
                    'tools' => ['Pupuk susulan', 'Pestisida / fungisida preventif', 'Alat irigasi'],
                ],
            ],

            // ── MONITORING ────────────────────────────────────────────
            [
                'category' => 'Monitoring',
                'title'    => 'Pencatatan & Jadwalkan Observasi Berikutnya',
                'description' => 'Lakukan pencatatan menyeluruh atas kondisi dan tindakan di lahan {{location}} saat ini, '
                    . 'kemudian jadwalkan observasi berikutnya. Monitoring rutin adalah kunci keberhasilan manajemen lahan.',
                'urgency' => 'RENDAH',
                'color'   => 'green',
                'details' => [
                    'steps' => [
                        'Catat semua tindakan yang telah diambil hari ini beserta hasilnya secara rinci',
                        'Ambil foto kondisi lahan sebagai dokumentasi perkembangan',
                        'Jadwalkan observasi berikutnya dalam 7–14 hari',
                        'Review efektivitas setiap rekomendasi yang sudah dijalankan',
                        'Laporkan perkembangan ke penyuluh pertanian setempat jika ada anomali',
                    ],
                    'tools' => ['Buku catatan / aplikasi pertanian', 'Kamera dokumentasi', 'Kalender jadwal tanam'],
                ],
            ],
        ];

        foreach ($templates as $data) {
            Recommendation::updateOrCreate(
                ['category' => $data['category']],
                $data
            );
        }
    }
}
