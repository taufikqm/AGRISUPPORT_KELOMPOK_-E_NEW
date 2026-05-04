import { Link } from '@inertiajs/react';
import LandingFooter from '@/Components/Landing/LandingFooter';

function ContactCard({ icon, title, value, href }) {
    const content = (
        <div className="bg-white/10 border border-white/20 rounded-2xl p-5 flex items-start gap-4 hover:bg-white/20 hover:border-white/30 transition-all group">
            <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#00d492]/20 transition-colors">
                <span className="text-white/70 group-hover:text-[#00d492] transition-colors">{icon}</span>
            </div>
            <div>
                <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wide mb-1">{title}</p>
                <p className="text-[14px] font-bold text-white">{value}</p>
            </div>
        </div>
    );

    if (href) return <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>;
    return content;
}

export default function Kontak() {
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
                    <h1 className="text-[30px] font-extrabold text-white mb-2">Kontak Kami</h1>
                    <p className="text-[15px] text-white/60 mb-10">
                        Ada pertanyaan, masukan, atau kendala? Jangan ragu untuk menghubungi tim kami.
                    </p>

                    {/* Contact Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ContactCard
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>}
                            title="Email"
                            value="agrisupport.telyu@gmail.com"
                            href="mailto:agrisupport.telyu@gmail.com"
                        />
                        <ContactCard
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253" /></svg>}
                            title="Institusi"
                            value="Telkom University, Bandung"
                        />
                        <ContactCard
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" /></svg>}
                            title="GitHub"
                            value="KELOMPOK_E_AGRISUPPORT"
                            href="https://github.com/taufikqm/KELOMPOK_E_AGRISUPPORT"
                        />
                        <ContactCard
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>}
                            title="Lokasi"
                            value="Bandung, Jawa Barat, Indonesia"
                        />
                    </div>

                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
