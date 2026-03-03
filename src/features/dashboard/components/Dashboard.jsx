/**
 * @file Dashboard.jsx
 * @description The main orchestrator component for the dashboard feature.
 */

'use client'

import React, { useState } from 'react'
import StatCard from './StatCard'
import Heatmap from './Heatmap'
import BreakdownChart from './BreakdownChart'
import SubmissionTable from './SubmissionTable'
import RecommendedProblems from './RecommendedProblems'
import { RECENT_SUBMISSIONS, getHeatmapData, UPCOMING_CONTESTS } from '../data/dashboard.data'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import AreanaLogo from '@/shared/components/ui/AreanaLogo'
import { Search, Bell, Flame, Target, Sparkles, Calendar, CheckCircle, Trophy } from 'lucide-react'

/**
 * @component ContestItem
 * @description Helper component for an upcoming contest row.
 *
 * @param {Object} props - Component props
 * @param {string} props.name - Contest name
 * @param {string} props.time - Time remaining
 * @param {boolean} props.registered - Registration status
 * @returns {JSX.Element}
 */
const ContestItem = ({ name, time, registered }) => (
    <div className="bg-bg-muted/40 border-border rounded-lg border p-3">
        <div className="flex items-start justify-between">
            <p className="text-text-primary text-xs font-bold">{name}</p>
            <span
                className={`text-[10px] font-bold ${registered ? 'text-text-muted' : 'text-accent'}`}
            >
                {time}
            </span>
        </div>
        <button
            className={`mt-3 w-full rounded py-1.5 text-[10px] font-bold text-white transition-colors ${
                registered ? 'bg-bg-muted text-text-muted' : 'bg-accent hover:bg-accent-hover'
            }`}
        >
            {registered ? 'REGISTERED' : 'REGISTER'}
        </button>
    </div>
)

/**
 * @component Dashboard
 * @description The high-performance coding platform dashboard feature.
 *
 * @returns {JSX.Element} The rendered Dashboard feature.
 */
const Dashboard = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const heatmapData = getHeatmapData()

    const difficultyBreakdown = [
        { label: 'Easy', count: 45, color: 'bg-success' },
        { label: 'Medium', count: 67, color: 'bg-warning' },
        { label: 'Hard', count: 15, color: 'bg-error' },
    ]

    return (
        <div className="bg-bg-page text-text-primary min-h-screen font-sans">
            {/* Inner Feature Navigation (Optional/Contextual) */}
            <header className="z-sticky bg-bg-page/80 border-border sticky top-0 border-b px-3 py-2 backdrop-blur-md md:px-6 lg:px-10">
                <div className="max-w-container mx-auto flex items-center justify-between gap-2 md:gap-4">
                    <div className="flex items-center gap-2 md:gap-8">
                        <div className="text-accent flex items-center gap-2">
                            <AreanaLogo />
                        </div>
                    </div>

                    <div className="flex max-w-md flex-1 justify-center px-1 md:px-4">
                        <div className="relative w-full">
                            <Search className="text-text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2 md:size-5" />
                            <Input
                                className="bg-bg-subtle h-9 pl-9 text-xs md:h-10 md:pl-10 md:text-sm"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-1 md:gap-3">
                        <button className="text-text-muted hover:text-text-primary p-1.5 transition-colors md:p-2">
                            <Bell className="size-5 md:size-6" />
                        </button>
                        <div className="bg-border mx-0.5 h-6 w-[1px] md:mx-1 md:h-8"></div>
                        <div className="flex items-center gap-2 pl-1 md:gap-3 md:pl-2">
                            <div className="hidden text-right lg:block">
                                <p className="text-text-primary text-xs font-bold">Rabiul Islam</p>
                                <p className="text-accent text-[10px] font-medium tracking-wider uppercase">
                                    Pro
                                </p>
                            </div>
                            <Avatar className="border-accent h-8 w-8 border-2 md:h-9 md:w-9">
                                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rabiul" />
                                <AvatarFallback>RI</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-container mx-auto space-y-8 p-4 lg:p-8">
                {/* Header Section */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <h1 className="text-text-primary text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
                            Welcome back, Rabiul!
                        </h1>
                        <p className="text-text-secondary mt-1 text-sm md:text-base">
                            Ready to tackle some new challenges today?
                        </p>
                    </div>
                    <div className="bg-warning/10 border-warning/20 flex w-fit items-center gap-3 rounded-xl border px-3 py-1.5 md:px-4 md:py-2">
                        <Flame className="text-warning fill-warning size-5 md:size-6" />
                        <span className="text-warning text-xs font-bold tracking-tight md:text-sm lg:text-base">
                            5 DAY STREAK
                        </span>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Stats */}
                    <StatCard
                        title="Problems Solved"
                        value="127"
                        sub="+5 this week"
                        icon={CheckCircle}
                        color="text-success"
                    />
                    <StatCard
                        title="Contest Rank"
                        value="#342"
                        sub="↑12 this week"
                        icon={Trophy}
                        color="text-accent"
                    />

                    {/* Accuracy Bento */}
                    <div className="bg-bg-subtle border-border flex flex-col justify-between rounded-xl border p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <p className="text-text-secondary text-sm font-medium">Accuracy</p>
                            <Target className="text-warning size-5" />
                        </div>
                        <div className="mt-4 flex items-center gap-4">
                            <h3 className="text-text-primary text-3xl font-bold">73%</h3>
                            <div className="relative h-10 w-10">
                                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                    <circle
                                        className="stroke-bg-muted"
                                        cx="18"
                                        cy="18"
                                        fill="none"
                                        r="16"
                                        strokeWidth="3"
                                    ></circle>
                                    <circle
                                        className="stroke-warning"
                                        cx="18"
                                        cy="18"
                                        fill="none"
                                        r="16"
                                        strokeDasharray="73, 100"
                                        strokeLinecap="round"
                                        strokeWidth="3"
                                    ></circle>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Streak Bento */}
                    <div className="bg-bg-subtle border-border flex flex-col justify-between rounded-xl border p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <p className="text-text-secondary text-sm font-medium">
                                Current Streak
                            </p>
                            <Sparkles className="text-error size-5" />
                        </div>
                        <div className="mt-4">
                            <h3 className="text-text-primary text-3xl font-bold">5 Days</h3>
                            <div className="mt-2 flex gap-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="bg-error h-1 flex-1 rounded-full"></div>
                                ))}
                                {[1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="bg-bg-muted h-1 flex-1 rounded-full"
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Problem Recommendations */}
                    <div className="lg:col-span-4">
                        <RecommendedProblems />
                    </div>

                    {/* Heatmap Section */}
                    <div className="lg:col-span-4">
                        <Heatmap data={heatmapData} />
                    </div>

                    {/* Performance and Breakdown */}
                    <div className="lg:col-span-3">
                        <div className="bg-bg-subtle border-border flex flex-col rounded-xl border p-6 shadow-sm">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h3 className="text-text-primary text-lg font-bold">
                                        Problem Solving Trend
                                    </h3>
                                    <p className="text-text-secondary text-sm">
                                        Activity over the last 3 months
                                    </p>
                                </div>
                                <select className="bg-bg-muted border-border text-text-primary focus:ring-accent rounded-lg border p-2 text-xs outline-none focus:ring-2">
                                    <option>Last 90 Days</option>
                                    <option>Last 30 Days</option>
                                </select>
                            </div>
                            <div className="relative min-h-[240px] flex-1">
                                <svg
                                    className="h-full w-full"
                                    preserveAspectRatio="none"
                                    viewBox="0 0 400 100"
                                >
                                    <defs>
                                        <linearGradient
                                            id="chartGradient"
                                            x1="0"
                                            x2="0"
                                            y1="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="var(--ca-accent)"
                                                stopOpacity="0.3"
                                            ></stop>
                                            <stop
                                                offset="100%"
                                                stopColor="var(--ca-accent)"
                                                stopOpacity="0"
                                            ></stop>
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M0,80 Q50,75 100,50 T200,60 T300,30 T400,10 L400,100 L0,100 Z"
                                        fill="url(#chartGradient)"
                                    ></path>
                                    <path
                                        d="M0,80 Q50,75 100,50 T200,60 T300,30 T400,10"
                                        fill="none"
                                        stroke="var(--ca-accent)"
                                        strokeWidth="2"
                                    ></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <BreakdownChart total={127} items={difficultyBreakdown} />
                    </div>

                    {/* Submissions Table */}
                    <div className="lg:col-span-3">
                        <SubmissionTable submissions={RECENT_SUBMISSIONS} />
                    </div>

                    {/* Upcoming Contests Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="bg-bg-subtle border-border space-y-4 rounded-xl border p-5 shadow-sm">
                            <h3 className="text-text-primary mb-4 flex items-center gap-2 text-sm font-bold">
                                <Calendar className="text-accent size-[18px]" />
                                Upcoming Contests
                            </h3>
                            <div className="space-y-3">
                                {UPCOMING_CONTESTS.map((contest) => (
                                    <ContestItem
                                        key={contest.name}
                                        name={contest.name}
                                        time={contest.time}
                                        registered={contest.registered}
                                    />
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <footer className="max-w-container border-border mx-auto mt-8 border-t p-8 text-center">
                <p className="text-text-muted text-sm">
                    © 2026 CodeArena Technologies. Keep coding, stay sharp.
                </p>
            </footer>
        </div>
    )
}

export default Dashboard
