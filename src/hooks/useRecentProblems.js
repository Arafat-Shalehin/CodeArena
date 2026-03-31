'use client'

import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

/**
 * Hook to fetch recent problems with SWR for caching and revalidation.
 * @param {Object} options - Options for fetching
 * @param {number} options.limit - Number of problems to fetch
 * @param {string} options.sortBy - Sort criteria (e.g., 'random', 'recent')
 * @returns {Object} { problems, isLoading, error }
 */
export function useRecentProblems(limit = 3, sortBy = 'recent', enabled = true) {
    const { data, error, isLoading } = useSWR(
        enabled ? `/api/problems?limit=${limit}&sortBy=${sortBy}` : null,
        fetcher
    )

    return {
        problems: data?.success ? data.data : [],
        isLoading,
        error: error || (data && !data.success ? data.error : null),
    }
}
