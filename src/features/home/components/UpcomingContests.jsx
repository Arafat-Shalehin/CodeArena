'use client'

import Link from 'next/link'
import { Trophy, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export default function UpcomingContests({ contests }) {
    if (!contests?.length) {
        return (
            <div className="bg-bg-page border-border rounded border border-dashed p-4 text-center">
                <Trophy className="text-text-muted mx-auto mb-2 h-6 w-6 opacity-50" />
                <p className="text-text-secondary text-xs">No upcoming contests scheduled.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-3">
            {contests.map((contest) => {
                const dateObj = new Date(contest.startTime)
                const monthStr = format(dateObj, 'MMM')
                const dayStr = format(dateObj, 'dd')
                const timeStr = format(dateObj, 'h:mm a')

                return (
                    <Link key={contest._id} href={`/contests/${contest._id}`}>
                        <div className="bg-bg-page border-border hover:border-accent group flex items-center gap-3 rounded-md border p-2 transition-colors">
                            <div className="bg-bg-subtle border-border group-hover:border-accent/50 flex h-11 w-11 flex-col items-center justify-center rounded border transition-colors">
                                <span className="text-text-muted text-[10px] font-bold uppercase">
                                    {monthStr}
                                </span>
                                <span className="text-accent text-sm font-bold">{dayStr}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-text-primary truncate text-xs font-bold">
                                    {contest.title}
                                </p>
                                <p className="text-text-muted flex items-center gap-1 text-[10px]">
                                    <Calendar className="h-3 w-3" /> {timeStr}
                                </p>
                            </div>
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}
