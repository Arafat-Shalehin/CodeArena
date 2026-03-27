'use client'

import { useState } from 'react'

/**
 * Hook to register/unregister a user for a contest.
 * @param {string} contestId
 */
export function useContestRegistration(contestId) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const register = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/contests/${contestId}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Registration failed')
            return data
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    return { register, isLoading, error }
}
