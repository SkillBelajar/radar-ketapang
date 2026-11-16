import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Radio, ShieldCheck, Tag, X, Plus, Sparkles, RefreshCw, 
    AlertTriangle, FileText, ExternalLink, CheckCircle2, Clock, 
    Globe, ArrowUpRight, Cpu, Sliders, Database, Eye, Terminal,
    Filter, BookOpen, Layers
} from 'lucide-react';

export default function TargetSetupIndex({ targetSetup, recentFeeds = [], totalFeeds = 0, userRole }) {
    const { flash } = usePage().props;

    // Local state for tags input
    const [primaryInput, setPrimaryInput] = useState('');
    const [negativeInput, setNegativeInput] = useState('');
    const [fetchingManual, setFetchingManual] = useState(false);

    // Form state
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        primary_keywords: Array.isArray(targetSetup?.primary_keywords) 
            ? targetSetup.primary_keywords 
            : ['Calon Bupati Ketapang', 'Ketapang 2026', 'Pilkada Ketapang', 'Pemkab Ketapang'],
        negative_keywords: Array.isArray(targetSetup?.negative_keywords) 
            ? targetSetup.negative_keywords 
            : ['lowongan', 'loker', 'judi', 'slot', 'taruhan', 'olshop'],
        persona: targetSetup?.persona || 'Gaya bahasa merakyat, tenang namun tegas, berorientasi solusi nyata, dan mengedepankan kearifan lokal masyarakat Ketapang.',
    });

    // Tag management helpers
    const addPrimaryTag = (tagToAdd) => {
        const trimmed = (tagToAdd || primaryInput).trim();
        if (trimmed && !data.primary_keywords.includes(trimmed)) {
            setData('primary_keywords', [...data.primary_keywords, trimmed]);
            setPrimaryInput('');
        }
    };

    const removePrimaryTag = (tagToRemove) => {
        setData('primary_keywords', data.primary_keywords.filter(t => t !== tagToRemove));
    };

    const addNegativeTag = (tagToAdd) => {
        const trimmed = (tagToAdd || negativeInput).trim();
        if (trimmed && !data.negative_keywords.includes(trimmed)) {
            setData('negative_keywords', [...data.negative_keywords, trimmed]);
            setNegativeInput('');
        }
    };

    const removeNegativeTag = (tagToRemove) => {
        setData('negative_keywords', data.negative_keywords.filter(t => t !== tagToRemove));
    };

    // Persona templates
    const personaTemplates = [
        {
            label: 'Merakyat & Solutif (Rekomendasi)',
            desc: 'Fokus isu dasar rakyat, bahasa lugas, cepat tanggap dan hangat.',
            text: 'Gaya bahasa merakyat, tenang namun tegas, berorientasi solusi nyata, dan mengedepankan kearifan lokal masyarakat Ketapang.'
        },
        {
            label: 'Teknokratik & Visioner',
            desc: 'Berdasarkan data APBD/infrastruktur, terstruktur, berwibawa.',
            text: 'Gaya komunikasi berbasis data empiris, modern, terstruktur, fokus pada tata kelola pemerintahan bersih dan percepatan ekonomi daerah.'
        },
        {
            label: 'Diplomatis & Pemersatu',
            desc: 'Merangkul seluruh elemen etnis, tokoh adat, dan komunitas.',
            text: 'Bahasa santun, mengutamakan silaturahmi lintas komunitas adat Melayu, Dayak, Tionghoa, Jawa, serta menjaga kondusivitas wilayah Ketapang.'
        }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/target-setup', {
            preserveScroll: true,
        });
    };

    const handleTriggerFetch = () => {
        setFetchingManual(true);
        router.post('/target-setup/fetch', {}, {
            preserveScroll: true,
            onFinish: () => setFetchingManual(false),
        });
    };

    return (
        <AuthenticatedLayout header="Konfigurasi Target Pantauan & Feed Hub">
            <Head title="Target Setup & Feed Hub - Radar Politik" />

            <div className="space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.2)] font-mono text-sm">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <span>{flash.success}</span>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 flex items-center justify-between shadow-[0_0_15px_rgba(244,63,94,0.2)] font-mono text-sm">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                            <span>{flash.error}</span>
                        </div>
                    </div>
                )}

                {/* Tactical Mission Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-cyan-500/30 p-5 md:p-6 shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-bold">
                                    <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                                    SLICE 3: TARGET TRACKER CORE
                                </span>
                                <span className="text-slate-400 text-xs font-mono">
                                    Akses: <strong className="text-white uppercase">{userRole}</strong>
                                </span>
                            </div>
                            <h1 className="text-xl md:text-2xl font-black text-white tracking-wide font-mono">
                                Target Setup & Credible Feed Hub
                            </h1>
                            <p className="text-slate-300 text-xs md:text-sm max-w-2xl">
                                Konfigurasi parameter kata kunci tokoh politik, penyaring noise hoaks/iklan, serta doktrin gaya bahasa (persona) yang mengarahkan mesin analisis Hermes AI.
                            </p>
                        </div>

                        {/* Quick Stats Badges */}
                        <div className="flex flex-wrap md:flex-nowrap gap-2 font-mono text-xs">
                            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 min-w-[120px]">
                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Tag className="w-3 h-3 text-cyan-400" />
                                    Target Kunci
                                </div>
                                <div className="text-lg font-bold text-cyan-300 mt-0.5">
                                    {data.primary_keywords.length} <span className="text-[10px] text-slate-400 font-normal">kata</span>
                                </div>
                            </div>
                            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 min-w-[120px]">
                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Filter className="w-3 h-3 text-rose-400" />
                                    Filter Noise
                                </div>
                                <div className="text-lg font-bold text-rose-300 mt-0.5">
                                    {data.negative_keywords.length} <span className="text-[10px] text-slate-400 font-normal">kata</span>
                                </div>
                            </div>
                            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 min-w-[120px]">
                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Database className="w-3 h-3 text-emerald-400" />
                                    Feed Masuk
                                </div>
                                <div className="text-lg font-bold text-emerald-300 mt-0.5">
                                    {totalFeeds} <span className="text-[10px] text-slate-400 font-normal">artikel</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT COLUMN: Setup Form (7 Cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        <form onSubmit={handleSubmit} className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 md:p-6 shadow-xl space-y-6">
                            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sliders className="w-5 h-5 text-cyan-400" />
                                    <h2 className="text-base font-bold font-mono text-white">
                                        Form Konfigurasi Radar Single-Account
                                    </h2>
                                </div>
                                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                                    Single-Row DB
                                </span>
                            </div>

                            {/* 1. PRIMARY KEYWORDS */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5 uppercase">
                                        <Tag className="w-4 h-4 text-cyan-400" />
                                        <span>a. Kata Kunci Utama (Primary Keywords)</span>
                                    </label>
                                    <span className="text-[11px] text-slate-400 font-mono">
                                        {data.primary_keywords.length} kata aktif
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-300">
                                    Mesin pencari feed dan crawler akan menyaring artikel berita portal online yang memuat nama tokoh, lembaga, atau isu spesifik ini.
                                </p>

                                {/* Interactive Tag Box */}
                                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 focus-within:border-cyan-500/60 transition-colors">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {data.primary_keywords.map((tag, idx) => (
                                            <span 
                                                key={idx}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 text-xs font-mono shadow-sm group hover:border-cyan-400 transition-colors"
                                            >
                                                <span>{tag}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removePrimaryTag(tag)}
                                                    className="text-cyan-400 hover:text-rose-400 transition-colors cursor-pointer"
                                                    title="Hapus kata kunci"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>

                                    {/* Input & Add Button */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={primaryInput}
                                            onChange={(e) => setPrimaryInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addPrimaryTag();
                                                }
                                            }}
                                            placeholder="Ketik kata kunci lalu tekan Enter (cth: 'Ketapang Maju', 'H. Alexander')..."
                                            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => addPrimaryTag()}
                                            className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Tambah
                                        </button>
                                    </div>
                                </div>

                                {/* Quick suggestions */}
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-400">
                                    <span className="text-slate-400">Saran Cepat:</span>
                                    {['Pilkada Ketapang', 'Bupati Ketapang', 'APBD Ketapang', 'Infrastruktur Ketapang'].map((sug, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => addPrimaryTag(sug)}
                                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-colors cursor-pointer"
                                        >
                                            + {sug}
                                        </button>
                                    ))}
                                </div>
                                {errors.primary_keywords && (
                                    <p className="text-xs text-rose-400 font-mono">{errors.primary_keywords}</p>
                                )}
                            </div>

                            {/* 2. NEGATIVE KEYWORDS */}
                            <div className="space-y-3 pt-2 border-t border-slate-800/80">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-mono font-bold text-rose-300 flex items-center gap-1.5 uppercase">
                                        <Filter className="w-4 h-4 text-rose-400" />
                                        <span>b. Kata Kunci Pengecualian (Negative Keywords)</span>
                                    </label>
                                    <span className="text-[11px] text-slate-400 font-mono">
                                        {data.negative_keywords.length} filter aktif
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-300">
                                    Berita atau postingan yang mengandung kata kunci ini akan langsung dieliminasi secara otomatis dari radar untuk mencegah polusi data (spam/judi/iklan).
                                </p>

                                {/* Interactive Tag Box */}
                                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 focus-within:border-rose-500/60 transition-colors">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {data.negative_keywords.map((tag, idx) => (
                                            <span 
                                                key={idx}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-mono shadow-sm group hover:border-rose-400 transition-colors"
                                            >
                                                <span>{tag}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeNegativeTag(tag)}
                                                    className="text-rose-400 hover:text-rose-200 transition-colors cursor-pointer"
                                                    title="Hapus filter pengecualian"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>

                                    {/* Input & Add Button */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={negativeInput}
                                            onChange={(e) => setNegativeInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addNegativeTag();
                                                }
                                            }}
                                            placeholder="Ketik kata pengecualian lalu tekan Enter (cth: 'loker', 'slot online')..."
                                            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => addNegativeTag()}
                                            className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Tambah
                                        </button>
                                    </div>
                                </div>

                                {/* Quick suggestions */}
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-400">
                                    <span className="text-slate-400">Saran Noise Filter:</span>
                                    {['lowongan kerja', 'slot gacor', 'diskon promo', 'gosip selebritis'].map((sug, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => addNegativeTag(sug)}
                                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700/60 transition-colors cursor-pointer"
                                        >
                                            + {sug}
                                        </button>
                                    ))}
                                </div>
                                {errors.negative_keywords && (
                                    <p className="text-xs text-rose-400 font-mono">{errors.negative_keywords}</p>
                                )}
                            </div>

                            {/* 3. PERSONA / GAYA BAHASA */}
                            <div className="space-y-3 pt-2 border-t border-slate-800/80">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5 uppercase">
                                        <Sparkles className="w-4 h-4 text-amber-400" />
                                        <span>c. Persona & Gaya Bahasa Tokoh (AI Guidance)</span>
                                    </label>
                                    <span className="text-[11px] text-slate-400 font-mono">
                                        {data.persona.length}/2000 Karakter
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-300">
                                    Instruksi karakter dan nada bicara yang dipakai mesin AI ketika menganalisis sentimen isu serta menyusun draf rilis tanggapan di Slice 5 & 7.
                                </p>

                                {/* Template Buttons */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {personaTemplates.map((t, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setData('persona', t.text)}
                                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer font-mono ${
                                                data.persona === t.text
                                                    ? 'bg-amber-950/60 border-amber-500/60 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                                                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                                            }`}
                                        >
                                            <div className="text-[11px] font-bold text-white mb-0.5">{t.label}</div>
                                            <div className="text-[10px] text-slate-400 line-clamp-2">{t.desc}</div>
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    rows={4}
                                    value={data.persona}
                                    onChange={(e) => setData('persona', e.target.value)}
                                    placeholder="Contoh: Gaya bahasa santun namun berwibawa, lugas, cepat tanggap dalam membela kepentingan petani kelapa sawit dan nelayan Ketapang..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 font-mono leading-relaxed"
                                />
                                {errors.persona && (
                                    <p className="text-xs text-rose-400 font-mono">{errors.persona}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2 flex items-center justify-between">
                                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    <span>Tersinkronisasi ke seluruh subsistem radar</span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`py-3 px-6 rounded-xl font-bold font-mono text-xs tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer ${
                                        processing
                                            ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 active:scale-[0.99]'
                                    }`}
                                >
                                    {processing ? (
                                        <>
                                            <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                                            <span>MENYIMPAN KE BASIS DATA...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>SIMPAN KONFIGURASI TARGET</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* RIGHT COLUMN: Credible Feed Hub Live Monitor (5 Cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 md:p-6 shadow-xl space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-emerald-400" />
                                    <h2 className="text-base font-bold font-mono text-white">
                                        Credible Feed Hub
                                    </h2>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                                    <span className="text-[11px] font-mono text-emerald-300">Live Worker</span>
                                </div>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                                Agregator berita dan sumber media lokal terverifikasi. Backend menggunakan antrean <strong>Redis Queue</strong> untuk menarik dan menyaring artikel secara background.
                            </p>

                            {/* Worker Trigger Action Box */}
                            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400 flex items-center gap-1.5">
                                        <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                                        Worker Pipeline
                                    </span>
                                    <span className="text-cyan-400 font-bold">php artisan feed:fetch</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleTriggerFetch}
                                    disabled={fetchingManual}
                                    className={`w-full py-2.5 px-3 rounded-lg border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                        fetchingManual
                                            ? 'bg-slate-900 border-slate-800 text-slate-400 cursor-not-allowed'
                                            : 'bg-cyan-950/80 hover:bg-cyan-900/90 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                                    }`}
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${fetchingManual ? 'animate-spin' : ''}`} />
                                    <span>{fetchingManual ? 'MENARIK FEED RSS / REDIS...' : 'PICU WORKER TARIK BERITA (+3 SAMPLE)'}</span>
                                </button>
                            </div>

                            {/* Feed List Streams */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                                        Log Berita Terkumpul ({totalFeeds})
                                    </span>
                                    <span className="text-[11px] text-cyan-400">Terbaru di Atas</span>
                                </div>

                                {recentFeeds.length === 0 ? (
                                    <div className="p-8 text-center rounded-xl bg-slate-950/60 border border-slate-800 font-mono space-y-2">
                                        <Clock className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                                        <div className="text-xs text-slate-400">Belum ada artikel terkumpul.</div>
                                        <div className="text-[11px] text-slate-400">
                                            Klik tombol "Picu Worker" di atas atau jalankan <code className="text-cyan-300">php artisan feed:fetch</code> di terminal.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                                        {recentFeeds.map((feed) => (
                                            <div
                                                key={feed.id}
                                                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-cyan-500/40 transition-all font-mono group"
                                            >
                                                <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 mb-1">
                                                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-cyan-300 font-bold">
                                                        {feed.source}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3 text-slate-400" />
                                                        {new Date(feed.published_at || feed.created_at).toLocaleString('id-ID', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                </div>

                                                <a 
                                                    href={feed.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-2 block mb-1.5"
                                                >
                                                    {feed.title}
                                                </a>

                                                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                                                        Status: {feed.status}
                                                    </span>
                                                    <span className="flex items-center gap-0.5 text-cyan-400/80 group-hover:text-cyan-300">
                                                        Kunjungi Sumber <ArrowUpRight className="w-3 h-3" />
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Architecture Badge */}
                            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] font-mono text-cyan-300/80 flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
                                <span>Redis Queue: <strong>default / feeds</strong>. Diproses oleh background daemon.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
