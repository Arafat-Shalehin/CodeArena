'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    Rss,
    Trophy,
    Code2,
    MessageSquare,
    TrendingUp,
    MessageCircle,
    UserPlus,
    Calendar,
    Award,
    Edit2,
    Check,
    X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { formatDistanceToNow, format } from 'date-fns'
import RecommendedProblems from './RecommendedProblems'
import { useAuth } from '@/context/AuthContext'

export default function DashboardHome({ user: initialUser }) {
    const { user: contextUser, updateProfile } = useAuth()
    const user = contextUser || initialUser

    const [feed, setFeed] = useState([])
    const [isEditingGoal, setIsEditingGoal] = useState(false)
    const [newGoal, setNewGoal] = useState(user?.stats?.weeklyGoal || 10)
    const [sidebarData, setSidebarData] = useState({
        trendingProblems: [],
        suggestedUsers: [],
        upcomingContests: [],
        topContributors: [],
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch feed and sidebar data concurrently
                const [feedRes, sidebarRes] = await Promise.all([
                    fetch('/api/users/feed'),
                    fetch('/api/feed/sidebar'),
                ])

                const feedData = await feedRes.json()
                const sidebarObj = await sidebarRes.json()

                if (feedData.success) {
                    setFeed(feedData.data)
                }
                if (sidebarObj.success) {
                    setSidebarData(sidebarObj.data)
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchDashboardData()
    }, [])

    const handleUpdateGoal = async () => {
        updateProfile({ stats: { ...user.stats, weeklyGoal: parseInt(newGoal) } })
        setIsEditingGoal(false)
        try {
            await fetch('/api/users/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 'stats.weeklyGoal': parseInt(newGoal) }),
            })
        } catch (err) {
            console.error('Failed to update goal on backend:', err)
        }
    }

    const getDifficultyClass = (diff) => {
        const d = diff?.toLowerCase()
        if (d === 'easy') return 'bg-success-light text-success'
        if (d === 'medium') return 'bg-warning-light text-warning'
        return 'bg-error-light text-error'
    }

    return (
        <div className="max-w-container mx-auto w-full px-4 py-8 md:px-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* LEFT SIDEBAR (Hidden on mobile, 3 cols on desktop) */}
                <aside className="hidden flex-col gap-6 lg:col-span-3 lg:flex">
                    {/* Quick Stats Card */}
                    <div className="bg-bg-subtle border-border rounded-lg border p-6 shadow-sm">
                        <p className="text-text-muted mb-4 text-xs font-bold tracking-wider uppercase">
                            Your Stats
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-text-primary text-2xl font-bold">
                                    {user?.stats?.globalRank || 'N/A'}
                                </p>
                                <p className="text-text-muted text-[10px] font-medium uppercase">
                                    Global Rank
                                </p>
                            </div>
                            <div>
                                <p className="text-accent text-2xl font-bold">
                                    {user?.stats?.accepted || 0}
                                </p>
                                <p className="text-text-muted text-[10px] font-medium uppercase">
                                    Solved
                                </p>
                            </div>
                        </div>
                        <div className="border-border mt-6 border-t pt-4">
                            <div className="mb-2 flex items-center justify-between text-xs">
                                <span className="text-text-secondary font-medium">Weekly Goal</span>
                                <div className="flex items-center gap-2">
                                    {isEditingGoal ? (
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                value={newGoal}
                                                onChange={(e) => setNewGoal(e.target.value)}
                                                className="bg-bg-muted border-border w-12 rounded border px-1 text-center text-xs font-bold"
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleUpdateGoal}
                                                className="text-success transition-transform hover:scale-110"
                                            >
                                                <Check className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsEditingGoal(false)
                                                    setNewGoal(user?.stats?.weeklyGoal || 10)
                                                }}
                                                className="text-error transition-transform hover:scale-110"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-text-primary font-bold">
                                                {user?.stats?.accepted || 0}/
                                                {user?.stats?.weeklyGoal || 10}
                                            </span>
                                            <button
                                                onClick={() => setIsEditingGoal(true)}
                                                className="text-text-muted hover:text-accent transition-colors"
                                            >
                                                <Edit2 className="h-3 w-3" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="bg-border h-1.5 w-full overflow-hidden rounded-full">
                                <div
                                    className="bg-accent h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${Math.min(100, ((user?.stats?.accepted || 0) / (user?.stats?.weeklyGoal || 10)) * 100)}%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Followed Topics */}
                    <div className="flex flex-col gap-3">
                        <p className="text-text-muted px-3 text-xs font-bold tracking-wider uppercase">
                            Followed Topics
                        </p>
                        <div className="flex flex-wrap gap-2 px-3">
                            {['#algorithms', '#react', '#system_design', '#python'].map((tag) => (
                                <span
                                    key={tag}
                                    className="bg-bg-muted text-text-secondary hover:text-text-primary cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* MAIN FEED (6 cols on desktop) */}
                <section className="col-span-1 flex flex-col gap-6 lg:col-span-6">
                    <RecommendedProblems key="rec-problems" />

                    {loading ? (
                        <div
                            key="feed-loading"
                            className="bg-bg-subtle border-border rounded-lg border p-8 text-center shadow-sm"
                        >
                            <div className="animate-pulse space-y-4">
                                <div className="bg-bg-muted mx-auto h-10 w-10 rounded-full"></div>
                                <div className="bg-bg-muted mx-auto h-4 w-32 rounded"></div>
                                <div className="bg-bg-muted mx-auto h-4 w-48 rounded"></div>
                            </div>
                        </div>
                    ) : feed?.length > 0 ? (
                        feed.map((item) => {
                            const diff = item.problem?.difficulty || 'easy'
                            const diffClass = getDifficultyClass(diff)
                            const formattedTime = formatDistanceToNow(new Date(item.createdAt), {
                                addSuffix: true,
                            })

                            return (
                                <div
                                    key={item._id}
                                    className="bg-bg-subtle border-border duration-normal rounded-lg border p-6 shadow-sm transition-shadow hover:shadow"
                                >
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <Link href={`/profile/${item.user._id}`}>
                                                <Avatar className="border-border hover:border-accent h-10 w-10 border transition-colors">
                                                    <AvatarImage
                                                        src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${item.user.avatarSeed || item.user.name}`}
                                                    />
                                                    <AvatarFallback className="bg-bg-muted text-text-primary text-xs font-bold">
                                                        {(item.user.name || 'U')
                                                            .substring(0, 2)
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </Link>
                                            <div>
                                                <p className="text-sm">
                                                    <Link
                                                        href={`/profile/${item.user._id}`}
                                                        className="text-text-primary hover:text-accent font-bold transition-colors"
                                                    >
                                                        {item.user.name}
                                                    </Link>
                                                    <span className="text-text-secondary ml-1 font-normal">
                                                        solved
                                                    </span>
                                                    <Link
                                                        href={`/problems/${item.problem._id}`}
                                                        className="text-accent ml-1 font-semibold hover:underline"
                                                    >
                                                        {item.problem.title}
                                                    </Link>
                                                </p>
                                                <p className="text-text-muted mt-0.5 text-xs">
                                                    {formattedTime}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${diffClass}`}
                                        >
                                            {diff}
                                        </span>
                                    </div>
                                    <div className="mt-5 flex items-center gap-3">
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="h-8 text-xs font-semibold"
                                        >
                                            <span>Congratulate</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="bg-bg-page border-border text-text-secondary hover:bg-bg-muted hover:text-text-primary h-8 text-xs font-semibold"
                                        >
                                            <MessageCircle className="mr-1.5 h-3 w-3" />
                                            Discuss
                                        </Button>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div
                            key="feed-empty"
                            className="bg-bg-subtle border-border rounded-lg border p-12 text-center shadow-sm"
                        >
                            <Rss className="text-text-muted mx-auto mb-4 h-12 w-12 opacity-50" />
                            <h3 className="text-text-primary mb-2 text-lg font-semibold">
                                Your feed is quiet
                            </h3>
                            <p className="text-text-secondary mx-auto mb-6 max-w-sm text-sm">
                                Follow other coders on the leaderboard to see their recent
                                problem-solving activity here.
                            </p>
                            <Link href="/leaderboard">
                                <Button variant="default">Explore Leaderboard</Button>
                            </Link>
                        </div>
                    )}
                </section>

                {/* RIGHT SIDEBAR (Hidden on mobile, 3 cols on desktop) */}
                <aside className="hidden flex-col gap-6 lg:col-span-3 lg:flex">
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
                                            {prob.totalSubmissions?.toLocaleString() || 0}{' '}
                                            submissions
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
                                    <div
                                        key={sugg._id}
                                        className="flex items-center justify-between"
                                    >
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
                                            variant="outline"
                                            size="sm"
                                            className="bg-accent-light text-accent-text hover:bg-accent ml-2 h-6 shrink-0 border-none px-3 text-[10px] font-bold transition-colors hover:text-white"
                                        >
                                            <UserPlus className="mt-[-1px] mr-1 h-3 w-3" />
                                            Follow
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
                                    <div
                                        key={topUser._id}
                                        className="flex items-center justify-between"
                                    >
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
            </div>
        </div>
    )
}
