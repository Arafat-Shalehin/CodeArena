'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion'

// Shared Components
import { Button } from '@/components/ui/button'
import { useRecentProblems } from '@/hooks/useRecentProblems'

// Feature Components
import ProblemCard from '@/shared/components/ProblemCard'

// Data
import { normalizeDifficulty } from '@/features/problems/data/problems.data'

/**
 * @component RecentProblemsSection
 * @description Displays a grid of curated coding problems with entrance animations.
 */
export default function RecentProblemsSection() {
    const shouldReduceMotion = useSafeReducedMotion()
    const sectionRef = useRef(null)
    const isNearViewport = useInView(sectionRef, { once: true, margin: '300px' })
    const { problems, isLoading, error } = useRecentProblems(6, 'curated', isNearViewport)

    if (error) {
        return <div className="text-text-muted py-12 text-center">Problems loading...</div>
    }

    return (
        <section ref={sectionRef} className="mx-auto max-w-7xl px-4 py-12">
            {/* Section Header */}
            <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="mb-20 pb-4 text-center"
            >
                <div className="mx-auto max-w-3xl">
                    <h2 className="font-display text-text-primary mb-6 text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl">
                        Curated <span className="text-accent font-serif italic">challenges.</span>
                    </h2>
                    <p className="text-text-muted mx-auto max-w-2xl text-base leading-relaxed font-medium text-balance md:text-lg">
                        Targeted learning paths curated for technical interviews. Ace the coding
                        rounds at top tech companies with structured practice.
                    </p>
                </div>
            </motion.div>

            {/* Problems Grid */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {!isNearViewport || isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-bg-subtle border-border h-80 w-full animate-pulse rounded-3xl border"
                        />
                    ))
                ) : problems.length > 0 ? (
                    problems.map((problem, idx) => (
                        <motion.div
                            key={problem._id}
                            initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: shouldReduceMotion ? 0 : idx * 0.1 }}
                        >
                            <ProblemCard
                                problem={{
                                    ...problem,
                                    difficulty: normalizeDifficulty(problem.difficulty),
                                }}
                                variant="detailed"
                            />
                        </motion.div>
                    ))
                ) : (
                    <div className="text-text-muted col-span-full py-12 text-center">
                        No problems found.
                    </div>
                )}
            </div>

            {/* View All Problems Button */}
            <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: shouldReduceMotion ? 0 : 0.4 }}
                className="mt-20 text-center"
            >
                <Link href="/problems">
                    <Button
                        variant="outline"
                        size="lg"
                        className="bg-bg-page text-text-secondary hover:text-accent hover:border-accent/20 group border-border hover:bg-accent-light h-14 min-w-50 rounded-full transition-all duration-300"
                    >
                        Explore Study Plans
                        <ArrowUpRight className="ml-2 h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Button>
                </Link>
            </motion.div>
        </section>
    )
}
