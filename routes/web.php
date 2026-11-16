<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'appVersion' => config('app.version', '0.11'),
    ]);
})->name('welcome');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', function () {
        return redirect()->route('user-guide');
    })->name('dashboard');

    Route::get('/user-guide', function () {
        return Inertia::render('UserGuide');
    })->name('user-guide');
});

require __DIR__.'/auth.php';
