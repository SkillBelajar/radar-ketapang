import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    CheckCircle2,
    Circle,
    Copy,
    Check,
    RefreshCw,
    RotateCcw,
    ExternalLink,
    ShieldCheck,
    AlertTriangle,
    Terminal,
    Key,
    UserCheck,
    Database,
    Zap,
    Cpu,
    Radio,
    ChevronDown,
    ChevronUp,
    BookmarkCheck,
    HelpCircle,
    Info
} from 'lucide-react';

export default function ChecklistIndex({ steps = [], progress = { total: 10, completed: 0, percent: 0 }, dummyData = {}, appVersion = '1.0 (Release Candidate)' }) {
    const { flash = {} } = usePage().props;

    // Local state for interactive checklist
    const [checklistState, setChecklistState] = useState(
        steps.map(s => ({
            step_key: s.key,
            is_checked: !!s.is_checked,
            tester_notes: s.tester_notes || ''
        }))
    );

    const [copiedKey, setCopiedKey] = useState(null);
    const [filterCategory, setFilterCategory] = useState('all');
    const [isSaving, setIsSaving] = useState(false);
    const [showDummyCard, setShowDummyCard] = useState(true);

    // Hitung progres saat ini dari state lokal
    const totalCount = checklistState.length;
    const completedCount = checklistState.filter(s => s.is_checked).length;
    const currentPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Copy to clipboard helper
    const handleCopy = (text, key) => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                setCopiedKey(key);
                setTimeout(() => setCopiedKey(null), 2000);
            });
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                setCopiedKey(key);
                setTimeout(() => setCopiedKey(null), 2000);
            } catch (err) {
                console.error('Copy fallback failed', err);
            }
            document.body.removeChild(textArea);
        }
    };

    // Toggle centang per langkah
    const handleToggle = (stepKey) => {
        const item = checklistState.find(s => s.step_key === stepKey);
        const newChecked = !item?.is_checked;

        // Update state lokal seketika
        setChecklistState(prev => prev.map(s => {
            if (s.step_key === stepKey) {
                return { ...s, is_checked: newChecked };
            }
            return s;
        }));

        // Kirim request ke backend untuk disimpan di database
        router.post('/checklist/toggle', {
            step_key: stepKey,
            is_checked: newChecked,
            tester_notes: item?.tester_notes || ''
        }, {
            preserveScroll: true,
            preserveState: true
        });
    };

    // Update catatan per langkah
    const handleNotesChange = (stepKey, value) => {
        setChecklistState(prev => prev.map(s => {
            if (s.step_key === stepKey) {
                return { ...s, tester_notes: value };
            }
            return s;
        }));
    };

    // Simpan semua state sekaligus
    const handleSaveAll = () => {
        setIsSaving(true);
        router.post('/checklist/save', {
            items: checklistState
        }, {
            preserveScroll: true,
            onFinish: () => setIsSaving(false)
        });
    };

    // Reset progres
    const handleReset = () => {
        if (confirm('Yakin ingin mereset seluruh progres checklist ke 0%?')) {
            router.post('/checklist/reset', {}, {
                preserveScroll: true,
                onSuccess: () => {
                    setChecklistState(prev => prev.map(s => ({ ...s, is_checked: false })));
                }
            });
        }
    };

    // Segarkan Data Dummy
    const handleSeedDemo = () => {
        if (confirm('Segarkan seluruh data dummy (berita krisis, target setup, dan notifikasi) ke kondisi siap uji standar?')) {
            router.post('/checklist/seed-demo', {}, {
                preserveScroll: true
            });
        }
    };

    // Filter list
    const filteredSteps = steps.filter(step => {
        const itemState = checklistState.find(s => s.step_key === step.key);
        if (filterCategory === 'pending') return !itemState?.is_checked;
        if (filterCategory === 'completed') return !!itemState?.is_checked;
        return true;
    });

    return (
        <AuthenticatedLayout>
            <Head title="Lembar Pemeriksaan Sistem // Radar Berita Ketapang" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">

                {/* Toast Notification */}
                {(flash?.success || flash?.message) && (
                    <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 flex items-center justify-between text-sm shadow-lg shadow-emerald-950/30">
                        <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <span>{flash.success || flash.message}</span>
                        </div>
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 flex items-center justify-between text-sm shadow-lg shadow-rose-950/30">
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                            <span>{flash.error}</span>
                        </div>
                    </div>
                )}

                {/* Header Title & Mission Command */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div>
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-400 text-xs font-medium tracking-wider mb-2">
                            <BookmarkCheck className="w-3.5 h-3.5" />
                            <span>LEMBAR PEMERIKSAAN FITUR // 10 LANGKAH PENGUJIAN</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                            LEMBAR PEMERIKSAAN MANDIRI <span className="text-cyan-400 font-sans">(PANDUAN UJI COBA)</span>
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            Panduan praktis untuk mencoba seluruh fitur aplikasi secara langsung langkah demi langkah.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={handleSeedDemo}
                            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 border border-amber-600/50 text-amber-300 text-xs font-medium transition cursor-pointer"
                            title="Segarkan data contoh ke kondisi awal"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Segarkan Contoh Berita</span>
                        </button>
                        <button
                            onClick={handleReset}
                            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 text-rose-300 text-xs font-medium transition cursor-pointer"
                            title="Reset checklist menjadi 0%"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Atur Ulang Centang</span>
                        </button>
                        <button
                            onClick={handleSaveAll}
                            disabled={isSaving}
                            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-950/50 disabled:opacity-50 cursor-pointer"
                        >
                            <BookmarkCheck className="w-4 h-4" />
                            <span>{isSaving ? 'Menyimpan...' : 'Simpan Semua Hasil'}</span>
                        </button>
                    </div>
                </div>

                {/* Progress Summary Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800 shadow-xl flex items-center space-x-5">
                        <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-slate-800"
                                    strokeWidth="3.5"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className={`transition-all duration-700 ease-out ${
                                        currentPercent === 100
                                            ? 'text-emerald-400'
                                            : currentPercent > 50
                                            ? 'text-cyan-400'
                                            : 'text-amber-400'
                                    }`}
                                    strokeDasharray={`${currentPercent}, 100`}
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <span className="absolute text-xl font-bold font-mono text-white">
                                {currentPercent}%
                            </span>
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">HASIL PEMERIKSAAN</div>
                            <div className="text-xl font-bold text-white mt-0.5">
                                {completedCount} <span className="text-slate-500 text-sm font-normal">/ {totalCount} Selesai</span>
                            </div>
                            <div className="mt-1">
                                {currentPercent === 100 ? (
                                    <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-400">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Semua Langkah Lolos Uji (Siap Pakai)</span>
                                    </span>
                                ) : currentPercent > 0 ? (
                                    <span className="text-xs font-semibold text-cyan-400">
                                        Pemeriksaan Sedang Berjalan
                                    </span>
                                ) : (
                                    <span className="text-xs text-slate-500">
                                        Belum Ada Langkah Tercentang
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-xs uppercase text-slate-400 tracking-wider font-bold">BAGIAN YANG DIPERIKSA</span>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-bold">10 Langkah</span>
                        </div>
                        <div className="text-sm text-slate-300 mt-2 space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Masuk Akun & Keamanan</span>
                                <span className="text-cyan-400 font-medium">Langkah 1 & 2</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Pengaturan & Penarik Berita</span>
                                <span className="text-cyan-400 font-medium">Langkah 3 & 4</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Posko Berita & Tanggapan Cepat</span>
                                <span className="text-cyan-400 font-medium">Langkah 5 & 6</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Ruang Naskah & Laporan Grafik</span>
                                <span className="text-cyan-400 font-medium">Langkah 7 s/d 10</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-xs uppercase text-slate-400 tracking-wider font-bold">KESIAPAN APLIKASI</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-[10px] text-emerald-400 font-bold">SIAP PAKAI</span>
                        </div>
                        <div className="text-xs text-slate-300 space-y-1.5 mt-2">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Versi Aplikasi:</span>
                                <span className="text-white font-semibold">1.0 (Release Candidate)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Kecepatan Respons:</span>
                                <span className="text-emerald-400 font-medium">Cepat & Ringan</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Tampilan Layar HP:</span>
                                <span className="text-emerald-400 font-medium">Rapi & Pas di Layar</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Collapsible Quick Credentials & Dummy Data Card */}
                <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
                    <div
                        onClick={() => setShowDummyCard(!showDummyCard)}
                        className="p-4 bg-slate-850/80 hover:bg-slate-800/80 border-b border-slate-800 flex items-center justify-between cursor-pointer transition"
                    >
                        <div className="flex items-center space-x-2.5">
                            <Key className="w-4 h-4 text-cyan-400" />
                            <span className="font-bold text-sm text-white tracking-wider">
                                KARTU AKUN CONTOH & PERINTAH UJI CEPAT
                            </span>
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                                Klik untuk {showDummyCard ? 'Sembunyikan' : 'Buka'}
                            </span>
                        </div>
                        {showDummyCard ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>

                    {showDummyCard && (
                        <div className="p-5 space-y-6">
                            {/* Akun Multi-Role */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                                    <UserCheck className="w-4 h-4 text-emerald-400" />
                                    <span>1. Tiga Akun Peran untuk Uji Coba (Kata Sandi Seluruh Akun: <code className="text-amber-300">password</code>)</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {dummyData?.accounts?.map((acc, idx) => (
                                        <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-[11px] font-bold uppercase ${
                                                    acc.role === 'admin' ? 'text-rose-400' : acc.role === 'timses' ? 'text-cyan-400' : 'text-amber-400'
                                                }`}>
                                                    {acc.label}
                                                </span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                                    {acc.role}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mb-2">{acc.access}</p>
                                            <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200">
                                                <span className="truncate mr-2">{acc.email}</span>
                                                <button
                                                    onClick={() => handleCopy(acc.email, `email_${acc.role}`)}
                                                    className="p-1 hover:text-cyan-400 transition cursor-pointer"
                                                    title="Salin Email"
                                                >
                                                    {copiedKey === `email_${acc.role}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Perintah cURL Uji API */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                                    <Terminal className="w-4 h-4 text-cyan-400" />
                                    <span>2. Perintah Uji Pembacaan Berita Asisten Cerdas (Terminal)</span>
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                            <span>Ambil Berita yang Belum Diproses (GET /fetch-news)</span>
                                            <button
                                                onClick={() => handleCopy(dummyData?.sample_curl?.fetch, 'curl_fetch')}
                                                className="inline-flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 cursor-pointer"
                                            >
                                                {copiedKey === 'curl_fetch' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                <span>{copiedKey === 'curl_fetch' ? 'Tersalin! ✅' : 'Salin Perintah'}</span>
                                            </button>
                                        </div>
                                        <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                                            {dummyData?.sample_curl?.fetch}
                                        </pre>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                            <span>Kirim Hasil Analisis Berita (POST /webhook)</span>
                                            <button
                                                onClick={() => handleCopy(dummyData?.sample_curl?.webhook, 'curl_webhook')}
                                                className="inline-flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 cursor-pointer"
                                            >
                                                {copiedKey === 'curl_webhook' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                <span>{copiedKey === 'curl_webhook' ? 'Tersalin! ✅' : 'Salin Perintah'}</span>
                                            </button>
                                        </div>
                                        <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                                            {dummyData?.sample_curl?.webhook}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setFilterCategory('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                                filterCategory === 'all'
                                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Semua Langkah ({totalCount})
                        </button>
                        <button
                            onClick={() => setFilterCategory('pending')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                                filterCategory === 'pending'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Belum Selesai ({totalCount - completedCount})
                        </button>
                        <button
                            onClick={() => setFilterCategory('completed')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                                filterCategory === 'completed'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Sudah Selesai ({completedCount})
                        </button>
                    </div>

                    <span className="text-xs text-slate-500 hidden sm:inline">
                        Klik tombol di kanan atau centang kotak untuk menyimpan progres Anda
                    </span>
                </div>

                {/* Step-by-Step Checklist Cards */}
                <div className="space-y-4">
                    {filteredSteps.map((step) => {
                        const localState = checklistState.find(s => s.step_key === step.key);
                        const isChecked = !!localState?.is_checked;

                        return (
                            <div
                                key={step.key}
                                className={`rounded-2xl transition-all duration-200 border overflow-hidden ${
                                    isChecked
                                        ? 'bg-slate-900/40 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-md'
                                }`}
                            >
                                <div className="p-5 space-y-4">
                                    {/* Top Bar Card */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start space-x-3.5">
                                            {/* Interactive Checkbox */}
                                            <button
                                                type="button"
                                                onClick={() => handleToggle(step.key)}
                                                className={`mt-1 w-6 h-6 rounded-md flex items-center justify-center transition border cursor-pointer ${
                                                    isChecked
                                                        ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30'
                                                        : 'border-slate-600 hover:border-cyan-400 bg-slate-950 text-transparent'
                                                }`}
                                                title={isChecked ? 'Klik untuk batal centang' : 'Klik untuk menandai sudah selesai'}
                                            >
                                                <Check className="w-4 h-4 stroke-[3]" />
                                            </button>

                                            <div>
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-400 border border-slate-700">
                                                        {step.slice}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded text-[10px] text-slate-400 bg-slate-950 border border-slate-800">
                                                        {step.category}
                                                    </span>
                                                    <span className="text-[11px] text-slate-500">
                                                        Hak Akses: <span className="text-slate-300 font-medium">{step.role_required}</span>
                                                    </span>
                                                    {isChecked && (
                                                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-[10px] text-emerald-400 font-bold">
                                                            <Check className="w-3 h-3" />
                                                            <span>SUDAH DIUJI</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <h2 className={`text-base sm:text-lg font-bold ${
                                                    isChecked ? 'text-emerald-300 line-through' : 'text-white'
                                                }`}>
                                                    {step.title}
                                                </h2>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {step.summary}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Direct Test Link */}
                                        {step.target_url && (
                                            <Link
                                                href={step.target_url}
                                                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950/80 hover:text-cyan-300 border border-slate-700 hover:border-cyan-700 text-slate-300 text-xs transition shrink-0 cursor-pointer"
                                            >
                                                <span>Buka Halaman Uji</span>
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </Link>
                                        )}
                                    </div>

                                    {/* Detailed Step-by-Step Instructions */}
                                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                                        <div className="text-[11px] font-bold uppercase text-cyan-400 tracking-wider">
                                            CARA MELAKUKAN PENGUJIAN:
                                        </div>
                                        <ol className="space-y-1.5 list-decimal list-inside text-xs text-slate-300">
                                            {step.steps?.map((subStep, sIdx) => (
                                                <li key={sIdx} className="leading-relaxed pl-1">
                                                    <span className="text-slate-200">{subStep}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>

                                    {/* Tester Notes & Quick Action Bar */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-3 pt-2">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-slate-400 mb-1">
                                                CATATAN ATAU TEMUAN ANDA:
                                            </label>
                                            <textarea
                                                rows="2"
                                                value={localState?.tester_notes || ''}
                                                onChange={(e) => handleNotesChange(step.key, e.target.value)}
                                                placeholder="Tuliskan pengalaman atau hasil pengujian Anda di sini (misal: 'Semua tombol berjalan normal')..."
                                                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-0 text-xs text-slate-200 placeholder-slate-600 resize-none font-sans transition"
                                            />
                                        </div>

                                        <div className="flex items-center justify-end space-x-2">
                                            {step.target_url && (
                                                <Link
                                                    href={step.target_url}
                                                    className="sm:hidden inline-flex items-center space-x-1 px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
                                                >
                                                    <span>Uji Halaman</span>
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Link>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => handleToggle(step.key)}
                                                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                                                    isChecked
                                                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
                                                }`}
                                            >
                                                {isChecked ? (
                                                    <>
                                                        <RotateCcw className="w-3 h-3" />
                                                        <span>Batal Centang</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="w-3.5 h-3.5" />
                                                        <span>Tandai Selesai</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Save Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>
                            Status centang setiap langkah tersimpan otomatis saat Anda mengeklik centang. Anda juga bisa menekan tombol simpan untuk mengunci seluruh catatan temuan sekaligus.
                        </span>
                    </div>

                    <button
                        onClick={handleSaveAll}
                        disabled={isSaving}
                        className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-950/50 disabled:opacity-50 cursor-pointer"
                    >
                        <BookmarkCheck className="w-4 h-4" />
                        <span>{isSaving ? 'Menyimpan Hasil...' : 'Simpan Semua Hasil Uji'}</span>
                    </button>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
