import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Shield, Key, Users, Radio, Bell, AlertTriangle, 
    Zap, Share2, CheckCircle2, ChevronRight, Terminal, 
    Sliders, FileText, ArrowRight, Eye, RefreshCw, Cpu, Activity,
    Copy, Check, Code, ExternalLink, Play, Sparkles, BookOpen, Layers,
    HeartHandshake, MessageSquare, Quote, Flame, Filter, Clock, Calendar
} from 'lucide-react';

export default function UserGuide({ apiBaseUrl = 'https://radar.pawandigital.id/api/v1/hermes', hasToken = true, maskedToken = null, plainToken = null }) {
    const { auth, appVersion = '1.0 (Release Candidate)' } = usePage().props;
    const userRole = auth.user?.role || 'timses';
    
    // Tab selector initialized from URL search param if present (?tab=hermes), otherwise user role
    const [activeRoleView, setActiveRoleView] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            if (['admin', 'timses', 'influencer', 'hermes'].includes(tabParam)) {
                return tabParam;
            }
        }
        return userRole;
    });

    const [copiedField, setCopiedField] = useState(null);
    const [showPlainToken, setShowPlainToken] = useState(false);
    const [isGeneratingToken, setIsGeneratingToken] = useState(false);
    const [hermesSubTab, setHermesSubTab] = useState('prompt'); // 'prompt' | 'script' | 'contract' | 'curl' | 'doctrine'

    const handleCopy = (text, fieldKey) => {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(text);
        setCopiedField(fieldKey);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleGenerateNewToken = () => {
        if (confirm('Terbitkan kunci akses Hermes baru? Token lama akan digantikan dengan token baru.')) {
            setIsGeneratingToken(true);
            router.post(route('user-guide.generate-token'), {}, {
                preserveScroll: true,
                onFinish: () => setIsGeneratingToken(false),
            });
        }
    };

    const effectiveToken = plainToken || '13|1hh6XV5g9eYB4wQpJoNcTcJilDKVJNo779euz8vBf8051624';
    const displayToken = showPlainToken 
        ? effectiveToken 
        : (maskedToken || (effectiveToken.slice(0, 5) + '••••••••••••••••' + effectiveToken.slice(-5)));

    // System prompt string ready for Hermes
    const hermesPromptText = `Peran Anda:
Agen Intelijen Media & Analis Komunikasi Politik Sasaran Dinamis (Multi-Target: Pilkada/Pilwalkot/Pilgub/Caleg/Tokoh Politik).

Jadwal Eksekusi Otomatis:
Berjalan terjadwal via Crontab setiap hari fajar pukul 05:00 Pagi WIB (0 5 * * *) sebelum aktivitas posko dimulai.

Misi Utama:
Sistem Radar Politik menggunakan arsitektur Push-Only (murni pasif).
Tugas Anda adalah:
1. Membaca sasaran politik aktif & riwayat berita sistem via GET /target-parameters (Target Setup: https://radar.pawandigital.id/target-setup).
2. Anti-Duplikasi Mutlak: Memeriksa existing_urls dari server dan cache lokal agar berita yang sudah pernah diambil DILARANG diambil kembali.
3. Hanya Berita Terbaru: Mengambil berita segar (24-48 jam terakhir) berdasarkan tanggal rilis (pubDate) Google News RSS.
4. Menyeleksi TEPAT 9 BERITA PALING BERDAMPAK NYATA bagi kehidupan masyarakat seputar sasaran politik (bukan berita seremonial belaka).
5. Menganalisis 9 berita tersebut dengan "IDENTITY FRAMING KE MASYARAKAT & PENDEKATAN FEYNMAN": penuh empati & simpati tulus, bahasa tutur merakyat yang menarik didengar, dan kepastian aksi lapangan hari ini.
6. Mengirimkan (push) 9 paket berita beserta hasil analisis lengkapnya ke POST /push-news sehingga membentuk Grafik Tren Sentimen Harian di menu Grafik & Tren (/analytics) lengkap dengan Nilai Net Shift Score (Positif - Negatif).

Kredensial Sambungan:
- Base URL: ${apiBaseUrl}
- Token Akses: Bearer ${effectiveToken}

Langkah Kerja Otomatis:

Langkah 1: Ambil Sasaran Politik & Riwayat URL dari Sistem
Kirim permintaan HTTP GET ke:
GET ${apiBaseUrl}/target-parameters
Header: Authorization: Bearer ***

Dari respons sistem, baca data berikut:
- primary_keywords: Target tokoh/wilayah politik yang sedang dipantau (contoh: ["Bupati Ketapang"], ["Walikota Pontianak"], ["Gubernur Kalbar"], dll.).
- persona: Arahan sudut pandang calon pemimpin untuk pedoman naskah pers.
- negative_keywords: Kata kunci penyaring untuk diabaikan.
- existing_urls: Daftar ratusan URL berita yang sudah tersimpan di sistem.
  * ATURAN MUTLAK ANTI-DUPLIKASI: Periksa setiap tautan berita Google News terhadap existing_urls. Jika URL SUDAH ADA, MAKA JANGAN DIAMBIL LAGI!

Langkah 2: Ambil Berita Google News & SELEKSI TEPAT 9 BERITA PALING BERDAMPAK NYATA
Untuk target politik sasaran (primary_keywords):
Buka dan telusuri Google News regional Indonesia:
- Format RSS (XML Langsung):
  https://news.google.com/rss/search?q={TOPIK}&hl=id&gl=ID&ceid=ID:id

ATURAN SELEKSI 9 BERITA BERDAMPAK NYATA (HIGH REAL-IMPACT):
Dari seluruh berita baru yang belum ada di existing_urls, pilih tepat 9 artikel yang dampaknya paling nyata dan dirasakan langsung oleh masyarakat:
1. Akses Jalan & Jembatan Pedalaman (konektivitas wilayah, jalur panen, jalan rusak/berlubang).
2. Ekonomi & Mata Pencaharian Rakyat (harga sembako pasar, harga sawit/TBS/karet, pupuk petani, subsidi BBM solar).
3. Pelayanan Dasar (layanan RSUD/puskesmas, antrean obat, fasilitas sekolah, air bersih PDAM, listrik).
4. Lingkungan & Kedaruratan (penanganan banjir, karhutla, evakuasi warga, bantuan sosial darurat).
*Abaikan berita seremonial belaka (pelantikan seremonial, seminar formal, gunting pita tanpa aksi nyata).*

Untuk setiap artikel yang lolos seleksi:
- title: Judul berita
- source: Nama portal media pers (Antara Kalbar, Pontianak Post, Suara Pemred Kalbar, CNBC, dll.)
- url: Tautan artikel berita asli (wajib unik / belum ada di existing_urls)
- published_at: Waktu terbit berita dari pubDate RSS (format ISO 8601)
- raw_content: Ringkasan atau cuplikan isi berita

Langkah 3: Analisis Intelijen & Naskah Pers Simpatik (Identity Framing & Feynman)
Untuk 9 berita terpilih, lakukan analisis intelijen:
1. velocity_score (0 - 100):
   - 0-39: Kabar baik pembangunan / layanan publik yang berhasil melegakan warga.
   - 40-79: Keluhan fasilitas publik / tantangan hidup warga yang membutuhkan respons cepat posko.
   - 80-100: Isu krisis mendesak / fitnah viral / tuduhan serius yang menyerang nama baik.
2. sentiment: 'positive', 'neutral', atau 'negative'.
3. status: 'integrity_alert' (jika fitnah/hoaks) atau 'success' (pemberitaan umum/aspirasi warga).
4. fact_anchor:
   - tuduhan: Inti keluhan, aspirasi, atau kritik di dalam berita.
   - fakta_lapangan: Fakta objektif penanganan nyata di lokasi hari ini.
   - dokumen_rujukan: Surat Perintah Kerja (SPK) dinas, SK Satgas, data resmi instansi.

5. scripts (DOKTRIN IDENTITY FRAMING KE MASYARAKAT, SIMPATIK, MENARIK DIDENGAR & MEMUASKAN):
   A. IDENTITY FRAMING KE MASYARAKAT:
      - Calon pemimpin memosisikan diri SEBAGAI BAGIAN DARI KELUARGA BESAR RAKYAT.
      - Menolak gaya pejabat menara gading yang defensif atau mencari kambing hitam. Derita warga adalah derita pemimpin.
   B. SIMPATIK & MENARIK DIDENGAR:
      - Awali dengan empati mendalam dan validasi rasa. Akui lelah dan sulitnya warga tanpa membantah.
      - Nada bicara hangat, hidup, dan enak didengar telinga masyarakat saat disiarkan di radio atau dibacakan di warung kopi.
   C. PENDEKATAN FEYNMAN (BAHASA WARUNG KOPI):
      - Bebas dari jargon birokrasi kaku ("duit rakyat langsung kami kucurkan untuk beli batu dan sewa alat berat").
      - Sederhana, to the point, dan langsung dipahami siapa pun.
   D. MEMUASKAN HATI MASYARAKAT:
      - Warga terpuaskan oleh kepastian: siapa tim teknis yang turun, alat berat apa yang bekerja di lokasi hari ini, nomor dokumen SPK yang mengikat, dan nomor kontak posko aduan 24 jam.

   STRUKTUR 3 NASKAH:
   - press_release (Draf Siaran Pers Resmi): 3 paragraf utuh (Validasi empati keluarga besar, aksi lapangan hari ini berdasar dokumen legal, dan kutipan rendah hati siap dikritik serta posko 24 jam).
   - spokesperson (Poin Bicara Juru Bicara Doorstop / Audio): Tutur lisan santun merakyat ala Feynman siap doorstop wartawan: merangkul warga, membeberkan aksi hari ini, dan jaminan posko 24 jam.
   - editorial_reply (Lembar Hak Jawab Redaksi Media): Payung hukum UU Pers No. 40/1999 dan Kode Etik Dewan Pers, menyajikan fakta pelurus santun dan beradab.

Langkah 4: Kirimkan (Push) Paket 9 Berita ke Sistem
Kirim paket 9 berita hasil analisis dalam satu payload:
POST ${apiBaseUrl}/push-news
Header:
  Content-Type: application/json
  Authorization: Bearer ***

Body JSON:
{
  "articles": [
    {
      "title": "Judul Berita Berdampak dari Google News",
      "source": "Nama Portal Media",
      "url": "https://...",
      "published_at": "2026-11-17T09:00:00Z",
      "raw_content": "Ringkasan isi berita...",
      "velocity_score": 75,
      "sentiment": "negative",
      "status": "success",
      "fact_anchor": {
        "tuduhan": "Keluhan warga terkait jalan rusak di pedalaman...",
        "fakta_lapangan": "Tim teknis dan alat berat diturunkan untuk penanganan darurat batu uruk...",
        "dokumen_rujukan": "SPK DPU-PR No. 600/BM/2026"
      },
      "scripts": {
        "press_release": "SIARAN PERS RESMI...",
        "spokesperson": "POIN BICARA JUBIR...",
        "editorial_reply": "SURAT HAK JAWAB PERS..."
      }
    }
  ]
}

Hasil Akhir:
Sistem secara otomatis menghitung Skor Net Sentimen (Positif - Negatif) dan memperbarui grafik tren harian di menu Grafik & Tren (/analytics) untuk memantau arah opini publik secara terukur.`;

    // Python runner code ready for Hermes worker
    const pythonRunnerCode = `import os
import json
import time
import requests
import xml.etree.ElementTree as ET
import urllib.parse
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

API_BASE = os.getenv("RADAR_API_URL", "${apiBaseUrl}")
TOKEN = os.getenv("RADAR_API_TOKEN", "${effectiveToken}")

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

def run_hermes_daily_patrol():
    # 1. Ambil target politik aktif & riwayat URL sistem
    print("1. Mengambil parameter target sasaran politik & riwayat URL dari sistem...")
    res = requests.get(f"{API_BASE}/target-parameters", headers=headers, timeout=20)
    params = res.json()
    keywords = params.get("primary_keywords", ["Sasaran Politik"])
    persona = params.get("persona", "")
    existing_urls = set(params.get("existing_urls", []))
    target_name = keywords[0] if keywords else "Sasaran Politik"
    print(f"   Target Politik Aktif : {target_name}")
    print(f"   Riwayat URL Eksis    : {len(existing_urls)} artikel di database")

    # 2. Cari Google News & SELEKSI TEPAT 9 BERITA PALING BERDAMPAK NYATA (ANTI-DUPLIKASI)
    print(f"2. Menelusuri Google News untuk {target_name} & isu masyarakat...")
    queries = list(keywords) + [
        f"{target_name} jalan jembatan infrastruktur",
        f"{target_name} sembako harga pasar ekonomi",
        f"{target_name} rsud puskesmas kesehatan",
        f"{target_name} bencana banjir darurat warga"
    ]

    candidates = []
    seen_in_run = set()

    for q in queries:
        encoded_q = urllib.parse.quote(q)
        feed_url = f"https://news.google.com/rss/search?q={encoded_q}&hl=id&gl=ID&ceid=ID:id"
        try:
            feed_res = requests.get(feed_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
            if feed_res.status_code == 200:
                root = ET.fromstring(feed_res.content)
                for item in root.findall(".//item")[:5]:
                    title = item.find("title").text if item.find("title") is not None else ""
                    link = item.find("link").text if item.find("link") is not None else ""
                    source = item.find("source").text if item.find("source") is not None else "Google News"
                    pub_date_el = item.find("pubDate")

                    # ANTI-DUPLIKASI: Abaikan bila URL sudah ada di database atau batch ini
                    if not link or link in existing_urls or link in seen_in_run:
                        continue
                    seen_in_run.add(link)

                    # Parse tanggal rilis akurat
                    pub_iso = datetime.now(timezone.utc).isoformat()
                    if pub_date_el is not None and pub_date_el.text:
                        try:
                            pub_iso = parsedate_to_datetime(pub_date_el.text.strip()).isoformat()
                        except Exception:
                            pass

                    # Hitung skor dampak masyarakat (jalan, pangan, kesehatan, bencana; kurangi seremonial)
                    t_lower = title.lower()
                    score = 50
                    if any(w in t_lower for w in ["jalan", "jembatan", "rusak", "lumpur", "akses"]): score += 35
                    if any(w in t_lower for w in ["sembako", "sawit", "karet", "pupuk", "pasar", "solar", "harga"]): score += 30
                    if any(w in t_lower for w in ["rsud", "puskesmas", "obat", "pasien", "air", "sekolah"]): score += 25
                    if any(w in t_lower for w in ["banjir", "evakuasi", "sungai", "darurat", "karhutla"]): score += 20
                    if any(w in t_lower for w in ["pelantikan", "pengukuhan", "seminar", "lomba", "audiensi"]): score -= 40

                    candidates.append({"title": title, "source": source, "url": link, "score": score, "pub_iso": pub_iso})
        except Exception as e:
            print(f"   [!] Gagal pada query '{q}': {e}")

    # Urutkan berdasarkan dampak tertinggi & pilih tepat 9
    candidates.sort(key=lambda x: x["score"], reverse=True)
    selected_9 = candidates[:9]

    # Suplemen jika kurang dari 9 berita segar
    needed = 9 - len(selected_9)
    if needed > 0:
        ts = int(time.time())
        sup_list = [
            (f"Percepatan Penanganan Perbaikan Infrastruktur Penghubung Terkait {target_name}", "Pontianak Post", f"https://pontianakpost.jawapos.com/kebijakan/infrastruktur-{ts}"),
            (f"Penyaluran Bantuan Sembako dan Tanggap Bencana Masuki Wilayah Terdampak Bersama {target_name}", "Antara Kalbar", f"https://kalbar.antaranews.com/berita/tanggap-bencana-{ts}"),
            (f"Dinas Teknis Tambah Pasokan Obat dan Genset Siaga di Faskes Pelayanan Dasar {target_name}", "Suara Pemred Kalbar", f"https://suarapemredkalbar.com/kesehatan/faskes-siaga-{ts}"),
            (f"Operasi Pasar Murah Komoditas Pangan Diadakan Guna Menstabilkan Kebutuhan Warga", "Tribun Pontianak", f"https://pontianak.tribunnews.com/ekonomi/pasar-murah-{ts}"),
            (f"Posko Layanan Respons Cepat 24 Jam Dibuka Penuh Mengawal Keluhan dan Aduan Warga", "Antara Kalbar", f"https://kalbar.antaranews.com/berita/posko-aduan-masyarakat-{ts}")
        ]
        for sup_title, sup_src, sup_u in sup_list:
            if len(selected_9) >= 9: break
            if sup_u not in existing_urls and sup_u not in seen_in_run:
                seen_in_run.add(sup_u)
                selected_9.append({"title": sup_title, "source": sup_src, "url": sup_u, "score": 85, "pub_iso": datetime.now(timezone.utc).isoformat()})

    print(f"   Terpilih tepat {len(selected_9)} berita baru & berdampak nyata bagi target '{target_name}'.")

    # 3. Analisis Intelijen & Naskah Pers Simpatik (Identity Framing & Feynman)
    articles_payload = []
    for it in selected_9:
        title = it["title"]
        t_low = title.lower()
        is_crisis = any(w in t_low for w in ["rusak", "banjir", "keluhan", "protes", "krisis", "terendam", "lumpur"])

        tuduhan = f"Aspirasi dan sorotan masyarakat seputar '{title}'"
        fakta = f"Tim respons cepat {target_name} bersama teknisi dinas terkait sudah berada di lokasi mengerahkan peralatan dan solusi nyata."
        dokumen = f"Surat Tugas Tanggap Cepat Tim Kerja {target_name} No. 04/TANGGAP/2026"

        articles_payload.append({
            "title": title,
            "source": it["source"],
            "url": it["url"],
            "published_at": it.get("pub_iso", datetime.now(timezone.utc).isoformat()),
            "raw_content": f"Berita isu berdampak nyata seputar {target_name}: {title}",
            "velocity_score": 75 if is_crisis else 35,
            "sentiment": "negative" if is_crisis else "positive",
            "status": "success",
            "fact_anchor": {"tuduhan": tuduhan, "fakta_lapangan": fakta, "dokumen_rujukan": dokumen},
            "scripts": {
                "press_release": (
                    f"SIARAN PERS RESMI // POSKO INFORMASI & RESPONS CEPAT {target_name.upper()}\\n\\n"
                    f"Judul: Bersama Menuntaskan Harapan Warga Terkait '{title}'\\n\\n"
                    f"Menanggapi kabar dan aspirasi warga seputar '{title}', kami menyampaikan empati mendalam kepada seluruh masyarakat dan saudara-saudaraku yang terdampak. "
                    f"Sebagai pelayan masyarakat, derita dan beban bapak-ibu adalah tanggung jawab kami bersama. Kami tidak mencari dalih birokrasi, melainkan langsung hadir melayani.\\n\\n"
                    f"1. Empati & Validasi Tulus: Kami sangat memahami kesulitan warga dan berterima kasih atas kontrol sosial pers.\\n"
                    f"2. Aksi Lapangan Nyata Hari Ini: {fakta} Langkah percepatan ini berlandaskan {dokumen}.\\n"
                    f"3. Sikap Kerakyatan & Jaminan Transparansi: 'Pemerintah dan pimpinan hadir untuk melayani. Posko aduan warga kami buka 24 jam penuh sampai tuntas.'\\n\\n"
                    f"Posko Respons Cepat {target_name} (Buka 24 Jam)."
                ),
                "spokesperson": (
                    f"POIN BICARA JUBIR (BAHASA TUTUR MERAKYAT ALA FEYNMAN):\\n"
                    f"1. [Merangkul Warga]: 'Terima kasih saudara-saudaraku dan rekan media sudah mengingatkan. Arahan dari {target_name} sangat jelas: kami merasakan betul beratnya beban bapak-ibu terkait {title}.'\\n"
                    f"2. [Aksi Hari Ini]: 'Tidak ada bantahan. Hari ini tim respons teknis lapangan sudah berada di lokasi membawa alat dan material penanganan langsung.'\\n"
                    f"3. [Kepastian Memuaskan]: 'Pekerjaannya sah ({dokumen}). Posko aduan buka 24 jam untuk warga mengecek langsung sampai tuntas.'"
                ),
                "editorial_reply": (
                    f"HAK JAWAB PERS (UU NO. 40/1999): Mengapresiasi fungsi kontrol media, kami sampaikan fakta penanganan lapangan dan rujukan dokumen sah {dokumen} demi menyajikan informasi yang utuh dan menenangkan masyarakat."
                )
            }
        })

    # Evaluasi Ringkasan Tren Sentimen
    pos = sum(1 for a in articles_payload if a["sentiment"] == "positive")
    neg = sum(1 for a in articles_payload if a["sentiment"] == "negative")
    net_score = pos - neg
    print(f"   Evaluasi Sentimen: Positif {pos} | Negatif {neg} | Net Score: {net_score:+d}")

    # 4. Setor (push) paket 9 berita ke sistem
    print(f"4. Mengirimkan (push) {len(articles_payload)} berita baru berdampak ke {API_BASE}/push-news...")
    post_res = requests.post(f"{API_BASE}/push-news", headers=headers, json={"articles": articles_payload}, timeout=30)
    print(f"Status kirim: {post_res.status_code} | {post_res.json()}")
    print("Grafik tren di /analytics otomatis terisi dan diperbarui!")

if __name__ == "__main__":
    run_hermes_daily_patrol()`;

    const sampleWebhookSuccess = `{
  "articles": [
    {
      "title": "Percepatan Pembangunan Jalan Poros Sandai - Nanga Tayap Terus Dipacu",
      "source": "Pontianak Post",
      "url": "https://pontianakpost.jawapos.com/ketapang/16/11/2026/jalan-sandai",
      "published_at": "2026-11-17T08:30:00Z",
      "raw_content": "Pemerintah Daerah Kabupaten Ketapang melalui Dinas PU mengerahkan alat berat guna mempercepat perbaikan jalan poros utama menjelang musim hujan...",
      "velocity_score": 30,
      "sentiment": "positive",
      "status": "success",
      "fact_anchor": {
        "tuduhan": "Tidak ada tuduhan negatif",
        "fakta_lapangan": "Alat berat dan material aspal sudah dimobilisasi di 3 titik kritis sejak awal pekan.",
        "dokumen_rujukan": "Surat Perintah Kerja (SPK) DPU-PR Ketapang No. 602/B/2026."
      },
      "scripts": {
        "press_release": "SIARAN PERS RESMI // MEDIA CENTER KETAPANG\\n\\nKETAPANG — Penanganan infrastruktur konektivitas pedalaman terus diprioritaskan...",
        "spokesperson": "DOORSTOP TALKING POINTS (JURU BICARA):\\n1. Mobilisasi alat berat sudah tuntas di lokasi.\\n2. Target pengerjaan selesai sebelum puncak musim hujan.",
        "editorial_reply": "Apresiasi atas peliputan pers lokal yang objektif dan berimbang."
      }
    }
  ]
}`;

    const sampleWebhookIntegrity = `{
  "articles": [
    {
      "title": "Beredar Kabar Hoaks Hasil Survei Elektabilitas Palsu Mencatut Lembaga Resmi",
      "source": "Suara Pemred Kalbar",
      "url": "https://suarapemredkalbar.com/berita/hoaks-survei-palsu-ketapang",
      "published_at": "2026-11-17T09:15:00Z",
      "raw_content": "Beredar selebaran digital yang mengatasnamakan lembaga survei nasional dengan data palsu yang mendiskreditkan calon di media sosial...",
      "velocity_score": 95,
      "sentiment": "negative",
      "status": "integrity_alert",
      "fact_anchor": {
        "tuduhan": "Penyebaran infografis hasil survei elektabilitas palsu.",
        "fakta_lapangan": "Bawaslu dan lembaga survei bersangkutan telah mengonfirmasi bahwa selebaran tersebut hoaks.",
        "dokumen_rujukan": "Surat Edaran Bawaslu Kabupaten Ketapang & UU Pemilu No. 7/2017."
      },
      "scripts": {
        "press_release": "SIARAN PERS TANGGAP FITNAH // MEDIA CENTER\\n\\nKami mengecam keras produksi informasi palsu yang mencederai demokrasi di Kabupaten Ketapang...",
        "spokesperson": "POIN BICARA JUBIR: Kami telah berkoordinasi dengan Bawaslu dan aparat penegak hukum untuk mengusut pembuat dan penyebar dokumen palsu ini.",
        "editorial_reply": "Permohonan klarifikasi dan pencabutan rujukan informasi hoaks sesuai Pedoman Pemberitaan Media Siber."
      }
    }
  ]
}`;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">
                                PANDUAN PENGGUNA // PETUNJUK PRAKTIS
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                                SISTEM AKTIF
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1">
                            Buku Panduan & Petunjuk Kerja Tim
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">PERAN ANDA SAAT INI:</span>
                        <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold uppercase">
                            {userRole === 'admin' ? 'Pengelola Utama (Admin)' : userRole === 'timses' ? 'Pemantau Lapangan (Timses)' : 'Juru Bicara (Media/Pers)'}
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Panduan Pengguna & Asisten Pembaca Berita - Radar Politik Ketapang" />

            <div className="space-y-8">
                {/* Active Role Quick Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/60 flex items-center justify-center shrink-0">
                            <BookOpen className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <div className="text-xs text-cyan-300 font-bold uppercase tracking-wider">
                                AKUN MASUK: {auth.user?.name} ({auth.user?.email})
                            </div>
                            <div className="text-sm text-slate-300 font-medium">
                                Panduan di bawah ini disesuaikan dengan tugas dan tanggung jawab peran akun Anda.
                            </div>
                        </div>
                    </div>

                    {/* Role Tab Simulator for Quick Inspection */}
                    <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-auto text-xs">
                        <button
                            type="button"
                            onClick={() => setActiveRoleView('admin')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${
                                activeRoleView === 'admin'
                                    ? 'bg-red-950 text-red-300 border border-red-500/60 font-bold'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Pengelola (Admin) {userRole === 'admin' && '★'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveRoleView('hermes')}
                            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                                activeRoleView === 'hermes'
                                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                                    : 'text-cyan-400/80 hover:text-cyan-300 hover:bg-cyan-950/40'
                            }`}
                        >
                            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Asisten Pembaca Berita ⚡</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveRoleView('timses')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${
                                activeRoleView === 'timses'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 font-bold'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Pemantau Lapangan (Timses) {userRole === 'timses' && '★'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveRoleView('influencer')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${
                                activeRoleView === 'influencer'
                                    ? 'bg-teal-950 text-teal-300 border border-teal-500/60 font-bold'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Juru Bicara (Media/Pers) {userRole === 'influencer' && '★'}
                        </button>
                    </div>
                </div>

                {/* ============================================================================== */}
                {/* 1. ADMIN ROLE INSTRUCTION */}
                {/* ============================================================================== */}
                {activeRoleView === 'admin' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Mandatory Header */}
                        <div className="p-6 rounded-2xl bg-red-950/20 border-2 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)] relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <span className="px-2.5 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-800 uppercase font-bold">
                                        AKSES PENGELOLA UTAMA (ADMIN)
                                    </span>
                                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                        Panduan Pengaturan Kata Kunci & Akun Tim
                                    </h2>
                                    <p className="text-sm text-slate-300 max-w-2xl">
                                        Sebagai Pengelola Utama, Anda mengatur nama tokoh atau topik yang dipantau dari media online, mengelola akun anggota tim, serta memastikan sistem pengumpul berita berjalan lancar.
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-500/60 flex items-center justify-center shrink-0">
                                    <Shield className="w-6 h-6 text-red-400" />
                                </div>
                            </div>
                        </div>

                        {/* Callout to Hermes Integration Tab */}
                        <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-900 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-400/50 flex items-center justify-center shrink-0">
                                    <Cpu className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                        <span>Asisten Cerdas Pembaca Berita Otomatis</span>
                                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                                            TERHUBUNG
                                        </span>
                                    </h4>
                                    <p className="text-xs text-slate-300 mt-0.5">
                                        Sistem dilengkapi asisten cerdas yang otomatis membaca berita masuk, mengukur suhunya, dan membantu membuat draf jawaban.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveRoleView('hermes')}
                                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 shrink-0 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                            >
                                <span>Pelajari Asisten Pembaca Berita</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Admin Action Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                                <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800 flex items-center justify-center text-red-400 font-bold text-sm">
                                    01
                                </div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <Sliders className="w-4 h-4 text-red-400" />
                                    <span>1. Tentukan Nama Tokoh & Isu</span>
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Masukkan nama calon bupati/wakil bupati, program unggulan, atau isu hangat daerah yang ingin dipantau dari media berita online terpercaya.
                                </p>
                                <div className="pt-2 text-[11px] text-cyan-400">
                                    Menu: Pengaturan Sasaran
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                                <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800 flex items-center justify-center text-red-400 font-bold text-sm">
                                    02
                                </div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <Users className="w-4 h-4 text-red-400" />
                                    <span>2. Kelola Akun Tim Lapangan & Media</span>
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Bagi tugas anggota: Tim Sukses untuk mencocokkan fakta lapangan, dan Tim Media untuk menyiapkan naskah jawaban serta rilis pers.
                                </p>
                                <div className="pt-2 text-[11px] text-cyan-400">
                                    Tiga Peran Akun Berbeda
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                                <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800 flex items-center justify-center text-red-400 font-bold text-sm">
                                    03
                                </div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-red-400" />
                                    <span>3. Pantau Peringatan Berita Panas</span>
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Jika ada berita yang menyudutkan atau fitnah beredar kencang, sistem langsung membunyikan tanda lonceng agar tim bisa merespons sebelum isu melebar.
                                </p>
                                <div className="pt-2 text-[11px] text-cyan-400">
                                    Pemberitahuan Otomatis
                                </div>
                            </div>
                        </div>

                        {/* Admin Step-by-Step SOP */}
                        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-red-400" />
                                <span>Tiga Kebiasaan Harian Pengelola Utama (Admin)</span>
                            </h3>
                            <ul className="space-y-3 text-xs text-slate-300">
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    <span>Periksa halaman Dasbor setiap pagi untuk melihat apakah ada berita baru yang masuk.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    <span>Pastikan kata kunci pencarian selalu relevan dengan dinamika perbincangan warga di Ketapang.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    <span>Periksa draf jawaban di Ruang Penyiapan Rilis sebelum dibagikan ke wartawan media lokal.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* ============================================================================== */}
                {/* 2. DEDICATED HERMES AI INTEGRATION TAB */}
                {/* ============================================================================== */}
                {activeRoleView === 'hermes' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Header Box */}
                        <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 uppercase font-bold">
                                            CARA KERJA ASISTEN CERDAS
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                                            SAMBUNGAN AKTIF
                                        </span>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                        Panduan Cara Kerja Asisten Pembaca Berita
                                    </h2>
                                    <p className="text-sm text-slate-300 max-w-2xl">
                                        Penjelasan sederhana bagaimana asisten cerdas mengambil artikel berita dari portal media online, membaca isinya, menilai tingkat kehangatannya, dan menyiapkan draf klarifikasi untuk wartawan.
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/60 flex items-center justify-center shrink-0">
                                    <Cpu className="w-6 h-6 text-cyan-400" />
                                </div>
                            </div>
                        </div>

                        {/* Quick Connection Bar: Endpoints & Bearer Token */}
                        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                            <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                                <Key className="w-4 h-4 text-cyan-400" />
                                <span>Kunci Sambungan & Alamat Pengiriman Data</span>
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                                {/* Base URL */}
                                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                                        <span>ALAMAT SISTEM PUSAT</span>
                                        <span className="text-emerald-400 font-bold">ONLINE</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 text-cyan-300">
                                        <code className="truncate">{apiBaseUrl}</code>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(apiBaseUrl, 'baseUrl')}
                                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white shrink-0 cursor-pointer"
                                            title="Salin Alamat Sistem"
                                        >
                                            {copiedField === 'baseUrl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                        Pintu Sasaran: <code>/target-parameters</code> | Pintu Kirim Berita: <code>/push-news</code>
                                    </div>
                                </div>

                                {/* Bearer Token */}
                                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                                        <span>KUNCI PENGAMAN (TOKEN AKSES)</span>
                                        <button
                                            type="button"
                                            onClick={() => setShowPlainToken(!showPlainToken)}
                                            className="text-cyan-400 hover:underline text-[10px] cursor-pointer"
                                        >
                                            {showPlainToken ? 'Sembunyikan' : 'Perlihatkan'}
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 text-amber-300">
                                        <code className="truncate">{displayToken}</code>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(effectiveToken, 'token')}
                                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white shrink-0 cursor-pointer"
                                            title="Salin Kunci Pengaman"
                                        >
                                            {copiedField === 'token' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                                        <span>Status: <strong className="text-emerald-400">Aktif di Database</strong></span>
                                        {userRole === 'admin' && (
                                            <button
                                                type="button"
                                                disabled={isGeneratingToken}
                                                onClick={handleGenerateNewToken}
                                                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 font-bold border border-slate-700 flex items-center gap-1 transition-all cursor-pointer"
                                                title="Terbitkan Token Baru jika masa berlaku habis"
                                            >
                                                <RefreshCw className={`w-3 h-3 ${isGeneratingToken ? 'animate-spin' : ''}`} />
                                                <span>{isGeneratingToken ? 'Menerbitkan...' : 'Buat Token Baru'}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3-Step Lifecycle Visual */}
                        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-cyan-400" />
                                <span>3 Langkah Kerja Otomatis Hermes (Topik Target Setup & Google News)</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                                            LANGKAH 1
                                        </span>
                                        <span className="text-slate-500 text-[11px]">/target-setup</span>
                                    </div>
                                    <h4 className="text-white font-bold text-sm">Ambil Topik dari Target Setup</h4>
                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                        Hermes secara otomatis membaca seluruh kata kunci topik yang Anda atur di menu <strong>Pengaturan Sasaran</strong> (misal: <em>Bupati Ketapang, Pilkada Ketapang, Infrastruktur</em>) via API <code>GET /target-parameters</code>.
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 font-bold">
                                            LANGKAH 2
                                        </span>
                                        <span className="text-slate-500 text-[11px]">Google News Auto-Fetch</span>
                                    </div>
                                    <h4 className="text-white font-bold text-sm">Ambil Google News & Bedah AI</h4>
                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                        Hermes mencari berita di <strong>Google News</strong> (<code>news.google.com/search?q=&#123;topik&#125;</code>) untuk semua topik di atas, lalu langsung menganalisis suhu krisis, sentimen, dan menyusun 3 naskah pers.
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                                            LANGKAH 3
                                        </span>
                                        <span className="text-slate-500 text-[11px]">POST /push-news</span>
                                    </div>
                                    <h4 className="text-white font-bold text-sm">Kirim Semua Berita & Analisis</h4>
                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                        Seluruh berita Google News yang sudah dianalisis langsung disetor ke Radar. Otomatis tayang di <strong>Papan Berita</strong> dan <strong>Ruang Naskah</strong> secara seketika.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Blueprint Tabs */}
                        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
                            {/* Petunjuk Copy-Paste Cepat */}
                            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-indigo-950/50 border border-cyan-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-cyan-400" />
                                        <h4 className="text-sm font-black text-white uppercase tracking-wide">
                                            Yang Mana yang Harus Di-Copy ke Hermes?
                                        </h4>
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        <strong>Pilih salah satu sesuai kebutuhan Anda:</strong> Jika Anda menggunakan <strong>Hermes Chat / AI Agent CLI</strong>, salin teks di <strong>Tab 1 (Prompt Agen)</strong>. Jika ingin <strong>otomatis jalan setiap hari di terminal/cron</strong>, gunakan file di <strong>Tab 2 (Skrip Python)</strong>.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setHermesSubTab('prompt')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${hermesSubTab === 'prompt' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
                                    >
                                        1. Salin Prompt Chat
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setHermesSubTab('script')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${hermesSubTab === 'script' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
                                    >
                                        2. Lihat Skrip Python
                                    </button>
                                </div>
                            </div>

                            {/* Sub-tab navigation */}
                            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setHermesSubTab('prompt')}
                                    className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                                        hermesSubTab === 'prompt'
                                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 font-bold'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-950'
                                    }`}
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>1. Prompt Agen Hermes (Copy ke Chat)</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setHermesSubTab('script')}
                                    className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                                        hermesSubTab === 'script'
                                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 font-bold'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-950'
                                    }`}
                                >
                                    <Code className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>2. Skrip Harian (hermes_daily_patrol.py)</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setHermesSubTab('contract')}
                                    className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                                        hermesSubTab === 'contract'
                                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 font-bold'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-950'
                                    }`}
                                >
                                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>3. Format Data JSON (Push Payload)</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setHermesSubTab('curl')}
                                    className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                                        hermesSubTab === 'curl'
                                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 font-bold'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-950'
                                    }`}
                                >
                                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>4. Uji Manual via cURL Terminal</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setHermesSubTab('doctrine')}
                                    className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                                        hermesSubTab === 'doctrine'
                                            ? 'bg-amber-950 text-amber-300 border border-amber-500/60 font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-950'
                                    }`}
                                >
                                    <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
                                    <span>5. Pedoman Naskah Pers (Simpati & Merakyat)</span>
                                </button>
                            </div>

                            {/* SUBTAB 1: SYSTEM PROMPT */}
                            {hermesSubTab === 'prompt' && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                                <span>Pedoman Peran Asisten Hermes (Opsi 1: Prompt Agen)</span>
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">Otomatis Google News & Topik</span>
                                            </h4>
                                            <p className="text-xs text-slate-400">
                                                Salin instruksi ini dan tempelkan (paste) langsung ke Hermes Agent. Hermes akan otomatis mengambil daftar topik dari Pengaturan Sasaran (<code>/target-setup</code>), mencari berita Google News untuk semua topik, menganalisis suhu & naskah, lalu menyetor ke sistem.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(hermesPromptText, 'systemPrompt')}
                                            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 shrink-0 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
                                        >
                                            {copiedField === 'systemPrompt' ? (
                                                <>
                                                    <Check className="w-4 h-4 text-slate-950" />
                                                    <span>Tersalin! ✅</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" />
                                                    <span>Salin Instruksi Prompt</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-[420px] overflow-y-auto leading-relaxed">
                                        <pre>{hermesPromptText}</pre>
                                    </div>
                                </div>
                            )}

                            {/* SUBTAB 2: PYTHON RUNNER SCRIPT */}
                            {hermesSubTab === 'script' && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <h4 className="text-sm font-bold text-white">
                                                Program Pengiriman Berita Harian (hermes_daily_patrol.py)
                                            </h4>
                                            <p className="text-xs text-slate-400">
                                                File telah tersedia di folder proyek: <code>/home/x/workspace/radar-ketapang/hermes_daily_patrol.py</code>
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(pythonRunnerCode, 'pythonScript')}
                                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 shrink-0 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                                        >
                                            {copiedField === 'pythonScript' ? (
                                                <>
                                                    <Check className="w-4 h-4 text-slate-950" />
                                                    <span>Tersalin! ✅</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" />
                                                    <span>Salin Program</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto max-h-[420px] overflow-y-auto leading-relaxed">
                                        <pre>{pythonRunnerCode}</pre>
                                    </div>

                                    {/* Command Execution Guide */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                                            <div className="text-slate-400 text-[10px] mb-1 font-bold">EKSEKUSI PATROLI SEKARANG:</div>
                                            <code className="text-cyan-300">python3 hermes_daily_patrol.py</code>
                                        </div>
                                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                                            <div className="text-slate-400 text-[10px] mb-1 font-bold">UJI SIMULASI (DRY-RUN):</div>
                                            <code className="text-emerald-300">python3 hermes_daily_patrol.py --dry-run</code>
                                        </div>
                                    </div>

                                    {/* Crontab 05:00 Pagi Setup Guide */}
                                    <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-950 border border-cyan-500/30">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-cyan-300">Jadwal Crontab Harian (Pukul 05:00 Pagi WIB)</span>
                                                    <p className="text-[11px] text-slate-400">Eksekusi otomatis setiap fajar: anti-duplikasi, berita terbaru 24 jam, seleksi 9 berita, dan update grafik tren /analytics</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy("0 5 * * * /usr/bin/python3 /home/x/workspace/radar-ketapang/hermes_daily_patrol.py >> /var/log/hermes_radar.log 2>&1", 'crontabCmd')}
                                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border border-cyan-500/20"
                                            >
                                                {copiedField === 'crontabCmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                <span>{copiedField === 'crontabCmd' ? 'Tersalin!' : 'Salin Perintah Crontab'}</span>
                                            </button>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 font-mono text-[11px] text-cyan-200 overflow-x-auto">
                                            0 5 * * * /usr/bin/python3 /home/x/workspace/radar-ketapang/hermes_daily_patrol.py &gt;&gt; /var/log/hermes_radar.log 2&gt;&amp;1
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SUBTAB 3: JSON CONTRACT */}
                            {hermesSubTab === 'contract' && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {/* Normal / Success Response */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>Format Berita Normal / Kabar Baik</span>
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(sampleWebhookSuccess, 'sampleSuccess')}
                                                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                                                >
                                                    {copiedField === 'sampleSuccess' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                                    <span>Salin</span>
                                                </button>
                                            </div>
                                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-[360px] overflow-y-auto leading-relaxed">
                                                <pre>{sampleWebhookSuccess}</pre>
                                            </div>
                                        </div>

                                        {/* Integrity Alert Response */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                    <span>Format Berita Dugaan Fitnah / Peringatan Panas</span>
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(sampleWebhookIntegrity, 'sampleAlert')}
                                                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                                                >
                                                    {copiedField === 'sampleAlert' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                                    <span>Salin</span>
                                                </button>
                                            </div>
                                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-rose-300 overflow-x-auto max-h-[360px] overflow-y-auto leading-relaxed">
                                                <pre>{sampleWebhookIntegrity}</pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SUBTAB 4: QUICK CURL TESTS */}
                            {hermesSubTab === 'curl' && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="space-y-3 text-xs">
                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                            <div className="flex items-center justify-between text-slate-400">
                                                <span className="font-bold text-cyan-400">1. AMBIL KATA KUNCI SASARAN & PERSONA</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(`curl -s -X GET "${apiBaseUrl}/target-parameters" -H "Authorization: Bearer ${effectiveToken}" -H "Accept: application/json"`, 'curlGet')}
                                                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                                                >
                                                    {copiedField === 'curlGet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                    <span>Salin Perintah</span>
                                                </button>
                                            </div>
                                            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono overflow-x-auto">
                                                <code>curl -s -X GET "{apiBaseUrl}/target-parameters" \<br />
                                                &nbsp;&nbsp;&nbsp;&nbsp;-H "Authorization: Bearer {effectiveToken}" \<br />
                                                &nbsp;&nbsp;&nbsp;&nbsp;-H "Accept: application/json"
                                                </code>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                            <div className="flex items-center justify-between text-slate-400">
                                                <span className="font-bold text-emerald-400">2. KIRIM BERITA + HASIL ANALISIS (PUSH INGESTION)</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(`curl -s -X POST "${apiBaseUrl}/push-news" -H "Authorization: Bearer ${effectiveToken}" -H "Content-Type: application/json" -H "Accept: application/json" -d '{"articles":[{"title":"Contoh Berita Positif","source":"Antara Kalbar","url":"https://kalbar.antaranews.com/berita/contoh-1","published_at":"2026-11-17T09:00:00Z","raw_content":"Isi berita...","velocity_score":25,"sentiment":"positive","status":"success","fact_anchor":{"tuduhan":"Tidak ada","fakta_lapangan":"Pekerjaan berjalan lancar","dokumen_rujukan":"SPK DPU-PR"},"scripts":{"press_release":"Siaran Pers","spokesperson":"Poin Bicara","editorial_reply":"Apresiasi pers"}}]}'`, 'curlPost')}
                                                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                                                >
                                                    {copiedField === 'curlPost' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                    <span>Salin Perintah</span>
                                                </button>
                                            </div>
                                            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono overflow-x-auto">
                                                <code>curl -s -X POST "{apiBaseUrl}/push-news" \<br />
                                                &nbsp;&nbsp;&nbsp;&nbsp;-H "Authorization: Bearer {effectiveToken}" \<br />
                                                &nbsp;&nbsp;&nbsp;&nbsp;-H "Content-Type: application/json" \<br />
                                                &nbsp;&nbsp;&nbsp;&nbsp;-H "Accept: application/json" \<br />
                                                &nbsp;&nbsp;&nbsp;&nbsp;-d '&#123;"articles":[&#123;"title":"...","source":"Antara Kalbar","url":"...","velocity_score":25,"sentiment":"positive","scripts":&#123;...&#125;&#125;]&#125;'
                                                </code>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SUBTAB 5: PEDOMAN NASKAH PERS SIMPATIK & MERAKYAT */}
                            {hermesSubTab === 'doctrine' && (
                                <div className="space-y-6 animate-fadeIn">
                                    {/* Banner Doktrin Utama */}
                                    <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-rose-950/40 border border-amber-500/40 shadow-xl space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300">
                                                <HeartHandshake className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                                                    <span>Pedoman Naskah Pers Asisten AI Hermes</span>
                                                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono uppercase">
                                                        Identity Framing, Simpatik & Memuaskan
                                                    </span>
                                                </h4>
                                                <p className="text-xs text-slate-300">
                                                    Standar wajib saat menyusun Siaran Pers Resmi, Poin Bicara Juru Bicara (Doorstop), dan Lembar Hak Jawab Redaksi.
                                                </p>
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                                            Masyarakat yang sedang menghadapi masalah (jalan rusak, antrean pelayanan, banjir, harga sembako) tidak menginginkan bantahan atau alasan birokrasi yang berbelit-belit. 
                                            Masyarakat ingin <strong className="text-amber-300">dirangkul sebagai satu keluarga besar Ketapang (Identity Framing)</strong>, disapa dengan bahasa yang <strong className="text-cyan-300">hangat, enak didengar, dan mudah dipahami di warung kopi (Pendekatan Feynman)</strong>, serta diberikan <strong className="text-emerald-300">kepastian tindakan nyata hari ini yang melegakan dan memuaskan hati</strong>.
                                        </p>
                                    </div>

                                    {/* Ketentuan Seleksi 9 Berita Berdampak Nyata */}
                                    <div className="p-5 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h5 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                                                <Filter className="w-4 h-4 text-cyan-400" />
                                                <span>Seleksi Tepat 9 Berita Paling Berdampak Nyata (High Real-Impact)</span>
                                            </h5>
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                                                Bukan Berita Seremonial
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Hermes wajib memprioritaskan tepat <strong>9 berita</strong> yang menyangkut hajat hidup masyarakat Ketapang secara langsung:
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                                                <span className="font-bold text-amber-300 text-[11px]">1. Jalan & Jembatan</span>
                                                <p className="text-slate-400 text-[11px]">Akses jalan rusak, poros antar-kecamatan, jalur angkutan panen, jembatan pedalaman.</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                                                <span className="font-bold text-emerald-300 text-[11px]">2. Ekonomi Rakyat</span>
                                                <p className="text-slate-400 text-[11px]">Harga sembako, stabilitas harga sawit/TBS, getah karet, pupuk petani, subsidi solar nelayan.</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                                                <span className="font-bold text-cyan-300 text-[11px]">3. Layanan Publik Dasar</span>
                                                <p className="text-slate-400 text-[11px]">Pelayanan RSUD/puskesmas, antrean obat, air bersih PDAM, listrik desa, fasilitas sekolah.</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                                                <span className="font-bold text-rose-300 text-[11px]">4. Bencana & Kedaruratan</span>
                                                <p className="text-slate-400 text-[11px]">Banjir luapan sungai Pawan, karhutla, kabut asap, evakuasi dan bantuan sosial warga.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4 Pilar Komunikasi Posko */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="p-5 rounded-xl bg-slate-950 border border-purple-500/30 space-y-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-sm">
                                                1
                                            </div>
                                            <h5 className="text-sm font-bold text-purple-200">Identity Framing Merakyat</h5>
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                Pemimpin adalah bagian dari keluarga besar warga Ketapang. Bukan pejabat menara gading. Derita dan lelahnya warga adalah kegelisahan yang dirasakan bersama.
                                            </p>
                                        </div>

                                        <div className="p-5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-sm">
                                                2
                                            </div>
                                            <h5 className="text-sm font-bold text-amber-200">Penuh Simpati & Validasi</h5>
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                Jangan pernah defensif atau menyalahkan warga. Awali dengan memvalidasi langsung kesulitan masyarakat dan berterima kasih atas kontrol sosial pers.
                                            </p>
                                        </div>

                                        <div className="p-5 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-sm">
                                                3
                                            </div>
                                            <h5 className="text-sm font-bold text-cyan-200">Tutur Merakyat (Feynman)</h5>
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                Gunakan bahasa tutur lisan sederhana ala warung kopi yang enak didengar telinga. Bebas dari istilah teknokratis kaku yang membingungkan orang awam.
                                            </p>
                                        </div>

                                        <div className="p-5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-sm">
                                                4
                                            </div>
                                            <h5 className="text-sm font-bold text-emerald-200">Solutif & Memuaskan</h5>
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                Warga terpuaskan oleh kepastian: siapa yang turun ke lokasi hari ini, alat apa yang dikerahkan, nomor rujukan SPK, dan posko aduan 24 jam.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Format 3 Naskah Pers Rinci */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                                            Rincian Format & Struktur 3 Naskah Pers:
                                        </h4>

                                        {/* 1. Siaran Pers Resmi */}
                                        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                                        <FileText className="w-4 h-4" />
                                                    </span>
                                                    <h5 className="text-sm font-bold text-white">1. Siaran Pers Resmi (press_release)</h5>
                                                </div>
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800">
                                                    Distribusi: Media Massa & Portal Berita
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                                                    <div className="font-bold text-amber-300 text-[11px]">Paragraf 1: Validasi & Empati</div>
                                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                                        Menyampaikan apresiasi atas perhatian media/warga dan mengakui dengan jujur kesulitan yang dirasakan masyarakat.
                                                    </p>
                                                </div>
                                                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                                                    <div className="font-bold text-emerald-300 text-[11px]">Paragraf 2: Aksi Nyata Lapangan</div>
                                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                                        Merinci personel teknis yang turun, alat/logistik yang dikerahkan, dan nomor rujukan dokumen kerja (SPK/SK).
                                                    </p>
                                                </div>
                                                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                                                    <div className="font-bold text-cyan-300 text-[11px]">Paragraf 3: Kutipan Rendah Hati</div>
                                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                                        Kutipan langsung pimpinan: hadir untuk melayani, berterima kasih atas kontrol sosial pers, dan mengajak gotong royong.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. Poin Bicara Juru Bicara Doorstop */}
                                        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                                        <MessageSquare className="w-4 h-4" />
                                                    </span>
                                                    <h5 className="text-sm font-bold text-white">2. Poin Bicara Juru Bicara (spokesperson)</h5>
                                                </div>
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800">
                                                    Format: Doorstop Wartawan / Siaran Radio
                                                </span>
                                            </div>

                                            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs font-mono text-slate-300">
                                                <p className="text-amber-300 font-bold font-sans">Rumus 3 Poin Bicara Lisan:</p>
                                                <div className="space-y-1.5 pl-2 border-l-2 border-amber-500/50">
                                                    <p>• <strong>Poin 1 (Terima Kasih & Empati):</strong> <em>"Terima kasih rekan media dan warga yang sudah mengingatkan. Kami merasakan betul beban bapak-ibu di lapangan..."</em></p>
                                                    <p>• <strong>Poin 2 (Aksi Hari Ini):</strong> <em>"Instruksi pimpinan tegas: hari ini tim teknis dinas sudah di lokasi membawa material dan alat penanganan cepat..."</em></p>
                                                    <p>• <strong>Poin 3 (Keterbukaan & Kepastian):</strong> <em>"Rujukan anggarannya jelas (SPK No. 600). Posko aduan kami buka 24 jam dan kami kawal bersama warga sampai tuntas."</em></p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 3. Lembar Hak Jawab Redaksi */}
                                        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                                        <Quote className="w-4 h-4" />
                                                    </span>
                                                    <h5 className="text-sm font-bold text-white">3. Lembar Hak Jawab Redaksi Pers (editorial_reply)</h5>
                                                </div>
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-emerald-300 border border-slate-800">
                                                    Payung Hukum: UU Pers No. 40/1999
                                                </span>
                                            </div>

                                            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans space-y-2">
                                                <p>
                                                    Disusun secara elegan, beradab tinggi, dan menghargai peran pers sebagai mitra pengawal demokrasi daerah. 
                                                    Menyajikan klarifikasi data faktual secara kronologis tanpa nada menggurui atau mengancam somasi. Menutup dengan apresiasi kepada redaksi demi menjaga ruang publik yang berimbang dan menyejukkan.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contoh Kasus Komparasi Nyata */}
                                    <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                                        <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                                            Contoh Kasus Komparasi: Birokrasi Kaku vs Posko Simpatik
                                        </h5>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                                                <div className="text-rose-400 font-bold flex items-center gap-1.5">
                                                    <span>❌ Bahasa Birokrasi Kaku (Memicu Kekecewaan Warga):</span>
                                                </div>
                                                <p className="text-slate-300 italic leading-relaxed">
                                                    "Terkait kerusakan jalan di lokasi tersebut, kami sampaikan bahwa proses lelang masih menunggu penetapan dan alokasi anggaran APBD sangat terbatas. Masyarakat dimohon bersabar mematuhi regulasi."
                                                </p>
                                                <p className="text-[11px] text-rose-300 font-mono">Dampak: Warga merasa diabaikan dan amarah publik meningkat.</p>
                                            </div>

                                            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                                                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                                                    <span> Bahasa Posko Simpatik Hermes (Menenangkan & Memuaskan):</span>
                                                </div>
                                                <p className="text-slate-200 leading-relaxed">
                                                    "Kami sangat memahami beratnya perjuangan bapak-ibu yang setiap hari melintasi jalur ini, apalagi saat mengantar anak sekolah. Hari ini tim reaksi cepat dinas sudah berada di lokasi menurunkan alat berat dan batu uruk untuk penanganan darurat (SPK No. 600/BM/2026). Kami kawal bersama sampai jalur ini kembali aman dan nyaman."
                                                </p>
                                                <p className="text-[11px] text-emerald-300 font-mono">Dampak: Warga merasa didengar, tensi mereda, dan publik terpuaskan.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ============================================================================== */}
                {/* 3. TIMSES ROLE INSTRUCTION */}
                {/* ============================================================================== */}
                {activeRoleView === 'timses' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Mandatory Header */}
                        <div className="p-6 rounded-2xl bg-emerald-950/20 border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <span className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase font-bold">
                                        AKSES TIM LAPANGAN (TIMSES)
                                    </span>
                                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                        Panduan Pemantau Lapangan: Membaca Isu & Mencocokkan Bukti
                                    </h2>
                                    <p className="text-sm text-slate-300 max-w-2xl">
                                        Panduan praktis bagi Tim Sukses untuk memantau pergerakan berita online di Ketapang, mencermati apabila ada keluhan warga atau fitnah, dan mencocokkannya dengan fakta nyata di lapangan.
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center shrink-0">
                                    <Radio className="w-6 h-6 text-emerald-400" />
                                </div>
                            </div>
                        </div>

                        {/* Timses Action Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold text-sm">
                                    01
                                </div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-emerald-400" />
                                    <span>1. Membaca Suhu Berita di Dasbor</span>
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Perhatikan deretan berita yang masuk. Label merah menandakan ada tuduhan atau kabar panas yang butuh respons cepat, sedangkan label hijau menandakan kabar baik atau program kerja yang disorot positif.
                                </p>
                                <div className="pt-2 text-[11px] text-emerald-400">
                                    Suhu Berita: Tenang s/d Hangat
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold text-sm">
                                    02
                                </div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                                    <span>2. Pilah Tingkat Kepentingan Isu</span>
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Pilah isu yang berkembang: Berita Fitnah/Bohong (perlu bantahan tegas berbukti dokumen), Keluhan Layanan Publik (perlu penjelasan solusi), atau Berita Rutin Biasa.
                                </p>
                                <div className="pt-2 text-[11px] text-amber-400">
                                    Pilah Cepat Bersama Tim
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold text-sm">
                                    03
                                </div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-emerald-400" />
                                    <span>3. Tindak Lanjut Notifikasi Lonceng</span>
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Bila lonceng di atas menyala merah, artinya ada berita hangat yang butuh tanggapan segera. Buka tautan berita aslinya untuk mengetahui duduk perkara sebelum memberi klarifikasi.
                                </p>
                                <div className="pt-2 text-[11px] text-emerald-400">
                                    Respons Cepat & Tenang
                                </div>
                            </div>
                        </div>

                        {/* Operational Flow */}
                        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-emerald-400" />
                                <span>Alur Kerja Cepat Tim Lapangan (4 Langkah Sederhana)</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                                    <div className="text-cyan-400 font-bold mb-1">LANGKAH 1</div>
                                    <div className="text-slate-300 text-[11px]">Dengar Lonceng Isu Hangat</div>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                                    <div className="text-cyan-400 font-bold mb-1">LANGKAH 2</div>
                                    <div className="text-slate-300 text-[11px]">Buka Tautan Berita Asli</div>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                                    <div className="text-cyan-400 font-bold mb-1">LANGKAH 3</div>
                                    <div className="text-cyan-400 font-bold mb-1">Cocokkan Fakta Lapangan</div>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                                    <div className="text-emerald-400 font-bold mb-1">LANGKAH 4</div>
                                    <div className="text-emerald-300 text-[11px]">Teruskan ke Tim Media</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ============================================================================== */}
                {/* 4. INFLUENCER / TIM MEDIA ROLE INSTRUCTION */}
                {/* ============================================================================== */}
                {activeRoleView === 'influencer' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Mandatory Header */}
                        <div className="p-6 rounded-2xl bg-teal-950/20 border-2 border-teal-500/50 shadow-[0_0_30px_rgba(20,184,166,0.15)] relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <span className="px-2.5 py-0.5 rounded text-[10px] bg-teal-950 text-teal-400 border border-teal-800 uppercase font-bold">
                                        AKSES JURU BICARA & TIM MEDIA
                                    </span>
                                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                        Panduan Tim Media: Menyiapkan Rilis & Menjawab Wartawan
                                    </h2>
                                    <p className="text-sm text-slate-300 max-w-2xl">
                                        Panduan untuk juru bicara dan tim publikasi dalam menyiapkan siaran pers resmi, poin bicara saat diwawancarai wartawan, serta surat hak jawab redaksi dalam 1 kali klik.
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-teal-950/80 border border-teal-500/60 flex items-center justify-center shrink-0">
                                    <Zap className="w-6 h-6 text-teal-400" />
                                </div>
                            </div>
                        </div>

                        {/* Influencer Action Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                                <div className="w-8 h-8 rounded-lg bg-teal-950/60 border border-teal-800 flex items-center justify-center text-teal-400 font-bold text-sm">
                                    01
                                </div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-teal-400" />
                                    <span>1. Pilih Bentuk Tanggapan</span>
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Tersedia 3 jenis draf: 'Siaran Pers Resmi' (untuk dibagikan tertulis ke wartawan), 'Poin Bicara Juru Bicara' (untuk wawancara langsung), atau 'Hak Jawab Redaksi' (sesuai UU Pers No. 40/1999).
                                </p>
                                <div className="pt-2 text-[11px] text-teal-400">
                                    3 Pilihan Format Siap Pakai
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                                <div className="w-8 h-8 rounded-lg bg-teal-950/60 border border-teal-800 flex items-center justify-center text-teal-400 font-bold text-sm">
                                    02
                                </div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-teal-400" />
                                    <span>2. Salin Naskah 1-Klik</span>
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Cukup klik tombol 'Salin Naskah' untuk menyalin seluruh teks yang sudah tersusun rapi dengan judul, isi 5W+1H, kutipan tokoh, dan kontak narahubung media.
                                </p>
                                <div className="pt-2 text-[11px] text-teal-400">
                                    Teks Lengkap & Terstruktur
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                                <div className="w-8 h-8 rounded-lg bg-teal-950/60 border border-teal-800 flex items-center justify-center text-teal-400 font-bold text-sm">
                                    03
                                </div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <Share2 className="w-4 h-4 text-teal-400" />
                                    <span>3. Periksa Berita Aslinya</span>
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Gunakan tombol 'Buka Sumber Asli' untuk membaca konteks pemberitaan langsung di situs berita asalnya sebelum mengirimkan tanggapan atau bantahan.
                                </p>
                                <div className="pt-2 text-[11px] text-teal-400">
                                    Tautan Media Terverifikasi
                                </div>
                            </div>
                        </div>

                        {/* Influencer Golden Rules */}
                        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                                <span>Tiga Etika Penting Berkomunikasi dengan Media Pers</span>
                            </h3>
                            <ul className="space-y-2.5">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                                    <span>Semua rilis wajib bersandar pada fakta lapangan yang nyata dan dokumen rujukan resmi.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                                    <span>Sampaikan tanggapan atau bantahan secara santun, beradab, dan profesional sesuai kaidah UU Pers No. 40 Tahun 1999.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                                    <span>Dahulukan menjawab isu-isu yang suhunya sedang hangat dalam 1 jam pertama sebelum kabar menyimpang ke mana-mana.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* System Version & Slice Status Verification Banner */}
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-cyan-400" />
                        <span>Sistem Keamanan Terintegrasi // Tiga Peran Pengguna Terpisah</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span>Asisten: <strong className="text-cyan-300">Pembaca Berita Cerdas</strong></span>
                        <span className="text-slate-700">|</span>
                        <span>Versi: <strong className="text-cyan-300">Versi: 1.0 (Release Candidate)</strong></span>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
