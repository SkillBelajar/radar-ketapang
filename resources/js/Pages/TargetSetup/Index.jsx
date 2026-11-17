import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Radio, ShieldCheck, Tag, X, Plus, Sparkles, RefreshCw, 
    AlertTriangle, FileText, ExternalLink, CheckCircle2, Clock, 
    Globe, ArrowUpRight, Cpu, Sliders, Database, Eye, Terminal,
    Filter, BookOpen, Layers, User, Award, Compass, Target, MessageSquare
} from 'lucide-react';

export default function TargetSetupIndex({ targetSetup, recentFeeds = [], totalFeeds = 0, userRole }) {
    const { flash } = usePage().props;

    // Local state for tags input
    const [primaryInput, setPrimaryInput] = useState('');
    const [negativeInput, setNegativeInput] = useState('');
    const [pillarInput, setPillarInput] = useState('');
    const [fetchingManual, setFetchingManual] = useState(false);

    // Form state with personal branding support
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        candidate_name: targetSetup?.candidate_name || '',
        political_role: targetSetup?.political_role || 'Calon Kepala Daerah (Bupati/Walikota/Gubernur)',
        electoral_district: targetSetup?.electoral_district || 'Kabupaten Ketapang',
        branding_tagline: targetSetup?.branding_tagline || '',
        branding_pillars: Array.isArray(targetSetup?.branding_pillars) && targetSetup.branding_pillars.length > 0
            ? targetSetup.branding_pillars
            : [
                'Infrastruktur Konektivitas Jalan & Jembatan',
                'Stabilitas Harga Sembako & Hasil Panen Petani',
                'Layanan Kesehatan Cepat Bebas Antrean & Pungli',
                'Pemberdayaan UMKM & Lapangan Kerja Pemuda'
            ],
        branding_goal: targetSetup?.branding_goal || '',
        primary_keywords: Array.isArray(targetSetup?.primary_keywords) && targetSetup.primary_keywords.length > 0
            ? targetSetup.primary_keywords 
            : ['Ketapang', 'Bupati Ketapang', 'Pilkada Ketapang', 'APBD Ketapang', 'Jalan Rusak Ketapang'],
        negative_keywords: Array.isArray(targetSetup?.negative_keywords) && targetSetup.negative_keywords.length > 0
            ? targetSetup.negative_keywords 
            : ['lowongan', 'loker', 'judi', 'slot', 'taruhan', 'olshop'],
        persona: targetSetup?.persona || 'Gaya bahasa merakyat, tenang namun tegas, berorientasi solusi nyata, dan mengedepankan kearifan lokal masyarakat.',
    });

    // Tag management helpers: Primary Keywords
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

    // Tag management helpers: Negative Keywords
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

    // Tag management helpers: Branding Pillars
    const addPillarTag = (pillarToAdd) => {
        const trimmed = (pillarToAdd || pillarInput).trim();
        if (trimmed && !data.branding_pillars.includes(trimmed)) {
            setData('branding_pillars', [...data.branding_pillars, trimmed]);
            setPillarInput('');
        }
    };

    const removePillarTag = (pillarToRemove) => {
        setData('branding_pillars', data.branding_pillars.filter(p => p !== pillarToRemove));
    };

    // Preset Role Options
    const politicalRoleOptions = [
        'Calon Kepala Daerah (Bupati / Walikota / Gubernur)',
        'Calon Anggota Legislatif (DPR RI / DPRD Provinsi / DPRD Kab/Kota)',
        'Politisi Petahana (Perawatan Basis Konstituen & Elektabilitas)',
        'Tokoh Muda, Aktivis & Profesional Baru Terjun Politik',
        'Kandidat Independen / Perseorangan',
        'Pemerintah Daerah (Birokrasi Pemkab / Dinas Kominfo)'
    ];

    // Persona templates for political branding
    const personaTemplates = [
        {
            label: '1. Merakyat & Pembela Wong Cilik (People\'s Champion)',
            desc: 'Fokus kebutuhan dasar rakyat, tutur santun warung kopi ala Feynman, hangat dan cepat tanggap.',
            text: 'Gaya bahasa merakyat, hangat, mengalir santun seperti dialog di warung kopi. Mengutamakan empati mendalam kepada beban warga, tidak membela diri dengan alasan birokrasi, dan langsung menghadirkan kepastian aksi konkret serta posko aduan 24 jam.'
        },
        {
            label: '2. Tokoh Pembaharu & Berani (Challenger / Reformer)',
            desc: 'Kritis terhadap status quo, energik, berani melawan ketidakadilan, memperjuangkan transparansi.',
            text: 'Gaya komunikasi vokal, berani, lugas membela keadilan warga. Menyoroti inefisiensi dan dugaan penyimpangan anggaran dengan data konkret, serta mengusung visi perubahan radikal untuk kemakmuran rakyat.'
        },
        {
            label: '3. Teknokratik, Visioner & Berintegritas (Modern Leader)',
            desc: 'Berbasis data empiris dan anggaran terukur, tata kelola bersih, kepemimpinan modern dan solutif.',
            text: 'Gaya komunikasi berbasis data empiris pembangunan, terstruktur, berwibawa, menekankan akuntabilitas tata kelola pemerintahan bersih (clean governance), serta kepastian percepatan ekonomi berbasis potensi unggulan daerah.'
        },
        {
            label: '4. Negarawan Pemersatu & Pengayom (Bridge Builder)',
            desc: 'Merangkul semua suku, agama, dan adat; menjaga kerukunan serta stabilitas harmoni daerah.',
            text: 'Bahasa santun, mengutamakan silaturahmi lintas komunitas adat, suku, agama, dan kelompok pemuda. Memosisikan diri sebagai figur pengayom yang merajut persatuan dan menjaga kondusivitas wilayah demi kemajuan bersama.'
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
        <AuthenticatedLayout header="Pengaturan Tokoh & Target Personal Branding">
            <Head title="Pengaturan Tokoh & Personal Branding Politik - Radar Politik" />

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
                                    RADAR POLITIK & STRATEGI PERSONAL BRANDING
                                </span>
                                <span className="text-slate-400 text-xs">
                                    Hak Akses: <strong className="text-white uppercase">{userRole === 'admin' ? 'Pengelola Utama (Admin)' : userRole === 'timses' ? 'Tim Lapangan (Timses)' : 'Juru Bicara (Media)'}</strong>
                                </span>
                            </div>
                            <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                                Pusat Konfigurasi Personal Branding & Isu Strategis
                            </h1>
                            <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
                                Dirancang fleksibel untuk <strong>tokoh/kandidat politik</strong> yang ingin membangun elektabilitas dan reputasi kepemimpinan, maupun <strong>pemerintah daerah</strong> yang ingin merawat kepuasan publik. Setiap isu yang dipantau otomatis diolah menjadi panggung narasi simpatik bagi figur tokoh Anda.
                            </p>
                        </div>

                        {/* Quick Stats Badges */}
                        <div className="flex flex-wrap md:flex-nowrap gap-2 text-xs">
                            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 min-w-[120px]">
                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <User className="w-3 h-3 text-amber-400" />
                                    Tokoh Terdaftar
                                </div>
                                <div className="text-sm font-bold text-amber-300 mt-0.5 truncate max-w-[130px]">
                                    {data.candidate_name || 'Belum diatur'}
                                </div>
                            </div>
                            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 min-w-[120px]">
                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Tag className="w-3 h-3 text-cyan-400" />
                                    Kata Kunci Isu
                                </div>
                                <div className="text-lg font-bold text-cyan-300 mt-0.5">
                                    {data.primary_keywords.length} <span className="text-[10px] text-slate-400 font-normal">topik</span>
                                </div>
                            </div>
                            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 min-w-[120px]">
                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Database className="w-3 h-3 text-emerald-400" />
                                    Berita Terkumpul
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
                                        Formulir Profil Tokoh & Parameter Pantauan
                                    </h2>
                                </div>
                                <span className="text-[11px] px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-medium">
                                    Otomasi Hermes 05:00 WIB
                                </span>
                            </div>

                            {/* SECTION 1: PROFIL PERSONAL BRANDING TOKOH POLITIK */}
                            <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/30 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                                    <div className="flex items-center gap-2">
                                        <Award className="w-4 h-4 text-amber-400" />
                                        <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                                            1. Profil Tokoh & Target Personal Branding Politik
                                        </h3>
                                    </div>
                                    <span className="text-[10px] text-amber-300/80 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                                        Pilar Elektabilitas
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Candidate Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5 text-amber-400" />
                                            <span>Nama Lengkap & Gelar Tokoh / Calon</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.candidate_name}
                                            onChange={(e) => setData('candidate_name', e.target.value)}
                                            placeholder="Contoh: H. Farhan, S.E., M.Si."
                                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                                        />
                                        {errors.candidate_name && (
                                            <p className="text-[10px] text-rose-400">{errors.candidate_name}</p>
                                        )}
                                    </div>

                                    {/* Political Role */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                                            <Compass className="w-3.5 h-3.5 text-amber-400" />
                                            <span>Target / Peran Politik</span>
                                        </label>
                                        <select
                                            value={data.political_role}
                                            onChange={(e) => setData('political_role', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                                        >
                                            {politicalRoleOptions.map((opt, i) => (
                                                <option key={i} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        {errors.political_role && (
                                            <p className="text-[10px] text-rose-400">{errors.political_role}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Electoral District */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                                            <Target className="w-3.5 h-3.5 text-amber-400" />
                                            <span>Daerah Pemilihan (Dapil) / Wilayah Basis</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.electoral_district}
                                            onChange={(e) => setData('electoral_district', e.target.value)}
                                            placeholder="Contoh: Kabupaten Ketapang / Dapil Kalbar 1"
                                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                                        />
                                        {errors.electoral_district && (
                                            <p className="text-[10px] text-rose-400">{errors.electoral_district}</p>
                                        )}
                                    </div>

                                    {/* Branding Tagline */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                            <span>Slogan / Tagline Personal Branding</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.branding_tagline}
                                            onChange={(e) => setData('branding_tagline', e.target.value)}
                                            placeholder="Contoh: Bekerja Nyata untuk Kesejahteraan & Keadilan Warga"
                                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                                        />
                                        {errors.branding_tagline && (
                                            <p className="text-[10px] text-rose-400">{errors.branding_tagline}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Branding Pillars Tag Box */}
                                <div className="space-y-2 pt-1">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                                            <Layers className="w-3.5 h-3.5 text-amber-400" />
                                            <span>Pilar Utama Isu Perjuangan Tokoh (Reputation Pillars)</span>
                                        </label>
                                        <span className="text-[10px] text-slate-400">
                                            {data.branding_pillars.length} pilar aktif
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400">
                                        Setiap kali ada berita terkait isu di bawah, narasi Hermes akan otomatis mengaitkannya sebagai komitmen perjuangan tokoh Anda:
                                    </p>

                                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/90 focus-within:border-amber-500/60 transition-colors">
                                        <div className="flex flex-wrap gap-2 mb-2.5">
                                            {data.branding_pillars.map((pillar, idx) => (
                                                <span 
                                                    key={idx}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs shadow-sm"
                                                >
                                                    <span>{pillar}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removePillarTag(pillar)}
                                                        className="text-amber-400 hover:text-rose-400 transition-colors cursor-pointer"
                                                        title="Hapus pilar ini"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={pillarInput}
                                                onChange={(e) => setPillarInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addPillarTag();
                                                    }
                                                }}
                                                placeholder="Tambah pilar perjuangan (contoh: 'Perbaikan Jalan Poros Pedalaman', 'Bela Petani Sawit')..."
                                                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => addPillarTag()}
                                                className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Tambah Pilar
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Branding Goal */}
                                <div className="space-y-1.5 pt-1">
                                    <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                                        <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Target Pembentukan Opini Publik (Personal Branding Goal)</span>
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={data.branding_goal}
                                        onChange={(e) => setData('branding_goal', e.target.value)}
                                        placeholder="Contoh: Membangun citra tokoh sebagai figur yang paling tanggap terhadap keluhan jalan rusak, bersih dari rekam jejak kontroversi, dan memiliki kedekatan tulus dengan masyarakat kecil."
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed"
                                    />
                                    {errors.branding_goal && (
                                        <p className="text-[10px] text-rose-400">{errors.branding_goal}</p>
                                    )}
                                </div>
                            </div>

                            {/* SECTION 2: PRIMARY KEYWORDS (KATA KUNCI MEDIA) */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase">
                                        <Tag className="w-4 h-4 text-cyan-400" />
                                        <span>2. Topik & Kata Kunci Pemantauan Media (Google News)</span>
                                    </label>
                                    <span className="text-[11px] text-slate-400">
                                        {data.primary_keywords.length} kata aktif
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-300">
                                    Hermes akan menelusuri artikel berita online yang menyebutkan kata kunci daerah atau topik berikut:
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
                                            placeholder="Ketik topik atau nama wilayah lalu tekan Enter (contoh: 'Pilkada Ketapang', 'Jalan Rusak')..."
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
                            </div>

                            {/* SECTION 3: NEGATIVE KEYWORDS */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-rose-300 flex items-center gap-1.5 uppercase">
                                        <Filter className="w-4 h-4 text-rose-400" />
                                        <span>3. Kata Kunci Sampah / Iklan yang Dibuang</span>
                                    </label>
                                    <span className="text-[11px] text-slate-400">
                                        {data.negative_keywords.length} kata disaring
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-300">
                                    Artikel yang mengandung kata-kata ini otomatis diabaikan agar dashboard tetap bersih:
                                </p>

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
                                                    title="Hapus kata saring"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>

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
                                            placeholder="Ketik kata sampah (contoh: 'lowongan kerja', 'slot', 'promo')..."
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
                            </div>

                            {/* SECTION 4: PERSONA & GAYA BICARA POLITIK */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase">
                                        <Sparkles className="w-4 h-4 text-amber-400" />
                                        <span>4. Karakter Komunikasi & Persona Tokoh Politik</span>
                                    </label>
                                    <span className="text-[11px] text-slate-400">
                                        {data.persona.length}/2000 Karakter
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-300">
                                    Pilih template karakter kepemimpinan di bawah atau sesuaikan dengan gaya bicara asli tokoh Anda:
                                </p>

                                {/* Persona Templates Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {personaTemplates.map((t, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setData('persona', t.text)}
                                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                                data.persona === t.text
                                                    ? 'bg-amber-950/60 border-amber-500/60 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                                                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                                            }`}
                                        >
                                            <div className="text-[11px] font-bold text-white mb-0.5">{t.label}</div>
                                            <div className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{t.desc}</div>
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    rows={4}
                                    value={data.persona}
                                    onChange={(e) => setData('persona', e.target.value)}
                                    placeholder="Contoh: Gaya bahasa santun namun berwibawa, lugas, cepat tanggap dalam membela kepentingan petani kelapa sawit dan nelayan..."
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
                                    <span>Berlaku otomatis ke API Hermes 05:00 WIB</span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`py-3 px-6 rounded-xl font-bold text-xs tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer ${
                                        processing
                                            ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-amber-500 via-teal-400 to-cyan-400 hover:from-amber-400 hover:to-cyan-300 text-slate-950 active:scale-[0.99]'
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
                                            <span>SIMPAN PROFIL TOKOH & PANTAUAN</span>
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
                                        Pusat Penyalur Berita Kredibel
                                    </h2>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                                    <span className="text-[11px] text-emerald-300 font-bold">Sinkronisasi Aktif</span>
                                </div>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                                Kumpulan berita resmi dari media online terpercaya di daerah. Agen mandiri Hermes memindai portal pers regional setiap fajar jam 05:00 WIB untuk menyiapkan strategi reputasi Anda.
                            </p>

                            {/* Hermes Agent AI Autonomous Engine Banner */}
                            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-cyan-950/40 to-slate-950 border border-cyan-500/40 space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                                        <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                                        Mesin Intelijen Hermes Agent
                                    </span>
                                    <span className="text-[10px] bg-cyan-900/60 text-cyan-200 px-2 py-0.5 rounded border border-cyan-500/30">
                                        Push-Only Subuh
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-300 leading-relaxed">
                                    Profil tokoh <strong>{data.candidate_name || 'Tokoh'}</strong>, tagline, serta pilar perjuangan Anda akan disematkan otomatis ke setiap tanggapan isu, rilis media sosial, poin bicara jubir, dan siaran pers resmi.
                                </p>
                                <div className="pt-1">
                                    <a
                                        href="/user-guide?tab=hermes"
                                        className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 font-medium transition-colors"
                                    >
                                        <BookOpen className="w-3.5 h-3.5" />
                                        <span>Buka Panduan Teknis & Doktrin Naskah Pers</span>
                                        <ArrowUpRight className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>

                            {/* Live Feeds List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <span>Berita Masuk Terkini ({recentFeeds.length})</span>
                                    <span className="text-[11px] text-cyan-400 font-normal">Real-Time</span>
                                </div>

                                {recentFeeds.length === 0 ? (
                                    <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
                                        <Database className="w-8 h-8 text-slate-600 mx-auto" />
                                        <div className="text-xs font-bold text-slate-300">Belum Ada Berita Masuk</div>
                                        <p className="text-[11px] text-slate-500">
                                            Jalankan skrip patroli fajar Hermes atau tunggu eksekusi otomatis jam 05:00 WIB.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                                        {recentFeeds.map((feed) => (
                                            <div
                                                key={feed.id}
                                                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors space-y-1.5 text-xs"
                                            >
                                                <div className="flex items-center justify-between text-[10px] text-slate-400">
                                                    <span className="font-bold text-cyan-300 truncate max-w-[150px]">
                                                        {feed.source}
                                                    </span>
                                                    <span>{feed.published_at ? new Date(feed.published_at).toLocaleDateString('id-ID') : '-'}</span>
                                                </div>
                                                <a
                                                    href={feed.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-medium text-slate-200 hover:text-cyan-300 transition-colors line-clamp-2 block"
                                                >
                                                    {feed.title}
                                                </a>
                                                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-900">
                                                    <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${
                                                        feed.sentiment === 'positive' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                                                        feed.sentiment === 'negative' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' :
                                                        'bg-slate-800 text-slate-300'
                                                    }`}>
                                                        {feed.sentiment === 'positive' ? 'Positif' : feed.sentiment === 'negative' ? 'Negatif' : 'Netral'}
                                                    </span>
                                                    <span className="text-slate-400">
                                                        Suhu Isu: <strong className="text-amber-300">{feed.velocity_score}%</strong>
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}