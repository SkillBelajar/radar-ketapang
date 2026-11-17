import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { 
    Radio, Shield, AlertTriangle, TrendingUp, Sparkles, 
    Lock, ArrowRight, Zap, Eye, CheckCircle2, Newspaper,
    FileText, MessageSquare, Check, Users, HelpCircle
} from 'lucide-react';

export default function Welcome({ appVersion = '1.0 (Release Candidate)' }) {
    const [selectedRole, setSelectedRole] = useState('admin');

    const roleExplanations = {
        admin: {
            title: 'Administrator (Ketua / Pengelola Utama)',
            desc: 'Bisa mengatur nama tokoh yang dipantau, kata kunci baik dan buruk, mengelola akun tim, serta melihat seluruh data dan panduan sistem.',
            account: 'admin@radar.com',
            color: 'text-red-400 border-red-500/50 bg-red-950/40'
        },
        timses: {
            title: 'Tim Sukses (Pemantau Lapangan)',
            desc: 'Melihat berita mana yang sedang ramai, membaca apakah isunya positif atau negatif, dan mendapatkan peringatan cepat jika ada isu panas.',
            account: 'timses@radar.com',
            color: 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40'
        },
        influencer: {
            title: 'Tim Media & Juru Bicara (Humas)',
            desc: 'Mendapatkan teks jawaban yang sudah rapi: Siaran Pers untuk wartawan, poin bicara untuk wawancara langsung, dan surat hak jawab resmi.',
            account: 'influencer@radar.com',
            color: 'text-cyan-400 border-cyan-500/50 bg-cyan-950/40'
        }
    };

    return (
        <GuestLayout>
            <Head title="Radar Politik & Personal Branding - Pantau Berita & Jaga Nama Baik Tokoh" />

            <div className="space-y-12 py-4">
                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                        {/* Friendly Tagline */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-medium shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>Platform Intelijen Isu & Personal Branding Politik Multi-Wilayah</span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                            Ketahui Isu Berita Lebih Awal, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                                Jawab Serangan dengan Fakta Nyata.
                            </span>
                        </h1>

                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
                            Aplikasi ini dirancang untuk tim sukses, konsultan politik, dan figur publik di seluruh daerah. 
                            Tugasnya sederhana: <strong>mengumpulkan berita aktual otomatis</strong>, <strong>mengecek kebenaran isu</strong>, 
                            dan <strong>menyiapkan naskah strategis multi-kanal</strong> agar Anda selalu siap menjawab masyarakat, media massa, dan warganet secara percaya diri.
                        </p>

                        {/* 3 Manfaat Nyata (Prinsip Feynman) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
                            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                                    <Newspaper className="w-4 h-4 shrink-0" />
                                    <span>Berita Terkumpul Sendiri</span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-snug">
                                    Tidak perlu repot buka banyak website berita tiap jam. Semua berita lokal otomatis masuk ke sini.
                                </p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                    <span>Tahu Fakta Sebenarnya</span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-snug">
                                    Saat ada kabar miring, sistem langsung memisahkan apa tuduhannya dan apa bukti nyata di lapangan.
                                </p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                                    <FileText className="w-4 h-4 shrink-0" />
                                    <span>Teks Jawaban 1 Klik</span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-snug">
                                    Tinggal salin siaran pers atau poin wawancara untuk wartawan yang sudah siap pakai dalam hitungan detik.
                                </p>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 justify-center lg:justify-start">
                            <Link
                                href="/login"
                                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                            >
                                <span>Masuk ke Aplikasi Sekarang</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>

                            <Link
                                href="/checklist"
                                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium flex items-center justify-center gap-2 transition-all"
                            >
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Coba Langkah Pengujian (UAT)</span>
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Siapa Saja yang Menggunakan? (Penjelasan Peran Sederhana) */}
                    <div className="lg:col-span-5">
                        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-xl space-y-5">
                            <div>
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase font-bold">
                                    PANDUAN HAK AKSES PENGGUNA
                                </span>
                                <h3 className="text-lg font-bold text-white mt-1.5">
                                    Pilih Peran untuk Mencoba:
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Setiap anggota tim punya tugas yang jelas dan mudah dipahami:
                                </p>
                            </div>

                            {/* Role selector tabs */}
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('admin')}
                                    className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all text-center ${
                                        selectedRole === 'admin'
                                            ? 'bg-red-950 text-red-300 border border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                                    }`}
                                >
                                    Admin
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('timses')}
                                    className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all text-center ${
                                        selectedRole === 'timses'
                                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                                    }`}
                                >
                                    Timses
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('influencer')}
                                    className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all text-center ${
                                        selectedRole === 'influencer'
                                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                                    }`}
                                >
                                    Tim Media
                                </button>
                            </div>

                            {/* Active Role Card Explanation */}
                            <div className={`p-4 rounded-xl border space-y-2.5 transition-all ${roleExplanations[selectedRole].color}`}>
                                <div className="text-xs font-bold uppercase tracking-wider">
                                    {roleExplanations[selectedRole].title}
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    {roleExplanations[selectedRole].desc}
                                </p>
                                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                                    <span className="text-slate-400">Akun Contoh:</span>
                                    <strong className="text-white">{roleExplanations[selectedRole].account}</strong>
                                </div>
                            </div>

                            {/* Quick Action to Login */}
                            <div className="pt-2">
                                <Link
                                    href="/login"
                                    className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
                                >
                                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>Buka Halaman Masuk & Pilih Akun Ini</span>
                                    <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                                </Link>
                            </div>

                            <div className="text-center">
                                <span className="text-[11px] text-slate-500">
                                    Kata sandi untuk semua akun contoh: <code className="text-slate-300">password</code>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3 Langkah Mudah Cara Kerja Aplikasi (Feynman Explainer) */}
                <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
                    <div className="text-center max-w-xl mx-auto space-y-2">
                        <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
                            ALUR KERJA SEDERHANA
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold text-white">
                            Bagaimana Aplikasi Ini Membantu Anda Setiap Hari?
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-400">
                            Tidak ada proses rumit. Hanya 3 langkah yang bekerja otomatis di latar belakang:
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Langkah 1 */}
                        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative">
                            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold text-xs flex items-center justify-center">
                                1
                            </div>
                            <h3 className="text-base font-bold text-white">
                                Berita Masuk Otomatis
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Sistem membaca portal berita resmi nasional dan lokal regional secara otomatis sesuai daerah sasaran dan kata kunci yang Anda tentukan di menu Pengaturan Sasaran.
                            </p>
                        </div>

                        {/* Langkah 2 */}
                        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative">
                            <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800 text-amber-400 font-bold text-xs flex items-center justify-center">
                                2
                            </div>
                            <h3 className="text-base font-bold text-white">
                                Dicek: Hangat, Dingin, atau Hoaks?
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Sistem otomatis memberi tanda warna: <strong className="text-emerald-400">Hijau</strong> jika berita bagus, <strong className="text-amber-400">Kuning</strong> jika perlu diperhatikan, dan <strong className="text-red-400">Merah</strong> jika isu sedang panas atau ada fitnah yang perlu segera dijawab.
                            </p>
                        </div>

                        {/* Langkah 3 */}
                        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative">
                            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold text-xs flex items-center justify-center">
                                3
                            </div>
                            <h3 className="text-base font-bold text-white">
                                Naskah Jawaban Siap Dipakai
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Anda langsung mendapatkan 5 format naskah strategis: Pernyataan Sikap Tokoh untuk personal branding, Naskah Medsos Viral, Siaran Pers Resmi, Poin Bicara Juru Bicara, dan Lembar Hak Jawab Dewan Pers.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="text-center text-xs text-slate-500 font-mono">
                    Radar Politik & Personal Branding • Versi {appVersion} • Platform Multi-Wilayah untuk Tokoh Politik, Tim Sukses & Humas
                </div>
            </div>
        </GuestLayout>
    );
}
