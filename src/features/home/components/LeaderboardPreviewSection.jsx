'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowUpRight, Crown } from 'lucide-react'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion'

/**
 * @component LeaderboardPreviewSection
 * @description Displays a premium preview of top performers with entrance animations.
 */
export default function LeaderboardPreviewSection() {
    const shouldReduceMotion = useSafeReducedMotion()
    const sectionRef = useRef(null)
    const isNearViewport = useInView(sectionRef, { once: true, margin: '320px' })
    const { users: leaderboardUsers, isLoading, error } = useLeaderboard({}, isNearViewport)

    if (error) return null
    if (isLoading || !leaderboardUsers || leaderboardUsers.length === 0) {
        // Show skeleton instead of nothing while loading
        return (
            <section ref={sectionRef} className="mx-auto max-w-7xl px-4 py-16">
                <div className="grid gap-16 lg:grid-cols-2">
                    <div className="space-y-8">
                        <div className="bg-bg-muted h-12 w-3/4 animate-pulse rounded-xl" />
                        <div className="bg-bg-muted h-6 w-full animate-pulse rounded-xl" />
                        <div className="bg-bg-muted h-6 w-2/3 animate-pulse rounded-xl" />
                    </div>
                    <div className="bg-bg-subtle border-border h-80 animate-pulse rounded-3xl border" />
                </div>
            </section>
        )
    }

    return (
        <section ref={sectionRef} className="mx-auto max-w-7xl px-4 py-16">
            <div className="grid gap-16 lg:grid-cols-2">
                {/* Left: Content */}
                <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
                    className="flex flex-col justify-center space-y-8"
                >
                    <div className="space-y-4">
                        <h2 className="font-display text-text-primary text-4xl font-extrabold tracking-tight md:text-5xl">
                            Compete with the <br />
                            <span className="text-accent italic drop-shadow-[0_0_10px_rgba(2,186,76,0.2)]">
                                Global Elite.
                            </span>
                        </h2>
                        <p className="text-text-muted text-lg leading-relaxed md:text-xl">
                            Join thousands of developers in daily sprints and seasonal marathons.
                            Climb the ranks, earn reputation, and become a CodeArena legend.
                        </p>
                    </div>
                </motion.div>

                {/* Right: Leaderboard Card */}
                <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
                    className="relative"
                >
                    {/* Background Glow */}
                    <div className="from-accent/10 dark:from-accent/5 absolute -inset-4 bg-gradient-to-tr to-transparent blur-3xl" />

                    <Card className="matte-surface border-border/50 relative overflow-hidden rounded-[2rem] shadow-2xl backdrop-blur-xl">
                        <div className="border-border bg-bg-subtle/50 border-b px-8 py-6">
                            <h3 className="text-text-primary flex items-center gap-2 text-xs font-bold tracking-tight uppercase">
                                <span className="bg-accent flex h-2 w-2 animate-pulse rounded-full" />
                                Global Leaderboard - Live
                            </h3>
                        </div>

                        <div className="divide-border divide-y p-3">
                            {leaderboardUsers.slice(0, 3).map((user, idx) => (
                                <LeaderboardRow
                                    key={user.userId._id}
                                    user={user}
                                    rank={user.rank}
                                    index={idx}
                                />
                            ))}
                        </div>

                        <div className="bg-bg-subtle/50 p-6 text-center">
                            <Link href="/leaderboard">
                                <Button
                                    variant="ghost"
                                    className="text-accent hover:bg-bg-muted text-xs font-bold transition-all hover:scale-105 active:scale-95"
                                >
                                    View Full Leaderboard
                                    <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </section>
    )
}

function LeaderboardRow({ user, rank, index }) {
    const shouldReduceMotion = useSafeReducedMotion()
    const isFirst = rank === 1

    return (
        <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: shouldReduceMotion ? 0 : index * 0.1 }}
            className={cn(
                'group relative flex items-center justify-between rounded-2xl p-5 transition-all duration-300',
                isFirst ? 'bg-accent/10 dark:bg-accent/[0.07] shadow-sm' : 'hover:bg-bg-muted/50'
            )}
        >
            <div className="flex items-center gap-5">
                {/* Rank Container */}
                <div className="relative">
                    <div
                        className={cn(
                            'flex size-10 items-center justify-center rounded-xl font-mono text-sm font-black',
                            isFirst
                                ? 'bg-accent shadow-accent-glow rotate-[-4deg] text-white'
                                : 'bg-bg-muted text-text-muted'
                        )}
                    >
                        {rank}
                    </div>
                </div>

                {/* Avatar & Name */}
                <div className="flex items-center gap-4">
                    <Link
                        href={`/profile/${user.userId._id}`}
                        className="from-accent-light to-accent size-12 rounded-2xl bg-gradient-to-br p-[2px] shadow-lg transition-transform group-hover:scale-105"
                    >
                        <Avatar className="h-full w-full rounded-[14px]">
                            <AvatarImage
                                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.userId.username}`}
                                alt={user.userId.username}
                            />
                            <AvatarFallback>{user.userId.username.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div>
                        <Link
                            href={`/profile/${user.userId._id}`}
                            className="text-text-primary hover:text-accent flex items-center gap-2 text-base font-bold transition-colors"
                        >
                            {user.userId.username}
                            {isFirst && <Crown className="h-4 w-4 fill-amber-500 text-amber-500" />}
                        </Link>
                        <div className="text-text-muted text-[10px] font-bold tracking-widest uppercase">
                            {user.title || 'Master Coder'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Score */}
            <div className="text-right">
                <div className="text-text-primary font-mono text-lg font-black tracking-tight">
                    {user.score.toLocaleString()}
                </div>
                <div className="text-success text-[10px] font-extrabold tracking-tighter uppercase">
                    {user.submissions} Solved
                </div>
            </div>

            {/* Shimmer Effect for 1st Place */}
            {isFirst && !shouldReduceMotion && (
                <div className="border-accent/20 pointer-events-none absolute inset-0 overflow-hidden rounded-2xl border-2">
                    <motion.div
                        animate={{
                            x: ['-100%', '200%'],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        className="absolute h-full w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10"
                    />
                </div>
            )}
        </motion.div>
    )
}
