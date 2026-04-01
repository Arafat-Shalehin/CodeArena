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

            const contentType = res.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
                const text = await res.text()
                console.error('Non-JSON response received:', text)
                throw new Error(`Server error: ${res.status} ${res.statusText}`)
            }

            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Registration failed')
            return data
        } catch (err) {
            console.error('Registration Hook Error:', err)
            setError(err.message)
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    return { register, isLoading, error }
}
