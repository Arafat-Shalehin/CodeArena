'use client'

import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((r) => r.json())

/**
 * Fetch paginated list of contests, optionally filtered by status.
 * @param {string} [status] - 'upcoming' | 'active' | 'completed'
 */
export function useContests(status) {
    const url = status ? `/api/contests?status=${status}&limit=20` : `/api/contests?limit=20`

    const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
        refreshInterval: 30_000, // re-fetch every 30 s for live status updates
    })

    return {
        contests: data?.data || [],
        pagination: data?.pagination || null,
        isLoading,
        error,
        mutate,
    }
}
