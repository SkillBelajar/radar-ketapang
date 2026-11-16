<?php

namespace App\Http\Controllers;

use App\Models\NewsFeed;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudioController extends Controller
{
    /**
     * Tampilkan halaman Media & Press Response Studio (Pusat Klarifikasi & Respon Berita Pers).
     * Fokus pada perumusan Siaran Pers Resmi, Pernyataan Juru Bicara, dan Lembar Hak Jawab Redaksi.
     */
    public function index(Request $request): Response
    {
        $platform = $request->query('platform', 'all'); // all, press_release, spokesperson, editorial_reply
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
