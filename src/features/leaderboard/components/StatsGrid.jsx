import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function StatsGrid({ stats }) {
    // Default stats if none provided (e.g. for guest user or loading)
    const data = stats || {
        rank: 42,
        points: "12,450",
        streak: 12,
        winRate: "78%"
    };

    const items = [
        {
            label: "Your Rank",
            value: `#${data.rank}`,
            icon: "leaderboard",
            color: "text-primary",
            bg: "bg-primary/10 border-primary/20"
        },
        {
            label: "Total Points",
            value: data.points,
            icon: "stars",
            color: "text-indigo-500",
            bg: "bg-indigo-500/10 border-indigo-500/20"
        },
        {
            label: "Daily Streak",
            value: `${data.streak} Days`,
            icon: "local_fire_department",
            color: "text-orange-500",
            bg: "bg-orange-500/10 border-orange-500/20"
        },
        {
            label: "Win Rate",
            value: data.winRate,
            icon: "trending_up",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10 border-emerald-500/20"
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {items.map((item, idx) => (
                <Card key={idx} className={`border ${item.bg} backdrop-blur-sm bg-opacity-50 hover:bg-opacity-80 transition-colors`}>
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className={`p-3 rounded-xl mb-3 ${item.bg} ${item.color}`}>
                            <span className="material-symbols-outlined text-2xl">
                                {item.icon}
                            </span>
                        </div>
                        <div className="text-sm font-bold text-text-light uppercase tracking-widest mb-1">
                            {item.label}
                        </div>
                        <div className={`text-2xl md:text-3xl font-mono font-bold ${item.color}`}>
                            {item.value}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
