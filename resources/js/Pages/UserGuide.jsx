import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Shield, Key, Users, Radio, Bell, AlertTriangle, 
    Zap, Share2, CheckCircle2, ChevronRight, Terminal, 
    Sliders, FileText, ArrowRight, Eye, RefreshCw, Cpu, Activity,
    Copy, Check, Code, ExternalLink, Play, Sparkles, BookOpen, Layers
} from 'lucide-react';

export default function UserGuide({ apiBaseUrl = 'http://localhost:8282/api/v1/hermes', hasToken = true, maskedToken = null, plainToken = null }) {
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

def run_hermes_cycle():
    # 1. Ambil berita pending
    print("Memeriksa berita pending...")
    res = requests.get(f"{API_BASE}/fetch-news", headers=headers, timeout=20)
    data = res.json()
    
    total = data.get("total_pending", 0)
    if total == 0:
        print("Tidak ada berita pending.")
        return

    print(f"Ditemukan {total} berita siap diproses!")
    instructions = data.get("instructions", {})
    persona = instructions.get("target_parameters", {}).get("persona", "")
    
    for item in data.get("data", []):
        print(f"Memproses #{item['id']}: {item['title']}...")
        
        # 2. Panggil Model LLM Hermes dengan prompt kontekstual
        # prompt = build_hermes_prompt(item, persona)
        # response_ai = call_hermes_model(prompt)
        
        # 3. Kirim kembali hasil ke Webhook Laravel
        payload = {
            "news_id": item["id"],
            "status": "success", # atau "integrity_alert"
            "velocity_score": 85,
            "sentiment": "negative",
            "fact_anchor": {
                "tuduhan": "Klaim lawan politik...",
                "fakta_lapangan": "Data fakta terverifikasi di lapangan...",
                "dokumen_rujukan": "SK Dinas PUPR Ketapang 2026"
            },
            "scripts": {
                "press_release": "Draf Siaran Pers 5W+1H...",
                "spokesperson": "Poin wawancara doorstop...",
                "editorial_reply": "Lembar Hak Jawab UU Pers No. 40/1999..."
            }
        }
        
        post_res = requests.post(f"{API_BASE}/webhook", headers=headers, json=payload, timeout=20)
        print(f"Status kirim webhook #{item['id']}: {post_res.status_code}")

if __name__ == "__main__":
    run_hermes_cycle()`;

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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">
                                PROTOKOL OPERASIONAL // INTEL ENGINE
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                                AUTH_READY
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1">
                            Pusat Panduan & Doktrin Intelijen
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">ROLE ANDA SAAT INI:</span>
                        <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold uppercase">
                            {userRole}
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Panduan Pengguna & Integrasi Hermes - Radar Politik Ketapang" />

            <div className="space-y-8">
                {/* Active Role Quick Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/60 flex items-center justify-center shrink-0">
                            <Terminal className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <div className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
                                AKUN TERAUTENTIKASI: {auth.user?.name} ({auth.user?.email})
                            </div>
                            <div className="text-sm text-slate-300 font-medium">
                                Panduan instruksi disesuaikan otomatis dengan hak akses peranan Anda di sistem radar.
                            </div>
                        </div>
                    </div>

                    {/* Role Tab Simulator for Quick Inspection */}
                    <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-auto font-mono text-xs">
                        <button
                            type="button"
                            onClick={() => setActiveRoleView('admin')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${
                                activeRoleView === 'admin'
                                    ? 'bg-red-950 text-red-300 border border-red-500/60 font-bold'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Admin {userRole === 'admin' && '★'}
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
                            <span>Integrasi Hermes AI ⚡</span>
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
                            Timses {userRole === 'timses' && '★'}
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
                            Tim Media & Pers {userRole === 'influencer' && '★'}
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
                                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-red-950 text-red-400 border border-red-800 uppercase font-bold">
                                        AKSES SUPER ADMINISTRATOR
                                    </span>
                                    <h2 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                                        Panduan Setup Keyword, Manajemen Tim & Engine Hermes
                                    </h2>
                                    <p className="text-sm text-slate-300 max-w-2xl">
                                        Sebagai Administrator Utama, Anda memegang kendali penuh atas parameter pemantauan portal berita online, 
                                        database target politik Kabupaten Ketapang, serta distribusi hak akses tim relawan & integrasi Hermes Autonomous Agent.
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
                                    <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                                        <span>Hermes AI Agent Autonomous Worker</span>
                                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                                            SANCTUM READY
                                        </span>
                                    </h4>
                                    <p className="text-xs text-slate-300 mt-0.5">
                                        Gunakan cetak biru prompt sistem, token Sanctum, dan skrip runner Python untuk mengotomasi analisis berita secara berkala.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveRoleView('hermes')}
                                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs flex items-center gap-2 shrink-0 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                            >
                                <span>Buka Cetak Biru Hermes Agent</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Admin Action Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                                <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800 flex items-center justify-center text-red-400 font-mono font-bold text-sm">
                                    01
                                </div>
                                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                                    <Sliders className="w-4 h-4 text-red-400" />
                                    <span>Konfigurasi Keyword Target</span>
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Definisikan nama paslon, tokoh kunci, isu sensitif daerah (misal: infrastruktur jalan Ketapang, sengketa lahan, harga komoditas sawit), serta portal berita daerah yang wajib dipantau 24/7.
                                </p>
                                <div className="pt-2 text-[11px] font-mono text-cyan-400">
                                    Parameter: 50 Active Keywords
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                                <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800 flex items-center justify-center text-red-400 font-mono font-bold text-sm">
                                    02
                                </div>
                                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                                    <Users className="w-4 h-4 text-red-400" />
                                    <span>Manajemen Akun Tim</span>
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Alokasikan akun operasional untuk Timses (analis isu lapangan) dan Tim Media (operator siaran pers & hak jawab). Pantau riwayat aktivitas dan pastikan keamanan kredensial tetap terjaga.
                                </p>
                                <div className="pt-2 text-[11px] font-mono text-cyan-400">
                                    Multi-Role Guard Active
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                                <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800 flex items-center justify-center text-red-400 font-mono font-bold text-sm">
                                    03
                                </div>
                                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-red-400" />
                                    <span>Integrasi AI & Webhook</span>
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Atur threshold skor sentimen negatif yang otomatis memicu In-App Alert dan menghubungkan Hermes AI Engine untuk memproduksi draft respon krisis dalam waktu kurang dari 60 detik.
                                </p>
                                <div className="pt-2 text-[11px] font-mono text-cyan-400">
                                    Engine: Hermes Agent API (Decoupled)
                                </div>
                            </div>
                        </div>

                        {/* Admin Step-by-Step SOP */}
                        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
                            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-red-400" />
                                <span>Checklist Rutin Super Administrator (Harian)</span>
                            </h3>
                            <ul className="space-y-3 font-mono text-xs text-slate-300">
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    <span>Verifikasi status autopilot crawler dan latensi upstream FrankenPHP Octane.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    <span>Periksa konsistensi token Sanctum Hermes Agent melalui perintah artisan <code>hermes:generate-token</code>.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    <span>Review draft tanggapan pers sebelum diteruskan ke media massa atau meja redaksi wartawan.</span>
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
                                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 uppercase font-bold">
                                            DECOUPLED AI INTELLIGENCE ENGINE
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                                            REST API SANCTUM
                                        </span>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                                        Panduan Operasional & Cetak Biru Hermes Agent
                                    </h2>
                                    <p className="text-sm text-slate-300 max-w-2xl">
                                        Dokumentasi lengkap untuk menjalankan Hermes Agent sebagai autonomous engine eksternal: 
                                        pengambilan artikel berita online, evaluasi krisis, pembentukan naskah pers, dan pengiriman webhook.
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/60 flex items-center justify-center shrink-0">
                                    <Cpu className="w-6 h-6 text-cyan-400" />
                                </div>
                            </div>
                        </div>

                        {/* Quick Connection Bar: Endpoints & Bearer Token */}
                        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                            <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                                <Key className="w-4 h-4 text-cyan-400" />
                                <span>Kredensial & Titik Akses API (API Gateway)</span>
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono text-xs">
                                {/* Base URL */}
                                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                                        <span>BASE API GATEWAY</span>
                                        <span className="text-emerald-400">ACTIVE</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 text-cyan-300">
                                        <code className="truncate">{apiBaseUrl}</code>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(apiBaseUrl, 'baseUrl')}
                                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white shrink-0"
                                            title="Salin Base URL"
                                        >
                                            {copiedField === 'baseUrl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                        Endpoint: <code>GET /fetch-news</code> | <code>POST /webhook</code>
                                    </div>
                                </div>

                                {/* Bearer Token */}
                                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                                        <span>BEARER TOKEN (LARAVEL SANCTUM)</span>
                                        <button
                                            type="button"
                                            onClick={() => setShowPlainToken(!showPlainToken)}
                                            className="text-cyan-400 hover:underline text-[10px]"
                                        >
                                            {showPlainToken ? 'Sembunyikan' : 'Perlihatkan'}
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 text-amber-300">
                                        <code className="truncate">{displayToken}</code>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(effectiveToken, 'token')}
                                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white shrink-0"
                                            title="Salin Token Sanctum"
                                        >
                                            {copiedField === 'token' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                                        <span>Header: <code>Authorization: Bearer &lt;TOKEN&gt;</code></span>
                                        <span className="text-cyan-400">php artisan hermes:generate-token</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3-Step Lifecycle Visual */}
                        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-cyan-400" />
                                <span>Alur Kerja Hermes Agent (3 Tahap Autonomous)</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                                            TAHAP 1: TARIK
                                        </span>
                                        <span className="text-slate-500">GET API</span>
                                    </div>
                                    <h4 className="text-white font-bold text-sm">Tarik Berita Pending</h4>
                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                        Hermes memanggil <code>GET /fetch-news</code> untuk mengambil artikel portal berita yang belum diproses, lengkap dengan persona tokoh dan kata kunci target.
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 font-bold">
                                            TAHAP 2: REASONING
                                        </span>
                                        <span className="text-slate-500">LLM EVAL</span>
                                    </div>
                                    <h4 className="text-white font-bold text-sm">Evaluasi Krisis & Pers</h4>
                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                        Model Hermes menghitung skor Velocity (0-100), sentimen, uji integritas hoaks, ekstraksi Fact-Anchor, dan merumuskan 3 naskah pers resmi.
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                                            TAHAP 3: BROADCAST
                                        </span>
                                        <span className="text-slate-500">POST WEBHOOK</span>
                                    </div>
                                    <h4 className="text-white font-bold text-sm">Kirim Webhook & Pemicu</h4>
                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                        Kirim JSON ke <code>POST /webhook</code>. Jika skor Velocity ≥ 40, sistem otomatis membunyikan alarm krisis ke seluruh akun Timses dan Admin.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Blueprint Tabs */}
                        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
                            {/* Sub-tab navigation */}
                            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 font-mono text-xs">
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
                                    <span>2. Runner Python (hermes_runner.py)</span>
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
                                    <span>3. Format JSON Webhook</span>
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
                                    <span>4. Uji Cepat via cURL</span>
                                </button>
                            </div>

                            {/* SUBTAB 1: SYSTEM PROMPT */}
                            {hermesSubTab === 'prompt' && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <h4 className="text-sm font-bold text-white font-mono">
                                                Instruksi Reasoning & Doktrin Evaluasi Berita
                                            </h4>
                                            <p className="text-xs text-slate-400">
                                                Gunakan prompt ini pada agent/model LLM Hermes untuk mengevaluasi setiap berita online lokal.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(hermesPromptText, 'systemPrompt')}
                                            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs flex items-center gap-2 shrink-0 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                                        >
                                            {copiedField === 'systemPrompt' ? (
                                                <>
                                                    <Check className="w-4 h-4 text-slate-950" />
                                                    <span>Tersalin! ✅</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" />
                                                    <span>Salin System Prompt</span>
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
                                            <h4 className="text-sm font-bold text-white font-mono">
                                                Skrip Eksekutor Worker Python (hermes_runner.py)
                                            </h4>
                                            <p className="text-xs text-slate-400">
                                                File telah tersedia di root proyek: <code>/home/x/workspace/radar-ketapang/hermes_runner.py</code>
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(pythonRunnerCode, 'pythonScript')}
                                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-xs flex items-center gap-2 shrink-0 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                        >
                                            {copiedField === 'pythonScript' ? (
                                                <>
                                                    <Check className="w-4 h-4 text-slate-950" />
                                                    <span>Tersalin! ✅</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" />
                                                    <span>Salin Skrip Python</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto max-h-[420px] overflow-y-auto leading-relaxed">
                                        <pre>{pythonRunnerCode}</pre>
                                    </div>

                                    {/* Command Execution Guide */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                                            <div className="text-slate-400 text-[10px] mb-1">EKSEKUSI SEKALI (BATCH SINGLE RUN):</div>
                                            <code className="text-cyan-300">python hermes_runner.py</code>
                                        </div>
                                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                                            <div className="text-slate-400 text-[10px] mb-1">EKSEKUSI AUTOPILOT LOOP (TIAP 30 DETIK):</div>
                                            <code className="text-emerald-300">python hermes_runner.py --loop</code>
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
                                                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>Kasus Normal (status: "success")</span>
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(sampleWebhookSuccess, 'sampleSuccess')}
                                                    className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
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
                                                <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5">
                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                    <span>Kasus Fitnah (status: "integrity_alert")</span>
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(sampleWebhookIntegrity, 'sampleAlert')}
                                                    className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
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
                                    <div className="space-y-3 font-mono text-xs">
                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                            <div className="flex items-center justify-between text-slate-400">
                                                <span className="font-bold text-cyan-400">1. UJI TARIK BERITA PENDING (GET)</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(`curl -s -X GET "${apiBaseUrl}/fetch-news" -H "Authorization: Bearer ${effectiveToken}" -H "Accept: application/json"`, 'curlGet')}
                                                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                                                >
                                                    {copiedField === 'curlGet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                    <span>Salin cURL</span>
                                                </button>
                                            </div>
                                            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 overflow-x-auto">
                                                <code>curl -s -X GET "{apiBaseUrl}/fetch-news" \<br />
                                                &nbsp;&nbsp;&nbsp;&nbsp;-H "Authorization: Bearer {displayToken}" \<br />
                                                &nbsp;&nbsp;&nbsp;&nbsp;-H "Accept: application/json"
                                                </code>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                            <div className="flex items-center justify-between text-slate-400">
                                                <span className="font-bold text-emerald-400">2. UJI KIRIM WEBHOOK HASIL AI (POST)</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(`curl -s -X POST "${apiBaseUrl}/webhook" -H "Authorization: Bearer ${effectiveToken}" -H "Content-Type: application/json" -H "Accept: application/json" -d '{"news_id":1,"status":"success","velocity_score":80,"sentiment":"negative","fact_anchor":{"tuduhan":"Kelambatan jalan","fakta_lapangan":"Pekerjaan fisik aktif","dokumen_rujukan":"SPK DPU-PR"},"scripts":{"press_release":"Draf Siaran Pers","spokesperson":"Poin Wawancara","editorial_reply":"Hak Jawab"}}'`, 'curlPost')}
                                                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                                                >
                                                    {copiedField === 'curlPost' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                    <span>Salin cURL</span>
                                                </button>
                                            </div>
                                            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 overflow-x-auto">
                                                <code>curl -s -X POST "{apiBaseUrl}/webhook" \<br />
                                                &nbsp;&nbsp;&nbsp;&nbsp;-H "Authorization: Bearer {displayToken}" \<br />
                                                &nbsp;&nbsp;&nbsp;&nbsp;-H "Content-Type: application/json" \<br />
                                                &nbsp;&nbsp;&nbsp;&nbsp;-H "Accept: application/json" \<br />
                                                &nbsp;&nbsp;&nbsp;&nbsp;-d '&#123;"news_id":1,"status":"success","velocity_score":80,"sentiment":"negative","fact_anchor":&#123;...&#125;,"scripts":&#123;...&#125;&#125;'
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
                                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase font-bold">
                                        AKSES TIMSES & ANALIS LAPANGAN
                                    </span>
                                    <h2 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                                        Panduan Membaca Radar, Analisis Isu Berita, dan Notifikasi
                                    </h2>
                                    <p className="text-sm text-slate-300 max-w-2xl">
                                        Panduan praktis bagi Tim Sukses untuk memantau pergerakan isu di portal berita online lokal, 
                                        mendeteksi narasi serangan politik lawan, serta merespon peringatan dini krisis secara akurat.
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
                                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
                                    01
                                </div>
                                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-emerald-400" />
                                    <span>Membaca Sinyal Radar</span>
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Perhatikan lonjakan volume pemberitaan tokoh di portal berita online lokal. Titik merah mengindikasikan serangan isu kritis di media massa, titik hijau menunjukkan sentimen positif pencapaian.
                                </p>
                                <div className="pt-2 text-[11px] font-mono text-emerald-400">
                                    Skala Sentimen: -100 s/d +100
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
                                    02
                                </div>
                                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                                    <span>Kategorisasi Isu Politik</span>
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Kelompokkan isu ke dalam 3 level urgensi: Hoaks/Fitnah Murni (perlu klarifikasi fakta resmi), Kritik Kebijakan (perlu siaran pers solusi), atau Serangan Personal (cukup tanggapan doorstop santun).
                                </p>
                                <div className="pt-2 text-[11px] font-mono text-amber-400">
                                    Auto-Cluster by AI
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
                                    03
                                </div>
                                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-emerald-400" />
                                    <span>Tindak Lanjut Notifikasi</span>
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Setiap notifikasi merah wajib diverifikasi dalam 15 menit. Gunakan tombol 'Buka Berita Asli' untuk membaca konteks langsung di portal bersangkutan sebelum membagikan narasi.
                                </p>
                                <div className="pt-2 text-[11px] font-mono text-emerald-400">
                                    SLA Respon: &lt; 15 Menit
                                </div>
                            </div>
                        </div>

                        {/* Operational Flow */}
                        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs text-slate-300">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-emerald-400" />
                                <span>Alur Kerja Cepat Timses Lapangan</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                                    <div className="text-cyan-400 font-bold mb-1">LANGKAH 1</div>
                                    <div className="text-slate-300 text-[11px]">Terima Peringatan Lonceng Krisis</div>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                                    <div className="text-cyan-400 font-bold mb-1">LANGKAH 2</div>
                                    <div className="text-slate-300 text-[11px]">Buka Link Portal Berita Asli</div>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                                    <div className="text-cyan-400 font-bold mb-1">LANGKAH 3</div>
                                    <div className="text-cyan-400 font-bold mb-1">Cek Kolom Fakta Lapangan</div>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                                    <div className="text-emerald-400 font-bold mb-1">LANGKAH 4</div>
                                    <div className="text-emerald-300 text-[11px]">Teruskan ke Media Response Studio</div>
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
                                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-teal-950 text-teal-400 border border-teal-800 uppercase font-bold">
                                        AKSES TIM MEDIA & OPERATOR PERS
                                    </span>
                                    <h2 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                                        Panduan Eksekusi Respon Media & Pers Studio
                                    </h2>
                                    <p className="text-sm text-slate-300 max-w-2xl">
                                        Panduan untuk tim media center dan juru bicara pers dalam mendistribusikan 
                                        siaran pers resmi, poin bicara doorstop, dan lembar hak jawab redaksi dalam 1 klik.
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
                                <div className="w-8 h-8 rounded-lg bg-teal-950/60 border border-teal-800 flex items-center justify-center text-teal-400 font-mono font-bold text-sm">
                                    01
                                </div>
                                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-teal-400" />
                                    <span>Pilih Format Respon Pers</span>
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Pilih format komunikasi: 'Siaran Pers Resmi' (untuk rilis ke wartawan), 'Pernyataan Juru Bicara' (untuk wawancara doorstop), atau 'Hak Jawab Redaksi' (UU Pers No. 40/1999).
                                </p>
                                <div className="pt-2 text-[11px] font-mono text-teal-400">
                                    3 Standar Respon Pers
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                                <div className="w-8 h-8 rounded-lg bg-teal-950/60 border border-teal-800 flex items-center justify-center text-teal-400 font-mono font-bold text-sm">
                                    02
                                </div>
                                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-teal-400" />
                                    <span>1-Click Copy Naskah Pers</span>
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Klik tombol 'Salin Siaran Pers' atau 'Salin Semua' untuk mengambil naskah berstruktur 5W+1H lengkap dengan kutipan resmi dan kontak narahubung media center.
                                </p>
                                <div className="pt-2 text-[11px] font-mono text-teal-400">
                                    Lead 5W+1H & Fact-Anchor
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                                <div className="w-8 h-8 rounded-lg bg-teal-950/60 border border-teal-800 flex items-center justify-center text-teal-400 font-mono font-bold text-sm">
                                    03
                                </div>
                                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                                    <Share2 className="w-4 h-4 text-teal-400" />
                                    <span>Verifikasi Tautan Berita Asli</span>
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Gunakan tombol 'Buka Sumber Asli' untuk membaca konteks pemberitaan langsung di portal asalnya sebelum merilis sanggahan atau hak jawab redaksi.
                                </p>
                                <div className="pt-2 text-[11px] font-mono text-teal-400">
                                    Audit Tautan Pers Valid
                                </div>
                            </div>
                        </div>

                        {/* Influencer Golden Rules */}
                        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs text-slate-300">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-teal-400" />
                                <span>Etika & Doktrin Komunikasi Media Pers Resmi</span>
                            </h3>
                            <ul className="space-y-2.5">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                                    <span>Seluruh rilis wajib berlandaskan fakta lapangan terverifikasi dan dokumen rujukan resmi.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                                    <span>Hak jawab redaksi disusun secara santun dan profesional sesuai pedoman UU Pers No. 40 Tahun 1999.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                                    <span>Prioritaskan respon cepat doorstop pada isu dengan skor Velocity ≥ 75% dalam 1 jam pertama.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* System Version & Slice Status Verification Banner */}
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-cyan-400" />
                        <span>Sistem Keamanan Terintegrasi // RBAC: Role-Based Access Control</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span>Engine: <strong className="text-cyan-300">Hermes Autonomous Gateway</strong></span>
                        <span className="text-slate-700">|</span>
                        <span>Rilis: <strong className="text-cyan-300">Versi: {appVersion}</strong></span>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
