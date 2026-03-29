'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { User, LogOut, Search, ChevronRight } from 'lucide-react'

// Navigation Data
const NAV_LINKS = [
    { name: 'Feed', href: '/feed' },
    { name: 'Problems', href: '/problems' },
    { name: 'Practice', href: '/practice' },
    {
        name: 'AI Interview',
        href: '/interview',
        subLinks: [{ name: 'History', href: '/interview/history' }],
    },
    { name: 'Contests', href: '/contests' },
    { name: 'Leaderboard', href: '/leaderboard' },
]

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
    if (!isOpen) return null

    const handleLogout = () => {
        onClose()
        onLogout()
    }

    return (
        <div className="bg-bg-page border-border absolute top-16 left-0 z-40 flex h-[calc(100vh-4rem)] w-full flex-col overflow-y-auto border-t px-4 py-6 shadow-xl duration-200 md:hidden">
            <div className="space-y-4">
                {/* Mobile Search */}
                <div className="relative">
                    <Search className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-bg-subtle focus:ring-accent/20 w-full rounded-xl py-3 pr-4 pl-10 text-sm focus:ring-2 focus:outline-none"
                    />
                </div>

                {/* Mobile Links */}
                <nav className="grid gap-1">
                    {NAV_LINKS.filter((link) => link.name !== 'Feed' || isAuthenticated).map(
                        (link) => (
                            <div key={link.name} className="flex flex-col">
                                <Link
                                    href={link.href}
                                    onClick={onClose}
                                    className="text-text-primary hover:bg-bg-subtle group flex items-center justify-between rounded-xl px-4 py-3 text-base font-bold transition-colors"
                                >
                                    {link.name}
                                    <ChevronRight className="text-text-muted group-hover:text-accent size-5 transition-colors" />
                                </Link>
                                {link.subLinks && (
                                    <div className="border-border ml-4 flex flex-col border-l pl-4">
                                        {link.subLinks.map((sub) => (
                                            <Link
                                                key={sub.name}
                                                href={sub.href}
                                                onClick={onClose}
                                                className="text-text-secondary hover:text-text-primary py-2 text-sm font-bold transition-colors"
                                            >
                                                {sub.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    )}
                </nav>

                {/* Mobile Auth Actions */}
                <div className="border-border grid gap-3 border-t pt-4">
                    {isAuthenticated && user ? (
                        <>
                            {/* Profile Info Card - Only Avatar */}
                            <div className="bg-bg-subtle flex items-center justify-center rounded-xl py-6">
                                <Link href="/profile" onClick={onClose}>
                                    <Avatar className="border-accent/30 size-20 border-2 shadow-lg transition-transform hover:scale-105">
                                        <AvatarImage
                                            src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.avatarSeed || user.name || user.email}`}
                                            alt={user.name || 'User'}
                                        />
                                        <AvatarFallback className="bg-accent/10 text-accent text-2xl font-bold">
                                            {(user.name || user.email || 'U')
                                                .substring(0, 2)
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </Link>
                            </div>

                            <Link href="/profile" onClick={onClose}>
                                <Button variant="secondary" size="lg" className="w-full font-bold">
                                    <User size={18} className="mr-2" />
                                    My Profile
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="lg"
                                className="text-error hover:bg-error-light hover:text-error border-error/20 w-full"
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
    )
}
