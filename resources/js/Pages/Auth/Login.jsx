import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const BG_IMAGES = [
    '/images/backgrounds/bg1.jpg',
    '/images/backgrounds/bg2.png',
    '/images/backgrounds/bg3.png',
    '/images/backgrounds/bg4.png',
    '/images/backgrounds/bg5.jpg',
    '/images/backgrounds/bg6.jpg',
];

const EnvelopeIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
);

const LockIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
);

const EyeIcon = ({ className, show }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        {show ? (
            <>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </>
        ) : (
            <>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </>
        )}
    </svg>
);

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true, // Default to true based on typical modern patterns
    });

    const [showPassword, setShowPassword] = useState(false);
    const [currentBg, setCurrentBg] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % BG_IMAGES.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center font-inter py-12 px-4 sm:px-6">
            <Head title="Masuk ke Sistem" />

            {/* Slideshow Background */}
            {BG_IMAGES.map((src, i) => (
                <img
                    key={src}
                    src={src}
                    alt="Agricultural landscape"
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out"
                    style={{ opacity: i === currentBg ? 1 : 0 }}
                />
            ))}
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-[#1a3318]/65" />

            {/* Form Container */}
            <div className="w-full max-w-[440px] relative z-10 flex flex-col gap-7">
                {/* Header */}
                <div className="text-center flex flex-col items-center gap-3">
                    <img src="/images/logo-icon.png" alt="AgriSupport" className="h-20 w-20 object-contain drop-shadow-lg" />
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                            Masuk ke Sistem
                        </h1>
                        <p className="text-sm font-medium text-white/70 mt-1">
                            Silakan masuk untuk melanjutkan
                        </p>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white/35 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-8 sm:p-10 flex flex-col">
                    {status && (
                        <div className="mb-6 text-sm font-medium text-green-600 bg-green-50/80 p-3 rounded-lg text-center">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="flex flex-col gap-5">
                        {/* Email Input */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-[#1a3318]" htmlFor="email">
                                Email
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#2D5A27]/50">
                                    <EnvelopeIcon className="w-5 h-5" />
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="block w-full pl-[44px] pr-4 py-3 bg-white/90 border border-white/60 focus:border-[#2D5A27]/50 focus:bg-white focus:ring-1 focus:ring-[#2D5A27]/20 rounded-xl text-sm transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                                    placeholder="nama@email.com"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                            {errors.email && <span className="text-red-500 text-xs font-medium">{errors.email}</span>}
                        </div>

                        {/* Password Input */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-[#1a3318]" htmlFor="password">
                                    Kata Sandi
                                </label>
                                <Link
                                    href={route('password.request')}
                                    className="text-xs font-semibold text-[#2D5A27]/80 hover:text-[#2D5A27] transition-colors"
                                >
                                    Lupa sandi?
                                </Link>
                            </div>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#2D5A27]/50">
                                    <LockIcon className="w-5 h-5" />
                                </span>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="block w-full pl-[44px] pr-12 py-3 bg-white/90 border border-white/60 focus:border-[#2D5A27]/50 focus:bg-white focus:ring-1 focus:ring-[#2D5A27]/20 rounded-xl text-sm transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                                    placeholder="Masukkan kata sandi"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#2D5A27]/40 hover:text-[#2D5A27]/70 transition-colors focus:outline-none"
                                >
                                    <EyeIcon className="w-5 h-5" show={showPassword} />
                                </button>
                            </div>
                            {errors.password && <span className="text-red-500 text-xs font-medium">{errors.password}</span>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-2 w-full flex justify-center py-3.5 px-4 rounded-xl text-base font-bold tracking-wide text-white bg-[#2D5A27] hover:bg-[#234a1f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D5A27] transition-all shadow-lg shadow-[#2D5A27]/25 disabled:opacity-70"
                        >
                            {processing ? 'Memproses...' : 'Masuk ke Sistem'}
                        </button>

                        {/* Register Link */}
                        <div className="mt-2 flex flex-col items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm text-[#1a3318]/60">Belum memiliki akun?</span>
                                <Link href={route('register')} className="text-sm font-bold text-[#2D5A27] hover:underline">
                                    Daftar akun baru
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-white/50 font-medium tracking-wider uppercase">
                    © 2026 AgriSupport • Smart Farming
                </div>
            </div>
        </div>
    );
}
