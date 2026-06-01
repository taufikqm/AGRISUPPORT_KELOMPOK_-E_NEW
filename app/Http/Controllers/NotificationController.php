<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Str;
use Inertia\Inertia;

/**
 * Sistem Notifikasi Petani (AGS-87).
 *
 * Notifikasi disimpan di tabel Laravel `notifications` dan diakses lewat
 * trait Notifiable pada model User ($user->notifications / unreadNotifications).
 *
 * Routes:
 *   GET  /notifikasi                   → index()
 *   POST /notifikasi/{id}/baca         → markAsRead()
 *   POST /notifikasi/baca-semua        → markAllAsRead()
 *   GET  /api/notifikasi/unread-count  → unreadCount()  (badge + dropdown bell)
 */
class NotificationController extends Controller
{
    /** Halaman daftar notifikasi lengkap, dengan filter tipe opsional. */
    public function index(Request $request)
    {
        $user = $request->user();
        $type = $request->query('type');

        $notifications = $user->notifications()
            ->latest()
            ->get()
            ->when($type, fn ($items) => $items->filter(
                fn ($n) => ($n->data['type'] ?? null) === $type
            )->values())
            ->map(fn ($n) => $this->transform($n));

        return Inertia::render('Notifications', [
            'notifications' => $notifications,
            'unreadCount'   => $user->unreadNotifications()->count(),
            'filterType'    => $type,
        ]);
    }

    /** Tandai satu notifikasi milik user sebagai sudah dibaca. */
    public function markAsRead(Request $request, string $id)
    {
        // Kolom id bertipe UUID di Postgres — id non-UUID harus 404, bukan error query.
        if (! Str::isUuid($id)) {
            abort(404);
        }

        // findOrFail di-scope ke relasi user → notifikasi milik orang lain otomatis 404.
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return back();
    }

    /** Tandai semua notifikasi user sebagai sudah dibaca. */
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return back();
    }

    /** Jumlah belum dibaca + ringkasan terbaru untuk badge & dropdown bell (JSON). */
    public function unreadCount(Request $request)
    {
        $user = $request->user();

        $recent = $user->notifications()
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($n) => $this->transform($n));

        return response()->json([
            'count'  => $user->unreadNotifications()->count(),
            'recent' => $recent,
        ]);
    }

    /** Bentuk konsisten satu notifikasi untuk frontend. */
    private function transform(DatabaseNotification $n): array
    {
        $data = $n->data ?? [];

        return [
            'id'         => $n->id,
            'type'       => $data['type'] ?? 'umum',
            'title'      => $data['title'] ?? 'Notifikasi',
            'message'    => $data['message'] ?? '',
            'url'        => $data['url'] ?? null,
            'read_at'    => $n->read_at,
            'created_at' => $n->created_at,
            'time_ago'   => $n->created_at?->locale('id')->diffForHumans(),
        ];
    }
}
