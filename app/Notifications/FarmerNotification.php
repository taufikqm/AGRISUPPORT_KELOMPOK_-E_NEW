<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

/**
 * Notifikasi in-app untuk petani (AGS-87).
 *
 * Disimpan ke tabel `notifications` (channel database). Satu kelas fleksibel
 * untuk semua jenis notifikasi petani: cuaca_ekstrem, rekomendasi_baru,
 * pesan_admin, reminder_observasi, risiko_meningkat.
 */
class FarmerNotification extends Notification
{
    public function __construct(
        public string $type,
        public string $title,
        public string $message,
        public ?string $url = null,
    ) {}

    /**
     * Channel pengiriman — hanya simpan ke database (in-app).
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Payload yang disimpan ke kolom `data`.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type'    => $this->type,
            'title'   => $this->title,
            'message' => $this->message,
            'url'     => $this->url,
        ];
    }
}
