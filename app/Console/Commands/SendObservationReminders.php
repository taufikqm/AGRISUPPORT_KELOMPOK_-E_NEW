<?php

namespace App\Console\Commands;

use App\Models\FieldObservation;
use App\Models\User;
use App\Notifications\FarmerNotification;
use Illuminate\Console\Command;

/**
 * Pengingat observasi (AGS-87).
 *
 * Mengirim notifikasi `reminder_observasi` ke petani yang belum mencatat
 * kondisi lahan lebih dari 7 hari. Dijadwalkan harian (lihat routes/console.php),
 * tapi juga bisa dijalankan manual: php artisan notifikasi:reminder-observasi
 */
class SendObservationReminders extends Command
{
    protected $signature = 'notifikasi:reminder-observasi';

    protected $description = 'Kirim pengingat ke petani yang lebih dari 7 hari tidak input observasi';

    public function handle(): int
    {
        $batas    = now()->subDays(7)->toDateString();
        $terkirim = 0;

        User::where('role', 'petani')->each(function (User $user) use ($batas, &$terkirim) {
            $observasiTerakhir = FieldObservation::where('user_id', $user->id)->max('observation_date');

            // Lewati bila masih ada observasi dalam 7 hari terakhir.
            if ($observasiTerakhir !== null && $observasiTerakhir >= $batas) {
                return;
            }

            // Anti-spam: jangan kirim lagi bila pengingat sebelumnya belum dibaca.
            $sudahAdaReminder = $user->unreadNotifications()
                ->get()
                ->contains(fn ($n) => ($n->data['type'] ?? null) === 'reminder_observasi');

            if ($sudahAdaReminder) {
                return;
            }

            $user->notify(new FarmerNotification(
                type: 'reminder_observasi',
                title: 'Pengingat mencatat kondisi lahan',
                message: 'Sudah lebih dari 7 hari tidak ada catatan kondisi lahan. Yuk catat kondisi terbaru lahan Anda.',
                url: route('input-kondisi.index'),
            ));

            $terkirim++;
        });

        $this->info("Pengingat observasi terkirim: {$terkirim}");

        return self::SUCCESS;
    }
}
