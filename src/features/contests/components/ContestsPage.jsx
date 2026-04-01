'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Filters from './Filters'
import ContestCard from './ContestCard'
import LiveBanner from './LiveBanner'
import PastContestCard from './PastContestCard'
import { useContests } from '@/hooks/useContests'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Filter, Users } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import useSWR from 'swr'

const TABS = ['Upcoming', 'Live', 'Past']
const TAB_STATUS = { Upcoming: 'upcoming', Live: 'active', Past: 'completed' }

export default function ContestsPage() {
    const [activeTab, setActiveTab] = useState('Upcoming')
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [selectedDates, setSelectedDates] = useState([])
    const [selectedDifficulties, setSelectedDifficulties] = useState([])
    const [selectedDurations, setSelectedDurations] = useState([])

    const { contests: rawContests, isLoading, error } = useContests(TAB_STATUS[activeTab])
    // Separately fetch active contests so the LiveBanner shows on Upcoming tab too
    const { contests: activeContests } = useContests('active')

    // Fetch user's participations to show "Completed" / "Registered" status
    const { data: participationData } = useSWR('/api/contests/me/participations', (url) =>
        fetch(url).then((res) => res.json())
    )
    const participations = participationData?.data || {}

    const filteredContests = useMemo(() => {
        if (!rawContests) return []

        return rawContests.filter((contest) => {
            // 1. Date Filtering
            if (selectedDates.length > 0) {
                const now = new Date()
                const start = new Date(contest.startTime)
                const diffDays = Math.ceil((start - now) / (1000 * 60 * 60 * 24))

                const matchDate = selectedDates.some((range) => {
                    if (range === 'This Week') return diffDays >= 0 && diffDays <= 7
                    if (range === 'This Month') return diffDays >= 0 && diffDays <= 30
                    return false
                })
                if (!matchDate) return false
            }

            // 2. Duration Filtering (Mins)
            if (selectedDurations.length > 0) {
                const duration = Math.round(
                    (new Date(contest.endTime) - new Date(contest.startTime)) / 1000 / 60
                )
                const matchDuration = selectedDurations.some((range) => {
                    if (range === '< 1 hour') return duration < 60
                    if (range === '1 - 3 hours') return duration >= 60 && duration <= 180
                    if (range === '> 3 hours') return duration > 180
                    return false
                })
                if (!matchDuration) return false
            }

            // 3. Difficulty Filtering
            if (selectedDifficulties.length > 0) {
                const diff = (contest.difficulty || 'Medium').toLowerCase()
                const matchDiff = selectedDifficulties.some((d) => d.toLowerCase() === diff)
                if (!matchDiff) return false
            }

            return true
        })
    }, [rawContests, selectedDates, selectedDurations, selectedDifficulties])

    const toggleFilter = (set, value) =>
        set((prev) => (prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]))

    const handleClearFilters = () => {
        setSelectedDates([])
        setSelectedDifficulties([])
        setSelectedDurations([])
    }

    const liveContest =
        activeTab === 'Live' || activeTab === 'Upcoming' ? (activeContests[0] ?? null) : null

    return (
        <div className="bg-bg-page text-text-primary min-h-screen font-sans">
            <main className="max-w-container mx-auto px-4 py-8 md:px-6">
                {/* Page Header & Tabs */}
                <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <h1 className="text-text-primary mb-2 text-4xl font-bold tracking-tight">
                                Coding Contests
                            </h1>
                            {/* Mobile Filter Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-border text-text-primary bg-bg-page flex lg:hidden"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                Filters
                            </Button>
                        </div>
                        <p className="text-text-secondary text-lg">
                            Compete with programmers worldwide and climb the leaderboard.
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="bg-bg-subtle border-border flex w-full shrink-0 overflow-x-auto rounded-xl border p-1 lg:w-fit">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold whitespace-nowrap transition-all lg:flex-none ${
                                    activeTab === tab
                                        ? 'bg-accent text-white shadow-lg'
                                        : 'text-text-secondary hover:bg-bg-muted/50 hover:text-text-primary'
                                }`}
                            >
                                {tab === 'Live' && (
                                    <span className="bg-error h-2 w-2 shrink-0 animate-pulse rounded-full" />
                                )}
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative flex flex-col gap-8 lg:flex-row">
                    <Filters
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        selectedDates={selectedDates}
                        toggleDate={(v) => toggleFilter(setSelectedDates, v)}
                        selectedDurations={selectedDurations}
                        toggleDuration={(v) => toggleFilter(setSelectedDurations, v)}
                        selectedDifficulties={selectedDifficulties}
                        toggleDifficulty={(v) => toggleFilter(setSelectedDifficulties, v)}
                        handleClearFilters={handleClearFilters}
                    />

                    <div className="min-w-0 flex-1 space-y-8 lg:space-y-12">
                        {liveContest && <LiveBanner contest={liveContest} />}

                        {/* Grid */}
                        <section>
                            <div className="mb-6 flex items-center gap-3">
                                <h3 className="text-text-primary text-xl font-bold">
                                    {activeTab} Contests
                                </h3>
                                {!isLoading && (
                                    <span className="bg-bg-muted text-text-secondary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                                        {filteredContests.length}
                                    </span>
                                )}
                            </div>

                            {isLoading ? (
                                <div className="space-y-12">
                                    {/* Banner Skeleton */}
                                    {activeTab === 'Upcoming' && (
                                        <Skeleton className="h-48 w-full rounded-2xl" />
                                    )}

                                    {/* Cards Grid Skeleton */}
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                        {[0, 1, 2, 3, 4, 5].map((i) => (
                                            <div
                                                key={i}
                                                className="border-border bg-bg-subtle space-y-4 rounded-lg border p-6"
                                            >
                                                <div className="flex justify-between">
                                                    <div className="text-text-secondary flex items-center gap-3 text-sm">
                                                        <Calendar className="size-4 shrink-0" />
                                                        <Skeleton className="h-4 w-24" />
                                                    </div>
                                                    <div className="text-text-secondary flex items-center gap-3 text-sm">
                                                        <Clock className="size-4 shrink-0" />
                                                        <Skeleton className="h-4 w-20" />
                                                    </div>
                                                    <div className="text-text-secondary flex items-center gap-3 text-sm">
                                                        <Users className="size-4 shrink-0" />
                                                        <Skeleton className="h-4 w-16" />
                                                    </div>
                                                </div>
                                                <Skeleton className="h-7 w-3/4" />
                                                <div className="space-y-3">
                                                    <Skeleton className="h-4 w-1/2" />
                                                    <Skeleton className="h-4 w-2/3" />
                                                    <Skeleton className="h-4 w-1/3" />
                                                </div>
                                                <Skeleton className="mt-4 h-10 w-full rounded-md" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {error && !isLoading && (
                                        <p className="text-error text-sm">
                                            Failed to load contests.
                                        </p>
                                    )}

                                    {!isLoading && !error && filteredContests.length === 0 && (
                                        <div className="border-border bg-bg-subtle rounded-lg border p-12 text-center">
                                            <p className="text-text-muted text-sm">
                                                No {activeTab.toLowerCase()} contests match these
                                                filters.
                                            </p>
                                            {(selectedDates.length > 0 ||
                                                selectedDifficulties.length > 0 ||
                                                selectedDurations.length > 0) && (
                                                <Button
                                                    variant="link"
                                                    className="text-accent mt-2 font-semibold"
                                                    onClick={handleClearFilters}
                                                >
                                                    Clear all filters
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    {!isLoading && !error && filteredContests.length > 0 && (
                                        <div
                                            className={`grid grid-cols-1 gap-6 ${activeTab === 'Past' ? 'md:grid-cols-2' : 'sm:grid-cols-2'} xl:grid-cols-3`}
                                        >
                                            {filteredContests.map((contest) => {
                                                const p = participations[contest._id]
                                                const isCompleted =
                                                    p?.isFinished || contest.status === 'completed'

                                                return (
                                                    <Link
                                                        key={contest._id}
                                                        href={`/contests/${contest._id}${isCompleted ? '/result' : activeTab === 'Past' ? '/results' : ''}`}
                                                    >
                                                        {activeTab === 'Past' ? (
                                                            <PastContestCard contest={contest} />
                                                        ) : (
                                                            <ContestCard
                                                                contest={{
                                                                    ...contest,
                                                                    isCompleted,
                                                                    isRegistered: !!p,
                                                                }}
                                                            />
                                                        )}
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}
