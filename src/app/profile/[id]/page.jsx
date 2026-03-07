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

    const [submissions, setSubmissions] = useState([])
    const [hasMoreSubmissions, setHasMoreSubmissions] = useState(true)
    const [isSubmissionsLoading, setIsSubmissionsLoading] = useState(false)

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
                    setUser({
                        ...dbUser,
                        avatarSeed: dbUser.avatarSeed || dbUser.name,
                    })
                    // Initial submissions fetch
                    fetchSubmissions(5, 0, true)
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
            // If viewing own profile, trigger a stats sync to ensure consistency
            if (currentUser && currentUser._id === id) {
                fetch('/api/user/sync', { method: 'POST' }).catch(console.error)
            }
        }
    }, [id, currentUser, authLoading, router])

    const fetchSubmissions = async (limit = 10, offset = 0, reset = false) => {
        setIsSubmissionsLoading(true)
        try {
            const res = await fetch(`/api/submissions?userId=${id}&limit=${limit}&offset=${offset}`)
            const data = await res.json()
            if (data.success) {
                const newSubs = data.data || []
                setSubmissions((prev) => (reset ? newSubs : [...prev, ...newSubs]))

                const currentTotal = reset ? newSubs.length : submissions.length + newSubs.length
                setHasMoreSubmissions(currentTotal < (data.pagination?.total || 0))
            }
        } catch (err) {
            console.error('Failed to fetch submissions:', err)
        } finally {
            setIsSubmissionsLoading(false)
        }
    }

    const handleLoadMore = () => {
        fetchSubmissions(10, submissions.length)
    }

    const handleViewAll = (e) => {
        e.preventDefault()
        fetchSubmissions(100, submissions.length)
    }

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
                            <div className="flex flex-wrap gap-1.5">
                                {(() => {
                                    const getActivityColor = (count) => {
                                        if (!count) return 'bg-bg-muted opacity-20'
                                        if (count < 3) return 'bg-success opacity-40'
                                        if (count < 6) return 'bg-success opacity-70'
                                        return 'bg-success opacity-100'
                                    }
                                    const activityDays = []
                                    const calendar = user?.stats?.activityCalendar || {}
                                    for (let i = 99; i >= 0; i--) {
                                        const d = new Date()
                                        d.setDate(d.getDate() - i)
                                        const dateStr = d.toISOString().split('T')[0]
                                        activityDays.push({
                                            date: dateStr,
                                            count: calendar[dateStr] || 0,
                                        })
                                    }
                                    return activityDays.map((day) => (
                                        <div
                                            key={day.date}
                                            title={`${day.date}: ${day.count} accepted`}
                                            className={`h-3 w-3 rounded-sm transition-all hover:scale-125 ${getActivityColor(day.count)}`}
                                        />
                                    ))
                                })()}
                            </div>
                            <div className="text-text-muted mt-4 flex items-center justify-end gap-2 text-[10px]">
                                <span>Less</span>
                                <div className="bg-bg-muted h-2.5 w-2.5 rounded-sm opacity-20" />
                                <div className="bg-success h-2.5 w-2.5 rounded-sm opacity-40" />
                                <div className="bg-success h-2.5 w-2.5 rounded-sm opacity-70" />
                                <div className="bg-success h-2.5 w-2.5 rounded-sm opacity-100" />
                                <span>More</span>
                            </div>
                        </section>

                        {/* Recent Submissions */}
                        <section className="bg-bg-subtle border-border overflow-hidden rounded-lg border">
                            <div className="border-border flex items-center justify-between border-b p-6">
                                <h3 className="text-text-primary text-xl font-semibold">
                                    Recent Submissions
                                </h3>
                                <button
                                    onClick={handleViewAll}
                                    className="text-accent text-xs font-medium hover:underline"
                                >
                                    View All
                                </button>
                            </div>
                            <RecentSubmissions submissions={submissions} />
                            {hasMoreSubmissions && (
                                <div className="border-border flex justify-center border-t p-4">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={isSubmissionsLoading}
                                        className="text-text-secondary hover:text-accent text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        {isSubmissionsLoading ? 'Loading...' : 'Load More'}
                                    </button>
                                </div>
                            )}
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
