'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Card } from '@/components/ui/card'

// Data
import { stepsData } from '../data/steps.data'

/**
 * @component HowItWorksSection
 * @description An interactive stepper showing the platform journey with scroll-driven path animation.
 */
export default function HowItWorksSection() {
    const containerRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start center', 'end center'],
    })

    return (
        <section ref={containerRef} className="bg-bg-subtle/30 relative overflow-hidden py-24">
            <div className="mx-auto max-w-7xl px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-24 text-center"
                >
                    <h2 className="font-display text-text-primary mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                        The{' '}
                        <span className="text-accent italic drop-shadow-[0_0_10px_rgba(2,186,76,0.2)]">
                            Path
                        </span>{' '}
                        to Mastery
                    </h2>
                    <p className="text-text-muted mx-auto max-w-2xl leading-relaxed md:text-lg">
                        Our platform is designed to take you from a curious coder to an algorithm
                        expert through a structured, rewarding process.
                    </p>
                </motion.div>

                {/* Stepper Container */}
                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="absolute top-24 left-0 hidden w-full px-24 lg:block">
                        <svg className="h-2 w-full" fill="none" viewBox="0 0 1000 8">
                            <path
                                d="M0 4L1000 4"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-zinc-200"
                                strokeDasharray="8 8"
                            />
                            <motion.path
                                d="M0 4L1000 4"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="text-accent"
                                style={{ pathLength: scrollYProgress }}
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>

                    {/* Steps Grid */}
                    <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                        {stepsData.map((step, idx) => (
                            <StepCard
                                key={idx}
                                step={step}
                                index={idx}
                                progress={scrollYProgress}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

function StepCard({ step, index, progress }) {
    // Calculate when this card should "activate" based on scroll progress
    const activationPoint = index * 0.25

    // Create color transforms using useTransform (must be inside component)
    const bgTransform = useTransform(
        progress,
        [activationPoint, activationPoint + 0.1],
        ['#ffffff', '#00C853']
    )
    const colorTransform = useTransform(
        progress,
        [activationPoint, activationPoint + 0.1],
        ['#a1a1aa', '#ffffff']
    )
    const opacityTransform = useTransform(
        progress,
        [activationPoint, activationPoint + 0.1],
        [0, 1]
    )

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group relative"
        >
            {/* Step Number Badge */}
            <div className="relative mb-8 flex justify-center lg:justify-start">
                <motion.div
                    style={{
                        backgroundColor: bgTransform,
                        color: colorTransform,
                    }}
                    className="border-border group-hover:shadow-accent-glow flex size-16 items-center justify-center rounded-2xl border font-mono text-2xl font-black shadow-sm transition-shadow duration-500"
                >
                    {step.step < 10 ? `0${step.step}` : step.step}
                </motion.div>

                {/* Icon Float-up */}
                <motion.div
                    style={{ opacity: opacityTransform }}
                    className="bg-accent absolute -top-4 -right-4 flex size-10 items-center justify-center rounded-xl text-white shadow-lg lg:right-auto lg:left-12"
                >
                    <span className="material-symbols-outlined text-xl">{step.icon}</span>
                </motion.div>
            </div>

            {/* Content */}
            <div className="text-center lg:text-left">
                <h3 className="text-text-primary mb-3 text-xl font-extrabold tracking-tight">
                    {step.title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">{step.desc}</p>
            </div>
        </motion.div>
    )
}
