'use client'

/**
 * @component Achievements
 * @description Displays a grid of achievement badges and a list of recently
 * earned badges. Earned badges show color and tooltips on hover, unearned
 * badges are greyscaled.
 *
 * @returns {JSX.Element} The rendered achievements section.
 */

import { achievementBadges } from '../data/achievementBadges.data'
import { recentBadges } from '../data/recentBadges.data'

export default function Achievements({ achievements }) {
    if (!achievements || achievements.length === 0) {
        return null
    }

    // Default to the provided achievements or mock if none are passed in temporarily
    const badges = achievements
    const earnedCount = badges.filter((b) => b.earned).length

    return (
        <section className="bg-bg-subtle border-border rounded-lg border p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-text-primary text-lg font-semibold">Achievements</h3>
                <span className="text-text-muted text-xs font-medium">{earnedCount} Earned</span>
            </div>

            {/* Badges Grid */}
            <div className="mb-8 grid grid-cols-4 gap-4">
                {badges.map((badge) => (
                    <div
                        key={badge.id}
                        className={`group relative flex aspect-square cursor-help items-center justify-center rounded-full border transition-transform hover:scale-110 ${
                            badge.earned
                                ? `${badge.bg} ${badge.border} ${badge.color}`
                                : 'bg-bg-muted/50 border-border/50 text-text-muted grayscale'
                        }`}
                    >
                        <div className="[&_svg]:size-6">{badge.icon}</div>

                        {/* Tooltip on Hover */}
                        {badge.earned && (
                            <div className="bg-text-primary text-bg-page absolute -top-10 left-1/2 z-10 -translate-x-1/2 rounded px-2 py-1 text-[10px] whitespace-nowrap opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                                {badge.label}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Recent Badges List */}
            {badges.length > 0 && (
                <div className="space-y-3">
                    <p className="text-text-muted mb-2 text-[10px] font-bold tracking-widest uppercase">
                        Recent Badges
                    </p>

                    {badges
                        .filter((b) => b.earned)
                        .slice(0, 3)
                        .map((badge) => (
                            <div
                                key={badge.id}
                                className="bg-bg-muted/20 border-border/50 flex items-center gap-3 rounded-lg border p-3"
                            >
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded ${badge.bg} ${badge.color}`}
                                >
                                    <div className="[&_svg]:size-5">{badge.icon}</div>
                                </div>
                                <div>
                                    <p className="text-text-primary text-xs font-bold">
                                        {badge.title}
                                    </p>
                                    <p className="text-text-muted text-[10px]">
                                        Earned {badge.date}
                                    </p>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </section>
    )
}

Achievements.displayName = 'Achievements'
