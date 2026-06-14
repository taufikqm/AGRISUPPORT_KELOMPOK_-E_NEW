# Panduan Testing Laravel Dusk — AgriSupport

> Panduan untuk seluruh anggota tim agar bisa menjalankan **automation browser test (Laravel Dusk)** untuk PBI masing-masing secara individual.

---

## 1. Apa yang Sudah Otomatis Didapat dari `git pull`

Setelah `git pull`, kamu **sudah** mendapatkan semua ini tanpa setup tambahan:

| File | Fungsi |
|------|--------|
| `tests/Browser/...` | Semua file test Dusk (`.php`) |
| `tests/DuskTestCase.php` | Base class Dusk |
| `phpunit.dusk.xml` | Konfigurasi Dusk + koneksi DB testing |
| `phpunit.xml` | Konfigurasi PHPUnit |
| `.env.dusk.local.example` | Template env Dusk |

## 2. Apa yang HARUS Dibuat Manual (TIDAK ada di Git)

File berikut **di-gitignore** karena berisi kredensial, jadi **wajib kamu buat sendiri**:

- **`.env.dusk.local`** ← file paling penting (lihat Langkah 2)

---

## ⚠️ PERINGATAN KEAMANAN — BACA DULU

Saat kamu menjalankan `php artisan dusk`, Laravel akan **menukar sementara** `.env.dusk.local` menjadi `.env` selama test berjalan.

**Kalau kamu TIDAK punya `.env.dusk.local`:**
- Dusk akan memakai `.env` kamu yang aktif (kemungkinan **production**)
- Test memakai trait `DatabaseMigrations` yang **MENGHAPUS & MEMBUAT ULANG seluruh tabel**
- Artinya: **DATABASE PRODUCTION BISA TER-WIPE**

> ✅ **Aturan wajib:** Pastikan `.env.dusk.local` sudah ada dan menunjuk ke **DB testing (northeast)** SEBELUM menjalankan Dusk.

Pemetaan database:
- **Production** = `aws-1-ap-southeast-1...` (`ztfdgcdvhzgnrclbdgyz`) → JANGAN dipakai testing
- **Testing** = `aws-1-ap-northeast-1...` (`qyxhfqopcyizdzcnnqbf`) → INI yang dipakai Dusk

---

## Langkah Setup (Sekali Saja)

### Langkah 1 — Tarik update terbaru

```powershell
git pull origin <nama-branch-kamu>
```

### Langkah 2 — Buat file `.env.dusk.local`

Copy dari template:

```powershell
Copy-Item .env.dusk.local.example .env.dusk.local
```

Lalu **edit `.env.dusk.local`** agar isinya seperti berikut. Nilai `APP_KEY` dan semua `DB_*` **disalin dari file `phpunit.dusk.xml`** yang sudah ada di repo (buka file itu, lihat bagian `<php><env>`):

```env
APP_NAME="AgriSupport Dusk"
APP_ENV=testing
APP_KEY=            # ← salin dari phpunit.dusk.xml (key APP_KEY)
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

# DB Testing (northeast) — salin semua nilai dari phpunit.dusk.xml
DB_CONNECTION=pgsql
DB_HOST=            # ← salin dari phpunit.dusk.xml (DB_HOST)
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=        # ← salin dari phpunit.dusk.xml (DB_USERNAME)
DB_PASSWORD=        # ← salin dari phpunit.dusk.xml (DB_PASSWORD)

CACHE_STORE=array
SESSION_DRIVER=file   # ← WAJIB "file", bukan "array" (kalau array, loginAs() gagal)
QUEUE_CONNECTION=sync
MAIL_MAILER=array
```

> 💡 Sumber tunggal nilai DB ada di `phpunit.dusk.xml` (sudah di repo). Kalau bingung, minta ke PM (Taufik).

**Cek keamanan sebelum lanjut** — pastikan menunjuk northeast:

```powershell
Select-String -Path .env.dusk.local -Pattern "DB_HOST"
# Harus muncul: aws-1-ap-northeast-1... (BUKAN southeast)
```

### Langkah 3 — Sesuaikan ChromeDriver dengan versi Chrome kamu

```powershell
php artisan dusk:chrome-driver --detect
```

Jalankan ulang perintah ini setiap kali Chrome kamu update versi.

---

## Cara Menjalankan Test

Butuh **2 terminal** terpisah.

**Terminal 1 — jalankan server** (biarkan tetap hidup):

```powershell
php artisan serve
```

**Terminal 2 — jalankan Dusk:**

```powershell
# Semua test
php artisan dusk

# Filter per class test
php artisan dusk --filter=NamaBrowserTest

# Filter per method test
php artisan dusk --filter=nama_method_test
```

### Mode tampilan browser (untuk screenshot/demo)

Tambahkan env var ini agar jendela Chrome terlihat (tidak headless):

```powershell
$env:DUSK_HEADLESS_DISABLED="true"; php artisan dusk --filter=NamaBrowserTest
```

Tanpa env var itu → mode headless (tanpa tampilan, lebih cepat).

---

## Contoh: 7 Test AGS-81 (Dashboard Admin)

```powershell
# Semua 7 test sekaligus
$env:DUSK_HEADLESS_DISABLED="true"; php artisan dusk --filter=AdminDashboardBrowserTest
```

Per test case:

| TC | Perintah (method) |
|----|-------------------|
| TC-001 | `php artisan dusk --filter=test_admin_login_langsung_masuk_dashboard_admin` |
| TC-002 | `php artisan dusk --filter=test_card_statistik_tampil_di_dashboard` |
| TC-003 | `php artisan dusk --filter=test_grafik_distribusi_risiko_lahan_tampil` |
| TC-004 | `php artisan dusk --filter=test_grafik_tren_observasi_mingguan_tampil` |
| TC-005 | `php artisan dusk --filter=test_tabel_aktivitas_observasi_terbaru_tampil` |
| TC-006 | `php artisan dusk --filter=test_navigasi_ke_manajemen_pengguna_dari_dashboard` |
| TC-007 | `php artisan dusk --filter=test_link_lihat_semua_mengarah_ke_halaman_laporan` |

Filter per PBI lain (lihat juga `docs/testing.md`):

```powershell
php artisan dusk --filter=AdminAuthBrowserTest        # AGS-89
php artisan dusk --filter=ActivityLogBrowserTest      # AGS-94
```

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `loginAs()` gagal, browser balik ke halaman login | Cek `SESSION_DRIVER=file` di `.env.dusk.local` dan `phpunit.dusk.xml` |
| `net::ERR_CONNECTION_REFUSED` | `php artisan serve` belum jalan / belum siap. Jalankan dulu di terminal terpisah |
| `waitForText` / `waitForLocation` timeout | Naikkan timeout (Supabase pooler lambat, 15–30 detik wajar) |
| ChromeDriver error / versi mismatch | `php artisan dusk:chrome-driver --detect` |
| `column "..." does not exist` | DB testing belum ter-migrasi penuh. Pastikan migrasi terbaru sudah ada |
| `->format()` error di field datetime | Tambah `$casts = ['field' => 'datetime']` di model |
| Test data tidak muncul di tabel | Factory belum mengisi field yang difilter controller (`whereNotNull`, dll.) |

---

## Checklist Sebelum Menjalankan Dusk

- [ ] `git pull` sudah dilakukan
- [ ] `.env.dusk.local` sudah ada dan menunjuk **northeast (testing)**
- [ ] `SESSION_DRIVER=file` di `.env.dusk.local`
- [ ] `php artisan dusk:chrome-driver --detect` sudah dijalankan
- [ ] `php artisan serve` aktif di terminal terpisah
- [ ] Bukan menunjuk database production (southeast)

---

> Referensi tambahan: `docs/testing.md` (standar testing per PBI) dan `CLAUDE.md` bagian 7 (Standar Testing).
