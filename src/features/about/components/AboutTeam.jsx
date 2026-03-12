'use client'

import { motion } from 'framer-motion'
import { aboutContent } from '../data/about.data'

/**
 * AboutTeam component for the CodeArena platform.
 * Focuses on community statistics and the project philosophy, using decorative
 * elements to represent a shared coding environment.
 *
 * @component
 * @returns {React.ReactElement} The rendered community and team section.
 */
export default function AboutTeam() {
    const { community } = aboutContent

    return (
        <section className="bg-bg-subtle border-border border-t py-24">
            <div className="max-w-container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
                    <div>
                        <h2 className="text-text-primary text-3xl font-semibold tracking-tight">
                            {community.title}
                        </h2>
                        <p className="text-text-secondary mt-6 text-lg leading-relaxed">
                            {community.description}
                        </p>

                        <div className="mt-10 grid grid-cols-2 gap-8">
                            {community.stats.map((stat, index) => (
                                <div key={index}>
                                    <div className="text-accent text-3xl font-bold">
                                        {stat.value}
                                    </div>
                                    <div className="text-text-muted mt-1 text-sm font-medium uppercase">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="bg-accent-light border-accent/20 flex aspect-square items-center justify-center overflow-hidden rounded-2xl border p-12">
                            {/* Decorative element representing community/code */}
                            <div className="grid h-full w-full grid-cols-3 gap-4 opacity-40">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className="bg-accent rounded-lg shadow-sm"></div>
                                ))}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-accent-text font-serif text-4xl font-bold italic drop-shadow-sm lg:text-5xl">
                                    Join the Elite.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
