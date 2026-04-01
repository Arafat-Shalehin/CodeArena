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
            fetchSubmissions(5, 0, true)
            syncUser?.()
        }
    }, [userId])

    const fetchSubmissions = async (limit = 5, offset = 0, reset = false) => {
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

    // হিটম্যাপ ডাটা প্রসেসিং
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
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="text-accent h-10 w-10 animate-spin" />
            </div>
        )
    }

    return (
        <div className="animate-in fade-in bg-bg-page min-h-screen space-y-8 p-4 duration-500 md:p-8">
            <header>
                <h1 className="text-text-primary text-2xl font-black uppercase italic">
                    My Profile
                </h1>
                <p className="text-text-muted text-sm">Admin Personal View</p>
            </header>

            <ProfileHero user={user} />
            <StatsGrid user={user} />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="space-y-8 lg:col-span-4">
                    <ProblemStats user={user} />
                    <Achievements achievements={user.stats?.achievements} />
                </div>

                <div className="space-y-8 lg:col-span-8">
                    <div className="bg-bg-subtle border-border overflow-hidden rounded-2xl border p-6 shadow-sm">
                        <h3 className="text-text-primary mb-4 font-bold">Submission Activity</h3>
                        <div className="no-scrollbar flex justify-start overflow-x-auto">
                            <ActivityCalendar
                                data={calendarData}
                                // থিম অবজেক্টটি ফিক্স করা হয়েছে
                                theme={{
                                    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                                    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                                }}
                                colorScheme={theme === 'dark' ? 'dark' : 'light'}
                                fontSize={12}
                                blockSize={12}
                                blockMargin={4}
                                renderBlock={(block, activity) =>
                                    cloneElement(block, {
                                        'data-tooltip-id': 'activity-tooltip',
                                        'data-tooltip-html': `<strong>${activity.count} submissions</strong> on ${activity.date}`,
                                    })
                                }
                            />
                            <ReactTooltip id="activity-tooltip" />
                        </div>
                    </div>
                    <RecentSubmissions submissions={submissions} />
                </div>
            </div>
        </div>
    )
}
