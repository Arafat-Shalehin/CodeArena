import Link from 'next/link';

/**
 * Footer Component
 * 
 * Site-wide footer containing links, newsletter signup, and branding.
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
                            {['github', 'twitter', 'discord'].map((icon) => (
                                <a key={icon} href="#" className="size-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-900 hover:text-white transition-all">
                                    <span className="text-xs">{icon[0].toUpperCase()}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div>
                        <h4 className="font-bold text-text-main mb-6">Platform</h4>
                        <ul className="space-y-3 text-sm text-text-muted">
                            {['Problems', 'Contests', 'Leaderboard', 'API'].map(item => (
                                <li key={item}><a href="#" className="hover:text-primary transition-colors">{item}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-text-main mb-6">Company</h4>
                        <ul className="space-y-3 text-sm text-text-muted">
                            {['About', 'Careers', 'Blog', 'Contact'].map(item => (
                                <li key={item}><a href="#" className="hover:text-primary transition-colors">{item}</a></li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div>
                        <h4 className="font-bold text-text-main mb-6">Stay Updated</h4>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 w-full"
                            />
                            <button className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-800 transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="border-t border-zinc-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-400">
                    <div>© 2024 CodeArena Inc. All rights reserved.</div>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-zinc-900">Privacy Policy</a>
                        <a href="#" className="hover:text-zinc-900">Terms of Service</a>
                        <a href="#" className="hover:text-zinc-900">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
