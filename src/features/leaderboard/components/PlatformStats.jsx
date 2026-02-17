import React from 'react';
import { Card } from '@/components/ui/card';

// Data
import { leaderboardStats } from '../data/leaderboard.data';

/**
 * @component PlatformStats
 * @description Displays platform-wide statistics (participants, submissions, contests, solve rate).
 * 
 * Features:
 * - Mobile: Horizontal scrollable flex layout  
 * - Desktop: 4-column grid
 * - Trend indicators (up/down/stable)
 * - Design token-based styling
 * 
 * @returns {JSX.Element} The rendered platform stats.
 */
export function PlatformStats() {
    return (
        <section className="overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {leaderboardStats.map((stat, idx) => (
                    <Card
                        key={idx}
                        className="p-5 bg-bg-subtle border border-border/50 hover:border-border transition-colors shadow-sm hover:shadow-md"
                    >
                        {/* Label */}
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                            {stat.label}
                        </p>

                        {/* Value and Trend */}
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-display font-bold text-text-primary tracking-tight">
                                {stat.value}
                            </span>

                            {/* Trend Indicator */}
                            {stat.trendUp !== null ? (
                                <div className={`flex items-center text-xs font-medium ${stat.trendUp ? 'text-success' : 'text-error'
                                    }`}>
                                    <span className="material-symbols-outlined text-[16px] mr-1">
                                        {stat.trendUp ? 'trending_up' : 'trending_down'}
                                    </span>
                                    {stat.trend}
                                </div>
                            ) : (
                                <span className="text-text-muted text-xs font-medium">
                                    {stat.trend}
                                </span>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}
