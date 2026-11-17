<?php

namespace App\Http\Controllers;

use App\Models\NewsFeed;
use App\Models\TargetSetup;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    /**
     * Tampilkan halaman Sentiment Shift Tracker & Weekly Audit Log (Slice 7)
     */
    public function index(Request $request): Response
    {
        // 1. sentimentTrend: 7 hari terakhir (H-6 sampai H-0)
        $endDate = Carbon::now()->endOfDay();
        $startDate = Carbon::now()->subDays(6)->startOfDay();

        // Ambil semua berita dalam rentang 7 hari terakhir
        $recentFeeds = NewsFeed::where(function ($query) use ($startDate, $endDate) {
            $query->whereBetween('published_at', [$startDate, $endDate])
                ->orWhere(function ($sub) use ($startDate, $endDate) {
                    $sub->whereNull('published_at')
                        ->whereBetween('created_at', [$startDate, $endDate]);
                });
        })->get();

        $sentimentTrend = [];
        $dayNamesIndo = [
            'Sunday' => 'Minggu',
            'Monday' => 'Senin',
            'Tuesday' => 'Selasa',
            'Wednesday' => 'Rabu',
            'Thursday' => 'Kamis',
            'Friday' => 'Jumat',
            'Saturday' => 'Sabtu',
        ];

        for ($i = 6; $i >= 0; $i--) {
            $currentDay = Carbon::now()->subDays($i);
            $dateStr = $currentDay->format('Y-m-d');
            $dayEnglish = $currentDay->format('l');
            $shortDay = $dayNamesIndo[$dayEnglish] ?? $currentDay->format('D');
            $shortDate = $currentDay->format('d M');

            // Filter item pada tanggal ini
            $dayFeeds = $recentFeeds->filter(function ($item) use ($dateStr) {
                $itemDate = $item->published_at ? $item->published_at->format('Y-m-d') : $item->created_at->format('Y-m-d');
                return $itemDate === $dateStr;
            });

            $positive = $dayFeeds->where('sentiment', 'positive')->count();
            $neutral = $dayFeeds->where('sentiment', 'neutral')->count();
            $negative = $dayFeeds->where('sentiment', 'negative')->count();
            $integrity = $dayFeeds->where('ai_status', 'integrity_alert')->count();
            $total = $dayFeeds->count();
            // Net sentiment score: Positif - Negatif (indikator arah angin opini publik)
            $netSentiment = $positive - $negative;

            $sentimentTrend[] = [
                'date' => $dateStr,
                'label' => $shortDate,
                'fullLabel' => "{$shortDay}, {$shortDate}",
                'day' => $shortDay,
                'positive' => $positive,
                'neutral' => $neutral,
                'negative' => $negative,
                'integrity' => $integrity,
                'total' => $total,
                'netSentiment' => $netSentiment,
            ];
        }

        // 2. auditLogs: Rekapitulasi tindakan AI & Kinerja Sistem
        $allProcessed = NewsFeed::where('ai_status', '!=', 'pending')->get();

        $totalProcessed = $allProcessed->count();
        $integrityAlertsCount = $allProcessed->where('ai_status', 'integrity_alert')->count();
        $defensiveScriptsCount = $allProcessed->filter(function ($f) {
            return $f->sentiment === 'negative' && !empty($f->scripts);
        })->count();
        $proactiveScriptsCount = $allProcessed->filter(function ($f) {
            return $f->sentiment === 'positive' && !empty($f->scripts);
        })->count();

        // Krisis berhasil diredam/dikelola: isu berkecepatan tinggi (velocity >= 40) yang skripnya sudah siap
        $weeklyCrisisAverted = $allProcessed->filter(function ($f) {
            return ($f->velocity_score ?? 0) >= 40 && $f->ai_status === 'success' && !empty($f->scripts);
        })->count();

        // Rata-rata skor kecepatan isu
        $avgVelocity = $totalProcessed > 0 ? round($allProcessed->avg('velocity_score'), 1) : 0;

        // Isu kritis bahaya (score >= 75)
        $criticalIsuCount = $allProcessed->where('velocity_score', '>=', 75)->count();

        // Riwayat aksi AI terinci (Audit Trail)
        $recentActions = NewsFeed::where('ai_status', '!=', 'pending')
            ->orderBy('published_at', 'desc')
            ->take(12)
            ->get()
            ->map(function ($f) {
                $actionType = 'NEUTRAL_MONITOR';
                $actionLabel = 'Monitoring Netral';
                $impact = 'Pengawasan arus informasi dasar';

                if ($f->ai_status === 'integrity_alert') {
                    $actionType = 'INTEGRITY_BLOCK';
                    $actionLabel = 'Blokir Integritas';
                    $impact = 'Narasi berisiko hukum dihentikan; dialihkan ke klarifikasi legal';
                } elseif ($f->sentiment === 'negative' && !empty($f->scripts)) {
                    $actionType = 'DEFENSIVE_REFRAME';
                    $actionLabel = 'Defensive Reframing';
                    $impact = 'Draf Siaran Pers & Pernyataan Juru Bicara Siap';
                } elseif ($f->sentiment === 'positive' && !empty($f->scripts)) {
                    $actionType = 'PROACTIVE_AMPLIFY';
                    $actionLabel = 'Proactive Amplification';
                    $impact = 'Amplifikasi rilis pers capaian positif & lembar fakta';
                }

                return [
                    'id' => $f->id,
                    'title' => $f->title,
                    'source' => $f->source,
                    'url' => $f->url,
                    'sentiment' => $f->sentiment,
                    'velocity_score' => $f->velocity_score,
                    'ai_status' => $f->ai_status,
                    'action_type' => $actionType,
                    'action_label' => $actionLabel,
                    'impact' => $impact,
                    'has_scripts' => !empty($f->scripts),
                    'has_fact_anchor' => !empty($f->fact_anchor),
                    'timestamp' => $f->published_at ? $f->published_at->format('d M Y, H:i') : $f->created_at->format('d M Y, H:i'),
                    'relative_time' => $f->published_at ? $f->published_at->diffForHumans() : $f->created_at->diffForHumans(),
                ];
            });

        $targetSetup = TargetSetup::getOrCreate();
        $targetTopic = !empty($targetSetup->primary_keywords) ? $targetSetup->primary_keywords[0] : 'Sasaran Terpantau';

        $totalPositive = $allProcessed->where('sentiment', 'positive')->count();
        $totalNegative = $allProcessed->where('sentiment', 'negative')->count();
        $totalNeutral = $allProcessed->where('sentiment', 'neutral')->count();
        $netScore = $totalPositive - $totalNegative;

        $positivePct = $totalProcessed > 0 ? round(($totalPositive / $totalProcessed) * 100, 1) : 0;
        $negativePct = $totalProcessed > 0 ? round(($totalNegative / $totalProcessed) * 100, 1) : 0;
        $neutralPct = $totalProcessed > 0 ? round(($totalNeutral / $totalProcessed) * 100, 1) : 0;

        if ($netScore > 0) {
            $dominanceStatus = 'POSITIF';
            $dominanceBadgeClass = 'text-emerald-400 bg-emerald-950/80 border-emerald-500/50';
            $dominanceLabel = "Topik {$targetTopic} Cenderung Positif (+{$netScore})";
            $dominanceDescription = "Pemberitaan saat ini didominasi kabar baik dan respon positif warga ({$positivePct}% positif).";
        } elseif ($netScore < 0) {
            $dominanceStatus = 'NEGATIF';
            $dominanceBadgeClass = 'text-rose-400 bg-rose-950/80 border-rose-500/50';
            $dominanceLabel = "Topik {$targetTopic} Cenderung Negatif ({$netScore})";
            $dominanceDescription = "Pemberitaan didominasi keluhan atau isu kritis ({$negativePct}% negatif). Butuh percepatan rilis & tanggapan.";
        } else {
            $dominanceStatus = 'SEIMBANG';
            $dominanceBadgeClass = 'text-slate-300 bg-slate-900 border-slate-700';
            $dominanceLabel = "Topik {$targetTopic} Posisi Seimbang (0)";
            $dominanceDescription = "Jumlah berita bernada positif dan kritik dalam posisi seimbang.";
        }

        $sentimentSummary = [
            'targetTopic' => $targetTopic,
            'totalPositive' => $totalPositive,
            'totalNegative' => $totalNegative,
            'totalNeutral' => $totalNeutral,
            'netScore' => $netScore,
            'positivePct' => $positivePct,
            'negativePct' => $negativePct,
            'neutralPct' => $neutralPct,
            'dominanceStatus' => $dominanceStatus,
            'dominanceLabel' => $dominanceLabel,
            'dominanceDescription' => $dominanceDescription,
            'dominanceBadgeClass' => $dominanceBadgeClass,
        ];

        $auditLogs = [
            'totalProcessed' => $totalProcessed,
            'integrityAlertsCount' => $integrityAlertsCount,
            'defensiveScriptsCount' => $defensiveScriptsCount,
            'proactiveScriptsCount' => $proactiveScriptsCount,
            'weeklyCrisisAverted' => $weeklyCrisisAverted,
            'criticalIsuCount' => $criticalIsuCount,
            'avgVelocity' => $avgVelocity,
            'trustIndexScore' => $totalProcessed > 0 ? round((($proactiveScriptsCount + $weeklyCrisisAverted) / $totalProcessed) * 100, 1) : 94.2,
            'recentActions' => $recentActions,
            'sentimentSummary' => $sentimentSummary,
        ];

        return Inertia::render('Analytics/Index', [
            'sentimentTrend' => $sentimentTrend,
            'auditLogs' => $auditLogs,
            'sentimentSummary' => $sentimentSummary,
            'appVersion' => config('app.version', '1.0 (Release Candidate)'),
        ]);
    }
}
