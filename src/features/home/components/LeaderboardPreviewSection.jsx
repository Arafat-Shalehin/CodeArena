import React from 'react';

// Shared Components
import Button from '@/shared/components/ui/Button';

// Data
import { leaderboardData } from '../../leaderboard/data/leaderboard.data';

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
    return (
        <section className="py-24 bg-secondary/20">
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
                <div className="matte-surface rounded-[2rem] overflow-hidden shadow-2xl border-white/50">
                    <table className="w-full text-left" aria-label="Global Leaderboard Preview">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-100">
                                <th className="px-10 py-6 text-[10px] font-bold text-text-light uppercase tracking-widest">Rank</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-text-light uppercase tracking-widest">Architect</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-text-light uppercase tracking-widest text-center">Solved</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-text-light uppercase tracking-widest text-right">ELO Rating</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 bg-white">
                            {leaderboardData.map((row, idx) => (
                                <tr key={idx} className="group hover:bg-zinc-50/50 transition-colors">
                                    <td className="px-10 py-8">
                                        <span className="text-3xl font-display font-extrabold text-zinc-200 group-hover:text-primary/20 transition-colors italic">{row.rank}</span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            {/* Avatar */}
                                            <div className={`size-12 rounded-2xl bg-gradient-to-br ${row.color} shadow-lg ${row.shadow} overflow-hidden`}>
                                                <img
                                                    src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${row.seed}`}
                                                    alt={`${row.user}'s avatar`}
                                                    loading="lazy"
                                                />
                                            </div>
                                            {/* User Info */}
                                            <div>
                                                <div className="font-display font-extrabold text-text-main text-lg italic">{row.user}</div>
                                                <div className="text-[10px] font-bold text-text-light uppercase tracking-widest mt-1">{row.title}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <span className="font-mono font-bold text-text-main">{row.solved}</span>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <span className="font-mono font-bold text-primary text-lg">{row.elo}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* View All Button */}
                    <div className="p-10 text-center bg-zinc-50 border-t border-zinc-100">
                        <Button variant="outline" size="md" className="bg-white hover:bg-zinc-100">
                            View all legends
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
