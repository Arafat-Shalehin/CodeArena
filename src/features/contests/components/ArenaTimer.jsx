'use client'

import { useContestTimer } from '@/hooks/useContestTimer'
import { Timer, AlertTriangle, Ban } from 'lucide-react'

const WARNING_THRESHOLD = 10 * 60 * 1000 // 10 minutes in ms
const DANGER_THRESHOLD = 2 * 60 * 1000 // 2 minutes in ms

/**
 * @component ArenaTimer
 * Countdown timer that adapts its visual state based on time remaining,
 * signaling urgency with colour changes per the design token system.
 */
export default function ArenaTimer({ startTime, endTime }) {
    const { phase, formatted, timeLeft } = useContestTimer(startTime, endTime)

    if (phase === 'ended') {
        return (
            <div className="border-error bg-error-light flex items-center gap-2 rounded-lg border px-4 py-2">
                <Ban className="text-error size-4" />
                <span className="text-error font-mono text-sm font-bold tracking-widest">
                    CONTEST ENDED
                </span>
            </div>
        )
    }

    if (phase === 'waiting') {
        return (
            <div className="border-border bg-bg-subtle flex items-center gap-2 rounded-lg border px-4 py-2">
                <Timer className="text-text-muted size-4" />
                <span className="text-text-muted font-mono text-sm font-medium">
                    Starts in {formatted}
                </span>
            </div>
        )
    }

    // Active phase — colour escalates with urgency
    const isDanger = timeLeft <= DANGER_THRESHOLD
    const isWarning = !isDanger && timeLeft <= WARNING_THRESHOLD

    return (
        <div
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors duration-500 ${
                isDanger
                    ? 'border-error bg-error-light'
                    : isWarning
                      ? 'border-warning bg-warning-light'
                      : 'border-border bg-bg-subtle'
            }`}
        >
            {isDanger || isWarning ? (
                <AlertTriangle
                    className={`size-4 ${isDanger ? 'text-error' : 'text-warning'} ${
                        isDanger ? 'animate-pulse' : ''
                    }`}
                />
            ) : (
                <Timer className="text-text-muted size-4" />
            )}
            <span
                className={`font-mono text-sm font-bold tracking-widest tabular-nums ${
                    isDanger
                        ? 'text-error animate-pulse'
                        : isWarning
                          ? 'text-warning'
                          : 'text-text-primary'
                }`}
            >
                {formatted}
            </span>
        </div>
    )
}
