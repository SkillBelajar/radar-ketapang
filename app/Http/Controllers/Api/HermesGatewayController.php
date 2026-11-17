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

    /**
     * GET /api/v1/hermes/target-parameters
     * 
     * Memberikan kata kunci dan instruksi pemantauan terkini kepada Hermes Agent.
     */
    public function targetParameters(): JsonResponse
    {
        $targetSetup = TargetSetup::getOrCreate();
        $existingUrls = NewsFeed::latest('id')->take(500)->pluck('url')->toArray();
        $existingTitles = NewsFeed::latest('id')->take(200)->pluck('title')->toArray();
        $totalNews = NewsFeed::count();

        return response()->json([
            'status' => 'success',
            'app_version' => config('app.version', '1.0 (Release Candidate)'),
            'candidate_profile' => [
                'name' => $targetSetup->candidate_name ?? '',
                'political_role' => $targetSetup->political_role ?? 'Calon Kepala Daerah (Bupati/Walikota/Gubernur)',
                'electoral_district' => $targetSetup->electoral_district ?? 'Daerah Sasaran',
                'branding_tagline' => $targetSetup->branding_tagline ?? 'Bekerja Nyata untuk Kesejahteraan & Keadilan Warga',
                'branding_pillars' => $targetSetup->branding_pillars ?? [
                    'Infrastruktur Konektivitas Jalan Poros & Jembatan',
                    'Stabilitas Harga Sembako, Pupuk & Hasil Tani/Kebun',
                    'Peningkatan Mutu Puskesmas & Layanan RS Bebas Pungli',
                    'Pembukaan Lapangan Kerja Pemuda & Dukungan UMKM',
                ],
                'branding_goal' => $targetSetup->branding_goal ?? 'Membangun persepsi kepemimpinan yang merakyat, cepat tanggap, solutif, dan membela kepentingan masyarakat di ruang publik maupun media sosial.',
                'persona' => $targetSetup->persona ?? 'Gaya bahasa merakyat, tenang namun tegas, berorientasi solusi nyata, dan mengedepankan empati keluarga besar masyarakat.',
            ],
            'primary_keywords' => $targetSetup->primary_keywords ?? ['Pilkada', 'Politik Daerah'],
            'negative_keywords' => $targetSetup->negative_keywords ?? ['jual beli motor', 'lowongan kerja', 'promo pulsa', 'casino slot'],
            'persona' => $targetSetup->persona ?? 'Gaya bahasa merakyat, tenang namun tegas, berorientasi solusi nyata, dan mengedepankan empati keluarga besar masyarakat.',
            'trusted_press_portals' => [
                'Antara Kalbar' => 'https://kalbar.antaranews.com',
                'Pontianak Post' => 'https://pontianakpost.jawapos.com',
                'Suara Pemred Kalbar' => 'https://suarapemredkalbar.com',
                'Tribun Pontianak' => 'https://pontianak.tribunnews.com',
            ],
            'existing_urls' => $existingUrls,
            'existing_titles' => $existingTitles,
            'total_existing_news' => $totalNews,
            'instructions' => [
                'role' => 'Hermes bertindak sebagai Konsultan Intelijen Media & Personal Branding Politik Strategis.',
                'crontab_schedule' => 'Jalankan otomatis setiap hari pukul 05:00 WIB (0 5 * * *).',
                'anti_duplication' => 'WAJIB: Periksa existing_urls dan existing_titles. JANGAN PERNAH mengambil ulang berita yang sudah ada di sistem.',
                'freshness_rule' => 'Ambil HANYA berita terbaru (terbit 24-48 jam terakhir). Jangan ambil berita basi.',
                'selection_rule' => 'Pilih TEPAT 9 berita paling berdampak nyata bagi masyarakat dan berpotensi tinggi mengangkat personal branding kandidat (bukan seremonial kaku).',
                'personal_branding_mission' => 'Konversi setiap isu daerah menjadi momentum panggung kepemimpinan tokoh. Tampilkan tokoh sebagai figur merakyat yang cepat tanggap, membela hak wong cilik, dan menawarkan solusi konkret terpercaya.',
                'identity_framing' => 'Susun naskah dengan empati mendalam (Identity Framing Warga), gaya tutur santun & merakyat ala Feynman, serta kepastian solusi nyata yang memuaskan masyarakat pemilih.',
                'task' => 'Cari berita harian berdasarkan kata kunci & profil kandidat di atas, eliminasi berita lama & duplikat, lakukan analisis mendalam, lalu kirimkan 9 paket berita lengkap ke push_endpoint.',
                'push_endpoint' => url('/api/v1/hermes/push-news'),
                'scoring_rules' => [
                    'sentiment' => 'positive, neutral, negative',
                    'velocity_score' => '0 (tenang) hingga 100 (krisis viral)',
                    'fact_anchor' => 'petakan tuduhan vs fakta lapangan vs dokumen rujukan vs sudut pandang branding tokoh',
                    'scripts' => 'susun naskah lengkap: social_caption, candidate_statement, spokesperson, press_release, editorial_reply',
                ],
            ],
        ], 200);
    }

    /**
     * POST /api/v1/hermes/push-news
     * 
     * Menerima kiriman berita baru harian yang SUDAH dianalisis oleh Hermes Agent.
     * Sistem web tidak mengambil berita sendiri, melainkan menerima push dari Hermes.
     */
    public function pushNews(Request $request): JsonResponse
    {
        $payload = $request->all();
        $articles = isset($payload['articles']) && is_array($payload['articles'])
            ? $payload['articles']
            : (isset($payload['title']) ? [$payload] : []);

        if (empty($articles)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Format payload tidak sesuai. Kirimkan array "articles" atau objek artikel berita tunggal.',
            ], 422);
        }

        $savedCount = 0;
        $updatedCount = 0;
        $processed = [];

        foreach ($articles as $index => $item) {
            $validator = Validator::make($item, [
                'title' => 'required|string|max:500',
                'source' => 'required|string|max:150',
                'url' => 'required|string|max:2000',
                'published_at' => 'nullable|date',
                'raw_content' => 'required|string',
                'velocity_score' => 'required|integer|min:0|max:100',
                'sentiment' => 'required|string|in:positive,neutral,negative',
                'status' => 'nullable|string|in:success,integrity_alert,analyzed',
                'fact_anchor' => 'nullable|array',
                'scripts' => 'nullable|array',
            ], [
                'title.required' => "Judul artikel index {$index} wajib diisi.",
                'source.required' => "Sumber media index {$index} wajib diisi.",
                'url.required' => "URL artikel index {$index} wajib diisi.",
                'raw_content.required' => "Isi berita index {$index} wajib diisi.",
                'velocity_score.required' => "Skor suhu kecepatan krisis index {$index} wajib diisi.",
                'sentiment.required' => "Sentimen index {$index} wajib diisi (positive/neutral/negative).",
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Validasi artikel pada index {$index} gagal.",
                    'errors' => $validator->errors(),
                ], 422);
            }

            $validated = $validator->validated();

            // Hindari duplikasi berdasarkan URL berita yang sama
            $newsFeed = NewsFeed::where('url', $validated['url'])->first();
            $isNew = false;

            if (!$newsFeed) {
                $newsFeed = new NewsFeed();
                $newsFeed->url = $validated['url'];
                $isNew = true;
            }

            $newsFeed->title = $validated['title'];
            $newsFeed->source = $validated['source'];
            $newsFeed->published_at = !empty($validated['published_at']) ? $validated['published_at'] : now();
            $newsFeed->raw_content = $validated['raw_content'];
            $newsFeed->velocity_score = $validated['velocity_score'];
            $newsFeed->sentiment = $validated['sentiment'];
            $newsFeed->status = 'analyzed';
            $newsFeed->ai_status = $validated['status'] ?? ($validated['velocity_score'] >= 85 && $validated['sentiment'] === 'negative' ? 'integrity_alert' : 'success');
            $newsFeed->fact_anchor = $validated['fact_anchor'] ?? null;
            $newsFeed->scripts = $validated['scripts'] ?? null;
            $newsFeed->save();

            if ($isNew) {
                $savedCount++;
            } else {
                $updatedCount++;
            }

            // Kirim notifikasi jika krisis hangat (score >= 40) atau integrity_alert
            if ($newsFeed->velocity_score >= 40 || $newsFeed->ai_status === 'integrity_alert') {
                $users = User::all();
                if ($users->isNotEmpty()) {
                    Notification::send($users, new NewCrisisAlert($newsFeed));
                }
            }

            $processed[] = [
                'id' => $newsFeed->id,
                'title' => $newsFeed->title,
                'source' => $newsFeed->source,
                'velocity_score' => $newsFeed->velocity_score,
                'sentiment' => $newsFeed->sentiment,
                'ai_status' => $newsFeed->ai_status,
                'status' => $newsFeed->status,
            ];
        }

        return response()->json([
            'status' => 'success',
            'message' => "Berhasil memproses kiriman berita dari Hermes Agent: {$savedCount} berita baru disimpan, {$updatedCount} berita diperbarui.",
            'total_received' => count($articles),
            'new_saved' => $savedCount,
            'updated' => $updatedCount,
            'data' => $processed,
        ], 200);
    }
}
