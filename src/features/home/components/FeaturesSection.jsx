'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

// Data
import { featuresData } from '../data/features.data'

/**
 * @component FeaturesSection
 * @description Displays key platform value propositions with premium animations.
 */
export default function FeaturesSection() {
    return (
        <section className="mx-auto max-w-7xl px-4 py-24">
            {/* Section Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-16 text-center"
            >
                <h2 className="font-display text-text-primary mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                    Built for{' '}
                    <span className="text-accent italic drop-shadow-[0_0_10px_rgba(2,186,76,0.2)]">
                        engineers.
                    </span>
                </h2>
                <p className="text-text-muted mx-auto max-w-2xl leading-relaxed md:text-lg">
                    Everything you need to sharpen your coding skills and compete globally. A
                    platform built with performance and precision in mind.
                </p>
            </motion.div>

            {/* Grid Layout with Stagger Cascade */}
            <motion.div
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.1,
                        },
                    },
                }}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-100px' }}
                className="grid grid-cols-2 gap-6 lg:grid-cols-3"
            >
                {featuresData.map((feature, idx) => (
                    <motion.div
                        key={idx}
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            show: {
                                opacity: 1,
                                y: 0,
                                transition: { duration: 0.5, ease: 'easeOut' },
                            },
                        }}
                    >
                        <Card className="bg-bg-page border-border group hover:border-accent/30 relative flex flex-col items-start p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl md:p-8">
                            {/* Card Hover Glow */}
                            <div className="bg-accent/0 group-hover:bg-accent/5 pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100" />

                            <div className="bg-accent/5 group-hover:bg-accent/10 mb-6 flex size-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                                <span className="material-symbols-outlined text-accent text-2xl">
                                    {feature.icon}
                                </span>
                            </div>

                            <h3 className="font-display text-text-primary mb-3 text-lg font-bold md:text-xl md:font-extrabold">
                                {feature.title}
                            </h3>
                            <p className="text-text-muted text-sm leading-relaxed">
                                {feature.desc}
                            </p>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    )
}
