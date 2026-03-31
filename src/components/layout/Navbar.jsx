'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

// Shared Components
import { Button } from '@/components/ui/button'

// Layout Components
import SearchBar from '@/components/layout/SearchBar'
import ProfileDropdown from '@/components/layout/ProfileDropdown'
import MobileMenu from '@/components/layout/MobileMenu'
import NotificationBell from '@/components/layout/NotificationBell'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

// Auth
import { useAuth } from '@/context/AuthContext'

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

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const { user, isAuthenticated, logout } = useAuth()

    const handleLogout = () => {
        logout()
        setIsMenuOpen(false)
        router.push('/')
    }

    return (
        <header className="bg-bg-page/80 border-border sticky top-0 z-50 w-full border-b backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
                <div className="flex min-w-0 items-center gap-4 xl:gap-8">
                    {/* Logo Section */}
                    <Link href="/" className="group flex shrink-0 items-center gap-2">
                        <div className="size-8 transition-transform group-hover:scale-110">
                            <Image src="/logo.svg" alt="Logo" width={32} height={32} priority />
                        </div>
                        <span className="text-text-primary group-hover:text-accent font-sans text-xl font-bold tracking-tight">
                            CodeArena
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden xl:block">
                        <ul className="flex items-center gap-1">
                            {NAV_LINKS.filter(
                                (link) => link.name !== 'Feed' || isAuthenticated
                            ).map((link) => {
                                const isActive =
                                    pathname === link.href ||
                                    (link.href !== '/' && pathname?.startsWith(link.href + '/'))

                                return (
                                    <li key={link.name} className="group relative">
                                        <Link
                                            href={link.href}
                                            className={`relative flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                                                isActive
                                                    ? 'text-text-primary bg-bg-subtle'
                                                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-subtle'
                                            }`}
                                        >
                                            {link.name}
                                            {link.subLinks && (
                                                <ChevronDown
                                                    size={12}
                                                    className="transition-transform group-hover:rotate-180"
                                                />
                                            )}
                                            {isActive && (
                                                <span className="bg-accent absolute right-3 bottom-1 left-3 h-0.5 rounded-full" />
                                            )}
                                        </Link>

                                        {link.subLinks && (
                                            <div className="bg-bg-page border-border absolute top-full left-0 z-50 mt-1 min-w-[160px] translate-y-2 scale-95 overflow-hidden rounded-xl border p-1 opacity-0 shadow-2xl transition-all group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
                                                {link.subLinks.map((sub) => (
                                                    <Link
                                                        key={sub.name}
                                                        href={sub.href}
                                                        className="text-text-secondary hover:text-text-primary hover:bg-bg-subtle flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all"
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>
                </div>

                <SearchBar />

                <div className="hidden items-center gap-3 xl:flex">
                    <ThemeToggle />
                    {isAuthenticated && user ? (
                        <>
                            <NotificationBell />
                            <ProfileDropdown user={user} onLogout={handleLogout} />
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-text-secondary hover:text-text-primary px-3 py-2 text-sm font-semibold transition-colors"
                            >
                                Sign in
                            </Link>
                            <Link href="/signup">
                                <Button variant="default" size="default">
                                    Sign Up
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Actions */}
                <div className="flex items-center gap-2 xl:hidden">
                    <ThemeToggle />
                    <button
                        className="bg-bg-subtle text-text-primary flex size-10 items-center justify-center rounded-lg"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? (
                            <svg
                                className="size-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="size-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            <MobileMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                user={user}
                isAuthenticated={isAuthenticated}
                onLogout={handleLogout}
            />
        </header>
    )
}
