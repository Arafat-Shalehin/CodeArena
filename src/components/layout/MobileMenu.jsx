'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, LogOut, Search } from 'lucide-react';

// Navigation Data
const NAV_LINKS = [
    { name: 'Problems', href: '/problems' },
    { name: 'Contests', href: '/contests' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'Practice', href: '/practice' },
];

/**
 * @component MobileMenu
 * @description Full-screen mobile navigation overlay with search, nav links, and auth actions.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the menu is currently visible.
 * @param {Function} props.onClose - Callback to close the menu.
 * @param {Object|null} props.user - The authenticated user (null if logged out).
 * @param {boolean} props.isAuthenticated - Whether a user is logged in.
 * @param {Function} props.onLogout - Callback invoked on sign out.
 * @returns {JSX.Element|null} The rendered mobile menu, or null if closed.
 */
export default function MobileMenu({ isOpen, onClose, user, isAuthenticated, onLogout }) {
    if (!isOpen) return null;

    const handleLogout = () => {
        onClose();
        onLogout();
    };

    return (
        <div className="md:hidden absolute top-16 left-0 w-full h-[calc(100vh-4rem)] bg-bg-page z-40 overflow-y-auto border-t border-border shadow-xl py-6 px-4 duration-200 flex flex-col">
            <div className="space-y-4">
                {/* Mobile Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
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
                            onClick={onClose}
                            className="px-4 py-3 text-base font-bold text-text-primary hover:bg-bg-subtle rounded-xl transition-colors flex items-center justify-between group"
                        >
                            {link.name}
                            <span className="material-symbols-outlined text-text-muted group-hover:text-accent transition-colors text-lg">
                                chevron_right
                            </span>
                        </Link>
                    ))}
                </nav>

                {/* Mobile Auth Actions */}
                <div className="pt-4 grid gap-3 border-t border-border">
                    {isAuthenticated && user ? (
                        <>
                            {/* Profile Info Card */}
                            <div className="flex items-center gap-3 px-4 py-3 bg-bg-subtle rounded-xl">
                                <Avatar className="size-10 border-2 border-accent/30">
                                    <AvatarImage
                                        src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.avatarSeed || user.username}`}
                                        alt={user.username}
                                    />
                                    <AvatarFallback className="bg-accent/10 text-accent text-xs font-bold">
                                        {user.username.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-text-primary truncate">{user.name}</p>
                                    <p className="text-xs text-text-muted truncate">{user.email}</p>
                                </div>
                            </div>

                            <Link href="/profile" onClick={onClose}>
                                <Button variant="secondary" size="lg" className="w-full">
                                    <User size={16} className="mr-2" />
                                    My Profile
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full text-error hover:bg-error-light hover:text-error border-error/20"
                                onClick={handleLogout}
                            >
                                <LogOut size={16} className="mr-2" />
                                Sign Out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" onClick={onClose}>
                                <Button variant="secondary" size="lg" className="w-full">
                                    Sign in
                                </Button>
                            </Link>
                            <Link href="/signup" onClick={onClose}>
                                <Button variant="default" size="lg" className="w-full">
                                    Sign Up
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
