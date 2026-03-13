'use client'

import React, { useEffect, useState } from 'react'
import ProblemCard from '@/shared/components/ProblemCard'
import { Compass } from 'lucide-react'

export default function RecommendedProblems() {
    const [recommendations, setRecommendations] = useState([])
    const [discoveryProblems, setDiscoveryProblems] = useState([])
    const [discoveryTags, setDiscoveryTags] = useState([])
    const [weakTags, setWeakTags] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await fetch('/api/user/recommendations')
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`)
                }

                const data = await response.json()

                if (data.success) {
                    setRecommendations(data.data.recommendations)
                    setWeakTags(data.data.weakTags || [])
                    setDiscoveryProblems(data.data.discoveryProblems || [])
                    setDiscoveryTags(data.data.discoveryTags || [])
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
        // Fallback to the friendly empty state if the database or API errors out,
        // which often happens for brand new users or connection issues.
        return (
            <div className="bg-bg-subtle border-border flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center shadow-sm">
                <div className="bg-bg-muted/50 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <Compass className="text-text-muted h-8 w-8" />
                </div>
                <h3 className="text-text-primary mb-2 text-xl font-bold tracking-tight">
                    Recommendations Coming Soon
                </h3>
                <p className="text-text-secondary max-w-md text-sm">
                    Start solving coding challenges! Once you submit some solutions, our system will
                    analyze your performance and provide personalized recommendations here.
                </p>
            </div>
        )
    }

    const hasRecommendations = recommendations && recommendations.length > 0
    const hasDiscovery = discoveryProblems && discoveryProblems.length > 0

    if (!hasRecommendations && !hasDiscovery) {
        return (
            <div className="bg-bg-subtle border-border flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center shadow-sm">
                <div className="bg-bg-muted/50 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <Compass className="text-text-muted h-8 w-8" />
                </div>
                <h3 className="text-text-primary mb-2 text-xl font-bold tracking-tight">
                    Recommendations Coming Soon
                </h3>
                <p className="text-text-secondary max-w-md text-sm">
                    Start solving coding challenges! Once you submit some solutions, our system will
                    analyze your performance and provide personalized recommendations here.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Weakness-Based Recommendations (Focus Areas) */}
            {hasRecommendations && (
                <div className="bg-bg-subtle border-border rounded-2xl border p-6 shadow-sm">
                    <h3 className="text-text-primary mb-1 text-lg font-bold">Focus Areas</h3>
                    {weakTags.length > 0 ? (
                        <p className="text-text-secondary mb-6 text-sm">
                            We noticed you&apos;ve been struggling with{' '}
                            <span className="text-accent-text font-bold">
                                {weakTags.join(', ')}
                            </span>
                            . Try these to improve your skills.
                        </p>
                    ) : (
                        <p className="text-text-secondary mb-6 text-sm font-medium">
                            Tailored problems to help you sharpen your edge.
                        </p>
                    )}

                    <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
                        {recommendations.slice(0, 3).map((problem) => (
                            <ProblemCard
                                key={problem._id}
                                problem={problem}
                                highlightTags={weakTags}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Discovery Section */}
            {hasDiscovery && (
                <div className="bg-bg-subtle border-border rounded-2xl border border-dashed p-6 shadow-sm">
                    <div className="mb-1 flex items-center gap-2">
                        <Compass size={20} className="text-accent" />
                        <h3 className="text-text-primary text-lg font-bold">Explore New Topics</h3>
                    </div>
                    <p className="text-text-secondary mb-6 text-sm">
                        Broaden your skills — try something new:{' '}
                        <span className="text-accent-text font-bold">
                            {discoveryTags.join(', ')}
                        </span>
                    </p>

                    <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
                        {discoveryProblems.slice(0, 3).map((problem) => (
                            <ProblemCard
                                key={problem._id}
                                problem={problem}
                                highlightTags={discoveryTags}
                                badge="New!"
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
