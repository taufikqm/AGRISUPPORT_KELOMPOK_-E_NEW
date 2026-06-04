<?php

namespace App\Console\Commands;

use App\Models\FieldObservation;
use App\Models\User;
use App\Services\AdminNotifier;
use Illuminate\Console\Command;

/**
 * Memberi tahu admin tentang petani yang tidak mencatat observasi > 14 hari (AGS-95).
 * Dijadwalkan mingguan (lihat routes/console.php); bisa dijalankan manual:
 * php artisan notifikasi:admin-petani-tidak-aktif
 */
class NotifyAdminInactiveFarmers extends Command
{
    protected $signature = 'notifikasi:admin-petani-tidak-aktif';

    protected $description = 'Beri tahu admin tentang petani yang tidak mencatat observasi lebih dari 14 hari';

    public function handle(AdminNotifier $notifier): int
    {
        $batas  = now()->subDays(14)->toDateString();
        $jumlah = 0;

        User::where('role', 'petani')->each(function (User $petani) use ($batas, $notifier, &$jumlah) {
            $terakhir = FieldObservation::where('user_id', $petani->id)->max('observation_date');

            // Lewati petani yang masih aktif (ada observasi dalam 14 hari terakhir).
            if ($terakhir !== null && $terakhir >= $batas) {
                return;
            }

            $notifier->petaniTidakAktif($petani);
            $jumlah++;
        });

        $this->info("Notifikasi 'petani tidak aktif' dikirim ke admin untuk {$jumlah} petani.");

        return self::SUCCESS;
    }
}
