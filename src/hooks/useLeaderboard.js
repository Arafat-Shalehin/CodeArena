import { useState, useEffect } from 'react'

const ITEMS_PER_PAGE = 10

/**
 * @hook useLeaderboard
 * Fetches the top users from /api/leaderboard and returns them in the
 * shape expected by LeaderboardPreviewSection.
 *
 * @returns {{ users: Array, isLoading: boolean, error: string|null }}
 */
export function useLeaderboard({
    page = 1,
    limit = ITEMS_PER_PAGE,
    search = '',
    league = 'all',
    timeframe = 'all_time',
} = {}) {
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const controller = new AbortController()

        const fetchLeaderboard = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const params = new URLSearchParams()
                params.set('page', page)
                params.set('limit', limit)
                params.set('league', league)
                params.set('timeframe', timeframe)
                if (search) params.set('search', search)

                const res = await fetch(`/api/leaderboard?${params.toString()}`, {
                    signal: controller.signal,
                })
                const json = await res.json()

                if (json.success) {
                    // Transform API users to the shape used by leaderboard components
                    const transformed = json.data.map((u, index) => ({
                        _id: u._id,
                        rank: (page - 1) * limit + index + 1,
                        score: u.stats?.score || 0,
                        submissions: u.stats?.accepted || 0,
                        userId: {
                            _id: u._id,
                            username: u.username || u.name || 'Anonymous',
                            email: u.email,
                            stats: u.stats,
                        },
                        title:
                            u.stats?.score > 5000
                                ? 'Supreme Architect'
                                : u.stats?.score > 1000
                                  ? 'Elite Engineer'
                                  : 'Code Warrior',
                        country: 'Global',
                        streak: 0,
                    }))
                    setUsers(transformed)
                } else {
                    throw new Error(json.error || 'Failed to fetch leaderboard')
                }
            } catch (err) {
                if (err.name === 'AbortError') return
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }

        fetchLeaderboard()
        return () => controller.abort()
    }, [page, limit, search, league, timeframe])

    return { users, isLoading, error }
}
