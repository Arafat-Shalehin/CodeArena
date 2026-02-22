import { Card } from '@/components/ui/card'

// Data
import { featuresData } from '../data/features.data'

/**
 * @component FeaturesSection
 * @description Displays key platform value propositions in a bento-grid style layout.
 * Highlights the "Built for Engineers" messaging with icon-based features.
 *
 * @returns {JSX.Element} The rendered Features section.
 */
export default function FeaturesSection() {
    return (
        <section className="mx-auto max-w-7xl px-4 py-18">
            {/* Section Header */}
            <div className="mb-12 text-center">
                <h2 className="font-display text-text-primary mb-6 text-4xl font-bold tracking-tight md:text-5xl">
                    Built for <span className="text-accent italic">engineers.</span>
                </h2>
                <p className="text-text-muted mx-auto max-w-2xl leading-relaxed">
                    Everything you need to sharpen your coding skills and compete globally. A
                    platform built with performance and precision in mind.
                </p>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
                {featuresData.map((feature, idx) => (
                    <Card
                        key={idx}
                        className="hover:border-accent/50 bg-bg-page border-border group flex flex-col items-start p-3 shadow-sm transition-all md:p-8"
                    >
                        <div className="bg-accent/5 group-hover:bg-accent/10 mb-3 flex size-8 items-center justify-center rounded-lg transition-colors md:mb-6 md:size-12 md:rounded-xl">
                            <span className="material-symbols-outlined text-accent text-lg transition-transform group-hover:scale-110 md:text-2xl">
                                {feature.icon}
                            </span>
                        </div>
                        <h3 className="font-display text-text-primary mb-1 text-sm font-bold md:mb-3 md:text-xl md:font-extrabold">
                            {feature.title}
                        </h3>
                        <p className="text-text-muted text-xs leading-relaxed md:text-sm">
                            {feature.desc}
                        </p>
                    </Card>
                ))}
            </div>
        </section>
    )
}
