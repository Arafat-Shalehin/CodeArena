import { Card, CardContent } from '@/components/ui/card'

// Data
import { stepsData } from '../data/steps.data'

/**
 * @component HowItWorksSection
 * @description Visualizes the user journey steps from joining to competing.
 * Uses a horizontal dashed line connector on desktop to indicate flow.
 *
 * @returns {JSX.Element} The rendered How It Works section.
 */
export default function HowItWorksSection() {
    return (
        <section className="bg-bg-subtle overflow-hidden py-12">
            <div className="mx-auto max-w-7xl px-4">
                {/* Section Header */}
                <h2 className="font-display text-text-primary mb-12 text-center text-4xl font-extrabold italic">
                    How It <span className="text-accent italic">Works.</span>
                </h2>

                {/* Steps Flow */}
                <div className="relative">
                    {/* Connecting Line (Desktop Only) */}
                    <div className="bg-border border-border-strong absolute top-8 left-0 hidden h-[1px] w-full border-b border-dashed md:block"></div>

                    {/* Mobile Vertical Flow (lg:hidden) */}
                    <div className="relative space-y-8 text-left lg:hidden">
                        {/* Vertical Connector Line */}
                        <div className="bg-border absolute top-0 bottom-0 left-6 w-0.5"></div>

                        {stepsData.map((item, idx) => (
                            <div key={idx} className="relative pl-16">
                                <div className="bg-bg-page border-border font-display text-text-primary absolute left-0 z-10 flex size-12 items-center justify-center rounded-full border-2 text-lg font-bold shadow-sm">
                                    {item.step}
                                </div>
                                <Card className="border-none bg-transparent shadow-none">
                                    <h4 className="font-display text-text-primary mb-1 text-lg font-extrabold">
                                        {item.title}
                                    </h4>
                                    <p className="text-text-muted text-sm leading-relaxed">
                                        {item.desc}
                                    </p>
                                </Card>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Horizontal Flow (hidden lg:grid) */}
                    <div className="hidden gap-12 md:grid-cols-4 lg:grid">
                        {stepsData.map((item, idx) => (
                            <div
                                key={idx}
                                className="group relative z-10 flex flex-col items-center text-center"
                            >
                                {/* Step Number Circle */}
                                <div className="bg-bg-page border-border font-display text-text-primary group-hover:border-accent/50 mb-8 flex size-16 items-center justify-center rounded-2xl border text-xl font-black shadow-sm transition-colors">
                                    {item.step}
                                </div>

                                {/* Step Details */}
                                <h4 className="font-display text-text-primary mb-3 text-lg font-extrabold">
                                    {item.title}
                                </h4>
                                <p className="text-text-muted max-w-[180px] text-xs leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
