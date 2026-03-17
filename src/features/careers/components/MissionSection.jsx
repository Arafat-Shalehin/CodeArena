'use client'

import { motion } from 'framer-motion'

/**
 * @component MissionSection
 * @description Section explaining the mission of CodeArena.
 */
export default function MissionSection() {
    return (
        <section className="bg-bg-subtle/50 border-border border-y py-20 md:py-28">
            <div className="max-w-container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-text-primary mb-6 text-3xl font-bold md:text-4xl">
                            Our mission is to democratize <br />
                            <span className="text-accent decoration-accent/30 underline underline-offset-8">
                                technical excellence
                            </span>
                        </h2>
                        <div className="text-text-secondary space-y-4 text-lg leading-relaxed">
                            <p>
                                We believe that coding is the most transformative skill of the 21st
                                century. Our platform provides a fair, transparent, and rigorous
                                environment for developers to showcase their problem-solving
                                abilities.
                            </p>
                            <p>
                                By automating evaluation and providing instant feedback, we help
                                developers improve faster and companies find the best talent
                                regardless of where they are located or where they studied.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-bg-page border-border group relative overflow-hidden rounded-2xl border p-8 shadow-2xl"
                    >
                        {/* Visual Representation of Judge Infrastructure */}
                        <div className="absolute top-0 right-0 p-4">
                            <div className="bg-success size-3 animate-pulse rounded-full" />
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-accent/10 text-accent flex size-10 items-center justify-center rounded font-bold">
                                    JS
                                </div>
                                <div className="bg-bg-muted h-2 w-32 rounded-full" />
                            </div>
                            <div className="space-y-3">
                                <div className="bg-bg-muted h-3 w-full rounded-full" />
                                <div className="bg-bg-muted h-3 w-4/5 rounded-full" />
                                <div className="bg-bg-muted h-3 w-3/4 rounded-full" />
                            </div>
                            <div className="border-border text-text-muted flex items-center justify-between border-t pt-4 font-mono text-sm">
                                <span>Memory: 12.4MB</span>
                                <span className="text-success">Time: 42ms</span>
                            </div>
                            <div className="bg-success-light/30 border-success/30 text-success flex items-center gap-2 rounded border px-3 py-2 text-xs font-semibold">
                                <div className="bg-success size-2 rounded-full" />
                                STATUS: ACCEPTED
                            </div>
                        </div>

                        <div className="text-text-muted mt-8 text-center text-xs font-medium tracking-widest uppercase">
                            Live Monitoring: CodeArena Judge Engine v2.4
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
