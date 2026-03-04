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
        return (
            <div className="bg-bg-subtle border-border rounded-lg border p-6 shadow-sm">
                <p className="text-error text-sm">{error}</p>
            </div>
        )
    }

    const hasRecommendations = recommendations && recommendations.length > 0
    const hasDiscovery = discoveryProblems && discoveryProblems.length > 0

    if (!hasRecommendations && !hasDiscovery) {
        return null
    }

    return (
        <div className="space-y-6">
            {/* Weakness-Based Recommendations */}
            {hasRecommendations && (
                <div className="bg-bg-subtle border-border rounded-lg border p-6 shadow-sm">
                    <h3 className="text-text-primary mb-1 text-xl font-semibold">Focus Areas</h3>
                    {weakTags.length > 0 ? (
                        <p className="text-text-secondary mb-6 text-sm">
                            We noticed you've been struggling with{' '}
                            <span className="text-accent-text font-semibold">
                                {weakTags.join(', ')}
                            </span>
                            . Try these to improve your skills.
                        </p>
                    ) : (
                        <p className="text-text-secondary mb-6 text-sm">
                            Here are some problems curated to help you practice and improve your
                            skills.
                        </p>
                    )}

                    <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
                        {recommendations.map((problem) => (
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
                <div className="bg-bg-subtle border-border rounded-lg border border-dashed p-6 shadow-sm">
                    <div className="mb-1 flex items-center gap-2">
                        <Compass size={20} className="text-accent" />
                        <h3 className="text-text-primary text-xl font-semibold">
                            Explore New Topics
                        </h3>
                    </div>
                    <p className="text-text-secondary mb-6 text-sm">
                        Broaden your skills — try something new:{' '}
                        <span className="text-accent-text font-semibold">
                            {discoveryTags.join(', ')}
                        </span>
                    </p>

                    <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
                        {discoveryProblems.map((problem) => (
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
