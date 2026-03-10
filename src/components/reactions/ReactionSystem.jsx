'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThumbsUp, Heart, Star, Zap, Smile, Rocket, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useProblemSolve } from '@/context/ProblemSolveContext'

const REACTION_CONFIG = {
    LIKE: { icon: ThumbsUp, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Like' },
    LOVE: { icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Love' },
    CLAP: { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Clap' },
    THINKING: { icon: Smile, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Thinking' },
    ROCKET: { icon: Rocket, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Rocket' },
    WOW: { icon: Zap, color: 'text-pink-500', bg: 'bg-pink-500/10', label: 'Wow' },
}

export default function ReactionSystem({ problemId }) {
    const { socket } = useProblemSolve()
    const [counts, setCounts] = useState({})
    const [userReaction, setUserReaction] = useState('NONE')
    const [isLoading, setIsLoading] = useState(true)
    const [isHovering, setIsHovering] = useState(false)

    // Fetch initial data
    const fetchReactions = useCallback(async () => {
        try {
            const res = await fetch(`/api/problems/${problemId}/react`)
            const data = await res.json()
            if (data.success) {
                setCounts(data.counts)
                setUserReaction(data.userReaction)
            }
        } catch (error) {
            console.error('Failed to fetch reactions:', error)
        } finally {
            setIsLoading(false)
        }
    }, [problemId])

    useEffect(() => {
        fetchReactions()
    }, [fetchReactions])

    // Real-time listener
    useEffect(() => {
        if (!socket) return

        const handleUpdate = (data) => {
            if (data.problemId === problemId) {
                setCounts(data.counts)
            }
        }

        socket.on('reaction_update', handleUpdate)
        return () => socket.off('reaction_update', handleUpdate)
    }, [socket, problemId])

    const handleReact = async (type) => {
        // --- Optimistic UI Update ---
        const previousCounts = { ...counts }
        const previousUserReaction = userReaction

        const newCounts = { ...counts }

        // Decrement old if exists
        if (userReaction !== 'NONE') {
            newCounts[userReaction] = Math.max(0, (newCounts[userReaction] || 0) - 1)
        }

        // Increment new if different
        let newUserReaction = type
        if (userReaction === type) {
            // Toggling off
            newUserReaction = 'NONE'
        } else {
            newCounts[type] = (newCounts[type] || 0) + 1
        }

        setCounts(newCounts)
        setUserReaction(newUserReaction)

        // --- Backend Call ---
        try {
            const res = await fetch(`/api/problems/${problemId}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type }),
            })
            const data = await res.json()

            if (!data.success) {
                throw new Error(data.message)
            }
            // Sync with backend final state (just in case)
            setCounts(data.counts)
            setUserReaction(data.userReaction)
        } catch (error) {
            // Rollback on error
            setCounts(previousCounts)
            setUserReaction(previousUserReaction)
            toast.error('Failed to update reaction')
        }
    }

    if (isLoading) return <div className="h-10 w-32 animate-pulse rounded-full bg-neutral-800" />

    const totalReactions = Object.values(counts).reduce((a, b) => a + b, 0)

    return (
        <div className="relative flex items-center gap-3">
            {/* Main Trigger Button */}
            <div
                className="relative"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                <button
                    onClick={() => handleReact('LIKE')}
                    className={cn(
                        'flex items-center gap-2 rounded-full border px-4 py-2 transition-all duration-300',
                        userReaction !== 'NONE'
                            ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                            : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                    )}
                >
                    {userReaction !== 'NONE' ? (
                        React.createElement(REACTION_CONFIG[userReaction].icon, {
                            size: 18,
                            className: 'animate-in zoom-in spin-in-3',
                        })
                    ) : (
                        <ThumbsUp size={18} />
                    )}
                    <span className="text-sm font-medium">
                        {totalReactions > 0 ? totalReactions : 'React'}
                    </span>
                </button>

                {/* Reaction Picker Popover */}
                <AnimatePresence>
                    {isHovering && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: -10 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            className="absolute bottom-full left-0 z-50 mb-2 flex items-center gap-1 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-1 shadow-2xl"
                            style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)' }}
                        >
                            {Object.entries(REACTION_CONFIG).map(([type, config], index) => {
                                const Icon = config.icon
                                const isActive = userReaction === type
                                return (
                                    <motion.button
                                        key={type}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.04 }}
                                        onClick={() => handleReact(type)}
                                        className={cn(
                                            'group relative flex h-10 w-10 flex-col items-center justify-center rounded-xl transition-all',
                                            isActive ? config.bg : 'hover:bg-neutral-800'
                                        )}
                                        title={config.label}
                                    >
                                        <Icon
                                            size={20}
                                            className={cn(
                                                'transition-transform group-hover:scale-125',
                                                isActive ? config.color : 'text-neutral-400'
                                            )}
                                        />
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-dot"
                                                className="absolute -bottom-1 h-1 w-1 rounded-full bg-current"
                                            />
                                        )}
                                    </motion.button>
                                )
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Reaction Summaries */}
            <div className="flex -space-x-2">
                {Object.entries(counts)
                    .filter(([_, count]) => count > 0)
                    .sort((a, b) => b[1] - a[1]) // Sort by most popular
                    .slice(0, 3) // Show top 3
                    .map(([type]) => {
                        const config = REACTION_CONFIG[type]
                        const Icon = config.icon
                        return (
                            <div
                                key={type}
                                className={cn(
                                    'flex h-6 w-6 items-center justify-center rounded-full border border-neutral-950',
                                    config.bg
                                )}
                            >
                                <Icon size={12} className={config.color} />
                            </div>
                        )
                    })}
            </div>
        </div>
    )
}
