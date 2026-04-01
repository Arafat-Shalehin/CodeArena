'use client'

import { useCallback, useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { X, MessageCircle, Flame, Sparkles, Send, Loader2, FileCode2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import confetti from 'canvas-confetti'

function CommentSkeleton() {
    return (
        <div className="flex gap-2.5">
            <div className="bg-bg-muted h-8 w-8 shrink-0 animate-pulse rounded-full" />
            <div className="bg-bg-subtle border-border min-w-0 flex-1 rounded-2xl border px-3 py-2">
                <div className="mb-1 flex items-center gap-2">
                    <div className="bg-bg-muted h-3 w-20 animate-pulse rounded" />
                    <div className="bg-bg-muted h-2.5 w-16 animate-pulse rounded" />
                </div>
                <div className="space-y-1.5">
                    <div className="bg-bg-muted h-2.5 w-[92%] animate-pulse rounded" />
                    <div className="bg-bg-muted h-2.5 w-[70%] animate-pulse rounded" />
                </div>
            </div>
        </div>
    )
}

export default function FeedItemModal({
    isOpen,
    onClose,
    item,
    getDifficultyClass,
    onStatsChange,
    initialShowComments = false,
}) {
    const [showComments, setShowComments] = useState(initialShowComments)
    const [comments, setComments] = useState([])
    const [commentsLoading, setCommentsLoading] = useState(false)
    const [commentsLoadingMore, setCommentsLoadingMore] = useState(false)
    const [commentsFetched, setCommentsFetched] = useState(false)
    const [commentsHasMore, setCommentsHasMore] = useState(false)
    const [commentsNextCursor, setCommentsNextCursor] = useState(null)
    const [postingComment, setPostingComment] = useState(false)
    const [commentText, setCommentText] = useState('')
    const [commentCount, setCommentCount] = useState(item?.commentCount || 0)
    const [congratulated, setCongratulated] = useState(item?.hasLiked || false)
    const [likeCount, setLikeCount] = useState(item?.likes || 0)
    const [isReacting, setIsReacting] = useState(false)

    useEffect(() => {
        setShowComments(initialShowComments)
    }, [initialShowComments, item?._id, item?.id])

    useEffect(() => {
        setCommentCount(item?.commentCount || 0)
        setCongratulated(item?.hasLiked || false)
        setLikeCount(item?.likes || 0)
        setComments([])
        setCommentsFetched(false)
        setCommentsHasMore(false)
        setCommentsNextCursor(null)
        setCommentText('')
    }, [item?._id, item?.id, item?.commentCount, item?.hasLiked, item?.likes])

    const isPost = item?.type === 'post'
    const COMMENT_PAGE_SIZE = 20

    const fetchComments = useCallback(
        async ({ reset = false } = {}) => {
            if (!item) return
            if (reset ? commentsLoading : commentsLoadingMore) return

            if (reset) {
                setCommentsLoading(true)
            } else {
                setCommentsLoadingMore(true)
            }

            try {
                const endpoint = isPost
                    ? `/api/posts/${item.id || item._id}/comments`
                    : `/api/submissions/${item.id || item._id}/comments`
                const params = new URLSearchParams({ limit: String(COMMENT_PAGE_SIZE) })
                if (!reset && commentsNextCursor) {
                    params.set('cursor', commentsNextCursor)
                }

                const res = await fetch(`${endpoint}?${params.toString()}`)
                const data = await res.json()
                if (data.success) {
                    const nextChunk = data.data || []
                    let nextCount = data.totalCount ?? 0
                    setComments((prev) => {
                        const nextComments = reset ? nextChunk : [...prev, ...nextChunk]
                        nextCount = data.totalCount ?? nextComments.length
                        return nextComments
                    })
                    setCommentsHasMore(Boolean(data.pagination?.hasMore))
                    setCommentsNextCursor(data.pagination?.nextCursor || null)
                    setCommentsFetched(true)
                    setCommentCount(nextCount)
                    onStatsChange?.(item.id || item._id, { commentCount: nextCount })
                }
            } catch (err) {
                console.error('Failed to fetch comments:', err)
            } finally {
                if (reset) {
                    setCommentsLoading(false)
                } else {
                    setCommentsLoadingMore(false)
                }
            }
        },
        [commentsLoading, commentsLoadingMore, commentsNextCursor, isPost, item, onStatsChange]
    )

    useEffect(() => {
        if (!isOpen || !item) return
        if (!showComments) setShowComments(true)
        if (!commentsFetched && !commentsLoading) {
            fetchComments({ reset: true })
        }
    }, [isOpen, item, showComments, commentsFetched, commentsLoading, fetchComments])

    const handleToggleComments = async () => {
        const next = !showComments
        setShowComments(next)
        if (next && !commentsFetched) {
            await fetchComments({ reset: true })
        }
    }

    const handleLoadMoreComments = async () => {
        if (!commentsHasMore || !commentsNextCursor || commentsLoadingMore) return
        await fetchComments({ reset: false })
    }

    const handleReact = async (e) => {
        e?.stopPropagation?.()
        if (!item || isReacting) return

        const wasCongratulated = congratulated
        setCongratulated(!wasCongratulated)
        setLikeCount((prev) => (wasCongratulated ? prev - 1 : prev + 1))
        setIsReacting(true)

        if (!wasCongratulated) {
            const rect = e?.currentTarget?.getBoundingClientRect?.()
            const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5
            const y = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.5
            confetti({
                particleCount: 45,
                spread: 55,
                origin: { x, y },
                colors: ['#00C853', '#FFFFFF', '#FFD700', '#FF5722'],
                disableForReducedMotion: true,
                zIndex: 100,
            })
        }

        try {
            const endpoint = isPost
                ? `/api/posts/${item.id || item._id}/like`
                : `/api/submissions/${item.id || item._id}/congratulate`

            const res = await fetch(endpoint, { method: 'POST' })
            const data = await res.json()

            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Failed to toggle reaction')
            }

            setLikeCount(data.likes)
            const nextCongratulated = data.action === 'liked' || data.action === 'congratulated'
            setCongratulated(nextCongratulated)
            onStatsChange?.(item.id || item._id, {
                likes: data.likes,
                hasLiked: nextCongratulated,
            })
        } catch (error) {
            console.error('Error reacting:', error)
            setCongratulated(wasCongratulated)
            setLikeCount((prev) => (wasCongratulated ? prev + 1 : prev - 1))
        } finally {
            setIsReacting(false)
        }
    }

    const handleSubmitComment = async () => {
        if (!item || !commentText.trim() || postingComment) return
        setPostingComment(true)

        try {
            const endpoint = isPost
                ? `/api/posts/${item.id || item._id}/comments`
                : `/api/submissions/${item.id || item._id}/comments`

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: commentText.trim() }),
            })
            const data = await res.json()
            if (data.success) {
                let nextCount = data.commentCount ?? 0
                setComments((prev) => {
                    const nextComments = [data.data, ...prev]
                    nextCount = data.commentCount ?? nextComments.length
                    return nextComments
                })
                setCommentCount(nextCount)
                onStatsChange?.(item.id || item._id, {
                    commentCount: nextCount,
                })
                setCommentText('')
            }
        } catch (err) {
            console.error('Failed to post comment:', err)
        } finally {
            setPostingComment(false)
        }
    }

    if (!item) return null

    const formattedTime = formatDistanceToNow(new Date(item.createdAt || Date.now()), {
        addSuffix: true,
    })

    const modalTitle = isPost ? `${item.user?.name || 'User'}'s Post` : `Solution Discussion`

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={false}
                data-lenis-prevent
                className="w-[min(98vw,1320px)] max-w-none gap-0! border-none bg-transparent p-0 shadow-none"
            >
                <DialogTitle className="sr-only">{modalTitle}</DialogTitle>
                <div className="bg-bg-page border-border text-text-primary mx-auto flex h-[86vh] w-full max-w-262.5 flex-col overflow-hidden rounded-3xl border shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                    <div className="border-border flex items-center justify-between border-b px-4 py-3 sm:px-6">
                        <div className="w-10" />
                        <h2 className="truncate text-center text-xl font-bold">{modalTitle}</h2>
                        <button
                            onClick={onClose}
                            className="bg-bg-muted text-text-secondary hover:bg-bg-subtle hover:text-text-primary flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div
                        data-lenis-prevent
                        className="custom-scrollbar flex-1 overflow-y-auto px-4 py-5 sm:px-6"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <Avatar className="border-border h-11 w-11 border">
                                <AvatarImage
                                    src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${item.user?.avatarSeed || item.user?.name || 'User'}`}
                                />
                                <AvatarFallback className="bg-bg-muted text-text-primary text-xs font-bold">
                                    {(item.user?.name || 'U').substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="text-text-primary truncate text-base font-bold">
                                    {item.user?.name || 'Unknown User'}
                                </p>
                                <p className="text-text-muted text-sm">{formattedTime}</p>
                            </div>
                            {!isPost && (
                                <span className="bg-success-light text-success-text ml-auto inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase">
                                    {item.problem?.difficulty || 'easy'}
                                </span>
                            )}
                        </div>

                        <div className="bg-bg-subtle border-border mb-4 rounded-2xl border p-4">
                            {isPost ? (
                                <p className="text-text-primary text-[17px] leading-relaxed whitespace-pre-wrap">
                                    {item.content}
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-text-secondary text-base leading-relaxed italic">
                                        "Great solve!"
                                    </p>
                                    <div className="text-text-muted flex items-center gap-2 text-sm">
                                        <FileCode2 className="h-4 w-4" />
                                        <span>{item.language || 'javascript'}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="text-text-secondary border-border mb-3 flex items-center justify-between border-b pb-3 text-sm">
                            <span>{likeCount} reactions</span>
                            <span>{commentCount} comments</span>
                        </div>

                        <div className="mb-4 grid grid-cols-2 gap-3">
                            <Button
                                variant={congratulated ? 'ghost' : 'default'}
                                size="sm"
                                onClick={handleReact}
                                disabled={isReacting}
                                className={cn(
                                    'h-10 text-sm font-semibold',
                                    congratulated
                                        ? 'border-border bg-bg-subtle text-text-primary hover:bg-bg-muted border'
                                        : 'bg-accent hover:bg-accent-hover text-white'
                                )}
                            >
                                {congratulated ? (
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4" /> Congratulated
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Flame className="h-4 w-4" /> Congratulate
                                    </span>
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleToggleComments}
                                className="border-border text-text-secondary hover:bg-bg-subtle hover:text-text-primary h-10 bg-transparent text-sm font-semibold"
                            >
                                <MessageCircle className="mr-2 h-4 w-4" /> Comment
                            </Button>
                        </div>

                        {showComments && (
                            <div className="pb-3">
                                {commentsLoading ? (
                                    <div className="space-y-3">
                                        <CommentSkeleton />
                                        <CommentSkeleton />
                                        <CommentSkeleton />
                                    </div>
                                ) : comments.length === 0 ? (
                                    <p className="text-text-muted py-3 text-center text-sm">
                                        No comments yet. Be the first!
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {comments.map((comment, idx) => (
                                            <div key={comment._id || idx} className="flex gap-2.5">
                                                <Avatar className="h-8 w-8 shrink-0">
                                                    <AvatarImage
                                                        src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${comment.userId?.avatarSeed || comment.userId?.name || 'U'}`}
                                                    />
                                                    <AvatarFallback className="bg-bg-muted text-text-secondary text-[9px]">
                                                        {(comment.userId?.name || 'U')
                                                            .substring(0, 1)
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="bg-bg-subtle border-border min-w-0 flex-1 rounded-2xl border px-3 py-2">
                                                    <div className="mb-0.5 flex items-center gap-2">
                                                        <span className="text-text-primary text-xs font-bold">
                                                            {comment.userId?.name || 'User'}
                                                        </span>
                                                        <span className="text-text-muted text-[10px]">
                                                            {comment.createdAt
                                                                ? formatDistanceToNow(
                                                                      new Date(comment.createdAt),
                                                                      {
                                                                          addSuffix: true,
                                                                      }
                                                                  )
                                                                : ''}
                                                        </span>
                                                    </div>
                                                    <p className="text-text-secondary text-sm leading-relaxed">
                                                        {comment.text}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {commentsHasMore && (
                                            <button
                                                onClick={handleLoadMoreComments}
                                                disabled={commentsLoadingMore}
                                                className="text-accent hover:bg-bg-subtle border-border mt-1 inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {commentsLoadingMore ? (
                                                    <>
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    'Load more comments'
                                                )}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-bg-page border-border border-t px-4 py-3 sm:px-6">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                                placeholder="Write a comment..."
                                className="bg-bg-subtle border-border text-text-primary placeholder:text-text-muted focus:border-accent h-11 flex-1 rounded-full border px-4 text-sm transition-colors outline-none"
                            />
                            <button
                                onClick={handleSubmitComment}
                                disabled={!commentText.trim() || postingComment}
                                className="bg-accent hover:bg-accent-hover flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {postingComment ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
