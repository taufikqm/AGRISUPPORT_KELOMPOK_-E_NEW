<?php

use App\Http\Controllers\AgriculturalAreaController;
use App\Http\Controllers\FieldObservationController;
use App\Http\Controllers\HistoricalInsightController;
use App\Http\Controllers\LandHistoryController;
use App\Http\Controllers\WeatherController;
use App\Http\Controllers\RiskMapController;
use App\Http\Controllers\PlantingTimeController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\LandingController;

Route::get('/', [LandingController::class, 'index'])->name('landing');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

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
    Route::get('/analisis-risiko/{observation}/rekomendasi', [FieldObservationController::class, 'showRecommendations'])->name('rekomendasi-tindakan.show');
    Route::post('/rekomendasi/mark-completed', [FieldObservationController::class, 'markAsCompleted'])->name('rekomendasi-tindakan.mark-completed');

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
});

require __DIR__.'/auth.php';

