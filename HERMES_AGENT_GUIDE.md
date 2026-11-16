# PANDUAN INTEGRASI & DOKTRIN HERMES AGENT
## Radar Politik & Manajemen Reputasi Kabupaten Ketapang
*Arsitektur: Decoupled AI Autonomous Engine via Laravel Sanctum REST API*

Dokumen ini adalah referensi definitif bagi Administrator dan Operator AI untuk menjalankan, mengonfigurasi, dan mengotomasi **Hermes Agent** bersama aplikasi Radar Politik.

---

### 1. Arsitektur Komunikasi Decoupled

Aplikasi web Laravel Octane (FrankenPHP) dan Hermes Agent berkomunikasi melalui REST API yang terisolasi (*decoupled*):
1. **GET `/api/v1/hermes/fetch-news`**: Hermes menarik antrean artikel berita yang belum dianalisis (`ai_status = 'pending'`), lengkap dengan persona tokoh dan kata kunci target.
2. **Reasoning Intelijen Hermes**: Model LLM Hermes menganalisis teks berita, menghitung skor kecepatan isu (*Velocity*), mendeteksi sentimen, menguji integritas, dan menyusun 3 naskah pers formal.
3. **POST `/api/v1/hermes/webhook`**: Hermes mengembalikan hasil analisis ke sistem. Jika skor *Velocity* ≥ 40, sistem otomatis membunyikan notifikasi krisis ke seluruh akun Timses dan Admin.

---

### 2. Autentikasi Sanctum Token

Setiap pemanggilan API mewajibkan header HTTP:
```http
Authorization: Bearer <HERMES_API_TOKEN>
Accept: application/json
Content-Type: application/json
```

#### Cara Generate / Reset Token di Server:
```bash
# Di dalam container Docker:
docker compose exec app php artisan hermes:generate-token --save-env

# Atau output token plain text saja:
docker compose exec app php artisan hermes:generate-token --plain
```
Token otomatis tersimpan di file `.env` sebagai `HERMES_API_TOKEN`.

---

### 3. Spesifikasi Endpoint REST API

#### A. Fetch Pending News
- **URL:** `GET /api/v1/hermes/fetch-news`
- **Tujuan:** Mengambil berita mentah siap olah.
- **Contoh Request:**
  ```bash
  curl -X GET "http://localhost:8282/api/v1/hermes/fetch-news" \
       -H "Authorization: Bearer <TOKEN>" \
       -H "Accept: application/json"
  ```
- **Contoh Respons:**
  ```json
  {
    "status": "success",
    "total_pending": 1,
    "instructions": {
      "mode_rule": "Jika sentimen negatif, terapkan Defensive Reframing & Hak Jawab. Jika netral/positif, terapkan Proactive Amplification & Siaran Pers.",
      "target_parameters": {
        "persona": "Gaya bahasa merakyat, tenang namun tegas, berorientasi solusi nyata...",
        "primary_keywords": ["Calon Bupati Ketapang", "Pilkada Ketapang"],
        "negative_keywords": ["judi", "slot", "loker"]
      }
    },
    "data": [
      {
        "id": 4,
        "title": "Evaluasi Penyerapan APBD Ketapang Sektor Jalan & Jembatan",
        "source": "Antara Kalbar",
        "url": "https://kalbar.antaranews.com/berita/ketapang/apbd-jalan",
        "raw_content": "Pemerintah Kabupaten Ketapang terus memacu penyerapan anggaran...",
        "published_at": "2026-11-16 09:30:00"
      }
    ]
  }
  ```

#### B. Submit Webhook Analysis
- **URL:** `POST /api/v1/hermes/webhook`
- **Tujuan:** Mengirimkan analitik hasil pemikiran Hermes ke database sistem.
- **Payload Struktur (Kasus Normal / Sukses):**
  ```json
  {
    "news_id": 4,
    "status": "success",
    "velocity_score": 85,
    "sentiment": "negative",
    "fact_anchor": {
      "tuduhan": "Kelambatan lelang proyek infrastruktur jalan Sandai.",
      "fakta_lapangan": "Proses lelang telah selesai dan alat berat sudah beroperasi sejak pekan lalu.",
      "dokumen_rujukan": "Surat Perintah Kerja (SPK) DPU-PR Ketapang No. 602/2026."
    },
    "scripts": {
      "press_release": "SIARAN PERS RESMI // MEDIA CENTER KETAPANG\n\nKETAPANG — Menanggapi sorotan publik terkait...",
      "spokesperson": "DOORSTOP TALKING POINTS (JURU BICARA):\n1. Pengerjaan fisik jalan Sandai sudah dimulai...",
      "editorial_reply": "SURAT HAK JAWAB & KLARIFIKASI PERS (UU NO. 40/1999)\nKepada Yth. Redaksi Antara Kalbar..."
    }
  }
  ```

- **Payload Struktur (Kasus Pelanggaran Integritas / Fitnah):**
  ```json
  {
    "news_id": 5,
    "status": "integrity_alert",
    "velocity_score": 95,
    "sentiment": "negative",
    "fact_anchor": {
      "tuduhan": "Klaim survei elektabilitas palsu.",
      "fakta_lapangan": "Bawaslu Ketapang telah mengeluarkan pernyataan resmi bahwa lembaga survei tidak terdaftar.",
      "dokumen_rujukan": "Surat Keputusan Bawaslu Kabupaten Ketapang & UU Pemilu."
    },
    "scripts": {
      "press_release": "",
      "spokesperson": "",
      "editorial_reply": ""
    }
  }
  ```

---

### 4. Menjalankan Worker Eksekutor Python

Skrip runner mandiri sudah tersedia di direktori proyek: `hermes_runner.py`.

#### Menjalankan Sekali Eksekusi (Batch Run):
```bash
python hermes_runner.py
```

#### Menjalankan Autopilot Berkala (Loop Mode):
```bash
python hermes_runner.py --loop
```
Skrip ini akan memeriksa antrean setiap 30 detik secara otomatis tanpa membebani server utama.

---

### 5. Jadwal Otomasi (Cronjob)

Anda dapat memasang job di cron server Hermes:
```bash
# Menjalankan worker setiap 5 menit
*/5 * * * * cd /home/x/workspace/radar-ketapang && /usr/bin/python3 hermes_runner.py >> /var/log/hermes_radar.log 2>&1
```
