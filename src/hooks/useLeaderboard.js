'use client'

import useSWR from 'swr'

/**
 * Standard fetcher for SWR
 */
const fetcher = (url) => fetch(url).then((res) => res.json())

/**
 * Custom hook to fetch leaderboard rankings.
 * Fetches the top users for the homepage preview.
 *
 * @param {number} limit - Number of users to fetch (default: 3 for homepage)
 * @returns {Object} { users, isLoading, error }
 */
export function useLeaderboard(limit = 3) {
    const { data, error, isLoading } = useSWR(`/api/leaderboard?limit=${limit}`, fetcher)

    // Transform API data to match the component's expected format if necessary
    const users =
        data?.success && Array.isArray(data.data)
            ? data.data.map((u, index) => ({
                  _id: u._id,
                  rank: index + 1,
                  score: u.stats?.score || 0,
                  submissions: u.stats?.accepted || 0,
                  userId: {
                      _id: u._id,
                      username: u.username || u.name || 'Anonymous',
                  },
                  title:
                      u.stats?.score > 5000
                          ? 'Supreme Architect'
                          : u.stats?.score > 1000
                            ? 'Elite Engineer'
                            : 'Code Warrior',
              }))
            : []

    return {
        users,
        isLoading,
        error,
    }
}

/**
 * Custom hook to fetch platform stats.
 * @returns {Object} { stats, isLoading, error }
 */
export function useStats() {
    const { data, error, isLoading } = useSWR('/api/stats', fetcher)

    return {
        stats: data?.success ? data.data : [],
        isLoading,
        error,
    }
}
