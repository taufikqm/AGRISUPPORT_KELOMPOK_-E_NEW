import { LeafIcon, DatabaseIcon } from '@/Components/Landing/LandingIcons';

export default function AboutSection({ aboutRef }) {
    return (
        <section ref={aboutRef} className="bg-[#f8fafc] border-y border-[#e2e8f0] py-16 md:py-24">
            <div className="max-w-[1280px] mx-auto px-6">
                {/* Section Heading */}
                <div className="text-center mb-12">
                    <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#0f172b] leading-[1.2] mb-4">
                        Misi Kami Mengamankan Panen dari Cuaca Ekstrem
                    </h2>
                    <p className="text-[16px] md:text-[20px] font-medium leading-[1.6] text-[#45556c] max-w-[976px] mx-auto">
                        Perubahan iklim memicu cuaca ekstrem yang secara langsung mengancam ketahanan pangan dan mata pencaharian petani.{' '}
                        <span className="font-bold text-[#007a55]">AgriSupport</span>{' '}
                        mendedikasikan sistem pendukung keputusan yang mudah diakses, membantu petani mengubah ketidakpastian cuaca menjadi langkah adaptasi yang cerdas dan terukur.
                    </p>
                </div>

                {/* Vision Cards */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Card 1 */}
                    <div className="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
                        <div className="w-14 h-14 bg-[#d0fae5] rounded-2xl flex items-center justify-center mb-8">
                            <LeafIcon className="w-7 h-7 text-[#009966]" />
                        </div>
                        <h3 className="text-[24px] font-bold text-[#0f172b] mb-4 leading-[1.3]">
                            Visi Berkelanjutan
                        </h3>
                        <p className="text-[16px] font-normal leading-[1.6] text-[#45556c]">
                            Pertanian yang tangguh dimulai dari adaptasi yang cerdas. Kami merancang AgriSupport untuk membantu Anda memitigasi risiko cuaca ekstrem dan menjaga keberlanjutan hasil panen di masa depan.
                        </p>
                    </div>
                    {/* Card 2 */}
                    <div className="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
                        <div className="w-14 h-14 bg-[#d0fae5] rounded-2xl flex items-center justify-center mb-8">
                            <DatabaseIcon className="w-7 h-7 text-[#009966]" />
                        </div>
                        <h3 className="text-[24px] font-bold text-[#0f172b] mb-4 leading-[1.3]">
                            Pendekatan Hybrid Data
                        </h3>
                        <p className="text-[16px] font-normal leading-[1.6] text-[#45556c]">
                            Keputusan terbaik lahir dari data yang utuh. Kami menyatukan prakiraan cuaca global dengan laporan kondisi aktual dari lahan Anda, menghasilkan rekomendasi yang sangat presisi dan personal.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
