"use client";

import { useState } from 'react';
import Link from 'next/link';

// Shared Components
import Button from '@/shared/components/ui/Button';

// Navigation Data
const NAV_LINKS = [
    { name: 'Problems', href: '/problems' },
    { name: 'Contests', href: '/contests' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'Practice', href: '/practice' },
];

/**
 * @component Navbar
 * @description The main site navigation bar.
 * Features:
 * - Sticky positioning with glassmorphism
 * - Responsive hamburger menu for mobile
 * - Search functionality
 * - Authentication and CTA buttons
 * 
 * @returns {JSX.Element} The rendered Navbar.
 */
export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 border-b border-zinc-200/50 supports-[backdrop-filter]:bg-white/60">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

                {/* Logo & Desktop Navigation */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        <div className="size-8 group-hover:scale-110 transition-transform">
                            <img src="/logo.svg" alt="CodeArena Logo" className="w-full h-full" />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight text-text-main group-hover:text-primary transition-colors">
                            CodeArena
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="px-3 py-2 text-sm font-medium text-text-muted hover:text-text-main hover:bg-black/5 rounded-lg transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Desktop Search Bar */}
                <div className="flex-1 max-w-md hidden lg:block">
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors text-lg">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Search problems..."
                            className="w-full pl-10 pr-4 py-2 bg-zinc-100/50 border border-transparent rounded-xl text-sm focus:outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-zinc-400"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                            <span className="text-[10px] bg-white border border-zinc-200 rounded px-1.5 py-0.5 text-zinc-400">Ctrl</span>
                            <span className="text-[10px] bg-white border border-zinc-200 rounded px-1.5 py-0.5 text-zinc-400">K</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons (Desktop) */}
                <div className="hidden md:flex items-center gap-3">
                    <button className="text-sm font-bold text-text-muted hover:text-text-main px-3 py-2 transition-colors">
                        Sign in
                    </button>
                    <Button variant="primary" size="md">
                        Join the next contest
                    </Button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center gap-2">
                    <button
                        className="size-10 flex items-center justify-center rounded-xl bg-zinc-100 text-text-main"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle navigation menu"
                    >
                        {isMenuOpen ? (
                            <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full h-[calc(100vh-4rem)] bg-white z-40 overflow-y-auto border-t border-zinc-200 shadow-xl py-6 px-4 duration-200 flex flex-col">
                    <div className="space-y-4">
                        {/* Mobile Search */}
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">
                                search
                            </span>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-3 bg-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {/* Mobile Links */}
                        <nav className="grid gap-1">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="px-4 py-3 text-base font-bold text-text-main hover:bg-zinc-50 rounded-xl transition-colors flex items-center justify-between group"
                                >
                                    {link.name}
                                    <span className="material-symbols-outlined text-zinc-300 group-hover:text-primary transition-colors text-lg">
                                        chevron_right
                                    </span>
                                </Link>
                            ))}
                        </nav>

                        {/* Mobile Actions */}
                        <div className="pt-4 grid gap-3 border-t border-zinc-100">
                            <Button variant="secondary" size="lg" className="w-full">
                                Sign in
                            </Button>
                            <Button variant="primary" size="lg" className="w-full">
                                Join the next contest
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
