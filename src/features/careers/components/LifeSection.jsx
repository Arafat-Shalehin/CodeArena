'use client'

import { motion } from 'framer-motion'

const STATS = [
    { label: 'Global Users', value: '2.5M+' },
    { label: 'Lines of Code Judged', value: '500M+' },
    { label: 'Submissions/Day', value: '150k+' },
    { label: 'Languages Supported', value: '25+' },
]

/**
 * @component LifeSection
 * @description Section showcasing life and culture at CodeArena.
 */
export default function LifeSection() {
    return (
        <section className="overflow-hidden py-20 md:py-28">
            <div className="max-w-container mx-auto px-4 md:px-6">
                <div className="mb-16 text-center">
                    <h2 className="text-text-primary mb-4 text-3xl font-bold md:text-4xl">
                        Built by engineers,{' '}
                        <span className="text-accent font-mono font-medium">
                            {'<'}for engineers{'/>'}
                        </span>
                    </h2>
                    <p className="text-text-secondary mx-auto max-w-2xl text-lg">
                        We are a remote-first team of competitive programmers, system architects,
                        and designers striving to build the ultimate playground for code
                        enthusiasts.
                    </p>
                </div>

                <div className="mb-20 grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                    {STATS.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-bg-subtle border-border rounded-xl border p-6"
                        >
                            <div className="text-accent mb-2 text-3xl font-bold md:text-4xl">
                                {stat.value}
                            </div>
                            <div className="text-text-muted text-sm font-medium tracking-wide uppercase">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="bg-bg-subtle border-border group relative overflow-hidden rounded-2xl border p-8 md:col-span-2">
                        <h3 className="text-text-primary mb-4 text-2xl font-semibold">
                            Collaborative Innovation
                        </h3>
                        <p className="text-text-secondary mb-6 leading-relaxed">
                            Our engineering culture is rooted in deep technical discussion. We host
                            weekly internal algorithms contests and open-source our core Judge API
                            components.
                        </p>
                        <div className="flex gap-2">
                            <span className="bg-accent/10 text-accent rounded px-2 py-1 font-mono text-xs">
                                #rust
                            </span>
                            <span className="bg-accent/10 text-accent rounded px-2 py-1 font-mono text-xs">
                                #go
                            </span>
                            <span className="bg-accent/10 text-accent rounded px-2 py-1 font-mono text-xs">
                                #kubernetes
                            </span>
                        </div>
                    </div>

                    <div className="bg-accent border-accent/20 flex flex-col justify-end rounded-2xl border p-8 text-white">
                        <blockquote className="mb-6 text-xl font-medium italic">
                            "Working at CodeArena means tackling some of the hardest problems in
                            distributed systems and performance optimization."
                        </blockquote>
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-white/20" />
                            <div>
                                <div className="font-bold">Sarah Chen</div>
                                <div className="text-sm opacity-80">Director of Judge Systems</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
