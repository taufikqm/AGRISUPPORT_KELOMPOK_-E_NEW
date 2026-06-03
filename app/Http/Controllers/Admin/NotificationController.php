<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendBroadcastNotificationJob;
use App\Models\User;
use App\Notifications\FarmerNotification;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Inertia;

/**
 * Sistem Notifikasi Admin (AGS-95).
 *
 * Admin mengirim broadcast ke semua / sebagian petani. Notifikasi dikirim
 * lewat queue (SendBroadcastNotificationJob) memakai FarmerNotification
 * bertipe `pesan_admin` — sisi penerima (bell, dropdown, halaman) sudah ada di AGS-87.
 */
class NotificationController extends Controller
{
    /** Halaman kirim notifikasi + riwayat broadcast. */
    public function index(Request $request)
    {
        return $this->renderPage();
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

    /** Riwayat broadcast yang sudah dikirim. */
    public function history(Request $request)
    {
        return $this->renderPage();
    }

    private function renderPage()
    {
        $petani = User::where('role', 'petani')->get(['id', 'name', 'email']);

        // Riwayat broadcast: kelompokkan notifikasi pesan_admin per judul + waktu kirim.
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
            'petani'  => $petani,
            'history' => $history,
        ]);
    }
}
