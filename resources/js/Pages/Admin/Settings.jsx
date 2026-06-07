import { Head, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

const inputClass =
    'w-full rounded-xl bg-slate-800 border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-emerald-500 focus:border-emerald-500';

const labelClass = 'block text-sm font-semibold text-slate-200 mb-1.5';

function FieldError({ message }) {
    if (!message) return null;
    return <p className="text-xs text-red-400 mt-1">{message}</p>;
}

function SuccessNote({ show, children }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!show) return;
        setVisible(true);
        const t = setTimeout(() => setVisible(false), 4000);
        return () => clearTimeout(t);
    }, [show]);

    if (!visible) return null;
    return <span className="text-xs font-medium text-emerald-400">{children}</span>;
}

export default function Settings() {
    const { auth, status } = usePage().props;
    const user = auth?.user ?? {};

    /* ── Section 1: Informasi Profil ── */
    const profileForm = useForm({
        name:  user.name ?? '',
        email: user.email ?? '',
    });

    const submitProfile = (e) => {
        e.preventDefault();
        profileForm.patch(route('admin.pengaturan.update'), { preserveScroll: true });
    };

    /* ── Section 2: Ubah Password ── */
    const passwordForm = useForm({
        current_password:      '',
        password:              '',
        password_confirmation: '',
    });

    const submitPassword = (e) => {
        e.preventDefault();
        passwordForm.put(route('admin.pengaturan.password'), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
            onError: () => passwordForm.reset('password', 'password_confirmation'),
        });
    };

    return (
        <AdminLayout title="Pengaturan">
            <Head title="Pengaturan Admin" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full space-y-6">

                <div>
                    <h1 className="text-2xl font-bold text-white">Pengaturan Admin</h1>
                    <p className="text-sm text-slate-400">Kelola informasi profil dan keamanan akun admin Anda.</p>
                </div>

                {/* ── Section 1: Informasi Profil ── */}
                <section dusk="section-profil" className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-white">Informasi Profil</h2>
                        <p className="text-sm text-slate-400">Perbarui nama dan alamat email akun admin.</p>
                    </div>

                    <form onSubmit={submitProfile} className="space-y-4">
                        <div>
                            <label className={labelClass}>Nama Lengkap</label>
                            <input
                                dusk="input-nama"
                                type="text"
                                value={profileForm.data.name}
                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                className={inputClass}
                                autoComplete="name"
                            />
                            <FieldError message={profileForm.errors.name} />
                        </div>

                        <div>
                            <label className={labelClass}>Alamat Email</label>
                            <input
                                dusk="input-email"
                                type="email"
                                value={profileForm.data.email}
                                onChange={(e) => profileForm.setData('email', e.target.value)}
                                className={inputClass}
                                autoComplete="username"
                            />
                            <FieldError message={profileForm.errors.email} />
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                            <button
                                dusk="btn-simpan-profil"
                                type="submit"
                                disabled={profileForm.processing}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                                Simpan
                            </button>
                            <SuccessNote show={status === 'profil-tersimpan'}>✓ Profil tersimpan</SuccessNote>
                        </div>
                    </form>
                </section>

                {/* ── Section 2: Ubah Password ── */}
                <section dusk="section-password" className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-white">Ubah Password</h2>
                        <p className="text-sm text-slate-400">Gunakan password yang kuat dan unik untuk menjaga keamanan akun.</p>
                    </div>

                    <form onSubmit={submitPassword} className="space-y-4">
                        <div>
                            <label className={labelClass}>Password Saat Ini</label>
                            <input
                                dusk="input-password-lama"
                                type="password"
                                value={passwordForm.data.current_password}
                                onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                className={inputClass}
                                autoComplete="current-password"
                            />
                            <FieldError message={passwordForm.errors.current_password} />
                        </div>

                        <div>
                            <label className={labelClass}>Password Baru</label>
                            <input
                                dusk="input-password-baru"
                                type="password"
                                value={passwordForm.data.password}
                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                className={inputClass}
                                autoComplete="new-password"
                            />
                            <FieldError message={passwordForm.errors.password} />
                        </div>

                        <div>
                            <label className={labelClass}>Konfirmasi Password Baru</label>
                            <input
                                dusk="input-password-konfirmasi"
                                type="password"
                                value={passwordForm.data.password_confirmation}
                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                className={inputClass}
                                autoComplete="new-password"
                            />
                            <FieldError message={passwordForm.errors.password_confirmation} />
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                            <button
                                dusk="btn-simpan-password"
                                type="submit"
                                disabled={passwordForm.processing}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                                Simpan
                            </button>
                            <SuccessNote show={status === 'password-tersimpan'}>✓ Password tersimpan</SuccessNote>
                        </div>
                    </form>
                </section>
            </div>
        </AdminLayout>
    );
}
