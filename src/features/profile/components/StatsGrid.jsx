'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { getStatusCards } from '../data/status.data';

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
  const { user: authUser } = useAuth();
  const displayUser = userProp || authUser;
  const cards = getStatusCards(displayUser?.stats);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((stat) => (
        <Card
          key={stat.label}
          className={`border-l-4 ${stat.border} shadow-sm`}
        >
          <CardContent className="p-6">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

StatsGrid.displayName = 'StatsGrid';
