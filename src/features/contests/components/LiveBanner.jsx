'use client'

import React, { useState, useEffect } from 'react'
import { Zap, Timer, Users, Code2 } from 'lucide-react'
import Link from 'next/link'

function formatTimeRemaining(endTime) {
    const diff = new Date(endTime) - new Date()
    if (diff <= 0) return '00:00:00'
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const LiveBanner = ({ contest }) => {
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        if (!contest?.endTime) return
        setTimeLeft(formatTimeRemaining(contest.endTime))
        const interval = setInterval(() => {
            setTimeLeft(formatTimeRemaining(contest.endTime))
        }, 1000)
        return () => clearInterval(interval)
    }, [contest?.endTime])

    if (!contest) return null

    const problemCount = contest.problemIds?.length || 0

    return (
        <div className="from-accent to-accent-hover group relative overflow-hidden rounded-2xl bg-gradient-to-r p-8 shadow-2xl transition-all">
            <div className="absolute top-0 right-0 scale-150 rotate-12 transform p-8 opacity-10 transition-transform group-hover:scale-110">
                <Zap className="text-text-inverse size-[120px]" />
            </div>
            <div className="relative z-10">
                <div className="bg-bg-page/20 mb-4 inline-flex items-center rounded-full px-4 py-1 backdrop-blur-md">
                    <span className="bg-text-inverse mr-2 h-2 w-2 animate-pulse rounded-full" />
                    <span className="text-text-inverse text-xs font-black tracking-widest uppercase">
                        Live Now
                    </span>
                </div>
                <h2 className="text-text-inverse mb-2 text-3xl font-black">{contest.title}</h2>
                <div className="text-text-inverse mb-8 flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Timer className="size-6" />
                        <span className="font-mono text-xl font-bold">{timeLeft} remaining</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Code2 className="size-6" />
                        <span className="font-bold">{problemCount} problems</span>
                    </div>
                    {contest.maxParticipants && (
                        <div className="flex items-center gap-2">
                            <Users className="size-6" />
                            <span className="font-bold">Max {contest.maxParticipants}</span>
                        </div>
                    )}
                </div>
                <Link
                    href={`/contests/${contest._id}`}
                    className="text-accent bg-bg-page inline-block rounded-xl px-8 py-3 font-black tracking-wider uppercase shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-95"
                >
                    Enter Contest
                </Link>
            </div>
        </div>
    )
}

export default LiveBanner
