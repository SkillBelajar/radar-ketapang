import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ShieldAlert, ArrowLeft, LogOut, CheckCircle2, Lock, Radio, FileText, LayoutDashboard } from 'lucide-react';

export default function Forbidden({ auth, status = 403, module = 'Pengaturan Sasaran', userRole = 'influencer' }) {
    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const roleName = userRole === 'admin' 
        ? 'Pengelola Utama (Admin)' 
        : userRole === 'timses' 
        ? 'Tim Lapangan (Timses)' 
        : 'Tim Media / Juru Bicara (Humas)';

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                    <span className="font-mono text-xs uppercase tracking-wider text-rose-400">
                        KEAMANAN SISTEM // HAK AKSES PENGGUNA (RBAC)
                    </span>
                </div>
            }
        >
            <Head title="Akses Terbatas (HTTP 403) - Radar Ketapang" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Hero 403 Banner */}
                <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-rose-950/40 via-slate-900/90 to-slate-950 border border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.15)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Lock className="w-48 h-48 text-rose-400" />
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 font-mono text-xs font-bold tracking-wider">
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                                STATUS: {status} FORBIDDEN (AKSES DIBATASI)
                            </span>
                            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs">
                                Akun Anda: <strong className="text-amber-400">{roleName}</strong>
                            </span>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                Akses Terbatas (HTTP 403)
                            </h1>
                            <p className="text-base text-rose-200/90 font-medium leading-relaxed">
                                Mohon maaf, halaman <span className="underline decoration-rose-400 font-bold text-white">{module}</span> dikhususkan untuk <strong>Pengelola Utama (Admin)</strong> dan <strong>Tim Lapangan (Timses)</strong>.
                            </p>
                        </div>

                        {/* Feynman Explanation Card */}
                        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2.5 text-xs text-slate-300">
                            <div className="font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                                <Lock className="w-3.5 h-3.5 text-amber-400" />
                                <span>Mengapa Halaman Ini Dibatasi? (Aturan Keamanan Sederhana)</span>
                            </div>
                            <p className="leading-relaxed text-slate-300">
                                Setiap peran dalam tim memiliki meja kerja masing-masing agar fokus dan tidak saling tumpang-tindih:
                            </p>
                            <ul className="space-y-1.5 pl-4 list-disc text-slate-300">
                                <li>
                                    <strong className="text-rose-400">Pengelola Utama (Admin):</strong> Memegang kunci utama sistem, mengelola seluruh pengguna, kata kunci, dan jalannya aplikasi.
                                </li>
                                <li>
                                    <strong className="text-cyan-400">Tim Lapangan (Timses):</strong> Memantau pergerakan berita dan mengatur kata kunci tokoh yang dipantau di Ketapang.
                                </li>
                                <li>
                                    <strong className="text-amber-400">Tim Media (Humas / Juru Bicara):</strong> Difokuskan untuk menyusun siaran pers, pernyataan juru bicara, dan hak jawab di menu <strong>Ruang Media & Pers</strong>.
                                </li>
                            </ul>
                        </div>

                        {/* Quick Action Navigation */}
                        <div className="pt-2 flex flex-wrap items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold transition shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                <span>Buka Papan Berita</span>
                            </Link>

                            <Link
                                href="/studio"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                            >
                                <FileText className="w-4 h-4 text-amber-400" />
                                <span>Buka Ruang Media & Pers</span>
                            </Link>

                            <Link
                                href="/checklist"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 text-xs font-bold transition cursor-pointer"
                            >
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Kembali ke Lembar Pengujian (UAT)</span>
                            </Link>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-200 text-xs font-bold transition cursor-pointer ml-auto"
                            >
                                <LogOut className="w-4 h-4 text-red-300" />
                                <span>Keluar / Ganti Akun</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Card for Testing */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        <span>Hasil Pengujian RBAC: <strong className="text-emerald-300">BERHASIL DIBATASI (403)</strong>. Anda dapat menandai Checklist Langkah 1 selesai.</span>
                    </div>
                    <Link
                        href="/checklist"
                        className="text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-2"
                    >
                        Ke Lembar UAT &rarr;
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
