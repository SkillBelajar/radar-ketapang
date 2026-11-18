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
Route::post('/checklist/test-hermes', [ChecklistController::class, 'testHermesApi'])->name('checklist.test-hermes');

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
        $token = config('services.hermes.token');
        if (empty($token) && file_exists(base_path('.env'))) {
            if (preg_match('/^HERMES_API_TOKEN=(.*)$/m', file_get_contents(base_path('.env')), $matches)) {
                $token = trim($matches[1]);
            }
        }

        return Inertia::render('UserGuide', [
            'apiBaseUrl' => url('/api/v1/radar'),
            'hasToken' => !empty($token),
            'maskedToken' => !empty($token)
                ? (strlen($token) > 10 ? substr($token, 0, 5) . '••••••••••••••••' . substr($token, -5) : '••••••••')
                : null,
            'plainToken' => !empty($token) ? $token : null,
        ]);
    })->name('user-guide');

    Route::post('/user-guide/generate-token', function (\Illuminate\Http\Request $request) {
        $user = $request->user();
        if ($user && $user->role !== 'admin') {
            abort(403, 'Hanya Administrator yang berhak menerbitkan token Radar API.');
        }

        $targetUser = $user ?? \App\Models\User::where('role', 'admin')->first() ?? \App\Models\User::first();
        if ($targetUser) {
            $targetUser->tokens()->whereIn('name', ['hermes-radar', 'radar-ai'])->delete();
            $newAccessToken = $targetUser->createToken('radar-ai', ['*']);
            $plain = $newAccessToken->plainTextToken;

            $envPath = base_path('.env');
            if (file_exists($envPath)) {
                $envContent = file_get_contents($envPath);
                if (str_contains($envContent, 'HERMES_API_TOKEN=')) {
                    $envContent = preg_replace('/^HERMES_API_TOKEN=.*$/m', "HERMES_API_TOKEN={$plain}", $envContent);
                } else {
                    $envContent .= "\nHERMES_API_TOKEN={$plain}\n";
                }
                file_put_contents($envPath, $envContent);
            }
        }

        return redirect()->back()->with('success', 'Kunci akses Radar AI baru berhasil diterbitkan dan siap digunakan.');
    })->name('user-guide.generate-token');

    // Slice 3: Target Setup & Feed Hub (Restricted to 'admin' & 'timses')
    Route::get('/target-setup', [TargetSetupController::class, 'index'])->name('target-setup.index');
    Route::post('/target-setup', [TargetSetupController::class, 'update'])->name('target-setup.update');
    Route::post('/target-setup/fetch', [TargetSetupController::class, 'triggerFetch'])->name('target-setup.fetch');
});

require __DIR__.'/auth.php';
