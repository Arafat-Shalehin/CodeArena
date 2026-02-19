

// Shared Components
import { Button } from '@/components/ui/button';

// Local Components
import CodeEditorPreview from './CodeEditorPreview';

/**
 * @component Hero
 * @description The main landing section of the homepage.
 * Features:
 * - High-impact headline and subheadline
 * - Primary and secondary Call to Action (CTA) buttons
 * - Social proof statistics
 * - Interactive CodeEditorPreview visualization
 * 
 * @returns {JSX.Element} The rendered Hero section.
 */
export default function Hero() {
    return (
        <section className="relative overflow-hidden pt-10 pb-2 hero-gradient">
            <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
                {/* Left Column: Content */}
                <div className="relative z-10 space-y-8 text-center lg:text-left">
                    {/* Headline */}
                    <h1 className="text-6xl sm:text-7xl lg:text-8xl font-sans font-extrabold text-text-primary pt-3 leading-[0.9] tracking-[-0.04em]">
                        Master the <br className="lg:hidden" /> <span className="text-accent italic font-serif">machine.</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-xl mx-auto lg:mx-0">
                        The ultimate playground for competitive programmers. Solve curated problems, join high-stakes
                        contests, and build your technical legacy.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center lg:justify-start">
                        <Button variant="default" size="lg" className="shadow-md hover:shadow-lg w-full sm:w-auto h-12 px-8 text-base">
                            Browse 2,500+ problems
                            <span className="material-symbols-outlined text-sm ml-2">arrow_forward</span>
                        </Button>
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto h-12 px-8 text-base bg-bg-page hover:bg-bg-subtle border border-border">
                            Explore contests
                        </Button>
                    </div>

                    {/* Social Proof Stats (Desktop Only) */}
                    <div className="hidden lg:flex items-center gap-12 pt-10 border-t border-border">
                        <div>
                            <div className="text-2xl font-sans font-extrabold text-text-primary tracking-tight">100k+</div>
                            <div className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Active Coders</div>
                        </div>
                        <div>
                            <div className="text-2xl font-sans font-extrabold text-text-primary tracking-tight">25+</div>
                            <div className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Global Sponsors</div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Visual */}
                <CodeEditorPreview className="mx-auto lg:mx-0" />
            </div>

            {/* Mobile Stats (Below everything on mobile) */}
            <div className="lg:hidden mt-12 pt-8 border-t border-border bg-bg-subtle/50 -mx-4 px-4">
                <div className="flex justify-center items-center gap-12">
                    <div className="text-center">
                        <div className="text-3xl font-sans font-black text-text-primary tracking-tight">100k+</div>
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Active Coders</div>
                    </div>
                    <div className="h-10 w-px border-border"></div>
                    <div className="text-center">
                        <div className="text-3xl font-sans font-black text-text-primary tracking-tight">25+</div>
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Global Sponsors</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
