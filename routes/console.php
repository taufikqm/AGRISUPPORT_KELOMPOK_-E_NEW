<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Pengingat observasi petani (>7 hari tanpa input) — dijalankan harian.
Schedule::command('notifikasi:reminder-observasi')->dailyAt('07:00');

// Beri tahu admin tentang petani tidak aktif (>14 hari) — dijalankan mingguan.
Schedule::command('notifikasi:admin-petani-tidak-aktif')->weeklyOn(1, '08:00');
