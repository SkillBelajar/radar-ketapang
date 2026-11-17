import React, { useState, useRef, useEffect } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import { 
    Radio, Shield, Terminal, LogOut, User, Menu, X, 
    BookOpen, Activity, Compass, Cpu, Bell, CheckCircle2,
    Sliders, FileText, Share2, Flame, AlertTriangle, ExternalLink,
    Check, Sparkles, BarChart3, ClipboardCheck
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, appName = 'Radar Politik', appVersion = '1.0 (Release Candidate)', notifications = { unread_count: 0, recent: [] } } = usePage().props;
    const { url } = usePage();
    const user = auth?.user;
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const notifDropdownRef = useRef(null);

    const unreadCount = notifications?.unread_count || 0;
    const recentNotifs = notifications?.recent || [];

    // Close notifications dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
        };

        if (notificationsOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [notificationsOpen]);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const handleMarkAsRead = (notif, e) => {
        e.preventDefault();
        router.post(`/notifications/${notif.id}/read`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setNotificationsOpen(false);
                if (notif.data?.url) {
                    router.visit('/dashboard');
                }
            }
        });
    };

    const handleMarkAllAsRead = (e) => {
        e.preventDefault();
        router.post('/notifications/mark-all-read', {}, {
            preserveScroll: true,
        });
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin':
                return {
                    label: 'ADMIN',
                    code: 'Pengelola',
                    bg: 'bg-red-950/70 text-red-300 border-red-500/50',
                    dot: 'bg-red-400',
                };
            case 'timses':
                return {
                    label: 'TIMSES',
                    code: 'Pemantau Isu',
                    bg: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50',
                    dot: 'bg-emerald-400',
                };
            case 'influencer':
                return {
                    label: 'TIM MEDIA',
                    code: 'Humas & Pers',
                    bg: 'bg-teal-950/70 text-teal-300 border-teal-500/50',
                    dot: 'bg-teal-400',
                };
            default:
                return {
                    label: user ? 'PENGGUNA' : 'PENGUJI UAT',
                    code: user ? 'Anggota' : 'Mode Terbuka',
                    bg: user ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500/50' : 'bg-amber-950/70 text-amber-300 border-amber-500/50',
                    dot: user ? 'bg-cyan-400' : 'bg-amber-400',
                };
        }
    };

    const roleInfo = getRoleBadge(user?.role);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 cyber-grid flex flex-col relative selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden w-full max-w-full">
            {/* Ambient Cyber Aura Glows */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-0"></div>
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-0"></div>

            {/* Top Command Center Telemetry Bar */}
            <header className="sticky top-0 z-50 border-b border-cyan-950/80 bg-slate-950/90 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left Brand & Live Radar Dot */}
                        <div className="flex items-center gap-3">
                            <Link href="/" className="flex items-center gap-2 group">
                                <div className="w-9 h-9 rounded-lg bg-slate-900 border border-cyan-500/40 flex items-center justify-center relative overflow-hidden group-hover:border-cyan-400 transition-colors">
                                    <Radio className="w-5 h-5 text-cyan-400" />
                                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-black text-sm tracking-wider text-white group-hover:text-cyan-300 transition-colors uppercase">
                                            RADAR POLITIK
                                        </span>
                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                                            KETAPANG
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 hidden sm:block">
                                        Pemantau Berita & Isu Politik
                                    </span>
                                </div>
                            </Link>

                            {/* Desktop Nav Items */}
                            <nav className="hidden md:flex items-center space-x-1.5 ml-6 text-xs">
                                <Link
                                    href="/dashboard"
                                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
                                        url.startsWith('/dashboard')
                                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                                            : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800'
                                    }`}
                                >
                                    <Activity className="w-3.5 h-3.5 text-rose-400" />
                                    <span>PAPAN BERITA</span>
                                </Link>

                                {/* Ruang Draf Media & Pers */}
                                <Link
                                    href="/studio"
                                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
                                        url.startsWith('/studio')
                                            ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                                            : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800'
                                    }`}
                                >
                                    <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>RUANG MEDIA & PERS</span>
                                </Link>

                                {/* Modul Evaluasi (Grafik & Tren) */}
                                <Link
                                    href="/analytics"
                                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
                                        url.startsWith('/analytics')
                                            ? 'bg-purple-950/80 text-purple-300 border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                                            : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800'
                                    }`}
                                >
                                    <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                                    <span>GRAFIK & TREN</span>
                                </Link>

                                {/* UAT Checklist Lembar Pengujian */}
                                <Link
                                    href="/checklist"
                                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
                                        url.startsWith('/checklist')
                                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                                            : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800'
                                    }`}
                                >
                                    <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>LEMBAR PENGUJIAN</span>
                                </Link>

                                <Link
                                    href="/target-setup"
                                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
                                        url.startsWith('/target-setup')
                                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                                            : user?.role === 'influencer'
                                            ? 'text-slate-400 hover:text-rose-300 hover:bg-slate-900 border border-slate-800'
                                            : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800'
                                    }`}
                                    title={user?.role === 'influencer' ? 'Pengaturan Sasaran (Akses Dibatasi Khusus Pengelola & Timses)' : 'Pengaturan Sasaran & Kata Kunci'}
                                >
                                    <Radio className={`w-3.5 h-3.5 ${user?.role === 'influencer' ? 'text-rose-400' : 'text-emerald-400'}`} />
                                    <span>PENGATURAN SASARAN</span>
                                    {user?.role === 'influencer' && (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950/90 text-rose-300 border border-rose-500/50 font-mono">
                                            403
                                        </span>
                                    )}
                                </Link>

                                <Link
                                    href="/user-guide"
                                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
                                        url.startsWith('/user-guide')
                                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                                            : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800'
                                    }`}
                                >
                                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                                    <span>PANDUAN</span>
                                </Link>
                            </nav>
                        </div>

                        {/* Right Area: In-App Alerts Bell + User Call-Sign + Logout */}
                        <div className="flex items-center space-x-3">
                            {/* In-App Alerts Bell Dropdown (Slice 6) */}
                            <div className="relative" ref={notifDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                                    className={`relative p-2 rounded-lg border transition-all cursor-pointer group ${
                                        notificationsOpen
                                            ? 'bg-cyan-950 border-cyan-500/60 text-cyan-300'
                                            : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                                    }`}
                                    aria-label="Lonceng Notifikasi Krisis"
                                    title="Notifikasi Real-Time Radar Krisis"
                                >
                                    <Bell className={`w-4 h-4 transition-transform group-hover:scale-110 ${unreadCount > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
                                    
                                    {/* Red Badge Indicator */}
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[9px] font-mono font-bold text-white shadow-[0_0_10px_rgba(225,29,72,0.8)] animate-pulse">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Dropdown Menu Panel */}
                                {notificationsOpen && (
                                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900/95 border border-cyan-950 shadow-2xl backdrop-blur-xl z-50 overflow-hidden font-mono text-xs animate-in fade-in zoom-in-95 duration-150">
                                        {/* Dropdown Header */}
                                        <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-md bg-rose-950/80 border border-rose-500/50 flex items-center justify-center">
                                                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-white tracking-wide">
                                                        ALERT KRISIS RADAR
                                                    </span>
                                                    <div className="text-[10px] text-slate-400">
                                                        {unreadCount} peringatan belum terbaca
                                                    </div>
                                                </div>
                                            </div>

                                            {unreadCount > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={handleMarkAllAsRead}
                                                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold hover:underline cursor-pointer"
                                                >
                                                    Tandai Semua Terbaca
                                                </button>
                                            )}
                                        </div>

                                        {/* Notification Items List */}
                                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                                            {recentNotifs.length === 0 ? (
                                                <div className="p-8 text-center text-slate-500">
                                                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/40 mb-2" />
                                                    <p className="font-bold text-slate-400">Situasi Kondusif</p>
                                                    <p className="text-[11px] text-slate-500 mt-1">Belum ada sinyal isu berkecepatan tinggi terdeteksi.</p>
                                                </div>
                                            ) : (
                                                recentNotifs.map((notif) => {
                                                    const data = notif.data || {};
                                                    const isUnread = !notif.read_at;
                                                    const isDanger = data.level === 'danger' || data.level === 'integrity';
                                                    const isWarning = data.level === 'warning';

                                                    return (
                                                        <div
                                                            key={notif.id}
                                                            onClick={(e) => handleMarkAsRead(notif, e)}
                                                            className={`p-3.5 transition-colors cursor-pointer hover:bg-slate-800/60 flex items-start gap-3 ${
                                                                isUnread
                                                                    ? isDanger
                                                                        ? 'bg-rose-950/20 border-l-2 border-l-rose-500'
                                                                        : 'bg-amber-950/20 border-l-2 border-l-amber-500'
                                                                    : 'bg-slate-950/40 opacity-75'
                                                            }`}
                                                        >
                                                            <div className="mt-0.5 flex-shrink-0">
                                                                {isDanger ? (
                                                                    <div className="w-6 h-6 rounded-full bg-rose-950 border border-rose-500 flex items-center justify-center">
                                                                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                                                                    </div>
                                                                ) : isWarning ? (
                                                                    <div className="w-6 h-6 rounded-full bg-amber-950 border border-amber-500 flex items-center justify-center">
                                                                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500 flex items-center justify-center">
                                                                        <Radio className="w-3.5 h-3.5 text-cyan-400" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between gap-1 mb-1">
                                                                    <span className={`text-[11px] font-bold truncate ${isDanger ? 'text-rose-300' : isWarning ? 'text-amber-300' : 'text-cyan-300'}`}>
                                                                        {data.title || 'Peringatan Radar Krisis'}
                                                                    </span>
                                                                    {isUnread && (
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0"></span>
                                                                    )}
                                                                </div>

                                                                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                                                                    {data.message || data.news_title || 'Peringatan krisis baru terdeteksi oleh sistem.'}
                                                                </p>

                                                                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                                                                    <span>{notif.created_at || 'Baru saja'}</span>
                                                                    <span className="text-cyan-400 font-semibold flex items-center gap-0.5 hover:underline">
                                                                        Cek Analisis <ExternalLink className="w-2.5 h-2.5" />
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>

                                        {/* Dropdown Footer Actions */}
                                        <div className="p-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                                            <Link
                                                href="/dashboard"
                                                onClick={() => setNotificationsOpen(false)}
                                                className="text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
                                            >
                                                <span>Dasbor Krisis</span>
                                            </Link>
                                            <Link
                                                href="/studio"
                                                onClick={() => setNotificationsOpen(false)}
                                                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                                            >
                                                <span>Content Studio (S6)</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Info & Role (Desktop) */}
                            {user ? (
                                <div className="hidden md:flex items-center space-x-3">
                                    {/* Role Badge */}
                                    <div className={`px-2.5 py-1 rounded-md border font-mono text-xs flex items-center gap-2 ${roleInfo.bg}`}>
                                        <span className={`w-2 h-2 rounded-full ${roleInfo.dot} animate-pulse`}></span>
                                        <span className="font-bold">{roleInfo.label}</span>
                                        <span className="text-[10px] opacity-75 hidden lg:inline">({roleInfo.code})</span>
                                    </div>

                                    {/* User Name & Callsign */}
                                    <div className="text-right font-mono">
                                        <div className="text-xs font-bold text-white leading-tight">
                                            {user.name}
                                        </div>
                                        <div className="text-[10px] text-cyan-400/80 leading-tight">
                                            {user.email}
                                        </div>
                                    </div>

                                    {/* Logout Action */}
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-red-950/60 border border-slate-700 hover:border-red-500/60 text-slate-300 hover:text-red-300 text-xs font-medium transition-all cursor-pointer"
                                        title="Keluar dari akun Anda"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                        <span>KELUAR</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center space-x-2.5">
                                    <div className="px-2.5 py-1 rounded-md border border-amber-500/40 bg-amber-950/50 text-amber-300 font-mono text-xs flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                                        <span className="font-bold">MODE TERBUKA</span>
                                        <span className="text-[10px] opacity-75 hidden lg:inline">(Tanpa Login)</span>
                                    </div>
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-950/50 cursor-pointer"
                                    >
                                        <User className="w-3.5 h-3.5" />
                                        <span>MASUK / LOGIN</span>
                                    </Link>
                                </div>
                            )}

                            {/* Mobile / Compact Header Controls (Always Accessible) */}
                            <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
                                <div className={`px-2 py-0.5 rounded text-[10px] font-mono border ${roleInfo.bg}`}>
                                    {user ? roleInfo.label : 'TERBUKA'}
                                </div>

                                {user ? (
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-950/80 hover:bg-red-900 border border-red-500/70 text-red-200 text-xs font-bold transition shadow-sm cursor-pointer"
                                        title="Keluar dari akun Anda"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                        <span>KELUAR</span>
                                    </button>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold transition shadow-sm cursor-pointer"
                                    >
                                        <User className="w-3 h-3" />
                                        <span>MASUK</span>
                                    </Link>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setMobileNavOpen(!mobileNavOpen)}
                                    className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-900 border border-slate-800"
                                    aria-label="Toggle navigation"
                                >
                                    {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Drawer Menu */}
                {mobileNavOpen && (
                    <div className="md:hidden border-b border-cyan-950 bg-slate-950/95 px-4 pt-3 pb-4 space-y-3 font-mono text-xs backdrop-blur-xl">
                        {user ? (
                            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                                <div className="space-y-0.5">
                                    <div className="text-[10px] text-slate-400 uppercase">Operator Terautentikasi</div>
                                    <div className="text-sm font-bold text-white">{user.name}</div>
                                    <div className="text-xs text-cyan-400 truncate max-w-[180px]">{user.email}</div>
                                    <div className="pt-0.5">
                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] border ${roleInfo.bg}`}>
                                            Peran: {roleInfo.label} ({roleInfo.code})
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/70 text-red-200 text-xs font-bold transition shadow-md cursor-pointer shrink-0"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span>KELUAR</span>
                                </button>
                            </div>
                        ) : (
                            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-amber-300">Mode Terbuka (Tanpa Login)</span>
                                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-900 text-amber-200">UAT</span>
                                </div>
                                <p className="text-[11px] text-slate-300 font-sans">
                                    Anda sedang mencoba lembar pemeriksaan fitur secara langsung tanpa perlu login.
                                </p>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
                                >
                                    <User className="w-3.5 h-3.5" />
                                    <span>Masuk ke Akun Tim</span>
                                </Link>
                            </div>
                        )}

                        <div className="space-y-1">
                            <Link
                                href="/dashboard"
                                className={`block px-3 py-2 rounded-lg font-bold ${
                                    url.startsWith('/dashboard')
                                        ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                                        : 'text-slate-300 hover:bg-slate-900 border border-slate-800'
                                }`}
                            >
                                <Activity className="w-3.5 h-3.5 inline mr-2 text-rose-400" />
                                Papan Berita
                            </Link>

                            <Link
                                href="/studio"
                                className={`block px-3 py-2 rounded-lg font-bold ${
                                    url.startsWith('/studio')
                                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                                        : 'text-slate-300 hover:bg-slate-900 border border-slate-800'
                                }`}
                            >
                                <Share2 className="w-3.5 h-3.5 inline mr-2 text-cyan-400" />
                                Ruang Media & Pers
                            </Link>

                            <Link
                                href="/analytics"
                                className={`block px-3 py-2 rounded-lg font-bold ${
                                    url.startsWith('/analytics')
                                        ? 'bg-purple-950 text-purple-300 border border-purple-500/50'
                                        : 'text-slate-300 hover:bg-slate-900 border border-slate-800'
                                }`}
                            >
                                <BarChart3 className="w-3.5 h-3.5 inline mr-2 text-purple-400" />
                                Grafik & Tren
                            </Link>

                            <Link
                                href="/checklist"
                                className={`block px-3 py-2 rounded-lg font-bold ${
                                    url.startsWith('/checklist')
                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                                        : 'text-slate-300 hover:bg-slate-900 border border-slate-800'
                                }`}
                            >
                                <ClipboardCheck className="w-3.5 h-3.5 inline mr-2 text-emerald-400" />
                                Lembar Pengujian (UAT)
                            </Link>

                            <Link
                                href="/target-setup"
                                className={`flex items-center justify-between px-3 py-2 rounded-lg font-bold ${
                                    url.startsWith('/target-setup')
                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                                        : user?.role === 'influencer'
                                        ? 'text-slate-400 hover:bg-slate-900 border border-slate-800'
                                        : 'text-slate-300 hover:bg-slate-900 border border-slate-800'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Radio className={`w-3.5 h-3.5 ${user?.role === 'influencer' ? 'text-rose-400' : 'text-emerald-400'}`} />
                                    <span>Pengaturan Sasaran</span>
                                </div>
                                {user?.role === 'influencer' && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/50 font-mono">
                                        Terkunci (403)
                                    </span>
                                )}
                            </Link>

                            <Link
                                href="/user-guide"
                                className={`block px-3 py-2 rounded-lg font-bold ${
                                    url.startsWith('/user-guide')
                                        ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                                        : 'text-slate-300 hover:bg-slate-900 border border-slate-800'
                                }`}
                            >
                                <BookOpen className="w-3.5 h-3.5 inline mr-2 text-amber-400" />
                                Panduan Pengguna
                            </Link>
                        </div>

                        {user && (
                            <div className="pt-2 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-950/60 border border-red-500/60 text-red-300 font-bold hover:bg-red-900/60 transition-colors cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>KELUAR DARI AKUN</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </header>

            {/* Optional Sub-header / Breadcrumb */}
            {header && (
                <div className="border-b border-slate-900 bg-slate-950/60 relative z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        {header}
                    </div>
                </div>
            )}

            {/* Main Interactive Screen */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
                {children}
            </main>

            {/* Cyber Security Command Center Authenticated Footer */}
            <footer className="border-t border-cyan-950 bg-slate-950/90 backdrop-blur-md relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Radio className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Radar Politik Ketapang • Sistem Pemantau Isu Berita</span>
                        </div>

                        {user && (
                            <div className="flex flex-wrap items-center justify-center gap-2 text-slate-400">
                                <span className="text-slate-500">Masuk sebagai:</span>
                                <span className="font-mono font-bold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                    {user.email}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${roleInfo.bg}`}>
                                    {roleInfo.label}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-red-950/70 border border-slate-700 hover:border-red-500/60 text-slate-300 hover:text-red-300 text-xs font-semibold transition cursor-pointer"
                                    title="Keluar dari akun Anda"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span>Keluar Akun</span>
                                </button>
                            </div>
                        )}

                        {/* CRITICAL: Prominent Version 1.0 (Release Candidate) Display */}
                        <div className="flex items-center space-x-3">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.25)] text-cyan-300 text-xs font-semibold tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                <span className="text-slate-400">SISTEM:</span>
                                <span className="text-white font-bold tracking-widest bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                                    Versi: 1.0 (Release Candidate)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
