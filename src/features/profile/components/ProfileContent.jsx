'use client'

import { getLanguageStats } from '@/features/profile/data/languages.data'
import ProfileHero from '@/features/profile/components/ProfileHero'
import StatsGrid from '@/features/profile/components/StatsGrid'
import ProblemStats from '@/features/profile/components/ProblemStats'
import ContestPerformance from '@/features/profile/components/ContestPerformance'
import Achievements from '@/features/profile/components/Achievements'
import RecentSubmissions from '@/features/profile/components/RecentSubmissions'
import RecommendedProblems from '@/features/profile/components/RecommendedProblems'
import LanguageSection from '@/features/profile/components/LanguageSection'
import ActivityHeatmap from '@/features/profile/components/ActivityHeatmap'
import { Lock } from 'lucide-react'

export default function ProfileContent({
    user,
    privacy,
    canViewFull,
    calendarData,
    submissions,
    hasMoreSubmissions,
    isSubmissionsLoading,
    handleLoadMore,
    handleViewAll,
    showRecommended = true,
}) {
    const sortedLanguages = getLanguageStats(user?.stats)
    const privacySettings = privacy || {}
    const showStats = privacySettings.showStats !== false
    const showSubmissions = privacySettings.showSubmissions !== false
    const showContestHistory = privacySettings.showContestHistory !== false

    return (
        <div className="bg-bg-page text-text-primary min-h-screen font-sans">
            <main className="max-w-container mx-auto px-4 py-8 md:px-6">
                <ProfileHero user={user} />

                {!canViewFull && (
                    <div className="bg-accent/5 border-accent/20 mb-8 flex items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm">
                        <Lock className="text-accent h-4 w-4 shrink-0" />
                        <span className="text-text-secondary">
                            {privacySettings.profileVisibility === 'followers'
                                ? 'Only followers can see the full profile. Follow to unlock.'
                                : "This user's profile is private."}
                        </span>
                    </div>
                )}

                <div className="space-y-8">
                    {showStats && <StatsGrid user={user} />}

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                        {/* Left Column (4/12) */}
                        <div className="order-2 space-y-8 lg:order-1 lg:col-span-4">
                            {showStats && <ProblemStats user={user} />}

                            {showSubmissions && (
                                <section className="bg-bg-subtle border-border overflow-hidden rounded-2xl border shadow-sm">
                                    <div className="border-border flex items-center justify-between border-b px-6 py-5">
                                        <h3 className="text-text-primary text-lg font-bold">
                                            Recent Submissions
                                        </h3>
                                        <button
                                            onClick={handleViewAll}
                                            className="text-accent text-xs font-bold hover:underline"
                                        >
                                            View All
                                        </button>
                                    </div>
                                    <RecentSubmissions submissions={submissions} />
                                    {hasMoreSubmissions && (
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={isSubmissionsLoading}
                                            className="bg-bg-muted/50 text-text-muted hover:bg-bg-muted border-border w-full border-t py-4 text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50"
                                        >
                                            {isSubmissionsLoading ? 'Loading...' : 'Load More'}
                                        </button>
                                    )}
                                </section>
                            )}

                            <LanguageSection languages={sortedLanguages} />
                            <Achievements user={user} achievements={user?.stats?.achievements} />
                        </div>

                        {/* Right Column (8/12) */}
                        <div className="order-1 space-y-8 lg:order-2 lg:col-span-8">
                            <ActivityHeatmap calendarData={calendarData} />
                            {showRecommended && <RecommendedProblems context="profile" />}
                            {showContestHistory && (
                                <ContestPerformance performance={user?.stats?.contestPerformance} />
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
