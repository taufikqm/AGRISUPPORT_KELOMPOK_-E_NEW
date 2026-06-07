import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const fileInputRef = useRef(null);
    const [previewPhoto, setPreviewPhoto] = useState(
        user.profile_picture ? `/storage/${user.profile_picture}` : null
    );

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            _method: 'patch',
            name: user.name || '',
            email: user.email || '',
            phone_number: user.phone_number || '',
            address: user.address || '',
            farming_info: user.farming_info || '',
            profile_picture: null,
        });

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.update'), {
            preserveScroll: true,
        });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('profile_picture', file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewPhoto(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Informasi Profil
                </h2>
                <p className="text-sm text-gray-500">
                    Perbarui informasi profil akun Anda, foto profil, dan detail kontak usaha tani Anda.
                </p>
            </header>

            <form onSubmit={submit} className="mt-8 space-y-6">
                {/* Profile Picture Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-50 border-2 border-[#263B36]/20 flex items-center justify-center">
                            {previewPhoto ? (
                                <img src={previewPhoto} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 bg-[#263B36] hover:bg-[#1a2825] text-white p-2 rounded-full shadow-lg transition-colors border-2 border-white"
                            title="Ganti Foto"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoChange}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>
                    <div>
                        <h3 className="text-gray-800 font-bold">Foto Profil</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Format yang didukung: JPG, PNG, WEBP. Maks 2MB.
                        </p>
                        <InputError className="mt-2" message={errors.profile_picture} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel htmlFor="name" value="Nama Lengkap" className="text-gray-700 font-semibold" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full border-gray-300 text-gray-900 focus:border-[#263B36] focus:ring-[#263B36] rounded-xl shadow-sm"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email" className="text-gray-700 font-semibold" />
                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1 block w-full border-gray-300 text-gray-900 focus:border-[#263B36] focus:ring-[#263B36] rounded-xl shadow-sm bg-gray-50"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            disabled
                        />
                        <InputError className="mt-2" message={errors.email} />
                        <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah.</p>
                    </div>

                    <div>
                        <InputLabel htmlFor="phone_number" value="Nomor Telepon" className="text-gray-700 font-semibold" />
                        <TextInput
                            id="phone_number"
                            type="text"
                            className="mt-1 block w-full border-gray-300 text-gray-900 focus:border-[#263B36] focus:ring-[#263B36] rounded-xl shadow-sm"
                            value={data.phone_number}
                            onChange={(e) => setData('phone_number', e.target.value)}
                            autoComplete="tel"
                            placeholder="Contoh: 081234567890"
                        />
                        <InputError className="mt-2" message={errors.phone_number} />
                    </div>

                    <div className="md:col-span-2">
                        <InputLabel htmlFor="address" value="Alamat Lengkap" className="text-gray-700 font-semibold" />
                        <textarea
                            id="address"
                            className="mt-1 block w-full border-gray-300 text-gray-900 focus:border-[#263B36] focus:ring-[#263B36] rounded-xl shadow-sm h-24 resize-none"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder="Alamat rumah atau lokasi utama Anda"
                        ></textarea>
                        <InputError className="mt-2" message={errors.address} />
                    </div>

                    <div className="md:col-span-2">
                        <InputLabel htmlFor="farming_info" value="Informasi Usaha Tani" className="text-gray-700 font-semibold" />
                        <textarea
                            id="farming_info"
                            className="mt-1 block w-full border-gray-300 text-gray-900 focus:border-[#263B36] focus:ring-[#263B36] rounded-xl shadow-sm h-24 resize-none"
                            value={data.farming_info}
                            onChange={(e) => setData('farming_info', e.target.value)}
                            placeholder="Contoh: Fokus pada komoditas padi dan jagung di lahan kering seluas 2 hektar."
                        ></textarea>
                        <InputError className="mt-2" message={errors.farming_info} />
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <p className="text-sm text-amber-800">
                            Alamat email Anda belum diverifikasi.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-2 rounded-md font-medium text-amber-600 underline hover:text-amber-500 focus:outline-none"
                            >
                                Klik di sini untuk mengirim ulang email verifikasi.
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-[#263B36]">
                                Link verifikasi baru telah dikirim ke alamat email Anda.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <PrimaryButton disabled={processing} className="bg-[#263B36] hover:bg-[#1a2825] rounded-xl px-6 h-11 shadow-sm mt-4">
                        Simpan Profil
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
                            Tersimpan.
                        </div>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
