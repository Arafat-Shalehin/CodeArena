import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Github, Twitter, Disc, Linkedin, ArrowRight } from 'lucide-react'; // Assuming Disc for Discord-like, or MessageCircle

// Constants
const SOCIAL_LINKS = [
    { name: 'github', icon: Github, href: 'https://github.com' },
    { name: 'twitter', icon: Twitter, href: 'https://twitter.com' },
    { name: 'discord', icon: Disc, href: 'https://discord.com' } // Disc as placeholder for Discord if not available, or just generic
];
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
];
const COMPANY_LINKS = [
    { name: 'About', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
];

/**
 * @component Footer
 * @description Site-wide footer containing navigation links, newsletter signup, and branding.
 * Organized into a 4-column grid layout on desktop.
 * 
 * @returns {JSX.Element} The rendered Footer.
 */
export default function Footer() {
    return (
        <footer className="bg-bg-page pt-20 pb-10 border-t border-border mt-auto">
            <div className="max-w-7xl mx-auto px-4">

                {/* Main Footer Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 px-4">

                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="size-8">
                                <img src="/logo.svg" alt="CodeArena Logo" className="w-full h-full" />
                            </div>
                            <span className="font-sans font-bold text-xl tracking-tight text-text-primary">
                                CodeArena
                            </span>
                        </div>
                        <p className="text-text-muted text-sm leading-relaxed max-w-xs">
                            The premier platform for competitive programming. Built by engineers, for engineers.
                        </p>
                        {/* Social Icons */}
                        <div className="flex gap-4">
                            {SOCIAL_LINKS.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="size-8 rounded-full bg-bg-subtle flex items-center justify-center text-text-muted hover:bg-text-primary hover:text-bg-page transition-all"
                                >
                                    <item.icon className="size-4" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Columns (Grouped for Mobile Row) */}
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-2 lg:contents lg:gap-0">
                        <div>
                            <h4 className="font-bold text-text-primary mb-6">Platform</h4>
                            <ul className="space-y-3 text-sm text-text-muted">
                                {PLATFORM_LINKS.map(item => (
                                    <li key={item.name}>
                                        <Link href={item.href} className="hover:text-accent transition-colors">
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-text-primary mb-6">Company</h4>
                            <ul className="space-y-3 text-sm text-text-muted">
                                {COMPANY_LINKS.map(item => (
                                    <li key={item.name}>
                                        <Link href={item.href} className="hover:text-accent transition-colors">
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Newsletter Column - Minimal Redesign */}
                    <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-text-primary">Stay in the loop</h4>
                        <div className="relative group">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-bg-subtle border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all pr-10"
                            />
                            <button
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-accent hover:bg-accent/10 rounded-md transition-colors"
                                aria-label="Subscribe"
                            >
                                <ArrowRight className="size-4" />
                            </button>
                        </div>
                        <p className="text-xs text-text-muted">
                            Join our newsletter for the latest updates and challenges.
                        </p>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-secondary">
                    <div>© 2026 CodeArena Inc. All rights reserved.</div>
                    <div className="flex flex-wrap gap-4 md:gap-8 justify-center">
                        <Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-text-primary transition-colors">Terms of Service</Link>
                        <Link href="/cookies" className="hover:text-text-primary transition-colors">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
