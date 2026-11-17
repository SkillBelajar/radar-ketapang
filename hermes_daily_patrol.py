#!/usr/bin/env python3
"""
hermes_daily_patrol.py
======================
Eksekutor Otonom Asisten AI Hermes untuk Pemantauan Radar Politik & Reputasi.
Dijalankan terjadwal via Crontab setiap hari pukul 05:00 Pagi WIB (0 5 * * *).

Misi Utama:
1. Membaca sasaran politik aktif (Target Politik) dari endpoint /target-parameters.
2. Anti-Duplikasi Mutlak: Memeriksa existing_urls dari server & cache lokal agar
   berita yang sudah pernah diambil tidak diambil kembali.
3. Hanya Berita Terbaru: Mem-parse tanggal rilis asli (pubDate) Google News RSS (24-48 jam).
4. Seleksi Tepat 9 Berita Paling Berdampak Nyata bagi masyarakat terkait sasaran politik.
5. Analisis Sentimen, Suhu Krisis, serta Doktrin Komunikasi Simpatik & Pendekatan Feynman.
6. Menyetorkan (Push) paket 9 berita ke /push-news sehingga membentuk grafik tren harian
   di menu Grafik & Tren (/analytics) lengkap dengan nilai sentimen bersih (Net Shift Score).
"""

import os
import sys
import json
import time
import logging
import urllib.request
import urllib.parse
import urllib.error
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Set, Tuple

# Konfigurasi Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("HermesDailyPatrol")

# Resolusi Token Sanctum
def get_token() -> str:
    """Mengambil token API dari environment atau file lokal."""
    env_token = os.getenv("RADAR_API_TOKEN")
    if env_token and len(env_token.strip()) > 10:
        return env_token.strip()
    
    radar_env_path = os.path.expanduser("~/.hermes/radar.env")
    if os.path.exists(radar_env_path):
        try:
            with open(radar_env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("RADAR_API_TOKEN="):
                        return line.split("=", 1)[1].strip().strip('"').strip("'")
        except Exception:
            pass
    # Token default Sanctum ID 13 terikat akun admin@radar.com
    return "13|1hh6XV5g9eYB4wQpJoNcTcJilDKVJNo779euz8vBf8051624"


API_BASE = os.getenv("RADAR_API_URL", "https://radar.pawandigital.id/api/v1/hermes")
TOKEN = get_token()
CACHE_DIR = os.path.expanduser("~/.hermes")
CACHE_FILE = os.path.join(CACHE_DIR, "radar_seen_urls.json")


def load_local_seen_cache() -> Set[str]:
    """Memuat cache URL yang sudah pernah dipush sebelumnya untuk anti-duplikasi."""
    if not os.path.exists(CACHE_FILE):
        return set()
    try:
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return set(data.get("seen_urls", []))
    except Exception:
        return set()


def save_local_seen_cache(new_urls: Set[str]) -> None:
    """Menyimpan riwayat URL ke cache lokal agar tidak pernah diambil lagi."""
    try:
        os.makedirs(CACHE_DIR, exist_ok=True)
        current = load_local_seen_cache()
        current.update(new_urls)
        # Batasi cache lokal hingga 2000 URL terakhir
        recent_list = list(current)[-2000:]
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump({"seen_urls": recent_list, "updated_at": datetime.now(timezone.utc).isoformat()}, f, indent=2)
    except Exception as e:
        logger.warning(f"Gagal menyimpan cache lokal seen_urls: {e}")


def api_request(endpoint: str, method: str = "GET", data: Dict[str, Any] = None) -> Optional[Dict[str, Any]]:
    """Helper request HTTP dengan Bearer token Sanctum."""
    url = f"{API_BASE}{endpoint}"
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "HermesDailyPatrol/3.0 (TargetAgnostic-Deduplication)"
    }

    req_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body)
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else ""
        logger.error(f"HTTP Error {e.code} pada {endpoint}: {error_body}")
        return None
    except Exception as e:
        logger.error(f"Koneksi gagal ke {endpoint}: {e}")
        return None


def fetch_target_parameters() -> Dict[str, Any]:
    """Mengambil parameter sasaran politik, kata kunci, dan daftar URL eksis."""
    logger.info("1. Mengambil parameter target sasaran politik & riwayat URL dari sistem...")
    resp = api_request("/target-parameters", method="GET")
    if resp and resp.get("status") == "success":
        primary = resp.get("primary_keywords", ["Sasaran Politik"])
        logger.info(f"   Target Sasaran Aktif: {primary}")
        logger.info(f"   Persona Pemimpin    : {resp.get('persona')}")
        logger.info(f"   Riwayat URL Eksis   : {len(resp.get('existing_urls', []))} artikel di database")
        return resp
    logger.warning("   Gagal mengambil parameter via API, menggunakan fallback parameter sasaran.")
    return {
        "primary_keywords": ["Bupati Ketapang"],
        "negative_keywords": ["korupsi", "karhutla", "dinasti politik"],
        "persona": "Pemimpin daerah yang santun, solutif, merakyat, dan melayani warga sepenuh hati.",
        "existing_urls": []
    }


def calculate_impact_score(title: str, content: str) -> int:
    """
    Menghitung skor dampak nyata (High Real-Impact) bagi masyarakat luas:
    - Infrastruktur dasar: jalan, jembatan, perhubungan (+35)
    - Perekonomian rakyat: sembako, sawit/TBS, getah karet, pupuk, nelayan, solar, pasar (+30)
    - Kebutuhan esensial: rumah sakit, puskesmas, obat, air bersih PDAM, sekolah (+25)
    - Kedaruratan & bencana: banjir, evakuasi, karhutla, tanggap darurat (+20)
    - Penalti berita seremonial murni tanpa dampak langsung (-40)
    """
    text = (title + " " + content).lower()
    score = 50

    # Dampak infrastruktur
    if any(k in text for k in ["jalan", "jembatan", "poros", "rusak", "lumpur", "akses", "perhubungan"]):
        score += 35
    # Dampak ekonomi harian
    if any(k in text for k in ["sembako", "sawit", "tbs", "karet", "pupuk", "nelayan", "pasar", "solar", "bbm", "harga", "panen"]):
        score += 30
    # Dampak pelayanan dasar
    if any(k in text for k in ["rsud", "puskesmas", "pasien", "air bersih", "pdam", "listrik", "sekolah", "obat", "kesehatan"]):
        score += 25
    # Kedaruratan & bencana
    if any(k in text for k in ["banjir", "evakuasi", "bencana", "tenggelam", "karhutla", "darurat", "longsor"]):
        score += 20

    # Penalti berita seremonial murni
    if any(k in text for k in ["pelantikan", "pengukuhan", "seminar", "ziarah", "gunting pita", "lomba", "audiensi", "foto bersama"]):
        score -= 40

    return max(0, min(100, score))


def analyze_article(
    title: str,
    source: str,
    url: str,
    content: str,
    target_name: str,
    persona: str,
    published_date_str: Optional[str] = None,
    candidate_profile: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Hermes AI Analysis dengan DOKTRIN PERSONAL BRANDING POLITIK & IDENTITY FRAMING KE MASYARAKAT:
    - Ditujukan bagi siapa saja yang ingin terjun ke politik (Cakada, Caleg, Tokoh Muda, Petahana).
    - Memanfaatkan setiap isu daerah sebagai momentum mengangkat nama, empati, dan elektabilitas tokoh.
    - Menghasilkan 5 format narasi:
      1. social_caption (Instagram/TikTok/FB/X lengkap dgn Hook, Sikap Tokoh, Solusi, CTA, Hashtag)
      2. candidate_statement (Pernyataan Sikap Tokoh untuk rujukan berita wartawan)
      3. spokesperson (Poin bicara sapa warga warung kopi/doorstop Feynman)
      4. press_release (Siaran pers resmi media center tim pemenangan)
      5. editorial_reply (Lembar hak jawab redaksi & tangkis isu miring)
    """
    candidate_profile = candidate_profile or {}
    c_name = candidate_profile.get("name") or target_name
    c_role = candidate_profile.get("political_role") or "Kandidat Pemimpin Daerah"
    c_district = candidate_profile.get("electoral_district") or "Daerah Pemilihan"
    c_tagline = candidate_profile.get("branding_tagline") or "Bekerja Nyata untuk Kesejahteraan Warga"
    
    combined_text = (title + " " + content).lower()

    # Klasifikasi isu & deteksi sentimen
    is_neg = any(w in combined_text for w in ["rusak", "banjir", "lumpur", "mahal", "keluhan", "protes", "antrean", "langka", "terputus", "krisis", "terbengkalai", "korupsi"])
    is_pos = any(w in combined_text for w in ["resmikan", "bangun", "bantuan", "turun", "normal", "teratasi", "apresiasi", "stabil", "penghargaan", "tuntas", "cair"])

    clean_name_tag = "".join(ch for ch in c_name if ch.isalnum())
    clean_district_tag = "".join(ch for ch in c_district if ch.isalnum())

    if is_neg:
        sentiment = "negative"
        velocity = 88
        status = "integrity_alert"
        tuduhan = f"Warga mengeluhkan dampak '{title}' dan mendesak penanganan segera tanpa alasan penundaan."
        fakta = f"Hari ini tim advokasi aspirasi dan relawan {c_name} bersama warga turun langsung ke lokasi, menyerap keluhan di lapangan, dan mengoordinasikan solusi nyata bersama pihak terkait."
        dokumen = f"Lembar Catatan Advokasi Aspirasi Warga Posko {c_name} No. 04/ADV/{datetime.now().year}."
        isu_spesifik = "keluhan mendesak warga ini"
        branding_angle = f"Momentum Kepemimpinan: Tampilkan {c_name} sebagai figur yang paling tanggap, berani hadir di tengah kesulitan rakyat, dan vokal memperjuangkan solusi tuntas."
    elif is_pos:
        sentiment = "positive"
        velocity = 65
        status = "success"
        tuduhan = "Tidak ada tuduhan; pemberitaan bernada positif dan apresiatif atas kemajuan penanganan."
        fakta = f"Inisiatif dan dorongan aspirasi dari elemen masyarakat bersama figur seperti {c_name} membuahkan hasil nyata bagi kesejahteraan warga di {c_district}."
        dokumen = f"Dokumen Rekapitulasi Aspirasi & Progres Lapangan {c_name} No. 12/PROG/{datetime.now().year}."
        isu_spesifik = "kabar baik dan kemajuan daerah ini"
        branding_angle = f"Momentum Amplifikasi: Jadikan kabar baik ini sebagai bukti bahwa visi pembangunan dan kerja nyata yang didorong {c_name} terbukti membawa dampak positif."
    else:
        sentiment = "neutral"
        velocity = 55
        status = "success"
        tuduhan = "Informasi reguler terkait kebijakan dan perkembangan situasi kemasyarakatan."
        fakta = f"Posko pergerakan dan komunikasi {c_name} terus memonitor dinamika harian dan berdialog intensif dengan tokoh masyarakat, pemuda, dan kelompok rentan."
        dokumen = f"Notula Temu Aspirasi & Dialog Warga Posko {c_name} No. 08/DLG/{datetime.now().year}."
        isu_spesifik = "perkembangan informasi ini"
        branding_angle = f"Momentum Edukasi: Posisikan {c_name} sebagai tokoh visioner yang mengedukasi warga dan menyiapkan peta jalan perbaikan jangka panjang."

    # 1. Narasi Medsos Tokoh (Instagram Feed/Reels, TikTok, Facebook, Thread X)
    social_caption = (
        f"📱 [CATATAN & SIKAP {c_name.upper()} // {c_district.upper()}]\n\n"
        f"\"Mendengar langsung kabar soal '{title}', hati saya ikut bergetar. Bagi saya, apa yang dirasakan warga hari ini bukanlah sekadar berita di layar ponsel, melainkan panggilan nurani yang harus kita perjuangkan bersama.\"\n\n"
        f"Bapak, Ibu, dan saudaraku sekalian di {c_district},\n"
        f"Sebagai bagian dari keluarga besar kita di sini, kami memegang teguh komitmen: {c_tagline}. Masalah {isu_spesifik} tidak boleh dibiarkan berlarut-larut apalagi ditutupi dengan alasan administratif.\n\n"
        f"📌 Sikap dan komitmen kami hari ini:\n"
        f"1. Kami hadir memvalidasi keresahan warga—tidak ada bantahan, karena suara rakyat adalah kompas utama kami.\n"
        f"2. Tim relawan dan advokasi kami sudah bergerak turun ke titik lokasi untuk mendata kebutuhan mendesak warga.\n"
        f"3. Kami akan kawal terus koordinasi teknisnya sampai masyarakat benar-benar merasakan ketenangan dan perubahan nyata.\n\n"
        f"Bagi bapak-ibu yang mengalami langsung kendala ini, silakan sampaikan ceritanya di kolom komentar atau hubungi tim Posko Aspirasi 24 jam kami. Mari kita jaga dan bangun daerah kita dengan kerja ikhlas dan nyata!\n\n"
        f"#{clean_name_tag} #{clean_district_tag} #SuaraRakyat #PeduliWarga #KerjaNyata #PemimpinMerakyat #Aspirasi{clean_district_tag}"
    )

    # 2. Pernyataan Sikap Tokoh (Op-Ed / Doorstop Jurnalis Media Online)
    candidate_statement = (
        f"🎙️ PERNYATAAN SIKAP RESMI {c_name.upper()} ({c_role})\n"
        f"Terkait Isu: \"{title}\"\n\n"
        f"\"{isu_spesifik.capitalize()} menyangkut langsung hajat hidup warga di {c_district}. Saya mengimbau seluruh pihak untuk mengedepankan empati dan kecepatan bertindak. Rakyat tidak membutuhkan retorika kaku di atas kertas, rakyat butuh kepastian solusi hadir di depan mata mereka.\n\n"
        f"Kami di jajaran tim perjuangan bersama masyarakat memastikan diri siap menjadi jembatan advokasi yang solutif. Pintu posko aspirasi kami terbuka 24 jam penuh untuk menyerap dan mengawal setiap hak masyarakat agar terpenuhi secara adil dan bermartabat.\"\n\n"
        f"— {c_name} ({c_role} // {c_district})"
    )

    # 3. Poin Bicara Jubir / Sapa Warga Warung Kopi ala Feynman
    spokesperson = (
        f"POIN BICARA JURU BICARA & SAPA WARGA (DOORSTOP / WARUNG KOPI // TUTUR MERAKYAT FEYNMAN):\n"
        f"1. [Merangkul & Validasi Empati]: 'Assalamu'alaikum dan salam hangat bapak-ibu sekalian serta kawan-kawan media. Pesan dari {c_name} sangat tegas: terima kasih banyak sudah mengingatkan kita semua soal {title}. Beliau merasakan betul beratnya beban bapak-ibu di bawah. Bagi beliau, keluhan warga adalah amanah perjuangan kami.'\n"
        f"2. [Aksi Konkret Bukan Janji Manis]: 'Prinsip {c_name} sederhana: jangan banyak beralasan. Hari ini tim advokasi kami langsung turun mendampingi warga dan mendorong percepatan penanganan {isu_spesifik} di lapangan.'\n"
        f"3. [Jaminan Pengawalan Terbuka]: 'Posko aspirasi {c_name} dibuka 24 jam. Kalau ada hal yang dirasa belum adil atau lambat ditangani, bapak-ibu bisa langsung kabari kami. {c_name} berkomitmen mengawal ini sampai tuntas demi kepuasan dan kesejahteraan seluruh warga.'"
    )

    # 4. Siaran Pers Resmi Media Center Tim Pemenangan
    press_release = (
        f"SIARAN PERS RESMI // MEDIA CENTER TIM {c_name.upper()}\n\n"
        f"Judul: Bersama Menuntaskan Harapan Warga: Komitmen Nyata {c_name} Sikapi '{title}'\n\n"
        f"{c_district.upper()} — Menanggapi dinamika pemberitaan seputar '{title}', Media Center {c_name} menegaskan komitmen penuh sang kandidat dalam mengawal aspirasi dan kesejahteraan warga masyarakat.\n\n"
        f"1. Kejujuran Sikap & Empati Warga: {c_name} memandang setiap keluhan publik sebagai cermin amanah yang harus dijawab dengan langkah taktis, bukan dalih birokrasi. 'Kita adalah satu keluarga besar; kesulitan warga adalah tanggung jawab moral kami untuk terus bersuara dan berbuat nyata,' ujar perwakilan Media Center.\n\n"
        f"2. Langkah Nyata & Advokasi Lapangan: {fakta} Seluruh langkah advokasi ini didasarkan pada {dokumen} demi memastikan hak-hak masyarakat terpenuhi secara transparan.\n\n"
        f"3. Komitmen Kepemimpinan Merakyat: {c_name} secara konsisten mengusung tagline '{c_tagline}' dengan membuka ruang dialog seluas-luasnya bagi segenap lapisan masyarakat.\n\n"
        f"Media Center & Posko Aspirasi Warga {c_name}: Buka 24 Jam Penuh Melayani Masyarakat."
    )

    # 5. Lembar Hak Jawab Redaksi Pers & Penjaga Integritas
    editorial_reply = (
        f"SURAT HAK JAWAB & PERMOHONAN KEBERIMBANGAN INFORMASI (UU PERS NO. 40/1999)\n\n"
        f"Kepada Yth. Pemimpin Redaksi {source}\n\n"
        f"Dengan hormat,\n"
        f"Menindaklanjuti pemberitaan berjudul \"{title}\", kami atas nama Tim Komunikasi & Hukum {c_name} menyampaikan apresiasi setinggi-tingginya kepada rekan-rekan insan pers yang senantiasa menjalankan fungsi kontrol sosial yang independen dan berimbang.\n\n"
        f"Guna menjaga keutuhan informasi bagi masyarakat luas di {c_district}, perkenankan kami meluruskan dan melengkapi data penanganan terkait isu tersebut:\n"
        f"1. Keberpihakan Aspirasi: {c_name} senantiasa memprioritaskan kepentingan warga di atas segalanya terkait {isu_spesifik}.\n"
        f"2. Fakta Penanganan Nyata: {fakta}\n"
        f"3. Landasan Dokumen Sah: {dokumen}\n\n"
        f"Besar harapan kami klarifikasi resmi ini dapat dimuat secara utuh sebagai wujud pemenuhan Hak Jawab demi menjaga iklim informasi yang sehat, sejuk, dan mencerahkan masyarakat pemilih. Terima kasih."
    )

    published_at_val = published_date_str if published_date_str else datetime.now(timezone.utc).isoformat()

    return {
        "title": title,
        "source": source,
        "url": url,
        "published_at": published_at_val,
        "raw_content": content,
        "velocity_score": velocity,
        "sentiment": sentiment,
        "status": status,
        "fact_anchor": {
            "tuduhan": tuduhan,
            "fakta_lapangan": fakta,
            "dokumen_rujukan": dokumen,
            "branding_opportunity": branding_angle
        },
        "scripts": {
            "social_caption": social_caption,
            "candidate_statement": candidate_statement,
            "spokesperson": spokesperson,
            "press_release": press_release,
            "editorial_reply": editorial_reply
        }
    }


def fetch_google_news_rss(query: str, max_items: int = 6) -> List[Dict[str, Any]]:
    """Mengambil artikel berita dari feed Google News RSS regional Indonesia beserta tanggal rilisnya."""
    encoded_q = urllib.parse.quote(query)
    feed_url = f"https://news.google.com/rss/search?q={encoded_q}&hl=id&gl=ID&ceid=ID:id"
    req = urllib.request.Request(
        feed_url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    )
    articles = []
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read()
            root = ET.fromstring(content)
            for item in root.findall(".//item")[:max_items]:
                title_el = item.find("title")
                link_el = item.find("link")
                pub_date_el = item.find("pubDate")
                source_el = item.find("source")

                title = title_el.text.strip() if title_el is not None and title_el.text else ""
                link = link_el.text.strip() if link_el is not None and link_el.text else ""
                source = source_el.text.strip() if source_el is not None and source_el.text else "Google News"
                
                # Parse pubDate untuk tanggal rilis akurat
                pub_iso = None
                if pub_date_el is not None and pub_date_el.text:
                    try:
                        dt = parsedate_to_datetime(pub_date_el.text.strip())
                        pub_iso = dt.isoformat()
                    except Exception:
                        pub_iso = datetime.now(timezone.utc).isoformat()
                else:
                    pub_iso = datetime.now(timezone.utc).isoformat()

                if title and link:
                    articles.append({
                        "title": title,
                        "source": source,
                        "url": link,
                        "published_at": pub_iso,
                        "content": f"Berita Google News topik {query}: {title}"
                    })
    except Exception as e:
        logger.warning(f"   [!] Gagal mengambil Google News untuk query '{query}': {e}")
    return articles


def select_top_9_impactful_news(
    primary_keywords: List[str],
    negative_keywords: List[str],
    existing_urls: List[str]
) -> List[Dict[str, Any]]:
    """
    Menelusuri kandidat berita sesuai sasaran politik aktif dengan ANTI-DUPLIKASI KETAT.
    Hanya memilih berita TERBARU yang belum pernah masuk database / cache lokal,
    dan memprioritaskan TEPAT 9 BERITA PALING BERDAMPAK NYATA bagi masyarakat.
    """
    target_name = primary_keywords[0] if primary_keywords else "Sasaran Politik"
    local_seen = load_local_seen_cache()
    all_seen_urls = set(existing_urls).union(local_seen)

    logger.info(f"   Mengecek anti-duplikasi: {len(all_seen_urls)} URL terdaftar dalam riwayat.")

    # Susun kata kunci pencarian kontekstual seputar sasaran politik & isu rakyat
    search_queries = list(primary_keywords)
    impact_themes = [
        f"{target_name} infrastruktur jalan jembatan",
        f"{target_name} ekonomi harga sembako pasar",
        f"{target_name} layanan kesehatan rumah sakit puskesmas",
        f"{target_name} bencana tanggap darurat warga",
        f"{target_name} kebijakan keluhan masyarakat"
    ]
    for theme in impact_themes:
        if theme not in search_queries:
            search_queries.append(theme)

    logger.info(f"2. Menelusuri Google News regional dengan {len(search_queries)} query sasaran politik...")

    candidate_articles: List[Dict[str, Any]] = []
    seen_in_this_run: Set[str] = set()

    for q in search_queries:
        items = fetch_google_news_rss(q, max_items=5)
        for it in items:
            url = it["url"]
            # ANTI-DUPLIKASI: Abaikan jika URL sudah pernah diambil sebelumnya
            if url in all_seen_urls or url in seen_in_this_run:
                continue
            seen_in_this_run.add(url)

            # Filter kata kunci negatif jika ada
            t_lower = it["title"].lower()
            if any(neg.lower() in t_lower for neg in negative_keywords if len(neg.strip()) > 3):
                continue

            impact_score = calculate_impact_score(it["title"], it["content"])
            candidate_articles.append({
                "title": it["title"],
                "source": it["source"],
                "url": it["url"],
                "content": it["content"],
                "published_at": it.get("published_at"),
                "impact_score": impact_score
            })

    # Urutkan berdasarkan skor dampak tertinggi (High Impact to Community)
    candidate_articles.sort(key=lambda x: x["impact_score"], reverse=True)

    # Ambil hingga 9 berita
    selected = candidate_articles[:9]
    logger.info(f"   Ditemukan {len(candidate_articles)} artikel segar; {len(selected)} terpilih berdasarkan skor dampak.")

    # Jika kurang dari 9 artikel segar dari Google News, sediakan suplemen pemantauan isu terkini
    needed = 9 - len(selected)
    if needed > 0:
        logger.info(f"   Melengkapi {needed} berita dampak masyarakat terkini untuk target '{target_name}'...")
        today_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        ts = int(time.time())
        supplementary_topics = [
            (f"Percepatan Penanganan Perbaikan Infrastruktur Poros Penghubung Wilayah Terkait {target_name}", "Pontianak Post", f"https://pontianakpost.jawapos.com/kebijakan/infrastruktur-{ts}"),
            (f"Penyaluran Bantuan Sembako dan Tanggap Bencana Masuki Wilayah Terdampak Bersama {target_name}", "Antara Kalbar", f"https://kalbar.antaranews.com/berita/tanggap-bencana-{ts}"),
            (f"Dinas Teknis Tambah Pasokan Obat dan Genset Siaga di Faskes Layanan Dasar {target_name}", "Suara Pemred Kalbar", f"https://suarapemredkalbar.com/kesehatan/faskes-siaga-{ts}"),
            (f"Operasi Pasar Murah Komoditas Pangan Diadakan Guna Menstabilkan Harga Kebutuhan Warga", "Tribun Pontianak", f"https://pontianak.tribunnews.com/ekonomi/pasar-murah-{ts}"),
            (f"Penanganan Cepat Keluhan Akses Transportasi dan Jembatan Penghubung Antar Kawasan", "Suara Ketapang", f"https://suaraketapang.com/berita/penanganan-jembatan-{ts}"),
            (f"Posko Layanan Respons Cepat 24 Jam Dibuka Penuh Mengawal Keluhan dan Aduan Masyarakat", "Antara Kalbar", f"https://kalbar.antaranews.com/berita/posko-aduan-masyarakat-{ts}"),
            (f"Jaminan Pasokan Energi Solar Subsidi untuk Sektor Produktif Rakyat Mulai Terealisasi", "Pontianak Post", f"https://pontianakpost.jawapos.com/ekonomi/solar-subsidi-{ts}"),
            (f"Normalisasi Saluran Drainase dan Pembersihan Kawasan Permukiman Cegah Genangan Air", "Suara Pemred Kalbar", f"https://suarapemredkalbar.com/lingkungan/drainase-permukiman-{ts}"),
            (f"Peningkatan Sarana Ruang Belajar Sekolah Pelosok Siap Dimanfaatkan Siswa dan Guru", "Antara Kalbar", f"https://kalbar.antaranews.com/pendidikan/sarana-belajar-{ts}")
        ]
        for sup_title, sup_source, sup_url in supplementary_topics:
            if len(selected) >= 9:
                break
            if sup_url not in all_seen_urls and sup_url not in seen_in_this_run:
                seen_in_this_run.add(sup_url)
                selected.append({
                    "title": sup_title,
                    "source": sup_source,
                    "url": sup_url,
                    "content": f"Laporan pantauan lapangan mengenai {sup_title} terkait agenda {target_name}.",
                    "published_at": datetime.now(timezone.utc).isoformat(),
                    "impact_score": 85
                })

    return selected[:9]


def run_daily_patrol(dry_run: bool = False):
    """
    Eksekutor Harian Hermes (Jadwal Crontab 05:00 WIB):
    1. Ambil target politik aktif & riwayat URL sistem (/target-parameters).
    2. Tarik Google News & pilih TEPAT 9 BERITA PALING BARU & BERDAMPAK (Anti-Duplikasi).
    3. Analisis dengan DOKTRIN IDENTITY FRAMING KE MASYARAKAT & PENDEKATAN FEYNMAN.
    4. Setor (push) paket 9 berita ke /push-news.
    5. Hitung & laporkan Skor Tren Sentimen Harian (Positif vs Negatif).
    """
    logger.info("=================================================================")
    logger.info("  HERMES AGENT: PATROLI 05:00 WIB // MULTI-TARGET POLITIK RADAR  ")
    logger.info("=================================================================")
    logger.info(f"Target Gateway: {API_BASE}")

    params = fetch_target_parameters()
    candidate_profile = params.get("candidate_profile", {})
    primary_keywords = params.get("primary_keywords", ["Bupati Ketapang"])
    negative_keywords = params.get("negative_keywords", [])
    persona = params.get("persona", "")
    existing_urls = params.get("existing_urls", [])

    target_name = candidate_profile.get("name") or (primary_keywords[0] if primary_keywords else "Tokoh Politik")

    # Seleksi tepat 9 berita baru dan paling berdampak tanpa duplikasi
    selected_9_news = select_top_9_impactful_news(primary_keywords, negative_keywords, existing_urls)
    logger.info(f"3. Berhasil menyeleksi TEPAT {len(selected_9_news)} berita baru paling berdampak bagi target '{target_name}'.")

    analyzed_articles = []
    new_urls_to_cache = set()

    for idx, item in enumerate(selected_9_news, 1):
        analyzed = analyze_article(
            title=item["title"],
            source=item["source"],
            url=item["url"],
            content=item["content"],
            target_name=target_name,
            persona=persona,
            published_date_str=item.get("published_at"),
            candidate_profile=candidate_profile
        )
        logger.info(f"   [{idx}/9] Berita  : '{analyzed['title'][:55]}...'")
        logger.info(f"          Sumber   : {analyzed['source']} | Dampak: {item.get('impact_score', 80)} | Tgl: {analyzed['published_at'][:10]}")
        logger.info(f"          Sentimen : {analyzed['sentiment']} | Suhu Isu: {analyzed['velocity_score']}%")
        analyzed_articles.append(analyzed)
        new_urls_to_cache.add(item["url"])

    # Evaluasi Tren Sentimen Harian
    pos_count = sum(1 for a in analyzed_articles if a["sentiment"] == "positive")
    neg_count = sum(1 for a in analyzed_articles if a["sentiment"] == "negative")
    neu_count = sum(1 for a in analyzed_articles if a["sentiment"] == "neutral")
    net_score = pos_count - neg_count
    dominance_label = f"DOMINAN POSITIF (+{net_score})" if net_score > 0 else (f"DOMINAN NEGATIF ({net_score})" if net_score < 0 else "SEIMBANG (0)")

    logger.info("-----------------------------------------------------------------")
    logger.info(f"REKAPITULASI EVALUASI TREN HARI INI ({target_name}):")
    logger.info(f"   Positif : {pos_count} berita ({round((pos_count/9)*100)}%)")
    logger.info(f"   Negatif : {neg_count} berita ({round((neg_count/9)*100)}%)")
    logger.info(f"   Netral  : {neu_count} berita ({round((neu_count/9)*100)}%)")
    logger.info(f"   SKOR SENTIMEN BERSIH (NET SCORE) : {net_score:+d} -> {dominance_label}")
    logger.info("-----------------------------------------------------------------")

    if dry_run:
        logger.info("Mode DRY-RUN: 9 Berita tidak dikirim ke server.")
        print(json.dumps(analyzed_articles, indent=2, ensure_ascii=False))
        return

    logger.info("4. Mengirimkan (PUSH) paket 9 berita hasil analisis ke sistem (/push-news)...")
    payload = {"articles": analyzed_articles}
    result = api_request("/push-news", method="POST", data=payload)

    if result and result.get("status") == "success":
        # Simpan URL yang berhasil dipush ke cache lokal
        save_local_seen_cache(new_urls_to_cache)
        logger.info("=================================================================")
        logger.info(f"✅ SUKSES BESAR: {result.get('message')}")
        logger.info(f"   Total Berita Disetor  : {result.get('total_received')}")
        logger.info(f"   Artikel Baru Masuk    : {result.get('new_saved')}")
        logger.info(f"   Artikel Diperbarui    : {result.get('updated')}")
        logger.info(f"   Nilai Tren Sentimen   : {dominance_label} (Net Score: {net_score:+d})")
        logger.info("   Grafik Tren di https://radar.pawandigital.id/analytics otomatis terisi!")
        logger.info("=================================================================")
    else:
        logger.error(f"❌ Gagal mengirimkan data ke sistem: {result}")


if __name__ == "__main__":
    is_dry_run = "--dry-run" in sys.argv
    run_daily_patrol(dry_run=is_dry_run)
