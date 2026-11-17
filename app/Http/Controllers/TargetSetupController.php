<?php

namespace App\Http\Controllers;

use App\Jobs\FetchNewsFeedJob;
use App\Models\NewsFeed;
use App\Models\TargetSetup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\Response;

class TargetSetupController extends Controller
{
    /**
     * Display the Target Setup & Credible Feed Hub dashboard.
     */
    public function index(Request $request): InertiaResponse|Response
    {
        // Enforce RBAC: Only 'admin' and 'timses' roles are authorized
        $user = $request->user();
        if (!$user || !in_array($user->role, ['admin', 'timses'])) {
            return Inertia::render('Errors/Forbidden', [
                'status' => 403,
                'module' => 'Pengaturan Sasaran & Kata Kunci',
                'userRole' => $user?->role ?? 'influencer',
            ])->toResponse($request)->setStatusCode(403);
        }

        $targetSetup = TargetSetup::getOrCreate();
        $recentFeeds = NewsFeed::latest('id')->take(8)->get();
        $totalFeeds = NewsFeed::count();

        return Inertia::render('TargetSetup/Index', [
            'targetSetup' => $targetSetup,
            'recentFeeds' => $recentFeeds,
            'totalFeeds' => $totalFeeds,
            'userRole' => $user->role,
        ]);
    }

    /**
     * Update the single-row target setup configuration.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['admin', 'timses'])) {
            abort(403, 'Akses Ditolak: Anda tidak memiliki izin untuk mengubah konfigurasi target.');
        }

        $validated = $request->validate([
            'primary_keywords' => ['nullable'],
            'negative_keywords' => ['nullable'],
            'persona' => ['required', 'string', 'max:2000'],
        ]);

        // Normalize primary keywords to array
        $primary = $this->normalizeKeywords($validated['primary_keywords'] ?? []);
        $negative = $this->normalizeKeywords($validated['negative_keywords'] ?? []);

        $targetSetup = TargetSetup::getOrCreate();
        $targetSetup->update([
            'primary_keywords' => $primary,
            'negative_keywords' => $negative,
            'persona' => $validated['persona'],
        ]);

        return redirect()->back()->with('success', 'Pengaturan kata kunci dan profil tokoh berhasil disimpan.');
    }

    /**
     * Trigger simulated news feed fetching via queue job.
     */
    public function triggerFetch(Request $request): RedirectResponse
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['admin', 'timses'])) {
            abort(403, 'Akses Ditolak.');
        }

        // Dispatch job synchronously or to Redis queue
        try {
            FetchNewsFeedJob::dispatch()->onQueue('feeds');
            (new FetchNewsFeedJob())->handle();
            return redirect()->back()->with('success', 'Berhasil mengambil berita contoh baru (+3 berita ditambahkan).');
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Gagal memicu penarikan feed: ' . $e->getMessage());
        }
    }

    /**
     * Helper to clean up keywords into array of trimmed strings.
     */
    private function normalizeKeywords(mixed $raw): array
    {
        if (is_array($raw)) {
            return array_values(array_filter(array_map('trim', $raw)));
        }

        if (is_string($raw)) {
            $parts = preg_split('/[\r\n,]+/', $raw);
            return array_values(array_filter(array_map('trim', $parts)));
        }

        return [];
    }
}
