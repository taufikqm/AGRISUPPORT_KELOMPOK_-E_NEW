import { Link } from '@inertiajs/react';
import { ArrowRightIcon } from '@/Components/Landing/LandingIcons';

export default function HeroSection({ auth, canLogin, scrollTo, featureRef }) {
    return (
        <section className="relative min-h-[600px] md:h-[700px] flex items-center overflow-hidden">
            {/* Background Image */}
            <img
                src="/images/landing/hero.png"
                alt="Petani modern menggunakan tablet di sawah"
                className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(15,23,43,0.9)] via-[rgba(15,23,43,0.7)] to-[rgba(15,23,43,0.3)] lg:from-[rgba(15,23,43,0.85)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,23,43,0.6)] via-transparent to-transparent" />

            {/* Hero Content */}
            <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 py-32 md:py-0">
                <div className="max-w-[640px] text-center md:text-left mx-auto md:mx-0">
                    <h1 className="text-[36px] min-[400px]:text-[42px] md:text-[60px] font-extrabold leading-[1.1] tracking-[-1px] md:tracking-[-2px] text-white mb-6">
                        Cerdas Bertani,{' '}
                        <span className="text-[#00d492]">Tangguh Hadapi</span>{' '}
                        Perubahan Iklim
                    </h1>
                    <p className="text-[16px] md:text-[20px] font-medium leading-[1.6] text-[#e2e8f0] mb-10 max-w-[576px] mx-auto md:mx-0">
                        Integrasi cerdas data cuaca terkini dan kondisi lapangan untuk memitigasi risiko pertanian. Lindungi panen Anda dengan keputusan berbasis data.
                    </p>
                    <div className="flex flex-col min-[450px]:flex-row items-center justify-center md:justify-start gap-4">
                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className="w-full min-[450px]:w-auto inline-flex items-center justify-center gap-2 bg-[#00bc7d] hover:bg-[#00a06b] text-white px-8 py-4 rounded-2xl text-[16px] font-semibold transition-all duration-200 shadow-lg shadow-[#00bc7d]/25"
                            >
                                Buka Dashboard Saya
                                <ArrowRightIcon className="w-5 h-5" />
                            </Link>
                        ) : (
                            <Link
                                href={canLogin ? route('login') : '#'}
                                className="w-full min-[450px]:w-auto inline-flex items-center justify-center gap-2 bg-[#00bc7d] hover:bg-[#00a06b] text-white px-8 py-4 rounded-2xl text-[16px] font-semibold transition-all duration-200 shadow-lg shadow-[#00bc7d]/25"
                            >
                                Buka Dashboard Saya
                                <ArrowRightIcon className="w-5 h-5" />
                            </Link>
                        )}
                        <button
                            onClick={() => scrollTo(featureRef)}
                            className="w-full min-[450px]:w-auto inline-flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-2xl text-[16px] font-semibold transition-all duration-200"
                        >
                            Pelajari Fitur
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
