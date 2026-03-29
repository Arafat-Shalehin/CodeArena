'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useContest } from '@/hooks/useContest'
import { useContestTimer } from '@/hooks/useContestTimer'
import { useAuth } from '@/context/AuthContext'
import ArenaTimer from '@/features/contests/components/ArenaTimer'
import ArenaProblemTabs from '@/features/contests/components/ArenaProblemTabs'
import ArenaLeaderboardPanel from '@/features/contests/components/ArenaLeaderboardPanel'
import { Button } from '@/components/ui/button'
import { ChevronLeft, LayoutPanelLeft, Trophy, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import AreanaLogo from '@/shared/components/ui/AreanaLogo'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

/**
 * @component ArenaPage
 * The live contest coding interface. Only accessible when contest is active.
 * Layout: top nav → problem tabs → split pane (problem desc | code editor | leaderboard)
 */
export default function ArenaPage({ contestId }) {
    const router = useRouter()
    const { user: currentUser } = useAuth()
    const { contest, isLoading } = useContest(contestId)
    const { phase } = useContestTimer(contest?.startTime, contest?.endTime)
    const [activeProblemId, setActiveProblemId] = useState(null)
    const [showLeaderboard, setShowLeaderboard] = useState(true)

    // Show skeleton while loading initial contest data
    if (isLoading) {
        return (
            <div className="bg-bg-page flex h-screen flex-col overflow-hidden">
                {/* Skeleton header */}
                <header className="border-border bg-bg-page/90 flex-shrink-0 border-b">
                    <div className="flex h-14 items-center justify-between gap-4 px-4">
                        <div className="bg-bg-muted h-4 w-32 animate-pulse rounded" />
                        <div className="bg-bg-muted h-8 w-40 animate-pulse rounded-lg" />
                        <div className="bg-bg-muted h-8 w-20 animate-pulse rounded-lg" />
                    </div>
                    <div className="flex gap-2 border-t border-[#333] px-4 py-2">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="bg-bg-muted h-7 w-24 animate-pulse rounded-md"
                            />
                        ))}
                    </div>
                </header>
                {/* Skeleton body */}
                <div className="flex flex-1 overflow-hidden">
                    <div className="w-[35%] space-y-4 border-r border-[#333] p-6">
                        <div className="bg-bg-muted h-6 w-3/4 animate-pulse rounded" />
                        <div className="bg-bg-muted h-4 w-full animate-pulse rounded" />
                        <div className="bg-bg-muted h-4 w-5/6 animate-pulse rounded" />
                        <div className="bg-bg-muted h-4 w-full animate-pulse rounded" />
                        <div className="bg-bg-muted h-4 w-2/3 animate-pulse rounded" />
                    </div>
                    <div className="flex-1 bg-[#111]" />
                    <div className="w-[240px] border-l border-[#333]" />
                </div>
            </div>
        )
    }

    // Redirect if not active
    if (!isLoading && contest && phase !== 'active') {
        return (
            <div className="bg-bg-page flex min-h-screen flex-col items-center justify-center gap-4 p-8">
                <p className="text-text-primary text-center text-xl font-bold">
                    {phase === 'waiting'
                        ? 'Contest has not started yet.'
                        : 'This contest has ended.'}
                </p>
                <Link href={`/contests/${contestId}`}>
                    <Button variant="outline" className="gap-2">
                        <ChevronLeft className="size-4" />
                        Back to Contest Details
                    </Button>
                </Link>
            </div>
        )
    }

    const problems = contest?.problemIds || []
    const currentProblem = problems.find((p) => p._id === activeProblemId) || problems[0]

    return (
        <div className="bg-bg-page flex h-screen flex-col overflow-hidden">
            {/* Arena Top Nav */}
            <header className="border-border bg-bg-page/90 flex-shrink-0 border-b backdrop-blur-md">
                <div className="flex h-14 items-center justify-between gap-4 px-4">
                    {/* Left: logo + back + title */}
                    <div className="flex min-w-0 items-center gap-3">
                        <AreanaLogo
                            href="/feed"
                            className="mr-2 scale-90 transition-transform hover:scale-95"
                        />
                        <div className="bg-border mr-1 h-6 w-px" />
                        <Link
                            href={`/contests/${contestId}`}
                            className="text-text-muted hover:text-text-primary flex-shrink-0 transition-colors"
                        >
                            <ChevronLeft className="size-5" />
                        </Link>
                        <span className="text-text-primary truncate text-sm font-semibold">
                            {contest?.title ?? 'Loading...'}
                        </span>
                    </div>

                    {/* Center: Timer */}
                    {contest && (
                        <ArenaTimer startTime={contest.startTime} endTime={contest.endTime} />
                    )}

                    {/* Right: toggle leaderboard + profile */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex-shrink-0 gap-2"
                            onClick={() => setShowLeaderboard((v) => !v)}
                        >
                            <Trophy className="size-4" />
                            <span className="hidden sm:inline">Standings</span>
                        </Button>

                        <div className="bg-border h-6 w-px" />

                        {currentUser && (
                            <Link
                                href="/profile"
                                className="group flex items-center transition-transform hover:scale-105"
                            >
                                <Avatar className="border-accent/20 group-hover:border-accent/40 size-8 border transition-colors">
                                    <AvatarImage
                                        src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentUser.avatarSeed || currentUser.name || currentUser.email}`}
                                        alt={currentUser.name}
                                    />
                                    <AvatarFallback className="bg-accent/10 text-accent text-[10px] font-bold">
                                        <UserIcon size={12} />
                                    </AvatarFallback>
                                </Avatar>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Problem Tabs */}
                {problems.length > 0 && (
                    <ArenaProblemTabs
                        problems={problems}
                        activeProblemId={activeProblemId || problems[0]?._id}
                        onSelect={setActiveProblemId}
                        isEnded={phase === 'ended'}
                    />
                )}
            </header>

            {/* Arena Body — split pane */}
            <div className="flex flex-1 overflow-hidden">
                {/* Problem Description Panel */}
                <div
                    className={`border-border flex flex-col overflow-y-auto border-r ${showLeaderboard ? 'w-[35%]' : 'w-[50%]'} flex-shrink-0`}
                >
                    <div className="p-6">
                        {isLoading ? (
                            <div className="space-y-4">
                                <div className="bg-bg-muted h-8 w-3/4 animate-pulse rounded-lg" />
                                <div className="bg-bg-muted h-4 w-full animate-pulse rounded" />
                                <div className="bg-bg-muted h-4 w-5/6 animate-pulse rounded" />
                            </div>
                        ) : currentProblem ? (
                            <>
                                <h2 className="text-text-primary mb-4 text-xl font-bold">
                                    {currentProblem.title}
                                </h2>
                                <p className="text-text-secondary text-sm leading-relaxed">
                                    Problem description will appear here.
                                    {/* Link to the full problem page for now */}
                                </p>
                                <Link
                                    href={`/problems/${currentProblem._id}`}
                                    target="_blank"
                                    className="text-accent-text mt-4 inline-flex items-center gap-1 text-sm font-medium hover:underline"
                                >
                                    Open full problem statement ↗
                                </Link>
                            </>
                        ) : (
                            <p className="text-text-muted text-sm">Select a problem above.</p>
                        )}
                    </div>
                </div>

                {/* Code Editor Area */}
                <div
                    className={`flex flex-col overflow-hidden ${showLeaderboard ? 'flex-1' : 'flex-1'}`}
                >
                    <div className="border-border bg-bg-subtle flex items-center justify-between border-b px-4 py-2">
                        <span className="text-text-muted text-xs font-medium tracking-wide uppercase">
                            Code Editor
                        </span>
                        {phase === 'active' && (
                            <Button size="sm" className="btn-primary h-8 gap-2 text-xs">
                                Submit Solution
                            </Button>
                        )}
                    </div>
                    <div className="bg-bg-page flex flex-1 items-center justify-center">
                        <p className="text-text-muted text-center text-sm">
                            Code editor integration via existing problem-solve feature.
                        </p>
                    </div>
                </div>

                {/* Live Leaderboard Panel */}
                {showLeaderboard && (
                    <div className="border-border w-[240px] flex-shrink-0 overflow-hidden border-l">
                        <ArenaLeaderboardPanel
                            contestId={contestId}
                            currentUserId={currentUser?.uid}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
