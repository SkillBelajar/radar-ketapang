<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsFeed;
use App\Models\TargetSetup;
use App\Models\User;
use App\Notifications\NewCrisisAlert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Validator;

class HermesGatewayController extends Controller
{
    /**
     * GET /api/v1/hermes/fetch-news
     * 
     * Mengambil berita dari news_feeds yang ai_status = 'pending'
     * beserta parameter TargetSetup dan instruksi Dual-Mode.
     */
    public function fetchNews(Request $request): JsonResponse
    {
        $limit = (int) $request->query('limit', 20);
        $limit = max(1, min($limit, 100));

        // Ambil berita mentah berstatus pending
        $newsFeeds = NewsFeed::where('ai_status', 'pending')
            ->orderBy('id', 'desc')
            ->take($limit)
            ->get();

        // Ambil konfigurasi target setup terpusat
        $targetSetup = TargetSetup::getOrCreate();

        // Dual-Mode Instructions
        $dualModeInstruction = [
            'mode_rule' => 'Jika sentimen negatif, gunakan mode Defensive Reframing. Jika netral/positif, gunakan mode Proactive Framing.',
            'guidelines' => [
                'defensive_reframing' => [
                    'sentiment_trigger' => 'negative',
                    'strategy' => 'Defensive Reframing Media Pers',
                    'action' => 'Klarifikasi taktis atas artikel berita negatif, pisahkan opini sepihak vs data rujukan resmi, dan susun 3 draf respon: Siaran Pers Resmi, Poin Juru Bicara (Doorstop Wartawan), dan Lembar Hak Jawab Redaksi.',
                ],
                'proactive_framing' => [
                    'sentiment_trigger' => 'neutral / positive',
                    'strategy' => 'Proactive Amplification Media Pers',
                    'action' => 'Amplifikasi capaian positif dalam artikel berita pers, susun Siaran Pers Capaian, Talking Points Juru Bicara, dan Media Fact Sheet.',
                ],
            ],
            'target_parameters' => [
                'primary_keywords' => $targetSetup->primary_keywords ?? [],
                'negative_keywords' => $targetSetup->negative_keywords ?? [],
                'persona' => $targetSetup->persona ?? '',
            ],
        ];

        return response()->json([
            'status' => 'success',
            'app_version' => config('app.version', '1.0 (Release Candidate)'),
            'total_pending' => $newsFeeds->count(),
            'instructions' => $dualModeInstruction,
            'data' => $newsFeeds->map(function ($feed) {
                return [
                    'id' => $feed->id,
                    'title' => $feed->title,
                    'source' => $feed->source,
                    'url' => $feed->url,
                    'published_at' => $feed->published_at ? $feed->published_at->toIso8601String() : null,
                    'raw_content' => $feed->raw_content,
                    'status' => $feed->status,
                    'ai_status' => $feed->ai_status,
                    'velocity_score' => $feed->velocity_score,
                    'sentiment' => $feed->sentiment,
                ];
            }),
        ], 200);
    }

    /**
     * POST /api/v1/hermes/webhook
     * 
     * Menerima payload hasil analisis dan naskah reframing dari Hermes Agent.
     */
    public function webhook(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'news_id' => 'required|integer|exists:news_feeds,id',
            'status' => 'required|string|in:success,integrity_alert',
            'velocity_score' => 'required|integer|min:0|max:100',
            'sentiment' => 'required|string|in:positive,neutral,negative',
            'fact_anchor' => 'nullable|array',
            'scripts' => 'nullable|array',
        ], [
            'news_id.required' => 'Field news_id wajib diisi.',
            'news_id.exists' => 'Data berita dengan news_id tersebut tidak ditemukan di database.',
            'status.in' => 'Status AI harus bernilai success atau integrity_alert.',
            'sentiment.in' => 'Sentiment harus bernilai positive, neutral, atau negative.',
            'velocity_score.min' => 'Velocity score minimal 0.',
            'velocity_score.max' => 'Velocity score maksimal 100.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi payload webhook Hermes gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        $newsFeed = NewsFeed::findOrFail($validated['news_id']);

        $newsFeed->update([
            'ai_status' => $validated['status'],
            'velocity_score' => $validated['velocity_score'],
            'sentiment' => $validated['sentiment'],
            'fact_anchor' => $validated['fact_anchor'] ?? null,
            'scripts' => $validated['scripts'] ?? null,
            'status' => 'analyzed',
        ]);

        // Trigger NewCrisisAlert jika velocity_score >= 40 atau status == 'integrity_alert'
        if ($validated['velocity_score'] >= 40 || $validated['status'] === 'integrity_alert') {
            $users = User::all();
            if ($users->isNotEmpty()) {
                Notification::send($users, new NewCrisisAlert($newsFeed));
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Hasil pemikiran Hermes Agent berhasil diperbarui ke database.',
            'data' => [
                'news_id' => $newsFeed->id,
                'title' => $newsFeed->title,
                'ai_status' => $newsFeed->ai_status,
                'velocity_score' => $newsFeed->velocity_score,
                'sentiment' => $newsFeed->sentiment,
                'fact_anchor' => $newsFeed->fact_anchor,
                'scripts' => $newsFeed->scripts,
                'updated_at' => $newsFeed->updated_at->toIso8601String(),
            ],
        ], 200);
    }
}
