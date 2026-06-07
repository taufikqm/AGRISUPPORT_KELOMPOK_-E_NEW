import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            title="Pengaturan Profil"
            currentRoute="profile.edit"
        >
            <Head title="Profil Saya" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
                
                {/* Form Group: Informasi Profil */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-2xl"
                        />
                    </div>
                </div>

                {/* Form Group: Keamanan Akun */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>
                </div>

                {/* Form Group: Hapus Akun */}
                <div className="bg-white border border-red-100 rounded-2xl shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                    <div className="p-6 sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
                
            </div>
        </AuthenticatedLayout>
    );
}
