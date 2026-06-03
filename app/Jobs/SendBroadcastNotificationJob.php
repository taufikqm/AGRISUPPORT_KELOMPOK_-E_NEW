<?php

namespace App\Jobs;

use App\Models\User;
use App\Notifications\FarmerNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Mengirim notifikasi broadcast admin (AGS-95) ke daftar petani secara async.
 * Memakai FarmerNotification tipe `pesan_admin` (sisi penerima sudah ada di AGS-87).
 */
class SendBroadcastNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @param  array<int>  $userIds
     */
    public function __construct(
        public array $userIds,
        public string $judul,
        public string $pesan,
    ) {}

    public function handle(): void
    {
        User::whereIn('id', $this->userIds)->each(function (User $user) {
            $user->notify(new FarmerNotification(
                type: 'pesan_admin',
                title: $this->judul,
                message: $this->pesan,
                url: route('notifikasi.index'),
            ));
        });
    }
}
