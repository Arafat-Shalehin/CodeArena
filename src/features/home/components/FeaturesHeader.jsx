'use client'

import { motion } from 'framer-motion'

const stats = [
    { label: 'Problems', value: '2,500+' },
    { label: 'Languages', value: '20+' },
    { label: 'Avg. Judge', value: '< 120ms' },
    { label: 'Contestants', value: '50,000+' },
]

export default function FeaturesHeader() {
    return (
        <div className="mb-12 flex flex-col items-center text-center">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="font-display text-text-primary text-2xl leading-[1.1] font-semibold tracking-tight [text-wrap:balance] sm:text-4xl md:text-5xl"
            >
                Everything you need to{' '}
                <span className="text-accent italic">practice, compete,</span> and get interview
                ready.
            </motion.h2>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-text-secondary mt-4 max-w-2xl text-sm leading-relaxed font-medium [text-wrap:balance] md:text-base"
            >
                Fast judging, secure execution, and clear progress signals in one focused workflow.
                Built by developers, for developers.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
            >
                {stats.map((stat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <span className="text-accent font-mono text-base font-bold sm:text-lg">
                            {stat.value}
                        </span>
                        <span className="text-text-muted text-[10px] font-semibold tracking-wider uppercase">
                            {stat.label}
                        </span>
                        {idx < stats.length - 1 && (
                            <span className="bg-border/40 ml-2 hidden h-6 w-px sm:block" />
                        )}
                    </div>
                ))}
            </motion.div>
        </div>
    )
}
