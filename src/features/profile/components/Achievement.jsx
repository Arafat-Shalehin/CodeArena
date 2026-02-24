'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { achievementBadges } from '../data/achievementBadges.data'
import { recentBadges } from '../data/recentBadges.data'

/**
 * Achievements Component
 * * Displays a user's gamification progress, including a visual grid of earned/unearned
 * badges and a detailed list of the most recently acquired achievements.
 * * Features:
 * - Interactive badge grid with hover tooltips.
 * - Conditional styling for earned vs. locked badges (grayscale/opacity).
 * - Recent activity feed for specific achievement milestones.
 * * @component
 * @returns {React.JSX.Element} A section containing the achievement grid and recent history.
 */
export default function Achievements() {
    return (
        <section className="bg-bg-subtle border-border rounded-lg border p-6 shadow-sm">
            {/* Header Section */}
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-text-primary text-lg font-semibold">Achievements</h3>
                <span className="text-text-muted text-xs font-medium">8 Earned</span>
            </div>

            {/* Badges Grid */}
            <div className="mb-8 grid grid-cols-4 gap-4">
                {achievementBadges.map((badge) => (
                    /**
                     * Individual Badge Item
                     * @key {string|number} badge.id
                     */
                    <div
                        key={badge.id}
                        className={`group relative flex aspect-square cursor-help items-center justify-center rounded-full border transition-transform hover:scale-110 ${
                            badge.earned
                                ? `${badge.bg} ${badge.border} ${badge.color}`
                                : 'bg-bg-muted/50 border-border/50 text-text-muted grayscale'
                        }`}
                    >
                        <span className="material-symbols-outlined text-2xl">{badge.icon}</span>

                        {/* Simple Tooltip on Hover */}
                        {badge.earned && (
                            <div className="bg-text-primary text-bg-page absolute -top-10 left-1/2 z-10 -translate-x-1/2 rounded px-2 py-1 text-[10px] whitespace-nowrap opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                                {badge.label}
                            </div>
                        )}
                    </div>
                ))}
                {/* Placeholder for future badges or loading state */}
                <Skeleton className="h-full w-full"></Skeleton>
            </div>

            {/* Recent Badges List */}
            <div className="space-y-3">
                <p className="text-text-muted mb-2 text-[10px] font-bold tracking-widest uppercase">
                    Recent Badges
                </p>

                {recentBadges.map((badge) => (
                    /**
                     * Recent Badge Row
                     * @key {string|number} badge.id
                     */
                    <div
                        key={badge.id}
                        className="bg-bg-muted/20 border-border/50 flex items-center gap-3 rounded-lg border p-3"
                    >
                        <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded ${badge.bg} ${badge.color}`}
                        >
                            <span className="material-symbols-outlined text-xl">{badge.icon}</span>
                        </div>
                        <div>
                            <p className="text-text-primary text-xs font-bold">{badge.title}</p>
                            <p className="text-text-muted text-[10px]">Earned {badge.date}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
