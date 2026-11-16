<?php

namespace App\Http\Controllers;

use App\Jobs\FetchNewsFeedJob;
use App\Models\NewsFeed;
use App\Models\TargetSetup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Tampilkan halaman Dasbor Analisis (Radar Politik & AI Output Berita Pers).
     */
    public function index(Request $request): Response
    {
        $sort = $request->query('sort', 'velocity'); // 'velocity' | 'recent'
        $sentimentFilter = $request->query('sentiment'); // 'positive' | 'neutral' | 'negative' | null
        $alertOnly = $request->boolean('alert_only');

        // Query news_feeds yang sudah diproses oleh AI (ai_status != 'pending')
        $query = NewsFeed::where('ai_status', '!=', 'pending');

        if ($sentimentFilter && in_array($sentimentFilter, ['positive', 'neutral', 'negative'])) {
            $query->where('sentiment', $sentimentFilter);
        }

        if ($alertOnly) {
            $query->where('ai_status', 'integrity_alert');
        }

        if ($sort === 'recent') {
            $query->orderBy('published_at', 'desc')->orderBy('id', 'desc');
        } else {
            // Default: Krisis terpanas di atas (velocity_score DESC)
            $query->orderBy('velocity_score', 'desc')->orderBy('id', 'desc');
        }

        $analyzedFeeds = $query->get()->map(function ($feed) {
            return [
                'id' => $feed->id,
                'title' => $feed->title,
                'source' => $feed->source,
                'url' => $feed->url,
                'published_at' => $feed->published_at ? $feed->published_at->toIso8601String() : null,
                'raw_content' => $feed->raw_content,
                'status' => $feed->status,
                'ai_status' => $feed->ai_status,
                'velocity_score' => (int) $feed->velocity_score,
                'sentiment' => $feed->sentiment,
                'fact_anchor' => is_array($feed->fact_anchor) ? $feed->fact_anchor : json_decode($feed->fact_anchor ?? '[]', true) ?? [],
                'scripts' => is_array($feed->scripts) ? $feed->scripts : json_decode($feed->scripts ?? '[]', true) ?? [],
                'created_at' => $feed->created_at ? $feed->created_at->toIso8601String() : null,
                'updated_at' => $feed->updated_at ? $feed->updated_at->toIso8601String() : null,
            ];
        });

        // Summary Metric Stats
        $allCount = NewsFeed::count();
        $analyzedCount = NewsFeed::where('ai_status', '!=', 'pending')->count();
        $pendingCount = NewsFeed::where('ai_status', 'pending')->count();

        $criticalCount = NewsFeed::where('ai_status', '!=', 'pending')
            ->where('velocity_score', '>=', 75)
            ->count();

        $warningCount = NewsFeed::where('ai_status', '!=', 'pending')
            ->whereBetween('velocity_score', [40, 74])
            ->count();

        $safeCount = NewsFeed::where('ai_status', '!=', 'pending')
            ->where('velocity_score', '<', 40)
            ->count();

        $integrityAlertCount = NewsFeed::where('ai_status', 'integrity_alert')->count();

        $targetSetup = TargetSetup::first();

        return Inertia::render('Dashboard', [
            'feeds' => $analyzedFeeds,
            'stats' => [
                'total_monitored' => $allCount,
                'total_analyzed' => $analyzedCount,
                'total_pending' => $pendingCount,
                'critical_count' => $criticalCount,
                'warning_count' => $warningCount,
                'safe_count' => $safeCount,
                'integrity_alert_count' => $integrityAlertCount,
            ],
            'filters' => [
                'sort' => $sort,
                'sentiment' => $sentimentFilter,
                'alert_only' => $alertOnly,
            ],
            'targetSetup' => $targetSetup ? [
                'primary_keywords' => $targetSetup->primary_keywords ?? [],
                'persona' => $targetSetup->persona ?? '',
            ] : null,
        ]);
    }

    /**
     * Tarik berita portal online aktual secara langsung (Live News Fetch).
     */
    public function triggerFetch(Request $request): RedirectResponse
    {
        try {
            (new FetchNewsFeedJob())->handle();
            return redirect()->back()->with('success', 'Berhasil menarik 3 berita portal online terkini ke sistem radar.');
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Gagal menarik berita aktual: ' . $e->getMessage());
        }
    }
}
