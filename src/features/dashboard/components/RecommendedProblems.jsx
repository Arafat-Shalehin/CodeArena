'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

export default function RecommendedProblems() {
    const [recommendations, setRecommendations] = useState([])
    const [weakTags, setWeakTags] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await fetch('/api/user/recommendations')
                const data = await response.json()

                if (data.success) {
                    setRecommendations(data.data.recommendations)
                    setWeakTags(data.data.weakTags || [])
                } else {
                    setError('Failed to fetch recommendations')
                }
            } catch (err) {
                console.error('Error fetching recommendations:', err)
                setError('An error occurred while fetching your personalized recommendations.')
            } finally {
                setLoading(false)
            }
        }

        fetchRecommendations()
    }, [])

    if (loading) {
        return (
            <div className="bg-bg-subtle border-border animate-pulse rounded-lg border p-6 shadow-sm">
                <div className="bg-bg-muted mb-6 h-6 w-1/3 rounded"></div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-bg-muted h-32 rounded-lg"></div>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-bg-subtle border-border rounded-lg border p-6 shadow-sm">
                <p className="text-error text-sm">{error}</p>
            </div>
        )
    }

    if (!recommendations || recommendations.length === 0) {
        return null
    }

    return (
        <div className="bg-bg-subtle border-border rounded-lg border p-6 shadow-sm">
            <h3 className="text-text-primary mb-1 text-xl font-semibold">Focus Areas</h3>
            {weakTags.length > 0 ? (
                <p className="text-text-secondary mb-6 text-sm">
                    We noticed you've been struggling with{' '}
                    <span className="text-accent-text font-semibold">{weakTags.join(', ')}</span>.
                    Try these to improve your skills.
                </p>
            ) : (
                <p className="text-text-secondary mb-6 text-sm">
                    Here are some problems curated to help you practice and improve your skills.
                </p>
            )}

            <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((problem) => (
                    <Link
                        key={problem._id}
                        href={`/problems/${problem._id}`}
                        className="bg-bg-page border-border duration-normal flex flex-col justify-between rounded-lg border p-4 shadow-sm transition-shadow hover:shadow"
                    >
                        <div>
                            <div className="mb-2 flex items-start justify-between">
                                <h4 className="text-text-primary line-clamp-1 text-sm font-semibold">
                                    {problem.title}
                                </h4>
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        problem.difficulty === 'easy'
                                            ? 'bg-success-light text-success'
                                            : problem.difficulty === 'medium'
                                              ? 'bg-warning-light text-warning'
                                              : 'bg-error-light text-error'
                                    }`}
                                >
                                    {problem.difficulty}
                                </span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                                {problem.tags &&
                                    problem.tags.slice(0, 3).map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className={
                                                weakTags.includes(tag)
                                                    ? 'bg-accent-light text-accent-text inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium'
                                                    : 'bg-bg-muted text-text-secondary inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium'
                                            }
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                {problem.tags?.length > 3 && (
                                    <span className="bg-bg-muted text-text-secondary inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium">
                                        +{problem.tags.length - 3}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="text-text-muted mt-4 flex items-center justify-between text-xs">
                            <span>{problem.acceptanceRate || 0}% Acceptance</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
