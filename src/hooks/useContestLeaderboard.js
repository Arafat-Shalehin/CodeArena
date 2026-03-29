'use client'

import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((r) => r.json())

/**
 * Hook to fetch real-time leaderboard data for a specific contest.
 * Polls every 5 seconds to provide "live" updates without WebSockets.
 */
export function useContestLeaderboard(contestId) {
    const { data, error, isLoading, mutate } = useSWR(
        contestId ? `/api/contests/${contestId}/leaderboard/live` : null,
        fetcher,
        {
            refreshInterval: () =>
                typeof document !== 'undefined' && document.visibilityState === 'visible'
                    ? 10000
                    : 30000,
            revalidateOnFocus: true,
        }
    )

    return {
        leaderboard: data?.success ? data.data : [],
        isLoading: isLoading && !data,
        error,
        mutate,
    }
}
