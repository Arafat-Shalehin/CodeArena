import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Data
import { leaderboardUsers } from '../data/leaderboard.data';

/**
 * @component TopThreePodium
 * @description Displays the top 3 users in a podium-style layout.
 * 
 * Features:
 * - Desktop: Row layout (2nd-1st-3rd for visual podium effect)
 * - Mobile: Column layout (1st full width, then 2nd/3rd in grid)
 * - Medal badges and rank indicators
 * - Design token-based styling
 * 
 * @returns {JSX.Element} The rendered Top 3 podium.
 */
export function TopThreePodium() {
    const topThree = leaderboardUsers.slice(0, 3);
    const [first, second, third] = topThree;

    // Medal emoji and colors
    const getMedalInfo = (rank) => {
        switch (rank) {
            case 1:
                return { emoji: '🥇', badge: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
            case 2:
                return { emoji: '🥈', badge: 'bg-gray-100 text-gray-700 border-gray-300' };
            case 3:
                return { emoji: '🥉', badge: 'bg-orange-100 text-orange-700 border-orange-300' };
            default:
                return { emoji: '', badge: '' };
        }
    };

    const PodiumCard = ({ user, className }) => {
        const medalInfo = getMedalInfo(user.rank);

        return (
            <div className={`relative flex flex-col items-center text-center p-6 rounded-2xl bg-bg-subtle border-2 border-border hover:border-accent transition-all ${className}`}>
                {/* Medal Badge */}
                <Badge className={`absolute -top-3 ${medalInfo.badge} px-3 py-1 text-sm font-bold shadow-sm`}>
                    {medalInfo.emoji} #{user.rank} Champion
                </Badge>

                {/* Avatar */}
                <Avatar className="size-20 md:size-24 mb-4 mt-2 border-4 border-accent shadow-lg">
                    <AvatarFallback className="bg-accent/10 text-accent text-2xl font-bold">
                        {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                {/* Username */}
                <h3 className="text-lg md:text-xl font-display font-bold text-text-primary mb-1">
                    {user.username}
                </h3>

                {/* Title */}
                <p className="text-xs md:text-sm text-text-muted mb-3">
                    {user.title}
                </p>

                {/* Stats */}
                <div className="flex gap-4 text-center mt-2">
                    <div>
                        <div className="text-xl md:text-2xl font-bold text-accent">
                            {user.points.toLocaleString()} pts
                        </div>
                        <div className="text-[10px] md:text-xs text-text-muted uppercase tracking-wider">
                            Points
                        </div>
                    </div>
                    <div className="w-px bg-border"></div>
                    <div>
                        <div className="text-xl md:text-2xl font-bold text-text-primary">
                            {user.solved.toLocaleString()}
                        </div>
                        <div className="text-[10px] md:text-xs text-text-muted uppercase tracking-wider">
                            Solved
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section className="my-12 md:my-16">
            {/* Desktop: 2-1-3 Row Layout */}
            <div className="hidden md:grid md:grid-cols-3 gap-6 items-end">
                {/* 2nd Place */}
                <PodiumCard user={second} className="transform scale-90" />

                {/* 1st Place */}
                <PodiumCard user={first} className="transform scale-105 z-10" />

                {/* 3rd Place */}
                <PodiumCard user={third} className="transform scale-90" />
            </div>

            {/* Mobile: 1st Full Width, Then 2nd/3rd Grid */}
            <div className="md:hidden space-y-4">
                {/* 1st Place */}
                <PodiumCard user={first} />

                {/* 2nd and 3rd in Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <PodiumCard user={second} />
                    <PodiumCard user={third} />
                </div>
            </div>
        </section>
    );
}
