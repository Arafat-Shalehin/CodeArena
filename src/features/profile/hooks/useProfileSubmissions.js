'use client'

import { useState, useCallback } from 'react'

export function useProfileSubmissions(userId, initialLimit = 5) {
    const [submissions, setSubmissions] = useState([])
    const [hasMoreSubmissions, setHasMoreSubmissions] = useState(true)
    const [isSubmissionsLoading, setIsSubmissionsLoading] = useState(false)

    const fetchSubmissions = useCallback(
        async (limit = initialLimit, offset = 0, reset = false) => {
            if (!userId) return
            setIsSubmissionsLoading(true)
            try {
                const res = await fetch(
                    `/api/submissions?userId=${userId}&limit=${limit}&offset=${offset}`
                )
                const data = await res.json()
                if (data.success) {
                    const newSubs = data.data || []
                    const total = data.pagination?.total || 0
                    setSubmissions((prev) => {
                        const updated = reset ? newSubs : [...prev, ...newSubs]
                        setHasMoreSubmissions(updated.length < total)
                        return updated
                    })
                }
            } catch (err) {
                console.error('Failed to fetch submissions:', err)
            } finally {
                setIsSubmissionsLoading(false)
            }
        },
        [userId, initialLimit]
    )

    const handleLoadMore = useCallback(() => {
        fetchSubmissions(initialLimit, submissions.length)
    }, [fetchSubmissions, submissions.length, initialLimit])

    const handleViewAll = useCallback(() => {
        fetchSubmissions(100, 0, true)
    }, [fetchSubmissions])

    return {
        submissions,
        hasMoreSubmissions,
        isSubmissionsLoading,
        fetchSubmissions,
        handleLoadMore,
        handleViewAll,
    }
}
