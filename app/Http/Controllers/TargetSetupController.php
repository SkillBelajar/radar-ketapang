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
            'candidate_name' => ['nullable', 'string', 'max:255'],
            'political_role' => ['nullable', 'string', 'max:255'],
            'electoral_district' => ['nullable', 'string', 'max:255'],
            'branding_tagline' => ['nullable', 'string', 'max:500'],
            'branding_pillars' => ['nullable'],
            'branding_goal' => ['nullable', 'string', 'max:2000'],
            'primary_keywords' => ['nullable'],
            'negative_keywords' => ['nullable'],
            'persona' => ['required', 'string', 'max:2000'],
        ]);

        // Normalize primary keywords & branding pillars to array
        $primary = $this->normalizeKeywords($validated['primary_keywords'] ?? []);
        $negative = $this->normalizeKeywords($validated['negative_keywords'] ?? []);
        $pillars = $this->normalizeKeywords($validated['branding_pillars'] ?? []);

        $targetSetup = TargetSetup::getOrCreate();
        $targetSetup->update([
            'candidate_name' => $validated['candidate_name'] ?? $targetSetup->candidate_name,
            'political_role' => $validated['political_role'] ?? $targetSetup->political_role,
            'electoral_district' => $validated['electoral_district'] ?? $targetSetup->electoral_district,
            'branding_tagline' => $validated['branding_tagline'] ?? $targetSetup->branding_tagline,
            'branding_pillars' => !empty($pillars) ? $pillars : $targetSetup->branding_pillars,
            'branding_goal' => $validated['branding_goal'] ?? $targetSetup->branding_goal,
            'primary_keywords' => $primary,
            'negative_keywords' => $negative,
            'persona' => $validated['persona'],
        ]);

        return redirect()->back()->with('success', 'Profil kandidat, pilar personal branding, dan pengaturan kata kunci berhasil disimpan.');
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
