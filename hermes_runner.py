"""
HERMES AGENT RUNNER & INTEGRATION WORKER
Radar Politik & Manajemen Reputasi - Kabupaten Ketapang
Architecture: Decoupled AI Intelligence Engine via Laravel Sanctum REST API
"""

import os
import sys
import json
import time
import logging
from typing import Dict, Any, Optional

# Setup standard logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("HermesRadarAgent")

try:
    import requests
except ImportError:
    logger.error("Library 'requests' belum terpasang. Jalankan: pip install requests")
    sys.exit(1)

# ==============================================================================
# KONFIGURASI ENV & ENDPOINTS
# ==============================================================================
def get_env_token():
    env_token = os.getenv("RADAR_API_TOKEN")
    if env_token:
        return env_token
    # Coba baca dari file .env lokal jika ada
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("HERMES_API_TOKEN="):
                        return line.strip().split("=", 1)[1].strip("\"'")
        except Exception:
            pass
    return "13|1hh6XV5g9eYB4wQpJoNcTcJilDKVJNo779euz8vBf8051624"

API_BASE = os.getenv("RADAR_API_URL", "https://radar.pawandigital.id/api/v1/hermes")
HERMES_TOKEN = get_env_token()

FETCH_ENDPOINT = f"{API_BASE}/fetch-news"
WEBHOOK_ENDPOINT = f"{API_BASE}/webhook"

HEADERS = {
    "Authorization": f"Bearer {HERMES_TOKEN}",
    "Accept": "application/json",
    "Content-Type": "application/json",
    "User-Agent": "HermesAutonomousAgent/1.0"
}

# ==============================================================================
# DOKTRIN & SYSTEM PROMPT HERMES AI
# ==============================================================================
HERMES_SYSTEM_PROMPT = """
Kamu adalah Analis Intelijen Komunikasi Politik & Manajemen Reputasi Media Pers untuk Pilkada Kabupaten Ketapang.
Tugasmu adalah menganalisis artikel portal berita online secara objektif, mengevaluasi potensi krisis (Velocity), 
menguji integritas informasi (Fact-Anchor), dan menyusun 3 pilar respon komunikasi pers resmi:
1. Siaran Pers Resmi (Press Release media massa terstruktur 5W+1H).
2. Pernyataan Juru Bicara (Poin bicara doorstop wartawan lapangan yang tegas, santun, dan berdata).
3. Lembar Hak Jawab Redaksi (Sesuai mekanisme UU Pers No. 40 Tahun 1999 dan Pedoman Dewan Pers).

ATURAN INTEGRITAS:
- Jika artikel memuat fitnah/kampanye hitam terstruktur, pencatutan survei palsu tanpa legalitas KPU/Bawaslu, 
  maka status = 'integrity_alert'. Kosongkan skrip respon, fokuskan narasi pada rekomendasi langkah hukum/Bawaslu.
- Jika artikel kritik wajar atau capaian positif pembangunan, status = 'success'.
"""

def generate_reasoning_prompt(news_item: Dict[str, Any], persona: str, keywords: Dict[str, Any]) -> str:
    """Menyusun prompt kontekstual untuk model reasoning Hermes."""
    return f"""
{HERMES_SYSTEM_PROMPT}

[PARAMETER TARGET KETAPANG]
- Persona Tokoh: {persona}
- Kata Kunci Pantauan: {', '.join(keywords.get('primary_keywords', []))}
- Kata Kunci Filter: {', '.join(keywords.get('negative_keywords', []))}

[ARTIKEL BERITA YANG DIANALISIS]
- ID: {news_item.get('id')}
- Judul: {news_item.get('title')}
- Media Sumber: {news_item.get('source')} ({news_item.get('url')})
- Waktu Terbit: {news_item.get('published_at')}
- Cuplikan Konten:
{news_item.get('raw_content')}

INSTRUKSI OUTPUT:
Wajib kembalikan format JSON valid MURNI tanpa markdown wrap:
{{
  "news_id": {news_item.get('id')},
  "status": "success", 
  "velocity_score": 75,
  "sentiment": "negative",
  "fact_anchor": {{
    "tuduhan": "Ringkasan poin kritik atau tuduhan dalam berita",
    "fakta_lapangan": "Data riil fakta lapangan dan komitmen tokoh",
    "dokumen_rujukan": "Dasar hukum / dokumen dinas / perda terkait"
  }},
  "scripts": {{
    "press_release": "Draf Siaran Pers 5W+1H lengkap...",
    "spokesperson": "Poin wawancara doorstop wartawan...",
    "editorial_reply": "Draf Surat Hak Jawab Redaksi UU Pers No. 40/1999..."
  }}
}}
"""

# ==============================================================================
# WORKER CYCLE ENGINE
# ==============================================================================
def fetch_pending_news() -> Optional[Dict[str, Any]]:
    """Mengambil daftar berita berstatus pending dari Laravel Sanctum API."""
    try:
        response = requests.get(FETCH_ENDPOINT, headers=HEADERS, timeout=20)
        if response.status_code == 401:
            logger.error("[401 Unauthorized] Token Sanctum tidak valid atau kadaluarsa. Generate ulang via: php artisan hermes:generate-token")
            return None
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Gagal mengambil berita dari API: {e}")
        return None

def submit_webhook_analysis(payload: Dict[str, Any]) -> bool:
    """Mengirim hasil reasoning intelijen Hermes kembali ke Laravel Webhook."""
    try:
        response = requests.post(WEBHOOK_ENDPOINT, headers=HEADERS, json=payload, timeout=20)
        if response.status_code == 200:
            res_data = response.json()
            logger.info(f"Berita #{payload.get('news_id')} sukses diproses! Status: {res_data.get('status')}")
            return True
        else:
            logger.warning(f"Gagal kirim webhook #{payload.get('news_id')}: HTTP {response.status_code} - {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        logger.error(f"Error koneksi webhook: {e}")
        return False

def simulate_hermes_reasoning(news_item: Dict[str, Any], persona: str) -> Dict[str, Any]:
    """
    Simulasi reasoning intelijen lokal (bisa diganti dengan direct call ke LLM Hermes).
    """
    title = news_item.get('title', '').lower()
    raw = news_item.get('raw_content', '').lower()
    
    # Deteksi kampanye hitam atau survei palsu
    is_fake_survey = 'palsu' in title or 'grafis' in title or 'bawaslu' in title
    is_crisis = 'karhutla' in title or 'api' in title or 'titik' in title or 'api' in raw
    
    if is_fake_survey:
        return {
            "news_id": news_item.get("id"),
            "status": "integrity_alert",
            "velocity_score": 95,
            "sentiment": "negative",
            "fact_anchor": {
                "tuduhan": "Penyebaran infografis hasil survei elektabilitas palsu mengatasnamakan lembaga resmi.",
                "fakta_lapangan": "Bawaslu Ketapang telah mengeluarkan pernyataan resmi bahwa infografis tersebut hoaks.",
                "dokumen_rujukan": "Siaran Klarifikasi Bawaslu Ketapang & UU Pilkada Pasal 187A."
            },
            "scripts": {
                "press_release": "",
                "spokesperson": "",
                "editorial_reply": ""
            }
        }
    
    sentiment = "negative" if is_crisis else "positive"
    velocity = 85 if is_crisis else 30
    
    return {
        "news_id": news_item.get("id"),
        "status": "success",
        "velocity_score": velocity,
        "sentiment": sentiment,
        "fact_anchor": {
            "tuduhan": "Kelambatan respon pemerintah/tim terhadap isu lapangan." if is_crisis else "Klaim minim pembangunan infrastruktur.",
            "fakta_lapangan": "Tim reaksi cepat tanggap darurat dan satgas gabungan telah diterjunkan ke lokasi.",
            "dokumen_rujukan": "SK Satgas Penanggulangan Kebencanaan & Dokumen Progres Fisik DPU-PR Ketapang 2026."
        },
        "scripts": {
            "press_release": f"SIARAN PERS RESMI // MEDIA CENTER KETAPANG\n\nKETAPANG — Terkait isu '{news_item.get('title')}', Media Center menegaskan komitmen nyata pemerintah dan tokoh daerah dalam memberikan solusi cepat dan terukur bagi masyarakat Ketapang.\n\n\"Kami pastikan penanganan di lapangan berjalan optimal berkolaborasi dengan semua instansi terkait,\" ujar perwakilan Media Center.\n\nNarahubung Media Center: 0812-XXXX-XXXX (Pers & Hubungan Media).",
            "spokesperson": f"DOORSTOP TALKING POINTS (JURU BICARA):\n1. Konfirmasi cepat: Isu '{news_item.get('title')}' telah ditangani oleh tim teknis lapangan sejak pagi ini.\n2. Data konkret: Satgas telah bergerak dan koordinasi lintas instansi berjalan solid.\n3. Pesan penyejuk: Meminta media mengedepankan asas check and recheck demi kondusivitas masyarakat.",
            "editorial_reply": f"SURAT HAK JAWAB & KLARIFIKASI PERS (UU NO. 40/1999)\nKepada Yth. Redaksi {news_item.get('source')}\n\nSehubungan dengan artikel berjudul \"{news_item.get('title')}\", kami menggunakan hak jawab resmi untuk meluruskan fakta lapangan demi terpenuhinya prinsip keberimbangan pemberitaan."
        }
    }

def run_hermes_worker(single_run: bool = True, interval_sec: int = 30):
    """Loop runner utama untuk Hermes Agent."""
    logger.info("==================================================")
    logger.info("   HERMES AGENT WORKER - RADAR POLITIK KETAPANG   ")
    logger.info(f"   API Gateway : {API_BASE}")
    logger.info("==================================================")

    while True:
        logger.info("Memeriksa antrean artikel berita pending...")
        data = fetch_pending_news()
        
        if data and data.get("total_pending", 0) > 0:
            items = data.get("data", [])
            instructions = data.get("instructions", {})
            persona = instructions.get("target_parameters", {}).get("persona", "")
            keywords = instructions.get("target_parameters", {})

            logger.info(f"Ditemukan {len(items)} artikel pending. Mulai pemrosesan analitik AI...")

            for item in items:
                logger.info(f"-> Menganalisis Berita #{item['id']}: '{item.get('title')}' ({item.get('source')})")
                
                # Di implementasi live: panggil model LLM Hermes dengan prompt:
                # prompt = generate_reasoning_prompt(item, persona, keywords)
                # response_payload = call_hermes_model(prompt)
                
                # Simulasi komputasi intelijen
                payload = simulate_hermes_reasoning(item, persona)
                
                # Kirim kembali via webhook
                submit_webhook_analysis(payload)
                time.sleep(1) # jeda sopan antar request
                
            logger.info("Seluruh antrean berita berhasil diproses.")
        else:
            logger.info("Tidak ada artikel pending saat ini.")

        if single_run:
            break

        logger.info(f"Menunggu {interval_sec} detik untuk siklus berikutnya...")
        time.sleep(interval_sec)

if __name__ == "__main__":
    # Dukung argumen CLI: python hermes_runner.py [--loop]
    is_loop = "--loop" in sys.argv
    run_hermes_worker(single_run=not is_loop)
