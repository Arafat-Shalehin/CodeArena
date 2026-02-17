import React from 'react';
import Link from 'next/link';
import { useLeaderboard } from '@/hooks/useLeaderboard';

// Shared Components
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

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
        <section className="py-12 bg-bg-subtle">
            <div className="max-w-5xl mx-auto px-4">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-text-main mb-6 tracking-tight">
                        Global <span className="text-primary italic">hall of fame.</span>
                    </h2>
                    <p className="text-text-muted leading-relaxed">
                        Recognizing the elite minds pushing the boundaries of competitive programming. Join the ranks of the world's best.
                    </p>
                </div>

                {/* Leaderboard Table Card */}
                <Card className="matte-surface rounded-[2rem] overflow-hidden shadow-2xl border-border/50 bg-bg-page/80 backdrop-blur-md">
                    <CardContent className="p-0">
                        {/* Desktop Table View */}
                        <table className="hidden lg:table w-full text-left" aria-label="Global Leaderboard Preview">
                            <thead>
                                <tr className="bg-bg-subtle border-b border-border">
                                    <th className="px-10 py-6 text-xs font-bold text-text-light uppercase tracking-widest">Rank</th>
                                    <th className="px-10 py-6 text-xs font-bold text-text-light uppercase tracking-widest">Architect</th>
                                    <th className="px-10 py-6 text-xs font-bold text-text-light uppercase tracking-widest text-center">Solved</th>
                                    <th className="px-10 py-6 text-xs font-bold text-text-light uppercase tracking-widest text-right">ELO Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-bg-page">
                                {leaderboardUsers.slice(0, 3).map((row, idx) => (
                                    <tr key={idx} className="group hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-10 py-8">
                                            <span className="text-3xl font-display font-extrabold text-border group-hover:text-primary/20 transition-colors italic">{row.rank}</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 rounded-2xl bg-gradient-to-br from-accent-light to-accent shadow-lg p-[2px]">
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
                                                    <div className="text-xs font-bold text-text-light uppercase tracking-widest mt-1">{row.title}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <span className="font-mono font-bold text-text-main">{row.solved}</span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <span className="font-mono font-bold text-primary text-lg">{row.points.toLocaleString()} pts</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile Card List View */}
                        <div className="lg:hidden divide-y divide-border bg-bg-page">
                            {leaderboardUsers.slice(0, 3).map((row, idx) => (
                                <div key={idx} className="p-6 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl font-display font-extrabold text-border italic min-w-[2rem]">{row.rank}</span>
                                        <div className="size-12 rounded-2xl bg-gradient-to-br from-accent-light to-accent shadow-lg p-[2px] shrink-0">
                                            <Avatar className="h-full w-full rounded-[14px]">
                                                <AvatarImage
                                                    src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${row.username}`}
                                                    alt={`${row.username}'s avatar`}
                                                />
                                                <AvatarFallback>{row.username.substring(0, 2)}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div>
                                            <div className="font-display font-extrabold text-text-main text-base italic">{row.username}</div>
                                            <div className="text-[10px] font-bold text-text-light uppercase tracking-widest mt-0.5">{row.title}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono font-bold text-primary text-base">{row.points.toLocaleString()} pts</div>
                                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">ELO</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* View All Button */}
                        <div className="p-6 text-center bg-bg-subtle border-t border-border">
                            <Link href="/leaderboard">
                                <Button variant="outline" size="default" className="bg-bg-page hover:bg-bg-muted">
                                    View all legends
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
