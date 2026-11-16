import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Shield, Key, Users, Radio, Bell, AlertTriangle, 
    Zap, Share2, CheckCircle2, ChevronRight, Terminal, 
    Sliders, FileText, ArrowRight, Eye, RefreshCw, Cpu, Activity
} from 'lucide-react';

export default function UserGuide() {
    const { auth, appVersion = '0.11' } = usePage().props;
    const userRole = auth.user?.role || 'timses';
    
    // Tab selector so user can easily review their role guide, or preview others
    const [activeRoleView, setActiveRoleView] = useState(userRole);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider">
                                PROTOKOL OPERASIONAL // SLICE 2 AKTIF
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
            <Head title="Panduan Pengguna Dinamis - Radar Politik Ketapang" />

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
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-auto font-mono text-xs">
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
                            Influencer {userRole === 'influencer' && '★'}
                        </button>
                    </div>
                </div>

                {/* DYNAMIC ROLE INSTRUCTION SECTIONS */}

                {/* 1. ADMIN ROLE INSTRUCTION */}
                {activeRoleView === 'admin' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Mandatory Header as instructed */}
                        <div className="p-6 rounded-2xl bg-red-950/20 border-2 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)] relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-red-950 text-red-400 border border-red-800 uppercase font-bold">
                                        AKSES SUPER ADMINISTRATOR
                                    </span>
                                    <h2 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                                        Panduan Setup Keyword & Manajemen Tim
                                    </h2>
                                    <p className="text-sm text-slate-300 max-w-2xl">
                                        Sebagai Administrator Utama, Anda memegang kendali penuh atas parameter crawling media sosial, 
                                        database target politik Kabupaten Ketapang, serta distribusi hak akses tim relawan & analis.
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-500/60 flex items-center justify-center shrink-0">
                                    <Shield className="w-6 h-6 text-red-400" />
                                </div>
                            </div>
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
                                    Definisikan nama paslon, tokoh kunci, isu sensitif daerah (misal: infrastruktur jalan Ketapang, sengketa lahan, harga komoditas sawit), serta akun-akun oposisi yang wajib dipantau 24/7.
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
                                    Alokasikan akun operasional untuk Timses (analis isu lapangan) dan Influencer (tim produksi narasi). Pantau riwayat login dan pastikan keamanan kredensial tetap terjaga.
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
                                    Engine: Hermes Agent API
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
                                    <span>Perbarui kamus istilah lokal / dialek Ketapang yang sering dipakai warganet di grup Facebook daerah.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    <span>Review draft counter-narrative sebelum diteruskan ke dashboard Influencer.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* 2. TIMSES ROLE INSTRUCTION */}
                {activeRoleView === 'timses' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Mandatory Header as instructed */}
                        <div className="p-6 rounded-2xl bg-emerald-950/20 border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase font-bold">
                                        AKSES TIMSES & ANALIS LAPANGAN
                                    </span>
                                    <h2 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                                        Panduan Membaca Radar, Analisis Isu, dan Notifikasi
                                    </h2>
                                    <p className="text-sm text-slate-300 max-w-2xl">
                                        Panduan praktis bagi Tim Sukses untuk memantau pergerakan isu di akar rumput digital, 
                                        mendeteksi narasi serangan politik lawan, serta merespon peringatan dini secara akurat.
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
                                    Perhatikan lonjakan volume penyebutan tokoh di media online lokal dan media sosial. Titik merah mengindikasikan serangan isu negatif, titik hijau menunjukkan sentimen apresiasi publik.
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
                                    Kelompokkan isu ke dalam 3 level urgensi: Hoaks Murni (perlu klarifikasi fakta resmi), Kritik Kebijakan (perlu narasi solusi), atau Serangan Personal (cukup reframing santai).
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
                                    Setiap notifikasi merah wajib diverifikasi dalam 15 menit. Jika isu berpotensi viral, kirim instruksi ke modul 1-Click Script agar tim lapangan memiliki bahan counter bicara seragam.
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
                                    <div className="text-slate-300 text-[11px]">Terima Peringatan Notifikasi Isu</div>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                                    <div className="text-cyan-400 font-bold mb-1">LANGKAH 2</div>
                                    <div className="text-slate-300 text-[11px]">Analisis Sumber & Sebaran Aktor</div>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                                    <div className="text-cyan-400 font-bold mb-1">LANGKAH 3</div>
                                    <div className="text-cyan-400 font-bold mb-1">Validasi Fakta Bersama Jubir</div>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                                    <div className="text-emerald-400 font-bold mb-1">LANGKAH 4</div>
                                    <div className="text-emerald-300 text-[11px]">Forward ke Studio Influencer</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. INFLUENCER ROLE INSTRUCTION */}
                {activeRoleView === 'influencer' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Mandatory Header as instructed */}
                        <div className="p-6 rounded-2xl bg-teal-950/20 border-2 border-teal-500/50 shadow-[0_0_30px_rgba(20,184,166,0.15)] relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-teal-950 text-teal-400 border border-teal-800 uppercase font-bold">
                                        AKSES INFLUENCER & BUZZ STUDIO
                                    </span>
                                    <h2 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                                        Panduan Eksekusi Skrip 1-Click Studio
                                    </h2>
                                    <p className="text-sm text-slate-300 max-w-2xl">
                                        Panduan untuk content creator, influencer relawan, dan buzzer resmi dalam mengeksekusi 
                                        skrip narasi yang dihasilkan AI secara terukur, konsisten, dan siap disebarkan dalam 1 klik.
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
                                    <span>Pilih Nada & Gaya Bahasa</span>
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Pilih template gaya bicara: 'Santai & Jenaka' (untuk TikTok/Reels), 'Empatik & Solutif' (untuk Facebook emak-emak), atau 'Tegas & Berdata' (untuk platform X/Twitter).
                                </p>
                                <div className="pt-2 text-[11px] font-mono text-teal-400">
                                    3 Tone Profilers
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                                <div className="w-8 h-8 rounded-lg bg-teal-950/60 border border-teal-800 flex items-center justify-center text-teal-400 font-mono font-bold text-sm">
                                    02
                                </div>
                                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-teal-400" />
                                    <span>1-Click Copy Skrip Siap Rilis</span>
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Klik tombol 'Salin Skrip' untuk mendapatkan caption lengkap beserta hashtag strategi pemilu daerah Ketapang yang sudah dioptimasi untuk mendongkrak algoritma engagement.
                                </p>
                                <div className="pt-2 text-[11px] font-mono text-teal-400">
                                    Hashtag Generator Terintegrasi
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                                <div className="w-8 h-8 rounded-lg bg-teal-950/60 border border-teal-800 flex items-center justify-center text-teal-400 font-mono font-bold text-sm">
                                    03
                                </div>
                                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                                    <Share2 className="w-4 h-4 text-teal-400" />
                                    <span>Lapor Distribusi & Jangkauan</span>
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Setelah posting konten di medsos, masukkan tautan postingan ke kolom verifikasi untuk mencatat metrik impresi dan memastikan pesan utama tersampaikan tanpa distorsi.
                                </p>
                                <div className="pt-2 text-[11px] font-mono text-teal-400">
                                    Tracking Link & Reach
                                </div>
                            </div>
                        </div>

                        {/* Influencer Golden Rules */}
                        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs text-slate-300">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-teal-400" />
                                <span>Etika & Doktrin Penyebaran Konten Influencer</span>
                            </h3>
                            <ul className="space-y-2.5">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                                    <span>Dilarang menyebarkan hoaks atau ujaran kebencian berbasis SARA. Selalu reframing isu dengan fakta pembangunan.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                                    <span>Gunakan visual asli daerah Kabupaten Ketapang untuk meningkatkan kedekatan emosional konstituen.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                                    <span>Posting serentak pada 'Golden Hours' (pukul 12.00 - 13.00 WIB dan 19.30 - 21.00 WIB).</span>
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
                        <span>Status: <strong className="text-emerald-400">Slice 2 Terpasang</strong></span>
                        <span className="text-slate-700">|</span>
                        <span>Rilis: <strong className="text-cyan-300">Versi: {appVersion}</strong></span>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
