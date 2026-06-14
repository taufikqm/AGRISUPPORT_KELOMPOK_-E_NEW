<?php

namespace Tests\Browser\Admin;

use App\Models\User;
use App\Models\ActionLog;
use App\Models\FieldObservation;
use App\Models\AgriculturalArea;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;
use Carbon\Carbon;

class ActivityLogBrowserTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected User $admin;
    protected User $petani1;
    protected User $petani2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin_test@agrisupport.com',
            'password' => bcrypt('password'),
        ]);

        $this->petani1 = User::factory()->create([
            'role' => 'petani',
            'name' => 'Petani A',
        ]);

        $lahan1 = AgriculturalArea::factory()->create([
            'user_id' => $this->petani1->id,
        ]);

        FieldObservation::factory()->create([
            'agricultural_area_id' => $lahan1->id,
            'observation_date' => Carbon::now()->subDays(2),
        ]);

        $this->petani2 = User::factory()->create([
            'role' => 'petani',
            'name' => 'Petani B',
        ]);

        $lahan2 = AgriculturalArea::factory()->create([
            'user_id' => $this->petani2->id,
        ]);

        

        ActionLog::create([
            'user_id' => $this->petani2->id,
            'agricultural_area_id' => $lahan2->id,
            'action_type' => 'completion',
            'performed_at' => Carbon::now()->subDay(),
        ]);
    }

    /**
     * TC-01 Pencarian Lanjutan
     */
    public function test_tc_01_pencarian_lanjutan()
    {
        $this->browse(function (Browser $browser) {

            $browser->loginAs($this->admin)
                ->visit('/admin/laporan')
                ->waitForText('Laporan Aktivitas', 15)

                ->assertPresent('@filter-petani-log')
                ->assertPresent('@input-date-from')
                ->assertPresent('@input-date-to')
                ->assertPresent('@btn-terapkan-filter')

                ->select('@filter-petani-log', (string) $this->petani1->id)

                ->type('@input-date-from', now()->subDays(7)->format('Y-m-d'))
                ->type('@input-date-to', now()->format('Y-m-d'))

                ->click('@btn-terapkan-filter')
                ->pause(3000)

                ->assertPresent('@tabel-aktivitas')

                ->screenshot('TC01-pencarian-lanjutan');
        });
    }

    /**
     * TC-02 Penyaringan Berlapis
     */
    public function test_tc_02_penyaringan_berlapis()
    {
        $this->browse(function (Browser $browser) {

            $browser->loginAs($this->admin)
                ->visit('/admin/laporan')
                ->waitForText('Laporan Aktivitas', 15)

                ->select('@filter-petani-log', (string) $this->petani2->id)

                ->type('@input-date-from', now()->subDays(5)->format('Y-m-d'))
                ->type('@input-date-to', now()->format('Y-m-d'))

                ->click('@btn-terapkan-filter')
                ->pause(3000)

                ->assertPresent('@tabel-aktivitas')

                ->screenshot('TC02-penyaringan-berlapis');
        });
    }

    /**
     * TC-03 Unduh CSV
     */
    public function test_tc_03_unduh_csv()
    {
        $this->browse(function (Browser $browser) {

            $browser->loginAs($this->admin)
                ->visit('/admin/laporan')
                ->waitForText('Laporan Aktivitas', 15)

                ->assertPresent('@btn-export-csv')

                ->click('@btn-export-csv')
                ->pause(3000)

                ->screenshot('TC03-unduh-csv');
        });
    }

    /**
     * TC-04 Menampilkan Waktu Lokal
     */
    public function test_tc_04_menampilkan_waktu_lokal()
    {
        $this->browse(function (Browser $browser) {

            $browser->loginAs($this->admin)
                ->visit('/admin/laporan')
                ->waitForText('Detail Riwayat Aktivitas', 15)

                ->assertPresent('@tabel-aktivitas')

                ->screenshot('TC04-waktu-lokal');
        });
    }

    /**
     * TC-06 Pembaruan Grafik Otomatis
     */
    public function test_tc_06_pembaruan_grafik_otomatis()
    {
        $this->browse(function (Browser $browser) {

            $browser->loginAs($this->admin)
                ->visit('/admin/laporan')
                ->waitForText('Laporan Aktivitas', 15)

                ->assertPresent('@grafik-aktivitas')

                ->select('@filter-petani-log', (string) $this->petani1->id)

                ->click('@btn-terapkan-filter')
                ->pause(3000)

                ->assertPresent('@grafik-aktivitas')

                ->screenshot('TC06-grafik');
        });
    }

    /**
     * TC-07 Pencarian Kosong
     */
    public function test_tc_07_pencarian_kosong()
    {
        $this->browse(function (Browser $browser) {

            $browser->loginAs($this->admin)
                ->visit('/admin/laporan')
                ->waitForText('Laporan Aktivitas', 15)

                ->type('@input-date-from', '2099-01-01')
                ->type('@input-date-to', '2099-12-31')

                ->click('@btn-terapkan-filter')
                ->pause(3000)

                ->assertSee('Tidak ada riwayat aktivitas ditemukan.')

                ->screenshot('TC07-pencarian-kosong');
        });
    }
}