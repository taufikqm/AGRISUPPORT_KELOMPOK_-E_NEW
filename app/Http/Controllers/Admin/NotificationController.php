<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * ============================================================
 * STUB: Admin\NotificationController — Sistem Notifikasi Admin (AGS-95)
 * ============================================================
 * ASSIGNEE : Taufik
 * BRANCH   : feature/AGS-95-sistem-notifikasi-admin
 *
 * FILE TERKAIT:
 *   - resources/js/Pages/Admin/Notifications.jsx
 *   - app/Notifications/AdminBroadcastNotification.php (buat baru)
 *   - app/Jobs/SendBroadcastNotificationJob.php (buat baru, untuk queue)
 *
 * MODEL:
 *   - App\Models\User  (target penerima notifikasi)
 *   - notifications tabel (Laravel default)
 *
 * ROUTES (routes/web.php — prefix /admin):
 *   GET  /admin/notifikasi          → index()
 *   POST /admin/notifikasi/kirim    → send()
 *   GET  /admin/notifikasi/riwayat  → history()
 *
 * CATATAN:
 *   - send() dispatch Job ke queue (QUEUE_CONNECTION=sync di env testing)
 *   - Target: semua petani, atau filter by kriteria tertentu
 *   - history() tampilkan semua notifikasi yang sudah dikirim
 *   - Notifikasi masuk ke tabel 'notifications' (standar Laravel)
 * ============================================================
 */
class NotificationController extends Controller
{
    /**
     * TODO: Tampilkan halaman kirim notifikasi dengan form broadcast.
     * Kirim daftar petani untuk target filter.
     * Gunakan Inertia::render('Admin/Notifications', ['petani' => ...]).
     */
    public function index(Request $request)
    {
        // TODO: Implementasi di sini
    }

    /**
     * TODO: Kirim notifikasi broadcast ke target petani.
     * Validasi: message (wajib), target ('all' atau array user_id).
     * Dispatch SendBroadcastNotificationJob ke queue.
     * Return: back() dengan flash 'Notifikasi berhasil dikirim'.
     */
    public function send(Request $request)
    {
        // TODO: Implementasi di sini
    }

    /**
     * TODO: Tampilkan riwayat semua notifikasi yang sudah dikirim admin.
     * Gunakan Inertia::render('Admin/Notifications', ['history' => ...]).
     */
    public function history(Request $request)
    {
        // TODO: Implementasi di sini
    }
}
