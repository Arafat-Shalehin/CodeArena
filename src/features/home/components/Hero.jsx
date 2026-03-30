'use client'

import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CodeEditorPreview from './CodeEditorPreview'
import { ScrollRevealCard } from '@/components/ui/ScrollRevealCard'
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion'
import { Tiles } from '@/components/ui/tiles'
import { SiPython, SiCplusplus, SiJavascript, SiRust, SiGo } from 'react-icons/si'
import { FaJava } from 'react-icons/fa'

const Streak = () => {
    const [config, setConfig] = useState(null)

    useEffect(() => {
        setConfig({
            left: `${Math.random() * 100}%`,
            duration: 3 + Math.random() * 4,
            delay: Math.random() * 10,
            opacity: 0.1 + Math.random() * 0.3,
            height: 100 + Math.random() * 200,
        })
    }, [])

    if (!config) return null

    return (
        <motion.div
            initial={{ y: -config.height - 100, opacity: 0 }}
            animate={{
                y: '120vh',
                opacity: [0, config.opacity, config.opacity, 0],
            }}
            transition={{
                duration: config.duration,
                repeat: Infinity,
                delay: config.delay,
                ease: 'linear',
            }}
            style={{
                left: config.left,
                height: config.height,
            }}
            className="via-accent/50 absolute w-[1.5px] bg-gradient-to-b from-transparent to-transparent blur-[0.5px]"
        >
            {/* Glow Head */}
            <div className="bg-accent absolute bottom-0 left-1/2 size-1 -translate-x-1/2 rounded-full shadow-[0_0_10px_var(--ca-accent)]" />
        </motion.div>
    )
}

const FallingLight = () => {
    const streaks = Array.from({ length: 20 })
    return (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            {streaks.map((_, i) => (
                <Streak key={i} />
            ))}
        </div>
    )
}

export default function Hero() {
    const shouldReduceMotion = useSafeReducedMotion()

    return (
        <section className="hero-gradient relative overflow-hidden pt-12 pb-0 transition-all duration-700">
            {/* Background Animations: Interactive Tiles */}
            <div className="absolute inset-0 z-0 opacity-10">
                <Tiles rows={40} cols={20} tileSize="md" />
            </div>

            {/* Falling Light Data Animation */}
            <FallingLight />

            <div className="relative z-10 mx-auto -mt-20 flex max-w-7xl flex-col items-center px-4 lg:-mt-24">
                {/* Top Section: Content */}
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
                    className="mb-6 text-center"
                >
                    {/* Headline */}
                    <div className="mt-12 mb-2 overflow-visible">
                        <h1 className="text-text-primary pt-12 pb-2 font-sans text-6xl leading-[1.1] font-extrabold tracking-[-0.04em] sm:text-7xl lg:text-8xl">
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
                            <br className="sm:hidden" />
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
                        className="text-text-secondary mx-auto mb-8 max-w-2xl text-lg leading-relaxed md:text-xl"
                    >
                        Level up your coding skills and ace your next technical interview. Join the
                        world's fastest-growing competitive programming arena.
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
                        className="flex flex-col justify-center gap-4 pt-2 sm:flex-row"
                    >
                        <Link href="/problems" className="w-full sm:w-auto">
                            <Button
                                variant="default"
                                size="lg"
                                className="bg-accent hover:bg-accent-hover h-12 w-full px-8 text-base transition-all hover:scale-105 active:scale-95"
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

                    {/* Language Support Showcase */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { duration: 1, delay: 0.4 },
                            },
                        }}
                        className="text-text-muted pointer-events-auto mt-10 mb-2 flex flex-col items-center gap-4 transition-all duration-300"
                    >
                        <p className="text-xs font-bold tracking-widest uppercase opacity-70">
                            Supported Execution Environments
                        </p>
                        <div className="flex flex-wrap justify-center gap-6 text-2xl opacity-60 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0 sm:gap-8 lg:text-3xl">
                            <SiPython
                                className="cursor-pointer transition-colors hover:text-[#3776AB]"
                                title="Python 3"
                            />
                            <SiCplusplus
                                className="cursor-pointer transition-colors hover:text-[#00599C]"
                                title="C++"
                            />
                            <FaJava
                                className="cursor-pointer transition-colors hover:text-[#5382a1]"
                                title="Java"
                            />
                            <SiJavascript
                                className="cursor-pointer transition-colors hover:text-[#F7DF1E]"
                                title="JavaScript"
                            />
                            <SiRust
                                className="cursor-pointer transition-colors hover:text-[#000000] dark:hover:text-[#FFFFFF]"
                                title="Rust"
                            />
                            <SiGo
                                className="cursor-pointer transition-colors hover:text-[#00ADD8]"
                                title="Go"
                            />
                        </div>
                    </motion.div>
                </motion.div>

                <ScrollRevealCard className="w-full">
                    <CodeEditorPreview className="h-full w-full" />
                </ScrollRevealCard>
            </div>
        </section>
    )
}
