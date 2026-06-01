<?php

namespace Tests\Feature;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use App\Notifications\FarmerNotification;
use App\Services\NotificationTriggerService;
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

    private function punyaNotifikasi(User $user, string $type): bool
    {
        return $user->fresh()->notifications()->get()
            ->contains(fn ($n) => ($n->data['type'] ?? null) === $type);
    }

    public function test_trigger_cuaca_ekstrem(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();
        $obs    = FieldObservation::factory()->forArea($area)->create([
            'weather_precip_mm' => 50,
            'weather_wind_kph'  => 5,
        ]);

        app(NotificationTriggerService::class)->afterObservation($obs);

        $this->assertTrue($this->punyaNotifikasi($farmer, 'cuaca_ekstrem'));
    }

    public function test_trigger_risiko_meningkat(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();

        FieldObservation::factory()->forArea($area)->create([
            'observation_date'   => now()->subDays(5)->toDateString(),
            'soil_moisture'      => 'Normal',
            'water_puddle'       => 'Tidak Ada',
            'disease_indication' => 'Tidak Ada',
            'pest_indication'    => 'Tidak Ada',
            'crop_condition'     => 'Baik',
            'weather_precip_mm'  => 0,
            'weather_wind_kph'   => 0,
            'weather_soil_moisture' => 0.5,
        ]);

        $baru = FieldObservation::factory()->forArea($area)->create([
            'observation_date'   => now()->toDateString(),
            'soil_moisture'      => 'Kering',
            'water_puddle'       => 'Banyak',
            'disease_indication' => 'Berat',
            'pest_indication'    => 'Berat',
            'crop_condition'     => 'Kritis',
            'weather_precip_mm'  => 0,
            'weather_wind_kph'   => 0,
            'weather_soil_moisture' => 0.1,
        ]);

        app(NotificationTriggerService::class)->afterObservation($baru);

        $this->assertTrue($this->punyaNotifikasi($farmer, 'risiko_meningkat'));
    }

    public function test_trigger_rekomendasi_baru(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create();
        $obs    = FieldObservation::factory()->forArea($area)->create();

        app(NotificationTriggerService::class)->afterObservation($obs);

        $this->assertTrue($this->punyaNotifikasi($farmer, 'rekomendasi_baru'));
    }

    public function test_reminder_observasi_untuk_petani_tidak_aktif(): void
    {
        $tanpaObservasi  = User::factory()->create();
        $denganObservasi = User::factory()->create();
        $area            = AgriculturalArea::factory()->for($denganObservasi)->create();
        FieldObservation::factory()->forArea($area)->create([
            'observation_date' => now()->toDateString(),
        ]);

        $this->artisan('notifikasi:reminder-observasi')->assertExitCode(0);

        $this->assertTrue($this->punyaNotifikasi($tanpaObservasi, 'reminder_observasi'));
        $this->assertFalse($this->punyaNotifikasi($denganObservasi, 'reminder_observasi'));
    }
}
