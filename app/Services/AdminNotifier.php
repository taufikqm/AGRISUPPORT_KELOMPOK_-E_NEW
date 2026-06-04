<?php

namespace App\Services;

use App\Models\FieldObservation;
use App\Models\User;
use App\Notifications\FarmerNotification;

/**
 * Mengirim notifikasi ke seluruh admin (AGS-95 — sisi penerima admin).
 *
 * Memakai FarmerNotification (notifikasi in-app generik) dengan tipe khusus admin:
 * petani_baru, observasi_masuk, anomali_cuaca, petani_tidak_aktif.
 */
class AdminNotifier
{
    private function notifyAdmins(string $type, string $title, string $message): void
    {
        $url = route('admin.notifikasi.index');

        User::where('role', 'admin')->each(function (User $admin) use ($type, $title, $message, $url) {
            $admin->notify(new FarmerNotification($type, $title, $message, $url));
        });
    }

    public function petaniBaru(User $petani): void
    {
        $this->notifyAdmins(
            'petani_baru',
            'Petani baru terdaftar',
            "{$petani->name} baru saja mendaftar sebagai petani.",
        );
    }

    public function observasiMasuk(FieldObservation $observation): void
    {
        $petani = $observation->user->name ?? 'Petani';
        $lahan  = $observation->agriculturalArea->name ?? 'lahan';

        $this->notifyAdmins(
            'observasi_masuk',
            'Observasi baru masuk',
            "{$petani} mencatat observasi di {$lahan}.",
        );
    }

    public function anomaliCuaca(FieldObservation $observation): void
    {
        $lahan = $observation->agriculturalArea->name ?? 'lahan';

        $this->notifyAdmins(
            'anomali_cuaca',
            'Anomali cuaca terdeteksi',
            "Cuaca ekstrem terdeteksi pada observasi di {$lahan}.",
        );
    }

    public function petaniTidakAktif(User $petani): void
    {
        $this->notifyAdmins(
            'petani_tidak_aktif',
            'Petani tidak aktif',
            "{$petani->name} tidak mencatat kondisi lahan lebih dari 14 hari.",
        );
    }
}
