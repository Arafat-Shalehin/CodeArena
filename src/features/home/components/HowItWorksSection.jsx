'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { stepsData } from '../data/steps.data'
import { cn } from '@/lib/utils'

const mountainPath =
    'M0 240 L60 220 L120 235 L200 180 L280 210 L360 140 L440 170 L520 90 L600 130 L680 50 L760 100 L840 30 L920 80 L1000 40 L1080 70 L1200 120 L1200 300 L0 300 Z'

export default function HowItWorksSection() {
    const sectionRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end start'],
    })

    const [elevationValue, setElevationValue] = useState(0)
    const rawElevation = useTransform(scrollYProgress, [0, 1], [0, 4000])

    useMotionValueEvent(rawElevation, 'change', (v) => {
        setElevationValue(Math.round(v))
    })

    return (
        <section ref={sectionRef} className="bg-bg-page relative overflow-hidden py-16 md:py-24">
            {/* Gradient background — dark valley floor → lighter summit zone */}
            <div className="from-bg-page via-bg-subtle/30 to-bg-page pointer-events-none absolute inset-0 bg-gradient-to-b opacity-60" />

            {/* Mountain silhouette */}
            <div className="pointer-events-none absolute inset-0 flex items-end opacity-[0.04]">
                <svg viewBox="0 0 1200 300" className="w-full" preserveAspectRatio="xMidYMax slice">
                    <motion.path
                        d={mountainPath}
                        fill="var(--color-accent)"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5 }}
                    />
                </svg>
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-16 text-center"
                >
                    <div className="mb-4 flex items-center justify-center gap-3">
                        <span className="text-accent text-[10px] font-bold tracking-[0.2em] uppercase">
                            Ascent
                        </span>
                        <span className="bg-border/30 h-px w-8" />
                        <span className="text-text-muted font-mono text-[10px] font-bold">
                            {elevationValue} / 4,000m
                        </span>
                    </div>

                    <h2 className="font-display text-text-primary text-2xl leading-tight font-semibold tracking-tight [text-wrap:balance] sm:text-4xl md:text-5xl">
                        The <span className="text-accent italic">Path</span> to Mastery
                    </h2>
                    <p className="text-text-secondary mx-auto mt-3 max-w-xl text-sm leading-relaxed font-medium">
                        Four stages from base camp to summit — each one engineered to push you
                        higher.
                    </p>

                    {/* Elevation progress bar */}
                    <div className="bg-border/20 mx-auto mt-8 h-1 w-full max-w-xs overflow-hidden rounded-full">
                        <motion.div
                            className="bg-accent h-full rounded-full"
                            style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}
                        />
                    </div>
                    <p className="text-text-muted mt-2 font-mono text-[10px] font-bold tracking-wider">
                        <span className="text-accent">{elevationValue}m</span> ascended
                    </p>
                </motion.div>

                {/* Camps */}
                <div className="relative mx-auto max-w-4xl">
                    {/* Connecting path (desktop) */}
                    <div className="pointer-events-none absolute inset-0 hidden lg:block">
                        <svg
                            className="h-full w-full"
                            viewBox="0 0 800 600"
                            fill="none"
                            preserveAspectRatio="xMidYMax meet"
                        >
                            <motion.path
                                d="M 120 80 C 200 80, 250 120, 300 160 C 350 200, 400 200, 450 240 C 500 280, 520 320, 580 360 C 640 400, 680 400, 700 440"
                                stroke="var(--color-accent)"
                                strokeWidth="1.5"
                                strokeDasharray="8 6"
                                initial={{ pathLength: 0, opacity: 0 }}
                                whileInView={{ pathLength: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 2, ease: 'easeInOut' }}
                                className="opacity-30"
                            />
                            <motion.path
                                d="M 120 80 C 200 80, 250 120, 300 160 C 350 200, 400 200, 450 240 C 500 280, 520 320, 580 360 C 640 400, 680 400, 700 440"
                                stroke="var(--color-accent)"
                                strokeWidth="1.5"
                                initial={{ pathLength: 0 }}
                                whileInView={{ pathLength: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 2.5, ease: 'easeInOut', delay: 0.3 }}
                            />
                        </svg>
                    </div>

                    {stepsData.map((step, idx) => {
                        const isLeft = idx % 2 === 0

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{
                                    duration: 0.6,
                                    delay: idx * 0.15,
                                    ease: [0.16, 1, 0.3, 1],
                                }}
                                className={cn(
                                    'relative mb-6 last:mb-0 lg:mb-0 lg:w-1/2',
                                    isLeft ? 'lg:pr-12 lg:text-right' : 'lg:ml-auto lg:pl-12'
                                )}
                            >
                                {/* Vertical connector (mobile) */}
                                {idx < stepsData.length - 1 && (
                                    <div className="from-border/50 absolute top-[60px] bottom-[-24px] left-[23px] w-px bg-gradient-to-b to-transparent lg:hidden" />
                                )}

                                {/* Camp card */}
                                <div className="group relative">
                                    {/* Step marker dot — positioned on the dividing line */}
                                    <div
                                        className={cn(
                                            'absolute top-6 z-10 hidden lg:flex',
                                            isLeft ? 'right-[-20px]' : 'left-[-20px]'
                                        )}
                                    >
                                        <div className="bg-accent flex size-10 items-center justify-center rounded-full shadow-[0_0_16px_rgba(2,186,76,0.15)]">
                                            <span className="text-bg-page font-mono text-xs font-bold">
                                                {String(step.step).padStart(2, '0')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-bg-subtle/40 border-border/50 hover:border-accent/30 relative rounded-xl border p-5 transition-colors duration-300 sm:p-6">
                                        {/* Mobile step number */}
                                        <div className="bg-accent/10 border-accent/30 mb-4 flex size-9 items-center justify-center rounded-full border lg:hidden">
                                            <span className="text-accent font-mono text-xs font-bold">
                                                {String(step.step).padStart(2, '0')}
                                            </span>
                                        </div>

                                        {/* Elevation badge */}
                                        <div className="mb-3 flex items-center gap-2">
                                            <span className="text-text-muted font-mono text-[10px] font-bold">
                                                ▲ {step.elevation}
                                            </span>
                                            <span className="text-accent/70 text-[9px] font-bold tracking-[0.15em] uppercase">
                                                {step.tag}
                                            </span>
                                        </div>

                                        <h3 className="text-text-primary mb-1.5 text-base font-bold tracking-tight sm:text-lg">
                                            {step.title}
                                        </h3>
                                        <p className="text-text-secondary text-xs leading-relaxed font-medium">
                                            {step.desc}
                                        </p>

                                        {/* Terrain accent line */}
                                        <div className="bg-accent/20 mt-4 h-0.5 w-0 rounded-full transition-all duration-500 group-hover:w-1/3" />
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
