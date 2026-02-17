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
            <div className="flex md:grid md:grid-cols-4 gap-4 min-w-max md:min-w-0">
                {leaderboardStats.map((stat, idx) => (
                    <Card
                        key={idx}
                        className="w-44 md:w-auto p-4 md:p-5 bg-bg-subtle border-border shadow-sm"
                    >
                        {/* Label */}
                        <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">
                            {stat.label}
                        </p>

                        {/* Value and Trend */}
                        <div className="flex items-end justify-between md:justify-start md:gap-2 mt-1">
                            <span className="text-xl md:text-2xl font-bold md:font-black text-text-primary leading-none">
                                {stat.value}
                            </span>

                            {/* Trend Indicator */}
                            {stat.trendUp !== null ? (
                                <span className={`text-xs font-bold flex items-center mb-1 ${stat.trendUp ? 'text-success' : 'text-error'
                                    }`}>
                                    <span className="material-symbols-outlined text-xs mr-0.5">
                                        {stat.trendUp ? 'trending_up' : 'trending_down'}
                                    </span>
                                    {stat.trend}
                                </span>
                            ) : (
                                <span className="text-text-muted text-xs font-bold mb-1">
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
