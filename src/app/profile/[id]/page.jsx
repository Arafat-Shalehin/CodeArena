'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

// Shared Layout
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// Profile Components
import ProfileHero from '@/features/profile/components/ProfileHero'
import StatsGrid from '@/features/profile/components/StatsGrid'
import ProblemStats from '@/features/profile/components/ProblemStats'
import ContestPerformance from '@/features/profile/components/ContestPerformance'
import Achievements from '@/features/profile/components/Achievements'
import RecentSubmissions from '@/features/profile/components/RecentSubmissions'

export default function PublicProfilePage({ params }) {
    const { id } = use(params)
    const router = useRouter()
    const { user: currentUser, isLoading: authLoading } = useAuth()

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        // Redirect to personal profile if viewing own ID
        if (!authLoading && currentUser && currentUser._id === id) {
            router.replace('/profile')
            return
        }

        const fetchUser = async () => {
            try {
                const res = await fetch(`/api/users/${id}`)
                const data = await res.json()

                if (data.success && data.data) {
                    const dbUser = data.data
                    // Format user data for the existing components
                    setUser({
                        ...dbUser,
                        name: dbUser.name,
                        avatarSeed: dbUser.avatarSeed || dbUser.name,
                        stats: {
                            ...dbUser.stats,
                            globalRank: dbUser.stats?.globalRank || 'N/A',
                            // Fallback problem distribution if missing
                            problemsSolved: dbUser.stats?.problemsSolvedDistribution || {
                                easy: Math.floor((dbUser.stats?.totalSubmissions || 0) * 0.4),
                                medium: Math.floor((dbUser.stats?.totalSubmissions || 0) * 0.4),
                                hard: Math.floor((dbUser.stats?.totalSubmissions || 0) * 0.2),
                            },
                        },
                    })
                } else {
                    setError('User Not Found')
                }
            } catch (err) {
                console.error('Failed to fetch user:', err)
                setError('User Not Found')
            } finally {
                setLoading(false)
            }
        }

        if (!authLoading) {
            fetchUser()
        }
    }, [id, currentUser, authLoading, router])

    if (loading || authLoading) {
        return (
            <div className="bg-bg-page flex min-h-screen flex-col">
                <Navbar />
                <main className="flex flex-grow items-center justify-center">
                    <div className="border-accent h-8 w-8 animate-spin rounded-full border-t-2"></div>
                </main>
                <Footer />
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className="bg-bg-page flex min-h-screen flex-col">
                <Navbar />
                <main className="flex flex-grow flex-col items-center justify-center space-y-4">
                    <h1 className="text-text-primary text-3xl font-bold">User Not Found</h1>
                    <p className="text-text-secondary">
                        The user you are looking for does not exist.
                    </p>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="bg-bg-page site-gradient flex min-h-screen flex-col">
            <Navbar />

            <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-8 md:px-6">
                <ProfileHero user={user} />
                <StatsGrid user={user} />

                {/* 60/40 Grid Layout */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-10">
                    {/* Left Side (60%) */}
                    <div className="space-y-8 lg:col-span-6">
                        {/* Submission Activity */}
                        <section className="bg-bg-subtle border-border rounded-lg border p-6">
                            <h3 className="text-text-primary mb-6 text-xl font-semibold">
                                Submission Activity
                            </h3>
                            <div className="flex flex-wrap gap-1">
                                {[...Array(50)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-accent h-3 w-3 rounded-sm opacity-20 transition-opacity hover:opacity-100"
                                    />
                                ))}
                            </div>
                        </section>

                        {/* Recent Submissions */}
                        <section className="bg-bg-subtle border-border overflow-hidden rounded-lg border">
                            <div className="border-border border-b p-6">
                                <h3 className="text-text-primary text-xl font-semibold">
                                    Recent Submissions
                                </h3>
                            </div>
                            <div className="divide-border divide-y">
                                <div className="hover:bg-bg-muted/50 transition-colors">
                                    <RecentSubmissions
                                        submissions={user.stats?.recentSubmissions || []}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Side (40%) */}
                    <div className="space-y-8 lg:col-span-4">
                        <ProblemStats user={user} />
                        <ContestPerformance performance={user.stats?.contestPerformance} />
                        <Achievements achievements={user.stats?.achievements} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
