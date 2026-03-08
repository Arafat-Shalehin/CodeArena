'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, BrainCircuit } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RecommendedProblems() {
    const [recommendations, setRecommendations] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const res = await fetch('/api/recommendations')
                const json = await res.json()
                if (json.success) {
                    setRecommendations(json.data)
                }
            } catch (error) {
                console.error('Failed to fetch recommendations:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchRecommendations()
    }, [])

    const getDifficultyClass = (diff) => {
        const d = diff?.toLowerCase()
        if (d === 'easy') return 'bg-success-light text-success'
        if (d === 'medium') return 'bg-warning-light text-warning'
        return 'bg-error-light text-error'
    }

    if (loading) {
        return (
            <div className="bg-bg-subtle border-border mb-6 animate-pulse rounded-lg border p-6 shadow-sm">
                <div className="bg-bg-muted mb-4 h-6 w-48 rounded"></div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-bg-muted h-24 rounded-md"></div>
                    ))}
                </div>
            </div>
        )
    }

    if (!recommendations || recommendations.recommendedProblems?.length === 0) {
        return null
    }

    return (
        <div className="bg-bg-subtle border-border relative mb-6 overflow-hidden rounded-lg border p-6 shadow-sm">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 opacity-10">
                <BrainCircuit size={120} className="text-accent" />
            </div>

            <div className="relative z-10 mb-5 flex items-center justify-between">
                <div>
                    <h3 className="text-text-primary flex items-center gap-2 text-lg font-bold">
                        <Sparkles className="text-warning h-5 w-5" />
                        Recommended For You
                    </h3>
                    {recommendations.weakTags?.length > 0 && (
                        <p className="text-text-muted mt-1 text-xs">
                            Focusing on: {recommendations.weakTags.slice(0, 3).join(', ')}
                        </p>
                    )}
                </div>
                <Link href="/problems">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-accent hover:text-accent-dark text-xs font-semibold"
                    >
                        View All <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                </Link>
            </div>

            <div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
                {recommendations.recommendedProblems.map((prob) => (
                    <Link
                        key={prob._id}
                        href={`/problems/${prob._id}`}
                        className="bg-bg-page border-border hover:border-accent group flex flex-col justify-between rounded-md border p-4 transition-all hover:shadow-md"
                    >
                        <div>
                            <div className="mb-2 flex items-start justify-between">
                                <h4 className="text-text-primary group-hover:text-accent line-clamp-1 text-sm font-bold transition-colors">
                                    {prob.title}
                                </h4>
                                <span
                                    className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${getDifficultyClass(prob.difficulty)}`}
                                >
                                    {prob.difficulty}
                                </span>
                            </div>
                            <div className="mb-3 flex flex-wrap gap-1.5">
                                {prob.tags?.slice(0, 2).map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-text-muted bg-bg-muted rounded px-1.5 py-0.5 text-[10px]"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {prob.tags?.length > 2 && (
                                    <span
                                        key="more-tags"
                                        className="text-text-muted self-center text-[10px]"
                                    >
                                        +{prob.tags.length - 2}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="border-border/50 mt-auto flex items-center justify-between border-t pt-2">
                            <span className="text-text-secondary text-[10px]">
                                {prob.acceptedSubmissions} Solved
                            </span>
                            <span className="text-accent text-[11px] font-bold group-hover:underline">
                                Solve Now
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
