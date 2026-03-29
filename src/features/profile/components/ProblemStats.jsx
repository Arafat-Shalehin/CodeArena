'use client'

import { useAuth } from '@/context/AuthContext'
import { getStatsData } from '../data/stats.data'

/**
 * @component ProblemStats
 * @description Displays a donut chart and progress bars showing the user's
 * problem-solving statistics broken down by difficulty (Easy, Medium, Hard).
 * Values are derived from the logged-in user's `stats.problemsSolved`.
 * @param {Object} props
 * @param {Object} [props.user] - Optional user data override (for public profiles).
 * @returns {JSX.Element} The rendered problem stats section.
 */
export default function ProblemStats({ user: userProp }) {
    const { user: authUser } = useAuth()
    const displayUser = userProp || authUser
    const statsData = getStatsData(displayUser?.stats)

    const totalSolved = displayUser?.stats?.accepted || 0
    const totalPossible = statsData.reduce((acc, s) => acc + s.total, 0) || 100
    const percentage = Math.min(100, Math.round((totalSolved / totalPossible) * 100))

    // SVG circle math
    const radius = 58
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percentage / 100) * circumference

    return (
        <section className="bg-bg-subtle border-border rounded-2xl border p-6 shadow-sm">
            <h3 className="text-text-primary mb-6 text-lg font-bold">Problem Stats</h3>
            <div className="flex flex-col items-center gap-8 sm:flex-row">
                <div className="relative h-32 w-32 shrink-0">
                    <svg className="h-full w-full -rotate-90">
                        <circle
                            className="text-bg-muted"
                            cx="64"
                            cy="64"
                            fill="transparent"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="12"
                        />
                        <circle
                            className="text-accent transition-all duration-1000 ease-in-out"
                            cx="64"
                            cy="64"
                            fill="transparent"
                            r={radius}
                            stroke="currentColor"
                            strokeDasharray={circumference}
                            style={{ strokeDashoffset: offset }}
                            strokeWidth="12"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-text-primary text-2xl font-bold">{totalSolved}</span>
                        <span className="text-text-muted text-[10px] font-bold tracking-tighter uppercase">
                            Solved
                        </span>
                    </div>
                </div>

                <div className="w-full flex-1 space-y-3">
                    {statsData.map((stat) => (
                        <div key={stat.label} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${stat.color}`} />
                                <span className={`text-sm font-semibold ${stat.text}`}>
                                    {stat.label}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-text-primary text-sm font-bold">
                                    {stat.solved}
                                </span>
                                <span className="text-text-muted text-[10px]">/ {stat.total}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

ProblemStats.displayName = 'ProblemStats'
