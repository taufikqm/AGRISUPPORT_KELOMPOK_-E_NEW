<?php

namespace Tests\Feature\Admin;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * PHPUnit Feature Test — Manajemen Observasi Admin (AGS-91 / ST-02)
 * Assignee: Arjuna
 * Command : php artisan test --filter=AdminObservationManagementTest
 */
class AdminObservationManagementTest extends TestCase
{
    use RefreshDatabase;

    private function makeObservation(?User $petani = null, ?AgriculturalArea $area = null, array $attrs = []): FieldObservation
    {
        $petani ??= User::factory()->create(['role' => 'petani']);
        $area   ??= AgriculturalArea::factory()->for($petani)->create();

        return FieldObservation::factory()->forArea($area)->create($attrs);
    }

    public function test_admin_dapat_melihat_semua_observasi(): void
    {
        $admin = User::factory()->admin()->create();
        $this->makeObservation();
        $this->makeObservation();

        $this->actingAs($admin)
            ->get(route('admin.observasi.index'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/ObservationManagement')
                ->where('observations.total', 2)
            );
    }

    public function test_petani_tidak_bisa_akses_manajemen_observasi(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'petani']))
            ->get(route('admin.observasi.index'))
            ->assertRedirect(route('dashboard'));
    }

    public function test_filter_observasi_berdasarkan_petani(): void
    {
        $admin   = User::factory()->admin()->create();
        $petani1 = User::factory()->create(['role' => 'petani']);
        $petani2 = User::factory()->create(['role' => 'petani']);
        $this->makeObservation($petani1);
        $this->makeObservation($petani2);

        $this->actingAs($admin)
            ->get(route('admin.observasi.index', ['petani' => $petani1->id]))
            ->assertInertia(fn ($page) => $page->where('observations.total', 1));
    }

    public function test_filter_observasi_berdasarkan_tanggal(): void
    {
        $admin = User::factory()->admin()->create();
        $this->makeObservation(attrs: ['observation_date' => '2026-05-20']);
        $this->makeObservation(attrs: ['observation_date' => '2026-05-25']);

        $this->actingAs($admin)
            ->get(route('admin.observasi.index', ['tanggal' => '2026-05-20']))
            ->assertInertia(fn ($page) => $page->where('observations.total', 1));
    }

    public function test_detail_observasi_menyajikan_data_lengkap(): void
    {
        $admin = User::factory()->admin()->create();
        $obs   = $this->makeObservation(attrs: ['crop_condition' => 'Baik', 'weather_temp' => 30.5]);

        $this->actingAs($admin)
            ->get(route('admin.observasi.index', ['detail_id' => $obs->id]))
            ->assertInertia(fn ($page) => $page
                ->where('detail.id', $obs->id)
                ->where('detail.crop_condition', 'Baik')
                ->where('detail.weather.temp', fn ($t) => (float) $t === 30.5)
            );
    }

    public function test_admin_dapat_mengedit_observasi(): void
    {
        $admin = User::factory()->admin()->create();
        $obs   = $this->makeObservation(attrs: ['crop_condition' => 'Baik']);

        $this->actingAs($admin)
            ->put(route('admin.observasi.update', $obs->id), [
                'observation_date' => '2026-06-01',
                'crop_condition'   => 'Kritis',
                'pest_indication'  => 'Berat',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $this->assertDatabaseHas('field_observations', [
            'id'             => $obs->id,
            'crop_condition' => 'Kritis',
            'pest_indication'=> 'Berat',
        ]);
    }

    public function test_edit_observasi_gagal_tanpa_tanggal(): void
    {
        $admin = User::factory()->admin()->create();
        $obs   = $this->makeObservation();

        $this->actingAs($admin)
            ->put(route('admin.observasi.update', $obs->id), ['observation_date' => ''])
            ->assertSessionHasErrors('observation_date');
    }

    public function test_admin_dapat_menghapus_observasi(): void
    {
        $admin = User::factory()->admin()->create();
        $obs   = $this->makeObservation();

        $this->actingAs($admin)
            ->delete(route('admin.observasi.destroy', $obs->id))
            ->assertRedirect();

        $this->assertDatabaseMissing('field_observations', ['id' => $obs->id]);
    }
}
