/**
 * Leaderboard Client Service
 * 
 * Provides an interface for client-side components to fetch leaderboard data.
 * Currently uses mock data to avoid server-side dependency issues in hooks.
 */

import { leaderboardUsers, leaderboardStats } from '@/features/leaderboard/data/leaderboard.data';

export const leaderboardService = {
    /**
     * Fetch global rankings
     * @returns {Promise<Array>}
     */
    getRankings: async () => {
        // Simulate API delay for realistic behavior if needed, 
        // but for now returning directly for simplicity.
        return leaderboardUsers;
    },

    /**
     * Fetch platform-wide statistics
     * @returns {Promise<Array>}
     */
    getStats: async () => {
        return leaderboardStats;
    }
};
