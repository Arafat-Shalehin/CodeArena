'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion'
import { featuresData } from '../data/features.data'
import Image from 'next/image'
import { LaserBorder } from '@/components/ui/LaserBorder'

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedTerminal — displayed inside the "hero" feature card
// ─────────────────────────────────────────────────────────────────────────────
const AnimatedTerminal = () => {
    return (
        <div className="bg-bg-page/55 border-border group-hover:border-accent/30 relative mt-3 flex w-full flex-col overflow-hidden rounded-lg border p-2 font-mono text-[9px] leading-relaxed transition-colors duration-500 sm:text-[10px] lg:mt-0">
            <div className="border-border/50 mb-1.5 flex items-center gap-1.5 border-b pb-1.5 opacity-60">
                <div className="bg-error size-2 rounded-full" />
                <div className="bg-warning size-2 rounded-full" />
                <div className="bg-success size-2 rounded-full" />
                <span className="text-text-muted ml-1.5 text-[9px] tracking-wider uppercase">
                    container-sandbox-0x9a
                </span>
            </div>
            <div className="text-text-secondary flex flex-col gap-0.5">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                >
                    <span className="text-text-muted">$</span> docker run -it codearena/runner
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    <span className="text-success">[OK]</span> Isolated. Memory: 256MB.
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="mt-1"
                >
                    <span className="text-text-muted">$</span> javac Solution.java
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.0 }}
                >
                    <span className="text-success">[OK]</span> Build successful in 450ms.
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.2 }}
                >
                    <span className="text-text-primary">Running test cases...</span>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.45, type: 'spring' }}
                    className="mt-1 flex flex-col gap-0.5"
                >
                    <div className="text-success font-display font-bold tracking-wide">
                        [VERDICT: ACCEPTED]
                    </div>
                    <div className="text-text-muted">Time: 12ms · Memory: 42.1MB</div>
                </motion.div>
            </div>

            {/* Subtle glow on card hover */}
            <div className="bg-accent/5 absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// BentoCard — individual feature card with entrance animation
// ─────────────────────────────────────────────────────────────────────────────
const BentoCard = ({ feature, index, mousePos }) => {
    const shouldReduceMotion = useSafeReducedMotion()
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-50px' })
    const [isHovered, setIsHovered] = useState(false)

    const spanMap = {
        docker: 'col-span-2 md:col-span-6 lg:col-span-6',
        judge: 'col-span-1 md:col-span-3 lg:col-span-3',
        'ai-interview': 'col-span-1 md:col-span-3 lg:col-span-3',
        auth: 'col-span-1 md:col-span-3 lg:col-span-3',
        browser: 'col-span-1 md:col-span-3 lg:col-span-3',
        history: 'col-span-1 md:col-span-3 lg:col-span-3',
        apis: 'col-span-1 md:col-span-3 lg:col-span-3',
    }
    const colSpanClass = spanMap[feature.id] || 'col-span-1 md:col-span-2 lg:col-span-3'

    const flexClass =
        feature.size === 'hero'
            ? 'flex flex-col lg:grid lg:grid-cols-2 lg:items-start lg:gap-5'
            : 'flex flex-col h-full'

    return (
        <motion.div
            ref={ref}
            initial={
                shouldReduceMotion
                    ? false
                    : {
                          opacity: 0,
                          y: 16,
                          scale: 0.97,
                          rotate: index % 2 === 0 ? -1.2 : 1.2,
                      }
            }
            animate={
                isInView || shouldReduceMotion ? { opacity: 1, y: 0, scale: 1, rotate: 0 } : {}
            }
            transition={{
                duration: 0.55,
                delay: shouldReduceMotion ? 0 : index * 0.06,
                ease: [0.16, 1, 0.3, 1],
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`group relative ${colSpanClass}`}
        >
            <Card
                className={`border-border bg-bg-subtle/45 hover:border-accent/45 relative h-full min-h-[150px] overflow-hidden rounded-xl border backdrop-blur-md transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(var(--ca-accent-rgb),0.07)] ${flexClass} p-3 sm:p-3.5 lg:p-4`}
            >
                {/* Global coordinated spotlight */}
                <div
                    className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                        background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, var(--color-accent), transparent 40%)`,
                        opacity: isHovered ? 0.08 : 0,
                    }}
                />

                {/* Laser Border tracing on hover */}
                <LaserBorder isHovered={isHovered} />

                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(var(--ca-border-rgb),0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--ca-border-rgb),0.22)_1px,transparent_1px)] bg-[size:26px_26px] opacity-[0.08]" />
                <div className="from-accent/12 pointer-events-none absolute -right-14 -bottom-14 h-40 w-40 rounded-full bg-radial to-transparent blur-2xl" />

                <div className="relative z-10 flex w-full flex-col">
                    {/* Icon */}
                    <div className="bg-bg-page border-border group-hover:border-accent/40 mb-2 flex size-7 items-center justify-center rounded-md border shadow-sm transition-colors duration-300">
                        <div className="text-text-primary group-hover:text-accent transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 [&_svg]:size-3">
                            {feature.icon}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="mb-1">
                        <h3 className="font-display text-text-primary mb-1 text-[14px] font-black tracking-tight md:text-[15px]">
                            {feature.title}
                        </h3>
                        <p className="text-text-secondary text-[10px] leading-relaxed font-medium sm:text-[11px]">
                            {feature.desc}
                        </p>
                    </div>

                    {/* Proof badge */}
                    {feature.proof && (
                        <div className="mt-1 mb-1.5">
                            <span className="bg-bg-page border-border text-text-secondary group-hover:border-accent/40 group-hover:bg-accent-light/60 group-hover:text-accent inline-flex items-center rounded-full border px-2 py-0.5 text-[8px] font-bold tracking-wider uppercase transition-all duration-300 sm:text-[9px]">
                                {feature.proof}
                            </span>
                        </div>
                    )}
                </div>

                {/* Hero terminal */}
                {feature.size === 'hero' && <AnimatedTerminal />}

                {/* Imagery for smaller cards */}
                {feature.image && feature.size !== 'hero' && (
                    <div className="border-border bg-bg-page relative mt-auto h-16 w-full overflow-hidden rounded-lg border transition-transform duration-500 group-hover:-translate-y-1 sm:h-20">
                        <div className="from-bg-subtle/40 absolute inset-0 z-10 bg-gradient-to-b to-transparent opacity-100 transition-opacity duration-300 group-hover:opacity-0" />
                        <div className="relative h-full w-full opacity-60 transition-opacity duration-300 group-hover:opacity-100">
                            <Image
                                src={feature.image}
                                alt={feature.title}
                                fill
                                loading="lazy"
                                sizes="(max-width: 768px) 100vw, 33vw"
                                quality={80}
                                className="object-cover object-top"
                            />
                        </div>
                    </div>
                )}
            </Card>
        </motion.div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// FeaturesBentoGrid — exported client component consumed by FeaturesSection RSC
// ─────────────────────────────────────────────────────────────────────────────
export default function FeaturesBentoGrid() {
    const containerRef = useRef(null)
    const isInView = useInView(containerRef, { once: true, margin: '320px' })
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

    const handleMouseMove = (e) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        })
    }

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="mx-auto grid w-full grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-6 lg:grid-cols-12 lg:gap-3"
        >
            {isInView
                ? featuresData.map((feature, idx) => (
                      <BentoCard
                          key={feature.id}
                          feature={feature}
                          index={idx}
                          mousePos={mousePos}
                      />
                  ))
                : Array.from({ length: featuresData.length }).map((_, idx) => (
                      <div
                          key={idx}
                          className="bg-bg-subtle h-32 animate-pulse rounded-2xl sm:h-36 md:h-40"
                      />
                  ))}
        </div>
    )
}
