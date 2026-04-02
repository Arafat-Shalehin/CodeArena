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
    UserCheck,
    Calendar,
    Award,
    Edit2,
    Check,
    X,
    Flame,
    Zap,
    Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { formatDistanceToNow, format } from 'date-fns'
import DailyPicks from './DailyPicks'
import RecommendedProblems from '@/features/profile/components/RecommendedProblems'
import FeedItem from './FeedItem'
import FeedItemModal from './FeedItemModal'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

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
    const [followLoading, setFollowLoading] = useState({})
    const [isPostModalOpen, setIsPostModalOpen] = useState(false)
    const [postContent, setPostContent] = useState('')
    const [isPosting, setIsPosting] = useState(false)
    const [selectedFeedItem, setSelectedFeedItem] = useState(null)
    const [isFeedItemModalOpen, setIsFeedItemModalOpen] = useState(false)
    const [modalCommentsOpen, setModalCommentsOpen] = useState(false)

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

    const handleCreatePost = async () => {
        if (!postContent.trim() || isPosting) return
        setIsPosting(true)
        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: postContent }),
            })
            const data = await res.json()
            if (data.success) {
                // Add the new post to the top of the feed
                // The API returns a populated post
                const newPost = {
                    ...data.data,
                    type: 'post',
                    id: data.data._id,
                    user: {
                        _id: data.data.userId._id,
                        name: data.data.userId.name,
                        avatarSeed: data.data.userId.avatarSeed,
                    },
                    likes: 0,
                    hasLiked: false,
                }
                setFeed([newPost, ...feed])
                setPostContent('')
                setIsPostModalOpen(false)
            }
        } catch (error) {
            console.error('Failed to create post:', error)
        } finally {
            setIsPosting(false)
        }
    }

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

    const handleFollow = async (userId) => {
        if (followLoading[userId]) return

        setFollowLoading((prev) => ({ ...prev, [userId]: true }))
        try {
            const res = await fetch(`/api/users/${userId}/follow`, {
                method: 'POST',
            })
            const data = await res.json()

            if (data.success) {
                // Update local sidebar data to reflect follow status
                setSidebarData((prev) => ({
                    ...prev,
                    suggestedUsers: prev.suggestedUsers.map((u) =>
                        u._id === userId ? { ...u, isFollowing: true } : u
                    ),
                }))
                // Update global auth context
                if (updateProfile && user) {
                    const currentFollowing = user.following || []
                    updateProfile({ following: [...currentFollowing, userId] })
                }
            }
        } catch (error) {
            console.error('Failed to follow user:', error)
        } finally {
            setFollowLoading((prev) => ({ ...prev, [userId]: false }))
        }
    }

    const getDifficultyClass = (diff) => {
        const d = diff?.toLowerCase()
        if (d === 'easy') return 'bg-success-light text-success'
        if (d === 'medium') return 'bg-warning-light text-warning'
        return 'bg-error-light text-error'
    }

    const handleOpenFeedItemModal = (item, options = {}) => {
        setSelectedFeedItem(item)
        setModalCommentsOpen(Boolean(options.focusComments))
        setIsFeedItemModalOpen(true)
    }

    const handleCloseFeedItemModal = () => {
        setIsFeedItemModalOpen(false)
        setSelectedFeedItem(null)
        setModalCommentsOpen(false)
    }

    const handleFeedItemStatsChange = (itemId, patch) => {
        if (!itemId || !patch) return

        setFeed((prev) =>
            prev.map((entry) => {
                const currentId = String(entry.id || entry._id)
                if (currentId !== String(itemId)) return entry

                return {
                    ...entry,
                    ...(patch.likes !== undefined ? { likes: patch.likes } : {}),
                    ...(patch.hasLiked !== undefined ? { hasLiked: patch.hasLiked } : {}),
                    ...(patch.commentCount !== undefined
                        ? { commentCount: patch.commentCount }
                        : {}),
                }
            })
        )

        setSelectedFeedItem((prev) => {
            if (!prev) return prev
            const currentId = String(prev.id || prev._id)
            if (currentId !== String(itemId)) return prev

            return {
                ...prev,
                ...(patch.likes !== undefined ? { likes: patch.likes } : {}),
                ...(patch.hasLiked !== undefined ? { hasLiked: patch.hasLiked } : {}),
                ...(patch.commentCount !== undefined ? { commentCount: patch.commentCount } : {}),
            }
        })
    }

    return (
        <div className="max-w-container mx-auto w-full px-4 pb-8 md:px-6">
            <div
                className={cn(
                    'grid grid-cols-1 gap-6 transition-all duration-300 lg:grid-cols-12',
                    isPostModalOpen || (isFeedItemModalOpen && selectedFeedItem)
                        ? 'pointer-events-none opacity-60 blur-[2px]'
                        : ''
                )}
            >
                {/* LEFT SIDEBAR (Hidden on mobile, 3 cols on desktop) */}
                <aside className="no-scrollbar hidden h-[calc(100vh-5rem)] flex-col gap-6 overflow-y-auto pt-8 pr-1 pb-8 lg:col-span-3 lg:flex">
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

                    {/* Suggested For You — moved from right sidebar */}
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
                                                    {sugg.country || 'Global'}{' '}
                                                    {sugg.stats?.globalRank
                                                        ? `• Rank #${sugg.stats.globalRank}`
                                                        : ''}
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
                                                    ? 'bg-success/10 text-success hover:bg-error/10 hover:text-error'
                                                    : 'bg-accent/10 text-accent hover:bg-accent hover:text-white'
                                            )}
                                        >
                                            {followLoading[sugg._id] ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : sugg.isFollowing ? (
                                                <>
                                                    <UserCheck className="mr-1 h-3 w-3" />
                                                    Following
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus className="mr-1 h-3 w-3" />
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
                </aside>

                {/* MAIN FEED (6 cols on desktop) */}
                <section className="no-scrollbar col-span-1 flex h-[calc(100vh-5rem)] flex-col gap-6 overflow-y-auto px-1 pt-8 pb-8 lg:col-span-6">
                    {/* Mobile Only: Progress/Streak Banner */}
                    <div className="from-accent/10 to-bg-subtle border-accent/20 rounded-lg border bg-gradient-to-r p-4 shadow-sm lg:hidden">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-text-primary flex items-center gap-2 font-bold">
                                <Flame className="text-error fill-error/20 h-4 w-4" />
                                {user?.stats?.accepted || 0} / {user?.stats?.weeklyGoal || 10}{' '}
                                Solved
                            </span>
                            <span className="text-text-muted bg-bg-page border-border rounded border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                                Weekly Goal
                            </span>
                        </div>
                        <div className="bg-bg-page border-border/50 h-1.5 w-full overflow-hidden rounded-full border">
                            <div
                                className="bg-accent h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${Math.min(100, ((user?.stats?.accepted || 0) / (user?.stats?.weeklyGoal || 10)) * 100)}%`,
                                }}
                            ></div>
                        </div>
                        <p className="text-text-secondary mt-3 flex items-center gap-1.5 text-[11px] font-medium italic">
                            <Zap className="text-warning fill-warning/20 h-3 w-3" />
                            {(user?.stats?.accepted || 0) >= (user?.stats?.weeklyGoal || 10)
                                ? 'Goal crushed! You are unstoppable! 🚀'
                                : 'Keep up the momentum! You can do it.'}
                        </p>
                    </div>

                    {/* What's on your mind? Box */}
                    <div className="bg-bg-subtle border-border rounded-lg border p-5 shadow-sm">
                        <div className="flex gap-4">
                            <Avatar className="border-border h-10 w-10 border">
                                <AvatarImage
                                    src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.avatarSeed || user?.name || 'User'}`}
                                />
                                <AvatarFallback className="bg-bg-muted text-accent text-xs font-bold">
                                    {(user?.name || 'U').substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div
                                onClick={() => setIsPostModalOpen(true)}
                                className="bg-bg-page border-border hover:border-accent/40 flex flex-1 cursor-pointer items-center rounded-full border px-5 shadow-inner transition-colors"
                            >
                                <span className="text-text-muted text-sm font-medium">
                                    Share your coding progress or ask for a hint...
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* RecommendedProblems hidden */}
                    {/* <RecommendedProblems key="rec-problems" context="feed" /> */}

                    <DailyPicks />

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
                        feed.map((item) => (
                            <FeedItem
                                key={item._id}
                                item={item}
                                getDifficultyClass={getDifficultyClass}
                                onOpenDetail={handleOpenFeedItemModal}
                            />
                        ))
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
                <aside className="no-scrollbar hidden h-[calc(100vh-5rem)] flex-col gap-6 overflow-y-auto pt-8 pb-8 pl-1 lg:col-span-3 lg:flex">
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

            {/* Post Creation Modal */}
            {isPostModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsPostModalOpen(false)}
                    ></div>
                    <div className="bg-bg-subtle border-border relative w-full max-w-lg rounded-xl border shadow-2xl">
                        <div className="border-border flex items-center justify-between border-b p-4">
                            <h3 className="text-text-primary text-lg font-bold">Create Post</h3>
                            <button
                                onClick={() => setIsPostModalOpen(false)}
                                className="text-text-muted hover:text-text-primary transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="mb-4 flex items-center gap-3">
                                <Avatar className="h-10 w-10 border">
                                    <AvatarImage
                                        src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.avatarSeed || user?.name || 'User'}`}
                                    />
                                </Avatar>
                                <div>
                                    <p className="text-text-primary text-sm font-bold">
                                        {user?.name}
                                    </p>
                                    <p className="text-text-muted text-[11px] font-medium">
                                        Posting to Feed
                                    </p>
                                </div>
                            </div>
                            <textarea
                                className="bg-bg-page border-border text-text-primary focus:border-accent focus:ring-accent min-h-[150px] w-full resize-none rounded-lg border p-3 text-sm outline-none focus:ring-1"
                                placeholder="Share your coding progress or ask for a hint..."
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="border-border flex items-center justify-end border-t p-4">
                            <Button
                                onClick={handleCreatePost}
                                disabled={!postContent.trim() || isPosting}
                                className="px-8 font-bold"
                            >
                                {isPosting ? 'Posting...' : 'Post'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {selectedFeedItem && (
                <FeedItemModal
                    isOpen={isFeedItemModalOpen}
                    onClose={handleCloseFeedItemModal}
                    item={selectedFeedItem}
                    getDifficultyClass={getDifficultyClass}
                    onStatsChange={handleFeedItemStatsChange}
                    initialShowComments={modalCommentsOpen}
                />
            )}
        </div>
    )
}
