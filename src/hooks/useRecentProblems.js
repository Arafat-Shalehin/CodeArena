'use client'

import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

/**
 * Hook to fetch recent problems with SWR for caching and revalidation.
 * @param {number} limit - Number of problems to fetch
 * @returns {Object} { problems, isLoading, error }
 */
export function useRecentProblems(limit = 3) {
    const { data, error, isLoading } = useSWR(`/api/problems?limit=${limit}`, fetcher)

    return {
        problems: data?.success ? data.data : [],
        isLoading,
        error: error || (data && !data.success ? data.error : null),
    }
}
