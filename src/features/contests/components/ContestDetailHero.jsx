'use client'

import Link from 'next/link'
import { useContestTimer } from '@/hooks/useContestTimer'
import { useContestRegistration } from '@/hooks/useContestRegistration'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Users, Zap, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

/**
 * @component ContestDetailHero
 * Full-width hero section for the contest detail/waiting room page.
 * Shows countdown, rules, and registration/enter arena CTA.
 */
export default function ContestDetailHero({
    contest,
    isRegistered: initialIsRegistered,
    currentUser,
}) {
    const [isRegistered, setIsRegistered] = useState(initialIsRegistered)
    const {
        register,
        isLoading: registering,
        error: regError,
    } = useContestRegistration(contest._id)
    const { phase, formatted } = useContestTimer(contest.startTime, contest.endTime)

    const handleRegister = async () => {
        try {
            await register()
            setIsRegistered(true)
        } catch {
            // error shown via regError
        }
    }

    const duration = Math.round(
        (new Date(contest.endTime) - new Date(contest.startTime)) / 1000 / 60
    )

    return (
        <div className="border-border bg-bg-subtle border-b">
            <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
                <div className="grid gap-10 lg:grid-cols-3">
                    {/* Left: Info */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Status badge */}
                        <div className="flex items-center gap-3">
                            {phase === 'active' && (
                                <span className="bg-success-light text-success inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
                                    <span className="bg-success h-1.5 w-1.5 animate-pulse rounded-full" />
                                    LIVE NOW
                                </span>
                            )}
                            {phase === 'waiting' && (
                                <span className="bg-accent-light text-accent-text inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold">
                                    UPCOMING
                                </span>
                            )}
                            {phase === 'ended' && (
                                <span className="bg-bg-muted text-text-muted inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold">
                                    ENDED
                                </span>
                            )}
                        </div>

                        <h1 className="text-text-primary text-3xl font-bold tracking-tight md:text-4xl">
                            {contest.title}
                        </h1>

                        {/* Meta info row */}
                        <div className="text-text-secondary flex flex-wrap gap-6 text-sm">
                            <span className="flex items-center gap-2">
                                <Calendar className="size-4" />
                                {formatDate(contest.startTime)}
                            </span>
                            <span className="flex items-center gap-2">
                                <Clock className="size-4" />
                                {duration} min · {contest.problemIds?.length || 0} Problems
                            </span>
                            {contest.maxParticipants && (
                                <span className="flex items-center gap-2">
                                    <Users className="size-4" />
                                    Max {contest.maxParticipants} participants
                                </span>
                            )}
                        </div>

                        {/* Problems preview badges */}
                        {contest.problemIds?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {contest.problemIds.map((p, idx) => (
                                    <span
                                        key={p._id}
                                        className="border-border bg-bg-page text-text-secondary inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-medium"
                                    >
                                        <span className="text-text-muted font-mono">
                                            {String.fromCharCode(65 + idx)}.
                                        </span>
                                        {p.title}
                                    </span>
                                ))}
                            </div>
                        )}

                        {regError && <p className="text-error text-sm">{regError}</p>}
                    </div>

                    {/* Right: Countdown + CTA card */}
                    <div className="border-border bg-bg-page flex flex-col items-stretch gap-4 rounded-xl border p-6 shadow-sm">
                        {/* Countdown */}
                        <div className="text-center">
                            <p className="text-text-muted mb-2 text-xs font-medium tracking-wide uppercase">
                                {phase === 'waiting'
                                    ? 'Starts in'
                                    : phase === 'active'
                                      ? 'Time remaining'
                                      : 'Contest ended'}
                            </p>
                            <p
                                className={`font-mono text-5xl font-black tracking-tight tabular-nums ${
                                    phase === 'ended'
                                        ? 'text-text-muted'
                                        : phase === 'active'
                                          ? 'text-text-primary'
                                          : 'text-accent-text'
                                }`}
                            >
                                {phase === 'ended' ? '00:00:00' : formatted}
                            </p>
                        </div>

                        <div className="border-border border-t" />

                        {/* CTA */}
                        {phase === 'active' && isRegistered && (
                            <Link href={`/arena/${contest._id}`} className="w-full">
                                <Button className="btn-primary w-full gap-2">
                                    <Zap className="size-4" />
                                    Enter Arena
                                </Button>
                            </Link>
                        )}

                        {phase === 'active' && !isRegistered && (
                            <p className="text-text-muted text-center text-sm">
                                Registration closed. Contest is live.
                            </p>
                        )}

                        {phase === 'waiting' && !isRegistered && currentUser && (
                            <Button
                                className="btn-primary w-full"
                                onClick={handleRegister}
                                disabled={registering}
                            >
                                {registering ? 'Registering...' : 'Register Now'}
                            </Button>
                        )}

                        {phase === 'waiting' && isRegistered && (
                            <div className="flex flex-col items-center gap-2">
                                <div className="text-success flex items-center gap-2 text-sm font-medium">
                                    <CheckCircle2 className="size-4" />
                                    You&apos;re registered!
                                </div>
                                <p className="text-text-muted text-center text-xs">
                                    The arena will unlock when the contest starts.
                                </p>
                            </div>
                        )}

                        {phase === 'ended' && (
                            <Link href={`/contests/${contest._id}/results`} className="w-full">
                                <Button variant="outline" className="w-full">
                                    View Results
                                </Button>
                            </Link>
                        )}

                        {!currentUser && phase === 'waiting' && (
                            <Link href="/login" className="w-full">
                                <Button variant="outline" className="w-full">
                                    Sign in to Register
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
