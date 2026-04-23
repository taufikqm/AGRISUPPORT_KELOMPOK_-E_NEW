import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { MenuIcon, XIcon } from '@/Components/Landing/LandingIcons';

export default function LandingNavbar({ auth, canLogin, canRegister, scrolled, scrollTo, aboutRef, featureRef, modulRef, testimoniRef }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { label: 'Tentang', ref: aboutRef },
        { label: 'Fitur', ref: featureRef },
        { label: 'Modul', ref: modulRef },
        { label: 'Testimoni', ref: testimoniRef },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
            scrolled
                ? 'bg-white/95 backdrop-blur-md border-b border-[#e2e8f0] shadow-sm py-3'
                : 'bg-transparent py-5'
        }`}>
            <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[20px] md:text-[24px] font-extrabold tracking-[-0.6px] transition-colors duration-300 ${
                        (scrolled || isMenuOpen) ? 'text-[#007a55]' : 'text-white'
                    }`}>
                        AgriSupport
                    </span>
                </div>

                {/* Desktop Nav Links */}
                <div className="hidden lg:flex items-center gap-8">
                    {navLinks.map(item => (
                        <button
                            key={item.label}
                            onClick={() => scrollTo(item.ref)}
                            className={`text-[14px] font-semibold transition-colors duration-300 hover:opacity-80 ${
                                scrolled ? 'text-[#45556c]' : 'text-white/90'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Desktop Auth & Mobile Toggle */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-3">
                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className="bg-[#009966] text-white px-5 py-2 rounded-xl text-[14px] font-semibold shadow-md hover:bg-[#007a55] transition-colors"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                {canRegister && (
                                    <Link
                                        href={route('register')}
                                        className={`px-4 py-2 rounded-xl text-[14px] font-semibold border transition-all duration-300 ${
                                            scrolled
                                                ? 'border-[#009966] text-[#007a55] hover:bg-[#f0fdf4]'
                                                : 'border-white/30 text-white hover:bg-white/10'
                                        }`}
                                    >
                                        Daftar
                                    </Link>
                                )}
                                {canLogin && (
                                    <Link
                                        href={route('login')}
                                        className="bg-[#009966] text-white px-4 py-2 rounded-xl text-[14px] font-semibold shadow-md hover:bg-[#007a55] transition-colors"
                                    >
                                        Masuk
                                    </Link>
                                )}
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`p-2 rounded-lg transition-colors lg:hidden ${
                            (scrolled || isMenuOpen) ? 'text-[#45556c] hover:bg-gray-100' : 'text-white hover:bg-white/10'
                        }`}
                    >
                        {isMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            <div className={`lg:hidden fixed inset-x-0 top-[60px] md:top-[72px] bg-white border-b border-gray-200 transition-all duration-300 origin-top overflow-hidden z-40 ${
                isMenuOpen ? 'max-h-[500px] opacity-100 py-6' : 'max-h-0 opacity-0 py-0'
            }`}>
                <div className="px-6 space-y-4">
                    {navLinks.map(item => (
                        <button
                            key={item.label}
                            onClick={() => {
                                setIsMenuOpen(false);
                                setTimeout(() => scrollTo(item.ref), 300);
                            }}
                            className="block w-full text-left text-[16px] font-semibold text-[#45556c] py-2 border-b border-gray-50 last:border-0"
                        >
                            {item.label}
                        </button>
                    ))}
                    <div className="pt-4 flex flex-col gap-3 sm:hidden">
                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className="w-full text-center bg-[#009966] text-white py-3 rounded-xl text-[16px] font-semibold"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('register')}
                                    className="w-full text-center border border-[#009966] text-[#007a55] py-3 rounded-xl text-[16px] font-semibold"
                                >
                                    Daftar
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="w-full text-center bg-[#009966] text-white py-3 rounded-xl text-[16px] font-semibold"
                                >
                                    Masuk
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
