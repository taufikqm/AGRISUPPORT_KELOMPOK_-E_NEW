import { Link } from '@inertiajs/react';
import LandingFooter from '@/Components/Landing/LandingFooter';

export default function SyaratKetentuan() {
    return (
        <div className="min-h-screen font-['Inter',sans-serif] flex flex-col">
            {/* Background */}
            <div className="fixed inset-0 -z-10">
                <img src="/images/landing/hero.png" alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(15,23,43,0.92)] via-[rgba(15,23,43,0.80)] to-[rgba(15,23,43,0.70)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,23,43,0.70)] via-transparent to-transparent" />
            </div>

            {/* Header */}
            <header className="py-5 px-6 border-b border-white/10">
                <div className="max-w-[1024px] mx-auto flex items-center gap-4">
                    <Link
                        href={route('landing')}
                        className="inline-flex items-center gap-2 text-[14px] font-semibold text-white/70 hover:text-[#00d492] transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        Kembali ke Beranda
                    </Link>
                    <span className="text-white/20">|</span>
                    <span className="text-[22px] font-extrabold text-white">AgriSupport</span>
                </div>
            </header>

            {/* Content Card — Glassmorphism */}
            <main className="flex-1 max-w-[800px] w-full mx-auto px-6 py-12">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 md:p-12">
                    <h1 className="text-[30px] font-extrabold text-white mb-2">Syarat & Ketentuan</h1>
                    <p className="text-[14px] text-white/40 mb-10">Terakhir diperbarui: 1 Mei 2026</p>

                    <div className="space-y-8 text-[15px] leading-relaxed">
                        <section>
                            <h2 className="text-[17px] font-bold text-white mb-3">1. Penerimaan Syarat</h2>
                            <p className="text-white/70">Dengan mengakses dan menggunakan AgriSupport, Anda menyetujui untuk terikat oleh syarat dan ketentuan ini. Jika Anda tidak setuju dengan syarat ini, harap tidak menggunakan layanan kami.</p>
                        </section>

                        <section>
                            <h2 className="text-[17px] font-bold text-white mb-3">2. Deskripsi Layanan</h2>
                            <p className="text-white/70">AgriSupport adalah sistem pendukung keputusan cerdas pertanian yang dikembangkan sebagai proyek akademik oleh mahasiswa Telkom University. Layanan ini menyediakan analisis risiko lahan, rekomendasi tindakan, pemantauan cuaca, dan fitur pengelolaan pertanian lainnya.</p>
                        </section>

                        <section>
                            <h2 className="text-[17px] font-bold text-white mb-3">3. Akun Pengguna</h2>
                            <ul className="list-disc pl-6 space-y-2 text-white/70">
                                <li>Anda bertanggung jawab atas keamanan akun dan kata sandi Anda</li>
                                <li>Anda wajib memberikan informasi yang akurat dan terkini saat pendaftaran</li>
                                <li>Satu orang hanya diizinkan memiliki satu akun aktif</li>
                                <li>Kami berhak menangguhkan akun yang melanggar ketentuan ini</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-[17px] font-bold text-white mb-3">4. Penggunaan yang Diizinkan</h2>
                            <p className="text-white/70 mb-3">Anda boleh menggunakan AgriSupport untuk:</p>
                            <ul className="list-disc pl-6 space-y-2 text-white/70">
                                <li>Memantau dan mengelola kondisi lahan pertanian Anda sendiri</li>
                                <li>Mendapatkan analisis risiko dan rekomendasi tindakan pertanian</li>
                                <li>Mengakses data cuaca dan prediksi untuk keperluan pertanian</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-[17px] font-bold text-white mb-3">5. Larangan Penggunaan</h2>
                            <p className="text-white/70 mb-3">Anda dilarang:</p>
                            <ul className="list-disc pl-6 space-y-2 text-white/70">
                                <li>Menggunakan layanan untuk tujuan ilegal atau yang merugikan pihak lain</li>
                                <li>Mencoba mengakses sistem atau data pengguna lain tanpa izin</li>
                                <li>Menyebarkan konten yang bersifat menyesatkan, berbahaya, atau melanggar hukum</li>
                                <li>Melakukan rekayasa balik atau mencoba mengekstrak kode sumber aplikasi</li>
                                <li>Menggunakan layanan untuk kepentingan komersial tanpa izin tertulis</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-[17px] font-bold text-white mb-3">6. Batasan Tanggung Jawab</h2>
                            <p className="text-white/70">AgriSupport menyediakan rekomendasi berbasis data dan algoritma sebagai alat bantu pengambilan keputusan. Keputusan akhir terkait pengelolaan lahan sepenuhnya berada di tangan pengguna. Kami tidak bertanggung jawab atas kerugian yang timbul akibat keputusan yang diambil berdasarkan informasi dari sistem ini.</p>
                        </section>

                        <section>
                            <h2 className="text-[17px] font-bold text-white mb-3">7. Kekayaan Intelektual</h2>
                            <p className="text-white/70">Seluruh konten, desain, logo, dan kode AgriSupport adalah milik tim pengembang Kelompok E, Telkom University. Anda tidak diizinkan untuk menyalin, mendistribusikan, atau memodifikasi konten tersebut tanpa izin tertulis.</p>
                        </section>

                        <section>
                            <h2 className="text-[17px] font-bold text-white mb-3">8. Perubahan Layanan</h2>
                            <p className="text-white/70">Kami berhak mengubah, menangguhkan, atau menghentikan layanan kapan saja tanpa pemberitahuan sebelumnya. Kami juga dapat memperbarui syarat dan ketentuan ini. Penggunaan layanan secara berkelanjutan setelah perubahan dianggap sebagai persetujuan atas syarat yang diperbarui.</p>
                        </section>

                        <section>
                            <h2 className="text-[17px] font-bold text-white mb-3">9. Hukum yang Berlaku</h2>
                            <p className="text-white/70">Syarat dan ketentuan ini diatur oleh hukum Republik Indonesia. Setiap perselisihan akan diselesaikan melalui musyawarah, dan jika tidak tercapai kesepakatan, akan diselesaikan melalui jalur hukum yang berlaku di Indonesia.</p>
                        </section>

                        <section>
                            <h2 className="text-[17px] font-bold text-white mb-3">10. Hubungi Kami</h2>
                            <p className="text-white/70">
                                Untuk pertanyaan terkait syarat dan ketentuan ini, hubungi kami di{' '}
                                <a href="mailto:agrisupport.telyu@gmail.com" className="text-[#00d492] font-semibold hover:underline">
                                    agrisupport.telyu@gmail.com
                                </a>
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
