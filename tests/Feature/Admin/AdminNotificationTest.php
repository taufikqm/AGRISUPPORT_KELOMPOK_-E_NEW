<?php

namespace Tests\Feature\Admin;

use App\Jobs\SendBroadcastNotificationJob;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

/**
 * PHPUnit Feature Test — Sistem Notifikasi Admin (AGS-95)
 * Assignee: Taufik
 * Command : php artisan test --filter=AdminNotificationTest
 */
class AdminNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dapat_akses_halaman_notifikasi(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.notifikasi.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Notifications')
                ->has('petani')
            );
    }

    public function test_admin_dapat_kirim_broadcast_ke_semua_petani(): void
    {
        $admin   = User::factory()->admin()->create();
        $farmers = User::factory()->count(3)->create(['role' => 'petani']);

        $this->actingAs($admin)
            ->post(route('admin.notifikasi.send'), [
                'judul'  => 'Peringatan Cuaca Ekstrem',
                'pesan'  => 'Harap siapkan lahan untuk antisipasi hujan deras.',
                'target' => 'all',
            ])
            ->assertRedirect();

        $this->assertDatabaseCount('notifications', 3);
    }

    public function test_notifikasi_tersimpan_di_database(): void
    {
        $admin  = User::factory()->admin()->create();
        $farmer = User::factory()->create(['role' => 'petani']);

        $this->actingAs($admin)
            ->post(route('admin.notifikasi.send'), [
                'judul'      => 'Test Notif',
                'pesan'      => 'Isi pesan.',
                'target'     => 'specific',
                'target_ids' => [$farmer->id],
            ])
            ->assertRedirect();

        $this->assertEquals(1, $farmer->notifications()->count());
    }

    public function test_riwayat_notifikasi_dapat_diakses(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.notifikasi.history'))
            ->assertStatus(200);
    }

    public function test_validasi_pesan_wajib_diisi(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.notifikasi.send'), [
                'judul'  => '',
                'pesan'  => '',
                'target' => 'all',
            ])
            ->assertSessionHasErrors(['pesan']);
    }

    public function test_queue_job_di_dispatch_saat_kirim_notifikasi(): void
    {
        Queue::fake();

        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.notifikasi.send'), [
                'judul'  => 'Test Queue',
                'pesan'  => 'Pesan queue.',
                'target' => 'all',
            ]);

        Queue::assertPushed(SendBroadcastNotificationJob::class);
    }

    public function test_petani_tidak_bisa_kirim_notifikasi_admin(): void
    {
        $farmer = User::factory()->create(['role' => 'petani']);

        $this->actingAs($farmer)
            ->post(route('admin.notifikasi.send'), [
                'judul'  => 'Fake',
                'pesan'  => 'Fake pesan.',
                'target' => 'all',
            ])
            ->assertRedirect(route('dashboard'));
    }

    public function test_notifikasi_admin_saat_petani_baru(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);

        app(\App\Services\AdminNotifier::class)->petaniBaru($petani);

        $this->assertTrue(
            $admin->fresh()->notifications()->get()
                ->contains(fn ($n) => ($n->data['type'] ?? null) === 'petani_baru')
        );
    }

    public function test_notifikasi_admin_saat_observasi_masuk(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        $area   = \App\Models\AgriculturalArea::factory()->for($petani)->create();
        $obs    = \App\Models\FieldObservation::factory()->forArea($area)->create();

        app(\App\Services\AdminNotifier::class)->observasiMasuk($obs);

        $this->assertTrue(
            $admin->fresh()->notifications()->get()
                ->contains(fn ($n) => ($n->data['type'] ?? null) === 'observasi_masuk')
        );
    }

    public function test_admin_dapat_tandai_notifikasi_dibaca(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        app(\App\Services\AdminNotifier::class)->petaniBaru($petani);
        $notif = $admin->notifications()->first();

        $this->actingAs($admin)
            ->post(route('admin.notifikasi.mark-read', $notif->id))
            ->assertRedirect();

        $this->assertNotNull($admin->fresh()->notifications()->first()->read_at);
    }

    public function test_admin_unread_count_mengembalikan_jumlah(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        app(\App\Services\AdminNotifier::class)->petaniBaru($petani);

        $this->actingAs($admin)
            ->getJson(route('admin.api.notifikasi.unread-count'))
            ->assertStatus(200)
            ->assertJsonStructure(['count', 'recent'])
            ->assertJson(['count' => 1]);
    }

    public function test_command_petani_tidak_aktif_notif_admin(): void
    {
        $admin            = User::factory()->admin()->create();
        $petaniTidakAktif = User::factory()->create(['role' => 'petani']);

        $this->artisan('notifikasi:admin-petani-tidak-aktif')->assertExitCode(0);

        $this->assertTrue(
            $admin->fresh()->notifications()->get()
                ->contains(fn ($n) => ($n->data['type'] ?? null) === 'petani_tidak_aktif')
        );
    }
}
