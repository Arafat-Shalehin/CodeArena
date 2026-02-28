'use client'

import React, { useState } from 'react'
import Filters from './Filters'
import ContestCard from './ContestCard'
import LiveBanner from './LiveBanner'
import { CONTEST_TABS } from '../constants/contests.constants'
import { UPCOMING_CONTESTS, LIVE_CONTEST } from '../data/contests.data'

export default function ContestsPage() {
    const [filter, setFilter] = useState('Upcoming')

    return (
        <div className="bg-bg-page text-text-primary min-h-screen font-sans">
            <main className="max-w-container mx-auto px-6 py-8">
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
                    <div className="bg-bg-subtle border-border flex w-fit rounded-xl border p-1">
                        {CONTEST_TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                                    filter === tab
                                        ? 'bg-accent text-white shadow-lg'
                                        : 'text-text-secondary hover:text-text-primary'
                                }`}
                            >
                                {tab === 'Live' && (
                                    <span className="bg-error h-2 w-2 animate-pulse rounded-full" />
                                )}
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-8 lg:flex-row">
                    {/* Sidebar Filters */}
                    <Filters />

                    {/* Main Content */}
                    <div className="flex-1 space-y-8">
                        {/* Live Banner */}
                        <LiveBanner contest={LIVE_CONTEST} />

                        {/* Grid */}
                        <div>
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-text-primary flex items-center gap-2 text-xl font-bold">
                                    Upcoming Challenges
                                    <span className="badge-neutral">
                                        {UPCOMING_CONTESTS.length} total
                                    </span>
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {UPCOMING_CONTESTS.map((contest) => (
                                    <ContestCard key={contest.id} {...contest} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
