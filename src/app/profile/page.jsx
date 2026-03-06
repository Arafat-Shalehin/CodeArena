'use client'

import { useRouter } from 'next/navigation'

// Shared Layout
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Dot, Loader2 } from 'lucide-react'

// Profile Components
import ProfileHero from '@/features/profile/components/ProfileHero'
import StatsGrid from '@/features/profile/components/StatsGrid'
import RecentSubmissions from '@/features/profile/components/RecentSubmissions'
import ProblemStats from '@/features/profile/components/ProblemStats'
import ContestPerformance from '@/features/profile/components/ContestPerformance'
import Achievements from '@/features/profile/components/Achievements'
import RecommendedProblems from '@/features/profile/components/RecommendedProblems'

// Auth
import { useAuth } from '@/context/AuthContext'

// Data
import { getLanguageStats } from '@/features/profile/data/languages.data'
import { useEffect, useState } from 'react'

/**
 * @component ProfilePage
 * @description The main user profile page displaying user stats, submission
 * activity, recent submissions, problem stats, languages, contest performance,
 * and achievements in a responsive 60/40 grid layout.
 *
 * @returns {JSX.Element} The rendered profile page.
 */

/** Design-token-based color mapping for language ranking */
const LANGUAGE_COLORS = ['text-success', 'text-warning', 'text-error', 'text-info']

export default function ProfilePage() {
    const router = useRouter()
    const { user, isLoading } = useAuth()
    const [submissions, setSubmissions] = useState([])
    const [hasMoreSubmissions, setHasMoreSubmissions] = useState(true)
    const [isSubmissionsLoading, setIsSubmissionsLoading] = useState(false)

    useEffect(() => {
        if (user) {
            fetchSubmissions(5, 0, true)
        }
    }, [user])

    const fetchSubmissions = async (limit = 10, offset = 0, reset = false) => {
        if (!user) return
        setIsSubmissionsLoading(true)
        try {
            const queryUrl = `/api/submissions?userId=${user._id || user.id}&limit=${limit}&offset=${offset}`
            const res = await fetch(queryUrl)
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
        // Fetch a large number to "load all", starting from where we are
        fetchSubmissions(100, submissions.length)
    }

    // Loading state while Firebase resolves
    if (isLoading) {
        return (
            <div className="bg-bg-page site-gradient flex min-h-screen flex-col">
                <Navbar />
                <main className="flex flex-grow items-center justify-center">
                    <Loader2 className="text-accent h-8 w-8 animate-spin" />
                </main>
                <Footer />
            </div>
        )
    }

    // Redirect unauthenticated users to login
    if (!user) {
        router.push('/login')
        return null
    }
    const sortedLanguages = getLanguageStats(user.stats)

    return (
        <div className="bg-bg-page site-gradient flex min-h-screen flex-col">
            <Navbar />

            <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-8 md:px-6">
                {/* Hero & Stats Cards */}
                <ProfileHero />
                <StatsGrid />

                {/* 60/40 Grid Layout */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-10">
                    {/* Left Side (60%) — Submission Activity + Recent Submissions */}
                    <div className="order-2 space-y-8 lg:order-1 lg:col-span-6">
                        {/* Interactive Recommendations */}
                        <RecommendedProblems />

                        {/* Submission Activity Section */}
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
                                            count:
                                                calendar instanceof Map
                                                    ? calendar.get(dateStr)
                                                    : calendar[dateStr] || 0,
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
                                    className="text-accent text-sm font-semibold hover:underline"
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

                    {/* Right Side (40%) — Stats-heavy panels first on mobile */}
                    <div className="order-1 space-y-8 lg:order-2 lg:col-span-4">
                        <ProblemStats />

                        {/* Languages */}
                        {sortedLanguages.length > 0 && (
                            <section className="bg-bg-subtle border-border rounded-lg border p-6">
                                <h3 className="text-text-primary mb-4 text-xl font-semibold">
                                    Languages
                                </h3>
                                <div className="bg-bg-muted mb-4 flex h-2 w-full overflow-hidden rounded-full">
                                    {sortedLanguages.map((language, index) => (
                                        <div
                                            key={language.language}
                                            className={
                                                index === 0
                                                    ? 'bg-accent'
                                                    : index === 1
                                                      ? 'bg-warning'
                                                      : index === 2
                                                        ? 'bg-info'
                                                        : 'bg-success'
                                            }
                                            style={{ width: `${language.percentage}%` }}
                                        />
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-5 text-xs font-medium">
                                        {sortedLanguages.map((language, index) => (
                                            <div
                                                key={language.language}
                                                className="flex justify-between"
                                            >
                                                <span className="text-text-secondary flex items-center text-left">
                                                    <Dot
                                                        className={
                                                            LANGUAGE_COLORS[index] ||
                                                            'text-text-muted'
                                                        }
                                                        size={30}
                                                    />
                                                    {language.language}
                                                </span>
                                                <span className="text-text-muted text-left">
                                                    {language.percentage}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        <ContestPerformance performance={user.stats?.contestPerformance} />
                        <Achievements achievements={user.stats?.achievements} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
