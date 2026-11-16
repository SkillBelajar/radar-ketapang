<?php

namespace Database\Seeders;

use App\Models\NewsFeed;
use App\Models\TargetSetup;
use App\Models\User;
use App\Notifications\NewCrisisAlert;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UatDemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Akun Pengguna 3 Role
        $admin = User::updateOrCreate(
            ['email' => 'admin@radar.com'],
            [
                'name' => 'Commander Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $timses = User::updateOrCreate(
            ['email' => 'timses@radar.com'],
            [
                'name' => 'Timses Lapangan & Analis',
                'password' => Hash::make('password'),
                'role' => 'timses',
                'email_verified_at' => now(),
            ]
        );

        $influencer = User::updateOrCreate(
            ['email' => 'influencer@radar.com'],
            [
                'name' => 'Influencer Studio Operator',
                'password' => Hash::make('password'),
                'role' => 'influencer',
                'email_verified_at' => now(),
            ]
        );

        // 2. Target Setup
        TargetSetup::updateOrCreate(
            ['id' => 1],
            [
                'persona' => 'Calon pemimpin yang santun, rekam jejak birokrasi bersih, berkomitmen membangun akses jalan dan jembatan antar-kecamatan di Ketapang, serta merangkul seluruh komunitas adat Dayak dan Melayu.',
                'primary_keywords' => [
                    'Farhan Ketapang',
                    'Pilkada Ketapang 2024',
                    'Ketapang Maju',
                    'Infrastruktur Pedalaman',
                    'Jembatan Pawan',
                ],
                'negative_keywords' => [
                    'korupsi',
                    'dinasti politik',
                    'karhutla',
                    'ijazah palsu',
                    'money politics',
                ],
            ]
        );

        // 3. News Feed - Ragam Kasus Uji
        NewsFeed::truncate();

        // Kasus 1: Krisis Merah Bahaya (Velocity 88, Negative, Fact-Anchor, Defensive Reframing)
        $feedKarhutla = NewsFeed::create([
            'title' => 'Sorotan Publik: Titik Api Karhutla di Matan Hilir Selatan Ketapang Meluas, Warga Tuding Penanganan Lambat',
            'source' => 'Ketapang Post',
            'url' => 'https://ketapangpost.example.com/berita/karhutla-matan-hilir-selatan-2024',
            'raw_content' => 'Kebakaran hutan dan lahan kembali terdeteksi di kawasan gambut Matan Hilir Selatan. Beberapa akun media sosial mempertanyakan koordinasi penanggulangan bencana dan menuding pemerintah daerah beserta pasangan calon lamban merespons keluhan kabut asap warga.',
            'published_at' => now()->subHours(2),
            'velocity_score' => 88,
            'sentiment' => 'negative',
            'ai_status' => 'success',
            'fact_anchor' => [
                'claim' => 'Beredar narasi di medsos bahwa posko satgas kabut asap lambat bergerak dan pasangan calon mengabaikan jeritan warga terdampak kabut asap di Matan Hilir Selatan.',
                'fact' => 'Tim gabungan BPBD Ketapang bersama 12 regu Manggala Agni dan relawan telah memadamkan 4 titik api sejak pukul 06.00 WIB. Paslon juga telah mendistribusikan 5.000 masker medis dan menyiagakan 2 mobil tangki suplai air bersih di lokasi sejak kemarin petang.'
            ],
            'scripts' => [
                'tiktok' => "🚨 FAKTA LAPANGAN: Jangan termakan potongan video sepihak soal karhutla di Matan Hilir Selatan! Fakta resminya: 12 regu satgas darat bersama relawan BPBD sudah terjun langsung sejak subuh tadi memadamkan titik api di lahan gambut. Bahkan 5.000 masker medis sudah dibagikan gratis untuk warga. Yuk jaga situasi kondusif dan stop bakar lahan!",
                'twitter' => "Klarifikasi Terbuka Mengenai Karhutla Matan Hilir Selatan: Narasi penanganan lambat adalah TIDAK BENAR. Tim gabungan 12 regu Manggala Agni & relawan BPBD telah memadamkan 4 titik sejak subuh. 5.000 masker & mobil tangki air bersih sudah di lokasi. Mari utamakan keselamatan dan stop sebar hoaks. #KetapangSiaga #FaktaKetapang",
                'instagram' => "FAKTA PENANGANAN KARHUTLA KETAPANG 🌿🚒\n\nMenanggapi isu beredar soal penanganan karhutla di Matan Hilir Selatan, berikut fakta di lapangan:\n1. 12 regu gabungan Manggala Agni & BPBD beroperasi nonstop sejak subuh.\n2. Bantuan darurat 5.000 masker dan air bersih telah tersalurkan.\n3. Jangan mudah terprovokasi narasi politis di tengah bencana kabut asap."
            ]
        ]);

        // Kasus 2: Integrity Alert (Velocity 95, Serangan Hoaks & Black Campaign)
        $feedIntegrity = NewsFeed::create([
            'title' => 'Beredar Tangkapan Layar Survei Elektabilitas Palsu Mencatut Lembaga Independen di Grup WhatsApp Ketapang',
            'source' => 'Radar Borneo Online',
            'url' => 'https://radarborneo.example.com/viral-survei-palsu-ketapang',
            'raw_content' => 'Beredar grafis survei elektabilitas palsu berlogo lembaga survei nasional yang direkayasa untuk menjatuhkan kredibilitas kandidat serta menyebarkan fitnah suku dan agama di Kabupaten Ketapang.',
            'published_at' => now()->subHours(5),
            'velocity_score' => 95,
            'sentiment' => 'negative',
            'ai_status' => 'integrity_alert',
            'fact_anchor' => [
                'claim' => 'Tangkapan layar infografis mengklaim survei resmi dan menuduh pasangan calon melakukan kecurangan sistematis.',
                'fact' => 'Lembaga survei yang dicatut telah mengeluarkan rilis bantahan resmi bahwa grafis tersebut 100% palsu dan telah dilaporkan ke Bawaslu serta Cyber Crime Polda Kalbar.'
            ],
            'scripts' => null
        ]);

        // Kasus 3: Isu Positif (Velocity 74, Positive, Fact-Anchor, Proactive Amplification)
        $feedJembatan = NewsFeed::create([
            'title' => 'Pembangunan Jembatan Gantung Penghubung Sandai - Nanga Tayap Rampung Lebih Cepat Dari Target',
            'source' => 'Suara Ketapang News',
            'url' => 'https://suaraketapang.example.com/jembatan-sandai-nanga-tayap-rampung',
            'raw_content' => 'Akses penghubung desa terisolir di pedalaman Ketapang kini terbuka berkat percepatan pembangunan infrastruktur jembatan. Tokoh masyarakat adat menyambut haru kelancaran distribusi hasil bumi.',
            'published_at' => now()->subHours(12),
            'velocity_score' => 74,
            'sentiment' => 'positive',
            'ai_status' => 'success',
            'fact_anchor' => [
                'claim' => 'Pihak lawan mengklaim proyek jembatan sekadar pencitraan menjelang pemungutan suara.',
                'fact' => 'Proyek ini merupakan realisasi aspirasi musrenbang yang telah dianggarkan dan diawasi ketat sejak 2023, kini memangkas waktu tempuh warga dari 3 jam menjadi hanya 20 menit.'
            ],
            'scripts' => [
                'tiktok' => "Dulu harus memutar sungai berjam-jam, sekarang anak sekolah dan petani di Sandai - Nanga Tayap cuma butuh 20 menit! Ini bukti nyata kerja nyata membangun Ketapang dari pedalaman, bukan sekadar janji di atas kertas. Siapa yang bangga Ketapang semakin maju? Angkat jempolmu di komentar! 👍✨",
                'twitter' => "Dari 3 jam memutar perahu jadi 20 menit berkendara! Jembatan Sandai-Nanga Tayap selesai lebih cepat dari target. Ini komitmen nyata membangun infrastruktur konektivitas desa pedalaman Ketapang. Kerja terbukti, bukan sekadar omon-omon. #KetapangMaju #InfrastrukturPedalaman",
                'instagram' => "KONEKTIVITAS PEDALAMAN KETAPANG TERCAPAI 🌉🚀\n\nJembatan penghubung Sandai - Nanga Tayap resmi tuntas! Akses ekonomi petani lancar, anak sekolah tidak lagi bertaruh nyawa menyeberang arus sungai. Simbol komitmen nyata kepemimpinan yang berpihak pada rakyat pedalaman."
            ]
        ]);

        // Kasus 4: Isu Waspada Kuning (Velocity 52, Negative Moderat)
        $feedLpg = NewsFeed::create([
            'title' => 'Warga Sukabangun Keluhkan Antrean Pembelian Gas LPG 3Kg Subsidi di Pangkalan Resmi',
            'source' => 'Ketapang Terkini',
            'url' => 'https://ketapangterkini.example.com/lpg-3kg-sukabangun-antre',
            'raw_content' => 'Antrean jerigen dan tabung gas melon terlihat sejak pagi di Sukabangun. Warga meminta pemerintah dan aparat menindak tegas oknum spekulan yang menimbun tabung gas subsidi.',
            'published_at' => now()->subDay(),
            'velocity_score' => 52,
            'sentiment' => 'negative',
            'ai_status' => 'success',
            'fact_anchor' => [
                'claim' => 'Beredar anggapan ada kelangkaan total pasokan gas LPG 3Kg di seluruh Ketapang akibat kelalaian distribusi.',
                'fact' => 'Pertamina mengonfirmasi suplai kuota normal, kendala teknis terjadi akibat keterlambatan kapal tongkang cuaca buruk selama 2 hari dan operasi pasar tambahan 1.200 tabung telah digelar hari ini.'
            ],
            'scripts' => [
                'tiktok' => "Warga Ketapang gak perlu panik soal LPG 3Kg! Keterlambatan kemarin murni cuaca gelombang laut, dan hari ini Pertamina bersama Disperindag sudah drop operasi pasar tambahan 1.200 tabung di pangkalan Sukabangun. Beli sesuai kebutuhan dan laporkan pangkalan nakal ya!",
                'twitter' => "Update Distribusi LPG 3Kg Sukabangun Ketapang: Kapal suplai Pertamina sudah sandar dan operasi pasar tambahan 1.200 tabung sudah digelontorkan hari ini. Pasokan aman, jangan terprovokasi aksi panic buying. #InfoKetapang",
                'instagram' => "DISTRIBUSI LPG 3KG KEMBALI NORMAL ✅\n\nDisperindag dan Pertamina bergerak cepat menggelar operasi pasar di Sukabangun pasca cuaca ekstrem laut mereda. Masyarakat dihimbau membeli dengan harga HET resmi di pangkalan resmi."
            ]
        ]);

        // Kasus 5: Isu Netral Pending (Velocity 0, Siap Diproses API Hermes)
        NewsFeed::create([
            'title' => 'KPUD Ketapang Matangkan Persiapan Debat Publik Putaran Pertama di Gedung Pancasila',
            'source' => 'Harian Kalbar Raya',
            'url' => 'https://kalbarraya.example.com/kpud-ketapang-debat-publik-pancasila',
            'raw_content' => 'Komisi Pemilihan Umum Daerah Kabupaten Ketapang menetapkan jadwal dan tata tertib debat publik antarpasangan calon bupati dan wakil bupati yang akan disiarkan langsung melalui kanal televisi dan streaming.',
            'published_at' => now()->subHours(18),
            'velocity_score' => 0,
            'sentiment' => 'neutral',
            'ai_status' => 'pending',
            'fact_anchor' => null,
            'scripts' => null
        ]);

        // Kasus 6: Isu Netral Teranalisis (Velocity 32, Hijau Aman)
        NewsFeed::create([
            'title' => 'Bawaslu Gelar Deklarasi Netralitas ASN dan Kepala Desa Se-Kabupaten Ketapang',
            'source' => 'Antara Kalbar',
            'url' => 'https://kalbar.antaranews.com/deklarasi-netralitas-asn-ketapang-2024',
            'raw_content' => 'Ratusan ASN dan kepala desa mengikuti penandatanganan pakta integritas netralitas pemilu guna mewujudkan iklim demokrasi yang jujur, adil, dan sejuk di bumi Ale-Ale.',
            'published_at' => now()->subDays(2),
            'velocity_score' => 32,
            'sentiment' => 'neutral',
            'ai_status' => 'success',
            'fact_anchor' => [
                'claim' => 'Isu netralitas aparatur kerap dicurigai condong ke salah satu pihak petahana.',
                'fact' => 'Seluruh paslon mendukung penuh pakta netralitas dan berkomitmen bertarung secara gagasan dan program kerja tanpa memobilisasi birokrasi.'
            ],
            'scripts' => [
                'tiktok' => "Demokrasi sehat dimulai dari netralitas! Salut untuk deklarasi Bawaslu dan seluruh ASN Ketapang. Mari kita adu gagasan dan program terbaik demi kemajuan Ketapang tercinta! 🇮🇩🤝",
                'twitter' => "Mendukung penuh pakta netralitas ASN & Kades di Pilkada Ketapang. Kemenangan sejati lahir dari kepercayaan rakyat dan gagasan nyata, bukan tekanan birokrasi. #PilkadaDamaiKetapang",
                'instagram' => "KOMITMEN PILKADA SEJUK & BERMARTABAT 🕊️\n\nApresiasi tinggi bagi Bawaslu dan ASN Ketapang. Bersama kita jaga pesta demokrasi yang bersih, damai, dan berkeadilan untuk seluruh rakyat Ketapang."
            ]
        ]);

        // 4. Injeksi Notifikasi Krisis In-App
        // Bersihkan notifikasi lama
        \DB::table('notifications')->truncate();

        // Notifikasi 1: Krisis Karhutla
        $admin->notify(new NewCrisisAlert($feedKarhutla));
        $timses->notify(new NewCrisisAlert($feedKarhutla));

        // Notifikasi 2: Integrity Alert
        $admin->notify(new NewCrisisAlert($feedIntegrity));
        $timses->notify(new NewCrisisAlert($feedIntegrity));
        $influencer->notify(new NewCrisisAlert($feedIntegrity));

        // Notifikasi 3: Waspada Gas LPG
        $admin->notify(new NewCrisisAlert($feedLpg));
        $timses->notify(new NewCrisisAlert($feedLpg));
    }
}
