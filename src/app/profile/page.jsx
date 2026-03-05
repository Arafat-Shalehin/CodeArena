'use client'

import { useRouter } from 'next/navigation'

// Shared Layout
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Dot, Loader2 } from 'lucide-react'

// Profile Components
import ProfileHero from '@/features/profile/components/ProfileHero'
import StatsGrid from '@/features/profile/components/StatsGrid'
import RecentSubmissions from '@/features/profile/components/RecentSubmissions'
import ProblemStats from '@/features/profile/components/ProblemStats'
import ContestPerformance from '@/features/profile/components/ContestPerformance'
import Achievements from '@/features/profile/components/Achievements'
import RecommendedProblems from '@/features/profile/components/RecommendedProblems'

// Auth
import { useAuth } from '@/context/AuthContext'

// Data
import { getLanguageStats } from '@/features/profile/data/languages.data'

/**
 * @component ProfilePage
 * @description The main user profile page displaying user stats, submission
 * activity, recent submissions, problem stats, languages, contest performance,
 * and achievements in a responsive 60/40 grid layout.
 *
 * @returns {JSX.Element} The rendered profile page.
 */

/** Design-token-based color mapping for language ranking */
const LANGUAGE_COLORS = ['text-success', 'text-warning', 'text-error', 'text-info']

export default function ProfilePage() {
    const router = useRouter()
    const { user, isLoading } = useAuth()

    // Loading state while Firebase resolves
    if (isLoading) {
        return (
            <div className="bg-bg-page site-gradient flex min-h-screen flex-col">
                <Navbar />
                <main className="flex flex-grow items-center justify-center">
                    <Loader2 className="text-accent h-8 w-8 animate-spin" />
                </main>
                <Footer />
            </div>
        )
    }

    // Redirect unauthenticated users to login
    if (!user) {
        router.push('/login')
        return null
    }
    const sortedLanguages = getLanguageStats(user.stats)

    return (
        <div className="bg-bg-page site-gradient flex min-h-screen flex-col">
            <Navbar />

            <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-8 md:px-6">
                {/* Hero & Stats Cards */}
                <ProfileHero />
                <StatsGrid />

                {/* 60/40 Grid Layout */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-10">
                    {/* Left Side (60%) — Submission Activity + Recent Submissions */}
                    <div className="order-2 space-y-8 lg:order-1 lg:col-span-6">
                        {/* Interactive Recommendations */}
                        <RecommendedProblems />

                        {/* Submission Activity Section */}
                        <section className="bg-bg-subtle border-border rounded-lg border p-6">
                            <h3 className="text-text-primary mb-6 text-xl font-semibold">
                                Submission Activity
                            </h3>
                            {Array.isArray(user.stats?.submissionHistory) &&
                            user.stats.submissionHistory.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                    {user.stats.submissionHistory.map((_, i) => (
                                        <div
                                            key={i}
                                            className="bg-accent h-3 w-3 rounded-sm opacity-20 transition-opacity hover:opacity-100"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="border-border rounded-lg border border-dashed p-8 text-center">
                                    <p className="text-text-muted text-sm">No recent activity</p>
                                </div>
                            )}
                        </section>

                        {/* Recent Submissions */}
                        <section className="bg-bg-subtle border-border overflow-hidden rounded-lg border">
                            <div className="border-border flex items-center justify-between border-b p-6">
                                <h3 className="text-text-primary text-xl font-semibold">
                                    Recent Submissions
                                </h3>
                                <button className="text-accent hover:text-accent-hover text-sm font-semibold">
                                    View all
                                </button>
                            </div>
                            <div className="divide-border divide-y">
                                <div className="hover:bg-bg-muted/50 transition-colors">
                                    <RecentSubmissions
                                        submissions={user.stats?.recentSubmissions || []}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Side (40%) — Stats-heavy panels first on mobile */}
                    <div className="order-1 space-y-8 lg:order-2 lg:col-span-4">
                        <ProblemStats />

                        {/* Languages */}
                        {sortedLanguages.length > 0 && (
                            <section className="bg-bg-subtle border-border rounded-lg border p-6">
                                <h3 className="text-text-primary mb-4 text-xl font-semibold">
                                    Languages
                                </h3>
                                <div className="bg-bg-muted mb-4 flex h-2 w-full overflow-hidden rounded-full">
                                    {sortedLanguages.map((language, index) => (
                                        <div
                                            key={language.language}
                                            className={
                                                index === 0
                                                    ? 'bg-accent'
                                                    : index === 1
                                                      ? 'bg-warning'
                                                      : index === 2
                                                        ? 'bg-info'
                                                        : 'bg-success'
                                            }
                                            style={{ width: `${language.percentage}%` }}
                                        />
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-5 text-xs font-medium">
                                        {sortedLanguages.map((language, index) => (
                                            <div
                                                key={language.language}
                                                className="flex justify-between"
                                            >
                                                <span className="text-text-secondary flex items-center text-left">
                                                    <Dot
                                                        className={
                                                            LANGUAGE_COLORS[index] ||
                                                            'text-text-muted'
                                                        }
                                                        size={30}
                                                    />
                                                    {language.language}
                                                </span>
                                                <span className="text-text-muted text-left">
                                                    {language.percentage}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        <ContestPerformance performance={user.stats?.contestPerformance} />
                        <Achievements achievements={user.stats?.achievements} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
