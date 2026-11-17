# PANDUAN INTEGRASI & DOKTRIN HERMES AGENT
## Radar Politik & Manajemen Reputasi Kabupaten Ketapang
*Arsitektur: Push-Only AI Ingestion via Laravel Sanctum REST API*

Dokumen ini adalah referensi definitif bagi Administrator dan Operator AI untuk mengonfigurasi dan mengotomasi **Hermes Agent** bersama aplikasi Radar Politik.

---

## ⚡ PANDUAN CEPAT: APA SAJA YANG PERLU DI-COPY PASTE KE HERMES?

Tergantung pada cara Anda mengoperasikan Hermes, pilih **salah satu**:

### PILIHAN 1: Jika Anda Menggunakan Hermes Chat / AI Agent CLI (Copy Teks Prompt)
Salin teks prompt di bawah ini lalu tempelkan (*paste*) langsung ke Hermes Anda:

```text
Peran Anda:
Agen Intelijen Media & Analis Komunikasi Politik Pilkada Kabupaten Ketapang.

Misi Utama:
Sistem Radar Politik bekerja dalam mode Push-Only (murni pasif). Tugas Anda setiap hari adalah mencari berita terkini, menganalisis suhu dan naskah pers, lalu mengirimkan seluruh hasilnya ke sistem Radar Politik.

Kredensial Sambungan:
- Base URL: https://radar.pawandigital.id/api/v1/hermes
- Token Akses: Bearer 12|KonMQMooBI1zpSyEKONWZv5NEvE4AMtGu0BS5pMq3a7fcf6f

Langkah Kerja Otomatis:
1. Baca target kata kunci pantauan dan profil persona dari server:
   GET https://radar.pawandigital.id/api/v1/hermes/target-parameters
   Header: Authorization: Bearer 12|KonMQMooBI1zpSyEKONWZv5NEvE4AMtGu0BS5pMq3a7fcf6f

2. Cari berita online harian di portal pers daerah Kalbar (Antara Kalbar, Pontianak Post, Suara Pemred Kalbar, Tribun Pontianak).

3. Lakukan analisis intelijen untuk setiap artikel:
   - velocity_score (0 tenang s/d 100 krisis viral).
   - sentiment ('positive', 'neutral', atau 'negative').
   - status ('integrity_alert' jika fitnah murni / survei palsu; 'success' jika pemberitaan umum).
   - fact_anchor (tuduhan, fakta_lapangan, dokumen_rujukan).
   - scripts (press_release, spokesperson, editorial_reply).

4. Kirimkan seluruh paket berita dan analisis ke server Radar Politik:
   POST https://radar.pawandigital.id/api/v1/hermes/push-news
   Header:
     Content-Type: application/json
     Authorization: Bearer 12|KonMQMooBI1zpSyEKONWZv5NEvE4AMtGu0BS5pMq3a7fcf6f
   Format Body JSON:
   {
     "articles": [
       {
         "title": "Judul Berita",
         "source": "Nama Media",
         "url": "https://...",
         "published_at": "2026-11-17T09:00:00Z",
         "raw_content": "Ringkasan isi berita...",
         "velocity_score": 85,
         "sentiment": "negative",
         "status": "success",
         "fact_anchor": {
           "tuduhan": "...",
           "fakta_lapangan": "...",
           "dokumen_rujukan": "..."
         },
         "scripts": {
           "press_release": "...",
           "spokesperson": "...",
           "editorial_reply": "..."
         }
       }
     ]
   }
```

---

### PILIHAN 2: Jika Menggunakan Skrip Otomasi Harian (Tanpa Ketik Ulang)
File program sudah dibuat dan tersimpan di server Anda di:
`/home/x/workspace/radar-ketapang/hermes_daily_patrol.py`

Cukup jalankan di terminal:
```bash
python3 /home/x/workspace/radar-ketapang/hermes_daily_patrol.py
```
Atau pasang di `crontab -e` agar jalan setiap hari jam 07:00 pagi:
```bash
0 7 * * * /usr/bin/python3 /home/x/workspace/radar-ketapang/hermes_daily_patrol.py >> /var/log/hermes_patrol.log 2>&1
```

---

### 1. Arsitektur Push-Only (Hermes Pengirim Mandiri Berita & Analisis)

Sistem web Radar Politik dirancang **murni pasif**:
- Server web **TIDAK** melakukan penarikan/crawling berita secara mandiri.
- **Hermes Agent** bertindak sebagai satu-satunya agen intelijen eksternal yang mencari berita harian dari portal pers daerah, menganalisis sentimen dan suhu krisis, menyusun 3 naskah pers, lalu mengirimkan (push) seluruh data ke sistem.

```
+-------------------------------------------------------------------+
|                           HERMES AGENT                            |
|                                                                   |
| 1. GET /api/v1/hermes/target-parameters                           |
|    Membaca kata kunci utama & persona sasaran                     |
|                                                                   |
| 2. Cari Berita Harian Portal Pers Daerah                          |
|    (Antara Kalbar, Pontianak Post, Suara Pemred, dll.)            |
|                                                                   |
| 3. Analisis Intelijen AI Hermes                                   |
|    - Hitung Kecepatan Krisis (Velocity Score 0-100)               |
|    - Petakan Tuduhan vs Fakta Lapangan vs Dokumen Rujukan         |
|    - Susun 3 Naskah Pers (Siaran Pers, Poin Jubir, Hak Jawab)     |
|                                                                   |
| 4. POST /api/v1/hermes/push-news                                  |
|    Kirim seluruh paket berita + analisis ke sistem                |
+---------------------------------+---------------------------------+
                                  | HTTP REST API (Sanctum Token)
                                  v
+-------------------------------------------------------------------+
|                    RADAR POLITIK WEB SERVER                       |
|                                                                   |
| - Menerima payload kiriman berita + analisis                      |
| - Simpan ke database (deduplikasi otomatis via URL)               |
| - Berita langsung tampil di Papan Berita & Ruang Media            |
| - Bunyikan notifikasi krisis jika Velocity >= 40                   |
+-------------------------------------------------------------------+
```

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

#### A. Ambil Parameter Kata Kunci Terkini
- **Endpoint:** `GET /api/v1/hermes/target-parameters`
- **Tujuan:** Mengetahui kata kunci apa yang harus dicari dan persona apa yang ingin ditampilkan.
- **Contoh Request:**
  ```bash
  curl -s -X GET "https://radar.pawandigital.id/api/v1/hermes/target-parameters" \
       -H "Authorization: Bearer 12|KonMQMooBI1zpSyEKONWZv5NEvE4AMtGu0BS5pMq3a7fcf6f" \
       -H "Accept: application/json"
  ```
- **Contoh Respons:**
  ```json
  {
    "status": "success",
    "primary_keywords": ["Bupati Ketapang"],
    "negative_keywords": ["korupsi", "karhutla", "dinasti politik"],
    "persona": "Calon pemimpin daerah yang santun, rekam jejak birokrasi transparan...",
    "trusted_press_portals": {
      "Antara Kalbar": "https://kalbar.antaranews.com",
      "Pontianak Post": "https://pontianakpost.jawapos.com",
      "Suara Pemred Kalbar": "https://suarapemredkalbar.com"
    }
  }
  ```

#### B. Kirim Berita + Hasil Analisis (Push Ingestion)
- **Endpoint:** `POST /api/v1/hermes/push-news`
- **Tujuan:** Mengirimkan berita harian yang sudah selesai dianalisis langsung ke sistem.
- **Contoh Request:**
  ```bash
  curl -s -X POST "https://radar.pawandigital.id/api/v1/hermes/push-news" \
       -H "Content-Type: application/json" \
       -H "Authorization: Bearer 12|KonMQMooBI1zpSyEKONWZv5NEvE4AMtGu0BS5pMq3a7fcf6f" \
       -d '{
         "articles": [
           {
             "title": "Penyaluran Bantuan Sembako Korban Banjir di Tumbang Titi Berjalan Lancar",
             "source": "Antara Kalbar",
             "url": "https://kalbar.antaranews.com/berita/998811/bantuan-tumbang-titi",
             "published_at": "2026-11-17T09:00:00Z",
             "raw_content": "Pemerintah Daerah bersama Satgas BPBD Ketapang menyalurkan paket bantuan pangan...",
             "velocity_score": 25,
             "sentiment": "positive",
             "status": "success",
             "fact_anchor": {
               "tuduhan": "Tidak ada tuduhan negatif",
               "fakta_lapangan": "Bantuan logistik telah diserahterimakan kepada kepala desa",
               "dokumen_rujukan": "Berita Acara BPBD Ketapang No. 440/2026"
             },
             "scripts": {
               "press_release": "Siaran Pers: Pemkab Ketapang Salurkan Bantuan Tanggap Darurat...",
               "spokesperson": "Poin Bicara Juru Bicara: Penyaluran logistik tuntas hari ini...",
               "editorial_reply": "Apresiasi peliputan objektif insan pers lokal..."
             }
           }
         ]
       }'
  ```

---

### 4. Skrip Patroli Harian Hermes (`hermes_daily_patrol.py`)

Skrip otomasi harian siap pakai sudah tersedia di repositori: `hermes_daily_patrol.py`.

#### Menjalankan Sekali Eksekusi (Manual Run):
```bash
python3 hermes_daily_patrol.py
```

#### Menjalankan Mode Simulasi (Dry Run):
```bash
python3 hermes_daily_patrol.py --dry-run
```

---

### 5. Jadwal Pengiriman Berita Setiap Hari (Cronjob)

Untuk menjadwalkan Hermes mengirimkan berita dan analisis secara otomatis setiap hari (misal jam 07:00 WIB):

```bash
# Buka crontab
crontab -e

# Tambahkan baris ini (jalan setiap hari jam 07:00):
0 7 * * * cd /home/x/workspace/radar-ketapang && /usr/bin/python3 hermes_daily_patrol.py >> /var/log/hermes_daily_patrol.log 2>&1
```
