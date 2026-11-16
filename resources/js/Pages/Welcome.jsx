import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { 
    Radio, Shield, AlertTriangle, TrendingUp, Cpu, 
    Lock, ArrowRight, Zap, Eye, CheckCircle2, Terminal
} from 'lucide-react';

export default function Welcome({ appVersion = '0.15', laravelVersion, phpVersion }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleDummyLogin = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
    };

    return (
        <GuestLayout>
            <Head title="Command Center - Radar Politik & Manajemen Reputasi" />

            <div className="max-w-6xl mx-auto w-full space-y-10">
                {/* Hero Section with Live Radar Graphic & Mission Statement */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                        {/* Status Alert Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                            <span>RADAR AKTIF // MONITORING KABUPATEN KETAPANG</span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                            Radar Politik & <br className="hidden sm:inline" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                                Manajemen Reputasi
                            </span>
                        </h1>

                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
                            Sistem Intelijen Media dan Reframing Opini Publik Otomatis berbasis AI. 
                            Deteksi dini kampanye hitam, pantau sentimen warganet secara real-time, dan rilis 
                            narasi counter-issue instan dalam 1 klik.
                        </p>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 font-mono">
                            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-left">
                                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>CRAWLING STREAM</span>
                                </div>
                                <div className="text-lg font-bold text-white mt-1">Real-time</div>
                                <div className="text-[10px] text-emerald-400 mt-0.5">Autopilot Active</div>
                            </div>

                            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-left">
                                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                    <Cpu className="w-3.5 h-3.5 text-teal-400" />
                                    <span>AI REFRAAMING</span>
                                </div>
                                <div className="text-lg font-bold text-white mt-1">Hermes Engine</div>
                                <div className="text-[10px] text-cyan-400 mt-0.5">1-Click Script ready</div>
                            </div>

                            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-left col-span-2 sm:col-span-1">
                                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>INFRASTRUKTUR</span>
                                </div>
                                <div className="text-lg font-bold text-white mt-1">Laravel Octane</div>
                                <div className="text-[10px] text-teal-400 mt-0.5">PHP 8.4 FrankenPHP</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Visual Radar & Dummy Login Command Center */}
                    <div className="lg:col-span-5">
                        <div className="relative rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-6 sm:p-8 shadow-[0_0_40px_rgba(6,182,212,0.15)] backdrop-blur-xl">
                            {/* Decorative corner glow */}
                            <div className="absolute -top-1 -right-1 w-20 h-20 bg-cyan-500/20 rounded-full blur-xl pointer-events-none"></div>

                            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                                <div>
                                    <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-cyan-400" />
                                        COMMAND CENTER LOGIN
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-0.5">Single-Account Operator Access</p>
                                </div>
                                <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                                    AUTH_V1
                                </span>
                            </div>

                            {submitted && (
                                <div className="mb-4 p-3 rounded-lg bg-cyan-950/80 border border-cyan-500 text-cyan-300 text-xs font-mono flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                                    <span>Slice 1 aktif: Fondasi arsitektur siap. Modul autentikasi lengkap akan dibuka di Slice 2.</span>
                                </div>
                            )}

                            {/* Dummy Login Form */}
                            <form onSubmit={handleDummyLogin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">
                                        Call-Sign / Email Admin
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@radar-ketapang.id"
                                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors font-mono"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">
                                        Kunci Sandi Enkripsi
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors font-mono"
                                        required
                                    />
                                </div>

                                <div className="pt-2">
                                    <a
                                        href="/login"
                                        className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold font-mono text-sm tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-[0.99] cursor-pointer"
                                    >
                                        <span>BUKA PORTAL LOGIN EKSKLUSIF</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </a>
                                </div>
                            </form>

                            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                                <span className="flex items-center gap-1.5">
                                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Single-Account Dedicated</span>
                                </span>
                                <span className="text-cyan-400">Port 8282</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Milestone Roadmap Slice Tracker */}
                <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-cyan-400" />
                            <h3 className="text-sm font-bold font-mono text-white tracking-wider uppercase">
                                Development Roadmap: 8 Slices
                            </h3>
                        </div>
                        <div className="text-xs font-mono text-cyan-400">
                            Current Stage: <span className="text-emerald-400 font-bold">Slice 3 Selesai (Target Setup & Feed Hub)</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 font-mono text-[11px]">
                        {[
                            { id: 1, name: 'Fondasi & Memori', status: 'done' },
                            { id: 2, name: 'Auth Command', status: 'done' },
                            { id: 3, name: 'Target Tracker', status: 'done' },
                            { id: 4, name: 'Autopilot Crawl', status: 'next' },
                            { id: 5, name: 'Hermes AI', status: 'pending' },
                            { id: 6, name: 'In-App Alert', status: 'pending' },
                            { id: 7, name: '1-Click Script', status: 'pending' },
                            { id: 8, name: 'Exec Dashboard', status: 'pending' },
                        ].map((slice) => (
                            <div
                                key={slice.id}
                                className={`p-2.5 rounded-lg border text-center transition-all ${
                                    slice.status === 'done'
                                        ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                                        : slice.status === 'next'
                                        ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-300 animate-pulse'
                                        : 'bg-slate-950/40 border-slate-800 text-slate-500'
                                }`}
                            >
                                <div className="text-[10px] text-slate-400 mb-0.5">S{slice.id}</div>
                                <div className="truncate">{slice.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
