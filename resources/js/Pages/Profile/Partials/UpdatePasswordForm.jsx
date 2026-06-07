import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Keamanan Akun
                </h2>

                <p className="text-sm text-gray-500">
                    Pastikan akun Anda menggunakan password yang panjang, acak, dan unik agar tetap aman.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-8 space-y-6">
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Password Lama"
                        className="text-gray-700 font-semibold"
                    />

                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) =>
                            setData('current_password', e.target.value)
                        }
                        type="password"
                        className="mt-1 block w-full border-gray-300 text-gray-900 focus:border-[#263B36] focus:ring-[#263B36] rounded-xl shadow-sm"
                        autoComplete="current-password"
                        placeholder="••••••••"
                    />

                    <InputError
                        message={errors.current_password}
                        className="mt-2"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password Baru" className="text-gray-700 font-semibold" />

                    <TextInput
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="mt-1 block w-full border-gray-300 text-gray-900 focus:border-[#263B36] focus:ring-[#263B36] rounded-xl shadow-sm"
                        autoComplete="new-password"
                        placeholder="••••••••"
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Konfirmasi Password Baru"
                        className="text-gray-700 font-semibold"
                    />

                    <TextInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        type="password"
                        className="mt-1 block w-full border-gray-300 text-gray-900 focus:border-[#263B36] focus:ring-[#263B36] rounded-xl shadow-sm"
                        autoComplete="new-password"
                        placeholder="••••••••"
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <PrimaryButton disabled={processing} className="bg-[#263B36] hover:bg-[#1a2825] rounded-xl px-6 h-11 shadow-sm mt-4">
                        Simpan Password
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0 translate-y-1"
                        leave="transition ease-in-out duration-300"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <div className="flex items-center text-sm text-[#263B36] bg-[#263B36]/10 px-3 py-1.5 rounded-lg border border-[#263B36]/20 mt-4">
                            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Password diperbarui.
                        </div>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
