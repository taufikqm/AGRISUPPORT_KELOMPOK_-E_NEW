import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

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

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 relative flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-inter overflow-hidden">
            {/* Background Blur Elements */}
            <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#3d5a3d]/5 rounded-full blur-[64px] pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-500/5 rounded-full blur-[64px] pointer-events-none transform -translate-x-1/2 translate-y-1/4" />

            <Head title="Masuk ke Sistem" />

            <div className="w-full max-w-[448px] relative z-10 flex flex-col gap-10">
                {/* Header */}
                <div className="text-center flex flex-col gap-2">
                    <h1 className="text-4xl font-extrabold text-[#3d5a3d] tracking-tight">
                        AgriSupport
                    </h1>
                    <p className="text-sm font-medium text-slate-500">
                        Sistem Pendukung Keputusan Pertanian Berbasis Data
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-[0_25px_50px_0_rgba(0,0,0,0.1)] border border-slate-200/50 p-10 flex flex-col">
                    {status && (
                        <div className="mb-6 text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg text-center">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="flex flex-col gap-6">
                        {/* Email Input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-800" htmlFor="email">
                                Email
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                                    <EnvelopeIcon className="w-5 h-5" />
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="block w-full pl-[44px] pr-4 py-3 bg-slate-50/50 border-transparent focus:border-[#3d5a3d] focus:bg-white focus:ring-0 rounded-xl text-sm transition-colors text-slate-700 placeholder:text-slate-400"
                                    placeholder="nama@email.com"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                            {errors.email && <span className="text-red-500 text-xs font-medium">{errors.email}</span>}
                        </div>

                        {/* Password Input */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-slate-800" htmlFor="password">
                                    Kata Sandi
                                </label>
                                <Link
                                    href={route('password.request')}
                                    className="text-xs font-semibold text-[#3d5a3d] hover:text-[#2d432d] transition-colors"
                                >
                                    Lupa sandi?
                                </Link>
                            </div>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                                    <LockIcon className="w-5 h-5" />
                                </span>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="block w-full pl-[44px] pr-12 py-3 bg-slate-50/50 border-transparent focus:border-[#3d5a3d] focus:bg-white focus:ring-0 rounded-xl text-sm transition-colors text-slate-700 placeholder:text-slate-400"
                                    placeholder="Masukkan kata sandi"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
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
                            className="mt-4 w-full flex justify-center py-3.5 px-4 rounded-xl text-base font-bold tracking-wide text-white bg-[#3d5a3d] hover:bg-[#344d34] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3d5a3d] transition-all shadow-[0_10px_15px_-3px_rgba(61,90,61,0.2),0_4px_6px_-2px_rgba(61,90,61,0.1)] disabled:opacity-70"
                        >
                            {processing ? 'Memproses...' : 'Masuk ke Sistem'}
                        </button>

                        {/* Register Link */}
                        <div className="mt-4 flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-500">Belum memiliki akun? </span>
                                <Link href={route('register')} className="text-sm font-bold text-[#3d5a3d] hover:underline">
                                    Daftar akun baru
                                </Link>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-slate-300">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
                                </svg>
                                Sistem mendeteksi peran secara otomatis setelah login
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Text */}
                <div className="text-center font-medium text-xs text-slate-500 tracking-wider uppercase opacity-80 mt-2">
                    © 2026 AgriSupport • Modern Farming Tech
                </div>
            </div>
        </div>
    );
}
