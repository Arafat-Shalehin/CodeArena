'use client'

import { motion } from 'framer-motion'
import { PERKS } from '../data/jobs.data'

/**
 * @component PerksSection
 * @description Section showcasing perks and benefits.
 */
export default function PerksSection() {
    return (
        <section className="bg-bg-subtle/30 border-border border-t py-20 md:py-28">
            <div className="max-w-container mx-auto px-4 md:px-6">
                <div className="mb-16 text-center">
                    <h2 className="text-text-primary mb-4 text-3xl font-bold md:text-4xl">
                        Perks & Benefits
                    </h2>
                    <p className="text-text-secondary mx-auto max-w-2xl text-lg">
                        We take care of our team so they can focus on building the best developer
                        tools.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {PERKS.map((perk, index) => (
                        <motion.div
                            key={perk.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-bg-page border-border hover:border-accent/40 group rounded-xl border p-6 transition-all duration-300 hover:shadow-lg"
                        >
                            <div className="mb-4 text-4xl transition-transform duration-300 group-hover:scale-110">
                                {perk.icon}
                            </div>
                            <h3 className="text-text-primary mb-2 text-lg font-bold">
                                {perk.title}
                            </h3>
                            <p className="text-text-secondary text-sm leading-relaxed">
                                {perk.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
