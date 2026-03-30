'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Shared Layout
import Navbar from '@/components/layout/Navbar'
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
import { useTheme } from 'next-themes'

// Heatmap Components
import React, { cloneElement } from 'react'
import { ActivityCalendar } from 'react-activity-calendar'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'

// Data
import { getLanguageStats } from '@/features/profile/data/languages.data'

/** Design-token-based color mapping for language ranking */
const LANGUAGE_COLORS = ['text-accent', 'text-warning', 'text-info', 'text-success']

export default function ProfilePage() {
    const router = useRouter()
    const { user, isLoading, syncUser } = useAuth()
    const { theme } = useTheme()
    const [submissions, setSubmissions] = useState([])
    const [hasMoreSubmissions, setHasMoreSubmissions] = useState(true)
    const [isSubmissionsLoading, setIsSubmissionsLoading] = useState(false)

    const userId = user?.id || user?._id

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/login?redirect=/profile')
        }
    }, [user, isLoading, router])

    useEffect(() => {
        if (userId) {
            fetchSubmissions(5, 0, true)
            // Background sync to ensure stats/heatmap are up to date
            syncUser?.()
        }
    }, [userId, syncUser])

    const fetchSubmissions = async (limit = 5, offset = 0, reset = false) => {
        if (!user) return
        setIsSubmissionsLoading(true)
        try {
            const queryUrl = `/api/submissions?userId=${userId}&limit=${limit}&offset=${offset}`
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

    if (isLoading || !user) {
        return (
            <div className="bg-bg-page flex min-h-screen items-center justify-center">
                <Loader2 className="text-accent h-12 w-12 animate-spin" />
            </div>
        )
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
                            <section className="bg-bg-subtle border-border overflow-hidden rounded-2xl border p-6 shadow-sm">
                                <h3 className="text-text-primary mb-6 text-lg font-bold">
                                    Submission Activity
                                </h3>

                                <div className="no-scrollbar flex w-full justify-start overflow-x-auto pb-4 sm:justify-center">
                                    {(() => {
                                        const rawCalendar = user?.stats?.activityCalendar || {}
                                        const calendar =
                                            rawCalendar instanceof Map
                                                ? Object.fromEntries(rawCalendar)
                                                : rawCalendar

                                        // Ensure 365 dates
                                        const calendarData = []
                                        for (let i = 364; i >= 0; i--) {
                                            const d = new Date()
                                            d.setDate(d.getDate() - i)
                                            const dateStr = d.toISOString().split('T')[0]
                                            const count = calendar[dateStr] || 0

                                            // Determine level 0-4
                                            let level = 0
                                            if (count > 0 && count <= 2) level = 1
                                            else if (count >= 3 && count <= 5) level = 2
                                            else if (count >= 6 && count <= 9) level = 3
                                            else if (count >= 10) level = 4

                                            calendarData.push({
                                                date: dateStr,
                                                count: count,
                                                level: level,
                                            })
                                        }

                                        return (
                                            <div className="w-max min-w-full">
                                                <ActivityCalendar
                                                    data={calendarData}
                                                    colorScheme={
                                                        theme === 'dark' ? 'dark' : 'light'
                                                    }
                                                    theme={{
                                                        light: [
                                                            '#ebedf0',
                                                            '#9be9a8',
                                                            '#40c463',
                                                            '#30a14e',
                                                            '#216e39',
                                                        ],
                                                        dark: [
                                                            '#161b22',
                                                            '#0e4429',
                                                            '#006d32',
                                                            '#26a641',
                                                            '#39d353',
                                                        ],
                                                    }}
                                                    labels={{
                                                        legend: {
                                                            less: 'Less',
                                                            more: 'More',
                                                            colors: [
                                                                'No activity',
                                                                '1-2 submissions',
                                                                '3-5 submissions',
                                                                '6-9 submissions',
                                                                '10+ submissions',
                                                            ],
                                                        },
                                                        months: [
                                                            'Jan',
                                                            'Feb',
                                                            'Mar',
                                                            'Apr',
                                                            'May',
                                                            'Jun',
                                                            'Jul',
                                                            'Aug',
                                                            'Sep',
                                                            'Oct',
                                                            'Nov',
                                                            'Dec',
                                                        ],
                                                        weekdays: [
                                                            'Sun',
                                                            'Mon',
                                                            'Tue',
                                                            'Wed',
                                                            'Thu',
                                                            'Fri',
                                                            'Sat',
                                                        ],
                                                        totalCount:
                                                            '{{count}} submissions in the last year',
                                                    }}
                                                    fontSize={12}
                                                    blockSize={12}
                                                    blockMargin={4}
                                                    blockRadius={2}
                                                    renderBlock={(block, activity) =>
                                                        cloneElement(block, {
                                                            'data-tooltip-id': 'activity-tooltip',
                                                            'data-tooltip-html': `<strong>${activity.count} submissions</strong> on ${activity.date}`,
                                                        })
                                                    }
                                                />
                                                <ReactTooltip id="activity-tooltip" />
                                            </div>
                                        )
                                    })()}
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
        </div>
    )
}
