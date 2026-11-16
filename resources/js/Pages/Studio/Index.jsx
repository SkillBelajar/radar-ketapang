import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Share2,
    Copy,
    Check,
    Flame,
    ShieldAlert,
    Sparkles,
    Search,
    ShieldCheck,
    Eye,
    ExternalLink,
    Newspaper,
    Mic,
    Scale,
    FileText,
    ArrowUpRight,
} from 'lucide-react';

export default function StudioIndex({ newsFeeds = [], stats = {}, filters = {}, currentUserRole = 'influencer' }) {
    const [selectedPlatform, setSelectedPlatform] = useState(filters.platform || 'all'); // 'all', 'press_release', 'spokesperson', 'editorial_reply'
    const [selectedSentiment, setSelectedSentiment] = useState(filters.sentiment || 'all'); // 'all', 'defensive', 'proactive'
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedKey, setCopiedKey] = useState(null); // format: `${feedId}-${formatKey}`
    const [expandedFacts, setExpandedFacts] = useState({});

    // Helper safely extracting journalistic press scripts
    const getScript = (scripts, key) => {
        if (!scripts) return '';
        if (key === 'press_release') {
            return scripts.press_release || scripts.instagram || scripts.x || scripts.tiktok || '';
        }
        if (key === 'spokesperson') {
            return scripts.spokesperson || scripts.x || scripts.tiktok || '';
        }
        if (key === 'editorial_reply') {
            return scripts.editorial_reply || scripts.tiktok || scripts.instagram || '';
        }
        return scripts[key] || '';
    };

    // Copy handler with 2 seconds visual feedback
    const handleCopy = (text, key) => {
        if (!text) return;
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                setCopiedKey(key);
                setTimeout(() => {
                    setCopiedKey(null);
                }, 2000);
            }).catch(() => {
                fallbackCopyText(text, key);
            });
        } else {
            fallbackCopyText(text, key);
        }
    };

    // Fallback copy for older browsers or restricted iframe environments
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
                label: `SANGAT HANGAT ${val}%`,
                bg: 'bg-rose-950/80 text-rose-300 border-rose-500/50',
                dot: 'bg-rose-500 animate-ping',
            };
        }
        if (val >= 40) {
            return {
                label: `MULAI RAMAI ${val}%`,
                bg: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
                dot: 'bg-amber-500',
            };
        }
        return {
            label: `TENANG ${val}%`,
            bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
            dot: 'bg-emerald-500',
        };
    };

    return (
        <AuthenticatedLayout header="Ruang Draf Tanggapan Media & Pers">
            <Head title="Ruang Tanggapan Media & Pers - Radar Politik Ketapang" />

            <div className="space-y-6">
                {/* Header Banner Command Center */}
                <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/50 border border-cyan-500/30 p-6 overflow-hidden shadow-2xl backdrop-blur-md">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                                    <Sparkles className="w-3 h-3 text-cyan-400" />
                                    DRAF SIAP PAKAI UNTUK WARTAWAN & MEDIA
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                                    Peran: {currentUserRole === 'influencer' ? 'Tim Media & Pers' : (currentUserRole === 'admin' ? 'Pengelola Utama' : 'Pemantau Isu')}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide flex items-center gap-3">
                                <Share2 className="w-7 h-7 text-cyan-400" />
                                Ruang Tanggapan Media & Pers
                            </h1>
                            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                                Kumpulan draf tulisan resmi siap salin dan kirim ke media lokal Ketapang: siaran pers lengkap, poin bicara saat diwawancarai wartawan, hingga surat hak jawab resmi jika ada berita keliru.
                            </p>
                        </div>

                        {/* Quick Action Navigation */}
                        <div className="flex items-center gap-3 self-start md:self-center">
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-lg"
                            >
                                <Flame className="w-4 h-4 text-rose-400" />
                                <span>Kembali ke Radar Berita</span>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
                        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Draf Siap Pakai</div>
                            <div className="text-xl sm:text-2xl font-black text-cyan-400 mt-1">
                                {stats.total_scripts || 0}
                            </div>
                            <div className="text-[10px] text-slate-400">Siap Diterbitkan</div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/70 border border-rose-950/50">
                            <div className="text-[10px] text-rose-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3 text-rose-400" />
                                <span>Draf Klarifikasi</span>
                            </div>
                            <div className="text-xl sm:text-2xl font-black text-rose-300 mt-1">
                                {stats.defensive_count || 0}
                            </div>
                            <div className="text-[10px] text-slate-400">Menjawab Isu Miring</div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-950/50">
                            <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                <span>Draf Kabar Positif</span>
                            </div>
                            <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">
                                {stats.proactive_count || 0}
                            </div>
                            <div className="text-[10px] text-slate-400">Pemberitaan Baik / Prestasi</div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/70 border border-amber-950/50">
                            <div className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                                <Flame className="w-3 h-3 text-amber-400" />
                                <span>Isu Paling Ramai</span>
                            </div>
                            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
                                {stats.high_crisis_count || 0}
                            </div>
                            <div className="text-[10px] text-slate-400">Kecepatan &ge; 75%</div>
                        </div>
                    </div>
                </div>

                {/* Filter and Control Bar */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 text-xs">
                    {/* Platform Selector Tabs */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto">
                        <span className="text-slate-400 px-2 text-[11px] font-semibold hidden sm:inline">PILIH FORMAT:</span>
                        <button
                            type="button"
                            onClick={() => setSelectedPlatform('all')}
                            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                                selectedPlatform === 'all'
                                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            Semua (3 Format)
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedPlatform('press_release')}
                            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 ${
                                selectedPlatform === 'press_release'
                                    ? 'bg-blue-950 text-blue-300 border border-blue-500/50 shadow-sm'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <FileText className="w-3.5 h-3.5 text-blue-400" />
                            <span>1. Siaran Pers</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedPlatform('spokesperson')}
                            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 ${
                                selectedPlatform === 'spokesperson'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-500/50 shadow-sm'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Mic className="w-3.5 h-3.5 text-amber-400" />
                            <span>2. Poin Bicara Jubir</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedPlatform('editorial_reply')}
                            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 ${
                                selectedPlatform === 'editorial_reply'
                                    ? 'bg-teal-950 text-teal-300 border border-teal-500/50 shadow-sm'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Scale className="w-3.5 h-3.5 text-teal-400" />
                            <span>3. Hak Jawab Redaksi</span>
                        </button>
                    </div>

                    {/* Secondary Filters & Search */}
                    <div className="flex items-center gap-3">
                        {/* Sentiment Pills */}
                        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                            <button
                                type="button"
                                onClick={() => setSelectedSentiment('all')}
                                className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                                    selectedSentiment === 'all'
                                        ? 'bg-slate-800 text-white'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Semua Isu
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedSentiment('defensive')}
                                className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                                    selectedSentiment === 'defensive'
                                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                                        : 'text-slate-400 hover:text-rose-300'
                                }`}
                            >
                                Klarifikasi Isu
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedSentiment('proactive')}
                                className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                                    selectedSentiment === 'proactive'
                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                        : 'text-slate-400 hover:text-emerald-300'
                                }`}
                            >
                                Kabar Positif
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative flex-1 sm:w-48">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Cari judul/portal..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                    </div>
                </div>

                {/* News Feeds with Script Dispatcher */}
                {filteredFeeds.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 font-mono">
                        <Newspaper className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <div className="text-white font-bold text-base">Tidak ada draf respon media yang sesuai filter</div>
                        <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
                            Tarik berita portal terbaru melalui menu Dasbor atau sesuaikan kata kunci pemantauan di Target Setup.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredFeeds.map(feed => {
                            const scripts = typeof feed.scripts === 'string' ? JSON.parse(feed.scripts || '{}') : (feed.scripts || {});
                            const factAnchor = typeof feed.fact_anchor === 'string' ? JSON.parse(feed.fact_anchor || '{}') : (feed.fact_anchor || {});
                            const velocity = getVelocityBadge(feed.velocity_score);
                            const isFactOpen = expandedFacts[feed.id];

                            const pressScript = getScript(scripts, 'press_release');
                            const spokesScript = getScript(scripts, 'spokesperson');
                            const replyScript = getScript(scripts, 'editorial_reply');

                            // Text for Copy All (3 Formats)
                            const combinedText = `=== DRAF RESPON MEDIA RESMI ===\nISU: ${feed.title}\nPORTAL SUMBER: ${feed.source} (${feed.url})\n\n[1. SIARAN PERS RESMI]\n${pressScript}\n\n[2. PERNYATAAN JURU BICARA (DOORSTOP)]\n${spokesScript}\n\n[3. LEMBAR HAK JAWAB REDAKSI (UU PERS NO. 40/1999)]\n${replyScript}`;

                            return (
                                <div
                                    key={feed.id}
                                    className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl hover:border-slate-700 transition-all"
                                >
                                    {/* News Header Bar with Direct Link to Source */}
                                    <div className="p-5 border-b border-slate-800 bg-slate-950/60">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {/* Velocity Badge */}
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${velocity.bg}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${velocity.dot}`}></span>
                                                        {velocity.label}
                                                    </span>

                                                    {/* Sentiment Strategy Badge */}
                                                    {feed.sentiment === 'negative' ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-rose-950/60 text-rose-300 border border-rose-800/50 font-semibold">
                                                            <ShieldAlert className="w-3 h-3" />
                                                            KLARIFIKASI ISU
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 font-semibold">
                                                            <Sparkles className="w-3 h-3" />
                                                            KABAR BAIK / PRESTASI
                                                        </span>
                                                    )}

                                                    {/* Source Portal Badge with Direct Link */}
                                                    <span className="text-xs text-slate-400">
                                                        Portal Berita: <strong className="text-cyan-300 font-semibold">{feed.source || 'Media Online'}</strong>
                                                    </span>
                                                    {feed.published_at && (
                                                        <span className="text-[10px] text-slate-500">
                                                            • {new Date(feed.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Title with Clickable Link to Original News */}
                                                <div>
                                                    <a
                                                        href={feed.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-base sm:text-lg font-bold text-white hover:text-cyan-300 leading-snug transition-colors inline-flex items-start gap-2 group"
                                                    >
                                                        <span>{feed.title}</span>
                                                        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 shrink-0 mt-1" />
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Action Header: Open Link, Toggle Fact & Copy All */}
                                            <div className="flex flex-wrap items-center gap-2 self-start lg:self-center text-xs">
                                                {/* Tautan Sumber Berita Resmi */}
                                                <a
                                                    href={feed.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                                                    title="Buka artikel langsung di portal berita aslinya"
                                                >
                                                    <span>Buka Sumber Asli</span>
                                                    <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                                                </a>

                                                {/* Fact-Anchor Toggle */}
                                                {factAnchor && (factAnchor.tuduhan || factAnchor.claim || factAnchor.fakta || factAnchor.fact) && (
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
                                                        <span>{isFactOpen ? 'Tutup Fakta' : 'Lihat Fakta Kejadian'}</span>
                                                    </button>
                                                )}

                                                {/* Copy All 3 Formats */}
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
                                                            <span>Tersalin Semua! ✅</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3.5 h-3.5 text-slate-300" />
                                                            <span>Salin 3 Format Sekaligus</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expandable Fact-Anchor Brief */}
                                        {isFactOpen && (
                                            <div className="mt-4 p-4 rounded-xl bg-slate-950/90 border border-cyan-950/80 space-y-3 text-xs animate-in fade-in duration-200">
                                                <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase text-[10px] tracking-wider">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                                                    <span>Rujukan Fakta Lapangan Sebenarnya</span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                                    <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40">
                                                        <div className="text-[10px] text-rose-400 font-bold uppercase mb-1">
                                                            Kabar Miring / Tuduhan di Berita:
                                                        </div>
                                                        <div className="text-slate-300 leading-relaxed">
                                                            {factAnchor.tuduhan || factAnchor.claim || 'Tidak ada tuduhan spesifik tercatat.'}
                                                        </div>
                                                    </div>

                                                    <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
                                                        <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1">
                                                            Fakta Lapangan Terkonfirmasi:
                                                        </div>
                                                        <div className="text-slate-300 leading-relaxed">
                                                            {factAnchor.fakta || factAnchor.fact || 'Fakta lapangan terkonfirmasi valid.'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {(factAnchor.dokumen_rujukan || factAnchor.reference) && (
                                                    <div className="text-[11px] text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
                                                        <span className="text-cyan-400 font-semibold">Dokumen / Bukti Rujukan:</span> {factAnchor.dokumen_rujukan || factAnchor.reference}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* 3 Journalistic Formats Grid Cards */}
                                    <div className="p-5">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                            {/* 1. SIARAN PERS RESMI */}
                                            {(selectedPlatform === 'all' || selectedPlatform === 'press_release') && (
                                                <div className="flex flex-col rounded-xl bg-slate-950 border border-blue-950/70 hover:border-blue-500/40 transition-all p-4 shadow-md group">
                                                    {/* Header */}
                                                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                                                        <div className="flex items-center gap-2 font-mono">
                                                            <div className="w-7 h-7 rounded-lg bg-blue-950/60 border border-blue-500/40 flex items-center justify-center">
                                                                <FileText className="w-4 h-4 text-blue-400" />
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                                                                    SIARAN PERS RESMI
                                                                </div>
                                                                <div className="text-[9px] text-slate-500 uppercase">
                                                                    Rilis Media / 5W+1H
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-950/40 text-blue-400 border border-blue-900/50">
                                                            Format Dokumen
                                                        </span>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 bg-slate-900/60 rounded-lg p-3 border border-slate-800/80 mb-4 font-mono text-xs text-slate-200 leading-relaxed overflow-y-auto max-h-56 whitespace-pre-wrap selection:bg-blue-500 selection:text-white">
                                                        {pressScript || (
                                                            <span className="text-slate-500 italic">
                                                                Draf siaran pers resmi belum tersedia untuk artikel ini.
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Copy Action Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(pressScript, `${feed.id}-press`)}
                                                        disabled={!pressScript}
                                                        className={`w-full py-2.5 px-3 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                                            copiedKey === `${feed.id}-press`
                                                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-[1.02]'
                                                                : 'bg-blue-950/70 hover:bg-blue-900 border border-blue-600/50 text-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                                                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                                                    >
                                                        {copiedKey === `${feed.id}-press` ? (
                                                            <>
                                                                <Check className="w-4 h-4 text-white" />
                                                                <span className="font-black">Copied! ✅</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-4 h-4 text-blue-300" />
                                                                <span>Salin Siaran Pers</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}

                                            {/* 2. PERNYATAAN JURU BICARA */}
                                            {(selectedPlatform === 'all' || selectedPlatform === 'spokesperson') && (
                                                <div className="flex flex-col rounded-xl bg-slate-950 border border-amber-950/70 hover:border-amber-500/40 transition-all p-4 shadow-md group">
                                                    {/* Header */}
                                                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                                                        <div className="flex items-center gap-2 font-mono">
                                                            <div className="w-7 h-7 rounded-lg bg-amber-950/60 border border-amber-500/40 flex items-center justify-center">
                                                                <Mic className="w-4 h-4 text-amber-400" />
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                                                                    PERNYATAAN JURU BICARA
                                                                </div>
                                                                <div className="text-[9px] text-slate-500 uppercase">
                                                                    Doorstop / Poin Bicara
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-900/50">
                                                            Wawancara Pers
                                                        </span>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 bg-slate-900/60 rounded-lg p-3 border border-slate-800/80 mb-4 font-mono text-xs text-slate-200 leading-relaxed overflow-y-auto max-h-56 whitespace-pre-wrap selection:bg-amber-500 selection:text-white">
                                                        {spokesScript || (
                                                            <span className="text-slate-500 italic">
                                                                Poin pernyataan juru bicara belum tersedia untuk artikel ini.
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Copy Action Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(spokesScript, `${feed.id}-spokes`)}
                                                        disabled={!spokesScript}
                                                        className={`w-full py-2.5 px-3 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                                            copiedKey === `${feed.id}-spokes`
                                                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-[1.02]'
                                                                : 'bg-amber-950/70 hover:bg-amber-900 border border-amber-600/50 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                                                    >
                                                        {copiedKey === `${feed.id}-spokes` ? (
                                                            <>
                                                                <Check className="w-4 h-4 text-white" />
                                                                <span className="font-black">Copied! ✅</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-4 h-4 text-amber-300" />
                                                                <span>Salin Kutipan Jubir</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}

                                            {/* 3. LEMBAR HAK JAWAB REDAKSI */}
                                            {(selectedPlatform === 'all' || selectedPlatform === 'editorial_reply') && (
                                                <div className="flex flex-col rounded-xl bg-slate-950 border border-teal-950/70 hover:border-teal-500/40 transition-all p-4 shadow-md group">
                                                    {/* Header */}
                                                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                                                        <div className="flex items-center gap-2 font-mono">
                                                            <div className="w-7 h-7 rounded-lg bg-teal-950/60 border border-teal-500/40 flex items-center justify-center">
                                                                <Scale className="w-4 h-4 text-teal-400" />
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">
                                                                    LEMBAR HAK JAWAB REDAKSI
                                                                </div>
                                                                <div className="text-[9px] text-slate-500 uppercase">
                                                                    UU Pers No. 40/1999
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-teal-950/40 text-teal-400 border border-teal-900/50">
                                                            Klarifikasi Legal
                                                        </span>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 bg-slate-900/60 rounded-lg p-3 border border-slate-800/80 mb-4 font-mono text-xs text-slate-200 leading-relaxed overflow-y-auto max-h-56 whitespace-pre-wrap selection:bg-teal-500 selection:text-white">
                                                        {replyScript || (
                                                            <span className="text-slate-500 italic">
                                                                Lembar hak jawab redaksi belum tersedia untuk artikel ini.
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Copy Action Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(replyScript, `${feed.id}-reply`)}
                                                        disabled={!replyScript}
                                                        className={`w-full py-2.5 px-3 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                                            copiedKey === `${feed.id}-reply`
                                                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-[1.02]'
                                                                : 'bg-teal-950/70 hover:bg-teal-900 border border-teal-600/50 text-teal-200 shadow-[0_0_10px_rgba(20,184,166,0.2)]'
                                                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                                                    >
                                                        {copiedKey === `${feed.id}-reply` ? (
                                                            <>
                                                                <Check className="w-4 h-4 text-white" />
                                                                <span className="font-black">Copied! ✅</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-4 h-4 text-teal-300" />
                                                                <span>Salin Hak Jawab</span>
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
