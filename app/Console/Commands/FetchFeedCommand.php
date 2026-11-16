<?php

namespace App\Console\Commands;

use App\Jobs\FetchNewsFeedJob;
use App\Models\NewsFeed;
use Illuminate\Console\Command;

class FetchFeedCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'feed:fetch {--queue : Dispatch to Redis queue only}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Simulate fetching news and media feeds for political radar monitoring and store in database';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('====================================================');
        $this->info('  RADAR POLITIK KETAPANG // CREDIBLE FEED HUB v0.15 ');
        $this->info('====================================================');
        
        $initialCount = NewsFeed::count();
        $this->line("<comment>Total berita sebelum fetch:</comment> {$initialCount}");

        if ($this->option('queue')) {
            $this->info('Mengirim FetchNewsFeedJob ke Redis Queue...');
            FetchNewsFeedJob::dispatch();
            $this->info('Job berhasil dimasukkan ke antrean Redis.');
            return Command::SUCCESS;
        }

        // Jalankan dispatch ke antrean Redis untuk menguji driver redis
        try {
            $this->line('1. Menguji koneksi antrean Redis...');
            FetchNewsFeedJob::dispatch()->onQueue('feeds');
            $this->info('   [OK] Redis Queue Dispatch Terverifikasi.');
        } catch (\Throwable $e) {
            $this->warn('   [WARN] Redis queue: ' . $e->getMessage());
        }

        // Eksekusi job untuk menyimpan 3 berita sampel langsung ke database
        $this->line('2. Menjalankan penarikan 3 sampel berita terpercaya...');
        $job = new FetchNewsFeedJob();
        $job->handle();

        $newCount = NewsFeed::count();
        $added = $newCount - $initialCount;

        $this->info("   [OK] Sukses menyimpan {$added} berita baru ke tabel 'news_feeds'!");
        $this->line("<comment>Total berita tersimpan sekarang:</comment> {$newCount}");

        // Tampilkan 3 berita terbaru dalam tabel konsol
        $latest = NewsFeed::latest('id')->take(3)->get(['id', 'title', 'source', 'url', 'status']);
        $this->table(
            ['ID', 'Judul Berita', 'Sumber', 'URL', 'Status'],
            $latest->toArray()
        );

        return Command::SUCCESS;
    }
}
