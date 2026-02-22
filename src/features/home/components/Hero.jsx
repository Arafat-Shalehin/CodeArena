// Shared Components
import { Button } from '@/components/ui/button'

// Local Components
import CodeEditorPreview from './CodeEditorPreview'

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
        <section className="hero-gradient relative overflow-hidden pt-10 pb-2">
            <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 lg:grid-cols-2">
                {/* Left Column: Content */}
                <div className="relative z-10 space-y-8 text-center lg:text-left">
                    {/* Headline */}
                    <h1 className="text-text-primary pt-3 font-sans text-6xl leading-[0.9] font-extrabold tracking-[-0.04em] sm:text-7xl lg:text-8xl">
                        Master <br className="lg:hidden" />{' '}
                        <span className="text-accent font-serif italic">Algorithms.</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-text-secondary mx-auto max-w-xl text-lg leading-relaxed md:text-xl lg:mx-0">
                        The premier competitive programming platform. Elevate your coding skills,
                        prepare for top-tier tech interviews, and compete in live global contests.
                        Your technical legacy starts here.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col justify-center gap-4 pt-2 sm:flex-row lg:justify-start">
                        <Button
                            variant="default"
                            size="lg"
                            className="h-12 w-full px-8 text-base shadow-md hover:shadow-lg sm:w-auto"
                        >
                            Start Solving Challenges
                            <span className="material-symbols-outlined ml-2 text-sm">
                                arrow_forward
                            </span>
                        </Button>
                        <Button
                            variant="secondary"
                            size="lg"
                            className="bg-bg-page hover:bg-bg-subtle border-border h-12 w-full border px-8 text-base sm:w-auto"
                        >
                            Compete in Contests
                        </Button>
                    </div>

                    {/* Social Proof Stats (Desktop Only) */}
                    <div className="border-border hidden items-center gap-12 border-t pt-10 lg:flex">
                        <div>
                            <div className="text-text-primary font-sans text-2xl font-extrabold tracking-tight">
                                100k+
                            </div>
                            <div className="text-text-muted mt-1 text-xs font-bold tracking-widest uppercase">
                                Active Coders
                            </div>
                        </div>
                        <div>
                            <div className="text-text-primary font-sans text-2xl font-extrabold tracking-tight">
                                25+
                            </div>
                            <div className="text-text-muted mt-1 text-xs font-bold tracking-widest uppercase">
                                Global Sponsors
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Visual */}
                <CodeEditorPreview className="mx-auto lg:mx-0" />
            </div>

            {/* Mobile Stats (Below everything on mobile) */}
            <div className="border-border bg-bg-subtle/50 -mx-4 mt-12 border-t px-4 pt-8 lg:hidden">
                <div className="flex items-center justify-center gap-12">
                    <div className="text-center">
                        <div className="text-text-primary font-sans text-3xl font-black tracking-tight">
                            100k+
                        </div>
                        <div className="text-text-muted mt-1 text-[10px] font-bold tracking-widest uppercase">
                            Active Coders
                        </div>
                    </div>
                    <div className="border-border h-10 w-px"></div>
                    <div className="text-center">
                        <div className="text-text-primary font-sans text-3xl font-black tracking-tight">
                            25+
                        </div>
                        <div className="text-text-muted mt-1 text-[10px] font-bold tracking-widest uppercase">
                            Global Sponsors
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
