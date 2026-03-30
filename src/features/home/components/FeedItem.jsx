'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { MessageCircle, Heart, Zap, Sparkles, Flame, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import confetti from 'canvas-confetti'
import { SiJavascript, SiPython, SiCplusplus } from 'react-icons/si'
import { FaJava } from 'react-icons/fa'
import { cn } from '@/lib/utils'

const LANGUAGE_MAP = {
    javascript: { name: 'JavaScript', color: 'text-yellow-400', icon: SiJavascript },
    python: { name: 'Python', color: 'text-blue-400', icon: SiPython },
    cpp: { name: 'C++', color: 'text-blue-600', icon: SiCplusplus },
    java: { name: 'Java', color: 'text-red-500', icon: FaJava },
}

const getDynamicStory = (item) => {
    const diff = item.problem?.difficulty?.toLowerCase() || 'easy'
    const time = item.executionTime
    const memory = item.memoryUsed
    const isFast = time && time < 50
    const isEfficient = memory && memory < 20000

    let pool = []

    if (diff === 'hard') {
        pool.push(
            'Finally conquered this beast! The grind never stops. 🚀',
            'That was a tricky edge case, but we got there! 🎯'
        )
    } else if (diff === 'medium') {
        pool.push(
            'Solid logic building on this one. Getting stronger! 💪',
            'A nice medium challenge to warm up the brain. 🧠'
        )
    } else {
        pool.push(
            'Quick and easy. Just warming up! 🔥',
            'First try AC! Feeling confident today. 👑'
        )
    }

    if (isFast) {
        pool.push(
            `Beat the clock with a ${time}ms runtime! Speed is power. ⚡`,
            `Super optimized solution running in ${time}ms! 🏎️`
        )
    }
    if (isEfficient) {
        pool.push(
            `Clean code. Only used ${(memory / 1024).toFixed(2)}MB of memory! 🧹`,
            `Optimal space complexity unlocked! 💾`
        )
    }

    const itemId = item._id || item.id || String(Math.random())
    const seed = typeof itemId === 'string' ? itemId.charCodeAt(itemId.length - 1) : 0
    return pool[seed % pool.length]
}

export default function FeedItem({ item, getDifficultyClass }) {
    const [congratulated, setCongratulated] = useState(item.hasLiked || false)
    const [likeCount, setLikeCount] = useState(item.likes || 0)
    const [isLoading, setIsLoading] = useState(false)
    const [showComments, setShowComments] = useState(false)
    const [comments, setComments] = useState([])
    const [commentText, setCommentText] = useState('')
    const [commentsLoading, setCommentsLoading] = useState(false)
    const [postingComment, setPostingComment] = useState(false)
    const [commentCount, setCommentCount] = useState(item.commentCount || 0)

    useEffect(() => {
        setCongratulated(item.hasLiked || false)
        setLikeCount(item.likes || 0)
    }, [item.hasLiked, item.likes])

    const isPost = item.type === 'post'
    const langKey = item.language?.toLowerCase() || 'javascript'
    const language = LANGUAGE_MAP[langKey] || LANGUAGE_MAP.javascript
    const story = !isPost ? getDynamicStory(item) : null

    const diff = !isPost ? item.problem?.difficulty || 'easy' : null
    const diffClass = !isPost ? getDifficultyClass(diff) : ''
    const formattedTime = formatDistanceToNow(new Date(item.createdAt || Date.now()), {
        addSuffix: true,
    })

    const handleCongratulate = useCallback(
        async (e) => {
            if (isLoading) return

            const rect = e.currentTarget.getBoundingClientRect()
            const x = (rect.left + rect.width / 2) / window.innerWidth
            const y = (rect.top + rect.height / 2) / window.innerHeight

            const wasCongratulated = congratulated
            setCongratulated(!wasCongratulated)
            setLikeCount((prev) => (wasCongratulated ? prev - 1 : prev + 1))
            setIsLoading(true)

            if (!wasCongratulated) {
                confetti({
                    particleCount: 50,
                    spread: 60,
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
                    throw new Error(data.message || 'Failed to toggle congratulate')
                }

                setLikeCount(data.likes)
                setCongratulated(data.action === 'liked' || data.action === 'congratulated')
            } catch (error) {
                console.error('Error congratulating:', error)
                setCongratulated(wasCongratulated)
                setLikeCount((prev) => (wasCongratulated ? prev + 1 : prev - 1))
            } finally {
                setIsLoading(false)
            }
        },
        [congratulated, isLoading, item.id, item._id, isPost]
    )

    const handleToggleComments = async () => {
        setShowComments((prev) => !prev)

        if (!showComments && comments.length === 0) {
            setCommentsLoading(true)
            try {
                const endpoint = isPost
                    ? `/api/posts/${item.id || item._id}/comments`
                    : `/api/submissions/${item.id || item._id}/comments`
                const res = await fetch(endpoint)
                const data = await res.json()
                if (data.success) {
                    setComments(data.data || [])
                }
            } catch (err) {
                console.error('Failed to fetch comments:', err)
            } finally {
                setCommentsLoading(false)
            }
        }
    }

    const handleSubmitComment = async () => {
        if (!commentText.trim() || postingComment) return
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
                // Use the populated comment data from API
                setComments((prev) => [data.data, ...prev])
                // Use the actual commentCount from API response
                setCommentCount(data.commentCount ?? commentCount + 1)
                setCommentText('')
            }
        } catch (err) {
            console.error('Failed to post comment:', err)
        } finally {
            setPostingComment(false)
        }
    }

    return (
        <div className="bg-bg-subtle border-border duration-normal rounded-lg border p-6 shadow-sm transition-shadow hover:shadow">
            <div
                className={`mb-4 flex items-start justify-between ${isPost ? 'items-center' : ''}`}
            >
                <div className="flex items-center gap-3">
                    <Link href={`/profile/${item.user?._id || ''}`}>
                        <Avatar className="border-border hover:border-accent h-10 w-10 border transition-colors">
                            <AvatarImage
                                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${item.user?.avatarSeed || item.user?.name || 'User'}`}
                            />
                            <AvatarFallback className="bg-bg-muted text-text-primary text-xs font-bold">
                                {(item.user?.name || 'U').substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                    <div>
                        <p className="text-sm">
                            <Link
                                href={`/profile/${item.user?._id || ''}`}
                                className="text-text-primary hover:text-accent font-bold transition-colors"
                            >
                                {item.user?.name || 'Unknown User'}
                            </Link>
                            {!isPost && (
                                <>
                                    <span className="text-text-secondary ml-1 font-normal">
                                        solved
                                    </span>
                                    <Link
                                        href={`/problems/${item.problem?._id || ''}`}
                                        className="text-accent ml-1 font-semibold hover:underline"
                                    >
                                        {item.problem?.title || 'Unknown Problem'}
                                    </Link>
                                </>
                            )}
                        </p>
                        <p className="text-text-muted mt-0.5 flex items-center gap-2 text-xs">
                            <span>{formattedTime}</span>
                            {!isPost && (
                                <>
                                    <span>•</span>
                                    <span
                                        className={`flex items-center gap-1 font-semibold ${language.color}`}
                                    >
                                        <language.icon className="h-3.5 w-3.5" /> {language.name}
                                    </span>
                                </>
                            )}
                        </p>
                    </div>
                </div>
                {!isPost && (
                    <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${diffClass}`}
                    >
                        {diff}
                    </span>
                )}
            </div>

            {/* Story/Content */}
            <div
                className={`bg-bg-page border-border mb-5 rounded-md border p-3 ${isPost ? 'border-none bg-transparent !p-0' : ''}`}
            >
                {isPost ? (
                    <p className="text-text-primary text-[15px] leading-relaxed whitespace-pre-wrap">
                        {item.content}
                    </p>
                ) : (
                    <p className="text-text-secondary text-sm italic">&quot;{story}&quot;</p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
                <Button
                    variant={congratulated ? 'ghost' : 'default'}
                    size="sm"
                    onClick={handleCongratulate}
                    disabled={isLoading}
                    className={`h-8 text-xs font-semibold transition-all ${congratulated ? 'text-accent hover:bg-accent/10 border-accent/30 border' : ''}`}
                >
                    {congratulated ? (
                        <span className="flex items-center gap-1.5">
                            <Sparkles className="fill-accent h-4 w-4" />
                            Congratulated!
                            {likeCount > 0 && (
                                <span className="text-text-muted ml-0.5 text-[10px] font-bold">
                                    ({likeCount})
                                </span>
                            )}
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5">
                            <Flame className="h-4 w-4" />
                            Congratulate
                            {likeCount > 0 && (
                                <span className="ml-0.5 text-[10px] opacity-70">({likeCount})</span>
                            )}
                        </span>
                    )}
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleComments}
                    className={cn(
                        'bg-bg-page border-border text-text-secondary hover:bg-bg-muted hover:text-text-primary h-8 text-xs font-semibold',
                        showComments && 'border-accent/30 text-accent'
                    )}
                >
                    <MessageCircle className="mr-1.5 h-3 w-3" />
                    {commentCount > 0 ? `${commentCount}` : 'Discuss'}
                </Button>
            </div>

            {/* Comments Section (Posts and Submissions) */}
            {showComments && (
                <div className="border-border mt-4 border-t pt-4">
                    {/* Comment Input */}
                    <div className="mb-4 flex gap-3">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                            placeholder="Write a comment..."
                            className="bg-bg-page border-border text-text-primary placeholder:text-text-muted focus:border-accent flex-1 rounded-lg border px-3 py-2 text-sm transition-colors outline-none"
                        />
                        <Button
                            size="sm"
                            onClick={handleSubmitComment}
                            disabled={!commentText.trim() || postingComment}
                            className="h-9 px-3"
                        >
                            {postingComment ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Send className="h-3.5 w-3.5" />
                            )}
                        </Button>
                    </div>

                    {/* Comments List */}
                    {commentsLoading ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="text-text-muted h-5 w-5 animate-spin" />
                        </div>
                    ) : comments.length === 0 ? (
                        <p className="text-text-muted py-3 text-center text-xs">
                            No comments yet. Be the first!
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {comments.map((comment, idx) => (
                                <div key={comment._id || idx} className="flex gap-2.5">
                                    <Link
                                        href={`/profile/${comment.userId?._id || ''}`}
                                        className="shrink-0"
                                    >
                                        <Avatar className="h-7 w-7">
                                            <AvatarImage
                                                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${comment.userId?.avatarSeed || comment.userId?.name || 'U'}`}
                                            />
                                            <AvatarFallback className="bg-bg-muted text-[9px]">
                                                {(comment.userId?.name || 'U')
                                                    .substring(0, 1)
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div className="bg-bg-page border-border min-w-0 flex-1 rounded-lg border px-3 py-2">
                                        <div className="mb-0.5 flex items-center gap-2">
                                            <Link
                                                href={`/profile/${comment.userId?._id || ''}`}
                                                className="text-text-primary hover:text-accent text-xs font-bold transition-colors"
                                            >
                                                {comment.userId?.name || 'User'}
                                            </Link>
                                            <span className="text-text-muted text-[10px]">
                                                {comment.createdAt
                                                    ? formatDistanceToNow(
                                                          new Date(comment.createdAt),
                                                          { addSuffix: true }
                                                      )
                                                    : ''}
                                            </span>
                                        </div>
                                        <p className="text-text-secondary text-xs leading-relaxed">
                                            {comment.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
