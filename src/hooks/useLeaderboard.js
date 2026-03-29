import useSWR from 'swr'

const ITEMS_PER_PAGE = 10
const fetcher = (url) => fetch(url).then((res) => res.json())

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
    const params = new URLSearchParams()
    params.set('page', page)
    params.set('limit', limit)
    params.set('league', league)
    params.set('timeframe', timeframe)
    if (search) params.set('search', search)

    const { data, error, isLoading } = useSWR(`/api/leaderboard?${params.toString()}`, fetcher)

    const users = data?.success
        ? data.data.map((u, index) => ({
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
        : []

    return {
        users,
        isLoading,
        error: error || (data && !data.success ? data.error : null),
    }
}
