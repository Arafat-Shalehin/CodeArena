'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion'
import { featuresData } from '../data/features.data'

/**
 * @component FeaturesSection
 * @description High-end continuous stream narrative layout with sticky text and 3D stacking feature cards.
 */
export default function FeaturesSection() {
    const containerRef = useRef(null)
    const shouldReduceMotion = useSafeReducedMotion()

    // Track scroll progress through the entire section
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    })

    // Add a subtle spring for momentum-based feel
    const smoothedProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    })

    return (
        <section
            ref={containerRef}
            className="bg-bg-page relative mx-auto h-[300vh] max-w-7xl px-4 pt-8 pb-12 lg:h-[400vh]"
        >
            {/* 
              Background ambient glow attached to scroll.
              Moves down slightly as user scrolls through features.
            */}
            <motion.div
                className="bg-accent/5 absolute top-0 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[120px]"
                style={{
                    y: useTransform(smoothedProgress, [0, 1], [0, 800]),
                }}
            />

            <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-between gap-12 overflow-hidden pt-20 lg:flex-row lg:gap-24 lg:pt-0">
                {/* Left Column: Fixed Narrative Text */}
                <div className="z-20 flex h-full w-full flex-col justify-center pb-12 lg:w-[40%] lg:pb-0">
                    <motion.div
                        initial={shouldReduceMotion ? false : { opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="font-display text-text-primary mb-6 text-4xl leading-[1.1] font-extrabold tracking-tight md:text-6xl lg:text-7xl">
                            Engineered for <br />
                            <span className="text-accent italic drop-shadow-[0_0_15px_rgba(2,186,76,0.2)]">
                                dominance.
                            </span>
                        </h2>
                        <p className="text-text-muted max-w-lg text-lg leading-relaxed font-medium md:text-xl">
                            Forget clunky interfaces and slow runtimes. We built an arena that
                            matches the speed of your thought process, equipping you with
                            enterprise-grade tooling to crush any coding challenge.
                        </p>
                    </motion.div>
                </div>

                {/* Right Column: Scrolling 3D Stacked Cards */}
                <div className="relative z-10 flex h-[60vh] w-full items-center justify-center perspective-[2000px] lg:h-[80vh] lg:w-[50%]">
                    {featuresData.map((feature, idx) => {
                        // Calculate specific scroll trigger points for each card based on its index
                        const startOpacity = idx * 0.15
                        const fullOpacity = startOpacity + 0.1
                        const startExit = fullOpacity + 0.3
                        const fullExit = startExit + 0.2

                        // Tie opacity, scale, and Y-position to the scroll progress
                        const opacity = useTransform(
                            smoothedProgress,
                            [startOpacity, fullOpacity, startExit, fullExit],
                            [0, 1, 1, 0]
                        )

                        const yOffset = useTransform(
                            smoothedProgress,
                            [startOpacity, fullOpacity, startExit, fullExit],
                            [150, 0, 0, -150]
                        )

                        const scale = useTransform(
                            smoothedProgress,
                            [startOpacity, fullOpacity, startExit, fullExit],
                            [0.8, 1, 1, 0.9]
                        )

                        // Rotate slightly on the X-axis for a 3D entrance
                        const rotateX = useTransform(
                            smoothedProgress,
                            [startOpacity, fullOpacity],
                            [15, 0]
                        )

                        return (
                            <motion.div
                                key={idx}
                                style={{
                                    opacity: shouldReduceMotion ? 1 : opacity,
                                    y: shouldReduceMotion ? 0 : yOffset,
                                    scale: shouldReduceMotion ? 1 : scale,
                                    rotateX: shouldReduceMotion ? 0 : rotateX,
                                    position: 'absolute',
                                    zIndex: 10 + idx,
                                    willChange: 'transform, opacity',
                                }}
                                className="w-full max-w-[500px]"
                            >
                                <Card className="bg-bg-subtle/98 border-border/60 border-t-accent/20 relative flex flex-col items-start overflow-hidden rounded-[2rem] border-t p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] backdrop-blur-2xl md:p-10">
                                    {/* Inner Glow */}
                                    <div className="via-accent/50 absolute top-0 left-1/2 h-[1px] w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent" />

                                    <div className="bg-bg-page border-border group mb-8 flex size-14 items-center justify-center rounded-2xl border shadow-inner">
                                        <div className="text-accent transition-transform group-hover:scale-110 [&_svg]:size-7">
                                            {feature.icon}
                                        </div>
                                    </div>

                                    <h3 className="font-display text-text-primary mb-4 text-2xl font-black tracking-tight">
                                        {feature.title}
                                    </h3>
                                    <p className="text-text-muted text-lg leading-relaxed font-medium">
                                        {feature.desc}
                                    </p>

                                    {/* Bottom abstract noise/texture */}
                                    <div className="bg-accent/10 pointer-events-none absolute -right-24 -bottom-24 h-48 w-48 rounded-full blur-[50px]" />
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
