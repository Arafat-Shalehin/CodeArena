'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, UserMinus, UserPlus, Trophy } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function FollowersListModal({ type, userId, onClose }) {
    const router = useRouter()
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [actionLoading, setActionLoading] = useState({})

    const title = type === 'followers' ? 'Followers' : 'Following'

    useEffect(() => {
        let isMounted = true

        const fetchUsers = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const res = await fetch(`/api/users/${userId}/friends?type=${type}&limit=100`)
                const data = await res.json()

                if (data.success) {
                    if (isMounted) setUsers(data.data[type] || [])
                } else {
                    if (isMounted) setError(data.message || 'Failed to load users')
                }
            } catch (err) {
                if (isMounted) setError('An unexpected error occurred')
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }

        if (userId && type) {
            fetchUsers()
        }

        return () => {
            isMounted = false
        }
    }, [userId, type])

    const handleUserClick = (targetId) => {
        onClose()
        router.push(`/profile/${targetId}`)
    }

    const handleFollowToggle = async (e, targetUser) => {
        e.stopPropagation()
        const targetId = targetUser._id
        if (actionLoading[targetId]) return

        setActionLoading((prev) => ({ ...prev, [targetId]: true }))
        try {
            const res = await fetch(`/api/users/${targetId}/follow`, {
                method: 'POST',
            })
            const data = await res.json()

            if (data.success) {
                // If we are in the 'following' tab and just unfollowed, we might want to remove them
                // or just update the state. Let's update the local 'isFollowing' equivalent.
                setUsers((prev) =>
                    prev.map((u) =>
                        u._id === targetId ? { ...u, isFollowing: data.data.following } : u
                    )
                )
            }
        } catch (err) {
            console.error('Follow toggle error:', err)
        } finally {
            setActionLoading((prev) => ({ ...prev, [targetId]: false }))
        }
    }

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="border-border bg-bg-page/95 flex max-h-[80vh] w-[95vw] max-w-md flex-col overflow-hidden p-0 backdrop-blur-xl sm:rounded-2xl">
                <DialogHeader className="border-border bg-bg-subtle/50 shrink-0 border-b px-6 py-4 backdrop-blur-sm">
                    <DialogTitle className="text-text-primary text-lg font-bold">
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="custom-scrollbar flex-1 overflow-y-auto" data-lenis-prevent>
                    <div className="p-2">
                        {isLoading ? (
                            <div className="flex h-48 items-center justify-center">
                                <Loader2 className="text-accent h-6 w-6 animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="flex h-48 flex-col items-center justify-center gap-2 p-6 text-center">
                                <p className="text-text-muted text-sm">{error}</p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="flex h-48 flex-col items-center justify-center gap-3 p-6 text-center">
                                <div className="bg-bg-subtle flex h-12 w-12 items-center justify-center rounded-full">
                                    {type === 'followers' ? (
                                        <UserMinus className="text-text-muted h-6 w-6" />
                                    ) : (
                                        <UserPlus className="text-text-muted h-6 w-6" />
                                    )}
                                </div>
                                <p className="text-text-secondary text-sm">
                                    {type === 'followers'
                                        ? 'No followers yet.'
                                        : 'Not following anyone yet.'}
                                </p>
                            </div>
                        ) : (
                            <ul className="space-y-1 p-2">
                                {users.map((user) => {
                                    // Since the API might not return 'isFollowing' for this specific list,
                                    // we assume 'following' type means they are followed.
                                    const isFollowing =
                                        user.isFollowing !== undefined
                                            ? user.isFollowing
                                            : type === 'following'

                                    return (
                                        <li
                                            key={user._id}
                                            className="group flex items-center gap-2 pr-2"
                                        >
                                            <button
                                                onClick={() => handleUserClick(user._id)}
                                                className="hover:bg-bg-subtle flex flex-1 items-center gap-4 rounded-xl p-3 text-left transition-colors"
                                            >
                                                <Avatar className="h-12 w-12 border border-white/5">
                                                    <AvatarImage
                                                        src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.avatarSeed || user.name}`}
                                                        alt={user.name}
                                                    />
                                                    <AvatarFallback className="bg-bg-muted text-text-primary">
                                                        {(user.name || 'U')
                                                            .substring(0, 2)
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-text-primary truncate font-semibold">
                                                        {user.name}
                                                    </h4>
                                                    {user.bio ? (
                                                        <p className="text-text-muted truncate text-xs">
                                                            {user.bio}
                                                        </p>
                                                    ) : (
                                                        <div className="text-text-muted mt-0.5 flex items-center gap-2 text-xs">
                                                            <Trophy className="text-accent h-3 w-3" />
                                                            <span>
                                                                Score: {user.stats?.score || 0}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>

                                            {/* Action Button */}
                                            <button
                                                onClick={(e) => handleFollowToggle(e, user)}
                                                disabled={actionLoading[user._id]}
                                                className={`h-8 rounded-lg px-3 text-[10px] font-bold transition-all disabled:opacity-50 ${
                                                    isFollowing
                                                        ? 'bg-bg-muted text-text-secondary hover:bg-red-500/10 hover:text-red-500'
                                                        : 'bg-accent/10 text-accent hover:bg-accent hover:text-white'
                                                }`}
                                            >
                                                {actionLoading[user._id] ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : isFollowing ? (
                                                    'Unfollow'
                                                ) : (
                                                    'Follow'
                                                )}
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
