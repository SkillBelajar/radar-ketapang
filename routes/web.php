<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\ChecklistController;
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
        'appVersion' => config('app.version', '1.0 (Release Candidate)'),
    ]);
})->name('welcome');

// UAT Checklist & Pengujian Mandiri Step-by-Step (Dapat diakses langsung tanpa proses login)
Route::get('/checklist', [ChecklistController::class, 'index'])->name('checklist.index');
Route::post('/checklist/toggle', [ChecklistController::class, 'toggle'])->name('checklist.toggle');
Route::post('/checklist/save', [ChecklistController::class, 'batchSave'])->name('checklist.save');
Route::post('/checklist/reset', [ChecklistController::class, 'reset'])->name('checklist.reset');
Route::post('/checklist/seed-demo', [ChecklistController::class, 'seedDemoData'])->name('checklist.seed-demo');

Route::middleware(['auth'])->group(function () {
    // Slice 5: Dasbor Analisis (Radar Politik & AI Output Berita Pers)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/dashboard/fetch', [DashboardController::class, 'triggerFetch'])->name('dashboard.fetch');

    // Slice 6: 1-Click Influencer Content Studio
    Route::get('/studio', [StudioController::class, 'index'])->name('studio.index');

    // Slice 7: Modul Evaluasi (Analytics & Audit)
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');

    // Slice 6: In-App Notifications
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.markAllRead');

    Route::get('/user-guide', function () {
        $token = env('HERMES_API_TOKEN', '');
        return Inertia::render('UserGuide', [
            'apiBaseUrl' => url('/api/v1/hermes'),
            'hasToken' => !empty($token),
            'maskedToken' => !empty($token)
                ? (strlen($token) > 10 ? substr($token, 0, 5) . '••••••••••••••••' . substr($token, -5) : '••••••••')
                : null,
            'plainToken' => !empty($token) ? $token : null,
        ]);
    })->name('user-guide');

    // Slice 3: Target Setup & Feed Hub (Restricted to 'admin' & 'timses')
    Route::get('/target-setup', [TargetSetupController::class, 'index'])->name('target-setup.index');
    Route::post('/target-setup', [TargetSetupController::class, 'update'])->name('target-setup.update');
    Route::post('/target-setup/fetch', [TargetSetupController::class, 'triggerFetch'])->name('target-setup.fetch');
});

require __DIR__.'/auth.php';
