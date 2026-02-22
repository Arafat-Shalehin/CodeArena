'use client';

import useSWR from 'swr';
import { leaderboardUsers, leaderboardStats } from '@/features/leaderboard/data/leaderboard.data';

/**
 * Fetcher that returns mock data directly.
 * Replace with a real API call (e.g. fetch('/api/leaderboard')) when the backend endpoint is ready.
 */
const rankingsFetcher = () => Promise.resolve(leaderboardUsers);
const statsFetcher = () => Promise.resolve(leaderboardStats);

/**
 * Custom hook to fetch leaderboard rankings.
 * @returns {Object} { users, isLoading, error }
 */
export function useLeaderboard() {
    const { data, error, isLoading } = useSWR('mock/leaderboard/rankings', rankingsFetcher);

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
    const { data, error, isLoading } = useSWR('mock/leaderboard/stats', statsFetcher);

    return {
        stats: data || [],
        isLoading,
        error
    };
}
