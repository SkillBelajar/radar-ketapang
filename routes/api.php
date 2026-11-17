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

// Dual-Mode & Push Ingestion Hermes Gateway Endpoints
Route::prefix('v1/hermes')->middleware('auth:sanctum')->group(function () {
    // Mode Pull / Fetch & Webhook
    Route::get('/fetch-news', [HermesGatewayController::class, 'fetchNews'])->name('api.hermes.fetch-news');
    Route::post('/webhook', [HermesGatewayController::class, 'webhook'])->name('api.hermes.webhook');

    // Mode Push Ingestion Harian oleh Hermes (Hermes mencari, menganalisis, & mengirim berita)
    Route::get('/target-parameters', [HermesGatewayController::class, 'targetParameters'])->name('api.hermes.target-parameters');
    Route::post('/push-news', [HermesGatewayController::class, 'pushNews'])->name('api.hermes.push-news');
});
