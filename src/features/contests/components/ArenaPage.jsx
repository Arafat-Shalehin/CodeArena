'use client'

import { useEffect, useState } from 'react'
import { useContest } from '@/hooks/useContest'
import { useContestTimer } from '@/hooks/useContestTimer'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import ArenaTimer from '@/features/contests/components/ArenaTimer'
import ArenaProblemTabs from '@/features/contests/components/ArenaProblemTabs'
import ArenaLeaderboardPanel from '@/features/contests/components/ArenaLeaderboardPanel'
import ArenaWorkspace from '@/features/contests/components/ArenaWorkspace'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Trophy, User as UserIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import AreanaLogo from '@/shared/components/ui/AreanaLogo'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

/**
 * @component ArenaPage
 * The live contest coding interface. Only accessible when contest is active.
 * Layout: top nav → problem tabs → split pane (problem desc | code editor | leaderboard)
 */
export default function ArenaPage({ contestId }) {
    const { user: currentUser } = useAuth()
    const router = useRouter()
    const { contest, isLoading } = useContest(contestId)
    const { phase } = useContestTimer(contest?.startTime, contest?.endTime)

    // Check participation status (if finished)
    const { data: participantData } = useSWR(
        contestId ? `/api/contests/${contestId}/check-registration` : null,
        (url) => fetch(url).then((r) => r.json())
    )
    const isUserFinished = participantData?.data?.isFinished

    const [activeProblemId, setActiveProblemId] = useState(null)
    const [showLeaderboard, setShowLeaderboard] = useState(true)
    const [solvedProblems, setSolvedProblems] = useState(new Set())
    const [isAutoFinishing, setIsAutoFinishing] = useState(false)

    const handleProblemSolved = (problemId) => {
        setSolvedProblems((prev) => new Set([...prev, problemId]))
    }

    // Auto-redirect if contest ended OR user already marked finished
    useEffect(() => {
        if (isUserFinished) {
            router.replace(`/contests/${contestId}/result`)
            return
        }

        if (phase === 'ended') {
            const timer = setTimeout(() => {
                router.push(`/contests/${contestId}/result`)
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [phase, isUserFinished, contestId, router])

    // Auto-finish if ALL problems solved
    useEffect(() => {
        if (!contest || contest.problemIds.length === 0 || isAutoFinishing || isUserFinished) return

        if (solvedProblems.size >= contest.problemIds.length && phase === 'active') {
            const timer = setTimeout(async () => {
                setIsAutoFinishing(true)
                toast.success('All problems solved! Finalizing your results...', {
                    icon: <Trophy className="text-accent h-5 w-5" />,
                    duration: 5000,
                })

                try {
                    const res = await fetch(`/api/contests/${contestId}/finish`, {
                        method: 'POST',
                    })
                    const data = await res.json()
                    if (data.success) {
                        router.push(`/contests/${contestId}/result`)
                    }
                } catch (error) {
                    console.error('Failed to auto-finish contest:', error)
                    setIsAutoFinishing(false)
                }
            }, 2500) // Delay to let the user see the "Accepted" state

            return () => clearTimeout(timer)
        }
    }, [solvedProblems.size, contest, contestId, phase, isAutoFinishing, isUserFinished, router])

    // Show skeleton while loading initial contest data
    if (isLoading) {
        return (
            <div className="bg-bg-page flex h-screen flex-col overflow-hidden">
                {/* Skeleton header */}
                <header className="border-border bg-bg-page/90 shrink-0 border-b">
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

    return (
        <div className="bg-bg-page flex h-screen flex-col overflow-hidden">
            {/* Arena Top Nav */}
            <header className="border-border bg-bg-page/90 shrink-0 border-b backdrop-blur-md">
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
                            className="text-text-muted hover:text-text-primary shrink-0 transition-colors"
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
                            className="shrink-0 gap-2"
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
                        solvedProblems={solvedProblems}
                    />
                )}
            </header>

            {/* Arena Body — split pane */}
            <div className="flex flex-1 overflow-hidden">
                {/* Workspace: Description + Editor + Console — all real, context-aware */}
                <ArenaWorkspace
                    contestId={contestId}
                    activeProblemId={activeProblemId || problems[0]?._id}
                    onProblemSolved={handleProblemSolved}
                />

                {/* Live Leaderboard Panel */}
                {showLeaderboard && (
                    <div className="border-border w-[240px] shrink-0 overflow-hidden border-l">
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
