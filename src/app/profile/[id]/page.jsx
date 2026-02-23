'use client'

import { use } from 'react'

// Shared Layout
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// Profile Components
import ProfileHero from '@/features/profile/components/ProfileHero'
import StatsGrid from '@/features/profile/components/StatsGrid'
import ProblemStats from '@/features/profile/components/ProblemStats'
import ContestPerformance from '@/features/profile/components/ContestPerformance'
import Achievements from '@/features/profile/components/Achievements'
import RecentSubmissions from '@/features/profile/components/RecentSubmissions'

// Leaderboard Data (to look up user by _id)
import { leaderboardUsers } from '@/features/leaderboard/data/leaderboard.data'

/**
 * @component PublicProfilePage
 * @description Dynamic public profile page for viewing another user's profile.
 * Accessed via /profile/:id from leaderboard links.
 *
 * @param {Object} props
 * @param {Object} props.params - Route parameters containing the user ID.
 * @returns {JSX.Element} The rendered public profile page.
 */
export default function PublicProfilePage({ params }) {
    const { id } = use(params)

    // Look up user from leaderboard mock data
    const entry = leaderboardUsers.find((u) => u.userId._id === id)
    const user = entry
        ? {
              username: entry.userId.username,
              name: entry.userId.name,
              avatarSeed: entry.userId.username,
              stats: {
                  ...entry.userId.stats,
                  globalRank: entry.rank,
                  // Mock problem distribution since the API doesn't return it yet
                  problemsSolved: {
                      easy: Math.floor((entry.userId.stats?.totalSubmissions || 0) * 0.4),
                      medium: Math.floor((entry.userId.stats?.totalSubmissions || 0) * 0.4),
                      hard: Math.floor((entry.userId.stats?.totalSubmissions || 0) * 0.2),
                  },
              },
          }
        : {
              username: 'Unknown User',
              name: 'User Not Found',
              avatarSeed: 'unknown',
              stats: null,
          }

    return (
        <div className="bg-bg-page flex min-h-screen flex-col">
            <Navbar />

            <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-8 md:px-6">
                <ProfileHero user={user} />
                <StatsGrid user={user} />

                {/* 60/40 Grid Layout */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-10">
                    {/* Left Side (60%) */}
                    <div className="space-y-8 lg:col-span-6">
                        {/* Submission Activity */}
                        <section className="bg-bg-subtle border-border rounded-lg border p-6">
                            <h3 className="text-text-primary mb-6 text-xl font-semibold">
                                Submission Activity
                            </h3>
                            <div className="flex flex-wrap gap-1">
                                {[...Array(50)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-accent h-3 w-3 rounded-sm opacity-20 transition-opacity hover:opacity-100"
                                    />
                                ))}
                            </div>
                        </section>

                        {/* Recent Submissions */}
                        <section className="bg-bg-subtle border-border overflow-hidden rounded-lg border">
                            <div className="border-border border-b p-6">
                                <h3 className="text-text-primary text-xl font-semibold">
                                    Recent Submissions
                                </h3>
                            </div>
                            <div className="divide-border divide-y">
                                <div className="hover:bg-bg-muted/50 transition-colors">
                                    <RecentSubmissions />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Side (40%) */}
                    <div className="space-y-8 lg:col-span-4">
                        <ProblemStats user={user} />
                        <ContestPerformance performance={user.stats?.contestPerformance} />
                        <Achievements achievements={user.stats?.achievements} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
