import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Activity, ShieldAlert, ShieldCheck, AlertTriangle, Flame, Clock, 
    ExternalLink, Copy, Check, Filter, ArrowUpDown, Layers, Sparkles, 
    Info, Eye, Radio, RefreshCw, Terminal, CheckCircle2, ChevronRight,
    Share2, X, MessageSquare, AlertOctagon, Zap, BarChart3, Newspaper,
    FileText, Mic, Scale, ArrowUpRight
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
        label: 'AMAN / STABIL',
        color: 'emerald',
        badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
        barGradient: 'from-emerald-500 to-teal-400',
        glow: 'shadow-[0_0_12px_rgba(16,185,129,0.3)]',
        dotColor: 'bg-emerald-400',
    };

    if (numericScore >= 75) {
        tier = {
            label: 'BAHAYA / KRITIS',
            color: 'rose',
            badgeBg: 'bg-rose-950/90 text-rose-300 border-rose-500/60',
            barGradient: 'from-rose-500 via-red-500 to-amber-500',
            glow: 'shadow-[0_0_15px_rgba(244,63,94,0.4)]',
            dotColor: 'bg-rose-400',
        };
    } else if (numericScore >= 40) {
        tier = {
            label: 'WASPADA / SIAGA',
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
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider">Velocity Score</span>
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

export default function Dashboard({ feeds = [], stats = {}, filters = {}, targetSetup = {} }) {
    const [selectedFeedForModal, setSelectedFeedForModal] = useState(null);
    const [activeTabPerCard, setActiveTabPerCard] = useState({});
    const [fetchingNews, setFetchingNews] = useState(false);

    const PRESS_FORMATS = [
        { id: 'press_release', label: 'Siaran Pers', title: 'Draf Siaran Pers Resmi (5W+1H)' },
        { id: 'spokesperson', label: 'Juru Bicara', title: 'Poin Pernyataan Juru Bicara (Doorstop)' },
        { id: 'editorial_reply', label: 'Hak Jawab', title: 'Lembar Hak Jawab Redaksi (UU Pers)' },
    ];

    const getScriptForFormat = (scripts, formatId) => {
        if (!scripts) return '';
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

    const handleFetchNews = () => {
        setFetchingNews(true);
        router.post('/dashboard/fetch', {}, {
            preserveScroll: true,
            onFinish: () => setFetchingNews(false)
        });
    };

    const getSentimentBadge = (sentiment) => {
        switch (sentiment) {
            case 'negative':
                return {
                    label: 'SENTIMEN NEGATIF',
                    bg: 'bg-rose-950/80 text-rose-300 border-rose-500/50',
                    mode: 'Defensive Reframing',
                    modeColor: 'rose',
                };
            case 'positive':
                return {
                    label: 'SENTIMEN POSITIF',
                    bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
                    mode: 'Proactive Amplification',
                    modeColor: 'emerald',
                };
            default:
                return {
                    label: 'SENTIMEN NETRAL',
                    bg: 'bg-slate-900 text-slate-300 border-slate-700',
                    mode: 'Proactive Framing',
                    modeColor: 'cyan',
                };
        }
    };

    return (
        <AuthenticatedLayout header="Dasbor Analisis: Crisis Velocity & AI Output">
            <Head title="Radar Krisis & Dasbor Analisis - Radar Politik" />

            <div className="space-y-6">
                {/* Tactical Command Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-cyan-500/30 p-5 md:p-6 shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-bold">
                                    <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                                    SLICE 5: PORTAL BERITA & CRISIS VELOCITY RADAR
                                </span>
                                <span className="text-slate-400 text-xs font-mono">
                                    Sumber Data: <strong className="text-cyan-400">100% PORTAL BERITA AKTUAL</strong>
                                </span>
                            </div>
                            <h1 className="text-xl md:text-2xl font-black text-white tracking-wide font-mono">
                                Radar Politik & AI Intelligence Pers
                            </h1>
                            <p className="text-slate-300 text-xs md:text-sm max-w-2xl">
                                Monitoring kecepatan eskalasi pemberitaan media online di Kabupaten Ketapang dan Kalbar. Dilengkapi tautan artikel sumber asli, klarifikasi fact-anchor, dan draf respon pers resmi.
                            </p>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center font-mono text-xs">
                            <button
                                type="button"
                                onClick={handleFetchNews}
                                disabled={fetchingNews}
                                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer disabled:opacity-50"
                                title="Tarik berita online terbaru secara aktual"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${fetchingNews ? 'animate-spin' : ''}`} />
                                <span>{fetchingNews ? 'Menarik Berita...' : '⚡ Tarik Berita Aktual'}</span>
                            </button>

                            <Link
                                href="/studio"
                                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 font-bold transition-all shadow-sm"
                            >
                                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Media Studio (S6)</span>
                            </Link>

                            <Link
                                href="/target-setup"
                                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
                            >
                                <Radio className="w-3.5 h-3.5 text-slate-400" />
                                <span>Target Setup (S3)</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Crisis Velocity Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
                    {/* 1. Total Monitored */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Layers className="w-3 h-3 text-cyan-400" />
                            Total Berita
                        </div>
                        <div className="text-xl font-black text-white mt-1">
                            {stats.total_monitored || 0}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Portal Berita Online</div>
                    </div>

                    {/* 2. Total Analyzed */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            Teranalisis AI
                        </div>
                        <div className="text-xl font-black text-cyan-300 mt-1">
                            {stats.total_analyzed || 0}
                        </div>
                        <div className="text-[10px] text-emerald-400 mt-0.5">Respon Pers Siap</div>
                    </div>

                    {/* 3. Critical Danger (>=75) */}
                    <div className="bg-slate-900/90 border border-rose-900/60 rounded-xl p-3.5 bg-rose-950/10">
                        <div className="text-[10px] text-rose-300 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
                            Krisis Bahaya
                        </div>
                        <div className="text-xl font-black text-rose-400 mt-1">
                            {stats.critical_count || 0}
                        </div>
                        <div className="text-[10px] text-rose-400/80 mt-0.5">Velocity ≥ 75%</div>
                    </div>

                    {/* 4. Warning (40-74) */}
                    <div className="bg-slate-900/90 border border-amber-900/60 rounded-xl p-3.5 bg-amber-950/10">
                        <div className="text-[10px] text-amber-300 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            Waspada
                        </div>
                        <div className="text-xl font-black text-amber-400 mt-1">
                            {stats.warning_count || 0}
                        </div>
                        <div className="text-[10px] text-amber-400/80 mt-0.5">Velocity 40-74%</div>
                    </div>

                    {/* 5. Safe (<40) */}
                    <div className="bg-slate-900/90 border border-emerald-900/60 rounded-xl p-3.5 bg-emerald-950/10">
                        <div className="text-[10px] text-emerald-300 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            Aman / Stabil
                        </div>
                        <div className="text-xl font-black text-emerald-400 mt-1">
                            {stats.safe_count || 0}
                        </div>
                        <div className="text-[10px] text-emerald-400/80 mt-0.5">Velocity &lt; 40%</div>
                    </div>

                    {/* 6. Integrity Alert */}
                    <div className="bg-slate-900/90 border border-red-500/50 rounded-xl p-3.5 bg-red-950/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
                        <div className="text-[10px] text-red-300 flex items-center gap-1">
                            <AlertOctagon className="w-3 h-3 text-red-400 animate-pulse" />
                            Integrity Alert
                        </div>
                        <div className="text-xl font-black text-red-400 mt-1">
                            {stats.integrity_alert_count || 0}
                        </div>
                        <div className="text-[10px] text-red-300/80 mt-0.5">Penolakan Mesin AI</div>
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

                {/* Analyzed Feeds Grid */}
                {feeds.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 font-mono space-y-3">
                        <Newspaper className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                        <h3 className="text-base font-bold text-white">Belum Ada Berita Portal Teranalisis</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                            Semua artikel berita portal saat ini masih dalam proses penarikan atau belum memenuhi kriteria filter aktif.
                        </p>
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleFetchNews}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg cursor-pointer"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Tarik Berita Aktual Sekarang</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {feeds.map((feed) => {
                            const sentimentInfo = getSentimentBadge(feed.sentiment);
                            const isIntegrityAlert = feed.ai_status === 'integrity_alert';
                            const factAnchor = typeof feed.fact_anchor === 'string' ? JSON.parse(feed.fact_anchor || '{}') : (feed.fact_anchor || {});
                            const scripts = typeof feed.scripts === 'string' ? JSON.parse(feed.scripts || '{}') : (feed.scripts || {});
                            const activeTab = activeTabPerCard[feed.id] || 'press_release';

                            return (
                                <div 
                                    key={feed.id}
                                    className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl ${
                                        isIntegrityAlert 
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
                                                        <h4 className="text-sm font-black text-red-200 tracking-wide uppercase">
                                                            🚨 PERINGATAN INTEGRITAS (INTEGRITY ALERT)
                                                        </h4>
                                                        <p className="text-xs text-red-200/90 font-sans leading-relaxed">
                                                            AI menolak memproses isu ini karena potensi pelanggaran hukum/etika. Disarankan mengambil langkah legal/klarifikasi formal.
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Hidden narrative notes */}
                                                <div className="pt-2 border-t border-red-900/60 text-[11px] text-red-300 flex items-center justify-between">
                                                    <span>Status: AI Blocked / Escalated</span>
                                                    <span className="font-bold underline cursor-pointer" onClick={() => setSelectedFeedForModal(feed)}>
                                                        Lihat Rujukan Dokumen →
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            /* 2. SUCCESS AI OUTPUT: FACT-ANCHOR & NARRATIVE BUILDER */
                                            <div className="space-y-4 pt-1">
                                                {/* Fact-Anchor 2-Column Comparison Grid */}
                                                <div className="rounded-xl bg-slate-950/80 border border-slate-800 overflow-hidden font-mono text-xs">
                                                    <div className="px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                                                        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase">
                                                            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                                                            Tabel Fact-Anchor (Fakta vs Tuduhan)
                                                        </span>
                                                        <span className="text-[10px] text-emerald-400 font-bold">
                                                            Terverifikasi
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 p-3 gap-3">
                                                        {/* Col 1: Tuduhan / Klaim */}
                                                        <div className="space-y-1">
                                                            <div className="text-[10px] font-bold text-rose-400 flex items-center gap-1 uppercase">
                                                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                                                Tuduhan / Isu Miring:
                                                            </div>
                                                            <p className="text-xs text-rose-200/90 font-sans leading-relaxed bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/40">
                                                                {factAnchor.tuduhan || factAnchor.claim || 'Belum ada tuduhan spesifik tercatat.'}
                                                            </p>
                                                        </div>

                                                        {/* Col 2: Fakta Lapangan */}
                                                        <div className="space-y-1">
                                                            <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 uppercase">
                                                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                                                Fakta Kejadian Lapangan:
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
                                                            <span>Rujukan: <strong className="text-slate-300">{factAnchor.dokumen_rujukan || factAnchor.reference}</strong></span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Narrative Builder (Press & Media Response Formats) */}
                                                <div className="space-y-2.5">
                                                    <div className="flex items-center justify-between font-mono">
                                                        <div className="flex items-center gap-2">
                                                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                                                            <span className="text-xs font-bold text-white uppercase">
                                                                Draf Respon Media & Pers
                                                            </span>
                                                        </div>

                                                        {/* Mode Badge Label */}
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                                                            feed.sentiment === 'negative'
                                                                ? 'bg-rose-950/90 text-rose-300 border-rose-500/50'
                                                                : 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                                                        }`}>
                                                            {feed.sentiment === 'negative' ? '🛡️ Defensive Reframing' : '🚀 Proactive Amplification'}
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
                                                                content={scriptText || 'Draf naskah respon belum dikompilasi oleh mesin AI.'}
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
                                    <div className="px-5 py-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between font-mono text-xs">
                                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                                            <span>AI Status: <strong className="text-cyan-300 uppercase">{feed.ai_status}</strong></span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setSelectedFeedForModal(feed)}
                                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 font-bold transition-all cursor-pointer"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>Rincian Lengkap</span>
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
                                    <div className="flex items-center gap-2 font-mono text-xs">
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
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold transition"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            <span>Buka Sumber Artikel ({selectedFeedForModal.source})</span>
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
                                <div className="p-5 rounded-xl bg-red-950/90 border-2 border-red-500 space-y-3 font-mono">
                                    <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
                                        <AlertOctagon className="w-5 h-5 text-red-400" />
                                        <span>PERINGATAN INTEGRITAS TINGKAT TINGGI</span>
                                    </div>
                                    <p className="text-xs text-red-100 font-sans leading-relaxed">
                                        🚨 AI menolak memproses isu ini karena potensi pelanggaran hukum/etika. Disarankan mengambil langkah legal/klarifikasi formal.
                                    </p>
                                    <div className="pt-2 text-xs text-red-300 space-y-1">
                                        <div>Tuduhan: <span className="text-white">{selectedFeedForModal.fact_anchor?.tuduhan || 'Pencatutan nama lembaga resmi'}</span></div>
                                        <div>Fakta Lapangan: <span className="text-white">{selectedFeedForModal.fact_anchor?.fakta_lapangan || 'Klarifikasi resmi lembaga'}</span></div>
                                        <div>Rujukan: <span className="text-white">{selectedFeedForModal.fact_anchor?.dokumen_rujukan || 'Rilis Pers'}</span></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {/* Fact Anchor Details */}
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                                            <ShieldAlert className="w-4 h-4 text-cyan-400" />
                                            Analisis Fact-Anchor (Fakta vs Tuduhan)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans text-xs">
                                            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/50 space-y-1">
                                                <div className="font-mono text-[10px] font-bold text-rose-400 uppercase">
                                                    Klaim / Tuduhan Isu:
                                                </div>
                                                <div className="text-rose-100 leading-relaxed">
                                                    {selectedFeedForModal.fact_anchor?.tuduhan || selectedFeedForModal.fact_anchor?.claim || 'Tidak ada data tuduhan.'}
                                                </div>
                                            </div>
                                            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-900/50 space-y-1">
                                                <div className="font-mono text-[10px] font-bold text-emerald-400 uppercase">
                                                    Fakta Lapangan Terverifikasi:
                                                </div>
                                                <div className="text-emerald-100 leading-relaxed">
                                                    {selectedFeedForModal.fact_anchor?.fakta_lapangan || selectedFeedForModal.fact_anchor?.fakta || 'Tidak ada data fakta lapangan.'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* All Scripts Multi-Channel */}
                                    <div className="space-y-3 font-mono">
                                        <h3 className="text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                                            <Sparkles className="w-4 h-4 text-cyan-400" />
                                            Draf Respon Media & Komunikasi Pers Resmi
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
                                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
                                >
                                    TUTUP DETAIL
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
