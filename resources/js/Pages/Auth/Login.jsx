import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { 
    Lock, ShieldAlert, KeyRound, AlertCircle, ArrowRight, 
    ShieldCheck, Terminal, UserCheck, Eye, EyeOff, Radio, Cpu
} from 'lucide-react';

export default function Login({ status, appVersion = '1.0 (Release Candidate)' }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    const setQuickAccount = (email, password = 'password') => {
        setData((prev) => ({
            ...prev,
            email,
            password,
        }));
    };

    return (
        <GuestLayout>
            <Head title="Portal Akses Tertutup - Radar Politik Ketapang" />

            <div className="max-w-md w-full mx-auto space-y-6">
                {/* Security Classification Header Banner */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-500/50 text-red-400 font-mono text-[11px] shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                        <span className="tracking-widest uppercase font-bold">RESTRICTED AREA // TINGKAT KEAMANAN DEFCON-2</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-mono">
                        Portal Login Eksklusif
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 font-sans">
                        Sistem Intelijen Media & Analisis Isu Politik Kabupaten Ketapang
                    </p>
                </div>

                {/* Session Status Notification */}
                {status && (
                    <div className="p-3.5 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-mono flex items-center gap-2 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{status}</span>
                    </div>
                )}

                {/* Quick Test Accounts Switcher (Slice 2 Testing Aid) */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                    <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[11px] font-mono font-bold text-cyan-400 flex items-center gap-1.5 uppercase">
                            <Terminal className="w-3.5 h-3.5" />
                            <span>1-Klik Akun Pengujian (Slice 2)</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                            SEEDED
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => setQuickAccount('admin@radar.com')}
                            className="p-2 rounded-lg bg-slate-950 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-500 text-left transition-all group cursor-pointer"
                        >
                            <div className="text-[10px] font-mono text-cyan-400 font-bold flex items-center justify-between">
                                <span>ADMIN</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform"></span>
                            </div>
                            <div className="text-[9px] font-mono text-slate-400 truncate mt-0.5">admin@radar.com</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setQuickAccount('timses@radar.com')}
                            className="p-2 rounded-lg bg-slate-950 hover:bg-emerald-950/80 border border-slate-800 hover:border-emerald-500 text-left transition-all group cursor-pointer"
                        >
                            <div className="text-[10px] font-mono text-emerald-400 font-bold flex items-center justify-between">
                                <span>TIMSES</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform"></span>
                            </div>
                            <div className="text-[9px] font-mono text-slate-400 truncate mt-0.5">timses@radar.com</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setQuickAccount('influencer@radar.com')}
                            className="p-2 rounded-lg bg-slate-950 hover:bg-teal-950/80 border border-slate-800 hover:border-teal-500 text-left transition-all group cursor-pointer"
                        >
                            <div className="text-[10px] font-mono text-teal-400 font-bold flex items-center justify-between">
                                <span>INFLUENCER</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 group-hover:scale-125 transition-transform"></span>
                            </div>
                            <div className="text-[9px] font-mono text-slate-400 truncate mt-0.5">influencer@radar.com</div>
                        </button>
                    </div>
                </div>

                {/* Main Command Center Login Form Box */}
                <div className="relative rounded-2xl bg-slate-900/90 border border-slate-700/80 p-6 sm:p-8 shadow-[0_0_35px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                    <form onSubmit={submit} className="space-y-4">
                        {/* Call-Sign / Email Input */}
                        <div>
                            <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                                <span>Call-Sign Operator / Email</span>
                                <span className="text-[10px] text-cyan-400 lowercase font-normal">wajib terdaftar</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="operator@radar.com"
                                    autoComplete="username"
                                    required
                                    className={`w-full px-4 py-3 rounded-xl bg-slate-950 border ${
                                        errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-cyan-500 focus:ring-cyan-500'
                                    } text-white placeholder-slate-600 text-sm font-mono focus:outline-none focus:ring-2 transition-all`}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-red-400 font-mono flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{errors.email}</span>
                                </p>
                            )}
                        </div>

                        {/* Passkey / Password Input */}
                        <div>
                            <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                                <span>Kunci Sandi Enkripsi</span>
                                <span className="text-[10px] text-slate-400 font-normal">SHA-256 Auth</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••••••"
                                    autoComplete="current-password"
                                    required
                                    className={`w-full pl-4 pr-11 py-3 rounded-xl bg-slate-950 border ${
                                        errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-cyan-500 focus:ring-cyan-500'
                                    } text-white placeholder-slate-600 text-sm font-mono focus:outline-none focus:ring-2 transition-all`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-cyan-400 transition-colors"
                                    tabIndex="-1"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-red-400 font-mono flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{errors.password}</span>
                                </p>
                            )}
                        </div>

                        {/* Remember Session & Encryption Flag */}
                        <div className="flex items-center justify-between pt-1 font-mono text-xs">
                            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-950"
                                />
                                <span>Simpan Sesi Akses</span>
                            </label>
                            <span className="text-[11px] text-cyan-400/80 flex items-center gap-1">
                                <Lock className="w-3 h-3 text-cyan-400" />
                                <span>E2E Session Guard</span>
                            </span>
                        </div>

                        {/* Action Submit Button */}
                        <div className="pt-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className={`w-full py-3.5 px-4 rounded-xl font-bold font-mono text-sm tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] cursor-pointer ${
                                    processing 
                                        ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 active:scale-[0.99]'
                                }`}
                            >
                                {processing ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                                        <span>MEMVERIFIKASI KREDENSIAL...</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4" />
                                        <span>AUTENTIKASI & MASUK COMMAND CENTER</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Security Footnote */}
                    <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                            &larr; Beranda Radar
                        </Link>
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                            Versi: {appVersion}
                        </span>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
