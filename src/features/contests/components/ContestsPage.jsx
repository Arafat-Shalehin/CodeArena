'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Filters from './Filters'
import ContestCard from './ContestCard'
import LiveBanner from './LiveBanner'
import PastContestCard from './PastContestCard'
import { useContests } from '@/hooks/useContests'
import { Button } from '@/components/ui/button'
import { Filter } from 'lucide-react'

const TABS = ['Upcoming', 'Live', 'Past']
const TAB_STATUS = { Upcoming: 'upcoming', Live: 'active', Past: 'completed' }

export default function ContestsPage() {
    const [activeTab, setActiveTab] = useState('Upcoming')
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [selectedDates, setSelectedDates] = useState([])
    const [selectedDifficulties, setSelectedDifficulties] = useState([])
    const [selectedDurations, setSelectedDurations] = useState([])

    const { contests, isLoading, error } = useContests(TAB_STATUS[activeTab])

    const toggleFilter = (set, value) =>
        set((prev) => (prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]))

    const handleClearFilters = () => {
        setSelectedDates([])
        setSelectedDifficulties([])
        setSelectedDurations([])
    }

    const liveContest =
        activeTab === 'Live' || activeTab === 'Upcoming'
            ? (contests.find((c) => c.status === 'active') ?? null)
            : null

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
                    <div className="bg-bg-subtle border-border flex w-full flex-shrink-0 overflow-x-auto rounded-xl border p-1 lg:w-fit">
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
                                    <span className="bg-error h-2 w-2 flex-shrink-0 animate-pulse rounded-full" />
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
                                        {contests.length}
                                    </span>
                                )}
                            </div>

                            {isLoading && (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                    {[0, 1, 2].map((i) => (
                                        <div
                                            key={i}
                                            className="bg-bg-subtle border-border h-56 animate-pulse rounded-lg border"
                                        />
                                    ))}
                                </div>
                            )}

                            {error && !isLoading && (
                                <p className="text-error text-sm">Failed to load contests.</p>
                            )}

                            {!isLoading && !error && contests.length === 0 && (
                                <div className="border-border bg-bg-subtle rounded-lg border p-12 text-center">
                                    <p className="text-text-muted text-sm">
                                        No {activeTab.toLowerCase()} contests right now.
                                    </p>
                                </div>
                            )}

                            {!isLoading && !error && contests.length > 0 && (
                                <div
                                    className={`grid grid-cols-1 gap-6 ${activeTab === 'Past' ? 'md:grid-cols-2' : 'sm:grid-cols-2'} xl:grid-cols-3`}
                                >
                                    {contests.map((contest) => (
                                        <Link key={contest._id} href={`/contests/${contest._id}`}>
                                            {activeTab === 'Past' ? (
                                                <PastContestCard contest={contest} />
                                            ) : (
                                                <ContestCard contest={contest} />
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}
