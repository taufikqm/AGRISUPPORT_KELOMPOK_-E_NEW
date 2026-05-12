<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * ============================================================
 * STUB: NotificationController — Notifikasi Petani (AGS-87)
 * ============================================================
 * ASSIGNEE : ketrin
 * BRANCH   : feature/AGS-87-sistem-notifikasi-petani
 *
 * FILE TERKAIT:
 *   - resources/js/Pages/Notifications.jsx
 *   - app/Notifications/WeatherAlertNotification.php (buat baru)
 *
 * MODEL/TABEL:
 *   - notifications (tabel Laravel default, sudah di-migrate)
 *   - Akses via: $user->notifications, $user->unreadNotifications
 *
 * ROUTES (routes/web.php):
 *   GET  /notifikasi                   → index()
 *   POST /notifikasi/{id}/baca         → markAsRead()
 *   POST /notifikasi/baca-semua        → markAllAsRead()
 *   GET  /api/notifikasi/unread-count  → unreadCount()
 *
 * CATATAN:
 *   - Notifikasi dipicu dari WeatherController atau scheduler
 *   - unreadCount() digunakan badge di AppHeader (real-time)
 *   - Gunakan $user->notify(new WeatherAlertNotification($data))
 * ============================================================
 */
class NotificationController extends Controller
{
    /**
     * TODO: Tampilkan semua notifikasi milik user.
     * Kirim notifikasi read & unread ke halaman Notifications.jsx.
     * Gunakan Inertia::render('Notifications', ['notifications' => ...]).
     */
    public function index(Request $request)
    {
        // TODO: Implementasi di sini
    }

    /**
     * TODO: Tandai satu notifikasi sebagai sudah dibaca.
     * Gunakan $notification->markAsRead().
     * Return: back() dengan flash success.
     */
    public function markAsRead(Request $request, string $id)
    {
        // TODO: Implementasi di sini
    }

    /**
     * TODO: Tandai semua notifikasi user sebagai sudah dibaca.
     * Gunakan auth()->user()->unreadNotifications->markAsRead().
     * Return: back() dengan flash success.
     */
    public function markAllAsRead(Request $request)
    {
        // TODO: Implementasi di sini
    }

    /**
     * TODO: Kembalikan jumlah notifikasi belum dibaca (JSON).
     * Digunakan badge di header. Return: response()->json(['count' => ...]).
     */
    public function unreadCount(Request $request)
    {
        // TODO: Implementasi di sini
    }
}
