'use client'

import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

/**
 * Hook to fetch user feed data with SWR caching.
 * @returns {Object} { feed, isLoading, error, mutate }
 */
export function useUserFeed() {
    const { data, error, isLoading, mutate } = useSWR('/api/users/feed', fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
    })

    return {
        feed: data?.success ? data.data : [],
        isLoading,
        error: error || (data && !data.success ? data.error : null),
        mutate,
    }
}
