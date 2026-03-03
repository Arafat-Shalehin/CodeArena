'use client'

import { useContest } from '@/hooks/useContest'
import { useContestTimer } from '@/hooks/useContestTimer'
import ContestDetailHero from '@/features/contests/components/ContestDetailHero'
import { ContestAbout } from '@/features/contests/components/ContestAbout'
import { ContestParticipants } from '@/features/contests/components/ContestParticipants'
import { useAuth } from '@/context/AuthContext'

/**
 * @component ContestDetailPage
 * Client-rendered detail/waiting room page for a single contest.
 */
export default function ContestDetailPage({ contestId }) {
    const { user: currentUser } = useAuth()
    const { contest, isLoading, error } = useContest(contestId)
    useContestTimer(contest?.startTime, contest?.endTime) // pre-warm timer

    if (isLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16">
                <div className="space-y-6">
                    <div className="bg-bg-muted h-12 w-2/3 animate-pulse rounded-xl" />
                    <div className="bg-bg-muted h-6 w-full animate-pulse rounded-xl" />
                    <div className="bg-bg-muted h-6 w-1/2 animate-pulse rounded-xl" />
                </div>
            </div>
        )
    }

    if (error || !contest) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 text-center">
                <h2 className="text-text-primary text-2xl font-bold">Contest not found</h2>
                <p className="text-text-muted mt-2 text-sm">
                    This contest may have been removed or the link is invalid.
                </p>
            </div>
        )
    }

    const durationMins =
        contest.startTime && contest.endTime
            ? Math.round((new Date(contest.endTime) - new Date(contest.startTime)) / 60000)
            : 0

    return (
        <div className="min-h-screen">
            <ContestDetailHero contest={contest} isRegistered={false} currentUser={currentUser} />

            <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
                <div className="grid gap-10 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <ContestAbout
                            description="Compete against world-class programmers in this timed challenge. Solve all problems as fast as possible to claim your spot on the leaderboard."
                            duration={`${durationMins} min`}
                            problemsCount={contest.problemIds?.length ?? 0}
                            languages="All major languages"
                        />
                    </div>
                    <div>
                        <ContestParticipants
                            participants={[]}
                            countLabel="Registered"
                            onViewAll={() => {}}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
