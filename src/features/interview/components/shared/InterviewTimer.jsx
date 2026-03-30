import React, { useState, useEffect, useRef } from 'react'
import { Clock } from 'lucide-react'

function formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0')
    const s = String(seconds % 60).padStart(2, '0')
    return `${m}:${s}`
}

export default function InterviewTimer({ durationMins, startedAt, onTimeExpired }) {
    const totalSeconds = durationMins * 60
    const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
    const [remaining, setRemaining] = useState(Math.max(0, totalSeconds - elapsed))
    const hasFired = useRef(false)

    useEffect(() => {
        if (remaining <= 0) {
            if (!hasFired.current && onTimeExpired) {
                hasFired.current = true
                onTimeExpired()
            }
            return
        }
        const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
        return () => clearInterval(id)
    }, [remaining, onTimeExpired])

    const pct = remaining / totalSeconds
    const color = pct > 0.33 ? 'text-success' : pct > 0.15 ? 'text-warning' : 'text-error'

    return (
        <span className={`font-mono text-sm font-bold tabular-nums ${color}`}>
            <Clock size={14} className="mr-1 inline" />
            {formatTime(remaining)}
        </span>
    )
}
