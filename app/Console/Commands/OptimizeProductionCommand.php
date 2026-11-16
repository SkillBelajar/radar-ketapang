<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class OptimizeProductionCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:optimize {--clear : Hanya bersihkan seluruh cache aplikasi}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Jalankan pipeline optimasi performa Laravel Octane untuk high-concurrency production';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('================================================================');
        $this->info('  RADAR POLITIK KETAPANG // PRODUCTION OPTIMIZATION PIPELINE    ');
        $this->info('================================================================');

        $this->line('<comment>[1/5] Menghapus cache usang (optimize:clear)...</comment>');
        $this->call('optimize:clear');

        if ($this->option('clear')) {
            $this->info('Cache berhasil dibersihkan!');
            return 0;
        }

        $this->line('<comment>[2/5] Meng-cache konfigurasi aplikasi (config:cache)...</comment>');
        $this->call('config:cache');

        $this->line('<comment>[3/5] Meng-cache routing tabel web & API (route:cache)...</comment>');
        $this->call('route:cache');

        $this->line('<comment>[4/5] Meng-cache Blade templates & views (view:cache)...</comment>');
        $this->call('view:cache');

        $this->line('<comment>[5/5] Me-reload worker Laravel Octane (octane:reload)...</comment>');
        try {
            $this->call('octane:reload');
            $this->info('Worker Laravel Octane berhasil di-reload.');
        } catch (\Throwable $e) {
            $this->warn('Catatan: Octane reload dilewati atau server belum aktif.');
        }

        $this->newLine();
        $this->info('🚀 Sukses! Aplikasi telah teroptimasi penuh untuk lingkungan Production High Concurrency.');

        return 0;
    }
}
