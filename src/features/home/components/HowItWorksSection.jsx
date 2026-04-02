'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import { stepsData } from '../data/steps.data'
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion'
import { cn } from '@/lib/utils'

export default function HowItWorksSection() {
    const containerRef = useRef(null)
    const reducedMotion = useSafeReducedMotion()
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start center', 'end center'],
    })
    const isInView = useInView(containerRef, { once: true, margin: '240px' })

    // Drawing Path Logic (SVG)
    const pathLength = useSpring(scrollYProgress, { stiffness: 40, damping: 15 })

    return (
        <section ref={containerRef} className="bg-bg-page relative overflow-hidden py-32 md:py-40">
            {/* Background Decor */}
            <div className="bg-dot-matrix pointer-events-none absolute inset-0 z-0 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)] opacity-[0.4]" />

            {/* LASER PATH SVG (Desktop only for precision) */}
            <div className="pointer-events-none absolute inset-0 z-0 hidden lg:block">
                <svg
                    className="h-full w-full opacity-10"
                    viewBox="0 0 1200 800"
                    fill="none"
                    preserveAspectRatio="none"
                >
                    <motion.path
                        d="M 150 400 C 300 400, 300 600, 450 600 C 600 600, 600 400, 750 400 C 900 400, 900 600, 1050 600"
                        stroke="var(--color-accent)"
                        strokeWidth="2"
                        strokeDasharray="12 12"
                        style={{ pathLength: pathLength }}
                    />
                </svg>
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-24 text-center"
                >
                    <h2 className="font-display text-text-primary mb-6 text-4xl leading-tight font-black tracking-tight [text-wrap:balance] md:text-7xl lg:text-7xl">
                        The <span className="text-accent italic">Path</span> to Mastery
                    </h2>
                    <p className="text-text-secondary mx-auto max-w-2xl text-sm leading-relaxed font-medium md:text-base lg:text-lg">
                        A structured progression designed to transform your algorithmic intuition
                        into professional-grade engineering expertise.
                    </p>
                </motion.div>

                {/* Steps Grid */}
                <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
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

/* ----------------- STEP CARD ----------------- */

function StepCard({ step, index, progress, reducedMotion, isLast }) {
    const activationPoint = index * 0.25
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        })
    }

    // Activation states based on scroll
    const opacityActive = useTransform(progress, [activationPoint - 0.1, activationPoint], [0.4, 1])
    const bgColorActive = useTransform(
        progress,
        [activationPoint - 0.05, activationPoint],
        ['var(--color-bg-subtle)', 'var(--color-accent)']
    )
    const textColorActive = useTransform(
        progress,
        [activationPoint - 0.05, activationPoint],
        ['var(--color-text-muted)', 'var(--color-text-inverse)']
    )

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.8 }}
            onMouseMove={handleMouseMove}
            className="group relative"
        >
            <div className="bg-bg-subtle border-border hover:border-accent/40 group-hover:shadow-accent/5 relative flex h-full flex-col items-center rounded-3xl border p-8 transition-[border-color,transform,box-shadow] duration-500 group-hover:shadow-lg lg:items-start">
                {/* Spotlight hover effect */}
                <div
                    className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-10"
                    style={{
                        background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, var(--color-accent), transparent 40%)`,
                    }}
                />

                {/* Vertical Path Mobile */}
                {!isLast && (
                    <div className="from-border/50 absolute top-[100%] left-1/2 h-12 w-px -translate-x-1/2 bg-gradient-to-b to-transparent sm:hidden" />
                )}

                {/* Step Marker */}
                <div className="relative mb-8 flex flex-col items-center lg:items-start">
                    <motion.div
                        style={{
                            backgroundColor: bgColorActive,
                            color: textColorActive,
                            opacity: opacityActive,
                        }}
                        className="group-hover:shadow-accent-glow relative z-10 flex size-12 items-center justify-center rounded-2xl font-mono text-lg font-bold shadow-sm transition-shadow duration-500 sm:size-14 sm:text-xl"
                    >
                        {step.step < 10 ? `0${step.step}` : step.step}
                    </motion.div>

                    {/* Icon Overlay */}
                    <motion.div
                        style={{
                            opacity: useTransform(
                                progress,
                                [activationPoint, activationPoint + 0.05],
                                [0, 1]
                            ),
                        }}
                        className="bg-accent text-text-inverse shadow-accent/20 ring-bg-page absolute -top-4 -right-4 flex size-8 items-center justify-center rounded-xl shadow-lg ring-4 sm:size-10 lg:-top-5 lg:-right-5 lg:size-11"
                    >
                        <div
                            className="transition-transform duration-300 group-hover:scale-110"
                            aria-hidden="true"
                        >
                            {step.icon}
                        </div>
                    </motion.div>
                </div>

                {/* Text Content */}
                <div className="relative z-10 text-center lg:text-left">
                    <h3 className="text-text-primary mb-2 text-base font-bold tracking-tight sm:mb-3 sm:text-xl">
                        {step.title}
                    </h3>
                    <p className="text-text-secondary text-xs leading-relaxed font-medium sm:text-sm">
                        {step.desc}
                    </p>
                </div>

                {/* Hover Reveal Detail */}
                <div className="bg-accent/10 mt-6 h-1 w-0 rounded-full transition-all duration-500 group-hover:w-1/3" />
            </div>
        </motion.div>
    )
}
