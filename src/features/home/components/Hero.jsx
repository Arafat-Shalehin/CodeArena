import React from 'react';

// Shared Components
import Button from '@/shared/components/ui/Button';

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
        <section className="relative overflow-hidden pt-10 pb-18 hero-gradient">
            <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
                {/* Left Column: Content */}
                <div className="relative z-10 space-y-8">
                    {/* Headline */}
                    <h1 className="text-6xl lg:text-8xl font-display font-extrabold text-text-main leading-[0.95] tracking-[-0.04em]">
                        Master the <span className="text-primary italic font-serif">machine.</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg md:text-xl text-text-muted leading-relaxed max-w-xl">
                        The ultimate playground for competitive programmers. Solve curated problems, join high-stakes
                        contests, and build your technical legacy.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap gap-4 pt-4">
                        <Button variant="primary" size="lg" className="shadow-md hover:shadow-lg">
                            Browse 2,500+ problems
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Button>
                        <Button variant="secondary" size="lg">
                            Explore contests
                        </Button>
                    </div>

                    {/* Social Proof Stats */}
                    <div className="flex items-center gap-12 pt-10 border-t border-border-base">
                        <div>
                            <div className="text-2xl font-display font-extrabold text-text-main tracking-tight">100k+</div>
                            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Active Coders</div>
                        </div>
                        <div>
                            <div className="text-2xl font-display font-extrabold text-text-main tracking-tight">25+</div>
                            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Global Sponsors</div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Visual */}
                <CodeEditorPreview />
            </div>
        </section>
    );
}
