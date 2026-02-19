"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, ChevronRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';

// Shared Components
import { Button } from '@/components/ui/button';

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
        <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-bg-page/80 border-b border-border">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

                {/* Logo & Desktop Navigation */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        <div className="size-8 group-hover:scale-110 transition-transform">
                            <img src="/logo.svg" alt="CodeArena Logo" className="w-full h-full" />
                        </div>
                        <span className="font-sans font-bold text-xl tracking-tight text-text-primary group-hover:text-accent transition-colors">
                            CodeArena
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="px-3 py-2 text-sm font-medium text-text-muted hover:text-text-primary hover:bg-bg-subtle rounded-lg transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Desktop Search Bar */}
                <div className="flex-1 max-w-md hidden lg:block">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors size-4" />
                        <input
                            type="text"
                            placeholder="Search problems..."
                            className="w-full pl-10 pr-4 py-2 bg-bg-subtle border border-border rounded-xl text-sm focus:outline-none focus:bg-bg-page focus:border-accent/20 focus:ring-4 focus:ring-accent/5 transition-all placeholder:text-text-muted"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                            <kbd className="text-[10px] bg-bg-page border border-border rounded px-1.5 py-0.5 text-text-muted font-sans cursor-default select-none">Ctrl</kbd>
                            <kbd className="text-[10px] bg-bg-page border border-border rounded px-1.5 py-0.5 text-text-muted font-sans cursor-default select-none">K</kbd>
                        </div>
                    </div>
                </div>

                {/* Action Buttons (Desktop) */}
                <div className="hidden md:flex items-center gap-3">
                    <Link href="/login">
                        <Button variant="ghost" className="text-sm font-bold text-text-muted hover:text-text-primary">
                            Sign in
                        </Button>
                    </Link>
                    <Link href="/signup">
                        <Button variant="default" size="default">
                            Sign Up
                        </Button>
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center gap-2">
                    <button
                        className="size-10 flex items-center justify-center rounded-lg bg-bg-subtle text-text-primary hover:bg-bg-subtle/80 transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle navigation menu"
                    >
                        {isMenuOpen ? (
                            <X className="size-6" />
                        ) : (
                            <Menu className="size-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full h-[calc(100vh-4rem)] bg-bg-page z-40 overflow-y-auto border-t border-border shadow-xl py-6 px-4 duration-200 flex flex-col animate-in slide-in-from-top-4 fade-in-0">
                    <div className="space-y-4">
                        {/* Mobile Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted size-4" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-3 bg-bg-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                            />
                        </div>

                        {/* Mobile Links */}
                        <nav className="grid gap-1">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="px-4 py-3 text-base font-bold text-text-primary hover:bg-bg-subtle rounded-xl transition-colors flex items-center justify-between group"
                                >
                                    {link.name}
                                    <ChevronRight className="text-text-muted group-hover:text-accent transition-colors size-5" />
                                </Link>
                            ))}
                        </nav>

                        {/* Mobile Actions */}
                        <div className="pt-4 grid gap-3 border-t border-border">
                            <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                <Button variant="secondary" size="lg" fullWidth>
                                    Sign in
                                </Button>
                            </Link>
                            <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                                <Button variant="default" size="lg" fullWidth>
                                    Sign Up
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
