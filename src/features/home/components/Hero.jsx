'use client'

import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CodeEditorPreview from './CodeEditorPreview'
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion'
import { Tiles } from '@/components/ui/tiles'

export default function Hero() {
    const shouldReduceMotion = useSafeReducedMotion()

    return (
        <section className="hero-gradient relative overflow-hidden py-4 md:py-12">
            {/* Background Animations: Interactive Tiles */}
            <div className="absolute inset-0 z-0 opacity-10">
                <Tiles rows={40} cols={20} tileSize="md" />
            </div>

            <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:gap-12 lg:grid-cols-2 lg:gap-16">
                {/* Left Column: Content */}
                <motion.div
                    initial={shouldReduceMotion ? 'visible' : 'hidden'}
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: shouldReduceMotion ? 0 : 0.12,
                                delayChildren: shouldReduceMotion ? 0 : 0.2,
                            },
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
                    initial={shouldReduceMotion ? false : { opacity: 0, x: 50, rotate: 2 }}
                    animate={{ opacity: 1, x: 0, rotate: 0 }}
                    transition={{
                        duration: shouldReduceMotion ? 0 : 1,
                        ease: 'easeOut',
                        delay: shouldReduceMotion ? 0 : 0.2,
                    }}
                    className="relative z-10"
                >
                    <CodeEditorPreview className="mx-auto lg:mx-0" />
                </motion.div>
            </div>
        </section>
    )
}
