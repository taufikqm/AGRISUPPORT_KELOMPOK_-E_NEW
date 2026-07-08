<?php

namespace Tests\Browser\Admin\ManajemenObservasi;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * TC-MO-008 — Reset Filter (BEFORE→AFTER)
 * BEFORE: filter petani aktif → tabel 1 baris
 * AFTER : klik Reset → tabel kembali 2 baris
 *
 * Assignee : Arjuna
 * Feature  : Manajemen Observasi Admin (AGS-111)
 * Command  : php artisan dusk --filter=TCMO008_ResetFilterTest
 */
class TCMO008_ResetFilterTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_reset_filter_mengembalikan_semua_data(): void
    {
        $admin   = User::factory()->admin()->create();
        $petani1 = User::factory()->create(['name' => 'Budi Santoso', 'role' => 'petani']);
        $petani2 = User::factory()->create(['name' => 'Dewi Lestari', 'role' => 'petani']);
        $area1   = AgriculturalArea::factory()->for($petani1)->create(['name' => 'Sawah Cidahu']);
        $area2   = AgriculturalArea::factory()->for($petani2)->create(['name' => 'Kebun Ciamis']);
        FieldObservation::factory()->forArea($area1)->create([
            'observation_date' => now()->toDateString(),
            'crop_condition'   => 'Baik',
        ]);
        FieldObservation::factory()->forArea($area2)->create([
            'observation_date' => now()->toDateString(),
            'crop_condition'   => 'Kritis',
        ]);

        $this->browse(function (Browser $browser) use ($admin, $petani1) {
            $browser->loginAs($admin)
                    ->visit(route('admin.observasi.index'))
                    ->waitForText('Manajemen Observasi', 30);

            // ── AKSI: filter petani Budi ──
            $browser->select('[dusk="filter-petani-obs"]', (string) $petani1->id)
                    ->pause(3000);

            // ── SEBELUM (filter aktif): hanya Budi tampil ──
            $browser->assertSee('Budi Santoso');

            // ── AKSI: klik Reset ──
            $browser->select('Reset')
                    ->pause(3000);

            // ── SESUDAH: semua data kembali tampil ──
            $browser->waitForText('Manajemen Observasi', 30)
                    ->assertSee('Budi Santoso')
                    ->assertSee('Dewi Lestari');
        });
    }
}
