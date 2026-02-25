'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useLeaderboard } from '@/hooks/useLeaderboard'

// Shared Components
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

import { Skeleton } from '@/components/ui/skeleton'

/**
 * @component LeaderboardPreviewSection
 * @description Displays a preview table of top-ranked users to encourage competition.
 * Features:
 * - Top 3 ranked users
 * - Avatar, solved count, and ELO rating
 * - CTA to view full leaderboard
 *
 * @returns {JSX.Element} The rendered Leaderboard preview section.
 */
export default function LeaderboardPreviewSection() {
    const { users: leaderboardUsers, isLoading, error } = useLeaderboard()

    if (isLoading) {
        return (
            <section className="bg-bg-subtle py-12">
                <div className="mx-auto max-w-5xl px-4">
                    <div className="mx-auto mb-20 max-w-2xl space-y-4 text-center">
                        <Skeleton className="mx-auto h-12 w-3/4" />
                        <Skeleton className="mx-auto h-4 w-1/2" />
                    </div>
                    <Card className="matte-surface border-border/50 bg-bg-page/80 overflow-hidden rounded-[2rem] shadow-2xl">
                        <CardContent className="p-0">
                            <div className="space-y-4 p-8">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-[200px]" />
                                            <Skeleton className="h-4 w-[150px]" />
                                        </div>
                                        <Skeleton className="h-8 w-20" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <div className="py-24 text-center text-red-500">
                Unable to load leaderboard. Please try again later.
            </div>
        )
    }

    if (!leaderboardUsers || leaderboardUsers.length === 0) {
        return null
    }

    return (
        <section className="bg-bg-subtle py-12">
            <div className="mx-auto max-w-5xl px-4">
                {/* Section Header */}
                <div className="mx-auto mb-20 max-w-2xl text-center">
                    <h2 className="font-display text-text-primary mb-6 text-4xl font-bold tracking-tight md:text-5xl">
                        Global <span className="text-accent italic">hall of fame.</span>
                    </h2>
                    <p className="text-text-muted leading-relaxed">
                        Recognizing the elite minds pushing the boundaries of competitive
                        programming. Join the ranks of the world's best.
                    </p>
                </div>

                {/* Leaderboard Table Card */}
                <Card className="matte-surface border-border/50 bg-bg-page/80 overflow-hidden rounded-[2rem] shadow-2xl backdrop-blur-md">
                    <CardContent className="p-0">
                        {/* Desktop Table View */}
                        <Table
                            className="hidden w-full text-left lg:table"
                            aria-label="Global Leaderboard Preview"
                        >
                            <TableHeader className="bg-bg-subtle border-border border-b">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="text-text-light px-10 py-6 text-xs font-bold tracking-widest uppercase">
                                        Rank
                                    </TableHead>
                                    <TableHead className="text-text-light px-10 py-6 text-xs font-bold tracking-widest uppercase">
                                        Architect
                                    </TableHead>
                                    <TableHead className="text-text-light px-10 py-6 text-center text-xs font-bold tracking-widest uppercase">
                                        Solved
                                    </TableHead>
                                    <TableHead className="text-text-light px-10 py-6 text-right text-xs font-bold tracking-widest uppercase">
                                        ELO Rating
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-border bg-bg-page divide-y">
                                {leaderboardUsers.slice(0, 3).map((row, idx) => (
                                    <TableRow
                                        key={idx}
                                        className="group transition-colors hover:bg-zinc-50/50"
                                    >
                                        <TableCell className="px-10 py-8">
                                            <span className="font-display text-border group-hover:text-accent/20 text-3xl font-extrabold italic transition-colors">
                                                {row.rank}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="from-accent-light to-accent size-12 rounded-2xl bg-gradient-to-br p-[2px] shadow-lg">
                                                    <Avatar className="h-full w-full rounded-[14px]">
                                                        <AvatarImage
                                                            src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${row.userId.username}`}
                                                            alt={`${row.userId.username}'s avatar`}
                                                        />
                                                        <AvatarFallback>
                                                            {row.userId.username.substring(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </div>
                                                <div>
                                                    <Link
                                                        href={`/profile/${row.userId._id}`}
                                                        className="font-display text-text-primary hover:text-accent text-lg font-extrabold italic transition-colors"
                                                    >
                                                        {row.userId.username}
                                                    </Link>
                                                    <div className="text-text-light mt-1 text-xs font-bold tracking-widest uppercase">
                                                        {row.title}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-10 py-8 text-center">
                                            <span className="text-text-primary font-mono font-bold">
                                                {row.submissions}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-10 py-8 text-right">
                                            <span className="text-accent font-mono text-lg font-bold">
                                                {row.score.toLocaleString()} pts
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Mobile Card List View */}
                        <div className="divide-border bg-bg-page divide-y lg:hidden">
                            {leaderboardUsers.slice(0, 3).map((row, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between gap-4 p-6"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="font-display text-border min-w-[2rem] text-2xl font-extrabold italic">
                                            {row.rank}
                                        </span>
                                        <div className="from-accent-light to-accent size-12 shrink-0 rounded-2xl bg-gradient-to-br p-[2px] shadow-lg">
                                            <Avatar className="h-full w-full rounded-[14px]">
                                                <AvatarImage
                                                    src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${row.userId.username}`}
                                                    alt={`${row.userId.username}'s avatar`}
                                                />
                                                <AvatarFallback>
                                                    {row.userId.username.substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div>
                                            <Link
                                                href={`/profile/${row.userId._id}`}
                                                className="font-display text-text-primary hover:text-accent text-base font-extrabold italic transition-colors"
                                            >
                                                {row.userId.username}
                                            </Link>
                                            <div className="text-text-light mt-0.5 text-[10px] font-bold tracking-widest uppercase">
                                                {row.title}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-accent font-mono text-base font-bold">
                                            {row.score.toLocaleString()} pts
                                        </div>
                                        <div className="text-text-muted text-[10px] font-bold tracking-wider uppercase">
                                            ELO
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* View All Button */}
                        <div className="bg-bg-subtle border-border border-t p-6 text-center">
                            <Link href="/leaderboard">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="bg-bg-page hover:bg-bg-muted text-text-muted hover:text-accent group transition-all duration-300"
                                >
                                    View all legends
                                    <ArrowUpRight className="ml-2 h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}
