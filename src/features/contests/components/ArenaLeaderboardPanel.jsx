'use client'

import useSWR from 'swr'
import { Trophy, Medal, Award } from 'lucide-react'

const fetcher = (url) => fetch(url).then((r) => r.json())

function RankIcon({ rank }) {
    if (rank === 1) return <Trophy className="text-rank-gold size-4" />
    if (rank === 2) return <Medal className="text-rank-silver size-4" />
    if (rank === 3) return <Award className="text-rank-bronze size-4" />
    return <span className="text-text-muted font-mono text-sm tabular-nums">{rank}</span>
}

/**
 * @component ArenaLeaderboardPanel
 * Live auto-refreshing leaderboard that polls /api/contests/[id]/leaderboard/live every 5s.
 */
export default function ArenaLeaderboardPanel({ contestId, currentUserId }) {
    const { data, isLoading } = useSWR(
        contestId ? `/api/contests/${contestId}/leaderboard/live` : null,
        fetcher,
        { refreshInterval: 5000 }
    )

    const participants = data?.data || []

    return (
        <div className="flex h-full flex-col overflow-hidden">
            {/* Panel Header */}
            <div className="border-border bg-bg-subtle border-b px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="bg-success h-2 w-2 animate-pulse rounded-full" />
                    <h3 className="text-text-primary text-sm font-semibold">Live Standings</h3>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="space-y-2 p-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="bg-bg-muted h-10 animate-pulse rounded-md" />
                        ))}
                    </div>
                ) : participants.length === 0 ? (
                    <div className="flex h-full items-center justify-center p-6">
                        <p className="text-text-muted text-center text-sm">
                            No submissions yet. Be the first!
                        </p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-bg-subtle text-left">
                                <th className="text-text-muted px-4 py-2 text-xs font-medium tracking-wide uppercase">
                                    #
                                </th>
                                <th className="text-text-muted px-4 py-2 text-xs font-medium tracking-wide uppercase">
                                    User
                                </th>
                                <th className="text-text-muted px-4 py-2 text-right text-xs font-medium tracking-wide uppercase">
                                    Score
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {participants.map((p) => {
                                const isCurrentUser = p.userId?._id === currentUserId
                                return (
                                    <tr
                                        key={p._id}
                                        className={`border-border border-t text-sm transition-colors ${
                                            isCurrentUser
                                                ? 'bg-accent-light border-accent/30 border-y'
                                                : 'hover:bg-bg-subtle'
                                        }`}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex w-6 items-center justify-center">
                                                <RankIcon rank={p.rank} />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {p.userId?.photoURL && (
                                                    <img
                                                        src={p.userId.photoURL}
                                                        alt={p.userId.username}
                                                        className="size-6 rounded-full object-cover"
                                                    />
                                                )}
                                                <span
                                                    className={`max-w-[100px] truncate font-medium ${isCurrentUser ? 'text-accent-text' : 'text-text-primary'}`}
                                                >
                                                    {isCurrentUser
                                                        ? 'You'
                                                        : p.userId?.username || 'User'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-text-primary font-mono font-semibold tabular-nums">
                                                {p.score}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
