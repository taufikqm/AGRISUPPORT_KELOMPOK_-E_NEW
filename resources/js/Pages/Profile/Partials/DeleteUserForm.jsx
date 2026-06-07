import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-xl font-bold text-red-600 mb-2">
                    Hapus Akun
                </h2>

                <p className="text-sm text-gray-500">
                    Setelah akun Anda dihapus, semua sumber daya dan datanya akan dihapus secara permanen. Sebelum menghapus akun Anda, harap unduh data atau informasi apa pun yang ingin Anda simpan.
                </p>
            </header>

            <DangerButton onClick={confirmUserDeletion} className="bg-red-600 hover:bg-red-500 rounded-xl px-6 h-11 shadow-sm">
                Hapus Akun
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-xl">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        Apakah Anda yakin ingin menghapus akun Anda?
                    </h2>

                    <p className="text-sm text-gray-500 mb-6">
                        Setelah akun Anda dihapus, semua sumber daya dan datanya akan dihapus secara permanen. Silakan masukkan kata sandi Anda untuk mengonfirmasi bahwa Anda ingin menghapus akun Anda secara permanen.
                    </p>

                    <div>
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="sr-only"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="mt-1 block w-full border-gray-300 text-gray-900 focus:border-red-500 focus:ring-red-500 rounded-xl shadow-sm"
                            isFocused
                            placeholder="Masukkan password Anda"
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2 text-red-500"
                        />
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal} className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 rounded-xl h-11 px-6 shadow-sm">
                            Batal
                        </SecondaryButton>

                        <DangerButton className="bg-red-600 hover:bg-red-500 rounded-xl px-6 h-11 shadow-sm" disabled={processing}>
                            Hapus Akun Permanen
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
