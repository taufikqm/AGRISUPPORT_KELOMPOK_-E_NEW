<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Tests\TestCase;

/**
 * PHPUnit Feature Test — Sistem Notifikasi Petani (AGS-87)
 * Assignee: ketrin
 * Command : php artisan test --filter=NotificationTest
 */
class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_halaman_notifikasi_dapat_diakses(): void
    {
        $farmer = User::factory()->create();

        $this->actingAs($farmer)
            ->get(route('notifikasi.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Notifications')
                ->has('notifications')
                ->has('unreadCount')
            );
    }

    public function test_mark_as_read_menandai_satu_notifikasi(): void
    {
        $farmer = User::factory()->create();
        $farmer->notify(new \Illuminate\Notifications\Messages\DatabaseMessage());
        // TODO: Ganti dengan WeatherAlertNotification setelah dibuat
        $notification = $farmer->notifications()->first();

        $this->actingAs($farmer)
            ->post(route('notifikasi.mark-read', $notification->id))
            ->assertRedirect();

        $this->assertNotNull($farmer->notifications()->first()->read_at);
    }

    public function test_mark_all_as_read_menandai_semua_notifikasi(): void
    {
        $farmer = User::factory()->create();
        // TODO: Create beberapa notifikasi unread dulu

        $this->actingAs($farmer)
            ->post(route('notifikasi.mark-all-read'))
            ->assertRedirect();

        $this->assertEquals(0, $farmer->unreadNotifications()->count());
    }

    public function test_unread_count_mengembalikan_jumlah_yang_benar(): void
    {
        $farmer = User::factory()->create();
        // TODO: Create 3 notifikasi unread

        $this->actingAs($farmer)
            ->getJson(route('api.notifikasi.unread-count'))
            ->assertStatus(200)
            ->assertJsonStructure(['count']);
    }

    public function test_petani_tidak_bisa_baca_notifikasi_orang_lain(): void
    {
        $farmer1 = User::factory()->create();
        $farmer2 = User::factory()->create();
        // TODO: buat notifikasi untuk farmer2

        // farmer1 coba akses notifikasi farmer2 — harus 403 atau 404
        $this->actingAs($farmer1)
            ->post(route('notifikasi.mark-read', 'random-id'))
            ->assertStatus(404);
    }

    public function test_guest_diarahkan_ke_login(): void
    {
        $this->get(route('notifikasi.index'))
            ->assertRedirect(route('login'));
    }
}
