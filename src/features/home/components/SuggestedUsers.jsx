'use client'

import Link from 'next/link'
import { useState, useCallback } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { UserCheck, UserPlus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SuggestedUsers({ users, onFollow }) {
    const [localUsers, setLocalUsers] = useState(users || [])
    const [loading, setLoading] = useState(null)

    // Sync with prop when users change
    if (users && JSON.stringify(users) !== JSON.stringify(localUsers)) {
        setLocalUsers(users)
    }

    const handleFollow = useCallback(
        async (userId) => {
            if (loading === userId) return

            // Optimistic update - toggle state immediately
            setLoading(userId)
            setLocalUsers((prev) =>
                prev.map((u) => {
                    if (u._id === userId) {
                        return { ...u, isFollowing: !u.isFollowing }
                    }
                    return u
                })
            )

            try {
                await onFollow(userId)
            } catch (error) {
                // Revert on error
                setLocalUsers((prev) =>
                    prev.map((u) => {
                        if (u._id === userId) {
                            return { ...u, isFollowing: !u.isFollowing }
                        }
                        return u
                    })
                )
                console.error('Failed to follow:', error)
            } finally {
                setLoading(null)
            }
        },
        [loading, onFollow]
    )

    if (!localUsers?.length) {
        return <p className="text-text-muted text-xs">No suggestions right now.</p>
    }

    return (
        <div className="flex flex-col gap-4">
            {localUsers.map((sugg) => (
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
                                {sugg.country || 'Global'}{' '}
                                {sugg.stats?.globalRank ? `• Rank #${sugg.stats.globalRank}` : ''}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant={sugg.isFollowing ? 'ghost' : 'outline'}
                        size="sm"
                        onClick={() => handleFollow(sugg._id)}
                        disabled={loading === sugg._id}
                        className={cn(
                            'ml-2 h-6 shrink-0 border-none px-3 text-[10px] font-bold transition-all',
                            sugg.isFollowing
                                ? 'bg-success/10 text-success hover:bg-error/10 hover:text-error'
                                : 'bg-accent/10 text-accent hover:bg-accent hover:text-white'
                        )}
                    >
                        {loading === sugg._id ? (
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
    )
}
