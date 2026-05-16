# AgriSupport — Development SOP

> Dokumen ini adalah standar operasional yang wajib diikuti oleh seluruh anggota tim selama proses pengembangan. Baca seluruhnya sebelum mulai mengerjakan PBI pertama Anda.

---

## Daftar Isi

1. [Tech Stack](#1-tech-stack)
2. [Setup Environment Lokal](#2-setup-environment-lokal)
3. [Git Workflow SOP](#3-git-workflow-wajib)
4. [Workflow per Subtask (Siklus Harian)](#4-workflow-per-subtask-siklus-harian)
5. [Standar Penulisan Kode](#5-standar-penulisan-kode)
6. [Automated Testing SOP](#6-automated-testing-sop)
7. [Jira Workflow](#7-jira-workflow)
8. [Perintah Umum (Cheat Sheet)](#8-perintah-umum-cheat-sheet)

---

## 1. Tech Stack

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Backend Framework | Laravel | 12.x |
| Frontend Adapter | Inertia.js | 2.x |
| Frontend UI | React JSX | 18.x |
| Styling | Tailwind CSS | 3.x |
| Database | PostgreSQL + PostGIS | — |
| Peta Interaktif | Leaflet.js | — |
| Grafik | Recharts | — |
| HTTP Client (cuaca) | Open-Meteo API (via Guzzle) | — |
| Testing Backend | PHPUnit | (via `php artisan test`) |
| Testing Browser | Laravel Dusk | (via `php artisan dusk`) |

### Arsitektur Singkat

```
Browser → Inertia.js → Laravel Controller → DB (PostgreSQL)
                ↓
         React Component (JSX)
                ↓
         Tailwind CSS (styling)
```

Tidak ada REST API eksternal yang dikonsumsi frontend secara langsung — semua data dikirim via **Inertia props** dari controller.

---

## 2. Setup Environment Lokal

### Prasyarat

- PHP 8.2+
- Composer 2.x
- Node.js 20+ & npm
- PostgreSQL dengan ekstensi **PostGIS aktif**
- Google Chrome (untuk Laravel Dusk)

### Langkah Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd Kelompok_E_Agrisupport

# 2. Install dependency PHP
composer install

# 3. Install dependency JavaScript
npm install

# 4. Salin file environment
cp .env.example .env
php artisan key:generate

# 5. Isi konfigurasi database di .env
#    DB_CONNECTION=pgsql
#    DB_HOST=127.0.0.1
#    DB_PORT=5432
#    DB_DATABASE=agrisupport
#    DB_USERNAME=...
#    DB_PASSWORD=...

# 6. Jalankan migrasi dan seeder
php artisan migrate --seed

# 7. Build aset frontend
npm run dev

# 8. Jalankan server lokal
php artisan serve
```

### Setup Database Testing (wajib sebelum php artisan test)

Project menggunakan **PostgreSQL + PostGIS** untuk testing — bukan SQLite — agar query `ST_Centroid`, `ST_AsGeoJSON`, dan fungsi PostGIS lainnya bisa berjalan nyata.

Perlu dibuat **2 database terpisah** di PostgreSQL lokal Anda:

```sql
-- Jalankan di psql atau pgAdmin

-- Database untuk PHPUnit
CREATE DATABASE agrisupport_testing;
\c agrisupport_testing
CREATE EXTENSION IF NOT EXISTS postgis;

-- Database untuk Laravel Dusk
CREATE DATABASE agrisupport_dusk;
\c agrisupport_dusk
CREATE EXTENSION IF NOT EXISTS postgis;
```

> **Kenapa 2 database?** PHPUnit menggunakan transaksi (`RefreshDatabase`) yang di-rollback setelah tiap test. Dusk menggunakan `DatabaseMigrations` yang benar-benar truncate tabel. Mencampur keduanya dalam satu DB akan menyebabkan konflik state.

Kredensial database testing **tidak perlu diubah** — `phpunit.xml` sudah override `DB_DATABASE` ke `agrisupport_testing` secara otomatis, dengan username & password diwarisi dari `.env` Anda.

### Setup Laravel Dusk (wajib Sprint 2)

```bash
# 1. Install Dusk
composer require laravel/dusk --dev
php artisan dusk:install

# 2. Buat file environment khusus Dusk dari template
cp .env.dusk.local.example .env.dusk.local

# 3. Edit .env.dusk.local — isi username & password PostgreSQL Anda
#    DB_USERNAME=your_username
#    DB_PASSWORD=your_password

# 4. Update ChromeDriver agar sesuai versi Chrome Anda
php artisan dusk:chrome-driver --detect
```

> **Catatan:** Dusk membutuhkan server aktif (`php artisan serve`) di terminal terpisah sebelum dijalankan.

---

## 3. Git Workflow (Wajib)

### Aturan Dasar

1. **Satu subtask = satu commit** — jangan gabung beberapa subtask dalam satu commit
2. **Set identity git sesuai branch owner** sebelum commit di branch orang lain
3. **Jangan commit langsung ke `master`** — semua perubahan via branch dan PR
4. **Jangan gunakan** `--no-verify` atau skip hooks tanpa alasan

### Naming Convention Branch

**Sprint 1** (referensi, sudah selesai):
```
Format: feat/<developer>/<nama-fitur>

Contoh Sprint 1:
  feat/taufik/landing-page
  feat/bian/mesin-risiko
  feat/ketrin/rekomendasi-index
  feat/arjuna/wilayah-lahan
```

**Sprint 2** (konvensi aktif):
```
Format: feat/sprint-2/<developer>/<nama-pbi>

Contoh Sprint 2:
  feat/sprint-2/taufik/dashboard-admin
  feat/sprint-2/taufik/notifikasi-admin
  feat/sprint-2/bian/riwayat-lahan
  feat/sprint-2/bian/manajemen-pengguna
  feat/sprint-2/arjuna/peta-risiko
  feat/sprint-2/arjuna/manajemen-lahan-admin
  feat/sprint-2/daenisty/prediksi-waktu-tanam
  feat/sprint-2/daenisty/manajemen-rekomendasi
  feat/sprint-2/ketrin/insight-historis
  feat/sprint-2/ketrin/notifikasi-petani
  feat/sprint-2/tavy/pengaturan-profil
```

> Satu branch = satu PBI. Setiap commit di dalam branch mewakili satu subtask Jira.

| Type | Kapan Digunakan |
|------|----------------|
| `feat/sprint-2/` | Penambahan fitur baru Sprint 2 (gunakan ini) |
| `fix/` | Perbaikan bug pada fitur yang sudah ada |
| `hotfix/` | Perbaikan kritis di production/staging |
| `refactor/` | Restrukturisasi kode tanpa perubahan fungsional |

### Urutan Git Wajib (Setiap Sesi Kerja)

```bash
# LANGKAH 1 — Set identity sesuai Anda (lakukan sekali per sesi)
git config user.name  "Nama Developer"
git config user.email "email@developer.com"

# LANGKAH 2 — Buat atau pindah ke branch PBI Anda
git checkout -b feat/sprint-2/<developer>/<nama-pbi>   # branch baru
# atau
git checkout feat/sprint-2/<developer>/<nama-pbi>      # branch sudah ada

# Contoh nyata:
# git checkout -b feat/sprint-2/taufik/dashboard-admin

# LANGKAH 3 — Pull update terbaru sebelum mulai kerja
git pull origin master

# LANGKAH 4 — Kerjakan subtask

# LANGKAH 5 — Stage file yang relevan (jangan git add -A sembarangan)
git add app/Http/Controllers/XxxController.php
git add resources/js/Pages/Xxx.jsx

# LANGKAH 6 — Commit (1 commit per subtask, sertakan ID subtask Jira)
git commit -m "feat(AGS-XX): deskripsi perubahan singkat"

# LANGKAH 7 — Push ke remote
git push origin feat/sprint-2/<developer>/<nama-pbi>

# LANGKAH 8 — Buat Pull Request di GitHub ke branch master
```

### Format Commit Message

```
<type>(<scope>): <deskripsi singkat>

Tipe yang valid:
  feat      → fitur baru
  fix       → perbaikan bug
  refactor  → refaktor tanpa perubahan fungsional
  test      → menambah atau memperbaiki test
  style     → perubahan styling/UI
  perf      → optimasi performa
  chore     → konfigurasi, dependency, script

Contoh valid:
  feat(AGS-89): tambah middleware AdminOnly untuk route /admin/*
  feat(AGS-82): implementasi RiskMapController dengan GeoJSON response
  fix(AGS-71): perbaiki filter area_id pada LandHistoryController
  test(AGS-89): tambah AdminAuthTest untuk verifikasi redirect middleware
```

### Aturan yang Dilarang

- Dilarang menulis pesan commit generik: `update`, `fix`, `changes`, `wip`
- Dilarang commit file `.env`, `storage/`, `node_modules/`, `vendor/`
- Dilarang force push ke `master`
- Dilarang merge PR sendiri tanpa review anggota lain

---

## 4. Workflow per Subtask (Siklus Harian)

Ikuti urutan ini setiap mengerjakan satu subtask di Jira:

```
┌─────────────────────────────────────────────────────────┐
│  1. Buka Jira → pindahkan subtask dari "To Do" ke       │
│     "In Progress"                                        │
├─────────────────────────────────────────────────────────┤
│  2. git pull origin master (sinkronkan dengan tim)      │
├─────────────────────────────────────────────────────────┤
│  3. Kerjakan kode (backend → test → frontend)           │
├─────────────────────────────────────────────────────────┤
│  4. Tulis test file bersamaan (jangan ditunda)          │
│     PHPUnit → tests/Feature/                            │
│     Dusk    → tests/Browser/                            │
├─────────────────────────────────────────────────────────┤
│  5. Jalankan test — pastikan PASS sebelum commit        │
│     php artisan test --filter=NamaTest                  │
│     php artisan dusk --filter=NamaBrowserTest           │
├─────────────────────────────────────────────────────────┤
│  6. git add <file-spesifik> → git commit                │
│     (1 subtask = 1 commit)                              │
├─────────────────────────────────────────────────────────┤
│  7. git push → buat/update PR di GitHub                 │
├─────────────────────────────────────────────────────────┤
│  8. Jira → pindahkan subtask ke "Done"                  │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Standar Penulisan Kode

### Laravel / PHP

```php
// ✅ Gunakan return type hints
public function index(): Response
{
    return Inertia::render('PageName', [
        'data' => $this->getData(),
    ]);
}

// ✅ Gunakan Eloquent, hindari raw query kecuali PostGIS
$areas = AgriculturalArea::where('user_id', auth()->id())->get();

// ✅ Untuk PostGIS — gunakan selectRaw dengan ST_* functions
$areas = AgriculturalArea::selectRaw('*, ST_AsGeoJSON(geometry) as geojson')
    ->where('user_id', auth()->id())
    ->get();

// ✅ Validasi request di controller atau FormRequest
$validated = $request->validate([
    'name'  => 'required|string|max:255',
    'email' => 'required|email|unique:users,email',
]);

// ❌ Jangan hardcode user ID
$areas = AgriculturalArea::where('user_id', 1)->get(); // SALAH
```

### Inertia Controller Response

```php
// ✅ Kirim data spesifik, jangan kirim semua kolom
return Inertia::render('RiskMap', [
    'areas' => $areas->map(fn($a) => [
        'id'       => $a->id,
        'name'     => $a->name,
        'geojson'  => json_decode($a->geojson),
        'riskLevel' => $a->risk_level,
    ]),
]);
```

### React JSX / Frontend

```jsx
// ✅ Gunakan props dari Inertia, bukan fetch/axios
export default function RiskMap({ areas }) {
    return (
        <div id="map" className="h-screen w-full" />
    );
}

// ✅ Gunakan Tailwind utility class, bukan inline style
<div className="bg-red-500 text-white px-4 py-2 rounded-lg">

// ❌ Hindari inline style kecuali dynamic value dari JS
<div style={{ backgroundColor: 'red' }}> // HINDARI

// ✅ Gunakan komponen yang sudah ada di resources/js/Components/
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
```

### Struktur File Baru

```
Controller  → app/Http/Controllers/NamaController.php
Admin Ctrl  → app/Http/Controllers/Admin/NamaController.php
Model       → app/Models/NamaModel.php
Middleware  → app/Http/Middleware/NamaMiddleware.php
React Page  → resources/js/Pages/NamaHalaman.jsx
Admin Page  → resources/js/Pages/Admin/NamaHalaman.jsx
React Comp  → resources/js/Components/NamaKomponen.jsx
Migration   → database/migrations/xxxx_xx_xx_nama.php
Factory     → database/factories/NamaModelFactory.php
PHPUnit     → tests/Feature/NamaTest.php
Dusk        → tests/Browser/NamaBrowserTest.php
Admin Test  → tests/Feature/Admin/AdminNamaTest.php
Admin Dusk  → tests/Browser/Admin/AdminNamaBrowserTest.php
```

### Middleware di Laravel 12 (WAJIB DIBACA — beda dari versi lama)

> Laravel 12 **tidak punya `Kernel.php`** untuk daftarkan middleware. Semua konfigurasi middleware dilakukan di `bootstrap/app.php` menggunakan method `->withMiddleware()`.

#### Cara Daftarkan Middleware Alias (sudah ada di project ini)

```php
// bootstrap/app.php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->alias([
        'admin' => \App\Http\Middleware\EnsureIsAdmin::class,
    ]);
})
```

Setelah alias terdaftar, gunakan langsung di routes:

```php
// routes/web.php
Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('/admin/dashboard', [DashboardController::class, 'index']);
});
```

#### Struktur EnsureIsAdmin (sudah dibuat di project)

```php
// app/Http/Middleware/EnsureIsAdmin.php
class EnsureIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            abort(403);
        }
        return $next($request);
    }
}
```

#### Redirect Berdasarkan Role (sudah dikonfigurasi)

`redirectUsersTo` di `bootstrap/app.php` sudah diset role-aware:
- **Petani** → diarahkan ke `/wilayah-lahan`
- **Admin** → diarahkan ke `/admin/dashboard`

Sehingga login dengan akun admin langsung masuk ke halaman admin tanpa pengaturan tambahan.

---

## 6. Automated Testing SOP

### Prinsip Utama

> **Test ditulis bersamaan dengan kode, bukan setelah fitur selesai.**

Setiap subtask yang mengerjakan logika backend wajib disertai PHPUnit test. Setiap subtask yang mengerjakan UI interaktif wajib disertai Dusk test.

### Tiga Tipe Test

| Tipe | Tool | Yang Diuji | File |
|------|------|-----------|------|
| **PHPUnit Feature** | PHPUnit | Route, controller, DB, auth, HTTP response | `tests/Feature/` |
| **Laravel Dusk** | Dusk + Chrome | Klik tombol, form submit, tab switch, dropdown, modal | `tests/Browser/` |
| **Manual UI** | — | Warna exact, pixel spacing, font rendering | — (tidak diotomasi) |

### Panduan Memilih Tipe Test

```
Test case ini mengecek apa?
│
├─ HTTP status code (200, 302, 403)?          → PHPUnit Feature
├─ Redirect setelah login/logout?             → PHPUnit Feature
├─ Data dari database tersimpan benar?        → PHPUnit Feature
├─ User tidak bisa akses route tertentu?      → PHPUnit Feature
├─ API endpoint mengembalikan JSON benar?     → PHPUnit Feature
│
├─ Klik tab → konten halaman berubah?         → Laravel Dusk
├─ Isi form → submit → pesan sukses muncul?   → Laravel Dusk
├─ Pilih dropdown → tabel terupdate?          → Laravel Dusk
├─ Klik tombol hapus → modal konfirmasi?      → Laravel Dusk
├─ Chart/grafik muncul di halaman?            → Laravel Dusk (cek SVG)
├─ Peta Leaflet ter-render?                   → Laravel Dusk (cek #map div)
│
└─ Warna exact, layout pixel, animasi CSS?    → Manual UI
```

### Template PHPUnit Feature Test

```php
<?php

namespace Tests\Feature;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NamaTest extends TestCase
{
    use RefreshDatabase;

    public function test_halaman_dapat_diakses_oleh_petani(): void
    {
        $farmer = User::factory()->create();

        $this->actingAs($farmer)
            ->get('/route-yang-diuji')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('NamaKomponen')
                ->has('namaProps')
            );
    }

    public function test_petani_tidak_bisa_akses_route_admin(): void
    {
        $farmer = User::factory()->create(['role' => 'petani']);

        $this->actingAs($farmer)
            ->get('/admin/dashboard')
            ->assertRedirect('/dashboard');
    }

    public function test_guest_diarahkan_ke_login(): void
    {
        $this->get('/route-yang-diuji')
            ->assertRedirect('/login');
    }
}
```

### Template Laravel Dusk Browser Test

```php
<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class NamaBrowserTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_interaksi_ui_berjalan_benar(): void
    {
        $farmer = User::factory()->create();

        $this->browse(function (Browser $browser) use ($farmer) {
            $browser->loginAs($farmer)
                    ->visit('/route-yang-diuji')
                    ->assertSee('Teks yang Diharapkan')
                    ->click('@nama-selector')
                    ->waitForText('Teks Setelah Klik')
                    ->assertSee('Teks Setelah Klik');
        });
    }
}
```

### Konvensi Dusk Selector (WAJIB diikuti untuk semua elemen interaktif)

Dusk menggunakan `@nama-selector` untuk menemukan elemen HTML/JSX. Elemen yang akan diklik atau diinteraksi di Dusk test **wajib** diberi atribut `dusk="nama-selector"` di JSX.

#### Contoh di JSX

```jsx
{/* Tombol */}
<button dusk="btn-simpan-observasi" onClick={handleSubmit}>
    Simpan
</button>

{/* Input */}
<input dusk="input-nama-lahan" type="text" ... />

{/* Tab atau menu */}
<div dusk="tab-curah-hujan" onClick={() => setActiveTab('rain')}>
    Curah Hujan
</div>

{/* Dropdown */}
<select dusk="filter-area-id" onChange={handleFilter}>
    ...
</select>
```

#### Contoh di Dusk Test

```php
$browser->click('@btn-simpan-observasi')
        ->waitForText('Berhasil disimpan')
        ->assertSee('Berhasil disimpan');

$browser->type('@input-nama-lahan', 'Sawah Utara')
        ->click('@tab-curah-hujan')
        ->assertSee('Curah Hujan');
```

#### Aturan Penamaan Selector

| Pola | Contoh |
|------|--------|
| Tombol aksi | `btn-<aksi>` → `btn-simpan`, `btn-hapus`, `btn-kirim-notifikasi` |
| Input form | `input-<nama-field>` → `input-nama`, `input-email` |
| Tab navigasi | `tab-<nama>` → `tab-riwayat`, `tab-insight` |
| Dropdown filter | `filter-<nama>` → `filter-area`, `filter-tahun` |
| Modal/dialog | `modal-<nama>` → `modal-konfirmasi-hapus` |
| Link navigasi | `link-<nama>` → `link-dashboard-admin` |

> **Penting:** Jangan gunakan `id`, `class`, atau CSS selector yang rapuh di Dusk. Selalu gunakan `dusk="..."`.

### Cara Menjalankan Test

```bash
# ── PHPUnit ──────────────────────────────────────────────
# Jalankan SEMUA PHPUnit test
php artisan test

# Filter per class (lebih cepat saat development)
php artisan test --filter=NamaTest

# Filter per method spesifik
php artisan test --filter=NamaTest::test_nama_method

# Dengan coverage report (butuh Xdebug atau PCOV)
php artisan test --coverage

# ── Laravel Dusk ─────────────────────────────────────────
# Pastikan server aktif di terminal terpisah dulu!
php artisan serve

# Jalankan SEMUA Dusk test
php artisan dusk

# Filter Dusk per class
php artisan dusk --filter=NamaBrowserTest

# Filter Dusk per method
php artisan dusk --filter=NamaBrowserTest::test_nama_method

# ── Verifikasi akhir sebelum PR ───────────────────────────
# Jalankan keduanya — pastikan semua PASS
php artisan test && php artisan dusk
```

### Aturan Test yang Wajib

- **Wajib** `use RefreshDatabase` di setiap Feature test — agar DB bersih tiap test via transaksi
- **Wajib** `use DatabaseMigrations` di setiap Dusk test — agar DB di-migrate ulang tiap test
- **Dilarang** hardcode ID atau data — selalu gunakan factory
- **Dilarang** push ke master jika ada test yang gagal (merah)
- Test harus **PASS** sebelum PR dibuat
- **Dilarang** pakai SQLite untuk test apapun — project ini wajib PostgreSQL + PostGIS

### Perbedaan RefreshDatabase vs DatabaseMigrations

| Trait | Digunakan di | Cara Kerja | Kecepatan |
|-------|-------------|-----------|-----------|
| `RefreshDatabase` | PHPUnit Feature | Wrap setiap test dalam transaksi DB, rollback otomatis setelah selesai | ⚡ Cepat |
| `DatabaseMigrations` | Laravel Dusk | Jalankan `migrate:fresh` sebelum tiap test, truncate semua tabel | 🐢 Lebih lambat |

> Jangan tukar keduanya — menggunakan `DatabaseMigrations` di PHPUnit akan membuat test suite sangat lambat.

### Factory yang Digunakan

```php
// User biasa (petani)
$farmer = User::factory()->create();

// User admin (Sprint 2)
$admin = User::factory()->create(['role' => 'admin']);

// Lahan milik petani
$area = AgriculturalArea::factory()->for($farmer)->create();

// Observasi di lahan tersebut
$obs = FieldObservation::factory()->for($area)->create();
```

---

## 7. Jira Workflow

### Status Ticket yang Benar

```
To Do → In Progress → In Review → Done
  │           │             │
  │     Mulai kerja    Buat PR di
  │     subtask        GitHub
  │
Awal sprint
```

### Aturan Jira

| Situasi | Yang Dilakukan |
|---------|---------------|
| Mulai kerjakan subtask | Pindah ke **In Progress** |
| Commit pertama sudah ada | Link commit ke Jira (via Smart Commit) |
| PR sudah dibuat | Pindah ke **In Review** |
| PR di-merge ke master | Pindah ke **Done** |
| Ditemukan bug saat review | Pindah balik ke **In Progress** |

### Smart Commit (Otomatis Update Jira dari Git)

Tulis key Jira di commit message untuk otomatis log ke ticket:

```bash
git commit -m "feat(AGS-89): implementasi AdminOnly middleware #time 2h"
#                   ^^^^^^                                    ^^^^^^^^^^^
#               Key Jira                               Log waktu ke Jira
```

### PBI Development Ready Checklist

Sebelum developer mulai coding, pastikan PBI di Jira memenuhi:

- [ ] Description 8 section lengkap
- [ ] Section Automated Testing ada (file test, command, contoh assertion)
- [ ] Tabel Skenario Pengujian punya kolom Tipe + Method
- [ ] Subtasks sudah dibuat dengan Story Points
- [ ] Assignee benar

---

## 8. Perintah Umum (Cheat Sheet)

### Laravel

```bash
# Jalankan server
php artisan serve

# Migrasi database
php artisan migrate
php artisan migrate:fresh --seed   # reset + isi ulang data

# Buat file baru
php artisan make:controller NamaController
php artisan make:model NamaModel -m     # sekaligus migration
php artisan make:middleware NamaMiddleware
php artisan make:factory NamaFactory
php artisan make:notification NamaNotification

# Lihat semua route
php artisan route:list
php artisan route:list --path=admin    # filter prefix

# Cache
php artisan cache:clear
php artisan config:clear
php artisan view:clear
```

### Testing

```bash
# PHPUnit
php artisan test                              # semua test
php artisan test --filter=NamaTest           # filter class
php artisan test --filter=NamaTest::test_x   # filter method
php artisan test --coverage                  # dengan coverage report

# Dusk
php artisan serve &                           # server harus aktif
php artisan dusk                             # semua dusk test
php artisan dusk --filter=NamaBrowserTest    # filter class
php artisan dusk:chrome-driver --detect      # update ChromeDriver
```

### Git

```bash
# Setup identity sebelum commit
git config user.name  "Nama Developer"
git config user.email "email@developer.com"

# Alur harian
git pull origin master
git checkout -b feature/AGS-XX-nama
git add <file>
git commit -m "feat(AGS-XX): deskripsi"
git push origin feature/AGS-XX-nama

# Cek status
git status
git log --oneline -10
git diff
```

### Frontend

```bash
# Development (hot reload)
npm run dev

# Build production
npm run build

# Cek lint
npm run lint
```

---

---

## 9. Troubleshooting Umum

| Masalah | Penyebab | Solusi |
|---------|---------|--------|
| `SQLSTATE: extension "postgis" does not exist` | PostGIS belum diaktifkan di database testing | Jalankan `CREATE EXTENSION IF NOT EXISTS postgis;` di `agrisupport_testing` dan `agrisupport_dusk` |
| `Connection refused` saat `php artisan test` | PostgreSQL tidak berjalan | Pastikan service PostgreSQL aktif |
| Dusk error `Chrome not reachable` | ChromeDriver versi tidak cocok | Jalankan `php artisan dusk:chrome-driver --detect` |
| Dusk error `No application encryption key` | `.env.dusk.local` belum punya `APP_KEY` | Jalankan `php artisan key:generate` lalu salin hasilnya ke `.env.dusk.local` |
| `Class AgriculturalAreaFactory not found` | Factory belum dibuat | Buat factory dengan `php artisan make:factory AgriculturalAreaFactory` |
| Test pass di lokal, gagal di mesin lain | Kredensial DB berbeda | Pastikan `DB_USERNAME` dan `DB_PASSWORD` di `.env` sudah benar |

---

> Dokumen ini dikelola oleh **Taufik Qurohman** (PM) dan diperbarui setiap awal sprint.
> Terakhir diperbarui: **12 Mei 2026**
