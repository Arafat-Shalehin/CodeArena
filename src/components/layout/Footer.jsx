import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Github, Twitter, Disc, Linkedin, ArrowRight } from 'lucide-react' // Assuming Disc for Discord-like, or MessageCircle

// Constants
const SOCIAL_LINKS = [
    { name: 'github', icon: Github, href: 'https://github.com' },
    { name: 'twitter', icon: Twitter, href: 'https://twitter.com' },
    { name: 'discord', icon: Disc, href: 'https://discord.com' }, // Disc as placeholder for Discord if not available, or just generic
]
// Note: Lucide might not have Discord icon specifically in all versions, checking if 'Disc' or similar exists.
// Actually, let's use standard Lucide icons that likely exist. Github, Twitter, Linkedin are common.
// If Discord is needed, we might need a custom one or checked if it exists.
// I will use 'MessageCircle' as a fallback if I am unsure, but let's stick to standard social ones for now.
// Actually, simple text or just the name if icon missing?
// "lucide-react" usually has 'Github', 'Twitter', 'Linkedin'. 'Discord' might be missing.
// I'll use 'Github', 'Twitter', 'Linkedin' for now as safe bets.

const PLATFORM_LINKS = [
    { name: 'Problems', href: '/problems' },
    { name: 'Contests', href: '/contests' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'API', href: '/api-docs' },
]
const COMPANY_LINKS = [
    { name: 'About', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
]

/**
 * @component Footer
 * @description Site-wide footer containing navigation links, newsletter signup, and branding.
 * Organized into a 4-column grid layout on desktop.
 *
 * @returns {JSX.Element} The rendered Footer.
 */
export default function Footer() {
    return (
        <footer className="bg-bg-page border-border mt-auto border-t pt-20 pb-10">
            <div className="mx-auto max-w-7xl px-4">
                {/* Main Footer Grid */}
                <div className="mb-16 grid gap-12 px-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="size-8">
                                <img
                                    src="/logo.svg"
                                    alt="CodeArena Logo"
                                    className="h-full w-full"
                                />
                            </div>
                            <span className="text-text-primary font-sans text-xl font-bold tracking-tight">
                                CodeArena
                            </span>
                        </div>
                        <p className="text-text-muted max-w-xs text-sm leading-relaxed">
                            The premier platform for competitive programming. Built by engineers,
                            for engineers.
                        </p>
                        {/* Social Icons */}
                        <div className="flex gap-4">
                            {SOCIAL_LINKS.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-bg-subtle text-text-muted hover:bg-text-primary hover:text-bg-page flex size-8 items-center justify-center rounded-full transition-all"
                                >
                                    <item.icon className="size-4" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Columns (Grouped for Mobile Row) */}
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-2 lg:contents lg:gap-0">
                        <div>
                            <h4 className="text-text-primary mb-6 font-bold">Platform</h4>
                            <ul className="text-text-muted space-y-3 text-sm">
                                {PLATFORM_LINKS.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className="hover:text-accent transition-colors"
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-text-primary mb-6 font-bold">Company</h4>
                            <ul className="text-text-muted space-y-3 text-sm">
                                {COMPANY_LINKS.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className="hover:text-accent transition-colors"
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Newsletter Column - Minimal Redesign */}
                    <div className="flex flex-col gap-4">
                        <h4 className="text-text-primary font-bold">Stay in the loop</h4>
                        <div className="group relative">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-bg-subtle border-border text-text-primary placeholder:text-text-muted focus:ring-accent focus:border-accent w-full rounded-lg border px-4 py-2.5 pr-10 text-sm transition-all focus:ring-1 focus:outline-none"
                            />
                            <button
                                className="text-text-muted hover:text-accent hover:bg-accent/10 absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 transition-colors"
                                aria-label="Subscribe"
                            >
                                <ArrowRight className="size-4" />
                            </button>
                        </div>
                        <p className="text-text-muted text-xs">
                            Join our newsletter for the latest updates and challenges.
                        </p>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="border-border text-text-secondary flex flex-col items-center justify-between gap-4 border-t pt-8 text-xs md:flex-row">
                    <div>© 2026 CodeArena Inc. All rights reserved.</div>
                    <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                        <Link href="/privacy" className="hover:text-text-primary transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="hover:text-text-primary transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="/cookies" className="hover:text-text-primary transition-colors">
                            Cookie Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
