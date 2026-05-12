<?php

namespace Tests\Browser;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * Dusk Browser Test — Peta Risiko Lahan (AGS-82)
 * Assignee: Arjuna
 * Command : php artisan dusk --filter=PetaRisikoBrowserTest
 *
 * PRASYARAT:
 *   php artisan serve (di terminal terpisah)
 *   Database: agrisupport_dusk + PostGIS extension aktif
 */
class PetaRisikoBrowserTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_peta_leaflet_ter_render_di_halaman(): void
    {
        $farmer = User::factory()->create();
        AgriculturalArea::factory()->for($farmer)->count(2)->create();

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('peta-risiko.index'))
                    ->waitFor('#map', 5)
                    // TODO: assert polygon SVG muncul di dalam #map
                    ->assertPresent('#map');
        });
    }

    public function test_popup_muncul_saat_klik_polygon(): void
    {
        $farmer = User::factory()->create();
        $area   = AgriculturalArea::factory()->for($farmer)->create(['name' => 'Sawah Coba']);

        $this->browse(function (Browser $browser) use ($farmer, $area) {
            $browser->loginAs($farmer)
                    ->visit(route('peta-risiko.index'))
                    ->waitFor('#map', 5);
                    // TODO: click polygon area di peta (gunakan JS click pada layer)
                    // ->assertSee('Sawah Coba')
                    // ->assertSee('Level Risiko');
        });
    }

    public function test_legenda_peta_tampil(): void
    {
        $farmer = User::factory()->create();

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit(route('peta-risiko.index'))
                    ->waitFor('#map', 5);
                    // TODO: assert legenda dengan warna risiko tampil
                    // ->assertSee('Tinggi')
                    // ->assertSee('Sedang')
                    // ->assertSee('Rendah');
        });
    }
}
