'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { aboutContent } from '../data/about.data'

/**
 * AboutFeatures component for the CodeArena platform.
 * Renders a responsive grid of key platform features using data-driven patterns.
 *
 * @component
 * @returns {React.ReactElement} The rendered platform features section.
 */
export default function AboutFeatures() {
    return (
        <section className="bg-bg-page py-24">
            <div className="max-w-container mx-auto px-4 md:px-6">
                <div className="mb-16">
                    <h2 className="text-text-primary text-3xl font-semibold tracking-tight">
                        Platform Features
                    </h2>
                    <p className="text-text-secondary mt-3 text-sm font-medium tracking-wider uppercase">
                        Engineered for High Performance
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                    {aboutContent.features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group"
                        >
                            <div className="bg-bg-subtle border-border hover:border-accent/40 duration-normal flex h-full flex-col rounded-xl border p-8 transition-all hover:shadow-md">
                                <div className="text-accent bg-accent-light duration-normal mb-6 w-fit rounded-lg p-3 transition-transform group-hover:scale-110">
                                    {feature.icon && typeof feature.icon === 'object'
                                        ? React.cloneElement(feature.icon, { className: 'w-6 h-6' })
                                        : feature.icon}
                                </div>
                                <h3 className="text-text-primary mb-3 text-lg font-bold">
                                    {feature.title}
                                </h3>
                                <p className="text-text-secondary text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
