<?php

use App\Http\Controllers\AgriculturalAreaController;
use App\Http\Controllers\FieldObservationController;
use App\Http\Controllers\HistoricalInsightController;
use App\Http\Controllers\LandHistoryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\WeatherController;
use App\Http\Controllers\RiskMapController;
use App\Http\Controllers\PlantingTimeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\LandManagementController;
use App\Http\Controllers\Admin\RecommendationManagementController;
use App\Http\Controllers\Admin\GlobalRiskMapController;
use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\NotificationController as AdminNotificationController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\LandingController;

// ============================================================
// Public Routes
// ============================================================
Route::get('/', [LandingController::class, 'index'])->name('landing');
Route::get('/kebijakan-privasi', [LandingController::class, 'kebijakanPrivasi'])->name('kebijakan-privasi');
Route::get('/syarat-ketentuan', [LandingController::class, 'syaratKetentuan'])->name('syarat-ketentuan');
Route::get('/kontak', [LandingController::class, 'kontak'])->name('kontak');

// ============================================================
// Petani Routes (auth required)
// ============================================================
Route::get('/dashboard', [FieldObservationController::class, 'dashboard'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Kelola Wilayah Lahan
    Route::get('/wilayah-lahan', [AgriculturalAreaController::class, 'index'])->name('wilayah-lahan.index');
    Route::post('/wilayah-lahan', [AgriculturalAreaController::class, 'store'])->name('wilayah-lahan.store');
    Route::put('/wilayah-lahan/{id}', [AgriculturalAreaController::class, 'update'])->name('wilayah-lahan.update');
    Route::delete('/wilayah-lahan/{id}', [AgriculturalAreaController::class, 'destroy'])->name('wilayah-lahan.destroy');

    // Input Kondisi Lapangan
    Route::get('/input-kondisi', [FieldObservationController::class, 'index'])->name('input-kondisi.index');
    Route::post('/input-kondisi', [FieldObservationController::class, 'store'])->name('input-kondisi.store');
    Route::get('/validasi-observasi/{observation}', [FieldObservationController::class, 'showValidation'])->name('validasi-observasi.show');
    Route::get('/analisis-risiko/{observation}', [FieldObservationController::class, 'showRiskAnalysis'])->name('analisis-risiko.show');
    Route::get('/rekomendasi-tindakan', [FieldObservationController::class, 'indexRecommendations'])->name('rekomendasi-tindakan.index');
    Route::get('/rekomendasi-tindakan/{observation}', [FieldObservationController::class, 'showRecommendations'])->name('rekomendasi-tindakan.show');
    Route::post('/rekomendasi-tindakan/mark-completed', [FieldObservationController::class, 'markAsCompleted'])->name('rekomendasi-tindakan.mark-completed');

    // Peta Risiko
    Route::get('/peta-risiko', [RiskMapController::class, 'index'])->name('peta-risiko.index');

    // Cuaca & Prediksi
    Route::get('/cuaca', [WeatherController::class, 'index'])->name('cuaca.index');
    Route::get('/api/weather', [WeatherController::class, 'getWeather'])->name('api.weather');

    // Waktu Tanam
    Route::get('/waktu-tanam', [PlantingTimeController::class, 'index'])->name('waktu-tanam.index');
    Route::post('/waktu-tanam/analisis', [PlantingTimeController::class, 'analyze'])->name('waktu-tanam.analyze');

    // Riwayat Lahan (Histori Aktivitas & Analisis)
    Route::get('/riwayat-lahan', [LandHistoryController::class, 'index'])->name('riwayat-lahan.index');
    Route::get('/api/land-history', [LandHistoryController::class, 'getData'])->name('api.land-history');

    // Insight Historis (Analisis Tren & Pola)
    Route::get('/insight-historis', [HistoricalInsightController::class, 'index'])->name('insight-historis.index');
    Route::get('/api/historical-data', [HistoricalInsightController::class, 'getHistoricalData'])->name('api.historical-data');

    // Notifikasi Petani — AGS-87
    Route::get('/notifikasi', [NotificationController::class, 'index'])->name('notifikasi.index');
    Route::post('/notifikasi/{id}/baca', [NotificationController::class, 'markAsRead'])->name('notifikasi.mark-read');
    Route::post('/notifikasi/baca-semua', [NotificationController::class, 'markAllAsRead'])->name('notifikasi.mark-all-read');
    Route::get('/api/notifikasi/unread-count', [NotificationController::class, 'unreadCount'])->name('api.notifikasi.unread-count');
});

// ============================================================
// Admin Authentication Routes
// ============================================================
Route::prefix('admin')->name('admin.')->group(function () {
    Route::post('/logout', [AdminAuthController::class, 'logout'])
        ->middleware('auth')
        ->name('logout');
});

// ============================================================
// Admin Routes (auth + admin role required)
// ============================================================
Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        // Dashboard Admin — AGS-81
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

        // Manajemen Pengguna — AGS-90
        Route::get('/pengguna', [UserManagementController::class, 'index'])->name('pengguna.index');
        Route::get('/pengguna/{user}', [UserManagementController::class, 'show'])->name('pengguna.show');
        Route::put('/pengguna/{user}', [UserManagementController::class, 'update'])->name('pengguna.update');
        Route::patch('/pengguna/{user}/status', [UserManagementController::class, 'toggleStatus'])->name('pengguna.toggle-status');

        // Manajemen Lahan & Observasi — AGS-91
        Route::get('/lahan', [LandManagementController::class, 'index'])->name('lahan.index');
        Route::get('/lahan/{area}', [LandManagementController::class, 'show'])->name('lahan.show');
        Route::put('/lahan/{area}', [LandManagementController::class, 'update'])->name('lahan.update');
        Route::delete('/lahan/{area}', [LandManagementController::class, 'destroy'])->name('lahan.destroy');

        // Manajemen Rekomendasi — AGS-92
        Route::get('/rekomendasi', [RecommendationManagementController::class, 'index'])->name('rekomendasi.index');
        Route::post('/rekomendasi', [RecommendationManagementController::class, 'store'])->name('rekomendasi.store');
        Route::put('/rekomendasi/{id}', [RecommendationManagementController::class, 'update'])->name('rekomendasi.update');
        Route::delete('/rekomendasi/{id}', [RecommendationManagementController::class, 'destroy'])->name('rekomendasi.destroy');

        // Peta Risiko Global — AGS-93
        Route::get('/peta-risiko', [GlobalRiskMapController::class, 'index'])->name('peta-risiko.index');
        Route::get('/api/peta-risiko', [GlobalRiskMapController::class, 'getData'])->name('api.peta-risiko');

        // Riwayat Aktivitas & Laporan — AGS-94
        Route::get('/laporan', [ActivityLogController::class, 'index'])->name('laporan.index');
        Route::get('/api/laporan', [ActivityLogController::class, 'getData'])->name('api.laporan');
        Route::get('/laporan/export', [ActivityLogController::class, 'exportCsv'])->name('laporan.export');

        // Sistem Notifikasi Admin — AGS-95
        Route::get('/notifikasi', [AdminNotificationController::class, 'index'])->name('notifikasi.index');
        Route::post('/notifikasi/kirim', [AdminNotificationController::class, 'send'])->name('notifikasi.send');
        Route::get('/notifikasi/riwayat', [AdminNotificationController::class, 'history'])->name('notifikasi.history');

        // Pengaturan Admin — AGS-96
        Route::get('/pengaturan', [AdminSettingsController::class, 'index'])->name('pengaturan.index');
        Route::put('/pengaturan', [AdminSettingsController::class, 'update'])->name('pengaturan.update');
    });

require __DIR__.'/auth.php';
