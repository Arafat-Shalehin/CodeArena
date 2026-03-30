'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion'

// Shared Components
import { Button } from '@/components/ui/button'
import PropTypes from 'prop-types'
import { useRecentProblems } from '@/hooks/useRecentProblems'

// Feature Components
import ProblemCard from '@/shared/components/ProblemCard'

// Data
import { normalizeDifficulty } from '@/features/problems/data/problems.data'
import { formatAcceptanceRate } from '@/lib/utils'

/**
 * @component RecentProblemsSection
 * @description Displays a grid of curated coding problems with entrance animations.
 */
export default function RecentProblemsSection() {
    const shouldReduceMotion = useSafeReducedMotion()
    const { problems, isLoading, error } = useRecentProblems(3)

    if (error) {
        return (
            <div className="text-error py-12 text-center">
                Failed to load recent problems. Please try again later.
            </div>
        )
    }

    return (
        <section className="mx-auto max-w-7xl px-4 py-12">
            {/* Section Header */}
            <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
                className="mb-16 pb-12 text-center"
            >
                <div className="mx-auto max-w-2xl">
                    <h2 className="font-display text-text-primary mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                        Guided <span className="text-accent italic">Study Plans.</span>
                    </h2>
                    <p className="text-text-muted text-lg leading-relaxed">
                        Targeted learning paths curated for technical interviews. Ace the coding
                        rounds at top tech companies with structured practice.
                    </p>
                </div>
            </motion.div>

            {/* Problems Grid */}
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-bg-subtle h-[320px] w-full animate-pulse rounded-2xl border-none"
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
                        variant="ghost"
                        size="lg"
                        className="btn-ghost text-accent group h-14 min-w-[200px] rounded-2xl transition-all duration-300"
                    >
                        Explore Study Plans
                        <ArrowUpRight className="ml-2 h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Button>
                </Link>
            </motion.div>
        </section>
    )
}
