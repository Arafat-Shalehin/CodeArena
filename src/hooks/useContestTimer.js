'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Server-aware countdown timer for contest arena.
 * Calculates remaining time against the contest endTime from the API (not local clock).
 *
 * @param {Date|string|null} endTime - Contest end time from server
 * @param {Date|string|null} startTime - Contest start time from server
 * @returns {{ timeLeft: number, phase: 'waiting'|'active'|'ended', formatted: string }}
 */
export function useContestTimer(startTime, endTime) {
    const [timeLeft, setTimeLeft] = useState(0)
    const [phase, setPhase] = useState('waiting')

    const computePhase = useCallback(() => {
        const now = Date.now()
        const start = new Date(startTime).getTime()
        const end = new Date(endTime).getTime()

        if (!startTime || !endTime) return { phase: 'waiting', timeLeft: 0 }
        if (now < start) return { phase: 'waiting', timeLeft: start - now }
        if (now >= start && now < end) return { phase: 'active', timeLeft: end - now }
        return { phase: 'ended', timeLeft: 0 }
    }, [startTime, endTime])

    useEffect(() => {
        if (!startTime || !endTime) return

        const tick = () => {
            const { phase: p, timeLeft: t } = computePhase()
            setPhase(p)
            setTimeLeft(t)
        }

        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [startTime, endTime, computePhase])

    // Format as HH:MM:SS
    const totalSecs = Math.floor(timeLeft / 1000)
    const h = Math.floor(totalSecs / 3600)
    const m = Math.floor((totalSecs % 3600) / 60)
    const s = totalSecs % 60
    const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`

    return { timeLeft, phase, formatted, totalSecs }
}
