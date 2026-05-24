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
        offset: ['start center', 'end center'],
    })

    const [elevationValue, setElevationValue] = useState(0)
    const rawElevation = useTransform(scrollYProgress, [0, 1], [0, 4000])

    useMotionValueEvent(rawElevation, 'change', (v) => {
        // requestAnimationFrame / throttle
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

                {/* Camps / Steps Timeline */}
                <div className="relative mx-auto max-w-4xl">
                    {/* Responsive Straight Center Timeline Track (Desktop only) */}
                    <div className="pointer-events-none absolute left-1/2 top-[40px] bottom-[40px] w-0.5 -translate-x-1/2 hidden lg:block z-0">
                        {/* Background track line */}
                        <div className="w-full h-full bg-border/20" />
                        {/* Glowing active scroll progress line */}
                        <motion.div
                            className="absolute top-0 left-0 w-full bg-accent origin-top shadow-[0_0_8px_var(--color-accent)]"
                            style={{
                                height: '100%',
                                scaleY: scrollYProgress,
                            }}
                        />
                    </div>

                    {stepsData.map((step, idx) => {
                        const isLeft = idx % 2 === 0

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: isLeft ? -50 : 50, y: 20 }}
                                whileInView={{ opacity: 1, x: 0, y: 0 }}
                                viewport={{ once: true, margin: '-100px' }}
                                transition={{
                                    duration: 0.8,
                                    ease: [0.16, 1, 0.3, 1],
                                }}
                                className={cn(
                                    'relative mb-12 last:mb-0 lg:mb-0 lg:w-1/2',
                                    isLeft ? 'lg:pr-16' : 'lg:ml-auto lg:pl-16'
                                )}
                            >
                                {/* Vertical connector (mobile only) */}
                                {idx < stepsData.length - 1 && (
                                    <div className="from-border/50 absolute top-[60px] bottom-[-48px] left-[23px] w-px bg-gradient-to-b to-transparent lg:hidden" />
                                )}

                                {/* Camp card */}
                                <div className="group relative">
                                    {/* Double-ring Step marker dot — positioned exactly on the dividing line */}
                                    <div
                                        className={cn(
                                            'absolute top-6 z-20 hidden lg:flex items-center justify-center size-10 rounded-full bg-bg-page',
                                            isLeft ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'
                                        )}
                                    >
                                        <div className="size-8 rounded-full bg-bg-subtle border border-border flex items-center justify-center group-hover:bg-accent group-hover:text-bg-page group-hover:border-accent group-hover:shadow-[0_0_15px_rgba(2,186,76,0.5)] transition-all duration-300">
                                            <span className="font-mono text-xs font-bold">
                                                {String(step.step).padStart(2, '0')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Interactive card content */}
                                    <div className="bg-bg-subtle/40 border-border/50 hover:border-accent/30 hover:bg-bg-subtle/60 relative rounded-xl border p-5 transition-all duration-300 hover:scale-[1.02] sm:p-6 shadow-xs hover:shadow-md">
                                        {/* Mobile step number */}
                                        <div className="bg-accent/10 border-accent/30 mb-4 flex size-9 items-center justify-center rounded-full border lg:hidden">
                                            <span className="text-accent font-mono text-xs font-bold">
                                                {String(step.step).padStart(2, '0')}
                                            </span>
                                        </div>

                                        {/* Card Header (Elevation, Tag & Icon) */}
                                        <div className="mb-4 flex items-start justify-between gap-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-text-muted font-mono text-[10px] font-bold">
                                                        ▲ {step.elevation}
                                                    </span>
                                                    <span className="text-accent/70 text-[9px] font-bold tracking-[0.15em] uppercase">
                                                        {step.tag}
                                                    </span>
                                                </div>
                                                <h3 className="text-text-primary mt-1 text-base font-bold tracking-tight sm:text-lg">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            {/* Lucide Step Icon with hover styling */}
                                            <div className="text-accent bg-accent/5 border border-accent/15 flex size-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:bg-accent/10 group-hover:border-accent/30">
                                                {step.icon}
                                            </div>
                                        </div>

                                        {/* Description */}
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
