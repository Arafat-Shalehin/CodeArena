import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Star, Flame, TrendingUp } from 'lucide-react'

export function StatsGrid({ stats }) {
    // Default stats if none provided (e.g. for guest user or loading)
    const data = stats || {
        rank: 42,
        points: '12,450',
        streak: 12,
        winRate: '78%',
    }

    const items = [
        {
            label: 'Your Rank',
            value: `#${data.rank}`,
            icon: <Trophy className="size-6" />,
            color: 'text-primary',
            bg: 'bg-primary/10 border-primary/20',
        },
        {
            label: 'Total Points',
            value: data.points,
            icon: <Star className="size-6" />,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10 border-indigo-500/20',
        },
        {
            label: 'Daily Streak',
            value: `${data.streak} Days`,
            icon: <Flame className="size-6" />,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10 border-orange-500/20',
        },
        {
            label: 'Win Rate',
            value: data.winRate,
            icon: <TrendingUp className="size-6" />,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
        },
    ]

    return (
        <div className="mb-16 grid grid-cols-2 gap-4 md:grid-cols-4">
            {items.map((item, idx) => (
                <Card
                    key={idx}
                    className={`border ${item.bg} bg-opacity-50 hover:bg-opacity-80 backdrop-blur-sm transition-colors`}
                >
                    <CardContent className="flex flex-col items-center p-6 text-center">
                        <div
                            className={`mb-3 flex items-center justify-center rounded-xl p-3 ${item.bg} ${item.color}`}
                        >
                            {item.icon}
                        </div>
                        <div className="text-text-light mb-1 text-sm font-bold tracking-widest uppercase">
                            {item.label}
                        </div>
                        <div className={`font-mono text-2xl font-bold md:text-3xl ${item.color}`}>
                            {item.value}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
