import { leaderboardUsers, leaderboardStats } from '@/features/leaderboard/data/leaderboard.data';

export const leaderboardService = {
    /**
     * Fetches the global leaderboard rankings.
     * @param {Object} params - Filtering and pagination parameters.
     * @returns {Promise<Array>} List of user rankings.
     */
    getRankings: async (params = {}) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return leaderboardUsers;
    },

    /**
     * Fetches platform-wide statistics.
     * @returns {Promise<Array>} List of platform stats.
     */
    getStats: async () => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return leaderboardStats;
    }
};
