'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Zap, BarChart3, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArenaButton } from '@/components/ui/ArenaButton'
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion'
import { useEffect, useState } from 'react'

export default function SkillShiftSection() {
    const shouldReduceMotion = useSafeReducedMotion()

    return (
        <section className="bg-bg-page text-text-primary relative overflow-hidden px-4 py-24 sm:py-32">
            {/* Background elements */}
            <div className="bg-dot-matrix pointer-events-none absolute inset-0 z-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] opacity-[0.4]" />
            <div className="bg-accent/5 pointer-events-none absolute top-1/2 left-1/2 z-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />

            <div className="relative z-10 mx-auto max-w-5xl text-center">
                <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    {/* HEADLINE */}
                    <h2 className="font-display text-text-primary mb-12 text-4xl leading-[1.05] font-bold tracking-tight [text-wrap:balance] sm:text-6xl md:text-7xl">
                        You're writing code.
                        <br />
                        <span className="text-text-muted mt-2 block font-medium sm:mt-0 sm:inline">
                            But are you writing{' '}
                            <span className="relative inline-block px-1">
                                <span className="text-accent relative z-10">fast</span>
                                <motion.span
                                    className="bg-accent/30 absolute bottom-1.5 left-0 z-0 h-[35%] w-full"
                                    initial={{ scaleX: 0 }}
                                    whileInView={{ scaleX: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: 0.5, ease: 'circOut' }}
                                    style={{ originX: 0 }}
                                />
                                <motion.span
                                    className="bg-accent absolute bottom-1.5 left-0 z-0 h-[2px] w-full blur-[2px]"
                                    initial={{ opacity: 0, x: '-100%' }}
                                    whileInView={{ opacity: 1, x: '100%' }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: 1.2,
                                        delay: 0.7,
                                        repeat: Infinity,
                                        repeatDelay: 3,
                                    }}
                                />
                            </span>{' '}
                            code?
                        </span>
                    </h2>

                    {/* STATS */}
                    <div className="mx-auto mb-16 grid max-w-4xl grid-cols-3 gap-4">
                        <StatCard
                            value={2500}
                            suffix="+"
                            label="Curated Problems"
                            icon={<Zap className="size-5" />}
                        />
                        <StatCard
                            value={50}
                            suffix="x"
                            label="Faster Prep"
                            icon={<BarChart3 className="size-5" />}
                        />
                        <StatCard
                            value={1000000}
                            suffix="+"
                            label="Global Users"
                            icon={<Users className="size-5" />}
                        />
                    </div>

                    {/* CTA */}
                    <Link href="/signup">
                        <Button
                            variant="outline"
                            className="bg-bg-page text-text-secondary hover:text-accent hover:border-accent/20 group border-border hover:bg-accent-light h-16 w-full max-w-[280px] rounded-full transition-all duration-300"
                        >
                            Enter CodeArena
                            <ArrowUpRight className="ml-2 h-5 w-5 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

/* ----------------- STAT CARD ----------------- */

function StatCard({ value, suffix, label, icon }) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        let start = 0
        const duration = 1500
        const increment = value / (duration / 16)

        const timer = setInterval(() => {
            start += increment
            if (start >= value) {
                setCount(value)
                clearInterval(timer)
            } else {
                setCount(Math.floor(start))
            }
        }, 16)

        return () => clearInterval(timer)
    }, [value])

    return (
        <motion.div
            whileHover={{ y: -4, borderColor: 'var(--color-accent)' }}
            className="bg-bg-subtle border-border relative flex flex-col items-center justify-center rounded-xl border p-4 transition-[border-color,transform,shadow] duration-300 sm:p-8"
        >
            <div
                className="text-accent bg-accent/10 mb-3 flex size-8 items-center justify-center rounded-lg sm:mb-5 sm:size-12"
                aria-hidden="true"
            >
                {icon}
            </div>

            <span className="text-text-primary mb-1 font-mono text-2xl font-bold tabular-nums sm:text-4xl sm:text-5xl">
                {formatNumber(count)}
                {suffix}
            </span>

            <span className="text-text-muted text-[10px] font-medium tracking-widest uppercase sm:text-xs">
                {label}
            </span>

            {/* Subtle corner accent */}
            <div className="bg-accent pointer-events-none absolute top-3 right-3 size-1.5 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </motion.div>
    )
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num
}
