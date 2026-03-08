'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { getStatusCards } from '../data/status.data'

/**
 * @component StatsGrid
 * @description Displays a grid of key user statistics (Problems Solved,
 * Contest Rating, Participated, Global Rank) with color-coded left borders.
 * Values are derived from the logged-in user's stats.
 * @param {Object} props
 * @param {Object} [props.user] - Optional user data override (for public profiles).
 * @returns {JSX.Element} The rendered stats grid.
 */
export default function StatsGrid({ user: userProp }) {
    const { user: authUser } = useAuth()
    const displayUser = userProp || authUser
    const cards = getStatusCards(displayUser?.stats)

    return (
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map((stat) => (
                <Card
                    key={stat.label}
                    className={`bg-bg-page border-border rounded-xl border-t-4 p-5 shadow-sm transition-shadow hover:shadow-md ${stat.border.replace('border-l', 'border-t')}`}
                >
                    <CardContent className="p-0">
                        <div className="flex items-center justify-between">
                            <p className="text-text-muted text-[10px] font-bold tracking-widest uppercase">
                                {stat.label}
                            </p>
                        </div>
                        <p className="text-text-primary mt-1 text-3xl font-bold">{stat.value}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

StatsGrid.displayName = 'StatsGrid'
