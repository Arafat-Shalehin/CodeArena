'use client'

import React from 'react'
import useSWR from 'swr'
import { Loader2, TrendingUp, AlertCircle, Lock, Award, Target, Activity } from 'lucide-react'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function StatsPanel() {
    const { data, error, isLoading } = useSWR('/api/interview/stats/me', fetcher)

    if (error) {
        return (
            <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-red-500">
                <AlertCircle size={24} className="mb-2" />
                <p className="text-sm font-semibold">Failed to load analytics</p>
                <p className="text-xs opacity-80">{error.message}</p>
            </div>
        )
    }

    if (isLoading || !data) {
        return (
            <div className="border-border bg-bg-subtle flex h-64 items-center justify-center rounded-xl border">
                <Loader2 size={24} className="text-accent animate-spin" />
            </div>
        )
    }

    const { stats, summary, weaknessFrequency, isPremium } = data
    if (!stats || stats.length === 0) {
        return (
            <div className="border-border bg-bg-subtle text-text-secondary flex h-64 flex-col items-center justify-center rounded-xl border p-6">
                <Activity size={32} className="mb-3 opacity-50" />
                <p className="text-text-primary font-semibold">No Analytics Available Yet</p>
                <p className="text-sm">Complete your first mock interview to generate insights.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {/* 1. Summary Metrics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <MetricCard
                    title="Total Sessions"
                    value={summary.totalSessions}
                    icon={<Activity size={18} />}
                    color="text-blue-500"
                    bg="bg-blue-500/10"
                />
                <MetricCard
                    title="Average Score"
                    value={`${summary.avgScore}%`}
                    icon={<Target size={18} />}
                    color="text-accent"
                    bg="bg-accent/10"
                />
                <MetricCard
                    title="Best Score"
                    value={`${summary.bestScore}%`}
                    icon={<Award size={18} />}
                    color="text-green-500"
                    bg="bg-green-500/10"
                />
            </div>

            {/* 2. Charts Section */}
            <div className="flex flex-col gap-6 lg:flex-row">
                {/* Score Trend (Bar Chart CSS) */}
                <div className="border-border bg-bg-subtle flex-1 rounded-xl border p-5">
                    <div className="mb-4 flex items-center gap-2">
                        <TrendingUp size={16} className="text-text-primary" />
                        <h3 className="text-text-primary text-sm font-bold">
                            Recent Performance Overview
                        </h3>
                    </div>
                    <div className="flex h-48 items-end gap-2 px-2 pt-6 pb-4">
                        {stats.map((session, idx) => {
                            const height = `${Math.max(10, session.overallScore)}%`
                            const isGood = session.overallScore >= 75
                            const date = new Date(session.completedAt).toLocaleDateString(
                                undefined,
                                {
                                    month: 'short',
                                    day: 'numeric',
                                }
                            )
                            return (
                                <div
                                    key={session._id}
                                    className="group relative flex flex-1 flex-col items-center justify-end"
                                >
                                    <div
                                        className={`w-full max-w-[40px] rounded-t-lg transition-all duration-300 hover:opacity-80 ${
                                            isGood ? 'bg-accent' : 'bg-border'
                                        }`}
                                        style={{ height }}
                                    ></div>
                                    <span className="text-text-muted mt-2 text-[10px] font-medium">
                                        {date}
                                    </span>

                                    {/* Tooltip */}
                                    <div className="bg-bg-page text-text-primary ring-border pointer-events-none absolute -top-10 left-1/2 z-10 w-max -translate-x-1/2 rounded-md px-2 py-1 text-xs opacity-0 shadow-lg ring-1 transition-opacity group-hover:opacity-100">
                                        Score: {session.overallScore}%
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Weaknesses Frequency */}
                <div className="border-border bg-bg-subtle flex w-full flex-col rounded-xl border p-5 lg:w-80">
                    <h3 className="text-text-primary mb-4 text-sm font-bold">
                        Top Areas to Improve
                    </h3>
                    {Object.keys(weaknessFrequency).length === 0 ? (
                        <p className="text-text-muted text-sm">
                            No specific weaknesses identified yet.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {Object.entries(weaknessFrequency).map(([topic, count]) => (
                                <div
                                    key={topic}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <span className="text-text-secondary flex-1 truncate pr-2">
                                        {topic}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-bg-page h-1.5 w-16 overflow-hidden rounded-full">
                                            <div
                                                className="bg-error h-full rounded-full"
                                                style={{
                                                    width: `${Math.min(100, (count / summary.totalSessions) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-text-primary w-4 text-right font-mono text-xs font-bold">
                                            {count}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Freemium Paywall */}
            {!isPremium && (
                <div className="border-border bg-bg-subtle to-bg-page relative mt-8 flex flex-col items-center overflow-hidden rounded-2xl border bg-gradient-to-b from-transparent p-8 text-center">
                    <div className="from-bg-subtle absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-50" />

                    <div className="bg-accent/20 text-accent ring-bg-subtle relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-3xl ring-8">
                        <Lock size={28} />
                    </div>

                    <h2 className="text-text-primary relative z-10 mb-2 text-2xl font-black tracking-tight">
                        Unlock Full Analytics History
                    </h2>
                    <p className="text-text-secondary relative z-10 mx-auto mb-6 max-w-md text-sm leading-relaxed">
                        You&apos;re currently viewing the last 2 sessions. Upgrade to Premium to
                        unlock a historical heatmap of your last 20 interviews, personalized study
                        guides deeply integrated with your weakness patterns, and infinite retries.
                    </p>

                    <button className="bg-accent hover:bg-accent/90 shadow-accent/20 relative z-10 rounded-xl px-8 py-3.5 text-sm font-extrabold text-white shadow-lg transition-all hover:scale-105 active:scale-95">
                        Upgrade Option Coming Soon
                    </button>

                    {/* Simulated blurred ghost items behind */}
                    <div className="pointer-events-none absolute right-0 bottom-0 left-0 flex translate-x-12 -translate-y-8 scale-[2.0] gap-4 opacity-10 blur-xl">
                        <div className="bg-text-primary h-24 w-12 rounded-lg"></div>
                        <div className="bg-text-primary h-32 w-12 rounded-lg"></div>
                        <div className="bg-text-primary h-16 w-12 rounded-lg"></div>
                        <div className="bg-text-primary h-40 w-12 rounded-lg"></div>
                    </div>
                </div>
            )}
        </div>
    )
}

function MetricCard({ title, value, icon, color, bg }) {
    return (
        <div className="border-border bg-bg-subtle flex items-center gap-4 rounded-xl border p-5">
            <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${bg} ${color}`}
            >
                {icon}
            </div>
            <div>
                <p className="text-text-muted text-sm font-medium">{title}</p>
                <p className="text-text-primary text-2xl font-black tracking-tight">{value}</p>
            </div>
        </div>
    )
}
