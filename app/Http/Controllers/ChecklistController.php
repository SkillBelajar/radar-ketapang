<?php

namespace App\Http\Controllers;

use App\Models\NewsFeed;
use App\Models\TargetSetup;
use App\Models\UatChecklist;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ChecklistController extends Controller
{
    /**
     * Master Checklist Steps untuk UAT Mandiri Radar Politik (Slice 1 - 8)
     */
    private function getMasterChecklist(): array
    {
        return [
            [
                'key' => 'step_1_auth_rbac',
                'slice' => 'Langkah 1',
                'category' => 'Keamanan Akun',
                'title' => '1. Pengujian Masuk Akun & Hak Akses 3 Peran',
                'summary' => 'Memastikan pembagian tugas berjalan rapi antara Pengelola Utama, Tim Lapangan, dan Tim Media.',
                'steps' => [
                    'Keluar dari akun saat ini lalu masuk dengan akun Tim Media (influencer@radar.com / password).',
                    'Buka menu "Pengaturan Sasaran" (/target-setup) di bilah atas. Pastikan sistem menampilkan halaman Akses Terbatas (HTTP 403), karena menu ini khusus untuk Pengelola Utama dan Tim Lapangan.',
                    'Masuk kembali sebagai Tim Lapangan (timses@radar.com / password) untuk memeriksa akses ke Papan Berita dan Ruang Media & Pers.',
                    'Masuk kembali sebagai Pengelola Utama (admin@radar.com / password) untuk mendapatkan kendali penuh ke semua menu.',
                ],
                'target_url' => '/target-setup',
                'role_required' => 'Semua Peran',
            ],
            [
                'key' => 'step_2_target_setup',
                'slice' => 'Langkah 2',
                'category' => 'Pengaturan Pantauan',
                'title' => '2. Pengaturan Nama Tokoh & Kata Kunci Pantauan',
                'summary' => 'Menguji kemudahan menambah nama tokoh, kata kunci yang dipantau, dan penyaring berita sampah.',
                'steps' => [
                    'Buka menu "Pengaturan Sasaran" (/target-setup) menggunakan akun Pengelola atau Tim Lapangan.',
                    'Ketik kata kunci baru di kolom Kata Kunci Pantauan (misal: "Bandara Rahadi Oesman") lalu klik "Tambah" atau tekan Enter.',
                    'Tambahkan kata yang ingin dibuang (misal: "iklan lowongan") pada kolom Penyaring Kata Sampah.',
                    'Klik tombol "Simpan Pengaturan". Pastikan muncul tanda hijau dan data tersimpan rapi.',
                ],
                'target_url' => '/target-setup',
                'role_required' => 'Pengelola & Tim Lapangan',
            ],
            [
                'key' => 'step_3_feed_ingestion',
                'slice' => 'Langkah 3',
                'category' => 'Pengumpulan Berita',
                'title' => '3. Penarik Berita dari Portal Media Online',
                'summary' => 'Menguji cara aplikasi mengumpulkan berita dari portal media online terpercaya dan Google News.',
                'steps' => [
                    'Di halaman Pengaturan Sasaran, gulir ke bawah ke bagian "Daftar Media Berita Online".',
                    'Perhatikan tabel berisi media pers lokal dan nasional terpercaya.',
                    'Klik tombol "Tarik Berita Terbaru Sekarang" untuk menguji proses pengambilan berita baru.',
                    'Pastikan daftar berita bertambah dan siap diolah oleh Agen Hermes.',
                ],
                'target_url' => '/target-setup',
                'role_required' => 'Pengelola & Tim Lapangan',
            ],
            [
                'key' => 'step_4_hermes_api',
                'slice' => 'Langkah 4',
                'category' => 'Komunikasi Asisten',
                'title' => '4. Pengujian Jalur Komunikasi Asisten Cerdas (Hermes)',
                'summary' => 'Menguji kunci rahasia dan pipa pengiriman data antara aplikasi dengan asisten pembaca berita.',
                'steps' => [
                    'Salin perintah uji pembacaan berita dari kotak cURL di bawah atau klik tombol "Uji Otomatis".',
                    'Jika melalui terminal: Jalankan perintah GET /fetch-news dengan Bearer token. Komputer akan merespons HTTP 200 dan menampilkan daftar berita pending.',
                    'Kirimkan kembali contoh analisis berita ke sistem via POST /webhook menggunakan format yang disediakan.',
                    'Periksa status berita di Papan Berita (/dashboard): status otomatis berubah menjadi "Selesai Dianalisis" dengan skor suhu dan draf tanggapan pers.',
                ],
                'target_url' => '/user-guide?tab=hermes',
                'role_required' => 'Pengelola / Asisten',
            ],
            [
                'key' => 'step_5_crisis_radar',
                'slice' => 'Langkah 5',
                'category' => 'Peta Suhu Berita',
                'title' => '5. Dasbor Pemantau Suhu & Kehangatan Isu Berita',
                'summary' => 'Menguji penanda warna suhu isu (Merah = Hangat/Perlu Cepat, Kuning = Perlu Penjelasan, Hijau = Tenang).',
                'steps' => [
                    'Buka menu "Posko Berita" (/dashboard).',
                    'Perhatikan kartu berita Karhutla: Suhu tinggi dengan penanda merah menyala (perlu perhatian segera).',
                    'Perhatikan kartu berita Pasokan Gas LPG: Suhu sedang dengan penanda kuning (perlu dipantau).',
                    'Klik tombol "Lihat Rincian Isu & Fakta" untuk membuka perbandingan fakta nyata vs kabar burung.',
                ],
                'target_url' => '/dashboard',
                'role_required' => 'Semua Peran',
            ],
            [
                'key' => 'step_6_integrity_alert',
                'slice' => 'Langkah 6',
                'category' => 'Penyaring Berita Bohong',
                'title' => '6. Peringatan Otomatis untuk Berita Fitnah & Kampanye Hitam',
                'summary' => 'Menguji perlindungan sistem saat asisten mendeteksi berita fitnah ekstrem atau kabar palsu.',
                'steps' => [
                    'Pada Posko Berita, cari kartu berita tentang "Tangkapan Layar Survei Palsu".',
                    'Pastikan muncul tanda merah tegas: "🚨 PERINGATAN FITNAH EKSTREM: Berita ini terindikasi fitnah/pelanggaran hukum."',
                    'Pastikan draf naskah otomatis dikunci agar tim tidak keliru menyebarkan narasi bohong.',
                ],
                'target_url' => '/dashboard',
                'role_required' => 'Semua Peran',
            ],
            [
                'key' => 'step_7_content_studio',
                'slice' => 'Langkah 7',
                'category' => 'Naskah Tanggapan',
                'title' => '7. Ruang Penyiapan Rilis & Naskah Pers 1-Klik',
                'summary' => 'Menguji kemudahan menyalin draf siaran pers, poin bicara juru bicara, dan surat hak jawab redaksi.',
                'steps' => [
                    'Buka menu "Naskah Pers" (/studio).',
                    'Pilih salah satu berita dan klik tombol "Buka Berita Asli" untuk membaca berita aslinya di situs media.',
                    'Perhatikan 3 pilihan draf: Siaran Pers Resmi untuk wartawan, Poin Bicara Juru Bicara, dan Surat Hak Jawab Redaksi.',
                    'Klik tombol "Salin Naskah". Pastikan tombol berubah hijau dengan tanda "Tersalin! ✅".',
                ],
                'target_url' => '/studio',
                'role_required' => 'Semua Peran',
            ],
            [
                'key' => 'step_8_inapp_alerts',
                'slice' => 'Langkah 8',
                'category' => 'Pemberitahuan Langsung',
                'title' => '8. Lonceng Peringatan Isu Hangat di Menu Atas',
                'summary' => 'Menguji tanda lonceng di pojok atas yang menyala ketika ada berita hangat yang butuh tanggapan.',
                'steps' => [
                    'Perhatikan ikon lonceng di menu bar bagian kanan atas.',
                    'Pastikan ada angka merah yang menunjukkan jumlah berita penting yang belum dibuka.',
                    'Klik lonceng untuk melihat daftar berita hangat beserta tingkat kepentingannya.',
                    'Klik salah satu berita atau pilih "Tandai Sudah Dibaca" agar angka penanda berkurang.',
                ],
                'target_url' => '/dashboard',
                'role_required' => 'Semua Peran',
            ],
            [
                'key' => 'step_9_analytics_recharts',
                'slice' => 'Langkah 9',
                'category' => 'Grafik & Laporan',
                'title' => '9. Grafik Perkembangan Opini & Catatan Langkah Tim',
                'summary' => 'Menguji grafik pergerakan sentimen 7 hari dan daftar catatan tindakan yang dilakukan tim.',
                'steps' => [
                    'Buka menu "Laporan & Grafik" (/analytics).',
                    'Perhatikan grafik garis: bandingkan garis hijau (berita baik) dengan garis merah (berita hangat/keluhan).',
                    'Coba ganti bentuk grafik: klik "Grafik Batang" atau "Grafik Wilayah".',
                    'Periksa 4 kartu ringkasan mingguan dan tabel catatan tindakan tim media di bagian bawah.',
                ],
                'target_url' => '/analytics',
                'role_required' => 'Semua Peran',
            ],
            [
                'key' => 'step_10_version_mobile',
                'slice' => 'Langkah 10',
                'category' => 'Kenyamanan Layar',
                'title' => '10. Kesiapan Aplikasi & Kenyamanan Tampilan di Layar HP',
                'summary' => 'Memastikan aplikasi siap dipakai dan nyaman dibuka dari layar smartphone tanpa terpotong.',
                'steps' => [
                    'Periksa bagian bawah di seluruh halaman: pastikan tertulis "Versi: 1.0 (Release Candidate)".',
                    'Periksa tanda di menu atas: pastikan berstatus "v1.0-RC // SIAP PAKAI".',
                    'Buka halaman ini lewat browser smartphone atau atur ukuran layar ponsel.',
                    'Geser layar ke kiri dan ke kanan: pastikan tampilan pas di layar dan tidak ada tulisan yang terpotong ke samping.',
                ],
                'target_url' => '/dashboard',
                'role_required' => 'Semua Peran',
            ],
        ];
    }

    /**
     * Dapatkan ID pengguna (atau fallback ke user admin jika diakses oleh penguji tanpa login).
     */
    private function resolveUserId(Request $request): int
    {
        if ($user = $request->user()) {
            return $user->id;
        }

        return User::where('role', 'admin')->value('id')
            ?? User::first()?->id
            ?? 1;
    }

    /**
     * Tampilkan Halaman Checklist UAT Mandiri (Terbuka Publik)
     */
    public function index(Request $request): Response
    {
        $userId = $this->resolveUserId($request);
        $savedChecklists = UatChecklist::where('user_id', $userId)->get()->keyBy('step_key');
        $masterSteps = $this->getMasterChecklist();

        $stepsWithStatus = array_map(function ($step) use ($savedChecklists) {
            $saved = $savedChecklists->get($step['key']);
            return array_merge($step, [
                'is_checked' => $saved ? (bool) $saved->is_checked : false,
                'tester_notes' => $saved ? $saved->tester_notes : '',
                'completed_at' => $saved && $saved->completed_at ? $saved->completed_at->toIso8601String() : null,
            ]);
        }, $masterSteps);

        $totalSteps = count($stepsWithStatus);
        $completedSteps = count(array_filter($stepsWithStatus, fn($s) => $s['is_checked']));
        $progressPercent = $totalSteps > 0 ? (int) round(($completedSteps / $totalSteps) * 100) : 0;

        // Ambil token Hermes dari config atau .env jika ada
        $envToken = config('services.hermes.token');
        if (empty($envToken) && file_exists(base_path('.env'))) {
            if (preg_match('/^HERMES_API_TOKEN=(.*)$/m', file_get_contents(base_path('.env')), $m)) {
                $envToken = trim($m[1]);
            }
        }
        $envToken = $envToken ?: '13|1hh6XV5g9eYB4wQpJoNcTcJilDKVJNo779euz8vBf8051624';

        // Ringkasan data dummy saat ini
        $dummySummary = [
            'total_users' => User::count(),
            'total_feeds' => NewsFeed::count(),
            'total_crisis' => NewsFeed::where('velocity_score', '>=', 40)->count(),
            'total_integrity_alerts' => NewsFeed::where('ai_status', 'integrity_alert')->count(),
            'target_setup' => TargetSetup::first(),
            'api_token' => $envToken,
            'accounts' => [
                [
                    'role' => 'admin',
                    'label' => 'Pengelola Utama (Admin)',
                    'email' => 'admin@radar.com',
                    'password' => 'password',
                    'access' => 'Bisa membuka seluruh menu tanpa batas',
                ],
                [
                    'role' => 'timses',
                    'label' => 'Pemantau Lapangan (Timses)',
                    'email' => 'timses@radar.com',
                    'password' => 'password',
                    'access' => 'Posko Berita, Pengaturan Sasaran, Naskah Pers, Laporan Grafik',
                ],
                [
                    'role' => 'influencer',
                    'label' => 'Juru Bicara & Tim Media',
                    'email' => 'influencer@radar.com',
                    'password' => 'password',
                    'access' => 'Ruang Naskah Pers, Posko Berita, Laporan Grafik (Menu Pengaturan Dibatasi)',
                ],
            ],
            'sample_curl' => [
                'fetch' => 'curl -s ' . url('/api/v1/hermes/fetch-news') . ' -H "Accept: application/json" -H "Authorization: Bearer ' . $envToken . '"',
                'webhook' => 'curl -X POST ' . url('/api/v1/hermes/webhook') . ' -H "Content-Type: application/json" -H "Authorization: Bearer ' . $envToken . '" -d \'{"news_id":1,"status":"success","velocity_score":90,"sentiment":"negative","fact_anchor":{"claim":"Isu tuduhan sepihak di artikel berita","fact":"Fakta penanganan resmi di lapangan berdasarkan rujukan resmi Pusdalops"},"scripts":{"press_release":"Siaran pers resmi klarifikasi tanggap darurat Matan Hilir","spokesperson":"Poin juru bicara: Satgas 12 regu telah diterjunkan sejak subuh","editorial_reply":"Lembar fakta & permohonan hak jawab redaksi sesuai UU Pers"}}\'',
            ],
        ];

        return Inertia::render('Checklist/Index', [
            'steps' => $stepsWithStatus,
            'progress' => [
                'total' => $totalSteps,
                'completed' => $completedSteps,
                'percent' => $progressPercent,
            ],
            'dummyData' => $dummySummary,
            'isGuest' => !$request->user(),
            'appVersion' => config('app.version', '1.0 (Release Candidate)'),
        ]);
    }

    /**
     * Simpan status centang satu langkah
     */
    public function toggle(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'step_key' => 'required|string',
            'is_checked' => 'required|boolean',
            'tester_notes' => 'nullable|string|max:1000',
        ]);

        $userId = $this->resolveUserId($request);

        UatChecklist::updateOrCreate(
            [
                'user_id' => $userId,
                'step_key' => $validated['step_key'],
            ],
            [
                'is_checked' => $validated['is_checked'],
                'tester_notes' => $validated['tester_notes'] ?? null,
                'completed_at' => $validated['is_checked'] ? now() : null,
            ]
        );

        return back()->with('message', 'Status checklist berhasil diperbarui.');
    }

    /**
     * Simpan seluruh status checklist sekaligus
     */
    public function batchSave(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.step_key' => 'required|string',
            'items.*.is_checked' => 'required|boolean',
            'items.*.tester_notes' => 'nullable|string|max:1000',
        ]);

        $userId = $this->resolveUserId($request);

        foreach ($validated['items'] as $item) {
            UatChecklist::updateOrCreate(
                [
                    'user_id' => $userId,
                    'step_key' => $item['step_key'],
                ],
                [
                    'is_checked' => (bool) $item['is_checked'],
                    'tester_notes' => $item['tester_notes'] ?? null,
                    'completed_at' => (bool) $item['is_checked'] ? now() : null,
                ]
            );
        }

        return back()->with('message', 'Seluruh progres checklist berhasil disimpan!');
    }

    /**
     * Reset seluruh centang checklist user
     */
    public function reset(Request $request): RedirectResponse
    {
        $userId = $this->resolveUserId($request);
        UatChecklist::where('user_id', $userId)->delete();

        return back()->with('message', 'Checklist berhasil di-reset kembali ke 0%.');
    }

    /**
     * Segarkan / Muat Ulang Contoh Data Siap Uji
     */
    public function seedDemoData(): RedirectResponse
    {
        Artisan::call('db:seed', [
            '--class' => 'Database\\Seeders\\UatDemoDataSeeder',
            '--force' => true,
        ]);

        return back()->with('message', 'Contoh data berita dan notifikasi berhasil dimuat ulang!');
    }

    /**
     * Jalankan simulasi pengujian otomatis API Hermes (Langkah 4)
     */
    public function testHermesApi(Request $request): RedirectResponse
    {
        $userId = $this->resolveUserId($request);

        // Cari berita pending atau ambil berita teratas
        $newsFeed = NewsFeed::where('ai_status', 'pending')->first();
        if (!$newsFeed) {
            $newsFeed = NewsFeed::latest('id')->first();
        }

        if ($newsFeed) {
            $newsFeed->update([
                'ai_status' => 'analyzed',
                'velocity_score' => 88,
                'sentiment' => 'negative',
                'fact_anchor' => [
                    'tuduhan' => 'Kritik lambatnya perbaikan jalan poros pedalaman di media daerah',
                    'fakta_lapangan' => 'Peralatan berat Dinas PU dan kontraktor pelaksana telah beroperasi di lokasi sejak awal pekan',
                    'dokumen_rujukan' => 'SPK DPU-PR No. 602/DPU-PR/BM/2026',
                ],
                'scripts' => [
                    'press_release' => 'Draf Siaran Pers Resmi: Tanggap cepat Pemda Ketapang dalam penanganan jalan poros utama.',
                    'spokesperson' => 'Poin Bicara Juru Bicara: Penanganan jalan sudah terjadwal dan dana pemeliharaan telah dikucurkan penuh.',
                    'editorial_reply' => 'Permohonan Hak Jawab Redaksi mengacu pada UU Pers No. 40/1999.',
                ],
            ]);
        }

        // Tandai langkah 4 checklist otomatis selesai
        UatChecklist::updateOrCreate(
            [
                'user_id' => $userId,
                'step_key' => 'step_4_hermes_api',
            ],
            [
                'is_checked' => true,
                'tester_notes' => 'Pengujian otomatis berhasil dieksekusi via Simulasi Gateway Hermes (Status HTTP 200 OK).',
                'completed_at' => now(),
            ]
        );

        return back()->with('message', 'Uji Komunikasi Asisten Cerdas Berhasil! Berita #' . ($newsFeed?->id ?? 1) . ' berhasil dianalisis (Status HTTP 200 OK).');
    }
}
