'use client'

import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import ProblemCard from '@/shared/components/ProblemCard'
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ITEMS_PER_PAGE = 20
const DIFFICULTIES = ['easy', 'medium', 'hard']

const DIFFICULTY_STYLES = {
    easy: {
        active: 'bg-success text-white',
        inactive: 'bg-bg-muted text-success hover:bg-success/10',
    },
    medium: {
        active: 'bg-warning text-white',
        inactive: 'bg-bg-muted text-warning hover:bg-warning/10',
    },
    hard: { active: 'bg-error text-white', inactive: 'bg-bg-muted text-error hover:bg-error/10' },
}

export default function PracticeTagPage({ params }) {
    const resolvedParams = use(params)
    const tag = decodeURIComponent(resolvedParams.tag)

    const [problems, setProblems] = useState([])
    const [pagination, setPagination] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [difficultyFilter, setDifficultyFilter] = useState(null)

    const fetchProblems = useCallback(
        async (page = 1) => {
            setLoading(true)
            setError(null)

            try {
                const params = new URLSearchParams()
                params.set('page', page)
                params.set('limit', ITEMS_PER_PAGE)
                params.set('tag', tag)
                if (difficultyFilter) {
                    params.set('difficulty', difficultyFilter)
                }

                const res = await fetch(`/api/problems?${params.toString()}`)
                const json = await res.json()

                if (json.success !== false) {
                    setProblems(json.data || [])
                    setPagination(json.pagination || null)
                } else {
                    setError(json.message || 'Failed to load problems')
                }
            } catch (err) {
                console.error('Failed to fetch problems:', err)
                setError('Failed to load problems')
            } finally {
                setLoading(false)
            }
        },
        [tag, difficultyFilter]
    )

    useEffect(() => {
        setCurrentPage(1)
        fetchProblems(1)
    }, [fetchProblems])

    const handlePageChange = (page) => {
        setCurrentPage(page)
        fetchProblems(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const toggleDifficulty = (diff) => {
        setDifficultyFilter((prev) => (prev === diff ? null : diff))
    }

    return (
        <div className="bg-bg-page site-gradient text-text-primary flex min-h-screen flex-col font-sans">
            <Navbar />

            <main className="max-w-container mx-auto w-full flex-grow px-4 py-8 md:px-6">
                {/* Breadcrumb */}
                <nav className="text-text-muted mb-6 flex items-center gap-1.5 text-sm">
                    <a href="/" className="hover:text-accent duration-normal transition-colors">
                        Home
                    </a>
                    <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                    <Link
                        href="/practice"
                        className="hover:text-accent duration-normal transition-colors"
                    >
                        Practice
                    </Link>
                    <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                    <span className="text-text-primary font-medium">{tag}</span>
                </nav>

                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href="/practice"
                            className="text-text-muted hover:text-accent mb-2 inline-flex items-center gap-1 text-xs font-semibold transition-colors"
                        >
                            <ArrowLeft className="h-3 w-3" /> All Topics
                        </Link>
                        <h1 className="text-text-primary font-display text-2xl font-bold tracking-tight md:text-3xl">
                            {tag}
                        </h1>
                        {pagination && (
                            <p className="text-text-secondary mt-1 text-sm">
                                <span className="text-accent font-semibold">
                                    {pagination.total}
                                </span>{' '}
                                problems found
                            </p>
                        )}
                    </div>

                    {/* Difficulty Filter Chips */}
                    <div className="flex items-center gap-2">
                        {DIFFICULTIES.map((diff) => {
                            const isActive = difficultyFilter === diff
                            const styles = DIFFICULTY_STYLES[diff]
                            return (
                                <button
                                    key={diff}
                                    onClick={() => toggleDifficulty(diff)}
                                    className={cn(
                                        'rounded-full px-3 py-1.5 text-[11px] font-bold capitalize transition-all',
                                        isActive ? styles.active : styles.inactive
                                    )}
                                >
                                    {diff}
                                </button>
                            )
                        })}
                        {difficultyFilter && (
                            <button
                                onClick={() => setDifficultyFilter(null)}
                                className="text-text-muted hover:text-text-primary text-[11px] font-semibold transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Problem List */}
                {loading ? (
                    <div className="flex min-h-[40vh] items-center justify-center">
                        <Loader2 className="text-accent h-8 w-8 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="bg-bg-subtle border-border rounded-lg border p-12 text-center">
                        <h3 className="text-text-primary mb-2 text-lg font-semibold">{error}</h3>
                        <p className="text-text-secondary text-sm">Please try again later.</p>
                    </div>
                ) : problems.length === 0 ? (
                    <div className="bg-bg-subtle border-border rounded-lg border p-12 text-center">
                        <h3 className="text-text-primary mb-2 text-lg font-semibold">
                            No problems found
                        </h3>
                        <p className="text-text-secondary text-sm">
                            {difficultyFilter
                                ? `No ${difficultyFilter} problems exist for "${tag}". Try clearing the filter.`
                                : `No problems tagged with "${tag}" yet.`}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {problems.map((problem) => (
                                <ProblemCard
                                    key={problem._id}
                                    problem={problem}
                                    variant="detailed"
                                    highlightTags={[tag]}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage <= 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className="h-8 px-3"
                                >
                                    <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                                    Prev
                                </Button>

                                <div className="flex items-center gap-1">
                                    {Array.from(
                                        { length: Math.min(pagination.pages, 5) },
                                        (_, i) => {
                                            let page
                                            if (pagination.pages <= 5) {
                                                page = i + 1
                                            } else if (currentPage <= 3) {
                                                page = i + 1
                                            } else if (currentPage >= pagination.pages - 2) {
                                                page = pagination.pages - 4 + i
                                            } else {
                                                page = currentPage - 2 + i
                                            }
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={cn(
                                                        'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-colors',
                                                        page === currentPage
                                                            ? 'bg-accent text-white'
                                                            : 'text-text-muted hover:text-text-primary hover:bg-bg-subtle'
                                                    )}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        }
                                    )}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage >= pagination.pages}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className="h-8 px-3"
                                >
                                    Next
                                    <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
