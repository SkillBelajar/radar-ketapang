<?php

namespace App\Jobs;

use App\Models\NewsFeed;
use App\Models\TargetSetup;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class FetchNewsFeedJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public array $customFeeds = []
    ) {}

    /**
     * Execute the job: store 3 sample credible political news feeds.
     */
    public function handle(): void
    {
        $targetSetup = TargetSetup::getOrCreate();
        $primary = $targetSetup->primary_keywords ?? ['Bupati Ketapang'];
        $firstKeyword = is_array($primary) && count($primary) > 0 ? $primary[0] : 'Ketapang';

        $timestamp = now();
        $randomBatchId = substr(md5((string) microtime(true)), 0, 5);

        // 3 sample credible news feeds relevant to Kabupaten Ketapang
        $sampleFeeds = !empty($this->customFeeds) ? $this->customFeeds : [
            [
                'title' => "Pemerintah Daerah Bahas Percepatan Infrastruktur Jalan & Jembatan Pawan ({$firstKeyword})",
                'source' => 'Antara Kalbar',
                'url' => 'https://kalbar.antaranews.com/berita/infrastruktur-ketapang-' . $randomBatchId,
                'published_at' => $timestamp->copy()->subMinutes(15),
                'raw_content' => "Pemerintah Kabupaten Ketapang bersama pemangku kepentingan menggelar rapat koordinasi terkait alokasi anggaran perbaikan jalan poros utama kecamatan dan jembatan penghubung.",
                'status' => 'pending',
            ],
            [
                'title' => "Dinamika Elektabilitas Pasangan Calon Jelang Pemilihan di Wilayah Hulu Ketapang",
                'source' => 'Pontianak Post',
                'url' => 'https://pontianakpost.jawapos.com/ketapang/dinamika-politik-' . $randomBatchId,
                'published_at' => $timestamp->copy()->subHours(1),
                'raw_content' => "Lembaga survei regional merilis temuan terbaru terkait tingkat kepuasan publik terhadap kinerja figur kepemimpinan serta isu krusial stabilitas harga komoditas perkebunan.",
                'status' => 'pending',
            ],
            [
                'title' => "Warganet Soroti Efektivitas Penanganan Karhutla & Fasilitas Layanan Publik Ketapang",
                'source' => 'Suara Ketapang News',
                'url' => 'https://suaraketapang.id/fokus-layanan-publik-' . $randomBatchId,
                'published_at' => $timestamp->copy()->subHours(2),
                'raw_content' => "Diskusi hangat di media sosial menyoroti kesiapsiagaan tim gabungan di lapangan serta pentingnya komunikasi transparan dari pimpinan daerah kepada masyarakat.",
                'status' => 'pending',
            ],
        ];

        foreach ($sampleFeeds as $feed) {
            NewsFeed::create($feed);
        }

        Log::info("FetchNewsFeedJob successfully stored 3 news feeds for batch [{$randomBatchId}].");
    }
}
