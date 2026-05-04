import { Link } from '@inertiajs/react';
import LandingFooter from '@/Components/Landing/LandingFooter';

export default function KebijanPrivasi() {
    return (
        <div className="min-h-screen bg-[#f8fafc] font-['Inter',sans-serif]">
            {/* Header */}
            <header className="bg-white border-b border-[#e2e8f0] py-4 px-6">
                <div className="max-w-[1024px] mx-auto flex items-center gap-4">
                    <Link
                        href={route('landing')}
                        className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#62748e] hover:text-[#007a55] transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        Kembali ke Beranda
                    </Link>
                    <span className="text-[#e2e8f0]">|</span>
                    <span className="text-[24px] font-extrabold text-[#007a55]">AgriSupport</span>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-[800px] mx-auto px-6 py-12">
                <h1 className="text-[32px] font-extrabold text-[#0f172b] mb-2">Kebijakan Privasi</h1>
                <p className="text-[14px] text-[#90a1b9] mb-10">Terakhir diperbarui: 1 Mei 2026</p>

                <div className="space-y-8 text-[16px] text-[#374151] leading-relaxed">
                    <section>
                        <h2 className="text-[20px] font-bold text-[#0f172b] mb-3">1. Informasi yang Kami Kumpulkan</h2>
                        <p>
                            AgriSupport mengumpulkan informasi yang Anda berikan secara langsung, termasuk nama, alamat email,
                            dan data pertanian seperti lokasi lahan, data kondisi lapangan, serta hasil observasi yang Anda masukkan
                            ke dalam sistem.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-bold text-[#0f172b] mb-3">2. Penggunaan Informasi</h2>
                        <p className="mb-3">Informasi yang kami kumpulkan digunakan untuk:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Menyediakan, mengoperasikan, dan meningkatkan layanan AgriSupport</li>
                            <li>Menghasilkan analisis risiko lahan dan rekomendasi tindakan yang relevan</li>
                            <li>Mengirimkan notifikasi peringatan cuaca berdasarkan lokasi lahan Anda</li>
                            <li>Berkomunikasi dengan Anda terkait pembaruan layanan</li>
                            <li>Memenuhi kewajiban hukum yang berlaku</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-bold text-[#0f172b] mb-3">3. Penyimpanan Data</h2>
                        <p>
                            Data Anda disimpan di server yang berlokasi di Indonesia dan dilindungi menggunakan enkripsi standar
                            industri. Kami menyimpan data selama akun Anda aktif atau selama diperlukan untuk menyediakan layanan.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-bold text-[#0f172b] mb-3">4. Berbagi Informasi dengan Pihak Ketiga</h2>
                        <p>
                            AgriSupport tidak menjual, menyewakan, atau berbagi informasi pribadi Anda kepada pihak ketiga untuk
                            tujuan komersial. Data Anda hanya digunakan dalam ekosistem layanan AgriSupport dan untuk kepentingan
                            akademik pengembangan sistem.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-bold text-[#0f172b] mb-3">5. Keamanan Data</h2>
                        <p>
                            Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang wajar untuk melindungi informasi
                            Anda dari akses tidak sah, pengungkapan, perubahan, atau penghancuran yang tidak disengaja.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-bold text-[#0f172b] mb-3">6. Hak Anda</h2>
                        <p className="mb-3">Anda memiliki hak untuk:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Mengakses data pribadi yang kami simpan tentang Anda</li>
                            <li>Meminta koreksi atas data yang tidak akurat</li>
                            <li>Meminta penghapusan akun dan data Anda</li>
                            <li>Mengajukan pertanyaan terkait penggunaan data Anda</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-bold text-[#0f172b] mb-3">7. Perubahan Kebijakan</h2>
                        <p>
                            Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan signifikan akan
                            diberitahukan melalui email atau notifikasi dalam aplikasi. Penggunaan layanan secara berkelanjutan
                            setelah perubahan dianggap sebagai persetujuan atas kebijakan yang diperbarui.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-bold text-[#0f172b] mb-3">8. Hubungi Kami</h2>
                        <p>
                            Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, hubungi kami di{' '}
                            <a href="mailto:agrisupport.telyu@gmail.com" className="text-[#007a55] font-semibold hover:underline">
                                agrisupport.telyu@gmail.com
                            </a>
                        </p>
                    </section>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
