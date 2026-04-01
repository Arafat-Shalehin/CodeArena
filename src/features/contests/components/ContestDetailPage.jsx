'use client'

import React, { useMemo, useEffect } from 'react'
import useSWR from 'swr'
import { io } from 'socket.io-client'
import { useContest } from '@/hooks/useContest'
import { useContestTimer } from '@/hooks/useContestTimer'
import ContestDetailHero from './ContestDetailHero'
import { ContestAbout } from '@/features/contests/components/ContestAbout'
import { ContestParticipants } from '@/features/contests/components/ContestParticipants'
import { useAuth } from '@/context/AuthContext'

/**
 * @component ContestDetailPage
 * Client-rendered detail/waiting room page for a single contest.
 */
export default function ContestDetailPage({ contestId }) {
    const { user: currentUser } = useAuth()
    const { contest, isLoading, error, mutate } = useContest(contestId)
    const { data: participantsData } = useSWR(
        contestId ? `/api/contests/${contestId}/participants?limit=5` : null,
        (url) => fetch(url).then((r) => r.json()),
        { refreshInterval: 10000 }
    )

    const { data: regData, isLoading: isRegLoading } = useSWR(
        contestId && currentUser ? `/api/contests/${contestId}/check-registration` : null,
        (url) => fetch(url).then((r) => r.json()),
        { refreshInterval: 10000 }
    )

    const participants = useMemo(() => {
        if (!participantsData?.success) return []
        return (participantsData.data || []).map((p) => ({
            id: p._id,
            name: p.userId?.name || 'Anonymous',
            avatar: p.userId?.avatarSeed
                ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.userId.avatarSeed}`
                : '',
        }))
    }, [participantsData])

    const isRegistered = regData?.isRegistered || false
    const totalParticipants = participantsData?.pagination?.total || participants.length

    // Real-time synchronization
    useEffect(() => {
        if (!contestId) return

        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002', {
            reconnection: true,
        })

        socket.on('connect', () => {
            console.log(`[ContestDetail] Joined room contest_${contestId}`)
            socket.emit('join_room', `contest_${contestId}`)
        })

        socket.on('contest:updated', (data) => {
            console.log('[ContestDetail] Contest updated, refreshing state...', data)
            mutate()
        })

        socket.on('contest:deleted', () => {
            console.log('[ContestDetail] Contest deleted, redirecting...')
            window.location.href = '/contests'
        })

        return () => {
            socket.disconnect()
        }
    }, [contestId, mutate])

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
            <ContestDetailHero
                contest={contest}
                isRegistered={isRegistered}
                isRegLoading={isRegLoading}
                currentUser={currentUser}
            />

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
                            participants={participants}
                            countLabel={`${totalParticipants} Registered`}
                            contestId={contestId}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
