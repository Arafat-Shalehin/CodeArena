'use client'

import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((r) => r.json())

/**
 * Fetch a single contest by ID.
 * @param {string} id - Contest MongoDB ObjectId
 */
export function useContest(id) {
    const { data, error, isLoading, mutate } = useSWR(
        id ? `/api/contests/${id}/public` : null,
        fetcher,
        { refreshInterval: 60_000 }
    )

    return {
        contest: data?.data || null,
        isLoading,
        error,
        mutate,
    }
}
