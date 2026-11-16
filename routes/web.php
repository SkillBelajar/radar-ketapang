<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\StudioController;
use App\Http\Controllers\TargetSetupController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'appVersion' => config('app.version', '0.16'),
    ]);
})->name('welcome');

Route::middleware(['auth'])->group(function () {
    // Slice 5: Dasbor Analisis (Radar Politik & AI Output)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Slice 6: 1-Click Influencer Content Studio
    Route::get('/studio', [StudioController::class, 'index'])->name('studio.index');

    // Slice 7: Modul Evaluasi (Analytics & Audit)
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');

    // Slice 6: In-App Notifications
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.markAllRead');

    Route::get('/user-guide', function () {
        return Inertia::render('UserGuide');
    })->name('user-guide');

    // Slice 3: Target Setup & Feed Hub (Restricted to 'admin' & 'timses')
    Route::get('/target-setup', [TargetSetupController::class, 'index'])->name('target-setup.index');
    Route::post('/target-setup', [TargetSetupController::class, 'update'])->name('target-setup.update');
    Route::post('/target-setup/fetch', [TargetSetupController::class, 'triggerFetch'])->name('target-setup.fetch');
});

require __DIR__.'/auth.php';
