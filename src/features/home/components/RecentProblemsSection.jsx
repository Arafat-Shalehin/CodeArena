"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Loader2 } from 'lucide-react'

// Shared Components
import { Button } from '@/components/ui/button'

// Feature Components
import ProblemCard from '@/features/problems/components/ProblemCard'

// Data
import { normalizeDifficulty } from '@/features/problems/data/problems.data'

/**
 * @component RecentProblemsSection
 * @description Displays a grid of curated coding problems to spark interest.
 * Fetches data from the shared `problemsData` source.
 *
 * @returns {JSX.Element} The rendered Recent Problems section.
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
        <section className="mx-auto max-w-7xl px-4 py-24">
            {/* Section Header */}
            <div className="border-border mb-12 flex flex-col justify-between border-b pb-8 sm:flex-row sm:items-end">
                <div className="max-w-xl">
                    <h2 className="font-display text-text-primary mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                        Curated <span className="text-accent italic">challenges.</span>
                    </h2>
                    <p className="text-text-muted text-sm leading-relaxed">
                        A hand-picked selection of problems designed to sharpen your algorithmic
                        intuition. No fluff, just pure logic.
                    </p>
                </div>
            </div>

            {/* Problems Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    // Loading Skeletons
                    Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-bg-subtle h-[280px] w-full animate-pulse rounded-2xl border border-zinc-100"
                        />
                    ))
                ) : problems.length > 0 ? (
                    problems.map((problem) => (
                        <ProblemCard
                            key={problem._id}
                            title={problem.title}
                            difficulty={normalizeDifficulty(problem.difficulty)}
                            solvedCount={problem.acceptedSubmissions || 0}
                            tags={problem.tags || []}
                            successRate={`${problem.acceptanceRate || 0}%`}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-zinc-400">
                        No problems found.
                    </div>
                )}
            </div>

            {/* View All Problems Button (Moved below grid) */}
            <div className="mt-12 text-center">
                <Link href="/problems">
                    <Button
                        variant="outline"
                        size="lg"
                        className="bg-bg-page hover:bg-bg-subtle border-border text-text-secondary hover:text-accent hover:border-accent/20 group w-full transition-all duration-300 sm:w-auto"
                    >
                        All problems
                        <ArrowUpRight className="ml-2 h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Button>
                </Link>
            </div>
        </section>
    )
}
