<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\FarmerNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * PHPUnit Feature Test — Sistem Notifikasi Petani (AGS-87)
 * Assignee: ketrin
 * Command : php artisan test --filter=NotificationTest
 */
class NotificationTest extends TestCase
{
    use RefreshDatabase;

    private function kirimNotifikasi(User $user, string $type = 'cuaca_ekstrem'): void
    {
        $user->notify(new FarmerNotification(
            type: $type,
            title: 'Peringatan',
            message: 'Pesan notifikasi uji.',
            url: '/dashboard',
        ));
    }

    public function test_halaman_notifikasi_dapat_diakses(): void
    {
        $farmer = User::factory()->create();
        $this->kirimNotifikasi($farmer);

        $this->actingAs($farmer)
            ->get(route('notifikasi.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Notifications')
                ->has('notifications', 1)
                ->has('unreadCount')
            );
    }

    public function test_mark_as_read_menandai_satu_notifikasi(): void
    {
        $farmer = User::factory()->create();
        $this->kirimNotifikasi($farmer);
        $notification = $farmer->notifications()->first();

        $this->actingAs($farmer)
            ->post(route('notifikasi.mark-read', $notification->id))
            ->assertRedirect();

        $this->assertNotNull($farmer->fresh()->notifications()->first()->read_at);
    }

    public function test_mark_all_as_read_menandai_semua_notifikasi(): void
    {
        $farmer = User::factory()->create();
        $this->kirimNotifikasi($farmer);
        $this->kirimNotifikasi($farmer, 'rekomendasi_baru');
        $this->kirimNotifikasi($farmer, 'risiko_meningkat');

        $this->actingAs($farmer)
            ->post(route('notifikasi.mark-all-read'))
            ->assertRedirect();

        $this->assertEquals(0, $farmer->fresh()->unreadNotifications()->count());
    }

    public function test_unread_count_mengembalikan_jumlah_yang_benar(): void
    {
        $farmer = User::factory()->create();
        $this->kirimNotifikasi($farmer);
        $this->kirimNotifikasi($farmer, 'rekomendasi_baru');
        $this->kirimNotifikasi($farmer, 'pesan_admin');

        // tandai satu sudah dibaca → sisa unread = 2
        $farmer->notifications()->first()->markAsRead();

        $this->actingAs($farmer)
            ->getJson(route('api.notifikasi.unread-count'))
            ->assertStatus(200)
            ->assertJsonStructure(['count', 'recent'])
            ->assertJson(['count' => 2]);
    }

    public function test_petani_tidak_bisa_baca_notifikasi_orang_lain(): void
    {
        $farmer1 = User::factory()->create();
        $farmer2 = User::factory()->create();
        $this->kirimNotifikasi($farmer2);
        $milikFarmer2 = $farmer2->notifications()->first();

        // id acak (bukan UUID) → 404
        $this->actingAs($farmer1)
            ->post(route('notifikasi.mark-read', 'random-id'))
            ->assertStatus(404);

        // UUID valid tapi milik petani lain → tetap 404 (scope relasi)
        $this->actingAs($farmer1)
            ->post(route('notifikasi.mark-read', $milikFarmer2->id))
            ->assertStatus(404);

        // notifikasi farmer2 tetap belum terbaca
        $this->assertNull($milikFarmer2->fresh()->read_at);
    }

    public function test_guest_diarahkan_ke_login(): void
    {
        $this->get(route('notifikasi.index'))
            ->assertRedirect(route('login'));
    }
}
