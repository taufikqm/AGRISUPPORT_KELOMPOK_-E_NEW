<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendBroadcastNotificationJob;
use App\Models\User;
use App\Notifications\FarmerNotification;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Str;
use Inertia\Inertia;

/**
 * Sistem Notifikasi Admin (AGS-95).
 *
 * Dua sisi:
 *  - PENGIRIM: admin broadcast ke petani (send) via queue SendBroadcastNotificationJob.
 *  - PENERIMA: admin menerima notifikasi otomatis (petani_baru, observasi_masuk,
 *    anomali_cuaca, petani_tidak_aktif) — tampil di bell AdminHeader & tab Kotak Masuk.
 */
class NotificationController extends Controller
{
    /** Halaman: form broadcast + kotak masuk admin + riwayat broadcast. */
    public function index(Request $request)
    {
        return $this->renderPage($request);
    }

    /** Kirim broadcast ke target petani (dispatch ke queue). */
    public function send(Request $request)
    {
        $validated = $request->validate([
            'judul'        => 'required|string|max:150',
            'pesan'        => 'required|string|max:1000',
            'target'       => 'required|in:all,specific',
            'target_ids'   => 'required_if:target,specific|array',
            'target_ids.*' => 'integer|exists:users,id',
        ]);

        $userIds = $validated['target'] === 'all'
            ? User::where('role', 'petani')->pluck('id')->all()
            : $validated['target_ids'];

        SendBroadcastNotificationJob::dispatch($userIds, $validated['judul'], $validated['pesan']);

        return back()->with('success', 'Notifikasi berhasil dikirim ke ' . count($userIds) . ' petani.');
    }

    /** Riwayat broadcast (alias halaman). */
    public function history(Request $request)
    {
        return $this->renderPage($request);
    }

    /** Tandai satu notifikasi admin (kotak masuk) sebagai dibaca. */
    public function markAsRead(Request $request, string $id)
    {
        if (! Str::isUuid($id)) {
            abort(404);
        }

        $request->user()->notifications()->findOrFail($id)->markAsRead();

        return back();
    }

    /** Tandai semua notifikasi admin sebagai dibaca. */
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return back();
    }

    /** Jumlah belum dibaca + ringkasan terbaru untuk bell admin (JSON). */
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

    private function renderPage(Request $request)
    {
        $petani = User::where('role', 'petani')->get(['id', 'name', 'email']);

        // Kotak masuk: notifikasi yang diterima admin ini.
        $kotakMasuk = $request->user()->notifications()
            ->latest()
            ->get()
            ->map(fn ($n) => $this->transform($n));

        // Riwayat broadcast: notifikasi pesan_admin (untuk petani), dikelompokkan per kiriman.
        $history = DatabaseNotification::query()
            ->where('type', FarmerNotification::class)
            ->latest()
            ->get()
            ->filter(fn ($n) => ($n->data['type'] ?? null) === 'pesan_admin')
            ->groupBy(fn ($n) => ($n->data['title'] ?? '') . '|' . $n->created_at->format('Y-m-d H:i'))
            ->map(fn ($group) => [
                'judul'           => $group->first()->data['title'] ?? '',
                'pesan'           => $group->first()->data['message'] ?? '',
                'jumlah_penerima' => $group->count(),
                'jumlah_dibaca'   => $group->whereNotNull('read_at')->count(),
                'dikirim_pada'    => $group->first()->created_at->locale('id')->translatedFormat('d M Y, H:i'),
            ])
            ->values();

        return Inertia::render('Admin/Notifications', [
            'petani'      => $petani,
            'kotakMasuk'  => $kotakMasuk,
            'unreadCount' => $request->user()->unreadNotifications()->count(),
            'history'     => $history,
        ]);
    }

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
            'time_ago'   => $n->created_at?->locale('id')->diffForHumans(),
        ];
    }
}
