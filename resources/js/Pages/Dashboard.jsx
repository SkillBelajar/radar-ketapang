import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Activity, ShieldAlert, ShieldCheck, AlertTriangle, Flame, Clock, 
    ExternalLink, Copy, Check, Filter, ArrowUpDown, Layers, Sparkles, 
    Info, Eye, Radio, RefreshCw, Terminal, CheckCircle2, ChevronRight,
    Share2, X, MessageSquare, AlertOctagon, Zap, BarChart3, Newspaper,
    FileText, Mic, Scale, ArrowUpRight, BookOpen
} from 'lucide-react';

/**
 * Velocity Indicator Component
 * >= 75: Merah / Bahaya
 * >= 40: Kuning / Waspada
 * < 40:  Hijau / Aman
 */
function VelocityIndicator({ score }) {
    const numericScore = Math.max(0, Math.min(100, Number(score) || 0));

    let tier = {
        label: 'TENANG / AMAN',
        color: 'emerald',
        badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
        barGradient: 'from-emerald-500 to-teal-400',
        glow: 'shadow-[0_0_12px_rgba(16,185,129,0.3)]',
        dotColor: 'bg-emerald-400',
    };

    if (numericScore >= 75) {
        tier = {
            label: 'SANGAT HANGAT',
            color: 'rose',
            badgeBg: 'bg-rose-950/90 text-rose-300 border-rose-500/60',
            barGradient: 'from-rose-500 via-red-500 to-amber-500',
            glow: 'shadow-[0_0_15px_rgba(244,63,94,0.4)]',
            dotColor: 'bg-rose-400',
        };
    } else if (numericScore >= 40) {
        tier = {
            label: 'MULAI RAMAI',
            color: 'amber',
            badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
            barGradient: 'from-amber-500 to-yellow-400',
            glow: 'shadow-[0_0_12px_rgba(245,158,11,0.3)]',
            dotColor: 'bg-amber-400',
        };
    }

    return (
        <div className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                    <Flame className={`w-3.5 h-3.5 text-${tier.color}-400 animate-pulse`} />
                    <span className="text-[11px] text-slate-300 font-sans">Kecepatan Menyebarnya Isu</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tier.badgeBg} ${tier.glow}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${tier.dotColor} mr-1 animate-ping`}></span>
                        {tier.label}
                    </span>
                    <span className="text-sm font-black text-white">{numericScore}%</span>
                </div>
            </div>

            {/* Visual Gauge Bar */}
            <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-[1px]">
                <div 
                    className={`h-full rounded-full bg-gradient-to-r ${tier.barGradient} transition-all duration-700 ease-out`}
                    style={{ width: `${numericScore}%` }}
                ></div>
            </div>
        </div>
    );
}

/**
 * Script Channel Box with Copy to Clipboard
 */
function ScriptChannelBox({ channel, title, content, modeLabel, modeColor }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!content) return;
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(content);
        } else {
            const ta = document.createElement('textarea');
            ta.value = content;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    if (!content) return null;

    return (
        <div className="rounded-xl bg-slate-950/90 border border-slate-800/80 p-3.5 space-y-2 font-mono group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-bold text-[10px] uppercase">
                        {channel}
                    </span>
                    <span className="text-[11px] text-slate-300 font-medium">{title}</span>
                </div>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 text-[10px] font-bold transition-all cursor-pointer"
                    title="Salin Naskah"
                >
                    {copied ? (
                        <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Tersalin!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                        </>
                    )}
                </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-900/60 rounded-lg p-2.5 border border-slate-800/60 select-all whitespace-pre-wrap">
                {content}
            </p>
        </div>
    );
}

export default function Dashboard({ feeds = [], stats = {}, filters = {}, targetSetup = {}, totalMatching = 0 }) {
    const [selectedFeedForModal, setSelectedFeedForModal] = useState(null);
    const [activeTabPerCard, setActiveTabPerCard] = useState({});

    const PRESS_FORMATS = [
        { id: 'candidate_statement', label: 'Sikap Tokoh', title: 'Pernyataan Sikap Tokoh / Calon Pemimpin' },
        { id: 'social_caption', label: 'Medsos Viral', title: 'Naskah Media Sosial Personal Branding' },
        { id: 'press_release', label: 'Siaran Pers', title: 'Draf Siaran Pers Resmi (5W+1H)' },
        { id: 'spokesperson', label: 'Juru Bicara', title: 'Poin Pernyataan Juru Bicara (Doorstop)' },
        { id: 'editorial_reply', label: 'Hak Jawab', title: 'Lembar Hak Jawab Redaksi (UU Pers)' },
    ];

    const getScriptForFormat = (scripts, formatId) => {
        if (!scripts) return '';
        if (formatId === 'candidate_statement') {
            return scripts.candidate_statement || scripts.candidate_quote || scripts.spokesperson || '';
        }
        if (formatId === 'social_caption') {
            return scripts.social_caption || scripts.instagram || scripts.x || scripts.tiktok || '';
        }
        if (formatId === 'press_release') {
            return scripts.press_release || scripts.instagram || scripts.x || scripts.tiktok || '';
        }
        if (formatId === 'spokesperson') {
            return scripts.spokesperson || scripts.x || scripts.tiktok || '';
        }
        if (formatId === 'editorial_reply') {
            return scripts.editorial_reply || scripts.tiktok || scripts.instagram || '';
        }
        return scripts[formatId] || '';
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        // Clean empty values
        Object.keys(newFilters).forEach(k => {
            if (!newFilters[k]) delete newFilters[k];
        });
        router.get('/dashboard', newFilters, { preserveState: true, preserveScroll: true });
    };

    const getSentimentBadge = (sentiment) => {
        switch (sentiment) {
            case 'negative':
                return {
                    label: 'SENTIMEN NEGATIF',
                    bg: 'bg-rose-950/80 text-rose-300 border-rose-500/50',
                    mode: 'Penjelasan Bertahan / Klarifikasi',
                    modeColor: 'rose',
                };
            case 'positive':
                return {
                    label: 'SENTIMEN POSITIF',
                    bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
                    mode: 'Kabar Baik / Perlu Disebarkan',
                    modeColor: 'emerald',
                };
            default:
                return {
                    label: 'SENTIMEN NETRAL',
                    bg: 'bg-slate-900 text-slate-300 border-slate-700',
                    mode: 'Pemberitaan Berimbang',
                    modeColor: 'cyan',
                };
        }
    };

    return (
        <AuthenticatedLayout header="Papan Pantauan Berita & Tanggapan Cepat">
            <Head title="Papan Pantauan Berita - Radar Politik & Reputasi" />

            <div className="space-y-6">
                {/* Tactical Command Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-cyan-500/30 p-5 md:p-6 shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[11px] font-medium">
                                    <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                                    PEMANTAU BERITA SASARAN POLITIK
                                </span>
                                <span className="text-slate-400 text-xs">
                                    Sumber: <strong className="text-cyan-400">Portal Media Pers & Google News</strong>
                                </span>
                            </div>
                            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                                Papan Pantauan Isu & Berita Terkini
                            </h1>
                            <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
                                Semua berita seputar sasaran politik terkumpul di sini secara otomatis via Hermes. Cek berita mana yang hangat, bandingkan tuduhan dengan fakta sebenarnya, dan gunakan draf jawaban resmi siap pakai.
                            </p>
                            {targetSetup?.candidate_name && (
                                <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                                    <span className="px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/40 text-amber-300 font-semibold flex items-center gap-1.5">
                                        <Sparkles className="w-3 h-3 text-amber-400" />
                                        Personal Branding: <strong>{targetSetup.candidate_name}</strong>
                                    </span>
                                    <span className="text-slate-400 text-[11px]">
                                        ({targetSetup.political_role}) • Dapil: {targetSetup.electoral_district}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Top Action Buttons & Mode Indicator */}
                        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center text-xs">
                            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-emerald-500/40 flex items-center gap-2 shadow-sm font-mono">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                <span className="text-slate-300 font-sans text-xs">Pasokan: <strong className="text-emerald-300 font-bold">Hermes Push-Only</strong></span>
                            </div>

                            <Link
                                href="/studio"
                                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 font-bold transition-all shadow-sm"
                            >
                                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Ruang Media & Pers</span>
                            </Link>

                            <Link
                                href="/target-setup"
                                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
                            >
                                <Radio className="w-3.5 h-3.5 text-slate-400" />
                                <span>Atur Kata Kunci</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Crisis Velocity Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {/* 1. Total Monitored */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Layers className="w-3 h-3 text-cyan-400" />
                            Total Berita
                        </div>
                        <div className="text-xl font-black text-white mt-1">
                            {stats.total_monitored || 0}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Portal Berita Lokal</div>
                    </div>

                    {/* 2. Total Analyzed */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            Sudah Diperiksa
                        </div>
                        <div className="text-xl font-black text-cyan-300 mt-1">
                            {stats.total_analyzed || 0}
                        </div>
                        <div className="text-[10px] text-emerald-400 mt-0.5">Draf Jawaban Siap</div>
                    </div>

                    {/* 3. Critical Danger (>=75) */}
                    <div className="bg-slate-900/90 border border-rose-900/60 rounded-xl p-3.5 bg-rose-950/10">
                        <div className="text-[10px] text-rose-300 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
                            Sangat Hangat
                        </div>
                        <div className="text-xl font-black text-rose-400 mt-1">
                            {stats.critical_count || 0}
                        </div>
                        <div className="text-[10px] text-rose-400/80 mt-0.5">Kecepatan &ge; 75%</div>
                    </div>

                    {/* 4. Warning (40-74) */}
                    <div className="bg-slate-900/90 border border-amber-900/60 rounded-xl p-3.5 bg-amber-950/10">
                        <div className="text-[10px] text-amber-300 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            Mulai Ramai
                        </div>
                        <div className="text-xl font-black text-amber-400 mt-1">
                            {stats.warning_count || 0}
                        </div>
                        <div className="text-[10px] text-amber-400/80 mt-0.5">Kecepatan 40-74%</div>
                    </div>

                    {/* 5. Safe (<40) */}
                    <div className="bg-slate-900/90 border border-emerald-900/60 rounded-xl p-3.5 bg-emerald-950/10">
                        <div className="text-[10px] text-emerald-300 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            Tenang / Aman
                        </div>
                        <div className="text-xl font-black text-emerald-400 mt-1">
                            {stats.safe_count || 0}
                        </div>
                        <div className="text-[10px] text-emerald-400/80 mt-0.5">Kecepatan &lt; 40%</div>
                    </div>

                    {/* 6. Integrity Alert */}
                    <div className="bg-slate-900/90 border border-red-500/50 rounded-xl p-3.5 bg-red-950/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
                        <div className="text-[10px] text-red-300 flex items-center gap-1">
                            <AlertOctagon className="w-3 h-3 text-red-400 animate-pulse" />
                            Perlu Bukti Hukum
                        </div>
                        <div className="text-xl font-black text-red-400 mt-1">
                            {stats.integrity_alert_count || 0}
                        </div>
                        <div className="text-[10px] text-red-300/80 mt-0.5">Tuduhan Berat</div>
                    </div>
                </div>

                {/* Filter and Control Toolbar */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                    {/* Left: Sentiment & Alert Filter Chips */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                            <Filter className="w-3.5 h-3.5 text-cyan-400" />
                            Filter Sentimen:
                        </span>
                        
                        <button
                            type="button"
                            onClick={() => handleFilterChange('sentiment', null)}
                            className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                                !filters.sentiment
                                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 font-bold'
                                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                        >
                            Semua ({stats.total_analyzed || 0})
                        </button>

                        <button
                            type="button"
                            onClick={() => handleFilterChange('sentiment', 'negative')}
                            className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                                filters.sentiment === 'negative'
                                    ? 'bg-rose-950 text-rose-300 border-rose-500/60 font-bold'
                                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                        >
                            Negatif
                        </button>

                        <button
                            type="button"
                            onClick={() => handleFilterChange('sentiment', 'neutral')}
                            className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                                filters.sentiment === 'neutral'
                                    ? 'bg-slate-800 text-slate-200 border-slate-600 font-bold'
                                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                        >
                            Netral
                        </button>

                        <button
                            type="button"
                            onClick={() => handleFilterChange('sentiment', 'positive')}
                            className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                                filters.sentiment === 'positive'
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60 font-bold'
                                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                        >
                            Positif
                        </button>

                        <button
                            type="button"
                            onClick={() => handleFilterChange('alert_only', filters.alert_only ? null : '1')}
                            className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
                                filters.alert_only
                                    ? 'bg-red-950 text-red-200 border-red-500/80 font-bold shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-red-300'
                            }`}
                        >
                            <AlertOctagon className="w-3 h-3 text-red-400" />
                            <span>🚨 Khusus Integrity Alert</span>
                        </button>
                    </div>

                    {/* View Mode Toggle: Spotlight Ranking vs Semua Berita */}
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <button
                            type="button"
                            onClick={() => handleFilterChange('view', 'spotlight')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                (filters.view || 'spotlight') === 'spotlight'
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                            title="Tampilkan hanya ranking berita yang paling disorot (Top 10)"
                        >
                            <Flame className="w-3.5 h-3.5" />
                            <span>🔥 10 Teratas Paling Disorot</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleFilterChange('view', 'all')}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                                filters.view === 'all'
                                    ? 'bg-slate-800 text-cyan-300 border border-slate-700 font-bold'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                            title="Tampilkan seluruh berita yang masuk"
                        >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Semua Berita ({totalMatching || stats.total_analyzed || feeds.length})</span>
                        </button>
                    </div>

                    {/* Right: Sorting Toggle */}
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                            <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                            Urutan:
                        </span>
                        <div className="inline-flex rounded-lg bg-slate-950 border border-slate-800 p-0.5">
                            <button
                                type="button"
                                onClick={() => handleFilterChange('sort', 'velocity')}
                                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                    (filters.sort || 'velocity') === 'velocity'
                                        ? 'bg-rose-950 text-rose-300 font-bold shadow-sm'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                🔥 Krisis Terpanas
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFilterChange('sort', 'recent')}
                                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                    filters.sort === 'recent'
                                        ? 'bg-cyan-950 text-cyan-300 font-bold shadow-sm'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                🕒 Waktu Terbit
                            </button>
                        </div>
                    </div>
                </div>

                {/* Section Header: Spotlight Status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 pb-1">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                            <Flame className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                                <span>{(filters.view || 'spotlight') === 'spotlight' ? 'Ranking Berita Paling Disorot' : 'Daftar Seluruh Berita Masuk'}</span>
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-normal">
                                    {feeds.length} Berita
                                </span>
                            </h2>
                            <p className="text-[11px] text-slate-400">
                                {(filters.view || 'spotlight') === 'spotlight'
                                    ? 'Fokus Utama Posko: Menampilkan 10 berita peringkat teratas dengan skor kecepatan krisis & atensi publik tertinggi yang memerlukan atensi segera.'
                                    : 'Menampilkan seluruh artikel berita portal yang telah disetor dan dianalisis oleh Hermes Agent.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Analyzed Feeds Grid */}
                {feeds.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 font-mono space-y-3">
                        <Newspaper className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                        <h3 className="text-base font-bold text-white">Belum Ada Berita Portal Teranalisis</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                            Menunggu kiriman data dari Hermes Agent. Jalankan skrip patroli atau masukkan prompt ke asisten AI Hermes untuk mulai mengisi papan pantauan posko.
                        </p>
                        <div className="pt-2">
                            <Link
                                href="/user-guide?tab=hermes"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg cursor-pointer"
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Buka Panduan & Token Hermes</span>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {feeds.map((feed, index) => {
                            const sentimentInfo = getSentimentBadge(feed.sentiment);
                            const isIntegrityAlert = feed.ai_status === 'integrity_alert';
                            const factAnchor = typeof feed.fact_anchor === 'string' ? JSON.parse(feed.fact_anchor || '{}') : (feed.fact_anchor || {});
                            const scripts = typeof feed.scripts === 'string' ? JSON.parse(feed.scripts || '{}') : (feed.scripts || {});
                            const activeTab = activeTabPerCard[feed.id] || 'press_release';

                            return (
                                <div 
                                    key={feed.id}
                                    className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl ${
                                        index === 0
                                            ? 'bg-gradient-to-b from-slate-900 to-amber-950/20 border-amber-500/60 ring-1 ring-amber-400/40 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                                            : isIntegrityAlert 
                                            ? 'bg-gradient-to-b from-slate-900 to-red-950/30 border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                                            : feed.velocity_score >= 75
                                            ? 'bg-slate-900/95 border-rose-500/40 hover:border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                                            : 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/40'
                                    }`}
                                >
                                    {/* Card Header */}
                                    <div className="p-5 space-y-4">
                                        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                                            <div className="flex items-center gap-2">
                                                {/* Spotlight Rank Ribbon */}
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider flex items-center gap-1 ${
                                                    index === 0
                                                        ? 'bg-amber-400 text-slate-950 font-extrabold shadow-[0_0_12px_rgba(251,191,36,0.6)] border border-amber-300'
                                                        : index === 1
                                                        ? 'bg-slate-200 text-slate-900 font-extrabold shadow-sm border border-white'
                                                        : index === 2
                                                        ? 'bg-amber-700 text-amber-100 font-bold border border-amber-600'
                                                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                                                }`}>
                                                    {index === 0 ? '🥇 #1 PALING DISOROT' : index === 1 ? '🥈 #2 SOROTAN TINGGI' : index === 2 ? '🥉 #3 PRIORITAS' : `#${index + 1} TERPANTAU`}
                                                </span>

                                                <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-700/80 text-cyan-300 font-bold text-[10px]">
                                                    {feed.source || 'Portal Pers'}
                                                </span>
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${sentimentInfo.bg}`}>
                                                    {sentimentInfo.label}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                <span>
                                                    {new Date(feed.published_at || feed.created_at).toLocaleString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Velocity Indicator */}
                                        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                                            <VelocityIndicator score={feed.velocity_score} />
                                        </div>

                                        {/* News Title with External Link and Direct Action */}
                                        <div className="space-y-2">
                                            <a
                                                href={feed.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-base font-bold text-white hover:text-cyan-300 transition-colors flex items-start justify-between gap-2 group font-sans leading-snug"
                                            >
                                                <span>{feed.title}</span>
                                                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 shrink-0 mt-1" />
                                            </a>

                                            {/* Prominent Direct Source Link Badge */}
                                            <div className="flex items-center gap-2 pt-1 font-mono">
                                                <a
                                                    href={feed.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold transition shadow-sm"
                                                >
                                                    <Newspaper className="w-3 h-3 text-cyan-400" />
                                                    <span>Buka Berita Asli ({feed.source || 'Portal Online'})</span>
                                                    <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                                                </a>
                                            </div>
                                        </div>

                                        {/* 1. INTEGRITY ALERT BANNER (If ai_status == 'integrity_alert') */}
                                        {isIntegrityAlert ? (
                                            <div className="rounded-xl bg-red-950/90 border-2 border-red-500 p-4 space-y-3 font-mono shadow-[0_0_20px_rgba(239,68,68,0.35)] animate-pulse">
                                                <div className="flex items-start gap-3">
                                                    <AlertOctagon className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                                                    <div className="space-y-1">
                                                        <h4 className="text-sm font-bold text-red-200 tracking-wide uppercase">
                                                            🚨 PERINGATAN: TUDUHAN BERAT / PERLU TINDAKAN HUKUM
                                                        </h4>
                                                        <p className="text-xs text-red-200/90 font-sans leading-relaxed">
                                                            Berita ini memuat tuduhan hukum yang serius. Tim disarankan berkoordinasi langsung dengan pimpinan atau penasihat hukum untuk memberikan bantahan formal.
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Hidden narrative notes */}
                                                <div className="pt-2 border-t border-red-900/60 text-[11px] text-red-300 flex items-center justify-between">
                                                    <span>Status: Eskalasi Tim Khusus</span>
                                                    <span className="font-bold underline cursor-pointer" onClick={() => setSelectedFeedForModal(feed)}>
                                                        Lihat Dokumen Rujukan →
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            /* 2. SUCCESS AI OUTPUT: FACT-ANCHOR & NARRATIVE BUILDER */
                                            <div className="space-y-4 pt-1">
                                                {/* Fact-Anchor 2-Column Comparison Grid */}
                                                <div className="rounded-xl bg-slate-950/80 border border-slate-800 overflow-hidden text-xs">
                                                    <div className="px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                                                        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase">
                                                            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                                                            Cek Kebenaran: Tuduhan vs Fakta Lapangan
                                                        </span>
                                                        <span className="text-[10px] text-emerald-400 font-bold">
                                                            Fakta Teruji
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 p-3 gap-3">
                                                        {/* Col 1: Tuduhan / Klaim */}
                                                        <div className="space-y-1">
                                                            <div className="text-[10px] font-bold text-rose-400 flex items-center gap-1 uppercase">
                                                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                                                Tuduhan / Kabar Miring:
                                                            </div>
                                                            <p className="text-xs text-rose-200/90 font-sans leading-relaxed bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/40">
                                                                {factAnchor.tuduhan || factAnchor.claim || 'Belum ada tuduhan spesifik tercatat.'}
                                                            </p>
                                                        </div>

                                                        {/* Col 2: Fakta Lapangan */}
                                                        <div className="space-y-1">
                                                            <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 uppercase">
                                                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                                                Bukti & Fakta Sebenarnya:
                                                            </div>
                                                            <p className="text-xs text-emerald-200/90 font-sans leading-relaxed bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-900/40">
                                                                {factAnchor.fakta_lapangan || factAnchor.fakta || factAnchor.fact || 'Data fakta lapangan telah dikompilasi.'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Dokumen Rujukan Footer */}
                                                    {(factAnchor.dokumen_rujukan || factAnchor.reference) && (
                                                        <div className="px-3.5 py-2 bg-slate-900/40 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1.5">
                                                            <Info className="w-3 h-3 text-cyan-400 shrink-0" />
                                                            <span>Bukti Dokumen: <strong className="text-slate-300">{factAnchor.dokumen_rujukan || factAnchor.reference}</strong></span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Narrative Builder (Press & Media Response Formats) */}
                                                <div className="space-y-2.5">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                                                            <span className="text-xs font-bold text-white uppercase">
                                                                Draf Jawaban Resmi untuk Media & Publik
                                                            </span>
                                                        </div>

                                                        {/* Mode Badge Label */}
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                                                            feed.sentiment === 'negative'
                                                                ? 'bg-rose-950/90 text-rose-300 border-rose-500/50'
                                                                : 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                                                        }`}>
                                                            {feed.sentiment === 'negative' ? '🛡️ Draf Klarifikasi' : '🚀 Draf Berita Positif'}
                                                        </span>
                                                    </div>

                                                    {/* Channel Selector Tabs */}
                                                    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                                                        {PRESS_FORMATS.map((fmt) => (
                                                            <button
                                                                key={fmt.id}
                                                                type="button"
                                                                onClick={() => setActiveTabPerCard({ ...activeTabPerCard, [feed.id]: fmt.id })}
                                                                className={`flex-1 py-1.5 px-2 rounded-lg text-center font-bold text-[11px] uppercase transition-all cursor-pointer ${
                                                                    activeTab === fmt.id
                                                                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm'
                                                                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                                                                }`}
                                                            >
                                                                {fmt.label}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {/* Active Script Content */}
                                                    {(() => {
                                                        const activeFmt = PRESS_FORMATS.find(f => f.id === activeTab) || PRESS_FORMATS[0];
                                                        const scriptText = getScriptForFormat(scripts, activeFmt.id);

                                                        return (
                                                            <ScriptChannelBox
                                                                channel={activeFmt.label.toUpperCase()}
                                                                title={activeFmt.title}
                                                                content={scriptText || 'Draf jawaban resmi sedang disiapkan.'}
                                                                modeLabel={sentimentInfo.mode}
                                                                modeColor={sentimentInfo.modeColor}
                                                            />
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Action Footer */}
                                    <div className="px-5 py-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs">
                                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                                            <span>Kondisi Berita: <strong className="text-cyan-300">
                                                {feed.ai_status === 'integrity_alert' ? 'Perlu Bukti Hukum' : (feed.ai_status === 'success' ? 'Sudah Diperiksa' : 'Menunggu')}
                                            </strong></span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setSelectedFeedForModal(feed)}
                                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 font-bold transition-all cursor-pointer"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>Lihat Ringkasan Lengkap</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* MODAL: Full Intelligence Detail Modal */}
                {selectedFeedForModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                        <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-cyan-500/50 p-6 shadow-2xl space-y-6">
                            {/* Modal Header */}
                            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                                <div className="space-y-1 flex-1 pr-4">
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="px-2.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-cyan-300 font-bold">
                                            {selectedFeedForModal.source || 'Portal Berita'}
                                        </span>
                                        <span className="text-slate-400">
                                            ID #{selectedFeedForModal.id}
                                        </span>
                                    </div>
                                    <h2 className="text-lg font-bold text-white font-sans leading-snug">
                                        {selectedFeedForModal.title}
                                    </h2>

                                    {/* Direct Link to News in Modal */}
                                    <div className="pt-2">
                                        <a
                                            href={selectedFeedForModal.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-bold transition"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            <span>Buka Sumber Berita Asli ({selectedFeedForModal.source})</span>
                                        </a>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedFeedForModal(null)}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Velocity & Status Bar */}
                            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                                <VelocityIndicator score={selectedFeedForModal.velocity_score} />
                            </div>

                            {/* Modal Content Logic */}
                            {selectedFeedForModal.ai_status === 'integrity_alert' ? (
                                <div className="p-5 rounded-xl bg-red-950/90 border-2 border-red-500 space-y-3">
                                    <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
                                        <AlertOctagon className="w-5 h-5 text-red-400" />
                                        <span>PERINGATAN: TUDUHAN BERAT / BUTUH PENANGANAN KHUSUS</span>
                                    </div>
                                    <p className="text-xs text-red-100 font-sans leading-relaxed">
                                        Berita ini memuat isu hukum yang serius. Disarankan membawa bukti dokumen fisik dan melibatkan tim advokasi hukum sebelum memberikan tanggapan terbuka.
                                    </p>
                                    <div className="pt-2 text-xs text-red-300 space-y-1">
                                        <div>Tuduhan / Isu Miring: <span className="text-white">{selectedFeedForModal.fact_anchor?.tuduhan || 'Pencatutan nama lembaga resmi'}</span></div>
                                        <div>Fakta Lapangan: <span className="text-white">{selectedFeedForModal.fact_anchor?.fakta_lapangan || 'Klarifikasi resmi lembaga'}</span></div>
                                        <div>Bukti Dokumen: <span className="text-white">{selectedFeedForModal.fact_anchor?.dokumen_rujukan || 'Rilis Pers'}</span></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {/* Fact Anchor Details */}
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                                            <ShieldAlert className="w-4 h-4 text-cyan-400" />
                                            Perbandingan Fakta Lapangan vs Tuduhan
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans text-xs">
                                            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/50 space-y-1">
                                                <div className="text-[10px] font-bold text-rose-400 uppercase">
                                                    Kabar Miring / Tuduhan:
                                                </div>
                                                <div className="text-rose-100 leading-relaxed">
                                                    {selectedFeedForModal.fact_anchor?.tuduhan || selectedFeedForModal.fact_anchor?.claim || 'Tidak ada data tuduhan.'}
                                                </div>
                                            </div>
                                            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-900/50 space-y-1">
                                                <div className="text-[10px] font-bold text-emerald-400 uppercase">
                                                    Bukti & Fakta Lapangan Sebenarnya:
                                                </div>
                                                <div className="text-emerald-100 leading-relaxed">
                                                    {selectedFeedForModal.fact_anchor?.fakta_lapangan || selectedFeedForModal.fact_anchor?.fakta || 'Tidak ada data fakta lapangan.'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* All Scripts Multi-Channel */}
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                                            <Sparkles className="w-4 h-4 text-cyan-400" />
                                            Draf Jawaban Resmi untuk Media Pers & Publik
                                        </h3>
                                        <div className="space-y-3">
                                            {PRESS_FORMATS.map((fmt) => (
                                                <ScriptChannelBox
                                                    key={fmt.id}
                                                    channel={fmt.label.toUpperCase()}
                                                    title={fmt.title}
                                                    content={getScriptForFormat(selectedFeedForModal.scripts, fmt.id)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Modal Close Button */}
                            <div className="border-t border-slate-800 pt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setSelectedFeedForModal(null)}
                                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
                                >
                                    Tutup Tampilan
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
