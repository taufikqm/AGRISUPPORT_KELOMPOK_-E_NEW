export default function LandingFooter() {
    return (
        <footer className="bg-white border-t border-[#e2e8f0] py-12">
            <div className="max-w-[1024px] mx-auto px-6 text-center">
                <h3 className="text-[24px] font-extrabold text-[#0f172b] mb-2">
                    AgriSupport
                </h3>
                <p className="text-[16px] font-medium text-[#62748e] mb-8">
                    Sistem Pendukung Keputusan Cerdas Pertanian
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mb-8">
                    <a href="#" className="text-[14px] md:text-[16px] font-semibold text-[#90a1b9] hover:text-[#007a55] transition-colors">
                        Kebijakan Privasi
                    </a>
                    <a href="#" className="text-[14px] md:text-[16px] font-semibold text-[#90a1b9] hover:text-[#007a55] transition-colors">
                        Syarat & Ketentuan
                    </a>
                    <a href="#" className="text-[14px] md:text-[16px] font-semibold text-[#90a1b9] hover:text-[#007a55] transition-colors">
                        Kontak
                    </a>
                </div>
                <p className="text-[14px] font-medium text-[#90a1b9]">
                    © 2026 AgriSupport. Hak Cipta Dilindungi.
                </p>
            </div>
        </footer>
    );
}
