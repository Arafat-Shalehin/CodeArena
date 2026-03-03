'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CodeEditorPreview from './CodeEditorPreview'

/**
 * @component FloatingElement
 * @description Renders a floating tech-themed icon/text for the background.
 */
const FloatingElement = ({ children, initialX, initialY, duration, delay = 0 }) => {
    const shouldReduceMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (shouldReduceMotion) return null

    return (
        <motion.div
            initial={{ x: initialX, y: initialY, opacity: 0 }}
            animate={{
                y: [initialY, initialY - 40, initialY],
                opacity: [0, 0.4, 0],
            }}
            transition={{
                duration,
                repeat: Infinity,
                delay,
                ease: 'easeInOut',
            }}
            className="text-accent/30 absolute font-mono text-4xl select-none"
        >
            {children}
        </motion.div>
    )
}

export default function Hero() {
    return (
        <section className="hero-gradient relative overflow-hidden py-16 md:py-24">
            {/* Background Animations: Tech Debris */}
            <div className="absolute inset-0 z-0 opacity-40">
                <FloatingElement initialX={60} initialY={120} duration={8}>
                    {'</>'}
                </FloatingElement>
                <FloatingElement initialX={500} initialY={60} duration={10} delay={2}>
                    {'{ }'}
                </FloatingElement>
                <FloatingElement initialX={20} initialY={300} duration={12} delay={1}>
                    {';'}
                </FloatingElement>
                <FloatingElement initialX={560} initialY={350} duration={9} delay={3}>
                    {'['}
                </FloatingElement>
                <FloatingElement initialX={250} initialY={40} duration={14} delay={5}>
                    {'def'}
                </FloatingElement>
            </div>

            <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:gap-12 lg:grid-cols-2 lg:gap-16">
                {/* Left Column: Content */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.12, delayChildren: 0.2 },
                        },
                    }}
                    className="relative z-10 space-y-8 text-center lg:text-left"
                >
                    {/* Headline */}
                    <div className="overflow-visible pb-4">
                        <h1 className="text-text-primary pt-4 pb-2 font-sans text-6xl leading-[1.1] font-extrabold tracking-[-0.04em] sm:text-7xl lg:text-8xl">
                            <motion.span
                                variants={{
                                    hidden: { y: 60, opacity: 0 },
                                    visible: {
                                        y: 0,
                                        opacity: 1,
                                        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                                    },
                                }}
                                className="mr-[0.2em] inline-block"
                            >
                                Master
                            </motion.span>
                            <br className="lg:hidden" />
                            <motion.span
                                variants={{
                                    hidden: { y: 60, opacity: 0 },
                                    visible: {
                                        y: 0,
                                        opacity: 1,
                                        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                                    },
                                }}
                                className="text-accent inline-block font-serif italic drop-shadow-[0_0_15px_rgba(0,200,83,0.3)]"
                            >
                                Algorithms.
                            </motion.span>
                        </h1>
                    </div>

                    {/* Subheadline */}
                    <motion.p
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: {
                                opacity: 1,
                                y: 0,
                                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                            },
                        }}
                        className="text-text-secondary mx-auto max-w-xl text-lg leading-relaxed md:text-xl lg:mx-0"
                    >
                        The premier competitive programming platform. Elevate your coding skills,
                        prepare for top-tier tech interviews, and compete in live global contests.
                        Your technical legacy starts here.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: {
                                opacity: 1,
                                y: 0,
                                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                            },
                        }}
                        className="flex flex-col justify-center gap-4 pt-2 sm:flex-row lg:justify-start"
                    >
                        <Link href="/problems" className="w-full sm:w-auto">
                            <Button
                                variant="default"
                                size="lg"
                                className="bg-accent shadow-accent-glow hover:bg-accent-hover h-12 w-full px-8 text-base transition-all hover:scale-105 active:scale-95"
                            >
                                Start Solving
                                <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </Link>
                        <Link href="/contests" className="w-full sm:w-auto">
                            <Button
                                variant="secondary"
                                size="lg"
                                className="bg-bg-page hover:bg-bg-subtle border-border hover:border-accent/40 h-12 w-full border px-8 text-base transition-all"
                            >
                                View Contests
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Right Column: Visual */}
                <motion.div
                    initial={{ opacity: 0, x: 50, rotate: 2 }}
                    animate={{ opacity: 1, x: 0, rotate: 0 }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    className="relative z-10"
                >
                    <CodeEditorPreview className="mx-auto lg:mx-0" />
                </motion.div>
            </div>
        </section>
    )
}
