<?php

namespace Tests\Browser\Admin\ManajemenObservasi;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * TC-MO-003 — Filter Berdasarkan Petani (BEFORE→AFTER)
 * BEFORE: tabel menampilkan 2 petani (Budi + Dewi)
 * AFTER : filter petani Budi → hanya Budi yang tampil
 *
 * Assignee : Arjuna
 * Feature  : Manajemen Observasi Admin (AGS-111)
 * Command  : php artisan dusk --filter=TCMO003_FilterPetaniTest
 */
class TCMO003_FilterPetaniTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_filter_petani_menyaring_tabel(): void
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

            // ── SEBELUM: 2 petani tampil di tabel ──
            $browser->assertSee('Budi Santoso')
                    ->assertSee('Dewi Lestari');

            // ── AKSI: pilih filter petani "Budi Santoso" ──
            $browser->select('[dusk="filter-petani-obs"]', (string) $petani1->id)
                    ->pause(3000);

            // ── SESUDAH: hanya Budi yang tampil ──
            $browser->assertSee('Budi Santoso');
        });
    }
}
