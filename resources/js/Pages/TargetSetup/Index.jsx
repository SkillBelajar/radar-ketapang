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
        <AuthenticatedLayout header="Pengaturan Kata Kunci & Sumber Berita">
            <Head title="Pengaturan Kata Kunci & Berita - Radar Politik" />

            <div className="space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.2)] text-sm">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <span>{flash.success}</span>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 flex items-center justify-between shadow-[0_0_15px_rgba(244,63,94,0.2)] text-sm">
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
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold">
                                    <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                                    PENGATURAN KATA KUNCI & SUMBER BERITA
                                </span>
                                <span className="text-slate-400 text-xs">
                                    Hak Akses: <strong className="text-white uppercase">{userRole === 'admin' ? 'Pengelola Utama (Admin)' : userRole === 'timses' ? 'Tim Lapangan (Timses)' : 'Juru Bicara (Media)'}</strong>
                                </span>
                            </div>
                            <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                                Tentukan Apa yang Ingin Dipantau
                            </h1>
                            <p className="text-slate-300 text-xs md:text-sm max-w-2xl">
                                Atur topik atau nama tokoh yang ingin dicari, saring kata-kata sampah atau iklan agar tidak mengotori pantauan, serta tentukan karakter gaya bicara untuk draf tanggapan rilis resmi.
                            </p>
                        </div>

                        {/* Quick Stats Badges */}
                        <div className="flex flex-wrap md:flex-nowrap gap-2 text-xs">
                            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 min-w-[120px]">
                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Tag className="w-3 h-3 text-cyan-400" />
                                    Kata Kunci Dicari
                                </div>
                                <div className="text-lg font-bold text-cyan-300 mt-0.5">
                                    {data.primary_keywords.length} <span className="text-[10px] text-slate-400 font-normal">kata</span>
                                </div>
                            </div>
                            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 min-w-[120px]">
                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Filter className="w-3 h-3 text-rose-400" />
                                    Kata Sampah Dibuang
                                </div>
                                <div className="text-lg font-bold text-rose-300 mt-0.5">
                                    {data.negative_keywords.length} <span className="text-[10px] text-slate-400 font-normal">kata</span>
                                </div>
                            </div>
                            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 min-w-[120px]">
                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Database className="w-3 h-3 text-emerald-400" />
                                    Berita Masuk
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
                                    <h2 className="text-base font-bold text-white">
                                        Formulir Pengaturan Pantauan
                                    </h2>
                                </div>
                                <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                                    Pengaturan Terpusat
                                </span>
                            </div>

                            {/* 1. PRIMARY KEYWORDS */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase">
                                        <Tag className="w-4 h-4 text-cyan-400" />
                                        <span>a. Topik atau Nama Tokoh yang Dipantau</span>
                                    </label>
                                    <span className="text-[11px] text-slate-400">
                                        {data.primary_keywords.length} kata aktif
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-300">
                                    Sistem akan mencari artikel berita dari portal media online yang menyebutkan nama tokoh, pasangan calon, atau topik berikut:
                                </p>

                                {/* Interactive Tag Box */}
                                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 focus-within:border-cyan-500/60 transition-colors">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {data.primary_keywords.map((tag, idx) => (
                                            <span 
                                                key={idx}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 text-xs shadow-sm group hover:border-cyan-400 transition-colors"
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
                                            placeholder="Ketik nama tokoh atau isu lalu tekan Enter (contoh: 'Pilkada Ketapang', 'Calon Bupati')..."
                                            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => addPrimaryTag()}
                                            className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Tambah
                                        </button>
                                    </div>
                                </div>

                                {/* Quick suggestions */}
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                                    <span className="text-slate-400">Saran Cepat:</span>
                                    {['Pilkada Ketapang', 'Bupati Ketapang', 'APBD Ketapang', 'Jalan Rusak Ketapang'].map((sug, i) => (
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
                                    <p className="text-xs text-rose-400">{errors.primary_keywords}</p>
                                )}
                            </div>

                            {/* 2. NEGATIVE KEYWORDS */}
                            <div className="space-y-3 pt-2 border-t border-slate-800/80">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-rose-300 flex items-center gap-1.5 uppercase">
                                        <Filter className="w-4 h-4 text-rose-400" />
                                        <span>b. Kata yang Dibuang / Diabaikan (Sampah & Iklan)</span>
                                    </label>
                                    <span className="text-[11px] text-slate-400">
                                        {data.negative_keywords.length} kata disaring
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-300">
                                    Berita yang memuat kata-kata ini akan otomatis diabaikan agar tim tidak terganggu oleh berita judi online, lowongan kerja palsu, atau promo jualan.
                                </p>

                                {/* Interactive Tag Box */}
                                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 focus-within:border-rose-500/60 transition-colors">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {data.negative_keywords.map((tag, idx) => (
                                            <span 
                                                key={idx}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs shadow-sm group hover:border-rose-400 transition-colors"
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
                                            placeholder="Ketik kata yang ingin diabaikan lalu tekan Enter (contoh: 'lowongan kerja', 'slot online')..."
                                            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => addNegativeTag()}
                                            className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Tambah
                                        </button>
                                    </div>
                                </div>

                                {/* Quick suggestions */}
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                                    <span className="text-slate-400">Saran Kata Sampah:</span>
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
                                    <p className="text-xs text-rose-400">{errors.negative_keywords}</p>
                                )}
                            </div>

                            {/* 3. PERSONA / GAYA BAHASA */}
                            <div className="space-y-3 pt-2 border-t border-slate-800/80">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase">
                                        <Sparkles className="w-4 h-4 text-amber-400" />
                                        <span>c. Karakter Gaya Bicara (Persona Tanggapan Resmi)</span>
                                    </label>
                                    <span className="text-[11px] text-slate-400">
                                        {data.persona.length}/2000 Karakter
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-300">
                                    Pilih atau tulis karakter bahasa yang ingin dipakai saat asisten membuatkan draf naskah tanggapan:
                                </p>

                                {/* Template Buttons */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {personaTemplates.map((t, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setData('persona', t.text)}
                                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
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
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 leading-relaxed"
                                />
                                {errors.persona && (
                                    <p className="text-xs text-rose-400">{errors.persona}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2 flex items-center justify-between">
                                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    <span>Berlaku langsung untuk seluruh tim</span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`py-3 px-6 rounded-xl font-bold text-xs tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer ${
                                        processing
                                            ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 active:scale-[0.99]'
                                    }`}
                                >
                                    {processing ? (
                                        <>
                                            <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                                            <span>MENYIMPAN PERUBAHAN...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>SIMPAN PENGATURAN PANTAUAN</span>
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
                                    <h2 className="text-base font-bold text-white">
                                        Pusat Pengumpul Berita Kredibel
                                    </h2>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                                    <span className="text-[11px] text-emerald-300 font-bold">Pengumpul Aktif</span>
                                </div>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                                Kumpulan berita resmi dari media online tepercaya di Ketapang & Kalbar. Sistem otomatis memeriksa dan mengambil berita terkini setiap saat.
                            </p>

                            {/* Hermes Agent AI Autonomous Engine Banner */}
                            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 to-slate-950 border border-cyan-500/40 space-y-2.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                                        <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                                        Asisten Pembaca Berita Otomatis
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                                        TERHUBUNG
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-300 leading-normal">
                                    Setiap berita yang masuk langsung dianalisis oleh asisten cerdas untuk mengetahui apakah beritanya bernada kabar baik, kabar buruk, atau fitnah yang perlu diklarifikasi.
                                </p>
                                <a
                                    href="/user-guide?tab=hermes"
                                    className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-bold hover:underline"
                                >
                                    <span>Pelajari Cara Kerja Asisten Pembaca Berita</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </a>
                            </div>

                            {/* Worker Trigger Action Box */}
                            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                                        Pembaruan Berita Manual
                                    </span>
                                    <span className="text-slate-400 text-[11px]">Bisa kapan saja</span>
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
                                    <span>{fetchingManual ? 'SEDANG MENGAMBIL BERITA BARU...' : 'AMBIL BERITA TERBARU SEKARANG'}</span>
                                </button>
                            </div>

                            {/* Feed List Streams */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs text-slate-400">
                                    <span className="flex items-center gap-1.5 font-bold text-slate-300">
                                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                                        Daftar Berita yang Masuk ({totalFeeds})
                                    </span>
                                    <span className="text-[11px] text-cyan-400">Terbaru di Atas</span>
                                </div>

                                {recentFeeds.length === 0 ? (
                                    <div className="p-8 text-center rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                                        <Clock className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                                        <div className="text-xs text-slate-400">Belum ada berita yang masuk.</div>
                                        <div className="text-[11px] text-slate-500">
                                            Klik tombol "Ambil Berita Terbaru Sekarang" di atas untuk memeriksa berita terkini.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                                        {recentFeeds.map((feed) => (
                                            <div
                                                key={feed.id}
                                                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-cyan-500/40 transition-all group"
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
                                                    <span className="flex items-center gap-0.5 text-cyan-400/80 group-hover:text-cyan-300 font-medium">
                                                        Baca Berita Asli <ArrowUpRight className="w-3 h-3" />
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Architecture Badge */}
                            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-300/90 flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
                                <span>Pengambilan berita berjalan di latar belakang secara otomatis tanpa memperlambat sistem.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
