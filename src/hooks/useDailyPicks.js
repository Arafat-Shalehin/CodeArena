'use client'

import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

/**
 * Hook to fetch daily picks with SWR caching.
 * @returns {Object} { dailyPicks, isLoading, error }
 */
export function useDailyPicks() {
    const { data, error, isLoading } = useSWR('/api/feed/picks', fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
    })

    return {
        dailyPicks: data?.success ? data.data.picks : [],
        isLoading,
        error: error || (data && !data.success ? data.error : null),
    }
}
