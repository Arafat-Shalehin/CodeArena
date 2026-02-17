import useSWR from 'swr';
import { leaderboardService } from '@/services/leaderboard.service';

/**
 * Custom hook to fetch leaderboard rankings.
 * @returns {Object} { users, isLoading, error }
 */
export function useLeaderboard() {
    const { data, error, isLoading } = useSWR('leaderboard/rankings', () =>
        leaderboardService.getRankings()
    );

    return {
        users: data || [],
        isLoading,
        error
    };
}

/**
 * Custom hook to fetch platform stats.
 * @returns {Object} { stats, isLoading, error }
 */
export function useStats() {
    const { data, error, isLoading } = useSWR('leaderboard/stats', () =>
        leaderboardService.getStats()
    );

    return {
        stats: data || [],
        isLoading,
        error
    };
}
