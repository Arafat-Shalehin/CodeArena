'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
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
import DashboardLeftSidebar from './DashboardLeftSidebar'
import DashboardRightSidebar from './DashboardRightSidebar'
import CreatePostModal from './CreatePostModal'
import FeedItemModal from './FeedItemModal'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

export default function DashboardHome({ user: initialUser }) {
    const { user: contextUser, updateProfile } = useAuth()
    const user = contextUser || initialUser
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

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
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const [nextCursor, setNextCursor] = useState(null)
    const [postContent, setPostContent] = useState('')
    const [isPosting, setIsPosting] = useState(false)
    const [selectedFeedItem, setSelectedFeedItem] = useState(null)
    const [isFeedItemModalOpen, setIsFeedItemModalOpen] = useState(false)
    const [modalCommentsOpen, setModalCommentsOpen] = useState(false)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [feedRes, sidebarRes] = await Promise.all([
                    fetch('/api/users/feed?limit=15'),
                    fetch('/api/feed/sidebar'),
                ])

                const feedData = await feedRes.json()
                const sidebarObj = await sidebarRes.json()

                if (feedData.success) {
                    setFeed(feedData.data)
                    setHasMore(feedData.pagination?.hasMore || false)
                    setNextCursor(feedData.pagination?.nextCursor || null)
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

    const handleLoadMore = async () => {
        if (loadingMore || !hasMore || !nextCursor) return
        setLoadingMore(true)
        try {
            const res = await fetch(
                `/api/users/feed?limit=15&cursor=${encodeURIComponent(nextCursor)}`
            )
            const data = await res.json()
            if (data.success) {
                setFeed((prev) => [...prev, ...data.data])
                setHasMore(data.pagination?.hasMore || false)
                setNextCursor(data.pagination?.nextCursor || null)
            }
        } catch (err) {
            console.error('Failed to load more feed items:', err)
        } finally {
            setLoadingMore(false)
        }
    }

    const updateFeedModalQuery = useCallback(
        (item = null, focus = '') => {
            const params = new URLSearchParams(searchParams.toString())

            params.delete('postId')
            params.delete('focus')

            if (item?.type === 'post') {
                params.set('postId', item.id || item._id)
                if (focus) params.set('focus', focus)
            }

            const query = params.toString()
            router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
        },
        [pathname, router, searchParams]
    )

    const handleOpenFeedItemModal = useCallback(
        (item, options = {}) => {
            setSelectedFeedItem(item)
            setModalCommentsOpen(Boolean(options.focusComments))
            setIsFeedItemModalOpen(true)
            updateFeedModalQuery(item, options.focusComments ? 'comments' : '')
        },
        [updateFeedModalQuery]
    )

    const handleCloseFeedItemModal = useCallback(() => {
        setIsFeedItemModalOpen(false)
        setSelectedFeedItem(null)
        setModalCommentsOpen(false)
        updateFeedModalQuery(null)
    }, [updateFeedModalQuery])

    const handleFeedItemStatsChange = useCallback((itemId, patch) => {
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
                ...(patch.commentCount !== undefined
                    ? { commentCount: patch.commentCount }
                    : {}),
            }
        })
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

    useEffect(() => {
        const postId = searchParams.get('postId')
        const focus = searchParams.get('focus')

        if (!postId || loading) return

        const existingPost = feed.find(
            (item) => item.type === 'post' && String(item.id || item._id) === String(postId)
        )

        if (existingPost) {
            setSelectedFeedItem(existingPost)
            setModalCommentsOpen(focus === 'comments')
            setIsFeedItemModalOpen(true)
            return
        }

        let cancelled = false

        const fetchPost = async () => {
            try {
                const res = await fetch(`/api/posts/${postId}`)
                const data = await res.json()

                if (!cancelled && data.success) {
                    setSelectedFeedItem(data.data)
                    setModalCommentsOpen(focus === 'comments')
                    setIsFeedItemModalOpen(true)
                }
            } catch (error) {
                console.error('Failed to fetch post detail for modal:', error)
            }
        }

        fetchPost()

        return () => {
            cancelled = true
        }
    }, [feed, loading, searchParams])

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
                <DashboardLeftSidebar
                    user={user}
                    isEditingGoal={isEditingGoal}
                    setIsEditingGoal={setIsEditingGoal}
                    newGoal={newGoal}
                    setNewGoal={setNewGoal}
                    handleUpdateGoal={handleUpdateGoal}
                />

                {/* MAIN FEED (6 cols on desktop) */}
                <section className="col-span-1 flex flex-col gap-6 px-1 pt-8 pb-8 lg:col-span-6">
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

                    <RecommendedProblems key="rec-problems" />

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
                        <>
                            {feed.map((item) => (
                                <FeedItem
                                    key={item._id}
                                    item={item}
                                    getDifficultyClass={getDifficultyClass}
                                    onOpenDetail={handleOpenFeedItemModal}
                                />
                            ))}
                            {hasMore && (
                                <div className="flex justify-center pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="border-border text-text-secondary hover:text-text-primary px-8 font-semibold"
                                    >
                                        {loadingMore ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            'Load More'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </>
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

                <DashboardRightSidebar
                    sidebarData={sidebarData}
                    loading={loading}
                    followLoading={followLoading}
                    handleFollow={handleFollow}
                    getDifficultyClass={getDifficultyClass}
                />
            </div>

            <CreatePostModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                user={user}
                postContent={postContent}
                setPostContent={setPostContent}
                isPosting={isPosting}
                handleCreatePost={handleCreatePost}
            />

            <FeedItemModal
                isOpen={isFeedItemModalOpen}
                onClose={handleCloseFeedItemModal}
                item={selectedFeedItem}
                getDifficultyClass={getDifficultyClass}
                onStatsChange={handleFeedItemStatsChange}
                initialShowComments={modalCommentsOpen}
            />
        </div>
    )
}
