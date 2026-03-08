'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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

/** Design-token-based color mapping for language ranking */
const LANGUAGE_COLORS = ['text-accent', 'text-warning', 'text-info', 'text-success']

export default function ProfilePage() {
    const router = useRouter()
    const { user, isLoading, syncUser } = useAuth()
    const [submissions, setSubmissions] = useState([])
    const [hasMoreSubmissions, setHasMoreSubmissions] = useState(true)
    const [isSubmissionsLoading, setIsSubmissionsLoading] = useState(false)

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login')
        }
    }, [user, isLoading, router])

    useEffect(() => {
        if (user) {
            fetchSubmissions(5, 0, true)
            // Background sync to ensure stats/heatmap are up to date
            syncUser?.()
        }
    }, [user, syncUser])

    const fetchSubmissions = async (limit = 5, offset = 0, reset = false) => {
        if (!user) return
        setIsSubmissionsLoading(true)
        try {
            const queryId = user._id || user.id
            const queryUrl = `/api/submissions?userId=${queryId}&limit=${limit}&offset=${offset}`
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
        fetchSubmissions(5, submissions.length)
    }

    const handleViewAll = (e) => {
        e.preventDefault()
        fetchSubmissions(100, 0, true)
    }

    if (isLoading || (!user && !isLoading)) {
        return (
            <div className="bg-bg-page flex min-h-screen items-center justify-center">
                <Loader2 className="text-accent h-12 w-12 animate-spin" />
            </div>
        )
    }

    if (!user) {
        return null
    }

    const sortedLanguages = getLanguageStats(user.stats)

    return (
        <div className="bg-bg-page text-text-primary min-h-screen font-sans">
            <Navbar />

            <main className="max-w-container mx-auto px-4 py-8 md:px-6">
                {/* Hero Section */}
                <ProfileHero user={user} />

                {/* Main Content */}
                <div className="space-y-8">
                    {/* Top Stats Grid */}
                    <StatsGrid user={user} />

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                        {/* Left Column (4/12) — Stats & Achievements */}
                        <div className="order-2 space-y-8 lg:order-1 lg:col-span-4">
                            <ProblemStats user={user} />

                            {/* Languages Section */}
                            {sortedLanguages.length > 0 && (
                                <section className="bg-bg-subtle border-border rounded-2xl border p-6 shadow-sm">
                                    <h3 className="text-text-primary mb-4 text-lg font-bold">
                                        Languages
                                    </h3>
                                    <div className="bg-bg-muted mb-6 flex h-2.5 w-full overflow-hidden rounded-full">
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
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                        {sortedLanguages.map((language, index) => (
                                            <div
                                                key={language.language}
                                                className="flex items-center justify-between"
                                            >
                                                <span className="text-text-secondary flex items-center text-xs font-semibold">
                                                    <Dot
                                                        className={
                                                            LANGUAGE_COLORS[index] ||
                                                            'text-text-muted'
                                                        }
                                                        size={24}
                                                    />
                                                    {language.language}
                                                </span>
                                                <span className="text-text-muted text-[10px] font-bold">
                                                    {language.percentage}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <Achievements achievements={user.stats?.achievements} />
                        </div>

                        {/* Right Column (8/12) — Activity & Submissions */}
                        <div className="order-1 space-y-8 lg:order-2 lg:col-span-8">
                            {/* Submission Activity Section */}
                            <section className="bg-bg-subtle border-border rounded-2xl border p-6 shadow-sm">
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="text-text-primary text-lg font-bold">
                                        Submission Activity
                                    </h3>
                                    <div className="text-text-muted flex items-center gap-1.5 text-[10px] font-bold uppercase">
                                        <span>Less</span>
                                        <div className="flex gap-1">
                                            <div className="bg-bg-muted/30 h-3 w-3 rounded-sm" />
                                            <div className="bg-success/30 h-3 w-3 rounded-sm" />
                                            <div className="bg-success/60 h-3 w-3 rounded-sm" />
                                            <div className="bg-success h-3 w-3 rounded-sm" />
                                        </div>
                                        <span>More</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    {/* Month Labels */}
                                    <div className="text-text-muted ml-8 flex justify-between px-2 text-[9px] font-bold tracking-tighter uppercase">
                                        <span>Jan</span>
                                        <span>Feb</span>
                                        <span>Mar</span>
                                        <span>Apr</span>
                                        <span>May</span>
                                        <span>Jun</span>
                                        <span>Jul</span>
                                        <span>Aug</span>
                                        <span>Sep</span>
                                        <span>Oct</span>
                                        <span>Nov</span>
                                        <span>Dec</span>
                                    </div>

                                    <div className="flex gap-2">
                                        {/* Weekday Labels */}
                                        <div className="text-text-muted flex flex-col justify-between py-1 text-[9px] leading-none font-bold uppercase">
                                            <span className="h-3"></span>
                                            <span className="h-3">Mon</span>
                                            <span className="h-3"></span>
                                            <span className="h-3">Wed</span>
                                            <span className="h-3"></span>
                                            <span className="h-3">Fri</span>
                                            <span className="h-3"></span>
                                        </div>

                                        <div className="no-scrollbar flex-1 overflow-x-auto pb-2">
                                            <div className="grid min-w-max grid-flow-col grid-rows-7 gap-1.5">
                                                {(() => {
                                                    const getActivityColor = (count) => {
                                                        if (!count) return 'bg-bg-muted/30'
                                                        if (count < 3) return 'bg-success/30'
                                                        if (count < 6) return 'bg-success/60'
                                                        return 'bg-success'
                                                    }
                                                    const activityDays = []
                                                    const rawCalendar =
                                                        user?.stats?.activityCalendar || {}
                                                    const calendar =
                                                        rawCalendar instanceof Map
                                                            ? Object.fromEntries(rawCalendar)
                                                            : rawCalendar

                                                    // Use 364 days (52 weeks) for a perfect GitHub grid
                                                    for (let i = 363; i >= 0; i--) {
                                                        const d = new Date()
                                                        d.setDate(d.getDate() - i)
                                                        const dateStr = d
                                                            .toISOString()
                                                            .split('T')[0]
                                                        activityDays.push({
                                                            date: dateStr,
                                                            count: calendar[dateStr] || 0,
                                                        })
                                                    }
                                                    return activityDays.map((day) => (
                                                        <div
                                                            key={day.date}
                                                            title={`${day.date}: ${day.count} accepted`}
                                                            className={`h-3 w-3 rounded-sm transition-all hover:z-10 hover:scale-150 ${getActivityColor(day.count)}`}
                                                        />
                                                    ))
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <RecommendedProblems />
                            <ContestPerformance performance={user.stats?.contestPerformance} />

                            {/* Recent Submissions */}
                            <section className="bg-bg-subtle border-border overflow-hidden rounded-2xl border shadow-sm">
                                <div className="border-border flex items-center justify-between border-b px-6 py-5">
                                    <h3 className="text-text-primary text-lg font-bold">
                                        Recent Submissions
                                    </h3>
                                    <button
                                        onClick={handleViewAll}
                                        className="text-accent text-xs font-bold hover:underline"
                                    >
                                        View All
                                    </button>
                                </div>
                                <RecentSubmissions submissions={submissions} />
                                {hasMoreSubmissions && (
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={isSubmissionsLoading}
                                        className="bg-bg-muted/50 text-text-muted hover:bg-bg-muted border-border w-full border-t py-4 text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50"
                                    >
                                        {isSubmissionsLoading ? 'Loading...' : 'Load More'}
                                    </button>
                                )}
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
