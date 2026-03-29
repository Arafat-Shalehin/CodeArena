import React from 'react'
import Link from 'next/link'
import { TrendingUp, Calendar, Award, Check, UserPlus, Trophy, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function DashboardRightSidebar({
    sidebarData,
    loading,
    followLoading,
    handleFollow,
    getDifficultyClass,
}) {
    return (
        <aside className="no-scrollbar hidden flex-col gap-6 pt-8 pb-8 pl-1 lg:sticky lg:top-20 lg:col-span-3 lg:flex lg:h-fit">
            {/* Trending Problems */}
            <div className="bg-bg-subtle border-border rounded-lg border p-6 shadow-sm">
                <h4 className="text-text-primary mb-4 flex items-center gap-2 font-semibold">
                    <TrendingUp className="text-accent h-5 w-5" /> Trending Problems
                </h4>
                {loading ? (
                    <div className="animate-pulse space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-bg-muted h-8 rounded"></div>
                        ))}
                    </div>
                ) : sidebarData.trendingProblems?.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {sidebarData.trendingProblems.map((prob) => (
                            <Link
                                key={prob._id}
                                href={`/problems/${prob._id}`}
                                className="group block"
                            >
                                <div className="mb-1 flex items-start justify-between">
                                    <p className="text-text-primary group-hover:text-accent line-clamp-1 text-sm font-medium transition-colors">
                                        {prob.title}
                                    </p>
                                    <span
                                        className={`ml-2 inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${getDifficultyClass(prob.difficulty)}`}
                                    >
                                        {prob.difficulty}
                                    </span>
                                </div>
                                <p className="text-text-muted text-[11px]">
                                    {prob.totalSubmissions?.toLocaleString() || 0} submissions
                                </p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-text-muted text-xs">No trending problems.</p>
                )}
            </div>

            {/* Suggested For You */}
            <div className="bg-bg-subtle border-border rounded-lg border p-6 shadow-sm">
                <h4 className="text-text-primary mb-4 font-semibold">Suggested for you</h4>
                {loading ? (
                    <div className="animate-pulse space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-bg-muted h-10 rounded"></div>
                        ))}
                    </div>
                ) : sidebarData.suggestedUsers?.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {sidebarData.suggestedUsers.map((sugg) => (
                            <div key={sugg._id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Link href={`/profile/${sugg._id}`}>
                                        <Avatar className="h-8 w-8 transition-opacity hover:opacity-80">
                                            <AvatarImage
                                                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${sugg.avatarSeed || sugg.name}`}
                                            />
                                            <AvatarFallback className="bg-bg-muted text-xs">
                                                {(sugg.name || 'U').substring(0, 1)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div>
                                        <Link href={`/profile/${sugg._id}`}>
                                            <p className="text-text-primary line-clamp-1 text-xs font-bold hover:underline">
                                                {sugg.name}
                                            </p>
                                        </Link>
                                        <p className="text-text-muted line-clamp-1 text-[10px]">
                                            {sugg.stats?.globalRank
                                                ? `Rank #${sugg.stats.globalRank}`
                                                : sugg.bio || 'New Coder'}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant={sugg.isFollowing ? 'ghost' : 'outline'}
                                    size="sm"
                                    onClick={() => handleFollow(sugg._id)}
                                    disabled={followLoading[sugg._id] || sugg.isFollowing}
                                    className={cn(
                                        'ml-2 h-6 shrink-0 border-none px-3 text-[10px] font-bold transition-all',
                                        sugg.isFollowing
                                            ? 'text-success bg-success/10'
                                            : 'bg-accent-light text-accent-text hover:bg-accent hover:text-white'
                                    )}
                                >
                                    {followLoading[sugg._id] ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : sugg.isFollowing ? (
                                        <>
                                            <Check className="mr-1 h-3 w-3" />
                                            Following
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="mt-[-1px] mr-1 h-3 w-3" />
                                            Follow
                                        </>
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-text-muted text-xs">No suggestions right now.</p>
                )}
            </div>

            {/* Upcoming Contests */}
            <div className="bg-bg-subtle border-border rounded-lg border p-6 shadow-sm">
                <h4 className="text-text-primary mb-4 font-semibold">Upcoming Contests</h4>
                {loading ? (
                    <div className="animate-pulse space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-bg-muted h-12 rounded"></div>
                        ))}
                    </div>
                ) : sidebarData.upcomingContests?.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {sidebarData.upcomingContests.map((contest) => {
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
                                            <span className="text-accent text-sm font-bold">
                                                {dayStr}
                                            </span>
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
                ) : (
                    <div className="bg-bg-page border-border rounded border border-dashed p-4 text-center">
                        <Trophy className="text-text-muted mx-auto mb-2 h-6 w-6 opacity-50" />
                        <p className="text-text-secondary text-xs">
                            No upcoming contests scheduled.
                        </p>
                    </div>
                )}
            </div>

            {/* Top Contributors */}
            <div className="bg-bg-subtle border-border rounded-lg border p-6 shadow-sm">
                <h4 className="text-text-primary mb-4 flex items-center gap-2 font-semibold">
                    <Award className="text-warning h-5 w-5" /> Top Contributors
                </h4>
                {loading ? (
                    <div className="animate-pulse space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-bg-muted h-8 rounded"></div>
                        ))}
                    </div>
                ) : sidebarData.topContributors?.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {sidebarData.topContributors.map((topUser) => (
                            <div key={topUser._id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Link href={`/profile/${topUser._id}`}>
                                        <Avatar className="h-7 w-7 transition-opacity hover:opacity-80">
                                            <AvatarImage
                                                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${topUser.avatarSeed || topUser.name}`}
                                            />
                                            <AvatarFallback className="bg-bg-muted text-[10px]">
                                                {(topUser.name || 'U').substring(0, 1)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <Link href={`/profile/${topUser._id}`}>
                                        <span className="text-text-primary line-clamp-1 text-xs font-semibold hover:underline">
                                            {topUser.name}
                                        </span>
                                    </Link>
                                </div>
                                <span className="text-accent ml-2 text-[10px] font-bold whitespace-nowrap">
                                    {topUser.stats?.score?.toLocaleString() || 0} pts
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-text-muted text-xs">No top contributors found.</p>
                )}
            </div>
        </aside>
    )
}
