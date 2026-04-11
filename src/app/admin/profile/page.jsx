'use client'

import { useEffect, useState, cloneElement } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from 'next-themes'
import { Loader2 } from 'lucide-react'

// Profile Components
import ProfileHero from '@/features/profile/components/ProfileHero'
import StatsGrid from '@/features/profile/components/StatsGrid'
import RecentSubmissions from '@/features/profile/components/RecentSubmissions'
import ProblemStats from '@/features/profile/components/ProblemStats'
import Achievements from '@/features/profile/components/Achievements'

// Heatmap Components
import { ActivityCalendar } from 'react-activity-calendar'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'

export default function AdminProfilePage() {
    const { user, isLoading, syncUser } = useAuth()
    const { theme } = useTheme()
    const [submissions, setSubmissions] = useState([])
    const [isSubmissionsLoading, setIsSubmissionsLoading] = useState(false)

    const userId = user?.id || user?._id

    useEffect(() => {
        if (userId) {
            fetchSubmissions(8, 0, true)
        }
    }, [userId])

    const fetchSubmissions = async (limit = 8, offset = 0, reset = false) => {
        if (!userId) return
        setIsSubmissionsLoading(true)
        try {
            const res = await fetch(
                `/api/submissions?userId=${userId}&limit=${limit}&offset=${offset}`
            )
            const data = await res.json()
            if (data.success) {
                setSubmissions((prev) => (reset ? data.data : [...prev, ...data.data]))
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsSubmissionsLoading(false)
        }
    }

    const rawCalendar = user?.stats?.activityCalendar || {}
    const calendarData = []
    for (let i = 364; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        const count = rawCalendar[dateStr] || 0
        let level = 0
        if (count > 0 && count <= 2) level = 1
        else if (count >= 3 && count <= 5) level = 2
        else if (count >= 6 && count <= 9) level = 3
        else if (count >= 10) level = 4
        calendarData.push({ date: dateStr, count, level })
    }

    if (isLoading || !user) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <div className="bg-accent/10 flex h-20 w-20 items-center justify-center rounded-2xl">
                    <Loader2 className="text-accent h-10 w-10 animate-spin" />
                </div>
                <p className="text-text-muted text-xs font-medium tracking-wide opacity-70">
                    Loading Admin Profile...
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-10">
            {/* Header */}
            <header className="flex flex-col gap-1">
                <h1 className="text-text-primary text-3xl font-semibold tracking-tight">
                    My <span className="text-accent">Profile</span>
                </h1>
                <p className="text-text-muted text-sm font-medium opacity-75">
                    Administrative Terminal & Personal Progress
                </p>
            </header>

            <div className="space-y-8">
                <ProfileHero user={user} />
                <StatsGrid user={user} />

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Left Column - Stats & Achievements */}
                    <div className="space-y-8 lg:col-span-4">
                        <div className="matte-surface border-border bg-bg-subtle/30 overflow-hidden rounded-2xl border p-1 shadow-sm">
                            <ProblemStats user={user} />
                        </div>
                        <div className="matte-surface border-border bg-bg-subtle/30 overflow-hidden rounded-2xl border p-1 shadow-sm">
                            <Achievements achievements={user.stats?.achievements} />
                        </div>
                    </div>

                    {/* Right Column - Activity & Submissions */}
                    <div className="space-y-8 lg:col-span-8">
                        {/* Heatmap Card */}
                        <div className="matte-surface border-border bg-bg-subtle/40 overflow-hidden rounded-3xl border p-8 shadow-xl">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-text-primary flex items-center gap-2 text-sm font-semibold tracking-tight">
                                    <div className="bg-accent h-2 w-2 animate-pulse rounded-full" />
                                    Submission Activity
                                </h3>
                                <div className="text-text-muted text-xs font-medium opacity-60">
                                    Last 365 Days
                                </div>
                            </div>

                            <div className="no-scrollbar flex justify-start overflow-x-auto py-2">
                                <ActivityCalendar
                                    data={calendarData}
                                    theme={{
                                        light: [
                                            '#ebedf0',
                                            '#9be9a8',
                                            '#40c463',
                                            '#30a14e',
                                            '#216e39',
                                        ],
                                        dark: [
                                            '#1c1c1c',
                                            '#0e4429',
                                            '#006d32',
                                            '#26a641',
                                            '#39d353',
                                        ],
                                    }}
                                    colorScheme={theme === 'dark' ? 'dark' : 'light'}
                                    fontSize={11}
                                    blockSize={11}
                                    blockMargin={4}
                                    renderBlock={(block, activity) =>
                                        cloneElement(block, {
                                            'data-tooltip-id': 'activity-tooltip',
                                            'data-tooltip-html': `<strong>${activity.count} submissions</strong> on ${activity.date}`,
                                        })
                                    }
                                />
                                <ReactTooltip
                                    id="activity-tooltip"
                                    className="matte-surface bg-bg-page! text-text-primary! border-border! rounded-xl! border! px-3! py-2! opacity-100! shadow-2xl"
                                />
                            </div>
                        </div>

                        {/* Recent Submissions */}
                        <div className="matte-surface border-border bg-bg-subtle/40 overflow-hidden rounded-3xl border p-1 shadow-xl">
                            <RecentSubmissions submissions={submissions} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
