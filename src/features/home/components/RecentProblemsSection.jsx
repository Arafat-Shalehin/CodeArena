'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

// Shared Components
import { Button } from '@/components/ui/button'

// Feature Components
import ProblemCard from '@/features/problems/components/ProblemCard'

// Data
import { normalizeDifficulty } from '@/features/problems/data/problems.data'

/**
 * @component RecentProblemsSection
 * @description Displays a grid of curated coding problems with entrance animations.
 */
export default function RecentProblemsSection() {
    const [problems, setProblems] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchRecentProblems() {
            try {
                const response = await fetch('/api/problems?limit=3')
                const json = await response.json()
                if (json.success) {
                    setProblems(json.data)
                }
            } catch (error) {
                console.error('Failed to fetch recent problems:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchRecentProblems()
    }, [])

    return (
        <section className="mx-auto max-w-7xl px-4 py-32">
            {/* Section Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="border-border mb-16 flex flex-col justify-between border-b pb-12 sm:flex-row sm:items-end"
            >
                <div className="max-w-xl">
                    <h2 className="font-display text-text-primary mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                        Curated <span className="text-accent italic">challenges.</span>
                    </h2>
                    <p className="text-text-muted text-lg leading-relaxed">
                        A hand-picked selection of problems designed to sharpen your algorithmic
                        intuition. No fluff, just pure logic.
                    </p>
                </div>
            </motion.div>

            {/* Problems Grid */}
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-bg-subtle border-border h-[320px] w-full animate-pulse rounded-3xl border"
                        />
                    ))
                ) : problems.length > 0 ? (
                    problems.map((problem, idx) => (
                        <motion.div
                            key={problem._id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <ProblemCard
                                title={problem.title}
                                difficulty={normalizeDifficulty(problem.difficulty)}
                                solvedCount={problem.acceptedSubmissions || 0}
                                tags={problem.tags || []}
                                successRate={`${problem.acceptanceRate || 0}%`}
                            />
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-zinc-400">
                        No problems found.
                    </div>
                )}
            </div>

            {/* View All Problems Button */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mt-20 text-center"
            >
                <Link href="/problems">
                    <Button
                        variant="outline"
                        size="lg"
                        className="bg-bg-page text-text-secondary hover:text-accent hover:border-accent/20 group h-14 min-w-[200px] rounded-full border-zinc-200 transition-all duration-300 hover:bg-emerald-50"
                    >
                        Explore All Problems
                        <ArrowUpRight className="ml-2 h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Button>
                </Link>
            </motion.div>
        </section>
    )
}
