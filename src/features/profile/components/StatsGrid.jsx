'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
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
        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {cards.map((stat) => {
                const Icon = stat.icon
                return (
                    <motion.div
                        key={stat.label}
                        whileHover={{ y: -4 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <Card
                            className={`bg-bg-page border-border cursor-default rounded-xl border-t-4 p-3 shadow-sm transition-all hover:shadow-md ${stat.border}`}
                        >
                            <CardContent className="p-0">
                                <div className="flex items-center gap-2">
                                    {Icon && (
                                        <Icon
                                            className={`h-3.5 w-3.5 ${stat.border.replace('border-', 'text-')}`}
                                            strokeWidth={2.5}
                                        />
                                    )}
                                    <p className="text-text-muted text-[10px] font-bold tracking-widest uppercase">
                                        {stat.label}
                                    </p>
                                </div>
                                <p className="text-text-primary italic-none mt-1.5 text-2xl font-bold">
                                    {stat.value}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )
            })}
        </div>
    )
}

StatsGrid.displayName = 'StatsGrid'
