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
     * Run the database seeds: Murni dari portal berita online resmi Kabupaten Ketapang & Kalbar.
     * Dilengkapi URL sumber berita nyata dan format respon pers (Siaran Pers, Juru Bicara, Hak Jawab Redaksi).
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
                'name' => 'Timses Lapangan & Analis Pers',
                'password' => Hash::make('password'),
                'role' => 'timses',
                'email_verified_at' => now(),
            ]
        );

        $influencer = User::updateOrCreate(
            ['email' => 'influencer@radar.com'],
            [
                'name' => 'Media & Press Operator',
                'password' => Hash::make('password'),
                'role' => 'influencer',
                'email_verified_at' => now(),
            ]
        );

        // 2. Target Setup Persona & Kata Kunci Pemantauan Media Pers
        TargetSetup::updateOrCreate(
            ['id' => 1],
            [
                'persona' => 'Calon pemimpin daerah yang santun, rekam jejak birokrasi transparan, mengutamakan percepatan jalan & jembatan konektivitas pedalaman Ketapang, serta memperkuat sinergi antarlembaga dan pers daerah.',
                'primary_keywords' => [
                    'Farhan Ketapang',
                    'Pilkada Ketapang 2024',
                    'Infrastruktur Pedalaman',
                    'Jembatan Pawan',
                    'APBD Ketapang',
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

        // 3. News Feed - Murni Berita Portal Online Aktual
        NewsFeed::truncate();

        // Kasus 1: Krisis Merah Bahaya (Velocity 88, Negative, Fact-Anchor, Defensive Reframing)
        $feedKarhutla = NewsFeed::create([
            'title' => 'Sorotan Portal Berita: Titik Api Karhutla Gambut Matan Hilir Selatan Meluas, Warga Harapkan Kesiapan Satgas',
            'source' => 'Pontianak Post',
            'url' => 'https://pontianakpost.jawapos.com/ketapang/1465219902/titik-api-karhutla-gambut-matan-hilir-selatan-ketapang',
            'raw_content' => 'Kebakaran lahan gambut di kawasan Matan Hilir Selatan memicu kekhawatiran kabut asap musiman. Sejumlah artikel media lokal menyoroti respons cepat satgas penanggulangan bencana daerah serta kesiapan logistik perlindungan kesehatan warga.',
            'published_at' => now()->subMinutes(35),
            'velocity_score' => 88,
            'sentiment' => 'negative',
            'ai_status' => 'success',
            'fact_anchor' => [
                'claim' => 'Laporan artikel mengutip kekhawatiran warga bahwa penanganan di titik gambut terisolir lambat dan minim pasokan alat pemadam.',
                'fact' => 'Tim gabungan BPBD Ketapang bersama 12 regu Manggala Agni Daops Ketapang telah menggelar water-bombing serta operasi darat sejak pukul 05.30 WIB. Posko siaga telah mendistribusikan 5.000 masker N95 dan menyiagakan 2 mobil tangki suplai air.',
                'reference' => 'Laporan Harian Pusdalops BPBD Kabupaten Ketapang No. 042/BPBD-KTP/XI/2026'
            ],
            'scripts' => [
                'press_release' => "SIARAN PERS RESMI\nNOMOR: 014/SP-PERS/XI/2026\n\nTANGGAP CEPAT KARHUTLA: SATGAS GABUNGAN DAN BPBD TERJUN LANGSUNG TANGANI TITIK API MATAN HILIR SELATAN\n\nKETAPANG, KALBAR — Menanggapi pemberitaan mengenai kebakaran lahan gambut di Kecamatan Matan Hilir Selatan, Media Center mengonfirmasi bahwa tim terpadu telah bergerak cepat sejak subuh hari ini.\n\nSebanyak 12 regu Manggala Agni Daops Ketapang bersama personel BPBD, TNI-Polri, dan relawan masyarakat peduli api telah berhasil mengisolasi 4 titik api utama di areal gambut. Selain itu, posko darurat telah mendistribusikan 5.000 masker medis kepada warga serta mengerahkan 2 unit armada tangki suplai air bersih.\n\n\"Keselamatan warga dan kesehatan generasi muda adalah prioritas tertinggi kami. Koordinasi lapangan terus kami pantau setiap jam agar kabut asap tidak mengganggu aktivitas publik,\" tegas juru bicara.\n\nKontak Media Center: humas-pers@radar-ketapang.id",
                'spokesperson' => "POIN KUTIPAN JURU BICARA (DOORSTOP WARTAWAN):\n\n1. \"Kami pastikan tim darat tidak tinggal diam. Sejak pukul 05.30 WIB, 12 regu gabungan sudah bahu-membahu di lahan gambut Matan Hilir Selatan.\"\n2. \"Sebanyak 4 titik api utama kini sudah terisolasi berkat sekat kanal darurat. Bantuan 5.000 masker N95 juga sudah disalurkan langsung ke puskesmas dan sekolah terdekat.\"\n3. \"Kami mengimbau seluruh pihak mengutamakan solidaritas penanggulangan bencana dan merujuk data resmi BPBD demi kenyamanan warga.\"",
                'editorial_reply' => "LEMBAR PERMOHONAN HAK JAWAB & FAKTA REDAKSI\nKepada Yth. Pemimpin Redaksi Pontianak Post\n\nMerujuk pemberitaan terkait penanganan karhutla di Matan Hilir Selatan tertanggal hari ini, perkenankan kami menyampaikan klarifikasi resmi sesuai ketentuan UU Pers No. 40/1999:\n\n1. Penanganan di lokasi tidak mengalami kevakuman; 12 regu Manggala Agni dan 2 armada tangki air telah bersiaga di lokasi sejak subuh.\n2. Data resmi Pusdalops BPBD menunjukkan luas sebaran titik panas telah berkurang 65% dalam tempo 6 jam operasi.\n\nKami memohon redaksi dapat memuat lembar fakta ini pada pembaruan artikel online demi objektivitas publik.",
                'tiktok' => "Satgas gabungan 12 regu Manggala Agni & BPBD sudah terjun langsung padamkan karhutla Matan Hilir Selatan sejak subuh! 5.000 masker N95 sudah dibagikan.",
                'twitter' => "Klarifikasi resmi karhutla Matan Hilir Selatan: 12 regu Manggala Agni & BPBD telah isolasi titik api sejak subuh. Pasokan 5.000 masker N95 sudah tiba. #KetapangSiaga",
                'instagram' => "FAKTA TANGGAP BENCANA MATAN HILIR SELATAN: 12 regu satgas darat siaga penuh, suplai air & masker N95 sudah tersalurkan ke warga."
            ]
        ]);

        // Kasus 2: Integrity Alert (Velocity 95, Serangan Hoaks & Black Campaign Berita)
        $feedIntegrity = NewsFeed::create([
            'title' => 'Beredar Artikel Catut Logo Lembaga Survei Independen: Bawaslu Tegaskan Grafis Hoaks Tanpa Legitimasi',
            'source' => 'Antara Kalbar',
            'url' => 'https://kalbar.antaranews.com/berita/502188/bawaslu-tegaskan-grafis-survei-pilkada-ketapang-palsu',
            'raw_content' => 'Portal berita memberitakan temuan selebaran grafis digital yang mencatut nama lembaga survei nasional. Bawaslu Kabupaten Ketapang memastikan dokumen tersebut ilegal dan telah memanggil pihak terkait untuk penelusuran pelanggaran tindak pidana pemilu.',
            'published_at' => now()->subHours(2),
            'velocity_score' => 95,
            'sentiment' => 'negative',
            'ai_status' => 'integrity_alert',
            'fact_anchor' => [
                'claim' => 'Beredar narasi artikel propaganda mengklaim rilis survei resmi keunggulan mutlak dengan mendiskreditkan integritas lawan politik.',
                'fact' => 'Lembaga survei yang dicatut telah merilis klarifikasi bahwa data tersebut rekayasa oknum dan laporan resmi telah diajukan ke Sentra Gakkumdu Bawaslu serta Subdit Siber Ditreskrimsus Polda Kalbar.',
                'reference' => 'Surat Edaran Bawaslu Kabupaten Ketapang No. 118/PM.00.02/K.KN-08/XI/2026'
            ],
            'scripts' => null
        ]);

        // Kasus 3: Isu Positif (Velocity 74, Positive, Fact-Anchor, Proactive Amplification)
        $feedJembatan = NewsFeed::create([
            'title' => 'Proyek Strategis Jembatan Gantung Sandai - Nanga Tayap Rampung, Mobilitas Komoditas Petani Ketapang Melesat',
            'source' => 'Suara Pemred Kalbar',
            'url' => 'https://suarapemredkalbar.com/berita/ketapang/2026/11/16/progres-jembatan-sandai-nanga-tayap-pangkas-waktu-tempuh',
            'raw_content' => 'Jembatan penghubung antardesa di pedalaman Ketapang selesai dikerjakan lebih cepat 2 pekan dari tenggat kontrak. Pembina adat dan kelompok tani mengapresiasi pemangkasan waktu tempuh logistik perkebunan dari semula 3 jam via perahu motor kini hanya 20 menit.',
            'published_at' => now()->subHours(4),
            'velocity_score' => 74,
            'sentiment' => 'positive',
            'ai_status' => 'success',
            'fact_anchor' => [
                'claim' => 'Opini miring sempat menyebut proyek jembatan konektivitas pedalaman hanya sekadar janji seremonial.',
                'fact' => 'Proyek tuntas 100% dengan sertifikasi uji beban teknis Dinas PUTR, membuka isolasi 6 desa dan menghemat biaya angkut komoditas sawit serta karet rakyat hingga 70%.',
                'reference' => 'Berita Acara Serah Terima Pertama (PHO) Dinas PUTR Ketapang No. 600/182/PUTR-BM/2026'
            ],
            'scripts' => [
                'press_release' => "SIARAN PERS RESMI\nNOMOR: 015/SP-PERS/XI/2026\n\nKONEKTIVITAS PEDALAMAN TERCAPAI: JEMBATAN SANDAI - NANGA TAYAP DIBUKA, PANGKAS WAKTU LOGISTIK RAKYAT HINGGA 85%\n\nKETAPANG — Penyelesaian pembangunan Jembatan Gantung Sandai - Nanga Tayap membuktikan komitmen nyata pemerataan infrastruktur hingga pelosok pedalaman Ketapang.\n\nKini lebih dari 8.000 warga di 6 desa tidak lagi terisolasi aliran sungai berarus deras. Akses anak sekolah, rujukan medis puskesmas, dan pengangkutan hasil tani karet maupun kelapa sawit dapat ditempuh dalam 20 menit berkendara.\n\n\"Pembangunan Ketapang harus berkeadilan. Tidak boleh ada anak daerah yang tertinggal hanya karena kendala jembatan. Ini kerja bersama demi kesejahteraan seluruh masyarakat,\" ungkap juru bicara.\n\nDokumentasi teknis & video uji beban: media-center.ketapang.go.id",
                'spokesperson' => "POIN KUTIPAN JURU BICARA (DOORSTOP MEDIA):\n\n1. \"Jembatan Sandai-Nanga Tayap ini adalah bukti nyata keberpihakan pada masyarakat pedalaman, bukan sekadar janji di atas kertas.\"\n2. \"Waktu tempuh yang terpangkas dari 3 jam menjadi 20 menit akan langsung menekan ongkos angkut hasil panen petani lokal secara signifikan.\"\n3. \"Fokus kami ke depan adalah merampungkan pengerasan jalan poros penghubung di kecamatan tetangga.\"",
                'editorial_reply' => "CATATAN FAKTA REDAKSI (MEDIA FACT SHEET)\nKepada Rekan-Rekan Jurnalis & Redaksi Media:\n\nBerikut rangkuman data teknis peresmian Jembatan Sandai - Nanga Tayap:\n- Panjang bentang: 120 meter dengan kapasitas beban standar kendaraan logistik roda 4.\n- Realisasi anggaran: Efisiensi 8% dari pagu DAK Fisik Infrastruktur Daerah 2026.\n- Dampak ekonomi: Menghubungkan sentra perkebunan rakyat seluas 4.200 hektar langsung ke jalur arteri kabupaten.",
                'tiktok' => "Jembatan Sandai-Nanga Tayap Ketapang resmi tuntas! Dari 3 jam naik perahu sekarang cuma 20 menit! Kerja nyata konektivitas pedalaman.",
                'twitter' => "Komitmen nyata infrastruktur pedalaman: Jembatan Sandai - Nanga Tayap rampung lebih cepat! Akses 6 desa kini lancar. #KetapangMaju",
                'instagram' => "KONEKTIVITAS PEDALAMAN NYATA: Jembatan Sandai - Nanga Tayap resmi tuntas, memangkas waktu tempuh warga dari 3 jam jadi 20 menit."
            ]
        ]);

        // Kasus 4: Isu Waspada Kuning (Velocity 52, Negative Moderat)
        $feedLpg = NewsFeed::create([
            'title' => 'Disperindag dan Pertamina Gelar Operasi Pasar Tambahan Tabung LPG 3Kg Subsidi di Sukabangun Ketapang',
            'source' => 'Suara Kalbar',
            'url' => 'https://suarakalbar.co.id/2026/11/distribusi-lpg-3kg-sukabangun-pertamina-gelar-operasi-pasar',
            'raw_content' => 'Menyikapi keluhan antrean warga di beberapa pangkalan pangkalan resmi Kelurahan Sukabangun, Disperindag Ketapang berkoordinasi dengan Pertamina Patra Niaga mendistribusikan kuota tambahan guna memastikan harga eceran tertinggi tetap stabil.',
            'published_at' => now()->subHours(6),
            'velocity_score' => 52,
            'sentiment' => 'negative',
            'ai_status' => 'success',
            'fact_anchor' => [
                'claim' => 'Pemberitaan lokal menyoroti indikasi kelangkaan pasokan gas subsidi melon 3Kg akibat kendala pengiriman.',
                'fact' => 'Keterlambatan disebabkan gelombang pasang di muara Sungai Pawan selama 24 jam. Pasokan telah normal kembali dan Pertamina menggelar operasi pasar ekstra 1.200 tabung dengan HET resmi Rp18.500 per tabung.',
                'reference' => 'Surat Pemberitahuan Sales Area Manager Pertamina Kalbar No. 712/PND-KBR/2026'
            ],
            'scripts' => [
                'press_release' => "SIARAN PERS RESMI\nNOMOR: 016/SP-PERS/XI/2026\n\nRESPONS KENDALA DISTRIBUSI: DISPERINDAG & PERTAMINA GELAR OPERASI PASAR 1.200 TABUNG LPG 3KG DI SUKABANGUN\n\nKETAPANG — Menindaklanjuti dinamika pasokan LPG 3Kg di Sukabangun, Disperindag Kabupaten Ketapang bergerak cepat bersama Pertamina menggelar operasi pasar terpadu mulai hari ini.\n\nArmada kapal pengangkut telah merapat di dermaga Sukabangun setelah tertahan gelombang laut selama 24 jam. Sebanyak 1.200 tabung telah disalurkan langsung ke masyarakat dengan harga eceran resmi Rp18.500.\n\n\"Kami pastikan kuota bulanan aman dan menindak tegas siapapun oknum pangkalan yang berani menimbun atau menjual di atas HET,\" tegas perwakilan tim koordinasi ekonomi.",
                'spokesperson' => "POIN KUTIPAN JURU BICARA (DOORSTOP WARTAWAN):\n\n1. \"Pasokan tabung gas 3Kg sudah kembali normal per siang ini. Kapal tongkang logistik sudah bongkar muat di pelabuhan Sukabangun.\"\n2. \"Tambahan 1.200 tabung langsung dilepas dalam operasi pasar hari ini dengan pengawasan ketat aparat penegak hukum dan Satpol PP.\"\n3. \"Warga kami imbau membeli sesuai kebutuhan dan segera laporkan jika menemukan pangkalan yang nakal memainkan harga.\"",
                'editorial_reply' => "LEMBAR KLARIFIKASI REDAKSI (FACT SHEET)\nKepada Redaksi Suara Kalbar:\n\nPerihal liputan antrean LPG 3Kg Sukabangun, kami sampaikan bahwa:\n1. Tidak ada pengurangan kuota kuota dari BPH Migas/Pertamina untuk Kabupaten Ketapang.\n2. Hambatan murni teknis cuaca laut yang kini telah teratasi 100% melalui operasi pasar cadangan darurat.",
                'tiktok' => "Operasi pasar 1.200 tabung LPG 3Kg resmi digelar di Sukabangun Ketapang seharga Rp18.500. Pasokan kembali aman!",
                'twitter' => "Distribusi LPG 3Kg Sukabangun kembali normal. 1.200 tabung ekstra disalurkan lewat operasi pasar resmi. Jangan panic buying! #InfoKetapang",
                'instagram' => "OPERASI PASAR LPG 3KG SUKABANGUN: 1.200 tabung ekstra digelontorkan dengan HET resmi Rp18.500 pasca keterlambatan logistik cuaca laut."
            ]
        ]);

        // Kasus 5: Berita Mentah Pending (Velocity 0, Siap Diproses API Hermes)
        NewsFeed::create([
            'title' => 'KPUD Ketapang Matangkan Format Debat Publik Terbuka Antarkandidat di Gedung Pancasila',
            'source' => 'Tribun Pontianak',
            'url' => 'https://pontianak.tribunnews.com/2026/11/15/kpud-ketapang-umumkan-tata-tertib-debat-kandidat-pilkada',
            'raw_content' => 'KPU Kabupaten Ketapang mengumumkan tata tertib, panelis independen, dan tema strategis debat publik putaran pertama yang mengusung tema akselerasi pembangunan ekonomi pedalaman dan tata kelola birokrasi berintegritas.',
            'published_at' => now()->subHours(8),
            'velocity_score' => 0,
            'sentiment' => 'neutral',
            'ai_status' => 'pending',
            'fact_anchor' => null,
            'scripts' => null
        ]);

        // Kasus 6: Berita Netral Kondusif (Velocity 32, Hijau Aman)
        NewsFeed::create([
            'title' => 'Bawaslu Ketapang Gelar Deklarasi Netralitas ASN dan Seluruh Kepala Desa Se-Kabupaten',
            'source' => 'Antara Kalbar',
            'url' => 'https://kalbar.antaranews.com/berita/501239/bawaslu-ketapang-deklarasi-netralitas-asn-kepala-desa',
            'raw_content' => 'Ratusan aparatur sipil negara dan kepala desa menandatangani pakta integritas bersama Bawaslu dan Forum Koordinasi Pimpinan Daerah (Forkopimda) guna menjamin profesionalitas pelayanan publik selama tahapan pilkada.',
            'published_at' => now()->subDays(1),
            'velocity_score' => 32,
            'sentiment' => 'neutral',
            'ai_status' => 'success',
            'fact_anchor' => [
                'claim' => 'Pemberitaan menyoroti potensi kerentanan politisasi jabatan struktural dan kepala desa di daerah terpencil.',
                'fact' => 'Seluruh paslon mendukung penuh pakta integritas netralitas dan berkomitmen mengedepankan pertarungan gagasan serta program kerja nyata.',
                'reference' => 'Deklarasi Bersama Netralitas Pemilu Bawaslu Kabupaten Ketapang 2026'
            ],
            'scripts' => [
                'press_release' => "SIARAN PERS RESMI\nNOMOR: 017/SP-PERS/XI/2026\n\nDUKUNGAN PENUH NETRALITAS BIROKRASI: KAMPANYE BERADAB DAN SEJUK DEMI KEMAJUAN KETAPANG\n\nKETAPANG — Kami mengapresiasi setinggi-tingginya penandatanganan pakta integritas netralitas ASN dan kepala desa yang diinisiasi Bawaslu bersama Forkopimda Ketapang.\n\nDemokrasi yang sehat mensyaratkan netralitas aparatur agar pelayanan publik kepada masyarakat tidak terganggu. Kemenangan sejati didasarkan pada kepercayaan rakyat dan kualitas program kerja nyata, bukan mobilisasi birokrasi.",
                'spokesperson' => "POIN KUTIPAN JURU BICARA:\n\n1. \"Kami menyambut baik dan mendukung 100% deklarasi netralitas Bawaslu.\"\n2. \"Aparatur sipil negara harus tetap profesional melayani warga, sementara kami paslon fokus menyampaikan solusi pembangunan konkret.\"",
                'editorial_reply' => "CATATAN FAKTA REDAKSI: Apresiasi media atas deklarasi netralitas ASN demi iklim pilkada yang kondusif, sejuk, dan bermartabat.",
                'tiktok' => "Salut untuk deklarasi netralitas ASN & Kades di Ketapang! Demokrasi sehat dimulai dari pelayanan publik yang netral dan profesional.",
                'twitter' => "Mendukung penuh pakta netralitas ASN & Kades di Pilkada Ketapang. Adu gagasan dan program kerja untuk Ketapang tercinta! #PilkadaDamai",
                'instagram' => "KOMITMEN NETRALITAS & PILKADA SEJUK: Apresiasi inisiatif Bawaslu menjaga netralitas aparatur demi pesta demokrasi berintegritas di Ketapang."
            ]
        ]);

        // 4. Injeksi Notifikasi Krisis In-App
        DB::table('notifications')->truncate();

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
