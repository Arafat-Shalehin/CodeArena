'use client'

import React, { use, useEffect, useState, cloneElement } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

// Shared Layout
import Navbar from '@/components/layout/Navbar'
import { Dot, Loader2, Lock } from 'lucide-react'

// Profile Components
import ProfileHero from '@/features/profile/components/ProfileHero'
import StatsGrid from '@/features/profile/components/StatsGrid'
import ProblemStats from '@/features/profile/components/ProblemStats'
import ContestPerformance from '@/features/profile/components/ContestPerformance'
import Achievements from '@/features/profile/components/Achievements'
import RecentSubmissions from '@/features/profile/components/RecentSubmissions'
import RecommendedProblems from '@/features/profile/components/RecommendedProblems'

// Heatmap Components
import { ActivityCalendar } from 'react-activity-calendar'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import { useTheme } from 'next-themes'

// Data
import { getLanguageStats } from '@/features/profile/data/languages.data'

/** Design-token-based color mapping for language ranking */
const LANGUAGE_COLORS = ['text-accent', 'text-warning', 'text-info', 'text-success']

export default function PublicProfilePage({ params }) {
    const { id } = use(params)
    const router = useRouter()
    const { user: currentUser, isLoading: authLoading } = useAuth()
    const { theme } = useTheme()

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [submissions, setSubmissions] = useState([])
    const [hasMoreSubmissions, setHasMoreSubmissions] = useState(true)
    const [isSubmissionsLoading, setIsSubmissionsLoading] = useState(false)

    useEffect(() => {
        // Redirect to personal profile if viewing own ID
        if (!authLoading && currentUser && (currentUser._id === id || currentUser.id === id)) {
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
            // Trigger stats sync to ensure activityCalendar is up to date
            fetch('/api/user/sync', { method: 'POST' })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        // Refetch user to get updated stats
                        fetch(`/api/users/${id}`)
                            .then((r) => r.json())
                            .then((d) => {
                                if (d.success && d.data) {
                                    setUser((prev) => ({
                                        ...prev,
                                        ...d.data,
                                        avatarSeed: d.data.avatarSeed || d.data.name,
                                    }))
                                }
                            })
                            .catch(console.error)
                    }
                })
                .catch(console.error)
        }
    }, [id, currentUser, authLoading, router])

    const fetchSubmissions = async (limit = 5, offset = 0, reset = false) => {
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
        fetchSubmissions(5, submissions.length)
    }

    const handleViewAll = (e) => {
        e.preventDefault()
        fetchSubmissions(100, 0, true)
    }

    if (loading || authLoading) {
        return (
            <div className="bg-bg-page flex min-h-screen items-center justify-center">
                <Loader2 className="text-accent h-12 w-12 animate-spin" />
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className="bg-bg-page flex min-h-screen flex-col items-center justify-center space-y-4">
                <div className="text-4xl">👤</div>
                <h2 className="text-text-primary text-xl font-bold">{error || 'User not found'}</h2>
                <button onClick={() => router.push('/leaderboard')} className="btn-primary">
                    Back to Leaderboard
                </button>
            </div>
        )
    }

    const sortedLanguages = getLanguageStats(user.stats)

    // Privacy access control
    const isOwnProfile = currentUser && (currentUser._id === id || currentUser.id === id)
    const isAdmin = currentUser?.role === 'admin'
    const visibility = user.privacySettings?.profileVisibility || 'public'
    const privacy = user.privacySettings || {}
    const isFollowing = currentUser?.following?.includes(id)
    const canViewFull =
        isOwnProfile ||
        isAdmin ||
        visibility === 'public' ||
        (visibility === 'followers' && isFollowing)

    return (
        <div className="bg-bg-page text-text-primary min-h-screen font-sans">
            <Navbar />

            <main className="max-w-container mx-auto px-4 py-8 md:px-6">
                <ProfileHero user={user} />

                {/* Followers-only or private: show restricted notice */}
                {!canViewFull && (
                    <div className="bg-accent/5 border-accent/20 mb-8 flex items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm">
                        <Lock className="text-accent h-4 w-4 shrink-0" />
                        <span className="text-text-secondary">
                            {visibility === 'followers'
                                ? 'Only followers can see the full profile. Follow to unlock.'
                                : "This user's profile is private."}
                        </span>
                    </div>
                )}

                <div className="space-y-8">
                    {/* Stats — hidden if showStats is false */}
                    {privacy.showStats !== false && <StatsGrid user={user} />}

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                        {/* Left Column (4/12) */}
                        <div className="order-2 space-y-8 lg:order-1 lg:col-span-4">
                            {privacy.showStats !== false && <ProblemStats user={user} />}

                            {/* Recent Submissions — hidden if showSubmissions is false */}
                            {privacy.showSubmissions !== false && (
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
                            )}

                            {/* Languages */}
                            {sortedLanguages.length > 0 && (
                                <section className="bg-bg-subtle border-border rounded-2xl border p-6 shadow-sm">
                                    <h3 className="text-text-primary mb-4 text-lg font-bold">
                                        Languages
                                    </h3>
                                    <div className="bg-bg-muted mb-6 flex h-2.5 w-full overflow-hidden rounded-full">
                                        {sortedLanguages.map((lang, index) => (
                                            <div
                                                key={lang.name}
                                                className={`${LANGUAGE_COLORS[index % LANGUAGE_COLORS.length]} h-full transition-all`}
                                                style={{ width: `${lang.percentage}%` }}
                                            />
                                        ))}
                                    </div>
                                    <div className="space-y-3">
                                        {sortedLanguages.map((lang) => (
                                            <div
                                                key={lang.name}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`h-2 w-2 rounded-full ${
                                                            lang.name === 'Python'
                                                                ? 'bg-[#3572A5]'
                                                                : lang.name === 'JavaScript'
                                                                  ? 'bg-[#F7DF1E]'
                                                                  : lang.name === 'C++'
                                                                    ? 'bg-[#00599C]'
                                                                    : lang.name === 'Java'
                                                                      ? 'bg-[#5382a1]'
                                                                      : 'bg-text-muted'
                                                        }`}
                                                    />
                                                    <span className="text-text-secondary text-sm">
                                                        {lang.name}
                                                    </span>
                                                </div>
                                                <span className="text-text-primary text-sm font-medium">
                                                    {lang.count}{' '}
                                                    <span className="text-text-muted">
                                                        ({lang.percentage}%)
                                                    </span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Achievements */}
                            <Achievements user={user} />
                        </div>

                        {/* Right Column (8/12) */}
                        <div className="order-1 space-y-8 lg:order-2 lg:col-span-8">
                            {/* Activity Heatmap */}
                            <section className="bg-bg-subtle border-border overflow-hidden rounded-2xl border p-6 shadow-sm">
                                <h3 className="text-text-primary mb-4 text-lg font-bold">
                                    Submission Activity
                                </h3>
                                <div className="flex justify-center">
                                    <ActivityCalendar
                                        data={(() => {
                                            const cal = user?.stats?.activityCalendar || {}
                                            const entries =
                                                cal instanceof Map
                                                    ? Array.from(cal.entries())
                                                    : Object.entries(cal)
                                            return entries.map(([date, count]) => ({
                                                date,
                                                count: typeof count === 'number' ? count : 0,
                                                level:
                                                    typeof count === 'number'
                                                        ? count === 0
                                                            ? 0
                                                            : count <= 2
                                                              ? 1
                                                              : count <= 5
                                                                ? 2
                                                                : count <= 8
                                                                  ? 3
                                                                  : 4
                                                        : 0,
                                            }))
                                        })()}
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
                                        colorScheme={theme === 'dark' ? 'dark' : 'light'}
                                        blockSize={13}
                                        blockMargin={4}
                                        blockRadius={4}
                                        fontSize={12}
                                        labels={{
                                            totalCount: '{{count}} submissions in the last year',
                                            legend: {
                                                less: 'Less',
                                                more: 'More',
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
                                        }}
                                        renderBlock={(block, activity) => (
                                            <div {...block}>
                                                <ReactTooltip
                                                    anchorSelect={`[data-date="${activity.date}"]`}
                                                    content={`${activity.count} submissions on ${activity.date}`}
                                                    place="top"
                                                    className="!border-border !bg-bg-subtle !text-text-primary !rounded-md !border !px-3 !py-1.5 !text-sm !shadow-lg"
                                                />
                                            </div>
                                        )}
                                    />
                                </div>
                            </section>

                            {privacy.showContestHistory !== false && (
                                <ContestPerformance performance={user.stats?.contestPerformance} />
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
