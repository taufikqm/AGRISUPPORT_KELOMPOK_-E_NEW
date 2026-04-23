import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

const UserIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

const EnvelopeIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill=   "none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
);

const PhoneIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.48-4.18-7.076-7.077l1.293-.97c.362-.271.527-.733.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
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

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 relative flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-inter overflow-hidden">
            {/* Background Blur Elements */}
            <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#3d5a3d]/5 rounded-full blur-[64px] pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-500/5 rounded-full blur-[64px] pointer-events-none transform -translate-x-1/2 translate-y-1/4" />

            <Head title="Daftar Akun Baru" />

            <div className="w-full max-w-[448px] relative z-10 flex flex-col gap-8">
                {/* Header */}
                <div className="text-center flex flex-col gap-2">
                    <h1 className="text-3xl font-extrabold text-[#3d5a3d] tracking-tight">
                        Daftar Akun Baru
                    </h1>
                    <p className="text-sm font-medium text-slate-500">
                        Bergabung dengan AgriSupport sekarang
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-[0_25px_50px_0_rgba(0,0,0,0.1)] border border-slate-200/50 p-8 sm:p-10 flex flex-col">
                    <form onSubmit={submit} className="flex flex-col gap-5">
                        
                        {/* Name Input */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-800" htmlFor="name">
                                Nama Lengkap
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                                    <UserIcon className="w-4 h-4" />
                                </span>
                                <input
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border-transparent focus:border-[#3d5a3d] focus:bg-white focus:ring-0 rounded-xl text-sm transition-colors text-slate-700 placeholder:text-slate-400"
                                    placeholder="Masukkan nama lengkap"
                                    required
                                    autoComplete="name"
                                />
                            </div>
                            {errors.name && <span className="text-red-500 text-xs font-medium">{errors.name}</span>}
                        </div>

                        {/* Email Input */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-800" htmlFor="email">
                                Email
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                                    <EnvelopeIcon className="w-4 h-4" />
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border-transparent focus:border-[#3d5a3d] focus:bg-white focus:ring-0 rounded-xl text-sm transition-colors text-slate-700 placeholder:text-slate-400"
                                    placeholder="nama@email.com"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                            {errors.email && <span className="text-red-500 text-xs font-medium">{errors.email}</span>}
                        </div>

                        {/* Phone Number Input */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-800" htmlFor="phone_number">
                                Nomor Telepon
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                                    <PhoneIcon className="w-4 h-4" />
                                </span>
                                <input
                                    id="phone_number"
                                    type="text"
                                    name="phone_number"
                                    value={data.phone_number}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // Auto-append +62 if they just start typing numbers, or allow them to type it
                                        if (val.length === 1 && /[0-9]/.test(val) && val !== '+') {
                                             setData('phone_number', '+62' + val);
                                        } else {
                                             setData('phone_number', val);
                                        }
                                    }}
                                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border-transparent focus:border-[#3d5a3d] focus:bg-white focus:ring-0 rounded-xl text-sm transition-colors text-slate-700 placeholder:text-slate-400"
                                    placeholder="+628123456789"
                                    required
                                />
                            </div>
                            {errors.phone_number && <span className="text-red-500 text-xs font-medium">{errors.phone_number}</span>}
                        </div>

                        {/* Password Input */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-800" htmlFor="password">
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                                    <LockIcon className="w-4 h-4" />
                                </span>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="block w-full pl-10 pr-12 py-2.5 bg-slate-50/50 border-transparent focus:border-[#3d5a3d] focus:bg-white focus:ring-0 rounded-xl text-sm transition-colors text-slate-700 placeholder:text-slate-400"
                                    placeholder="Minimal 8 karakter"
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                >
                                    <EyeIcon className="w-4 h-4" show={showPassword} />
                                </button>
                            </div>
                            {errors.password && <span className="text-red-500 text-xs font-medium">{errors.password}</span>}
                        </div>

                        {/* Password Confirmation Input */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-800" htmlFor="password_confirmation">
                                Konfirmasi Kata Sandi
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                                    <LockIcon className="w-4 h-4" />
                                </span>
                                <input
                                    id="password_confirmation"
                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="block w-full pl-10 pr-12 py-2.5 bg-slate-50/50 border-transparent focus:border-[#3d5a3d] focus:bg-white focus:ring-0 rounded-xl text-sm transition-colors text-slate-700 placeholder:text-slate-400"
                                    placeholder="Ketik ulang kata sandi"
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                >
                                    <EyeIcon className="w-4 h-4" show={showPasswordConfirmation} />
                                </button>
                            </div>
                            {errors.password_confirmation && <span className="text-red-500 text-xs font-medium">{errors.password_confirmation}</span>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-6 w-full flex justify-center py-3.5 px-4 rounded-xl text-base font-bold tracking-wide text-white bg-[#3d5a3d] hover:bg-[#344d34] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3d5a3d] transition-all shadow-[0_10px_15px_-3px_rgba(61,90,61,0.2),0_4px_6px_-2px_rgba(61,90,61,0.1)] disabled:opacity-70"
                        >
                            {processing ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                        </button>

                        {/* Login Link */}
                        <div className="mt-4 text-center">
                            <span className="text-sm font-medium text-slate-500">Sudah memiliki akun? </span>
                            <Link href={route('login')} className="text-sm font-bold text-[#3d5a3d] hover:underline">
                                Masuk di sini
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Footer Text */}
                <div className="text-center font-medium text-xs text-slate-500 opacity-80 mt-2">
                    Dengan mendaftar, Anda menyetujui syarat dan ketentuan kami
                </div>
            </div>
        </div>
    );
}
