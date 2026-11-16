import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Share2,
    Copy,
    Check,
    Video,
    Twitter,
    Instagram,
    ShieldAlert,
    Sparkles,
    Flame,
    CheckCircle2,
    ExternalLink,
    Filter,
    Layers,
    FileText,
    ArrowUpRight,
    MessageSquare,
    Eye,
    TrendingUp,
    AlertTriangle,
    ShieldCheck,
    RefreshCw
} from 'lucide-react';

export default function StudioIndex({ newsFeeds = [], stats = {}, filters = {}, currentUserRole = 'influencer' }) {
    const { appVersion = '1.0 (Release Candidate)' } = usePage().props;

    // Filter states
    const [selectedPlatform, setSelectedPlatform] = useState(filters.platform || 'all');
    const [selectedSentiment, setSelectedSentiment] = useState(filters.sentiment || 'all');
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedKey, setCopiedKey] = useState(null);
    const [expandedFacts, setExpandedFacts] = useState({});

    // Clipboard copy handler with 2-second timeout feedback
    const handleCopy = (text, key) => {
        if (!text) return;

        if (navigator?.clipboard?.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                setCopiedKey(key);
                setTimeout(() => {
                    setCopiedKey(null);
                }, 2000);
            }).catch(err => {
                console.error('Clipboard copy failed:', err);
                fallbackCopyText(text, key);
            });
        } else {
            fallbackCopyText(text, key);
        }
    };

    // Fallback for older browsers or restricted iframe environments
    const fallbackCopyText = (text, key) => {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopiedKey(key);
            setTimeout(() => {
                setCopiedKey(null);
            }, 2000);
        } catch (e) {
            console.error('Fallback copy failed:', e);
        }
    };

    const toggleFactExpand = (id) => {
        setExpandedFacts(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Filter news feeds based on active filters
    const filteredFeeds = newsFeeds.filter(feed => {
        // Sentiment filter
        if (selectedSentiment === 'defensive' && feed.sentiment !== 'negative') return false;
        if (selectedSentiment === 'proactive' && !['positive', 'neutral'].includes(feed.sentiment)) return false;

        // Search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const titleMatch = feed.title?.toLowerCase().includes(query);
            const sourceMatch = feed.source?.toLowerCase().includes(query);
            if (!titleMatch && !sourceMatch) return false;
        }

        return true;
    });

    // Helper for velocity badge
    const getVelocityBadge = (score) => {
        const val = parseInt(score, 10) || 0;
        if (val >= 75) {
            return {
                label: `KRITIS ${val}%`,
                bg: 'bg-rose-950/80 text-rose-300 border-rose-500/50',
                dot: 'bg-rose-500 animate-ping',
            };
        }
        if (val >= 40) {
            return {
                label: `WAS PADA ${val}%`,
                bg: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
                dot: 'bg-amber-500',
            };
        }
        return {
            label: `STABIL ${val}%`,
            bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
            dot: 'bg-emerald-500',
        };
    };

    return (
        <AuthenticatedLayout>
            <Head title="1-Click Influencer Content Studio - Radar Politik" />

            <div className="space-y-6">
                {/* Header Banner Command Center */}
                <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/50 border border-cyan-500/30 p-6 overflow-hidden shadow-2xl backdrop-blur-md">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                                    <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
                                    SLICE 6: CONTENT STUDIO & INFLUENCER DISPATCHER
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                                    ROLE: {currentUserRole.toUpperCase()}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-mono font-black text-white tracking-wide flex items-center gap-3">
                                <Share2 className="w-7 h-7 text-cyan-400" />
                                1-CLICK INFLUENCER STUDIO
                            </h1>
                            <p className="text-sm text-slate-400 font-mono mt-1 max-w-2xl">
                                Pusat distribusi naskah counter-krisis dan amplifikasi prestasi siap publikasi untuk tim relawan media, buzzer santun, dan influencer kampanye.
                            </p>
                        </div>

                        {/* Quick Action Navigation */}
                        <div className="flex items-center gap-3 self-start md:self-center">
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-mono text-xs font-bold transition-all shadow-lg"
                            >
                                <Flame className="w-4 h-4 text-rose-400" />
                                <span>Pantau Radar Krisis</span>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
                        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Naskah Siap Rilis</div>
                            <div className="text-xl sm:text-2xl font-mono font-black text-cyan-400 mt-1">
                                {stats.total_scripts || 0}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500">Status Valid AI</div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/70 border border-rose-950/50">
                            <div className="text-[10px] font-mono text-rose-400 uppercase tracking-wider flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3 text-rose-400" />
                                <span>Defensive Reframing</span>
                            </div>
                            <div className="text-xl sm:text-2xl font-mono font-black text-rose-300 mt-1">
                                {stats.defensive_count || 0}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500">Redam Isu Negatif</div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-950/50">
                            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                <span>Proactive Amplifying</span>
                            </div>
                            <div className="text-xl sm:text-2xl font-mono font-black text-emerald-300 mt-1">
                                {stats.proactive_count || 0}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500">Amplifikasi Prestasi</div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/70 border border-amber-950/50">
                            <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                <Flame className="w-3 h-3 text-amber-400" />
                                <span>Krisis Terpanas</span>
                            </div>
                            <div className="text-xl sm:text-2xl font-mono font-black text-amber-300 mt-1">
                                {stats.high_crisis_count || 0}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500">Skor Velocity ≥ 75%</div>
                        </div>
                    </div>
                </div>

                {/* Filter and Control Bar */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 font-mono text-xs">
                    {/* Platform Selector Tabs */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto">
                        <span className="text-slate-500 px-2 text-[11px] font-bold hidden sm:inline">PLATFORM:</span>
                        <button
                            type="button"
                            onClick={() => setSelectedPlatform('all')}
                            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                                selectedPlatform === 'all'
                                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            Semua (3 Kanal)
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedPlatform('tiktok')}
                            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 ${
                                selectedPlatform === 'tiktok'
                                    ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/50 shadow-sm'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Video className="w-3.5 h-3.5 text-fuchsia-400" />
                            <span>TikTok</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedPlatform('x')}
                            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 ${
                                selectedPlatform === 'x'
                                    ? 'bg-sky-950 text-sky-300 border border-sky-500/50 shadow-sm'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Twitter className="w-3.5 h-3.5 text-sky-400" />
                            <span>X (Twitter)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedPlatform('instagram')}
                            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 ${
                                selectedPlatform === 'instagram'
                                    ? 'bg-pink-950 text-pink-300 border border-pink-500/50 shadow-sm'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Instagram className="w-3.5 h-3.5 text-pink-400" />
                            <span>Instagram</span>
                        </button>
                    </div>

                    {/* Mode Framing & Search */}
                    <div className="flex items-center gap-2">
                        <select
                            value={selectedSentiment}
                            onChange={(e) => setSelectedSentiment(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:border-cyan-500 focus:outline-none"
                        >
                            <option value="all">Semua Strategi Framing</option>
                            <option value="defensive">🛡️ Defensive Reframing (Negatif)</option>
                            <option value="proactive">🚀 Proactive Amplification (Positif)</option>
                        </select>

                        <input
                            type="text"
                            placeholder="Cari isu / topik..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:border-cyan-500 focus:outline-none w-44 sm:w-56"
                        />
                    </div>
                </div>

                {/* News & Scripts Feed List */}
                {filteredFeeds.length === 0 ? (
                    <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-12 text-center font-mono">
                        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-300">Belum Ada Skrip Siap Publikasi</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                            Saat ini belum ada artikel berita berstatus 'success' yang cocok dengan kriteria filter Anda. Jalankan Hermes Gateway untuk menganalisis berita baru.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredFeeds.map((feed) => {
                            const scripts = feed.scripts || {};
                            const factAnchor = feed.fact_anchor || {};
                            const velocity = getVelocityBadge(feed.velocity_score);
                            const isDefensive = feed.sentiment === 'negative';
                            const isFactOpen = !!expandedFacts[feed.id];

                            // Copy all platforms combined
                            const combinedText = `[NARASI KAMPANYE // ${feed.title}]\n\n--- TIKTOK REELS ---\n${scripts.tiktok || '-'}\n\n--- X (TWITTER) ---\n${scripts.x || '-'}\n\n--- INSTAGRAM CAPTION ---\n${scripts.instagram || '-'}`;

                            return (
                                <div
                                    key={feed.id}
                                    className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all overflow-hidden shadow-xl"
                                >
                                    {/* Article Header Card */}
                                    <div className="p-5 border-b border-slate-800/80 bg-slate-950/40">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                            <div className="space-y-1.5 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {/* Velocity badge */}
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${velocity.bg}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${velocity.dot}`}></span>
                                                        {velocity.label}
                                                    </span>

                                                    {/* Strategy Mode Badge */}
                                                    {isDefensive ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
                                                            <ShieldAlert className="w-3 h-3 text-rose-400" />
                                                            DEFENSIVE REFRAMING
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                                                            <Sparkles className="w-3 h-3 text-emerald-400" />
                                                            PROACTIVE AMPLIFICATION
                                                        </span>
                                                    )}

                                                    <span className="text-[11px] font-mono text-slate-400">
                                                        Sumber: <span className="text-slate-200 font-semibold">{feed.source || 'Media Lokal'}</span>
                                                    </span>
                                                    {feed.published_at && (
                                                        <span className="text-[10px] font-mono text-slate-500">
                                                            • {new Date(feed.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    )}
                                                </div>

                                                <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                                                    {feed.title}
                                                </h2>
                                            </div>

                                            {/* Action Header: Toggle Fact & Copy All */}
                                            <div className="flex items-center gap-2 self-start lg:self-center font-mono text-xs">
                                                {factAnchor && (factAnchor.tuduhan || factAnchor.fakta) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleFactExpand(feed.id)}
                                                        className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                                            isFactOpen
                                                                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60'
                                                                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                                                        }`}
                                                    >
                                                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                                                        <span>{isFactOpen ? 'Tutup Konteks Fakta' : 'Cek Konteks Fakta'}</span>
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(combinedText, `${feed.id}-all`)}
                                                    className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                                        copiedKey === `${feed.id}-all`
                                                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                                                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
                                                    }`}
                                                >
                                                    {copiedKey === `${feed.id}-all` ? (
                                                        <>
                                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                            <span>Copied All! ✅</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3.5 h-3.5 text-slate-300" />
                                                            <span>Salin Semua (3 Platform)</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expandable Fact-Anchor Brief for Influencers */}
                                        {isFactOpen && (
                                            <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-cyan-950/80 space-y-3 font-mono text-xs animate-in fade-in duration-200">
                                                <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase text-[10px] tracking-wider">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                                                    <span>Pedoman Fakta Lapangan (Fact-Anchor Intelijen)</span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                                    <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40">
                                                        <div className="text-[10px] text-rose-400 font-bold uppercase mb-1">
                                                            Isu Miring / Tuduhan:
                                                        </div>
                                                        <div className="text-slate-300 leading-relaxed">
                                                            {factAnchor.tuduhan || 'Tidak ada tuduhan spesifik tercatat.'}
                                                        </div>
                                                    </div>

                                                    <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
                                                        <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1">
                                                            Fakta Kejadian Lapangan:
                                                        </div>
                                                        <div className="text-slate-300 leading-relaxed">
                                                            {factAnchor.fakta || 'Fakta lapangan terkonfirmasi valid.'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {factAnchor.dokumen_rujukan && (
                                                    <div className="text-[11px] text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
                                                        <span className="text-cyan-400 font-semibold">Dokumen Rujukan:</span> {factAnchor.dokumen_rujukan}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* 3 Platforms Grid Cards */}
                                    <div className="p-5">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                            {/* 1. TIKTOK CARD */}
                                            {(selectedPlatform === 'all' || selectedPlatform === 'tiktok') && (
                                                <div className="flex flex-col rounded-xl bg-slate-950 border border-fuchsia-950/70 hover:border-fuchsia-500/40 transition-all p-4 shadow-md group">
                                                    {/* Platform Header */}
                                                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                                                        <div className="flex items-center gap-2 font-mono">
                                                            <div className="w-7 h-7 rounded-lg bg-fuchsia-950/60 border border-fuchsia-500/40 flex items-center justify-center">
                                                                <Video className="w-4 h-4 text-fuchsia-400" />
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                                                                    TIKTOK REELS
                                                                </div>
                                                                <div className="text-[9px] text-slate-500 uppercase">
                                                                    Short Video / Hook
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-fuchsia-950/40 text-fuchsia-400 border border-fuchsia-900/50">
                                                            15-60s
                                                        </span>
                                                    </div>

                                                    {/* Script Content */}
                                                    <div className="flex-1 bg-slate-900/60 rounded-lg p-3 border border-slate-800/80 mb-4 font-mono text-xs text-slate-200 leading-relaxed overflow-y-auto max-h-52 whitespace-pre-wrap selection:bg-fuchsia-500 selection:text-white">
                                                        {scripts.tiktok || (
                                                            <span className="text-slate-500 italic">
                                                                Naskah skrip TikTok belum tersedia untuk artikel ini.
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Copy Action Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(scripts.tiktok, `${feed.id}-tiktok`)}
                                                        disabled={!scripts.tiktok}
                                                        className={`w-full py-2.5 px-3 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                                            copiedKey === `${feed.id}-tiktok`
                                                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-[1.02]'
                                                                : 'bg-fuchsia-950/70 hover:bg-fuchsia-900 border border-fuchsia-600/50 text-fuchsia-200 shadow-[0_0_10px_rgba(217,70,239,0.2)]'
                                                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                                                    >
                                                        {copiedKey === `${feed.id}-tiktok` ? (
                                                            <>
                                                                <Check className="w-4 h-4 text-white" />
                                                                <span className="font-black">Copied! ✅</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-4 h-4 text-fuchsia-300" />
                                                                <span>Copy Script TikTok</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}

                                            {/* 2. X / TWITTER CARD */}
                                            {(selectedPlatform === 'all' || selectedPlatform === 'x') && (
                                                <div className="flex flex-col rounded-xl bg-slate-950 border border-sky-950/70 hover:border-sky-500/40 transition-all p-4 shadow-md group">
                                                    {/* Platform Header */}
                                                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                                                        <div className="flex items-center gap-2 font-mono">
                                                            <div className="w-7 h-7 rounded-lg bg-sky-950/60 border border-sky-500/40 flex items-center justify-center">
                                                                <Twitter className="w-4 h-4 text-sky-400" />
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                                                                    X / TWITTER
                                                                </div>
                                                                <div className="text-[9px] text-slate-500 uppercase">
                                                                    Microblog / Thread
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-sky-950/40 text-sky-400 border border-sky-900/50">
                                                            280 Chars
                                                        </span>
                                                    </div>

                                                    {/* Script Content */}
                                                    <div className="flex-1 bg-slate-900/60 rounded-lg p-3 border border-slate-800/80 mb-4 font-mono text-xs text-slate-200 leading-relaxed overflow-y-auto max-h-52 whitespace-pre-wrap selection:bg-sky-500 selection:text-white">
                                                        {scripts.x || (
                                                            <span className="text-slate-500 italic">
                                                                Naskah cuitan X belum tersedia untuk artikel ini.
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Copy Action Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(scripts.x, `${feed.id}-x`)}
                                                        disabled={!scripts.x}
                                                        className={`w-full py-2.5 px-3 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                                            copiedKey === `${feed.id}-x`
                                                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-[1.02]'
                                                                : 'bg-sky-950/70 hover:bg-sky-900 border border-sky-600/50 text-sky-200 shadow-[0_0_10px_rgba(14,165,233,0.2)]'
                                                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                                                    >
                                                        {copiedKey === `${feed.id}-x` ? (
                                                            <>
                                                                <Check className="w-4 h-4 text-white" />
                                                                <span className="font-black">Copied! ✅</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-4 h-4 text-sky-300" />
                                                                <span>Copy Tweet X</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}

                                            {/* 3. INSTAGRAM CARD */}
                                            {(selectedPlatform === 'all' || selectedPlatform === 'instagram') && (
                                                <div className="flex flex-col rounded-xl bg-slate-950 border border-pink-950/70 hover:border-pink-500/40 transition-all p-4 shadow-md group">
                                                    {/* Platform Header */}
                                                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                                                        <div className="flex items-center gap-2 font-mono">
                                                            <div className="w-7 h-7 rounded-lg bg-pink-950/60 border border-pink-500/40 flex items-center justify-center">
                                                                <Instagram className="w-4 h-4 text-pink-400" />
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors">
                                                                    INSTAGRAM
                                                                </div>
                                                                <div className="text-[9px] text-slate-500 uppercase">
                                                                    Caption & Carousel
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-pink-950/40 text-pink-400 border border-pink-900/50">
                                                            Visual Feed
                                                        </span>
                                                    </div>

                                                    {/* Script Content */}
                                                    <div className="flex-1 bg-slate-900/60 rounded-lg p-3 border border-slate-800/80 mb-4 font-mono text-xs text-slate-200 leading-relaxed overflow-y-auto max-h-52 whitespace-pre-wrap selection:bg-pink-500 selection:text-white">
                                                        {scripts.instagram || (
                                                            <span className="text-slate-500 italic">
                                                                Naskah caption Instagram belum tersedia untuk artikel ini.
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Copy Action Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(scripts.instagram, `${feed.id}-instagram`)}
                                                        disabled={!scripts.instagram}
                                                        className={`w-full py-2.5 px-3 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                                            copiedKey === `${feed.id}-instagram`
                                                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-[1.02]'
                                                                : 'bg-pink-950/70 hover:bg-pink-900 border border-pink-600/50 text-pink-200 shadow-[0_0_10px_rgba(236,72,153,0.2)]'
                                                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                                                    >
                                                        {copiedKey === `${feed.id}-instagram` ? (
                                                            <>
                                                                <Check className="w-4 h-4 text-white" />
                                                                <span className="font-black">Copied! ✅</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-4 h-4 text-pink-300" />
                                                                <span>Copy Caption IG</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
