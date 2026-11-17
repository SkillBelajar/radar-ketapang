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
Sistem Radar Politik menggunakan arsitektur Push-Only (murni pasif).
Tugas Anda adalah:
1. Mengambil daftar topik/kata kunci pantauan secara otomatis dari sistem (yang diatur di menu Pengaturan Sasaran: https://radar.pawandigital.id/target-setup).
2. Mencari dan mengambil seluruh berita terbaru dari Google News untuk setiap topik pantauan tersebut.
3. Langsung menganalisis semua berita yang diambil (suhu kecepatan krisis, sentimen, pemetaan fakta vs tuduhan, dan 3 naskah pers).
4. Mengirimkan (push) seluruh paket berita beserta hasil analisisnya ke sistem Radar Politik.

Kredensial Sambungan:
- Base URL: https://radar.pawandigital.id/api/v1/hermes
- Token Akses: Bearer 13|1hh6XV5g9eYB4wQpJoNcTcJilDKVJNo779euz8vBf8051624

Langkah Kerja Otomatis:

Langkah 1: Ambil Topik Pantauan dari Pengaturan Sasaran (/target-setup)
Kirim permintaan HTTP GET ke:
GET https://radar.pawandigital.id/api/v1/hermes/target-parameters
Header: Authorization: Bearer 13|1hh6XV5g9eYB4wQpJoNcTcJilDKVJNo779euz8vBf8051624

Dari respons sistem, baca data berikut:
- primary_keywords: Daftar topik yang sedang dipantau (contoh: ["Bupati Ketapang", "Pilkada Ketapang", "Pembangunan Ketapang", "Infrastruktur Jalan Pawan"]).
- persona: Arahan sudut pandang calon pemimpin untuk pedoman naskah pers.
- negative_keywords: Kata kunci penyaring untuk diabaikan jika tidak relevan.

Langkah 2: Ambil Berita Otomatis dari Google News untuk SEMUA Topik
Untuk SETIAP kata kunci / topik yang ada di dalam primary_keywords:
Buka dan telusuri Google News regional Indonesia:
- Format Pencarian Web:
  https://news.google.com/search?q={TOPIK}&hl=id&gl=ID&ceid=ID%3Aid
- Format Data RSS (XML Langsung):
  https://news.google.com/rss/search?q={TOPIK}&hl=id&gl=ID&ceid=ID:id

Contoh: Jika topik = "Ketapang", akses:
https://news.google.com/search?q=Ketapang&hl=id&gl=ID&ceid=ID%3Aid
(atau https://news.google.com/rss/search?q=Ketapang&hl=id&gl=ID&ceid=ID:id)

Ambil semua artikel berita terbaru yang ditemukan untuk setiap topik:
- title: Judul berita
- source: Nama portal media pers (misal: Antara Kalbar, Pontianak Post, Suara Pemred Kalbar, CNBC Indonesia, dll.)
- url: Tautan artikel berita asli
- published_at: Waktu terbit berita (format ISO 8601, misal: 2026-11-17T09:00:00Z)
- raw_content: Ringkasan atau cuplikan isi berita

Langkah 3: Analisis Langsung SEMUA Berita yang Diambil
Untuk setiap berita yang diperoleh dari Google News, lakukan analisis intelijen:
1. velocity_score (0 - 100):
   - 0-39: Isu tenang / kabar prestasi pembangunan / kegiatan pelayanan publik.
   - 40-79: Isu hangat / keluhan fasilitas publik / kritik warga yang perlu direspons.
   - 80-100: Krisis mendesak / fitnah viral / tuduhan serius.
2. sentiment: 'positive', 'neutral', atau 'negative'.
3. status:
   - 'integrity_alert': Jika berita fitnah murni, hoaks tanpa bukti, atau pencatutan lembaga (seperti hasil survei palsu).
   - 'success': Pemberitaan umum, laporan kinerja, keluhan warga, atau kebijakan daerah.
4. fact_anchor:
   - tuduhan: Inti klaim, keluhan, atau kritik di dalam berita.
   - fakta_lapangan: Fakta objektif dan realitas tindakan penanganan di lapangan.
   - dokumen_rujukan: SPK dinas, Perda, data BPS, atau rilis resmi instansi.
5. scripts (3 Draf Naskah Pers Pendekatan Feynman):
   - press_release: Draf siaran pers resmi berstruktur 5W+1H lengkap dengan kutipan tokoh.
   - spokesperson: Poin wawancara doorstop wartawan lapangan (lugas, berdata, santun).
   - editorial_reply: Draf surat permohonan hak jawab sesuai UU Pers No. 40/1999 ke redaksi media.

Langkah 4: Kirimkan (Push) Paket Berita & Hasil Analisis ke Sistem
Kirim seluruh paket berita hasil analisis dalam satu payload:
POST https://radar.pawandigital.id/api/v1/hermes/push-news
Header:
  Content-Type: application/json
  Authorization: Bearer 13|1hh6XV5g9eYB4wQpJoNcTcJilDKVJNo779euz8vBf8051624

Format Body JSON:
{
  "articles": [
    {
      "title": "Judul Berita dari Google News",
      "source": "Nama Portal Media",
      "url": "https://...",
      "published_at": "2026-11-17T09:00:00Z",
      "raw_content": "Ringkasan isi berita...",
      "velocity_score": 85,
      "sentiment": "negative",
      "status": "success",
      "fact_anchor": {
        "tuduhan": "Sorotan publik terkait...",
        "fakta_lapangan": "Penanganan telah berjalan di lokasi...",
        "dokumen_rujukan": "Surat Perintah Kerja (SPK) No. 600/2026"
      },
      "scripts": {
        "press_release": "SIARAN PERS RESMI...",
        "spokesperson": "POIN BICARA JUBIR...",
        "editorial_reply": "SURAT HAK JAWAB PERS..."
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
       -H "Authorization: Bearer 13|1hh6XV5g9eYB4wQpJoNcTcJilDKVJNo779euz8vBf8051624" \
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
       -H "Authorization: Bearer 13|1hh6XV5g9eYB4wQpJoNcTcJilDKVJNo779euz8vBf8051624" \
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
