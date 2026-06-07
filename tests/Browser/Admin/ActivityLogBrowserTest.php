<?php

namespace Tests\Browser\Admin;

use App\Models\User;
use App\Models\ActionLog;
use App\Models\FieldObservation;
use App\Models\AgriculturalArea;
use App\Models\Recommendation;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;
use Carbon\Carbon;

class ActivityLogBrowserTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Buat Admin
        $this->admin = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin_test@agrisupport.com',
            'password' => bcrypt('password')
        ]);

        // Buat Petani 1 & Lahan & Observasi
        $this->petani1 = User::factory()->create(['role' => 'petani', 'name' => 'Petani A']);
        $this->lahan1 = AgriculturalArea::factory()->create(['user_id' => $this->petani1->id, 'name' => 'Lahan A']);
        $this->obs1 = FieldObservation::factory()->create([
            'user_id' => $this->petani1->id,
            'agricultural_area_id' => $this->lahan1->id,
            'observation_date' => Carbon::now()->subDays(2),
            'weather_precip_mm' => 50
        ]);

        // Buat Petani 2 & Lahan & ActionLog
        $this->petani2 = User::factory()->create(['role' => 'petani', 'name' => 'Petani B']);
        $this->lahan2 = AgriculturalArea::factory()->create(['user_id' => $this->petani2->id, 'name' => 'Lahan B']);
        $this->rekomendasi = Recommendation::factory()->create(['title' => 'Beri Pupuk Tambahan']);
        $this->act1 = ActionLog::create([
            'user_id' => $this->petani2->id,
            'agricultural_area_id' => $this->lahan2->id,
            'recommendation_id' => $this->rekomendasi->id,
            'action_type' => 'completion',
            'performed_at' => Carbon::now()->subDays(1),
        ]);
    }

    /**
     * @group ags-94
     */
    public function test_tc_01_melihat_riwayat()
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->admin)
                    ->visit('/admin/laporan')
                    ->waitForText('Laporan Aktivitas', 15)
                    ->assertSee('Tren Aktivitas Platform')
                    ->assertSee('Detail Riwayat Aktivitas')
                    ->assertSee($this->petani1->name)
                    ->assertSee($this->petani2->name)
                    ->assertSee('Observasi')
                    ->assertSee('Selesai Rekomendasi')
                    ->assertPresent('@filter-petani-log')
                    ->assertPresent('@input-date-from')
                    ->assertPresent('@input-date-to')
                    ->assertPresent('@btn-export-csv');
        });
    }

    /**
     * @group ags-94
     */
    public function test_tc_02_filter_per_petani()
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->admin)
                    ->visit('/admin/laporan')
                    ->waitForText('Detail Riwayat Aktivitas', 15)
                    ->select('@filter-petani-log', $this->petani1->id)
                    ->press('Terapkan Filter')
                    ->waitForText($this->petani1->name, 15)
                    ->pause(1000)
                    ->assertSee($this->petani1->name)
                    ->assertDontSee($this->petani2->name);
        });
    }

    /**
     * @group ags-94
     */
    public function test_tc_03_unduh_laporan()
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->admin)
                    ->visit('/admin/laporan')
                    ->waitForText('Laporan Aktivitas', 15)
                    ->click('@btn-export-csv')
                    ->pause(2000);
            
            // Verifikasi bahwa tombol export bisa diklik tanpa error.
            // Pengecekan file unduhan secara native pada Selenium/Chrome agak tricky, 
            // jadi kita hanya verifikasi aksi tidak menghasilkan error screen.
            $browser->assertPathIs('/admin/laporan');
        });
    }
}
