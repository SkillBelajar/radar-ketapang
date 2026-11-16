<?php

use App\Http\Controllers\Api\HermesGatewayController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Radar Politik & Manajemen Reputasi
|--------------------------------------------------------------------------
|
| Rute API dilindungi oleh middleware auth:sanctum.
| Digunakan untuk integrasi sistem dan komunikasi Hermes AI Gateway.
|
*/

Route::get('/user', function (Request $request) {
    return response()->json([
        'user' => $request->user(),
        'role' => $request->user()->role,
    ]);
})->middleware('auth:sanctum');

// Dual-Mode Hermes Gateway Endpoints
Route::prefix('v1/hermes')->middleware('auth:sanctum')->group(function () {
    Route::get('/fetch-news', [HermesGatewayController::class, 'fetchNews'])->name('api.hermes.fetch-news');
    Route::post('/webhook', [HermesGatewayController::class, 'webhook'])->name('api.hermes.webhook');
});
