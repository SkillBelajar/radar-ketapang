import React, { useState } from 'react';
import { Activity, ShieldAlert, Radio, Terminal, Cpu, Lock, Menu, X, ChevronRight } from 'lucide-react';

export default function GuestLayout({ children, title }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 cyber-grid flex flex-col relative selection:bg-cyan-500 selection:text-slate-950 font-sans">
            {/* Top Security & Status Ticker Bar */}
            <div className="border-b border-cyan-900/40 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo & Command Center Title */}
                        <div className="flex items-center space-x-3">
                            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-slate-900 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                                <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 font-mono">
                                        RADAR POLITIK
                                    </span>
                                    <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 rounded">
                                        SECURE OPS
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400 tracking-tight hidden sm:block">
                                    Ketapang Media Intelligence & Reputation Command Center
                                </p>
                            </div>
                        </div>

                        {/* Desktop Status Badges */}
                        <div className="hidden md:flex items-center space-x-4 font-mono text-xs">
                            <div className="flex items-center space-x-2 px-3 py-1 rounded bg-slate-900/90 border border-emerald-500/30 text-emerald-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                                <span>SYS_STATUS: ONLINE</span>
                            </div>
                            <div className="flex items-center space-x-2 px-3 py-1 rounded bg-slate-900/90 border border-cyan-500/30 text-cyan-400">
                                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                                <span>OCTANE: HIGH SPEED</span>
                            </div>
                            <a
                                href="/login"
                                className="flex items-center space-x-2 px-3.5 py-1.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 hover:text-white font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                            >
                                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                                <span>PORTAL LOGIN</span>
                            </a>
                        </div>

                        {/* Mobile Menu Toggle Button */}
                        <div className="flex md:hidden">
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-b border-cyan-900/50 bg-slate-950/95 px-4 pt-3 pb-4 space-y-2 font-mono text-xs">
                        <div className="flex items-center justify-between py-2 border-b border-slate-800">
                            <span className="text-slate-400">STATUS OPERASIONAL</span>
                            <span className="text-emerald-400 font-bold">ONLINE 100%</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-800">
                            <span className="text-slate-400">ENGINE RUNTIME</span>
                            <span className="text-cyan-400 font-bold">LARAVEL 13 OCTANE</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-800">
                            <span className="text-slate-400">RELEASE BUILD</span>
                            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold">
                                Versi: 0.14
                            </span>
                        </div>
                        <div className="pt-2">
                            <a
                                href="/login"
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-cyan-500 text-slate-950 font-bold tracking-wider hover:bg-cyan-400 transition-colors"
                            >
                                <Lock className="w-4 h-4" />
                                <span>AKSES PORTAL LOGIN</span>
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Interactive Content */}
            <main className="flex-1 flex flex-col justify-center relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {children}
            </main>

            {/* Cyber Security Command Center Footer */}
            <footer className="border-t border-cyan-950 bg-slate-950/90 backdrop-blur-md relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* System Metadata & Copyright */}
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-slate-400 text-center sm:text-left">
                            <span className="flex items-center gap-1.5 font-mono text-cyan-400">
                                <Terminal className="w-3.5 h-3.5" />
                                <span>RADAR-KETAPANG // MIL-SPEC INTEL</span>
                            </span>
                            <span className="hidden sm:inline text-slate-700">|</span>
                            <span>&copy; {new Date().getFullYear()} Timses & Tokoh Politik Command Center</span>
                        </div>

                        {/* Prominent Mandatory Version Footer Badge */}
                        <div className="flex items-center space-x-3">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.25)] text-cyan-300 font-mono text-xs sm:text-sm font-semibold tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                <span className="text-slate-400">SISTEM:</span>
                                <span className="text-white font-bold tracking-widest bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                                    Versi: 0.14
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
