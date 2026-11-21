'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Rss, Flame, Zap, Loader2, TrendingUp, Trophy, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import DailyPicks from './DailyPicks'
import FeedItem from './FeedItem'
import FeedItemModal from './FeedItemModal'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import QuickStatsCard from './QuickStatsCard'
import FollowedTopics from './FollowedTopics'
import SuggestedUsers from './SuggestedUsers'
import TrendingProblems from './TrendingProblems'
import UpcomingContests from './UpcomingContests'
import TopContributors from './TopContributors'
import { useUserFeed } from '@/hooks/useUserFeed'
import { useDashboardSidebar } from '@/hooks/useDashboardSidebar'

function getDifficultyClass(diff) {
    const d = diff?.toLowerCase()
    if (d === 'easy') return 'bg-success-light text-success'
    if (d === 'medium') return 'bg-warning-light text-warning'
    return 'bg-error-light text-error'
}

export default function DashboardHome({ user: initialUser }) {
    const { user: contextUser, updateProfile } = useAuth()
    const user = contextUser || initialUser

    const { feed, isLoading: feedLoading, mutate: mutateFeed } = useUserFeed()
    const { sidebarData, isLoading: sidebarLoading, mutate: mutateSidebar } = useDashboardSidebar()

    const [loading, setLoading] = useState(false)
    const [followLoading, setFollowLoading] = useState({})
    const [isPostModalOpen, setIsPostModalOpen] = useState(false)
    const [postContent, setPostContent] = useState('')
    const [isPosting, setIsPosting] = useState(false)
    const [selectedFeedItem, setSelectedFeedItem] = useState(null)
    const [isFeedItemModalOpen, setIsFeedItemModalOpen] = useState(false)
    const [modalCommentsOpen, setModalCommentsOpen] = useState(false)

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
                // Revalidate feed to show the new post
                await mutateFeed()
                setPostContent('')
                setIsPostModalOpen(false)
            }
        } catch (error) {
            console.error('Failed to create post:', error)
        } finally {
            setIsPosting(false)
        }
    }

    const handleUpdateGoal = useCallback(
        async (newGoalValue) => {
            updateProfile({ stats: { ...user.stats, weeklyGoal: newGoalValue } })
            try {
                await fetch('/api/users/profile', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 'stats.weeklyGoal': newGoalValue }),
                })
            } catch (err) {
                console.error('Failed to update goal on backend:', err)
            }
        },
        [updateProfile, user?.stats]
    )

    const handleFollow = useCallback(
        async (userId) => {
            if (followLoading[userId]) return

            setFollowLoading((prev) => ({ ...prev, [userId]: true }))
            try {
                const res = await fetch(`/api/users/${userId}/follow`, {
                    method: 'POST',
                })
                const data = await res.json()

                if (!data.success) {
                    throw new Error(data.message || 'Failed to follow')
                }

                const isFollowing = data.data?.following !== false

                // Revalidate sidebar data to reflect follow status
                await mutateSidebar()

                // Re-fetch user data to get updated following count
                if (updateProfile && user) {
                    try {
                        const res = await fetch('/api/users/me')
                        const userData = await res.json()
                        if (userData.success) {
                            updateProfile(userData.data)
                        }
                    } catch (err) {
                        console.error('Failed to sync user:', err)
                    }
                }
            } catch (error) {
                console.error('Failed to follow user:', error)
                throw error // Re-throw so optimistic UI can catch and revert
            } finally {
                setFollowLoading((prev) => ({ ...prev, [userId]: false }))
            }
        },
        [followLoading, updateProfile, user, mutateSidebar]
    )

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

        // Update SWR cached feed immutably using mutate
        mutateFeed(
            (prev) => {
                // `prev` is the raw fetcher response (e.g. { success: true, data: [...] })
                const arr =
                    prev?.success && Array.isArray(prev.data)
                        ? prev.data
                        : Array.isArray(prev)
                          ? prev
                          : null
                if (!arr) return prev

                const updated = arr.map((entry) => {
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

                if (prev && prev.success) {
                    return { ...prev, data: updated }
                }
                return updated
            },
            { revalidate: false }
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
                    <QuickStatsCard user={user} onUpdateGoal={handleUpdateGoal} />
                    <FollowedTopics />
                    <div className="bg-bg-subtle border-border rounded-lg border p-6 shadow-sm">
                        <h4 className="text-text-primary mb-4 font-semibold">Suggested for you</h4>
                        {sidebarLoading ? (
                            <div className="animate-pulse space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-bg-muted h-10 rounded"></div>
                                ))}
                            </div>
                        ) : (
                            <SuggestedUsers
                                users={sidebarData.suggestedUsers}
                                onFollow={handleFollow}
                            />
                        )}
                    </div>
                </aside>

                {/* MAIN FEED (6 cols on desktop) */}
                <section className="no-scrollbar col-span-1 flex h-[calc(100vh-5rem)] flex-col gap-6 overflow-y-auto px-1 pt-8 pb-8 lg:col-span-6">
                    {/* Mobile Only: Progress/Streak Banner */}
                    <div className="from-accent/10 to-bg-subtle border-accent/20 rounded-lg border bg-linear-to-r p-4 shadow-sm lg:hidden">
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

                    {feedLoading ? (
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
                                onStatsChange={handleFeedItemStatsChange}
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
                    <div className="bg-bg-subtle border-border rounded-lg border p-6 shadow-sm">
                        <h4 className="text-text-primary mb-4 flex items-center gap-2 font-semibold">
                            <TrendingUp className="text-accent h-5 w-5" /> Trending Problems
                        </h4>
                        {sidebarLoading ? (
                            <div className="animate-pulse space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-bg-muted h-8 rounded"></div>
                                ))}
                            </div>
                        ) : (
                            <TrendingProblems
                                problems={sidebarData.trendingProblems}
                                getDifficultyClass={getDifficultyClass}
                            />
                        )}
                    </div>

                    <div className="bg-bg-subtle border-border rounded-lg border p-6 shadow-sm">
                        <h4 className="text-text-primary mb-4 font-semibold">Upcoming Contests</h4>
                        {sidebarLoading ? (
                            <div className="animate-pulse space-y-3">
                                {[1, 2].map((i) => (
                                    <div key={i} className="bg-bg-muted h-12 rounded"></div>
                                ))}
                            </div>
                        ) : (
                            <UpcomingContests contests={sidebarData.upcomingContests} />
                        )}
                    </div>

                    <div className="bg-bg-subtle border-border rounded-lg border p-6 shadow-sm">
                        <h4 className="text-text-primary mb-4 flex items-center gap-2 font-semibold">
                            <Award className="text-warning h-5 w-5" /> Top Contributors
                        </h4>
                        {sidebarLoading ? (
                            <div className="animate-pulse space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-bg-muted h-8 rounded"></div>
                                ))}
                            </div>
                        ) : (
                            <TopContributors contributors={sidebarData.topContributors} />
                        )}
                    </div>
                </aside>
            </div>

            {/* Post Creation Modal */}
            {isPostModalOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
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
                                className="bg-bg-page border-border text-text-primary focus:border-accent focus:ring-accent min-h-37.5 w-full resize-none rounded-lg border p-3 text-sm outline-none focus:ring-1"
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
