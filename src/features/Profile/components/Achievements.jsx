'use client';

/**
 * @component Achievements
 * @description Displays a grid of achievement badges and a list of recently
 * earned badges. Earned badges show color and tooltips on hover, unearned
 * badges are greyscaled.
 *
 * @returns {JSX.Element} The rendered achievements section.
 */

// Achievement Data
const achievementBadges = [
    { id: 1, icon: 'bolt', color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20', label: 'Problem Solver', earned: true },
    { id: 2, icon: 'timer', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', label: 'Speed Demon', earned: true },
    { id: 3, icon: 'workspace_premium', color: 'text-success', bg: 'bg-success/10', border: 'border-success/20', label: 'Contest Winner', earned: true },
    { id: 4, icon: 'stars', color: 'text-info', bg: 'bg-info/10', border: 'border-info/20', label: 'Top Rated', earned: true },
    { id: 5, icon: 'military_tech', earned: false },
    { id: 6, icon: 'social_leaderboard', earned: false },
    { id: 7, icon: 'terminal', earned: false },
    { id: 8, icon: 'bug_report', earned: false },
];

const recentBadges = [
    { id: 1, title: 'Problem Solver - 100 Problems', date: 'Jan 12, 2025', icon: 'bolt', color: 'text-accent', bg: 'bg-accent/20' },
    { id: 2, title: 'Speed Demon', date: 'Dec 28, 2024', icon: 'timer', color: 'text-warning', bg: 'bg-warning/20' },
];

export default function Achievements({ achievements }) {
    if (!achievements || achievements.length === 0) {
        return null;
    }

    // Default to the provided achievements or mock if none are passed in temporarily
    const badges = achievements;
    const earnedCount = badges.filter(b => b.earned).length;

    return (
        <section className="bg-bg-subtle border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">
                    Achievements
                </h3>
                <span className="text-xs text-text-muted font-medium">{earnedCount} Earned</span>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                {badges.map((badge) => (
                    <div
                        key={badge.id}
                        className={`aspect-square rounded-full flex items-center justify-center border transition-transform hover:scale-110 cursor-help group relative ${badge.earned
                            ? `${badge.bg} ${badge.border} ${badge.color}`
                            : 'bg-bg-muted/50 border-border/50 text-text-muted grayscale'
                            }`}
                    >
                        <span className="material-symbols-outlined text-2xl">
                            {badge.icon}
                        </span>

                        {/* Tooltip on Hover */}
                        {badge.earned && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-text-primary text-bg-page text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                                {badge.label}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Recent Badges List */}
            {badges.length > 0 && (
                <div className="space-y-3">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">
                        Recent Badges
                    </p>

                    {badges.filter(b => b.earned).slice(0, 3).map((badge) => (
                        <div
                            key={badge.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-bg-muted/20 border border-border/50"
                        >
                            <div
                                className={`h-10 w-10 shrink-0 rounded flex items-center justify-center ${badge.bg} ${badge.color}`}
                            >
                                <span className="material-symbols-outlined text-xl">
                                    {badge.icon}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-text-primary">
                                    {badge.title}
                                </p>
                                <p className="text-[10px] text-text-muted">Earned {badge.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

Achievements.displayName = 'Achievements';
