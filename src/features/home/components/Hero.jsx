'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Code2, Trophy, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ArrowButton } from '@/components/ui/ArrowButton'
import { PatternButton } from '@/components/ui/PatternButton'
import { ScrollRevealCard } from '@/components/ui/ScrollRevealCard'
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion'
import dynamic from 'next/dynamic'

const Tiles = dynamic(
    () => import('@/components/ui/tiles').then((mod) => ({ default: mod.Tiles })),
    {
        ssr: false,
        loading: () => <div className="bg-bg-page absolute inset-0" />,
    }
)

// Import CodeEditorPreview statically for instant rendering (it's a lightweight visual component)
import CodeEditorPreview from './CodeEditorPreview'

import { SiPython, SiCplusplus, SiJavascript, SiRust, SiGo } from 'react-icons/si'
import { FaJava } from 'react-icons/fa'
import { useAuth } from '@/context/AuthContext'

const Streak = React.memo(({ config }) => {
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
})

const FallingLight = React.memo(({ count = 8 }) => {
    const [streaks, setStreaks] = useState([])

    useEffect(() => {
        setStreaks(
            Array.from({ length: count }, () => ({
                left: `${Math.random() * 100}%`,
                duration: 4 + Math.random() * 4,
                delay: Math.random() * 6,
                opacity: 0.08 + Math.random() * 0.12,
                height: 120 + Math.random() * 160,
            }))
        )
    }, [count])

    return (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            {streaks.map((config, i) => (
                <Streak key={i} config={config} />
            ))}
        </div>
    )
})

export default React.memo(function Hero() {
    const shouldReduceMotion = useSafeReducedMotion()
    const decorativeStreakCount = shouldReduceMotion ? 0 : 8
    const { isAuthenticated, isLoading } = useAuth()

    return (
        <section className="hero-gradient relative overflow-hidden pt-18 pb-0 transition-[transform,opacity] duration-700">
            {/* Interactive Tiles Background */}
            <div className="absolute inset-0 z-0">
                <Tiles
                    className="opacity-[0.18] lg:opacity-[0.25]"
                    rows={40}
                    cols={28}
                    tileSize="md"
                    tileClassName="border-neutral-300 dark:border-neutral-800/30"
                />

                {/* Overlay gradients for depth */}
                <div className="from-bg-page to-bg-page absolute inset-0 bg-gradient-to-b via-transparent opacity-100" />
                <div className="from-bg-page to-bg-page absolute inset-0 bg-gradient-to-r via-transparent opacity-60" />

                <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(58,154,255,0.12),_transparent_68%)] opacity-50 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(2,186,76,0.12),_transparent_68%)] opacity-50 blur-3xl" />
            </div>

            {/* Falling Light Data Animation */}
            {decorativeStreakCount > 0 && <FallingLight count={decorativeStreakCount} />}

            <div className="relative z-10 mx-auto -mt-20 flex max-w-7xl flex-col items-center px-4 lg:-mt-24">
                {/* Top Section: Content — loads first */}
                <motion.div
                    initial={shouldReduceMotion ? 'visible' : 'hidden'}
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: shouldReduceMotion ? 0 : 0.1,
                                delayChildren: shouldReduceMotion ? 0 : 0.15,
                            },
                        },
                    }}
                    className="mb-2 text-center"
                >
                    {/* Headline */}
                    <div className="mt-17 mb-1 overflow-visible">
                        <h1 className="text-text-primary font-display pt-6 pb-2 text-6xl leading-[1.05] font-black tracking-[-0.04em] [text-wrap:balance] sm:text-7xl lg:text-[7.5rem]">
                            <motion.span
                                variants={{
                                    hidden: { y: 60, opacity: 0 },
                                    visible: {
                                        y: 0,
                                        opacity: 1,
                                        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
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
                                        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                                    },
                                }}
                                className="text-accent inline-block font-serif italic drop-shadow-[0_0_15px_rgba(0,200,83,0.3)]"
                            >
                                Algorithms.
                            </motion.span>
                        </h1>
                    </div>

                    {/* Subheadline */}
                    <div className="mx-auto mb-1 max-w-3xl text-center">
                        <motion.p
                            variants={{
                                hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    filter: 'blur(0px)',
                                    transition: {
                                        duration: 0.7,
                                        ease: [0.16, 1, 0.3, 1],
                                    },
                                },
                            }}
                            className="text-text-secondary font-display text-lg leading-relaxed font-medium [text-wrap:balance] md:text-2xl"
                        >
                            Where developers stop learning and start{' '}
                            <span className="text-gradient">competing.</span>
                            <br className="hidden md:block" />
                            Solve what matters. Prove it in real time.
                        </motion.p>
                    </div>

                    {/* CTA Section */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: {
                                opacity: 1,
                                y: 0,
                                transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                            },
                        }}
                        className="flex flex-col items-center justify-center gap-8 pt-6"
                    >
                        {/* Action Buttons */}
                        <div className="flex w-full flex-col items-center justify-center gap-6 sm:w-auto sm:flex-row sm:gap-4 md:mt-4">
                            <Link
                                href={isAuthenticated ? '/feed' : '/problems'}
                                className="w-full sm:w-auto"
                            >
                                <PatternButton className="h-10 w-full px-4 py-2 text-sm sm:h-12 sm:w-auto sm:px-12 sm:py-4 sm:text-base">
                                    {isLoading
                                        ? 'Go to Feed'
                                        : isAuthenticated
                                          ? 'Go to Feed'
                                          : 'Start Solving'}
                                </PatternButton>
                            </Link>
                        </div>
                        {/* Status Tags */}
                        <motion.div
                            variants={{
                                hidden: { opacity: 0, y: 10 },
                                visible: {
                                    opacity: 0.9,
                                    y: 0,
                                    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                                },
                            }}
                            className="text-text-muted flex flex-wrap items-center justify-center gap-3 text-[10px] font-medium tracking-[0.18em] uppercase sm:text-xs"
                        >
                            <Link href="/problems">
                                <span className="bg-bg-subtle border-border/40 hover:bg-accent/10 hover:text-accent cursor-pointer rounded-full border px-4 py-1.5 backdrop-blur-sm transition-all hover:scale-105 active:scale-95">
                                    2,500+ Problems
                                </span>
                            </Link>
                            <Link href="/contests">
                                <span className="bg-bg-subtle border-border/40 hover:bg-accent/10 hover:text-accent cursor-pointer rounded-full border px-4 py-1.5 backdrop-blur-sm transition-all hover:scale-105 active:scale-95">
                                    Live Contests
                                </span>
                            </Link>
                            <Link href="/interview/new">
                                <span className="bg-bg-subtle border-border/40 hover:bg-accent/10 hover:text-accent cursor-pointer rounded-full border px-4 py-1.5 backdrop-blur-sm transition-all hover:scale-105 active:scale-95">
                                    AI Interviewer
                                </span>
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Language Support Showcase */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                            },
                        }}
                        className="text-text-muted pointer-events-auto mt-4 mb-8 flex flex-col items-center gap-4 transition-all duration-300 sm:mb-[5px]"
                    >
                        <p className="text-xs font-bold tracking-widest [text-wrap:balance] uppercase opacity-70">
                            Supported Execution Environments
                        </p>
                        <div className="flex flex-wrap justify-center gap-6 text-2xl opacity-60 grayscale transition-[opacity,filter] duration-500 hover:opacity-100 hover:grayscale-0 sm:gap-8 lg:text-3xl">
                            <SiPython
                                className="cursor-pointer transition-colors hover:text-[#3776AB]"
                                title="Python 3"
                                aria-hidden="true"
                            />
                            <SiCplusplus
                                className="cursor-pointer transition-colors hover:text-[#00599C]"
                                title="C++"
                                aria-hidden="true"
                            />
                            <FaJava
                                className="cursor-pointer transition-colors hover:text-[#5382a1]"
                                title="Java"
                                aria-hidden="true"
                            />
                            <SiJavascript
                                className="cursor-pointer transition-colors hover:text-[#F7DF1E]"
                                title="JavaScript"
                                aria-hidden="true"
                            />
                            <SiRust
                                className="cursor-pointer transition-colors hover:text-[#000000] dark:hover:text-[#FFFFFF]"
                                title="Rust"
                                aria-hidden="true"
                            />
                            <SiGo
                                className="cursor-pointer transition-colors hover:text-[#00ADD8]"
                                title="Go"
                                aria-hidden="true"
                            />
                        </div>
                    </motion.div>
                </motion.div>

                {/* Code Editor Preview — loads after text components */}
                <motion.div
                    initial={
                        shouldReduceMotion
                            ? { opacity: 1, y: 0, scale: 1 }
                            : { opacity: 0, y: 40, scale: 0.95 }
                    }
                    animate={shouldReduceMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
                    transition={{
                        duration: 0.9,
                        ease: [0.16, 1, 0.3, 1],
                        delay: shouldReduceMotion ? 0 : 0.6,
                    }}
                    className="w-full"
                >
                    <ScrollRevealCard className="w-full">
                        <CodeEditorPreview className="h-full w-full" />
                    </ScrollRevealCard>
                </motion.div>
            </div>
        </section>
    )
})
