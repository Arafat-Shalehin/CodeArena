'use client'

import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

/**
 * Hook to fetch dashboard sidebar data with SWR caching.
 * @returns {Object} { sidebarData, isLoading, error, mutate }
 */
export function useDashboardSidebar() {
    const { data, error, isLoading, mutate } = useSWR('/api/feed/sidebar', fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
    })

    return {
        sidebarData: data?.success
            ? data.data
            : {
                  trendingProblems: [],
                  suggestedUsers: [],
                  upcomingContests: [],
                  topContributors: [],
              },
        isLoading,
        error: error || (data && !data.success ? data.error : null),
        mutate,
    }
}
