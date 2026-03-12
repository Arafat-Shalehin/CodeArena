'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { aboutContent } from '../data/about.data'

/**
 * AboutMission component for the CodeArena platform.
 * Displays the mission and vision statements in a structured grid with iconic representations.
 *
 * @component
 * @returns {React.ReactElement} The rendered Mission and Vision section.
 */
export default function AboutMission() {
    const { mission } = aboutContent

    return (
        <section className="bg-bg-subtle border-border border-y py-20">
            <div className="max-w-container mx-auto px-4 md:px-6">
                <div className="mx-auto mb-16 max-w-2xl text-center">
                    <h2 className="text-text-primary text-3xl font-semibold tracking-tight sm:text-4xl">
                        {mission.title}
                    </h2>
                    <p className="text-text-secondary mt-4 text-base md:text-lg">
                        Our goal is to build the ultimate playground for competitive programmers.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {/* Mission Card */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="duration-normal transition-transform"
                    >
                        <Card className="bg-bg-page border-border flex h-full flex-col items-center p-8 text-center shadow-sm">
                            <div className="bg-accent-light text-accent-text mb-6 rounded-full p-4">
                                {mission.mission.icon}
                            </div>
                            <h3 className="text-text-primary mb-4 text-xl font-bold">
                                {mission.mission.title}
                            </h3>
                            <p className="text-text-secondary leading-relaxed">
                                {mission.mission.description}
                            </p>
                        </Card>
                    </motion.div>

                    {/* Vision Card */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="duration-normal transition-transform"
                    >
                        <Card className="bg-bg-page border-border flex h-full flex-col items-center p-8 text-center shadow-sm">
                            <div className="bg-accent-light text-accent-text mb-6 rounded-full p-4">
                                {mission.vision.icon}
                            </div>
                            <h3 className="text-text-primary mb-4 text-xl font-bold">
                                {mission.vision.title}
                            </h3>
                            <p className="text-text-secondary leading-relaxed">
                                {mission.vision.description}
                            </p>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
