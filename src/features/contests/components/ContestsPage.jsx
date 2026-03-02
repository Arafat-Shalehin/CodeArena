'use client'

import React, { useState } from 'react'
import Filters from './Filters'
import ContestCard from './ContestCard'
import LiveBanner from './LiveBanner'
import { CONTEST_TABS } from '../constants/contests.constants'
import { UPCOMING_CONTESTS, LIVE_CONTEST, PAST_CONTESTS } from '../data/contests.data'
import { Button } from '@/components/ui/button'
import { Filter } from 'lucide-react'
import PastContestCard from './PastContestCard'

export default function ContestsPage() {
    const [filter, setFilter] = useState('Upcoming')
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Filter State implementations
    const [selectedDates, setSelectedDates] = useState([])
    const [selectedDifficulties, setSelectedDifficulties] = useState([])
    const [selectedDurations, setSelectedDurations] = useState([])

    const toggleFilter = (setFilterState, value) => {
        setFilterState((prev) =>
            prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
        )
    }

    const handleClearFilters = () => {
        setSelectedDates([])
        setSelectedDifficulties([])
        setSelectedDurations([])
    }

    return (
        <div className="bg-bg-page text-text-primary min-h-screen font-sans">
            <main className="max-w-container mx-auto px-4 py-8 md:px-6">
                {/* Hero Section */}
                <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <h1 className="text-text-primary mb-2 text-4xl font-bold tracking-tight">
                            Coding Contests
                        </h1>
                        <p className="text-text-secondary text-lg">
                            Compete with programmers worldwide and climb the leaderboard.
                        </p>
                    </div>
                </div>

                <div className="relative flex flex-col gap-8 lg:flex-row">
                    {/* Sidebar Filters */}
                    <Filters
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        selectedDates={selectedDates}
                        toggleDate={(val) => toggleFilter(setSelectedDates, val)}
                        selectedDurations={selectedDurations}
                        toggleDuration={(val) => toggleFilter(setSelectedDurations, val)}
                        selectedDifficulties={selectedDifficulties}
                        toggleDifficulty={(val) => toggleFilter(setSelectedDifficulties, val)}
                        handleClearFilters={handleClearFilters}
                    />

                    {/* Main Content */}
                    <div className="min-w-0 flex-1 space-y-12">
                        {/* Toolbar (Mobile Filter Toggle & Tabs) */}
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            {/* Mobile Filters Trigger */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-border text-text-primary bg-bg-page flex w-full sm:w-auto lg:hidden"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                Filters
                            </Button>

                            {/* Tabs */}
                            <div className="bg-bg-subtle border-border flex w-full overflow-x-auto rounded-xl border p-1 sm:w-fit">
                                {CONTEST_TABS.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setFilter(tab)}
                                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all sm:flex-none ${
                                            filter === tab
                                                ? 'bg-accent text-white shadow-lg'
                                                : 'text-text-secondary hover:text-text-primary'
                                        }`}
                                    >
                                        {tab === 'Live' && (
                                            <span className="bg-error h-2 w-2 flex-shrink-0 animate-pulse rounded-full" />
                                        )}
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Live Banner */}
                        {filter === 'Live' || filter === 'Upcoming' ? (
                            <LiveBanner contest={LIVE_CONTEST} />
                        ) : null}

                        {/* Upcoming Section */}
                        <section>
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-text-primary flex items-center gap-2 text-xl font-bold">
                                    {filter} Challenges
                                    <span className="bg-bg-muted text-text-secondary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                                        {UPCOMING_CONTESTS.length} total
                                    </span>
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {UPCOMING_CONTESTS.map((contest) => (
                                    <ContestCard key={contest.id} {...contest} />
                                ))}
                            </div>
                        </section>

                        {/* --- Recently Completed Section --- */}
                        <section>
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-text-primary text-xl font-bold">
                                    Recently Completed
                                </h3>
                                <button className="text-accent text-sm font-semibold hover:underline">
                                    View All History
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {/* Error Fix: Data pass kora holo map er madhyome */}
                                {PAST_CONTESTS.map((contest) => (
                                    <PastContestCard key={contest.id} contest={contest} />
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}
