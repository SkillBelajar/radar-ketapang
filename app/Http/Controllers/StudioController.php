<?php

namespace App\Http\Controllers;

use App\Models\NewsFeed;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudioController extends Controller
{
    /**
     * Tampilkan halaman 1-Click Influencer Studio.
     * Difokuskan untuk Role 'influencer' dan 'timses'.
     */
    public function index(Request $request): Response
    {
        $platform = $request->query('platform', 'all'); // all, tiktok, x, instagram
        $sentimentFilter = $request->query('sentiment', 'all'); // all, negative, positive, neutral

        $query = NewsFeed::where('ai_status', 'success')
            ->whereNotNull('scripts');

        if ($sentimentFilter !== 'all') {
            $query->where('sentiment', $sentimentFilter);
        }

        $newsFeeds = $query->orderBy('velocity_score', 'desc')
            ->orderBy('published_at', 'desc')
            ->get();

        $stats = [
            'total_scripts' => NewsFeed::where('ai_status', 'success')->whereNotNull('scripts')->count(),
            'defensive_count' => NewsFeed::where('ai_status', 'success')->whereNotNull('scripts')->where('sentiment', 'negative')->count(),
            'proactive_count' => NewsFeed::where('ai_status', 'success')->whereNotNull('scripts')->whereIn('sentiment', ['positive', 'neutral'])->count(),
            'high_crisis_count' => NewsFeed::where('ai_status', 'success')->whereNotNull('scripts')->where('velocity_score', '>=', 75)->count(),
        ];

        return Inertia::render('Studio/Index', [
            'newsFeeds' => $newsFeeds,
            'stats' => $stats,
            'filters' => [
                'platform' => $platform,
                'sentiment' => $sentimentFilter,
            ],
            'currentUserRole' => $request->user()->role ?? 'influencer',
        ]);
    }
}
