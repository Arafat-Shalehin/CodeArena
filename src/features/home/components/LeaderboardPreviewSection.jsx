'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useLeaderboard';

// Shared Components
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

/**
 * @component LeaderboardPreviewSection
 * @description Displays a preview table of top-ranked users.
 */
export default function LeaderboardPreviewSection() {
    const { users: leaderboardUsers, isLoading, error } = useLeaderboard();

    if (isLoading) {
        return <div className="py-24 text-center text-text-muted animate-pulse">Loading Global Hall of Fame...</div>;
    }

    if (error) {
        return <div className="py-24 text-center text-red-500">Unable to load leaderboard. Please try again later.</div>;
    }

    if (!leaderboardUsers || leaderboardUsers.length === 0) {
        return null;
    }

    return (
        <section className="py-20 bg-surface/30">
            <div className="max-w-5xl mx-auto px-4">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-text-main mb-6 tracking-tight">
                        Global <span className="text-primary italic">hall of fame.</span>
                    </h2>
                    <p className="text-text-muted leading-relaxed">
                        Recognizing the elite minds pushing the boundaries of competitive programming. 
                        Join the ranks of the world's best.
                    </p>
                </div>

                {/* Leaderboard Table Card */}
                <Card className="matte-surface rounded-[2rem] overflow-hidden shadow-2xl border-border-base bg-background/80 backdrop-blur-md">
                    <CardContent className="p-0">
                        
                        {/* Desktop Table View */}
                        <Table className="hidden lg:table w-full text-left">
                            <TableHeader className="bg-surface border-b border-border-base">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="px-10 py-6 text-xs font-bold text-text-light uppercase tracking-widest">Rank</TableHead>
                                    <TableHead className="px-10 py-6 text-xs font-bold text-text-light uppercase tracking-widest">Architect</TableHead>
                                    <TableHead className="px-10 py-6 text-xs font-bold text-text-light uppercase tracking-widest text-center">Solved</TableHead>
                                    <TableHead className="px-10 py-6 text-xs font-bold text-text-light uppercase tracking-widest text-right">ELO Rating</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-border-base bg-background">
                                {leaderboardUsers.slice(0, 3).map((row, idx) => (
                                    <TableRow key={idx} className="group hover:bg-surface/50 transition-colors border-border-base">
                                        <TableCell className="px-10 py-8">
                                            <span className="text-3xl font-display font-extrabold text-border-base group-hover:text-primary/20 transition-colors italic">
                                                {row.rank || idx + 1}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/30 shadow-lg p-[2px]">
                                                    <Avatar className="h-full w-full rounded-[14px]">
                                                        <AvatarImage
                                                            src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${row.username}`}
                                                            alt={`${row.username}'s avatar`}
                                                        />
                                                        <AvatarFallback>{row.username.substring(0, 2)}</AvatarFallback>
                                                    </Avatar>
                                                </div>
                                                <div>
                                                    <div className="font-display font-extrabold text-text-main text-lg italic">{row.username}</div>
                                                    <div className="text-xs font-bold text-text-light uppercase tracking-widest mt-1">{row.title || 'Grandmaster'}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-10 py-8 text-center">
                                            <span className="font-mono font-bold text-text-main">{row.solved || 0}</span>
                                        </TableCell>
                                        <TableCell className="px-10 py-8 text-right">
                                            <span className="font-mono font-bold text-primary text-lg">{row.score?.toLocaleString() || row.elo} pts</span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Mobile List View */}
                        <div className="lg:hidden divide-y divide-border-base bg-background">
                            {leaderboardUsers.slice(0, 3).map((row, idx) => (
                                <div key={idx} className="p-6 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl font-display font-extrabold text-border-base italic min-w-[2rem]">
                                            {row.rank || idx + 1}
                                        </span>
                                        <Avatar className="size-12 rounded-xl border border-border-base">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${row.username}`} />
                                            <AvatarFallback>{row.username.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-display font-extrabold text-text-main text-base italic">{row.username}</div>
                                            <div className="text-[10px] font-bold text-text-light uppercase tracking-widest">{row.title || 'Elite'}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono font-bold text-primary text-base">{row.score?.toLocaleString()}</div>
                                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">ELO</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA Footer */}
                        <div className="p-8 text-center bg-surface border-t border-border-base">
                            <Link href="/leaderboard">
                                <Button variant="outline" size="lg" className="bg-background hover:bg-surface text-text-muted hover:text-primary transition-all duration-300 group">
                                    View all legends
                                    <ArrowUpRight className="w-4 h-4 ml-2 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </Button>
                            </Link>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </section>
    );
}