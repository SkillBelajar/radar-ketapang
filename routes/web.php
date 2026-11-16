<?php

use App\Http\Controllers\TargetSetupController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'appVersion' => config('app.version', '0.13'),
    ]);
})->name('welcome');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', function () {
        return redirect()->route('target-setup.index');
    })->name('dashboard');

    Route::get('/user-guide', function () {
        return Inertia::render('UserGuide');
    })->name('user-guide');

    // Slice 3: Target Setup & Feed Hub (Restricted to 'admin' & 'timses')
    Route::get('/target-setup', [TargetSetupController::class, 'index'])->name('target-setup.index');
    Route::post('/target-setup', [TargetSetupController::class, 'update'])->name('target-setup.update');
    Route::post('/target-setup/fetch', [TargetSetupController::class, 'triggerFetch'])->name('target-setup.fetch');
});

require __DIR__.'/auth.php';
