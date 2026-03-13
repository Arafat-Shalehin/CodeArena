'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useContest } from '@/hooks/useContest'
import { useContestLeaderboard } from '@/hooks/useContestLeaderboard'
import { Trophy, ArrowLeft, Medals, Target, Users } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

export default function ContestResultsPage() {
    const { id: contestId } = useParams()
    const router = useRouter()
    const { contest, isLoading: loadingContest } = useContest(contestId)
    const { leaderboard, isLoading: loadingLeaderboard, error } = useContestLeaderboard(contestId)

    const isLoading = loadingContest || (loadingLeaderboard && leaderboard.length === 0)

    if (isLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
                <div className="bg-bg-muted mb-8 h-8 w-48 animate-pulse rounded-lg" />
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full rounded-xl" />
                        ))}
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-40 w-full rounded-xl" />
                        <Skeleton className="h-60 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-bg-page min-h-screen">
            <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
                {/* Header */}
                <div className="mb-10 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="text-text-muted hover:text-accent mb-4 flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors"
                        >
                            <ArrowLeft className="size-4" />
                            Back to Contest
                        </button>
                        <h1 className="text-text-primary flex items-center gap-3 text-3xl font-black tracking-tight md:text-4xl">
                            <Trophy className="text-rank-gold size-10" />
                            Final Standings
                        </h1>
                        <p className="text-text-muted mt-2 font-medium">
                            {contest?.title} · Official Results
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden text-right md:block">
                            <p className="text-text-muted text-[10px] font-black tracking-widest uppercase">
                                Participants
                            </p>
                            <p className="text-text-primary text-xl font-black">
                                {contest?.participantsCount || 0}
                            </p>
                        </div>
                        <div className="border-border bg-border mx-2 hidden h-10 w-px md:block" />
                        <div className="bg-success/10 border-success/20 text-success rounded-full border px-4 py-2 text-xs font-black uppercase">
                            Finalized
                        </div>
                    </div>
                </div>

                <div className="grid gap-10 lg:grid-cols-3">
                    {/* Rankings Table */}
                    <div className="space-y-6 lg:col-span-2">
                        <div className="border-border bg-bg-subtle text-text-muted grid grid-cols-12 gap-4 rounded-xl border px-6 py-3 text-[10px] font-black tracking-widest uppercase">
                            <div className="col-span-1">Rank</div>
                            <div className="col-span-6">User</div>
                            <div className="col-span-3 text-right">Points</div>
                            <div className="col-span-2 text-right">Solved</div>
                        </div>

                        {leaderboard.length === 0 ? (
                            <div className="border-border bg-bg-subtle flex flex-col items-center justify-center rounded-2xl border py-20 text-center">
                                <Target className="text-text-muted mb-4 h-12 w-12 opacity-20" />
                                <h3 className="text-text-primary text-lg font-bold">
                                    No Records Found
                                </h3>
                                <p className="text-text-muted px-4 text-sm">
                                    The leaderboard hasn't been updated for this contest yet.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {leaderboard.map((entry, index) => {
                                    const isTopThree = index < 3
                                    const rankStyles = [
                                        'text-rank-gold bg-rank-gold/10 border-rank-gold/20 shadow-rank-gold/10',
                                        'text-rank-silver bg-rank-silver/10 border-rank-silver/20 shadow-rank-silver/10',
                                        'text-rank-bronze bg-rank-bronze/10 border-rank-bronze/20 shadow-rank-bronze/10',
                                    ]

                                    return (
                                        <div
                                            key={entry._id}
                                            className={`border-border bg-bg-subtle grid grid-cols-12 items-center gap-4 rounded-xl border p-4 transition-all hover:bg-white/60 dark:hover:bg-white/5 ${
                                                index === 0 ? 'ring-accent/30 ring-2' : ''
                                            }`}
                                        >
                                            <div className="col-span-1">
                                                {isTopThree ? (
                                                    <div
                                                        className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 text-lg font-black shadow-sm ${rankStyles[index]}`}
                                                    >
                                                        {index + 1}
                                                    </div>
                                                ) : (
                                                    <span className="text-text-muted pl-4 text-sm font-black">
                                                        {index + 1}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="col-span-6 flex items-center gap-4">
                                                <Avatar className="h-12 w-12 border-2 border-white/10 shadow-sm">
                                                    <AvatarImage src={entry.userId?.photoURL} />
                                                    <AvatarFallback className="bg-bg-muted text-text-secondary font-bold">
                                                        {entry.userId?.username?.charAt(0) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="text-text-primary truncate text-base font-black">
                                                        {entry.userId?.username ||
                                                            entry.userId?.name ||
                                                            'Anonymous User'}
                                                    </p>
                                                    <p className="text-accent flex items-center gap-1 text-[10px] font-black tracking-tighter uppercase">
                                                        {index === 0 ? (
                                                            <>
                                                                <Trophy className="size-3" /> Area
                                                                Champion
                                                            </>
                                                        ) : isTopThree ? (
                                                            'Podium Finisher'
                                                        ) : (
                                                            'Ranked Participant'
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="col-span-3 text-right">
                                                <span className="text-text-primary text-lg font-black">
                                                    {entry.score || 0}
                                                </span>
                                            </div>

                                            <div className="col-span-2 text-right">
                                                <span
                                                    className={`inline-flex rounded-lg px-3 py-1 text-xs font-black uppercase ${
                                                        entry.solvedCount > 0
                                                            ? 'bg-accent/10 text-accent border-accent/20 border'
                                                            : 'bg-bg-muted text-text-muted'
                                                    }`}
                                                >
                                                    {entry.solvedCount || 0} Solved
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Stats */}
                    <div className="space-y-6">
                        <div className="border-border bg-bg-subtle rounded-2xl border p-6">
                            <h3 className="text-text-primary mb-6 text-sm font-black tracking-widest uppercase">
                                Contest Summary
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-accent/10 text-accent flex h-10 w-10 items-center justify-center rounded-xl">
                                            <Users className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-text-muted text-[10px] font-black tracking-widest uppercase">
                                                Total Participants
                                            </p>
                                            <p className="text-text-primary text-sm font-black">
                                                {contest?.participantsCount || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-accent/10 text-accent flex h-10 w-10 items-center justify-center rounded-xl">
                                            <Target className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-text-muted text-[10px] font-black tracking-widest uppercase">
                                                Problems
                                            </p>
                                            <p className="text-text-primary text-sm font-black">
                                                {contest?.problemIds?.length || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-border bg-bg-subtle overflow-hidden rounded-2xl border">
                            <div className="bg-accent p-6 text-white">
                                <h3 className="text-sm font-black tracking-widest uppercase opacity-80">
                                    Quick Stats
                                </h3>
                                <p className="mt-1 text-2xl font-black">Performance Audit</p>
                            </div>
                            <div className="divide-border divide-y p-2">
                                <div className="p-4">
                                    <p className="text-text-muted text-[10px] font-black tracking-widest uppercase">
                                        Top Score
                                    </p>
                                    <p className="text-text-primary text-xl font-black">
                                        {leaderboard[0]?.score || 0}
                                    </p>
                                </div>
                                <div className="p-4">
                                    <p className="text-text-muted text-[10px] font-black tracking-widest uppercase">
                                        Platform Average
                                    </p>
                                    <p className="text-text-primary text-xl font-black">
                                        {leaderboard.length > 0
                                            ? Math.round(
                                                  leaderboard.reduce(
                                                      (acc, curr) => acc + (curr.score || 0),
                                                      0
                                                  ) / leaderboard.length
                                              )
                                            : 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
