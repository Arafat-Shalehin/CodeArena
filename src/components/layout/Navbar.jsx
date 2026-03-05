'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// Shared Components
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

// Layout Components
import SearchBar from '@/components/layout/SearchBar'
import ProfileDropdown from '@/components/layout/ProfileDropdown'
import MobileMenu from '@/components/layout/MobileMenu'

// Auth
import { useAuth } from '@/context/AuthContext'

// Navigation Data
const NAV_LINKS = [
    { name: 'Feed', href: '/feed' },
    { name: 'Problems', href: '/problems' },
    { name: 'Contests', href: '/contests' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'Practice', href: '/practice' },
]

/**
 * @component Navbar
 * @description The main site navigation bar. Auth-aware — shows profile
 * dropdown when logged in, sign-in/sign-up buttons when logged out.
 * Composes SearchBar, ProfileDropdown, and MobileMenu subcomponents.
 *
 * @returns {JSX.Element} The rendered Navbar.
 */
export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const router = useRouter()
    const { user, isAuthenticated, logout } = useAuth()

    /** Handle logout action */
    const handleLogout = () => {
        logout()
        setIsMenuOpen(false)
        router.push('/')
    }

    return (
        <header className="bg-bg-page/80 border-border sticky top-0 z-50 w-full border-b backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
                {/* Logo & Desktop Navigation */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="group flex shrink-0 items-center gap-2">
                        <div className="size-8 transition-transform group-hover:scale-110">
                            <Image
                                src="/logo.svg"
                                alt="CodeArena Logo"
                                width={32}
                                height={32}
                                priority
                            />
                        </div>
                        <span className="text-text-primary group-hover:text-accent font-sans text-xl font-bold tracking-tight transition-colors">
                            CodeArena
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-1 md:flex">
                        {NAV_LINKS.map((link) => {
                            const isActive =
                                router.pathname === link.href ||
                                (router.asPath && router.asPath.startsWith(link.href)) // fallback logic
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'text-text-primary bg-bg-subtle'
                                            : 'text-text-muted hover:text-text-primary hover:bg-bg-subtle'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Desktop Search Bar */}
                <SearchBar />

                {/* Desktop: Auth Buttons OR Profile Dropdown */}
                <div className="hidden items-center gap-3 md:flex">
                    {isAuthenticated && user ? (
                        <ProfileDropdown user={user} onLogout={handleLogout} />
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-text-muted hover:text-text-primary px-3 py-2 text-sm font-bold transition-colors"
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

                {/* Mobile Menu Toggle */}
                <div className="flex items-center gap-2 md:hidden">
                    {isAuthenticated && user && (
                        <Link href="/profile" className="mr-1">
                            <Avatar className="border-accent/30 size-8 border-2">
                                <AvatarImage
                                    src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.avatarSeed || user.name || user.email}`}
                                    alt={user.name || 'User'}
                                />
                                <AvatarFallback className="bg-accent/10 text-accent text-[10px] font-bold">
                                    {(user.name || user.email || 'U').substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                    )}
                    <button
                        className="bg-bg-subtle text-text-primary flex size-10 items-center justify-center rounded-lg"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle navigation menu"
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

            {/* Mobile Navigation Overlay */}
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
