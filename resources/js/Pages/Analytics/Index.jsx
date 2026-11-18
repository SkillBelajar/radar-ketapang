import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
    BarChart3, TrendingUp, ShieldAlert, ShieldCheck, CheckCircle2,
    AlertTriangle, Sparkles, Activity, FileText, ArrowUpRight,
    ArrowDownRight, Layers, RefreshCw, Cpu, Radio, Eye, Clock
} from 'lucide-react';

export default function AnalyticsIndex({ sentimentTrend = [], auditLogs = {}, sentimentSummary = {} }) {
    const { appVersion = '1.0 (Release Candidate)' } = usePage().props;

    // Chart mode toggle: 'line' vs 'bar' vs 'area'
    const [chartMode, setChartMode] = useState('line');
    // Filter audit trail action
    const [actionFilter, setActionFilter] = useState('all');

    // Safe fallback stats
    const totalProcessed = auditLogs?.totalProcessed || 0;
    const integrityAlertsCount = auditLogs?.integrityAlertsCount || 0;
    const defensiveScriptsCount = auditLogs?.defensiveScriptsCount || 0;
    const proactiveScriptsCount = auditLogs?.proactiveScriptsCount || 0;
    const weeklyCrisisAverted = auditLogs?.weeklyCrisisAverted || 0;
    const criticalIsuCount = auditLogs?.criticalIsuCount || 0;
    const avgVelocity = auditLogs?.avgVelocity || 0;
    const trustIndexScore = auditLogs?.trustIndexScore || 94.2;
    const recentActions = auditLogs?.recentActions || [];

    // Nilai & Evaluasi Tren Sentimen Sasaran Politik
    const summary = sentimentSummary?.targetTopic ? sentimentSummary : (auditLogs?.sentimentSummary || {
        targetTopic: 'Sasaran Politik',
        totalPositive: proactiveScriptsCount,
        totalNegative: defensiveScriptsCount,
        totalNeutral: Math.max(0, totalProcessed - proactiveScriptsCount - defensiveScriptsCount),
        netScore: proactiveScriptsCount - defensiveScriptsCount,
        positivePct: totalProcessed > 0 ? Math.round((proactiveScriptsCount / totalProcessed) * 100) : 0,
        negativePct: totalProcessed > 0 ? Math.round((defensiveScriptsCount / totalProcessed) * 100) : 0,
        neutralPct: totalProcessed > 0 ? Math.round((Math.max(0, totalProcessed - proactiveScriptsCount - defensiveScriptsCount) / totalProcessed) * 100) : 0,
        dominanceStatus: (proactiveScriptsCount - defensiveScriptsCount) > 0 ? 'POSITIF' : (proactiveScriptsCount - defensiveScriptsCount) < 0 ? 'NEGATIF' : 'SEIMBANG',
        dominanceLabel: (proactiveScriptsCount - defensiveScriptsCount) > 0 ? `Topik Sasaran Cenderung Positif (+${proactiveScriptsCount - defensiveScriptsCount})` : `Topik Sasaran Cenderung Negatif (${proactiveScriptsCount - defensiveScriptsCount})`,
        dominanceDescription: 'Rekapitulasi tren nada pemberitaan dari pemindaian harian.',
        dominanceBadgeClass: (proactiveScriptsCount - defensiveScriptsCount) >= 0 ? 'text-emerald-400 bg-emerald-950/80 border-emerald-500/50' : 'text-rose-400 bg-rose-950/80 border-rose-500/50',
    });

    // Filtered actions list
    const filteredActions = recentActions.filter((action) => {
        if (actionFilter === 'all') return true;
        if (actionFilter === 'integrity') return action.action_type === 'INTEGRITY_BLOCK';
        if (actionFilter === 'defensive') return action.action_type === 'DEFENSIVE_REFRAME';
        if (actionFilter === 'proactive') return action.action_type === 'PROACTIVE_AMPLIFY';
        return true;
    });

    // Custom Dark Mode Tooltip for Recharts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dataItem = payload[0]?.payload || {};
            return (
                <div className="bg-slate-950/95 border border-cyan-500/50 rounded-xl p-3.5 shadow-[0_0_20px_rgba(6,182,212,0.3)] font-mono text-xs backdrop-blur-md">
                    <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2 mb-2">
                        <span className="font-bold text-cyan-300">{dataItem.fullLabel || label}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-700 text-slate-300">
                            Total: {dataItem.total || 0} Isu
                        </span>
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-4 text-emerald-400">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                Sentimen Positif:
                            </span>
                            <span className="font-bold">{dataItem.positive || 0}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-rose-400">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                Sentimen Negatif:
                            </span>
                            <span className="font-bold">{dataItem.negative || 0}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                                Sentimen Netral:
                            </span>
                            <span className="font-bold">{dataItem.neutral || 0}</span>
                        </div>
                        {dataItem.integrity > 0 && (
                            <div className="flex items-center justify-between gap-4 text-amber-400 pt-1 border-t border-slate-800/80">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                                    Integrity Block:
                                </span>
                                <span className="font-bold">{dataItem.integrity}</span>
                            </div>
                        )}
                        <div className="pt-2 mt-1 border-t border-slate-800 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Net Shift:</span>
                            <span className={`font-bold ${dataItem.netSentiment >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {dataItem.netSentiment >= 0 ? `+${dataItem.netSentiment}` : dataItem.netSentiment}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <AuthenticatedLayout header="Grafik & Tren Pemberitaan">
            <Head title="Grafik & Tren Berita - Radar Politik & Personal Branding" />

            <div className="space-y-8">
                {/* Header Banner: Mil-Spec Analytics Command */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/40 p-6 sm:p-8 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-950/80 text-purple-300 border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                                    <BarChart3 className="w-3.5 h-3.5" />
                                    GRAFIK & TREN PEMBERITAAN
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300">
                                    <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                                    Pantauan 7 Hari Terakhir
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                                    Skor Kepercayaan: {trustIndexScore}%
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide flex items-center gap-3">
                                <span>Tren Nada Berita & Riwayat Pemeriksaan</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-sans leading-relaxed">
                                Pantau arah pemberitaan media terkait sasaran politik (<span className="text-purple-300 font-bold">{summary.targetTopic}</span>) selama sepekan terakhir. Grafik ini diperbarui otomatis setiap fajar pukul 05:00 WIB via Radar Patroli untuk mengukur pergeseran opini publik secara akurat tanpa duplikasi berita.
                            </p>
                        </div>

                        {/* Quick Action Navigation */}
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-2 transition-all shadow-[0_0_12px_rgba(244,63,94,0.2)]"
                            >
                                <Activity className="w-4 h-4 text-rose-400" />
                                <span>Ke Radar Isu</span>
                            </Link>
                            <Link
                                href="/studio"
                                className="px-3.5 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-800/50 text-purple-200 border border-purple-500/50 text-xs font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                            >
                                <Sparkles className="w-4 h-4 text-purple-300" />
                                <span>Ruang Media & Pers</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Evaluasi Nilai Tren Sentimen Topik Politik (Update Rutin Crontab 05:00 WIB) */}
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${summary.dominanceBadgeClass}`}>
                                    {summary.dominanceStatus === 'POSITIF' ? '📈 TREN POSITIF' : summary.dominanceStatus === 'NEGATIF' ? '⚠️ TREN KRITIS / NEGATIF' : '⚖️ TREN SEIMBANG'}
                                </span>
                                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                                    Patroli Harian 05:00 WIB
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span>Nilai Tren Topik:</span>
                                <span className="text-purple-300 underline decoration-purple-500/50">{summary.targetTopic}</span>
                            </h2>
                            <p className="text-xs text-slate-300 font-sans">
                                {summary.dominanceDescription}
                            </p>
                        </div>

                        {/* Nilai Sentimen Bersih (Net Shift Score) */}
                        <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 px-5 self-start md:self-auto">
                            <div>
                                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">SKOR BERSIH (NET SCORE)</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-2xl font-black font-mono ${summary.netScore > 0 ? 'text-emerald-400' : summary.netScore < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                                        {summary.netScore > 0 ? `+${summary.netScore}` : summary.netScore}
                                    </span>
                                    <span className="text-xs text-slate-400 font-sans">
                                        ({summary.totalPositive} Positif vs {summary.totalNegative} Negatif)
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar Sentimen Komparatif */}
                    <div className="mt-5 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                Positif: {summary.totalPositive} Berita ({summary.positivePct}%)
                            </span>
                            <span className="text-slate-400 font-medium">
                                Netral: {summary.totalNeutral} Berita ({summary.neutralPct}%)
                            </span>
                            <span className="text-rose-400 font-bold flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                                Negatif: {summary.totalNegative} Berita ({summary.negativePct}%)
                            </span>
                        </div>
                        <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800/80">
                            <div style={{ width: `${summary.positivePct}%` }} className="bg-emerald-500 transition-all duration-500" title={`Positif: ${summary.positivePct}%`}></div>
                            <div style={{ width: `${summary.neutralPct}%` }} className="bg-slate-600 transition-all duration-500" title={`Netral: ${summary.neutralPct}%`}></div>
                            <div style={{ width: `${summary.negativePct}%` }} className="bg-rose-500 transition-all duration-500" title={`Negatif: ${summary.negativePct}%`}></div>
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans italic pt-1">
                            * Data grafik tren di bawah terbentuk dari akumulasi 9 berita terbaru yang disetor setiap pagi jam 05:00 WIB oleh Agen Radar dengan mekanisme anti-duplikasi artikel.
                        </p>
                    </div>
                </div>

                {/* Section 1: Sentiment Shift Tracker (Grafik Fluktuasi 7 Hari) */}
                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-purple-400" />
                                <h2 className="text-lg font-bold text-white">
                                    Grafik Perkembangan Nada Berita (7 Hari Terakhir)
                                </h2>
                            </div>
                            <p className="text-xs text-slate-400 font-sans">
                                Membandingkan jumlah berita positif (kabar baik), netral (informasi biasa), dan negatif (kritik/isu miring).
                            </p>
                        </div>

                        {/* Chart Mode Controls */}
                        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
                            <span className="text-[11px] text-slate-400 px-2 font-semibold hidden sm:inline">BENTUK GRAFIK:</span>
                            <button
                                type="button"
                                onClick={() => setChartMode('line')}
                                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                                    chartMode === 'line'
                                        ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                            >
                                Garis
                            </button>
                            <button
                                type="button"
                                onClick={() => setChartMode('bar')}
                                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                                    chartMode === 'bar'
                                        ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                            >
                                Batang
                            </button>
                            <button
                                type="button"
                                onClick={() => setChartMode('area')}
                                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                                    chartMode === 'area'
                                        ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                            >
                                Bidang Berwarna
                            </button>
                        </div>
                    </div>

                    {/* Chart Container - 100% Responsive for Mobile & Desktop */}
                    <div className="w-full h-80 sm:h-96 min-h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            {chartMode === 'line' ? (
                                <LineChart
                                    data={sentimentTrend}
                                    margin={{ top: 20, right: 20, left: -20, bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis
                                        dataKey="label"
                                        stroke="#64748b"
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        allowDecimals={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        wrapperStyle={{ paddingTop: '15px', fontFamily: 'monospace', fontSize: '12px' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="positive"
                                        name="Sentimen Positif (Hijau)"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#10b981', stroke: '#064e3b', strokeWidth: 2 }}
                                        activeDot={{ r: 7, fill: '#34d399', stroke: '#fff', strokeWidth: 2 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="negative"
                                        name="Sentimen Negatif (Merah)"
                                        stroke="#f43f5e"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#f43f5e', stroke: '#881337', strokeWidth: 2 }}
                                        activeDot={{ r: 7, fill: '#fb7185', stroke: '#fff', strokeWidth: 2 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="neutral"
                                        name="Sentimen Netral (Abu/Cyan)"
                                        stroke="#06b6d4"
                                        strokeWidth={2}
                                        strokeDasharray="4 4"
                                        dot={{ r: 3, fill: '#06b6d4' }}
                                    />
                                </LineChart>
                            ) : chartMode === 'bar' ? (
                                <BarChart
                                    data={sentimentTrend}
                                    margin={{ top: 20, right: 20, left: -20, bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis
                                        dataKey="label"
                                        stroke="#64748b"
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        allowDecimals={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        wrapperStyle={{ paddingTop: '15px', fontFamily: 'monospace', fontSize: '12px' }}
                                    />
                                    <Bar
                                        dataKey="positive"
                                        name="Sentimen Positif (Hijau)"
                                        fill="#10b981"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="negative"
                                        name="Sentimen Negatif (Merah)"
                                        fill="#f43f5e"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="neutral"
                                        name="Sentimen Netral (Abu)"
                                        fill="#64748b"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            ) : (
                                <AreaChart
                                    data={sentimentTrend}
                                    margin={{ top: 20, right: 20, left: -20, bottom: 10 }}
                                >
                                    <defs>
                                        <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis
                                        dataKey="label"
                                        stroke="#64748b"
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        allowDecimals={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        wrapperStyle={{ paddingTop: '15px', fontFamily: 'monospace', fontSize: '12px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="positive"
                                        name="Sentimen Positif"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorPositive)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="negative"
                                        name="Sentimen Negatif"
                                        stroke="#f43f5e"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorNegative)"
                                    />
                                </AreaChart>
                            )}
                        </ResponsiveContainer>
                    </div>

                    {/* Quick Insight Strip */}
                    <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                            <span className="text-slate-400 block text-[11px]">ARAH BERITA & NILAI:</span>
                            <span className="text-white font-bold flex items-center gap-1.5 mt-0.5">
                                <span className={`w-2 h-2 rounded-full ${summary.netScore > 0 ? 'bg-emerald-400' : summary.netScore < 0 ? 'bg-rose-400' : 'bg-slate-400'}`}></span>
                                {summary.dominanceStatus === 'POSITIF' ? `Dominan Positif (+${summary.netScore})` : summary.dominanceStatus === 'NEGATIF' ? `Dominan Negatif (${summary.netScore})` : 'Posisi Seimbang (0)'}
                            </span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                            <span className="text-slate-400 block text-[11px]">RATA-RATA KEHANGATAN:</span>
                            <span className="text-amber-300 font-bold mt-0.5 block">{avgVelocity}% (Terkendali)</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                            <span className="text-slate-400 block text-[11px]">BUTUH PERHATIAN:</span>
                            <span className="text-rose-400 font-bold mt-0.5 block">{criticalIsuCount} Isu Ramai</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                            <span className="text-slate-400 block text-[11px]">TOTAL BERITA DIPERIKSA:</span>
                            <span className="text-cyan-300 font-bold mt-0.5 block">{totalProcessed} Artikel</span>
                        </div>
                    </div>
                </div>

                {/* Section 2: Summary Cards (Weekly Trust & Performance KPIs) */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-lg font-bold text-white">
                            Ringkasan Pantauan Berita Pekan Ini
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                        {/* KPI 1: Total Processed */}
                        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-xl">
                            <div className="flex items-center justify-between text-slate-400 mb-2">
                                <span className="text-xs font-bold">Total Berita Masuk</span>
                                <Cpu className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-white">{totalProcessed}</div>
                            <div className="mt-2 text-[11px] text-cyan-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                                <span>Semua artikel terbaca rapi</span>
                            </div>
                        </div>

                        {/* KPI 2: Krisis Berhasil Diredam */}
                        <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 hover:border-emerald-500/70 transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                            <div className="flex items-center justify-between text-emerald-400 mb-2">
                                <span className="text-xs font-bold">Isu Ramai Tertangani</span>
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-emerald-300">{weeklyCrisisAverted}</div>
                            <div className="mt-2 text-[11px] text-emerald-400/80 flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                                <span>Draf klarifikasi sudah dibuat</span>
                            </div>
                        </div>

                        {/* KPI 3: Serangan Diblokir (Integrity Alerts) */}
                        <div className="p-5 rounded-2xl bg-slate-900/90 border border-red-500/50 hover:border-red-500/80 transition-all shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                            <div className="flex items-center justify-between text-red-400 mb-2">
                                <span className="text-xs font-bold">Tuduhan Berat</span>
                                <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-red-300">{integrityAlertsCount}</div>
                            <div className="mt-2 text-[11px] text-red-400 flex items-center gap-1 font-bold">
                                <span>🚨 Butuh Bukti Hukum / Klarifikasi</span>
                            </div>
                        </div>

                        {/* KPI 4: Skrip Defensive & Proactive */}
                        <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/40 hover:border-purple-500/70 transition-all shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                            <div className="flex items-center justify-between text-purple-400 mb-2">
                                <span className="text-xs font-bold">Draf Rilis Siap</span>
                                <Sparkles className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-purple-200">
                                {defensiveScriptsCount + proactiveScriptsCount}
                            </div>
                            <div className="mt-2 text-[11px] text-slate-300 flex items-center justify-between">
                                <span className="text-rose-400 font-bold">{defensiveScriptsCount} Klarifikasi</span>
                                <span className="text-emerald-400 font-bold">{proactiveScriptsCount} Kabar Baik</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Detailed AI Audit Trail Table */}
                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
                    <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-cyan-400" />
                                <h3 className="text-base sm:text-lg font-bold text-white">
                                    Riwayat Pemeriksaan Berita Terbaru
                                </h3>
                            </div>
                            <p className="text-xs text-slate-400 font-sans">
                                Catatan setiap artikel berita yang masuk, hasil pembacaan sentimen, dan draf tanggapan yang disiapkan.
                            </p>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
                            <button
                                type="button"
                                onClick={() => setActionFilter('all')}
                                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                    actionFilter === 'all'
                                        ? 'bg-cyan-600 text-white'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Semua ({recentActions.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActionFilter('integrity')}
                                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                    actionFilter === 'integrity'
                                        ? 'bg-red-700 text-white'
                                        : 'text-red-400 hover:text-red-300'
                                }`}
                            >
                                Tuduhan Berat ({integrityAlertsCount})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActionFilter('defensive')}
                                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                    actionFilter === 'defensive'
                                        ? 'bg-rose-700 text-white'
                                        : 'text-rose-400 hover:text-rose-300'
                                }`}
                            >
                                Klarifikasi ({defensiveScriptsCount})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActionFilter('proactive')}
                                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                    actionFilter === 'proactive'
                                        ? 'bg-emerald-700 text-white'
                                        : 'text-emerald-400 hover:text-emerald-300'
                                }`}
                            >
                                Kabar Baik ({proactiveScriptsCount})
                            </button>
                        </div>
                    </div>

                    {/* Table View (Desktop & Responsive Scroll) */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase text-[11px] tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-4">Waktu</th>
                                    <th className="py-3.5 px-4">Isu & Sumber Berita</th>
                                    <th className="py-3.5 px-4 text-center">Status Tanggapan</th>
                                    <th className="py-3.5 px-4 text-center">Kehangatan & Nada</th>
                                    <th className="py-3.5 px-4">Catatan Kejadian</th>
                                    <th className="py-3.5 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80">
                                {filteredActions.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-slate-500">
                                            Tidak ada catatan pemeriksaan yang cocok dengan filter ini.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredActions.map((log) => {
                                        const isIntegrity = log.action_type === 'INTEGRITY_BLOCK';
                                        const isDefensive = log.action_type === 'DEFENSIVE_REFRAME';
                                        const isProactive = log.action_type === 'PROACTIVE_AMPLIFY';

                                        return (
                                            <tr
                                                key={log.id}
                                                className={`hover:bg-slate-800/40 transition-colors ${
                                                    isIntegrity ? 'bg-red-950/15' : ''
                                                }`}
                                            >
                                                {/* Timestamp */}
                                                <td className="py-4 px-4 whitespace-nowrap text-slate-400">
                                                    <span className="text-white block font-semibold">{log.timestamp}</span>
                                                    <span className="text-[10px] text-slate-500">{log.relative_time}</span>
                                                </td>

                                                {/* Title & Source */}
                                                <td className="py-4 px-4 max-w-xs sm:max-w-md">
                                                    <div className="font-bold text-slate-100 line-clamp-2 leading-relaxed">
                                                        {log.title}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                                            {log.source || 'Media Lokal'}
                                                        </span>
                                                        {log.has_fact_anchor && (
                                                            <span className="text-[10px] text-cyan-400 flex items-center gap-0.5">
                                                                <Check className="w-3 h-3" /> Ada Fakta Lapangan
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Action Badge */}
                                                <td className="py-4 px-4 whitespace-nowrap text-center">
                                                    {isIntegrity ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-950 text-red-300 border border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                                                            <ShieldAlert className="w-3 h-3 text-red-400" />
                                                            PERLU BUKTI HUKUM
                                                        </span>
                                                    ) : isDefensive ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/50">
                                                            <Shield className="w-3 h-3 text-rose-400" />
                                                            DRAF KLARIFIKASI
                                                        </span>
                                                    ) : isProactive ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                                                            <Sparkles className="w-3 h-3 text-emerald-400" />
                                                            DRAF KABAR BAIK
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-900 text-slate-400 border border-slate-800">
                                                            BERITA NETRAL
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Velocity & Sentiment */}
                                                <td className="py-4 px-4 whitespace-nowrap text-center">
                                                    <div className="font-bold text-sm">
                                                        <span
                                                            className={
                                                                log.velocity_score >= 75
                                                                    ? 'text-rose-400'
                                                                    : log.velocity_score >= 40
                                                                    ? 'text-amber-400'
                                                                    : 'text-emerald-400'
                                                            }
                                                        >
                                                            {log.velocity_score}%
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                                                        {log.sentiment === 'negative' ? 'Kritik / Isu' : log.sentiment === 'positive' ? 'Kabar Baik' : 'Netral'}
                                                    </span>
                                                </td>

                                                {/* Impact / Notes */}
                                                <td className="py-4 px-4 max-w-xs font-sans text-xs">
                                                    <p
                                                        className={
                                                            isIntegrity
                                                                ? 'text-red-300 font-semibold'
                                                                : 'text-slate-300'
                                                        }
                                                    >
                                                        {log.impact}
                                                    </p>
                                                </td>

                                                {/* Action Link */}
                                                <td className="py-4 px-4 whitespace-nowrap text-right">
                                                    {log.has_scripts ? (
                                                        <Link
                                                            href="/studio"
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold transition-all"
                                                        >
                                                            <span>Lihat Draf</span>
                                                            <ArrowUpRight className="w-3 h-3" />
                                                        </Link>
                                                    ) : (
                                                        <Link
                                                            href="/dashboard"
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] transition-all"
                                                        >
                                                            <span>Cek Radar</span>
                                                            <ArrowUpRight className="w-3 h-3" />
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer Telemetry */}
                    <div className="p-4 border-t border-slate-800 bg-slate-950/70 text-slate-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
                        <span>Menampilkan {filteredActions.length} dari total {recentActions.length} catatan berita aktif</span>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-slate-300 font-medium">Sistem Pantauan: AKTIF</span>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Minimalist icon helper for table
function Check({ className = "w-4 h-4" }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    );
}

function Shield({ className = "w-4 h-4" }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    );
}
