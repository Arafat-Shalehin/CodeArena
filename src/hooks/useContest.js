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
        {
            refreshInterval: (data) => {
                const contest = data?.data
                if (!contest || contest.status === 'completed') return 0 // Stop polling if ended

                const now = Date.now()
                const start = new Date(contest.startTime).getTime()
                const diff = start - now

                // If contest is within 5 minutes of starting, poll every 5 seconds
                if (diff > 0 && diff < 5 * 60 * 1000) return 5_000
                // If contest is within 15 minutes of starting, poll every 20 seconds
                if (diff > 0 && diff < 15 * 60 * 1000) return 20_000

                return 60_000 // Default to 1 minute
            },
            revalidateOnFocus: true,
        }
    )

    return {
        contest: data?.data || null,
        isLoading,
        error,
        mutate,
    }
}
