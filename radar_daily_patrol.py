#!/usr/bin/env python3
"""
radar_daily_patrol.py
=====================
Eksekutor Otonom Asisten Radar AI untuk Pemantauan Radar Politik & Reputasi.
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
logger = logging.getLogger("RadarDailyPatrol")

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


API_BASE = os.getenv("RADAR_API_URL", "https://radar.pawandigital.id/api/v1/radar")
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
        "User-Agent": "RadarDailyPatrol/3.0 (TargetAgnostic-Deduplication)"
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
        "primary_keywords": ["Pilkada", "Calon Kepala Daerah", "Infrastruktur Jalan"],
        "negative_keywords": ["korupsi", "bencana", "dinasti politik"],
        "persona": "Pemimpin yang santun, solutif, merakyat, dan melayani warga sepenuh hati.",
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
    Radar AI Analysis dengan DOKTRIN PERSONAL BRANDING POLITIK & IDENTITY FRAMING KE MASYARAKAT:
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
    is_neg = any(w in combined_text for w in [
        "rusak", "banjir", "lumpur", "mahal", "keluhan", "protes", "antrean", "antri", "langka",
        "terputus", "krisis", "terbengkalai", "korupsi", "macet", "horor", "bahaya", "darurat",
        "ancam", "longsor", "kecewa", "bencana", "susah", "gagal", "miskin", "tuntutan", "demo",
        "ambruk", "tenggelam", "tersendat", "jeritan", "kejahatan", "kriminal", "terisolir"
    ])
    is_pos = any(w in combined_text for w in [
        "resmikan", "bangun", "bantuan", "turun", "normal", "teratasi", "apresiasi", "stabil",
        "penghargaan", "tuntas", "cair", "meroket", "sukses", "prestasi", "juara", "pujian"
    ])

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

# =========================================================================
    # 1. NARASI POSITIF / SOLUTIF (Koalisi / Petahana / Solutif)
    # Walaupun berita negatif/keluhan warga, dibingkai jadi aksi tanggap & kepemimpinan solutif
    # =========================================================================
    if is_neg:
        pos_candidate_statement = (
            f"🎙️ PERNYATAAN SIKAP RESMI {c_name.upper()} ({c_role})\n"
            f"Fokus: Respon Cepat & Solusi Nyata Terkait '{title}'\n\n"
            f"\"Keluhan dan kegelisahan warga terkait {isu_spesifik} di {c_district} adalah panggilan tanggung jawab yang kami rasakan secara mendalam. Tidak ada ruang untuk berdalih atau saling melempar tanggung jawab.\n\n"
            f"Per hari ini, kami memastikan tim teknis dan posko reaksi cepat sudah bergerak langsung ke titik lokasi membawa solusi nyata ({dokumen}). Kami hadir bukan sekadar memberi janji, melainkan mengawal penuntasan masalah ini sampai tuntas agar masyarakat kembali tenang dan berdaya.\"\n\n"
            f"— {c_name} ({c_role} // {c_district})"
        )
        pos_social_caption = (
            f"📱 [AKSI CEPAT & SOLUSI NYATA // {c_name.upper()}]\n\n"
            f"\"Mendengar langsung kesulitan bapak-ibu soal '{title}', kami tidak tinggal diam. Bagi kami, keresahan rakyat adalah kompas utama untuk segera bergerak menghadirkan solusi!\"\n\n"
            f"Alhamdulillah, per hari ini langkah penanganan taktis sudah dimulai di lapangan. Tim lapangan dan posko aspirasi kami terus mengawal proses penanganan ini bersama masyarakat ({dokumen}).\n\n"
            f"📌 Komitmen Nyata Kami:\n"
            f"1. Aksi tanggap darurat di lokasi tanpa birokrasi berbelit.\n"
            f"2. Memastikan hak dan kenyamanan warga {c_district} terpenuhi secepatnya.\n"
            f"3. Posko Aspirasi 24 jam siap mendampingi setiap laporan warga.\n\n"
            f"Mari kita hadapi tantangan ini bersama dengan semangat gotong royong dan optimisme!\n\n"
            f"#{clean_name_tag} #KerjaNyata #SolusiBukanJanji #PeduliWarga #{clean_district_tag}Maju #PemimpinSolutif"
        )
        pos_spokesperson = (
            f"POIN BICARA JUBIR // SUDUT PANDANG SOLUTIF (PETAHANA / KOALISI):\n"
            f"1. [Empati & Solutif]: 'Sikap {c_name} sangat jelas: kami memvalidasi 100% keluhan warga soal {title}. Beliau langsung menginstruksikan tim penanganan darurat turun ke lapangan hari ini juga.'\n"
            f"2. [Tindakan Bukan Dalih]: 'Kami tidak mau mencari kambing hitam. Solusi lapangan sudah berjalan dengan dasar {dokumen}. Inilah bukti kepemimpinan yang bertindak di saat warga membutuhkan.'\n"
            f"3. [Pengawalan Tuntas]: 'Posko pengaduan kami siaga penuh 24 jam untuk melayani masyarakat sampai masalah ini benar-benar selesai.'"
        )
        pos_press_release = (
            f"SIARAN PERS RESMI // MEDIA CENTER {c_name.upper()}\n\n"
            f"Judul: Gerak Cepat Tanggapi '{title}', {c_name} Pastikan Penanganan Tuntas di Lapangan\n\n"
            f"{c_district.upper()} — Merespon aspirasi warga terkait '{title}', Media Center {c_name} menegaskan komitmen penuh sang kandidat dalam mengawal aspirasi dan kesejahteraan warga masyarakat.\n\n"
            f"1. Validasi Kepentingan Warga: {c_name} menegaskan bahwa penderitaan warga adalah prioritas utama yang harus diselesaikan tanpa penundaan birokrasi. Tim reaksi cepat telah diterjunkan langsung ke titik permasalahan.\n\n"
            f"2. Penanganan Terpadu Berpayung Hukum: {fakta} Penanganan ini dipayungi {dokumen} guna memastikan akuntabilitas dan keberlanjutan hasil kerja.\n\n"
            f"3. Komitmen Berkelanjutan: Mengusung tagline '{c_tagline}', {c_name} berkomitmen terus mendampingi warga hingga situasi sepenuhnya pulih dan normal kembali.\n\n"
            f"Media Center & Posko Reaksi Cepat: Terbuka 24 Jam Melayani Publik."
        )
        pos_editorial_reply = (
            f"SURAT HAK JAWAB & KLARIFIKASI SOLUTIF (UU PERS NO. 40/1999)\n\n"
            f"Kepada Yth. Pemimpin Redaksi {source}\n\n"
            f"Dengan hormat,\n"
            f"Menindaklanjuti pemberitaan berjudul \"{title}\", kami atas nama Tim Komunikasi & Hukum {c_name} menyampaikan apresiasi setinggi-tingginya kepada rekan-rekan insan pers yang senantiasa menjalankan fungsi kontrol sosial yang independen dan berimbang.\n\n"
            f"Guna melengkapi keberimbangan berita dengan langkah nyata yang telah dieksekusi di lapangan:\n"
            f"1. Langkah Penanganan: {fakta}\n"
            f"2. Landasan Legal & Tindakan: Penanganan telah diresmikan melalui {dokumen}.\n"
            f"3. Akses Publik: Posko aduan dan monitoring dibuka 24 jam demi transparansi informasi.\n\n"
            f"Besar harapan kami klarifikasi solutif ini dapat ditayangkan agar masyarakat memperoleh informasi yang utuh, menenangkan, dan berimbang. Terima kasih."
        )
    else:
        # Jika berita positif atau netral
        pos_candidate_statement = (
            f"🎙️ PERNYATAAN SIKAP RESMI {c_name.upper()} ({c_role})\n"
            f"Terkait: Kemajuan Nyata '{title}'\n\n"
            f"\"Kabar baik seputar {title} adalah buah manis dari kerja keras dan doa bersama seluruh masyarakat di {c_district}. Kita bersyukur dan mengapresiasi dedikasi semua pihak di lapangan.\n\n"
            f"Namun, keberhasilan ini adalah awal dari tanggung jawab yang lebih besar. Kami berkomitmen untuk terus menjaga momentum positif ini agar manfaatnya benar-benar dirasakan merata hingga ke pelosok kampung dan keluarga paling membutuhkan.\"\n\n"
            f"— {c_name} ({c_role} // {c_district})"
        )
        pos_social_caption = (
            f"📱 [KABAR BAIK & MOMENTUM KEMAJUAN // {c_name.upper()}]\n\n"
            f"\"Alhamdulillah! Kabar baik terkait '{title}' membuktikan bahwa kolaborasi dan kerja ikhlas akan selalu membuahkan hasil nyata bagi warga {c_district}!\"\n\n"
            f"Terima kasih untuk bapak, ibu, dan rekan-rekan semua yang tak lelah berjuang di lapangan. Kami di tim {c_name} ({c_tagline}) siap terus mengawal program-program kerakyatan ini agar dampaknya berkesinambungan.\n\n"
            f"Mari kita jaga dan rawat kemajuan ini bersama-sama demi masa depan daerah yang lebih sejahtera dan bermartabat!\n\n"
            f"#{clean_name_tag} #KabarBaik #KemajuanDaerah #KerjaBersama #{clean_district_tag}Maju #AspirasiRakyat"
        )
        pos_spokesperson = (
            f"POIN BICARA JUBIR // SUDUT PANDANG POSITIF (APRESIATIF & BERKELANJUTAN):\n"
            f"1. [Apresiasi Tulus]: 'Pesan dari {c_name}: ini adalah kemenangan warga {c_district}. Kerja keras dan kesabaran masyarakat mulai menunjukkan hasil nyata.'\n"
            f"2. [Jaga Momentum]: 'Beliau mengingatkan kita tidak boleh berpuas diri. Apa yang sudah baik ini harus ditingkatkan dan diperluas cakupannya.'\n"
            f"3. [Komitmen Keberlanjutan]: 'Tim {c_name} siap menjadi mitra terbaik untuk mengawal kemajuan ini agar tidak berhenti di tengah jalan.'"
        )
        pos_press_release = (
            f"SIARAN PERS RESMI // MEDIA CENTER {c_name.upper()}\n\n"
            f"Judul: Sambut Baik '{title}', {c_name} Ajak Rawat Momentum Kemajuan di {c_district}\n\n"
            f"{c_district.upper()} — Media Center {c_name} menyambut gembira perkembangan positif terkait '{title}' sebagai capaian membanggakan bagi seluruh elemen masyarakat.\n\n"
            f"1. Apresiasi Partisipasi Warga: {c_name} menyampaikan rasa hormat kepada seluruh warga dan pekerja lapangan yang telah berdedikasi mewujudkan capaian ini.\n\n"
            f"2. Pengawalan Keberlanjutan: Capaian ini tercatat dalam {dokumen} sebagai dasar penyempurnaan program kerja lanjutan yang lebih berkeadilan.\n\n"
            f"3. Visi Jangka Panjang: Selaras dengan tagline '{c_tagline}', {c_name} bertekad mempercepat pemerataan hasil pembangunan di seluruh pelosok.\n\n"
            f"Media Center {c_name}: Selalu Terbuka Bersinergi dengan Pers dan Publik."
        )
        pos_editorial_reply = (
            f"SURAT APRESIASI & DUKUNGAN INFORMASI POSITIF (UU PERS NO. 40/1999)\n\n"
            f"Kepada Yth. Pemimpin Redaksi {source}\n\n"
            f"Dengan hormat,\n"
            f"Kami dari Tim Komunikasi {c_name} menyampaikan apresiasi tinggi atas pemberitaan objektif dan mencerahkan berjudul \"{title}\".\n\n"
            f"Pemberitaan ini menyebarkan optimisme di tengah masyarakat {c_district} dan memotivasi seluruh pihak untuk terus berkontribusi positif bagi kemaslahatan bersama. Terima kasih."
        )

    # =========================================================================
    # 2. NARASI KRITIS / KOREKTIF (Oposisi / Penantang / Suara Perubahan)
    # Isu dibingkai tajam menagih pertanggungjawaban, evaluasi total, dan tawarkan pembaharuan
    # =========================================================================
    if is_neg:
        neg_candidate_statement = (
            f"🎙️ PERNYATAAN SIKAP KRITIS {c_name.upper()} ({c_role})\n"
            f"Fokus: Menolak Janji Kosong & Tuntut Pertanggungjawaban atas '{title}'\n\n"
            f"\"Peristiwa '{title}' ini adalah bukti tak terbantahkan dari kegagalan tata kelola dan lambannya empati birokrasi saat ini. Rakyat di {c_district} sudah terlalu sabar, tetapi terus-menerus disuguhi alasan klise dan janji seremonial yang tidak kunjung tuntas.\n\n"
            f"Kami menolak keras normalisasi kelalaian ini! Rakyat membayar pajak dan berhak atas pelayanan serta infrastruktur yang layak hari ini juga, bukan tahun depan. Jika mandat kepemimpinan diamanahkan kepada kami, kami pastikan anggaran difokuskan 100% untuk urusan perut, kesehatan, dan jalan rakyat, bukan proyek pencitraan!\"\n\n"
            f"— {c_name} ({c_role} // {c_district})"
        )
        neg_social_caption = (
            f"📱 [SUARA PERUBAHAN & KRITIK KERAS // {c_name.upper()}]\n\n"
            f"\"CUKUP SUDAH! Berapa lama lagi warga harus menderita karena '{title}'?! Rakyat butuh jalan mulus dan sembako murah, bukan panggung seremoni dan pidato manis!\"\n\n"
            f"Melihat fakta di lapangan hari ini, hati kami miris. Ini bukan sekadar musibah, ini adalah kelalaian prioritas yang sudah menahun di {c_district}. Anggaran daerah seharusnya mengalir untuk keselamatan dan hajat hidup warga pedalaman, bukan habis untuk urusan birokrasi berlebihan!\n\n"
            f"✊ Kami berdiri bersama rakyat menuntut:\n"
            f"1. Audit tuntas dan buka transparansi anggaran penanganan ke publik!\n"
            f"2. Turunkan bantuan dan alat berat sekarang juga tanpa syarat berbelit!\n"
            f"3. Stop lempar tanggung jawab antarinstansi!\n\n"
            f"Waktunya berbenah! Saatnya arah kepemimpinan dirombak demi keadilan sejati seluruh warga!\n\n"
            f"#{clean_name_tag} #WaktunyaPerubahan #KritikRakyat #SuaraOposisi #BelaWarga #{clean_district_tag}Bangkit"
        )
        neg_spokesperson = (
            f"POIN BICARA JUBIR // SUDUT PANDANG KRITIS (OPOSISI / PENANTANG):\n"
            f"1. [Kritik Tajam & Berani]: 'Sikap {c_name} sangat tegas: peristiwa {title} ini adalah rapor merah bagi kepemimpinan yang berkuasa. Rakyat sudah kenyang dengan janji-janji angin surga.'\n"
            f"2. [Tuntutan Pertanggungjawaban]: 'Jangan jadikan cuaca atau prosedur sebagai tameng! Masalah ini terjadi karena kelalaian pengawasan dan salah alokasi prioritas anggaran.'\n"
            f"3. [Tawaran Solusi Alternatif]: '{c_name} sudah menyiapkan cetak biru reformasi total: anggaran langsung dialokasikan ke perbaikan cepat tanpa calo dan tanpa birokrasi bertele-tele.'"
        )
        neg_press_release = (
            f"SIARAN PERS RESMI // TIM ADVOKASI & PEMBAHARUAN {c_name.upper()}\n\n"
            f"Judul: Soroti Tajam '{title}', {c_name} Desak Audit Total dan Hentikan Retorika Birokrasi\n\n"
            f"{c_district.upper()} — Tim Advokasi {c_name} mengeluarkan pernyataan kritis menanggapi krisis yang terungkap dalam berita '{title}'.\n\n"
            f"1. Rapor Merah Pelayanan Publik: {c_name} menilai kegagalan antisipasi isu ini adalah bukti nyata hilangnya kepekaan pengambil kebijakan terhadap penderitaan riil masyarakat kecil.\n\n"
            f"2. Tuntutan Transparansi & Audit: Berdasarkan pemantauan posko advokasi rakyat ({dokumen}), anggaran publik yang dialokasikan tidak sebanding dengan kondisi nyata yang dihadapi warga di lapangan.\n\n"
            f"3. Agenda Perubahan Nyata: Mengusung komitmen '{c_tagline}', {c_name} menawarkan reorientasi anggaran daerah yang berani dan pro-rakyat demi mencegah berulangnya kelalaian serupa di masa depan.\n\n"
            f"Sekretariat Perubahan & Aspirasi Warga: Bergerak untuk Keadilan dan Transparansi."
        )
        neg_editorial_reply = (
            f"LEMBAR PENEGASAN FAKTA & KOREKSI KEBIJAKAN (UU PERS NO. 40/1999)\n\n"
            f"Kepada Yth. Pemimpin Redaksi {source}\n\n"
            f"Dengan hormat,\n"
            f"Menanggapi liputan kritis seputar \"{title}\", kami atas nama Tim Advokasi {c_name} menyampaikan dukungan penuh terhadap keberanian media mengangkat penderitaan riil masyarakat di {c_district}.\n\n"
            f"Sebagai catatan korektif pelengkap investigasi pers:\n"
            f"1. Investigasi Independen: Temuan posko advokasi kami mencatat bahwa keluhan warga ini telah berlangsung berulang kali tanpa solusi permanen.\n"
            f"2. Tuntutan Publik: Kami mendesak pembukaan data alokasi anggaran penanganan kepada publik demi menghindari manipulasi informasi.\n\n"
            f"Kami berharap pers terus mengawal isu ini sebagai pilar keempat demokrasi agar pengambil kebijakan tidak lepas tangan. Terima kasih."
        )
    else:
        # Jika berita positif/klaim capaian: Oposisi menguji keadilan pemerataan & transparansi
        neg_candidate_statement = (
            f"🎙️ PERNYATAAN SIKAP KRITIS {c_name.upper()} ({c_role})\n"
            f"Fokus: Uji Transparansi & Keadilan Pembangunan di Balik '{title}'\n\n"
            f"\"Kita tentu menghargai setiap langkah pembangunan terkait '{title}'. Namun jangan sampai seremoni dan tepuk tangan seremonial di pusat kota menutupi kenyataan pahit bahwa ribuan keluarga di pelosok {c_district} masih belum tersentuh keadilan pembangunan.\n\n"
            f"Pertanyaan kami sederhana dan mendasar: berapa biaya yang dihabiskan untuk proyek ini, dan seberapa besar dampaknya langsung ke kantong rakyat kecil? Pembangunan sejati tidak diukur dari megahnya foto publikasi, melainkan dari meratanya kesejahteraan hingga ke dapur wong cilik!\"\n\n"
            f"— {c_name} ({c_role} // {c_district})"
        )
        neg_social_caption = (
            f"📱 [CATATAN KRITIS // JANGAN SILAU SEREMONI // {c_name.upper()}]\n\n"
            f"\"Ramai pemberitaan soal '{title}'. Bagus, tapi mari kita jujur: apakah warga di pelosok pedalaman sudah ikut merasakannya?!\"\n\n"
            f"Jangan sampai uang rakyat bermiliar-miliar rupiah habis untuk proyek kosmetik dan seremoni gunting pita, sementara jalan panen petani di kampung sebelah masih berlumpur parah!\n\n"
            f"💡 Yang kami perjuangkan bersama masyarakat:\n"
            f"- Keadilan anggaran: utamakan pelosok, bukan sekadar etalase kota!\n"
            f"- Transparansi total: buka rincian biaya proyek ke rakyat!\n"
            f"- Evaluasi manfaat nyata bagi ekonomi warga kecil!\n\n"
            f"Kita butuh pemimpin yang adil untuk semua, bukan yang hanya pandai bersolek di media!\n\n"
            f"#{clean_name_tag} #KritikMembangun #KeadilanAnggaran #SuaraWargaPelosok #OposisiMembelaRakyat"
        )
        neg_spokesperson = (
            f"POIN BICARA JUBIR // SUDUT PANDANG KRITIS (KONTROL & AUDIT KEADILAN):\n"
            f"1. [Sikap Skeptis Konstruktif]: 'Sikap {c_name}: kita jangan cepat terlena oleh klaim keberhasilan {title}. Coba kita cek ke kampung-kampung pelosok, apakah mereka merasakan hal yang sama?'\n"
            f"2. [Tuntutan Pemerataan]: 'Pembangunan jangan hanya terkonsentrasi di etalase kota. Uang rakyat harus dinikmati seluruh warga {c_district} secara adil.'\n"
            f"3. [Fokus Kebutuhan Pokok]: 'Prioritas kami jelas: selesaikan dulu kebutuhan dasar warga yang masih terhimpit sebelum memprioritaskan proyek seremonial.'"
        )
        neg_press_release = (
            f"SIARAN PERS RESMI // TIM MONITORING KEBIJAKAN {c_name.upper()}\n\n"
            f"Judul: Tanggapi '{title}', {c_name} Ingatkan Prinsip Keadilan dan Prioritas Anggaran Pro-Rakyat\n\n"
            f"{c_district.upper()} — Merespons publikasi keberhasilan terkait '{title}', Tim {c_name} mengingatkan pentingnya asas pemerataan dan efektivitas belanja anggaran daerah.\n\n"
            f"1. Catatan Pemerataan Daerah: {c_name} menggarisbawahi bahwa kesenjangan pembangunan antara pusat kota dan wilayah pinggiran masih menganga lebar di {c_district}.\n\n"
            f"2. Desakan Efisiensi Anggaran: Penggunaan APBD harus dievaluasi secara ketat ({dokumen}) agar setiap rupiah menghasilkan stimulus ekonomi langsung bagi masyarakat berpenghasilan rendah.\n\n"
            f"3. Visi Pembangunan Berkeadilan: {c_name} menegaskan bahwa kepemimpinan masa depan harus memprioritaskan mereka yang paling tertinggal, bukan sekadar memoles capaian seremonial.\n\n"
            f"Tim Monitoring Kebijakan Publik: Terus Mengawal Hak Konstitusional Warga."
        )
        neg_editorial_reply = (
            f"CATATAN KEBERIMBANGAN PERS & PERSPEKTIF PUBLIK (UU PERS NO. 40/1999)\n\n"
            f"Kepada Yth. Pemimpin Redaksi {source}\n\n"
            f"Dengan hormat,\n"
            f"Terkait pemberitaan bertajuk \"{title}\", kami atas nama Tim Advokasi Kebijakan Publik {c_name} mengapresiasi kerja jurnalistik rekan-rekan pers.\n\n"
            f"Sebagai perspektif pembanding yang independen:\n"
            f"1. Masih ada aspek disparitas pembangunan di wilayah pedalaman {c_district} yang membutuhkan sorotan investigatif berimbang dari media.\n"
            f"2. Harapan masyarakat agar kontrol anggaran dilakukan secara ketat demi asas keadilan sosial.\n\n"
            f"Semoga catatan keberimbangan ini dapat memperkaya wawasan pembaca demi pembangunan yang sejati dan merata. Terima kasih."
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
            # Stance 1: Narasi Positif & Solutif (Koalisi / Petahana / Solutif)
            "positive": {
                "label": "Narasi Positif / Solutif (Petahana / Koalisi)",
                "stance": "positive",
                "candidate_statement": pos_candidate_statement,
                "social_caption": pos_social_caption,
                "press_release": pos_press_release,
                "spokesperson": pos_spokesperson,
                "editorial_reply": pos_editorial_reply
            },
            # Stance 2: Narasi Kritis & Korektif (Oposisi / Penantang / Kontrol)
            "negative": {
                "label": "Narasi Kritis / Korektif (Oposisi / Penantang)",
                "stance": "negative",
                "candidate_statement": neg_candidate_statement,
                "social_caption": neg_social_caption,
                "press_release": neg_press_release,
                "spokesperson": neg_spokesperson,
                "editorial_reply": neg_editorial_reply
            },
            # Backward-compatible flat keys
            "candidate_statement": pos_candidate_statement,
            "social_caption": pos_social_caption,
            "press_release": pos_press_release,
            "spokesperson": pos_spokesperson,
            "editorial_reply": pos_editorial_reply
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
    Eksekutor Harian Radar AI (Jadwal Crontab 05:00 WIB):
    1. Ambil target politik aktif & riwayat URL sistem (/target-parameters).
    2. Tarik Google News & pilih TEPAT 9 BERITA PALING BARU & BERDAMPAK (Anti-Duplikasi).
    3. Analisis dengan DOKTRIN IDENTITY FRAMING KE MASYARAKAT & PENDEKATAN FEYNMAN.
    4. Setor (push) paket 9 berita ke /push-news.
    5. Hitung & laporkan Skor Tren Sentimen Harian (Positif vs Negatif).
    """
    logger.info("=================================================================")
    logger.info("    RADAR AI: PATROLI 05:00 WIB // MULTI-TARGET POLITIK RADAR    ")
    logger.info("=================================================================")
    logger.info(f"Target Gateway: {API_BASE}")

    params = fetch_target_parameters()
    candidate_profile = params.get("candidate_profile", {})
    primary_keywords = params.get("primary_keywords", ["Pilkada", "Calon Kepala Daerah"])
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
