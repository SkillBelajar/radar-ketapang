import React, { useState } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import { 
    Radio, Shield, Terminal, LogOut, User, Menu, X, 
    BookOpen, Activity, Compass, Cpu, Bell, CheckCircle2,
    Sliders, FileText
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, appName = 'Radar Politik', appVersion = '0.11' } = usePage().props;
    const user = auth.user;
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin':
                return {
                    label: 'SUPER ADMIN',
                    code: 'LVL-4 MASTER',
                    bg: 'bg-red-950/70 text-red-300 border-red-500/50',
                    dot: 'bg-red-400',
                };
            case 'timses':
                return {
                    label: 'TIMSES ANALIS',
                    code: 'INTEL OPS',
                    bg: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50',
                    dot: 'bg-emerald-400',
                };
            case 'influencer':
                return {
                    label: 'INFLUENCER',
                    code: 'STUDIO OPS',
                    bg: 'bg-teal-950/70 text-teal-300 border-teal-500/50',
                    dot: 'bg-teal-400',
                };
            default:
                return {
                    label: 'OPERATOR',
                    code: 'STANDARD',
                    bg: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/50',
                    dot: 'bg-cyan-400',
                };
        }
    };

    const roleInfo = getRoleBadge(user?.role);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 cyber-grid flex flex-col relative selection:bg-cyan-500 selection:text-slate-950">
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
                                        <span className="font-mono font-black text-sm tracking-widest text-white group-hover:text-cyan-300 transition-colors uppercase">
                                            RADAR POLITIK
                                        </span>
                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                                            SECURE
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400 hidden sm:block">
                                        Ketapang Intelligence Center
                                    </span>
                                </div>
                            </Link>

                            {/* Desktop Nav Items */}
                            <nav className="hidden md:flex items-center space-x-1 ml-6 font-mono text-xs">
                                <Link
                                    href="/user-guide"
                                    className="px-3 py-1.5 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 font-bold shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                                >
                                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>PANDUAN OPERASIONAL</span>
                                </Link>

                                <span className="px-3 py-1.5 rounded-lg text-slate-500 flex items-center gap-1.5 cursor-not-allowed border border-transparent">
                                    <Activity className="w-3.5 h-3.5" />
                                    <span>RADAR ISU (S3)</span>
                                </span>

                                <span className="px-3 py-1.5 rounded-lg text-slate-500 flex items-center gap-1.5 cursor-not-allowed border border-transparent">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>1-CLICK STUDIO (S7)</span>
                                </span>
                            </nav>
                        </div>

                        {/* Right User Call-Sign & Logout Area */}
                        <div className="hidden md:flex items-center space-x-4">
                            {/* Role Badge */}
                            <div className={`px-2.5 py-1 rounded-md border font-mono text-xs flex items-center gap-2 ${roleInfo.bg}`}>
                                <span className={`w-2 h-2 rounded-full ${roleInfo.dot} animate-pulse`}></span>
                                <span className="font-bold">{roleInfo.label}</span>
                                <span className="text-[10px] opacity-75 hidden lg:inline">({roleInfo.code})</span>
                            </div>

                            {/* User Name & Callsign */}
                            <div className="text-right font-mono">
                                <div className="text-xs font-bold text-white leading-tight">
                                    {user?.name || 'Operator'}
                                </div>
                                <div className="text-[10px] text-cyan-400/80 leading-tight">
                                    {user?.email}
                                </div>
                            </div>

                            {/* Logout Action */}
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-red-950/60 border border-slate-700 hover:border-red-500/60 text-slate-300 hover:text-red-300 text-xs font-mono transition-all cursor-pointer"
                                title="Keluar dari sesi command center"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>LOGOUT</span>
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex md:hidden items-center gap-2">
                            <div className={`px-2 py-0.5 rounded text-[10px] font-mono border ${roleInfo.bg}`}>
                                {roleInfo.label}
                            </div>
                            <button
                                type="button"
                                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                                className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-900 border border-slate-800"
                                aria-label="Toggle navigation"
                            >
                                {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Drawer Menu */}
                {mobileNavOpen && (
                    <div className="md:hidden border-b border-cyan-950 bg-slate-950/95 px-4 pt-3 pb-4 space-y-3 font-mono text-xs backdrop-blur-xl">
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                            <div className="text-[10px] text-slate-400 uppercase">Operator Terautentikasi</div>
                            <div className="text-sm font-bold text-white">{user?.name}</div>
                            <div className="text-xs text-cyan-400">{user?.email}</div>
                            <div className="pt-1">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] border ${roleInfo.bg}`}>
                                    Role: {roleInfo.label} ({roleInfo.code})
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Link
                                href="/user-guide"
                                className="block px-3 py-2 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold"
                            >
                                <BookOpen className="w-3.5 h-3.5 inline mr-2" />
                                Panduan Operasional
                            </Link>

                            <div className="px-3 py-2 rounded-lg text-slate-500 border border-transparent">
                                <Activity className="w-3.5 h-3.5 inline mr-2" />
                                Radar Isu (Slice 3)
                            </div>

                            <div className="px-3 py-2 rounded-lg text-slate-500 border border-transparent">
                                <FileText className="w-3.5 h-3.5 inline mr-2" />
                                1-Click Studio (Slice 7)
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-950/60 border border-red-500/60 text-red-300 font-bold hover:bg-red-900/60 transition-colors cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>LOGOUT DARI SISTEM</span>
                            </button>
                        </div>
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
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                            <span>RADAR POLITIK KETAPANG // MIL-SPEC OPS</span>
                        </div>

                        {/* CRITICAL: Prominent Version 0.11 Display */}
                        <div className="flex items-center space-x-3">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.25)] text-cyan-300 text-xs font-semibold tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                <span className="text-slate-400">SISTEM:</span>
                                <span className="text-white font-bold tracking-widest bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                                    Versi: {appVersion}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
