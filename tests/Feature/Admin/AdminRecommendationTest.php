<?php

namespace Tests\Feature\Admin;

use App\Models\ActionLog;
use App\Models\AgriculturalArea;
use App\Models\Recommendation;
use App\Models\User;
use App\Notifications\FarmerNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * PHPUnit Feature Test — Manajemen Rekomendasi Admin (AGS-92)
 * Assignee: Daenisty
 * Command : php artisan test --filter=AdminRecommendationTest
 */
class AdminRecommendationTest extends TestCase
{
    use RefreshDatabase;

    private function makeManualLog(User $petani, ?AgriculturalArea $area = null): ActionLog
    {
        $area ??= AgriculturalArea::factory()->for($petani)->create();
        $rec   = Recommendation::create([
            'category' => 'Manual', 'title' => 'Rekomendasi Manual Admin',
            'description' => 'Isi rekomendasi.', 'urgency' => 'TINGGI', 'color' => 'blue',
        ]);

        return ActionLog::create([
            'user_id'              => $petani->id,
            'recommendation_id'    => $rec->id,
            'agricultural_area_id' => $area->id,
            'action_type'          => 'manual',
            'performed_at'         => now(),
        ]);
    }

    // ── Akses ────────────────────────────────────────────────────────────────

    public function test_admin_dapat_akses_halaman_manajemen_rekomendasi(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.rekomendasi.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/RecommendationManagement')
                ->has('logs')
                ->has('petani')
                ->has('areas')
            );
    }

    public function test_petani_tidak_bisa_akses_halaman_manajemen_rekomendasi(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'petani']))
            ->get(route('admin.rekomendasi.index'))
            ->assertRedirect();
    }

    public function test_guest_diarahkan_ke_login(): void
    {
        $this->get(route('admin.rekomendasi.index'))->assertRedirect();
    }

    // ── Store ─────────────────────────────────────────────────────────────────

    public function test_admin_dapat_tambah_rekomendasi_manual(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        $area   = AgriculturalArea::factory()->for($petani)->create();

        Notification::fake();

        $this->actingAs($admin)
            ->post(route('admin.rekomendasi.store'), [
                'user_id'     => $petani->id,
                'area_id'     => $area->id,
                'description' => 'Segera perbaiki drainase lahan sebelum musim hujan.',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('recommendations', [
            'category'    => 'Manual',
            'description' => 'Segera perbaiki drainase lahan sebelum musim hujan.',
        ]);
        $this->assertDatabaseHas('action_logs', [
            'user_id'              => $petani->id,
            'agricultural_area_id' => $area->id,
            'action_type'          => 'manual',
        ]);
    }

    public function test_store_mengirim_notifikasi_ke_petani(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        $area   = AgriculturalArea::factory()->for($petani)->create();

        Notification::fake();

        $this->actingAs($admin)
            ->post(route('admin.rekomendasi.store'), [
                'user_id'     => $petani->id,
                'area_id'     => $area->id,
                'description' => 'Pastikan irigasi tersedia sebelum tanam.',
            ]);

        Notification::assertSentTo($petani, FarmerNotification::class, function ($n) {
            return $n->type === 'rekomendasi_baru';
        });
    }

    public function test_store_gagal_jika_deskripsi_kosong(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        $area   = AgriculturalArea::factory()->for($petani)->create();

        $this->actingAs($admin)
            ->postJson(route('admin.rekomendasi.store'), [
                'user_id' => $petani->id, 'area_id' => $area->id, 'description' => '',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('description');
    }

    public function test_store_gagal_jika_lahan_bukan_milik_petani(): void
    {
        $admin   = User::factory()->admin()->create();
        $petani1 = User::factory()->create(['role' => 'petani']);
        $petani2 = User::factory()->create(['role' => 'petani']);
        $area    = AgriculturalArea::factory()->for($petani2)->create();

        $this->actingAs($admin)
            ->post(route('admin.rekomendasi.store'), [
                'user_id' => $petani1->id, 'area_id' => $area->id, 'description' => 'Test.',
            ])
            ->assertSessionHasErrors('area_id');
    }

    // ── Filter ────────────────────────────────────────────────────────────────

    public function test_filter_berdasarkan_petani_hanya_tampil_log_petani_tersebut(): void
    {
        $admin   = User::factory()->admin()->create();
        $petani1 = User::factory()->create(['role' => 'petani']);
        $petani2 = User::factory()->create(['role' => 'petani']);
        $rec = Recommendation::create([
            'category' => 'Manual', 'title' => 'T', 'description' => 'd', 'urgency' => 'TINGGI', 'color' => 'blue',
        ]);
        ActionLog::create(['user_id' => $petani1->id, 'recommendation_id' => $rec->id, 'action_type' => 'manual', 'performed_at' => now()]);
        ActionLog::create(['user_id' => $petani2->id, 'recommendation_id' => $rec->id, 'action_type' => 'manual', 'performed_at' => now()]);

        $this->actingAs($admin)
            ->get(route('admin.rekomendasi.index', ['petani' => $petani1->id]))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->where('logs.data.0.user_id', $petani1->id)
                ->where('logs.total', 1)
            );
    }

    public function test_filter_berdasarkan_status_sistem_hanya_tampil_completion(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        $rec = Recommendation::create([
            'category' => 'Penyakit', 'title' => 'Rek Sistem', 'description' => 'd', 'urgency' => 'SEGERA', 'color' => 'red',
        ]);
        ActionLog::create(['user_id' => $petani->id, 'recommendation_id' => $rec->id, 'action_type' => 'completion', 'performed_at' => now()]);
        ActionLog::create(['user_id' => $petani->id, 'recommendation_id' => $rec->id, 'action_type' => 'manual', 'performed_at' => now()]);

        $this->actingAs($admin)
            ->get(route('admin.rekomendasi.index', ['status' => 'completion']))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->where('logs.total', 1));
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public function test_admin_dapat_edit_rekomendasi_manual(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        $log    = $this->makeManualLog($petani);

        $this->actingAs($admin)
            ->put(route('admin.rekomendasi.update', $log->id), [
                'description' => 'Deskripsi rekomendasi yang sudah diperbarui.',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('recommendations', [
            'id'          => $log->recommendation_id,
            'description' => 'Deskripsi rekomendasi yang sudah diperbarui.',
        ]);
    }

    public function test_admin_tidak_bisa_edit_rekomendasi_sistem(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        $rec    = Recommendation::create([
            'category' => 'Penyakit', 'title' => 'Rek Sistem', 'description' => 'desc awal', 'urgency' => 'SEGERA', 'color' => 'red',
        ]);
        $log = ActionLog::create([
            'user_id' => $petani->id, 'recommendation_id' => $rec->id,
            'action_type' => 'completion', 'performed_at' => now(),
        ]);

        $this->actingAs($admin)
            ->put(route('admin.rekomendasi.update', $log->id), ['description' => 'Coba ubah.'])
            ->assertStatus(404);
    }

    // ── Destroy ───────────────────────────────────────────────────────────────

    public function test_admin_dapat_hapus_rekomendasi_manual(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        $log    = $this->makeManualLog($petani);
        $recId  = $log->recommendation_id;

        $this->actingAs($admin)
            ->delete(route('admin.rekomendasi.destroy', $log->id))
            ->assertRedirect();

        $this->assertDatabaseMissing('action_logs', ['id' => $log->id]);
        $this->assertDatabaseMissing('recommendations', ['id' => $recId]);
    }

    public function test_admin_tidak_bisa_hapus_rekomendasi_sistem(): void
    {
        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        $rec    = Recommendation::create([
            'category' => 'Penyakit', 'title' => 'Rek Sistem', 'description' => 'desc', 'urgency' => 'SEGERA', 'color' => 'red',
        ]);
        $log = ActionLog::create([
            'user_id' => $petani->id, 'recommendation_id' => $rec->id,
            'action_type' => 'completion', 'performed_at' => now(),
        ]);

        $this->actingAs($admin)
            ->delete(route('admin.rekomendasi.destroy', $log->id))
            ->assertStatus(404);
    }

    // ── Peringatkan (warn) ──────────────────────────────────────────────────────

    private function seedMonitoringTemplate(): void
    {
        Recommendation::create([
            'category'    => 'Monitoring',
            'title'       => 'Pemantauan Rutin',
            'description' => 'Lakukan pemantauan rutin pada lahan.',
            'urgency'     => 'RENDAH',
            'color'       => 'gray',
            'details'     => ['steps' => ['Cek kondisi lahan secara berkala.']],
        ]);
    }

    public function test_peringatkan_mengirim_notifikasi_ke_petani_yang_punya_rekomendasi_belum_selesai(): void
    {
        $this->seedMonitoringTemplate();

        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']);
        $area   = AgriculturalArea::factory()->for($petani)->create();
        \App\Models\FieldObservation::factory()->forArea($area)->create();

        Notification::fake();

        $this->actingAs($admin)
            ->post(route('admin.rekomendasi.warn'))
            ->assertRedirect();

        Notification::assertSentTo($petani, FarmerNotification::class, function ($n) {
            return $n->type === 'peringatan_rekomendasi';
        });
    }

    public function test_peringatkan_tidak_mengirim_ke_petani_tanpa_observasi(): void
    {
        $this->seedMonitoringTemplate();

        $admin  = User::factory()->admin()->create();
        $petani = User::factory()->create(['role' => 'petani']); // tanpa observasi

        Notification::fake();

        $this->actingAs($admin)
            ->post(route('admin.rekomendasi.warn'))
            ->assertRedirect();

        Notification::assertNotSentTo($petani, FarmerNotification::class);
    }

    public function test_petani_tidak_bisa_memicu_peringatkan(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'petani']))
            ->post(route('admin.rekomendasi.warn'))
            ->assertRedirect(route('dashboard'));
    }
}
