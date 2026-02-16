import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Constants
const SOCIAL_LINKS = ['github', 'twitter', 'discord'];
const PLATFORM_LINKS = ['Problems', 'Contests', 'Leaderboard', 'API'];
const COMPANY_LINKS = ['About', 'Careers', 'Blog', 'Contact'];

/**
 * @component Footer
 * @description Site-wide footer containing navigation links, newsletter signup, and branding.
 * Organized into a 4-column grid layout on desktop.
 * 
 * @returns {JSX.Element} The rendered Footer.
 */
export default function Footer() {
    return (
        <footer className="bg-white pt-20 pb-10 border-t border-border-base mt-auto">
            <div className="max-w-7xl mx-auto px-4">

                {/* Main Footer Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 px-4">

                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="size-8">
                                <img src="/logo.svg" alt="CodeArena Logo" className="w-full h-full" />
                            </div>
                            <span className="font-display font-bold text-xl tracking-tight text-text-main">
                                CodeArena
                            </span>
                        </div>
                        <p className="text-text-muted text-sm leading-relaxed max-w-xs">
                            The premier platform for competitive programming. built by engineers, for engineers.
                        </p>
                        {/* Social Icons */}
                        <div className="flex gap-4">
                            {SOCIAL_LINKS.map((icon) => (
                                <a key={icon} href="#" className="size-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-900 hover:text-white transition-all">
                                    <span className="text-xs">{icon[0].toUpperCase()}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Columns (Grouped for Mobile Row) */}
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-2 lg:contents  lg:gap-0">
                        <div>
                            <h4 className="font-bold text-text-main mb-6">Platform</h4>
                            <ul className="space-y-3 text-sm text-text-muted">
                                {PLATFORM_LINKS.map(item => (
                                    <li key={item}><a href="#" className="hover:text-primary transition-colors">{item}</a></li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-text-main mb-6">Company</h4>
                            <ul className="space-y-3 text-sm text-text-muted">
                                {COMPANY_LINKS.map(item => (
                                    <li key={item}><a href="#" className="hover:text-primary transition-colors">{item}</a></li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Newsletter Column */}
                    <div>
                        <h4 className="font-bold text-text-main mb-6">Stay Updated</h4>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-zinc-50 border-zinc-200"
                            />
                            <Button className="bg-zinc-900 text-white hover:bg-zinc-800 w-full sm:w-auto">
                                Subscribe
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="border-t border-zinc-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-400">
                    <div>© 2024 CodeArena Inc. All rights reserved.</div>
                    <div className="flex flex-wrap gap-4 md:gap-8 justify-center">
                        <a href="#" className="hover:text-zinc-900">Privacy Policy</a>
                        <a href="#" className="hover:text-zinc-900">Terms of Service</a>
                        <a href="#" className="hover:text-zinc-900">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
