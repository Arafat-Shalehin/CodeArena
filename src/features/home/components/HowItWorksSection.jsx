'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { stepsData } from '../data/steps.data'
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion'
import { Tiles } from '@/components/ui/tiles'
import { cn } from '@/lib/utils'

export default function HowItWorksSection() {
    const containerRef = useRef(null)
    const reducedMotion = useSafeReducedMotion()
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start center', 'end center'],
    })

    return (
        <section ref={containerRef} className="bg-bg-page relative overflow-hidden py-24 md:py-32">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0">
                <Tiles rows={30} cols={15} tileSize="lg" className="opacity-40" />
                <div className="from-bg-subtle absolute inset-0 bg-gradient-to-b to-transparent" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-24 text-center"
                >
                    <h2 className="font-display text-text-primary mb-6 text-4xl font-extrabold tracking-tight md:text-6xl">
                        The{' '}
                        <span className="text-accent italic drop-shadow-[0_0_15px_rgba(var(--ca-accent-rgb),0.25)]">
                            Path
                        </span>{' '}
                        to Mastery
                    </h2>
                    <p className="text-text-muted mx-auto max-w-2xl leading-relaxed md:text-xl">
                        A structured progression designed to transform your algorithmic intuition
                        into professional-grade engineering expertise.
                    </p>
                </motion.div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
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
    const activationPoint = index * 0.2

    // Smooth transformations
    const scrollOpacity = useTransform(progress, [activationPoint - 0.1, activationPoint], [0.6, 1])
    const scrollY = useTransform(progress, [activationPoint - 0.1, activationPoint], [20, 0])
    const scrollRotate = useTransform(progress, [activationPoint - 0.1, activationPoint], [5, 0])

    // Spring physics for the card scale
    const rawScale = useTransform(
        progress,
        [activationPoint - 0.05, activationPoint, activationPoint + 0.1],
        [0.98, 1.02, 1]
    )
    const springScale = useSpring(rawScale, { stiffness: 200, damping: 20 })

    const bgTransform = useTransform(
        progress,
        [activationPoint, activationPoint + 0.05],
        ['rgba(var(--ca-bg-muted-rgb), 0.5)', 'var(--ca-accent)']
    )
    const colorTransform = useTransform(
        progress,
        [activationPoint, activationPoint + 0.05],
        ['var(--ca-text-muted)', 'var(--ca-text-inverse)']
    )
    const iconOpacity = useTransform(progress, [activationPoint, activationPoint + 0.05], [0, 1])

    return (
        <motion.div
            style={{
                scale: reducedMotion ? 1 : springScale,
                opacity: reducedMotion ? 1 : scrollOpacity,
                y: reducedMotion ? 0 : scrollY,
                rotateX: reducedMotion ? 0 : scrollRotate,
            }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="group relative"
        >
            <div className="glass-card hover:border-accent/30 relative flex h-full flex-col items-center rounded-3xl p-8 transition-colors duration-500 lg:items-start">
                {/* Mobile vertical connector */}
                {!isLast && (
                    <div className="from-border/50 absolute top-[100%] left-1/2 h-12 w-px -translate-x-1/2 bg-gradient-to-b to-transparent sm:hidden" />
                )}

                {/* Badge + Icon */}
                <div className="relative mb-8 flex flex-col items-center lg:items-start">
                    <motion.div
                        style={{
                            backgroundColor: reducedMotion ? 'var(--ca-accent)' : bgTransform,
                            color: reducedMotion ? 'var(--ca-text-inverse)' : colorTransform,
                        }}
                        className="group-hover:shadow-accent-glow flex size-14 items-center justify-center rounded-2xl border border-white/10 font-mono text-xl font-black shadow-sm backdrop-blur-md transition-shadow duration-500"
                    >
                        {step.step < 10 ? `0${step.step}` : step.step}
                    </motion.div>

                    <motion.div
                        style={{ opacity: iconOpacity, scale: iconOpacity }}
                        className="bg-accent ring-bg-page absolute -top-5 -right-5 flex size-10 items-center justify-center rounded-xl text-white shadow-[0_0_15px_rgba(2,186,76,0.3)] ring-4 lg:-top-6 lg:-right-6 lg:size-12"
                    >
                        <div className="[&_svg]:size-5 lg:[&_svg]:size-6">{step.icon}</div>
                    </motion.div>
                </div>

                {/* Text Content */}
                <div className="text-center lg:text-left">
                    <h3 className="text-text-primary mb-3 text-xl font-bold tracking-tight">
                        {step.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed">{step.desc}</p>
                </div>
            </div>
        </motion.div>
    )
}
