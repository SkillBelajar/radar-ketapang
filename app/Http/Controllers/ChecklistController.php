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
                'slice' => 'Slice 2',
                'category' => 'Core Security',
                'title' => '1. Autentikasi & Pengujian Akses Multi-Role (RBAC)',
                'summary' => 'Memastikan pembatasan hak akses ketat antara Admin, Timses, dan Influencer.',
                'steps' => [
                    'Logout dari akun saat ini lalu login dengan kredensial Influencer (influencer@radar.com / password).',
                    'Coba akses menu "TARGET SETUP" (/target-setup). Pastikan halaman memunculkan status HTTP 403 Forbidden (Akses Ditolak).',
                    'Kembali ke halaman login, masuk sebagai Timses (timses@radar.com / password) untuk memeriksa akses dasbor dan content studio.',
                    'Login kembali sebagai Commander Admin (admin@radar.com / password) untuk mendapatkan kontrol penuh ke seluruh modul sistem.',
                ],
                'target_url' => '/login',
                'role_required' => 'Semua Role',
            ],
            [
                'key' => 'step_2_target_setup',
                'slice' => 'Slice 3',
                'category' => 'Targeting & Filters',
                'title' => '2. Konfigurasi Persona Kandidat & Kata Kunci (Target Setup)',
                'summary' => 'Menguji fleksibilitas penambahan kata kunci pemicu, filter negatif, dan persona tokoh.',
                'steps' => [
                    'Buka menu "TARGET SETUP" (/target-setup) menggunakan akun Admin atau Timses.',
                    'Ketik kata kunci baru di kolom Kata Kunci Utama (misal: "Bandara Rahadi Oesman") lalu tekan tombol "Tambah" atau tekan Enter.',
                    'Tambahkan kata kunci negatif baru (misal: "isu sara") pada kolom Filter Isu Negatif.',
                    'Klik tombol "SIMPAN KONFIGURASI TARGET". Pastikan muncul notifikasi hijau dan tag tersimpan permanen.',
                ],
                'target_url' => '/target-setup',
                'role_required' => 'Admin & Timses',
            ],
            [
                'key' => 'step_3_feed_ingestion',
                'slice' => 'Slice 3',
                'category' => 'Data Collection',
                'title' => '3. Background Feed Hub & Ingestor Berita Lokal Ketapang',
                'summary' => 'Menguji penarikan dan penampungan feed berita daerah dari portal lokal.',
                'steps' => [
                    'Di halaman Target Setup, gulir ke bawah menuju panel "Feed Hub Monitor & Ingestor".',
                    'Amati tabel 6 sampel berita lokal Ketapang (Suara Ketapang, Pontianak Post, dsb).',
                    'Klik tombol "TARIK FEED TERBARU (SIMULATOR)" untuk mensimulasikan worker antrean Redis penarikan feed.',
                    'Periksa apakah daftar berita pending atau teranalisis bertambah secara otomatis.',
                ],
                'target_url' => '/target-setup',
                'role_required' => 'Admin & Timses',
            ],
            [
                'key' => 'step_4_hermes_api',
                'slice' => 'Slice 4',
                'category' => 'REST API & AI Gateway',
                'title' => '4. Integrasi REST API & Dual-Mode Hermes AI Gateway',
                'summary' => 'Menguji otentikasi Sanctum Bearer Token dan 2 endpoint API Hermes (GET pending & POST webhook).',
                'steps' => [
                    'Salin perintah cURL GET /api/v1/hermes/fetch-news dari kartu kredensial di bawah.',
                    'Jalankan di terminal host atau Postman. Pastikan mengembalikan HTTP 200 OK dengan payload berita pending dan target persona.',
                    'Kirimkan analisis balik menggunakan endpoint POST /api/v1/hermes/webhook.',
                    'Pastikan status berita otomatis berubah dari "pending" menjadi "analyzed / success" di database.',
                ],
                'target_url' => '/api/v1/hermes/fetch-news',
                'role_required' => 'API / Operator',
            ],
            [
                'key' => 'step_5_crisis_radar',
                'slice' => 'Slice 5',
                'category' => 'Crisis Velocity Radar',
                'title' => '5. Dasbor Radar Krisis & Velocity Indicator Suhu Isu',
                'summary' => 'Menguji indikator visual kecepatan krisis (Merah >=75, Kuning >=40, Hijau <40).',
                'steps' => [
                    'Buka menu "DASHBOARD KRISIS" (/dashboard).',
                    'Periksa kartu isu Karhutla Matan Hilir: Skor kecepatan 88% dengan indikator Merah berpendar (Bahaya Tinggi).',
                    'Periksa kartu isu Pasokan Gas LPG 3Kg: Skor 52% dengan indikator Kuning (Waspada Moderat).',
                    'Klik tombol "Rincian Lengkap" pada kartu untuk membuka popup modal Fact-Anchor (Fakta Lapangan vs Tuduhan).',
                ],
                'target_url' => '/dashboard',
                'role_required' => 'Semua Role',
            ],
            [
                'key' => 'step_6_integrity_alert',
                'slice' => 'Slice 5',
                'category' => 'AI Ethics & Safety',
                'title' => '6. Protokol Pencegahan Hoaks & Pelanggaran Etik (Integrity Alert)',
                'summary' => 'Menguji proteksi sistem saat AI mendeteksi isu pelanggaran hukum atau kampanye hitam.',
                'steps' => [
                    'Pada Dasbor Radar Krisis, cari kartu isu "Beredar Tangkapan Layar Survei Elektabilitas Palsu" (Skor 95%).',
                    'Pastikan terdapat banner merah mencolok: "🚨 PERINGATAN INTEGRITAS: AI menolak memproses isu ini karena potensi pelanggaran hukum/etika."',
                    'Pastikan naskah/skrip otomatis dikunci (hidden) untuk melindungi tim dari risiko penyebaran narasi berbahaya.',
                ],
                'target_url' => '/dashboard',
                'role_required' => 'Semua Role',
            ],
            [
                'key' => 'step_7_content_studio',
                'slice' => 'Slice 6',
                'category' => 'Press & Media Response',
                'title' => '7. Media & Press Response Studio & Salin Clipboard',
                'summary' => 'Menguji ketersediaan naskah respon pers (Siaran Pers, Juru Bicara, Hak Jawab Redaksi) dan verifikasi tautan portal berita asli.',
                'steps' => [
                    'Buka menu "MEDIA RESPONSE" (/studio).',
                    'Pilih artikel berita isu terkini dan klik tombol "Buka Berita Asli" untuk memverifikasi tautan portal berita asli.',
                    'Amati 3 format draf respon pers: Siaran Pers Resmi (Lead 5W+1H), Pernyataan Juru Bicara (Doorstop), dan Lembar Hak Jawab Redaksi.',
                    'Klik tombol "SALIN NASKAH". Pastikan tombol berubah warna menjadi hijau dengan tulisan "Copied! ✅" selama 2 detik.',
                ],
                'target_url' => '/studio',
                'role_required' => 'Semua Role',
            ],
            [
                'key' => 'step_8_inapp_alerts',
                'slice' => 'Slice 6',
                'category' => 'Real-time Alerts',
                'title' => '8. Lonceng Notifikasi Krisis & Unread Counter di Navbar',
                'summary' => 'Menguji notifikasi real-time in-app saat isu merah/kuning terdeteksi.',
                'steps' => [
                    'Perhatikan ikon Lonceng di Top Navbar sebelah kanan.',
                    'Pastikan terdapat badge merah numerik yang menandai jumlah krisis aktif yang belum dibaca.',
                    'Klik ikon Lonceng untuk membuka dropdown daftar krisis dengan level bahaya.',
                    'Klik tombol "Tandai Semua Telah Dibaca" atau klik item krisis untuk menurunkan counter badge secara interaktif.',
                ],
                'target_url' => '/dashboard',
                'role_required' => 'Semua Role',
            ],
            [
                'key' => 'step_9_analytics_recharts',
                'slice' => 'Slice 7',
                'category' => 'Evaluation & Audit',
                'title' => '9. Sentiment Shift Tracker (Recharts) & Audit Trail Forensik AI',
                'summary' => 'Menguji grafik pergeseran sentimen 7 hari dan tabel rekapitulasi audit intervensi narasi.',
                'steps' => [
                    'Buka menu "ANALYTICS & AUDIT" (/analytics).',
                    'Amati grafik interaktif Recharts: bandingkan kurva garis hijau (positif) vs merah (negatif).',
                    'Uji tombol pengalih tipe grafik: klik "Batang Sentimen" untuk beralih ke Bar Chart, atau "Area Tren".',
                    'Periksa 4 kartu KPI mingguan di bawah grafik dan uji filter live "Blokir Integritas" pada tabel Audit Trail.',
                ],
                'target_url' => '/analytics',
                'role_required' => 'Semua Role',
            ],
            [
                'key' => 'step_10_version_mobile',
                'slice' => 'Slice 8',
                'category' => 'Production Readiness',
                'title' => '10. Verifikasi Rilis Versi 1.0 (RC) & Bebas Geser Samping di HP',
                'summary' => 'Memastikan versi utuh Release Candidate aktif dan antarmuka 100% responsif mobile tanpa horizontal scroll.',
                'steps' => [
                    'Periksa footer di seluruh halaman: pastikan tertera teks statis "Versi: 1.0 (Release Candidate)".',
                    'Periksa badge telemetry di navbar: pastikan berstatus "v1.0-RC // MIL-SPEC".',
                    'Uji halaman di browser smartphone atau Chrome DevTools Mobile Viewport (lebar 390px).',
                    'Geser halaman ke kiri dan kanan pada seluruh halaman: pastikan tidak ada kebocoran overflow horizontal (zero overflow-x).',
                ],
                'target_url' => '/dashboard',
                'role_required' => 'Semua Role',
            ],
        ];
    }

    /**
     * Tampilkan Halaman Checklist UAT Mandiri
     */
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;
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

        // Ambil token Hermes dari .env jika ada
        $envToken = env('HERMES_API_TOKEN', 'hermes_sec_token_ketapang_2026_demo_uat');

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
                    'label' => 'Super Commander (Admin)',
                    'email' => 'admin@radar.com',
                    'password' => 'password',
                    'access' => 'Akses Penuh Seluruh Modul',
                ],
                [
                    'role' => 'timses',
                    'label' => 'Intel Analyst & Lapangan (Timses)',
                    'email' => 'timses@radar.com',
                    'password' => 'password',
                    'access' => 'Radar, Target Setup, Content Studio, Analytics',
                ],
                [
                    'role' => 'influencer',
                    'label' => 'Tim Media & Pers (Humas)',
                    'email' => 'influencer@radar.com',
                    'password' => 'password',
                    'access' => 'Media Response Studio, Radar Krisis, Analytics (Target Setup Ditolak/403)',
                ],
            ],
            'sample_curl' => [
                'fetch' => 'curl -s ' . url('/api/v1/hermes/fetch-news') . ' -H "Accept: application/json" -H "Authorization: *** ' . $envToken . '"',
                'webhook' => 'curl -X POST ' . url('/api/v1/hermes/webhook') . ' -H "Content-Type: application/json" -H "Authorization: *** ' . $envToken . '" -d \'{"news_id":1,"status":"success","velocity_score":90,"sentiment":"negative","fact_anchor":{"claim":"Isu tuduhan sepihak di artikel berita","fact":"Fakta penanganan resmi di lapangan berdasarkan rujukan resmi Pusdalops"},"scripts":{"press_release":"Siaran pers resmi klarifikasi tanggap darurat Matan Hilir","spokesperson":"Poin juru bicara: Satgas 12 regu telah diterjunkan sejak subuh","editorial_reply":"Lembar fakta & permohonan hak jawab redaksi sesuai UU Pers"}}\'',
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

        UatChecklist::updateOrCreate(
            [
                'user_id' => $request->user()->id,
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

        $userId = $request->user()->id;

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
        UatChecklist::where('user_id', $request->user()->id)->delete();

        return back()->with('message', 'Checklist berhasil di-reset kembali ke 0%.');
    }

    /**
     * Segarkan / Muat Ulang Data Dummy Siap Uji
     */
    public function seedDemoData(): RedirectResponse
    {
        Artisan::call('db:seed', [
            '--class' => 'Database\\Seeders\\UatDemoDataSeeder',
            '--force' => true,
        ]);

        return back()->with('message', 'Data dummy pengujian (berita krisis, notifikasi, dan target setup) berhasil disegarkan!');
    }
}
