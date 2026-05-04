import { Link } from '@inertiajs/react';
import LandingFooter from '@/Components/Landing/LandingFooter';

function ContactCard({ icon, title, value, href }) {
    const content = (
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 flex items-start gap-4 hover:border-[#007a55] hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-[#f0f9f4] rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#007a55] transition-colors">
                <span className="text-[#007a55] group-hover:text-white transition-colors">{icon}</span>
            </div>
            <div>
                <p className="text-[13px] font-semibold text-[#90a1b9] uppercase tracking-wide mb-1">{title}</p>
                <p className="text-[16px] font-bold text-[#0f172b]">{value}</p>
            </div>
        </div>
    );

    if (href) {
        return <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>;
    }
    return content;
}

export default function Kontak() {
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
                <h1 className="text-[32px] font-extrabold text-[#0f172b] mb-2">Kontak Kami</h1>
                <p className="text-[16px] text-[#62748e] mb-10">
                    Ada pertanyaan, masukan, atau kendala? Jangan ragu untuk menghubungi tim kami.
                </p>

                {/* Contact Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                    <ContactCard
                        icon={
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                            </svg>
                        }
                        title="Email"
                        value="agrisupport.telyu@gmail.com"
                        href="mailto:agrisupport.telyu@gmail.com"
                    />
                    <ContactCard
                        icon={
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253" />
                            </svg>
                        }
                        title="Institusi"
                        value="Telkom University, Bandung"
                    />
                    <ContactCard
                        icon={
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                            </svg>
                        }
                        title="GitHub"
                        value="github.com/taufikqm/KELOMPOK_E_AGRISUPPORT"
                        href="https://github.com/taufikqm/KELOMPOK_E_AGRISUPPORT"
                    />
                    <ContactCard
                        icon={
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                        }
                        title="Lokasi"
                        value="Bandung, Jawa Barat, Indonesia"
                    />
                </div>

                {/* Tim Section */}
                <div className="bg-white border border-[#e2e8f0] rounded-2xl p-8">
                    <h2 className="text-[20px] font-bold text-[#0f172b] mb-6">Tim Pengembang — Kelompok E</h2>
                    <div className="space-y-4">
                        {[
                            { name: 'Taufik Qurohman', role: 'Project Manager & Backend Developer' },
                            { name: 'Arjuna Yadi',     role: 'Backend Developer' },
                            { name: 'Ketrin Fransiska', role: 'Frontend Developer' },
                            { name: 'Dimas',           role: 'Frontend Developer' },
                            { name: 'Bintang',         role: 'UI/UX Designer' },
                        ].map((member) => (
                            <div key={member.name} className="flex items-center gap-4 py-3 border-b border-[#f1f5f9] last:border-0">
                                <div className="w-10 h-10 bg-[#f0f9f4] rounded-full flex items-center justify-center shrink-0">
                                    <span className="text-[14px] font-bold text-[#007a55]">
                                        {member.name.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[15px] font-bold text-[#0f172b]">{member.name}</p>
                                    <p className="text-[13px] text-[#62748e]">{member.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
