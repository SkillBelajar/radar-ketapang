import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Shield, Key, Users, Radio, Bell, AlertTriangle, 
    Zap, Share2, CheckCircle2, ChevronRight, Terminal, 
    Sliders, FileText, ArrowRight, Eye, RefreshCw, Cpu, Activity,
    Copy, Check, Code, ExternalLink, Play, Sparkles, BookOpen, Layers
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
    const [hermesSubTab, setHermesSubTab] = useState('prompt'); // 'prompt' | 'script' | 'contract' | 'curl'

    const handleCopy = (text, fieldKey) => {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(text);
        setCopiedField(fieldKey);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const effectiveToken = plainToken || '3|JshViAe7W1LpcmJYWEQu0LNsmvHLshWqVBQFm7ks4eed8e1d';
    const displayToken = showPlainToken 
        ? effectiveToken 
        : (maskedToken || (effectiveToken.slice(0, 5) + '••••••••••••••••' + effectiveToken.slice(-5)));

    // System prompt string ready for Hermes
    const hermesPromptText = `Kamu adalah Analis Komunikasi Politik & Manajemen Krisis Pers untuk Pilkada Kabupaten Ketapang.
Tugasmu memproses artikel portal berita online secara objektif berdasarkan target tokoh dan parameter persona:

Input Berita:
- Judul: {title}
- Media Sumber: {source} ({url})
- Waktu Terbit: {published_at}
- Isi Berita: {raw_content}

Target Persona: {persona}
Kata Kunci Pantauan: {primary_keywords}

Tugas Evaluasi:
1. Hitung Velocity Score (0-100): Seberapa cepat dan luas isu ini berpotensi meledak di publik.
2. Tentukan Sentimen: 'positive', 'neutral', atau 'negative'.
3. Uji Integritas (Integrity Check):
   - Jika berita berupa kampanye hitam fitnah murni tanpa dasar/pencatutan nama lembaga resmi (seperti survei palsu), set status = 'integrity_alert'.
   - Jika kritik wajar, pemberitaan kebijakan, atau pencapaian daerah, set status = 'success'.
4. Ekstraksi Fact-Anchor:
   - tuduhan: inti tuduhan atau kritik miring.
   - fakta_lapangan: fakta objektif dan kinerja riil tokoh di lapangan.
   - dokumen_rujukan: surat dinas, data BPS, atau rilis resmi rujukan.
5. Susun 3 Format Naskah Pers (HANYA jika status = 'success'):
   - press_release: Rilis pers resmi berstruktur 5W+1H lengkap dengan kutipan tokoh dan narahubung media center.
   - spokesperson: Poin bicara wawancara doorstop wartawan lapangan (lugas, berdata, santun).
   - editorial_reply: Draf surat hak jawab redaksi sesuai mekanisme UU Pers No. 40/1999.

Output WAJIB berupa JSON valid MURNI tanpa markdown wrap:
{
  "news_id": {id},
  "status": "success" | "integrity_alert",
  "velocity_score": 0-100,
  "sentiment": "positive" | "neutral" | "negative",
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
}`;

    // Python runner code ready for Hermes worker
    const pythonRunnerCode = `import os
import json
import time
import requests

API_BASE = os.getenv("RADAR_API_URL", "${apiBaseUrl}")
TOKEN = os.getenv("RADAR_API_TOKEN", "${effectiveToken}")

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

def run_hermes_daily_patrol():
    # 1. Ambil parameter target kata kunci terkini dari sistem
    print("1. Mengambil parameter target kata kunci...")
    res = requests.get(f"{API_BASE}/target-parameters", headers=headers, timeout=20)
    params = res.json()
    keywords = params.get("primary_keywords", ["Bupati Ketapang"])
    
    # 2. Cari berita online harian & lakukan analisis intelijen AI
    print(f"2. Menganalisis berita harian terkini...")
    articles_payload = [
        {
            "title": "Penyaluran Bantuan Sembako Warga Terdampak Banjir Berjalan Lancar",
            "source": "Antara Kalbar",
            "url": "https://kalbar.antaranews.com/berita/bantuan-sembako-ketapang",
            "published_at": "2026-11-17T09:00:00Z",
            "raw_content": "Pemerintah Daerah bersama Satgas BPBD Ketapang menyalurkan paket sembako...",
            "velocity_score": 25,
            "sentiment": "positive",
            "status": "success",
            "fact_anchor": {
                "tuduhan": "Tidak ada tuduhan negatif",
                "fakta_lapangan": "Bantuan logistik telah diserahterimakan",
                "dokumen_rujukan": "Berita Acara BPBD No. 440/2026"
            },
            "scripts": {
                "press_release": "Siaran Pers: Pemkab Ketapang Salurkan Bantuan...",
                "spokesperson": "Poin Juru Bicara: Penyaluran logistik tuntas...",
                "editorial_reply": "Apresiasi peliputan pers lokal..."
            }
        }
    ]
    
    # 3. Kirim paket berita + hasil analisis ke sistem (Push Ingestion)
    print("3. Mengirimkan (push) berita dan analisis ke sistem...")
    post_res = requests.post(
        f"{API_BASE}/push-news",
        headers=headers,
        json={"articles": articles_payload},
        timeout=30
    )
    print(f"Status kirim push: {post_res.status_code}")
    print(post_res.json())

if __name__ == "__main__":
    run_hermes_daily_patrol()`;

    const sampleWebhookSuccess = `{
  "news_id": 4,
  "status": "success",
  "velocity_score": 85,
  "sentiment": "negative",
  "fact_anchor": {
    "tuduhan": "Keterlambatan perbaikan jalan poros Sandai - Nanga Tayap.",
    "fakta_lapangan": "Alat berat dan material aspal sudah dimobilisasi di 3 titik kritis sejak awal pekan.",
    "dokumen_rujukan": "Surat Perintah Kerja (SPK) DPU-PR Ketapang No. 602/B/2026."
  },
  "scripts": {
    "press_release": "SIARAN PERS RESMI // MEDIA CENTER KETAPANG\\n\\nKETAPANG — Menanggapi sorotan publik terkait perbaikan jalan Sandai, Media Center menegaskan komitmen nyata akselerasi fisik di lapangan...\\n\\nNarahubung Media Center: 0812-XXXX-XXXX.",
    "spokesperson": "DOORSTOP TALKING POINTS (JURU BICARA):\\n1. Penanganan fisik sudah berjalan sejak awal pekan.\\n2. Cuaca ekstrem sempat menjadi tantangan logistik material aspal.\\n3. Ditargetkan fungsional mulus sebelum puncak mobilitas warga.",
    "editorial_reply": "SURAT HAK JAWAB & KLARIFIKASI PERS (UU NO. 40/1999)\\nKepada Yth. Redaksi Media Bersangkutan\\n\\nMenindaklanjuti pemberitaan tertanggal 16 November 2026, kami menyampaikan hak jawab resmi untuk meluruskan fakta pekerjaan di lapangan."
  }
}`;

    const sampleWebhookIntegrity = `{
  "news_id": 5,
  "status": "integrity_alert",
  "velocity_score": 95,
  "sentiment": "negative",
  "fact_anchor": {
    "tuduhan": "Penyebaran infografis hasil survei elektabilitas palsu.",
    "fakta_lapangan": "Bawaslu Ketapang telah mengeluarkan pernyataan resmi bahwa infografis tersebut hoaks.",
    "dokumen_rujukan": "Siaran Klarifikasi Bawaslu Kabupaten Ketapang & UU Pemilu."
  },
  "scripts": {
    "press_release": "",
    "spokesperson": "",
    "editorial_reply": ""
  }
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
                                        Pintu Pengambilan: <code>/fetch-news</code> | Pintu Kirim: <code>/webhook</code>
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
                                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                                        <span>Diperlukan agar asisten diizinkan menyetor data</span>
                                        <span className="text-cyan-400">Aman & Terenkripsi</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3-Step Lifecycle Visual */}
                        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-cyan-400" />
                                <span>3 Langkah Kerja Asisten Cerdas Membaca Berita</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                                            LANGKAH 1
                                        </span>
                                        <span className="text-slate-500 text-[11px]">Ambil Berita</span>
                                    </div>
                                    <h4 className="text-white font-bold text-sm">Tarik Berita Baru</h4>
                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                        Asisten mengambil berita online terbaru yang menyebutkan nama calon atau topik yang sedang dipantau di Ketapang.
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 font-bold">
                                            LANGKAH 2
                                        </span>
                                        <span className="text-slate-500 text-[11px]">Pahami Isu</span>
                                    </div>
                                    <h4 className="text-white font-bold text-sm">Baca & Ukur Suhu Berita</h4>
                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                        Asisten membaca isi berita, menentukan apakah nadanya kabar baik atau tuduhan, mencocokkan fakta, dan menyusun draf klarifikasi.
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                                            LANGKAH 3
                                        </span>
                                        <span className="text-slate-500 text-[11px]">Setor Hasil</span>
                                    </div>
                                    <h4 className="text-white font-bold text-sm">Kirim Hasil & Nyalakan Lonceng</h4>
                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                        Hasil analisis disimpan ke dasbor. Bila ada berita fitnah atau kabar buruk yang hangat, sistem langsung membunyikan tanda lonceng ke tim.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Blueprint Tabs */}
                        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
                            {/* Sub-tab navigation */}
                            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setHermesSubTab('prompt')}
                                    className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                                        hermesSubTab === 'prompt'
                                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 font-bold'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-950'
                                    }`}
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>1. System Prompt Hermes</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setHermesSubTab('script')}
                                    className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                                        hermesSubTab === 'script'
                                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 font-bold'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-950'
                                    }`}
                                >
                                    <Code className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>2. Pengiriman Harian (hermes_daily_patrol.py)</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setHermesSubTab('contract')}
                                    className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                                        hermesSubTab === 'contract'
                                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 font-bold'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-950'
                                    }`}
                                >
                                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>3. Format JSON Berita & Analisis (Push)</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setHermesSubTab('curl')}
                                    className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                                        hermesSubTab === 'curl'
                                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 font-bold'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-950'
                                    }`}
                                >
                                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>4. Uji Cepat via cURL (Push & Target)</span>
                                </button>
                            </div>

                            {/* SUBTAB 1: SYSTEM PROMPT */}
                            {hermesSubTab === 'prompt' && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <h4 className="text-sm font-bold text-white">
                                                Pedoman Berpikir Asisten Pembaca Berita
                                            </h4>
                                            <p className="text-xs text-slate-400">
                                                Instruksi yang diberikan kepada asisten cerdas agar membaca berita, mencocokkan fakta, dan menyusun draf rilis pers.
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
                                                    <span>Salin Pedoman Asisten</span>
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
