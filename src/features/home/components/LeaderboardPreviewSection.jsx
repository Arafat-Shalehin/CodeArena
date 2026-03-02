'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowUpRight, Crown } from 'lucide-react'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * @component LeaderboardPreviewSection
 * @description Displays a premium preview of top performers with entrance animations.
 */
export default function LeaderboardPreviewSection() {
    const { users: leaderboardUsers, isLoading, error } = useLeaderboard()

    if (isLoading || error || !leaderboardUsers || leaderboardUsers.length === 0) return null

    return (
        <section className="mx-auto max-w-7xl px-4 py-32">
            <div className="grid gap-16 lg:grid-cols-2">
                {/* Left: Content */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
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

                    <div className="grid grid-cols-2 gap-8 border-t border-zinc-100 pt-8">
                        <div>
                            <div className="text-text-primary text-3xl font-black tabular-nums">
                                1.2k+
                            </div>
                            <div className="text-text-muted mt-1 text-xs font-bold tracking-widest uppercase">
                                Daily Sprints
                            </div>
                        </div>
                        <div>
                            <div className="text-text-primary text-3xl font-black tabular-nums">
                                $50k+
                            </div>
                            <div className="text-text-muted mt-1 text-xs font-bold tracking-widest uppercase">
                                Prize Pools
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right: Leaderboard Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    {/* Background Glow */}
                    <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/10 to-transparent blur-3xl" />

                    <Card className="matte-surface relative overflow-hidden rounded-[2rem] border-zinc-200/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] backdrop-blur-xl">
                        <div className="border-b border-zinc-100 bg-zinc-50/50 px-8 py-6">
                            <h3 className="text-text-primary flex items-center gap-2 text-xs font-bold tracking-tight uppercase">
                                <span className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                                Global Leaderboard — Live
                            </h3>
                        </div>

                        <div className="divide-y divide-zinc-50/50 p-3">
                            {leaderboardUsers.slice(0, 3).map((user, idx) => (
                                <LeaderboardRow
                                    key={user.userId._id}
                                    user={user}
                                    rank={user.rank}
                                    index={idx}
                                />
                            ))}
                        </div>

                        <div className="bg-zinc-50/50 p-6 text-center">
                            <Link href="/leaderboard">
                                <Button
                                    variant="ghost"
                                    className="text-accent text-xs font-bold transition-all hover:scale-105 hover:bg-emerald-50 active:scale-95"
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
    const isFirst = rank === 1

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={cn(
                'group relative flex items-center justify-between rounded-2xl p-5 transition-all duration-300',
                isFirst ? 'bg-emerald-50/60 shadow-sm' : 'hover:bg-zinc-50/50'
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
                                : 'bg-zinc-100 text-zinc-400'
                        )}
                    >
                        {rank}
                    </div>
                </div>

                {/* Avatar & Name */}
                <div className="flex items-center gap-4">
                    <div className="from-accent-light to-accent size-12 rounded-2xl bg-gradient-to-br p-[2px] shadow-lg transition-transform group-hover:scale-105">
                        <Avatar className="h-full w-full rounded-[14px]">
                            <AvatarImage
                                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.userId.username}`}
                                alt={user.userId.username}
                            />
                            <AvatarFallback>{user.userId.username.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                    </div>
                    <div>
                        <div className="text-text-primary flex items-center gap-2 text-base font-bold">
                            {user.userId.username}
                            {isFirst && <Crown className="h-4 w-4 fill-amber-500 text-amber-500" />}
                        </div>
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
                <div className="text-[10px] font-extrabold tracking-tighter text-emerald-600 uppercase">
                    {user.submissions} Solved
                </div>
            </div>

            {/* Shimmer Effect for 1st Place */}
            {isFirst && (
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
                        className="absolute h-full w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    />
                </div>
            )}
        </motion.div>
    )
}
