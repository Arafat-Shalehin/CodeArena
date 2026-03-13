'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { stepsData } from '../data/steps.data'
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion'

export default function HowItWorksSection() {
    const containerRef = useRef(null)
    const reducedMotion = useSafeReducedMotion()
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start center', 'end center'],
    })

    return (
        <section ref={containerRef} className="bg-bg-subtle/30 relative overflow-hidden py-12">
            <div className="mx-auto max-w-7xl px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 text-center"
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

                {/* Connector Line (Desktop only) */}
                <div className="absolute top-20 left-0 z-[-1] hidden w-full px-24 lg:block">
                    <svg className="h-2 w-full" fill="none" viewBox="0 0 1000 8">
                        <path
                            d="M0 4L1000 4"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-border"
                            strokeDasharray="8 8"
                        />
                        <motion.path
                            d="M0 4L1000 4"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-accent drop-shadow-[0_0_8px_rgba(2,186,76,0.6)]"
                            style={{ pathLength: reducedMotion ? 1 : scrollYProgress }}
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
                    {stepsData.map((step, idx) => (
                        <StepCard
                            key={idx}
                            step={step}
                            index={idx}
                            progress={scrollYProgress}
                            reducedMotion={reducedMotion}
                            isLast={idx === stepsData.length - 1}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}

function StepCard({ step, index, progress, reducedMotion, isLast }) {
    const activationPoint = index * 0.25

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
    const iconOpacity = useTransform(progress, [activationPoint, activationPoint + 0.1], [0, 1])

    // Spring physics for a more aggressive "pop" when activated
    const scaleTransform = useTransform(
        progress,
        [activationPoint, activationPoint + 0.1],
        [0.95, 1.05]
    )
    const popScale = Object.assign(scaleTransform, { stiffness: 300, damping: 15 })

    return (
        <motion.div
            style={{ scale: reducedMotion ? 1 : popScale }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="group relative transition-transform duration-300"
        >
            {/* Mobile vertical connector */}
            {!isLast && (
                <div className="absolute top-20 left-1/2 flex -translate-x-1/2 flex-col items-center sm:hidden">
                    <div className="bg-border mt-2 h-full min-h-[48px] w-px" />
                    <svg
                        width="10"
                        height="6"
                        className="text-border"
                        viewBox="0 0 10 6"
                        fill="none"
                    >
                        <path d="M0 0L5 6L10 0" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </div>
            )}

            {/* Badge + Icon */}
            <div className="relative mx-auto mb-8 flex min-h-[96px] w-fit flex-col items-center">
                <motion.div
                    style={{
                        backgroundColor: reducedMotion ? '#00C853' : bgTransform,
                        color: reducedMotion ? '#ffffff' : colorTransform,
                    }}
                    className="border-border group-hover:shadow-accent-glow flex size-16 items-center justify-center rounded-2xl border font-mono text-2xl font-black shadow-sm transition-shadow duration-500"
                >
                    {step.step < 10 ? `0${step.step}` : step.step}
                </motion.div>

                <motion.div
                    style={{ opacity: iconOpacity, scale: iconOpacity }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.2 }}
                    className="bg-accent ring-bg-page absolute -top-4 -right-4 flex size-12 items-center justify-center rounded-xl text-white shadow-[0_0_20px_rgba(2,186,76,0.4)] ring-2"
                >
                    <div className="[&_svg]:size-6">{step.icon}</div>
                </motion.div>
            </div>

            {/* Text Content */}
            <div className="text-center lg:text-left">
                <h3 className="text-text-primary mb-3 text-xl font-extrabold tracking-tight">
                    {step.title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">{step.desc}</p>
            </div>
        </motion.div>
    )
}
