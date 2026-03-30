'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { auth } from '@/lib/firebase/config'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { toast } from 'sonner'

/**
 * @typedef {Object} AuthContextValue
 * @property {Object|null}  user              - The logged-in user object (backend Users schema).
 * @property {boolean}      isAuthenticated   - Whether a user is currently logged in.
 * @property {Function}     logout            - Clears auth state via Firebase.
 * @property {Function}     updateProfile     - Updates the local user state.
 * @property {boolean}      isLoading         - Indicates if auth state is resolving.
 */

const AuthContext = createContext(/** @type {AuthContextValue} */ (undefined))

const STORAGE_KEY = 'codearena_auth_user_preferences'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // Hydrate user profile changes (like avatarSeed) from localStorage to overlay on top of DB user
    const [localPreferences, setLocalPreferences] = useState({})

    // 1. Initial hydration of preferences from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) setLocalPreferences(JSON.parse(stored))
        } catch {}
    }, [])

    // 2. Core Firebase state listener (Runs once on mount)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // IMPORTANT: Prevent premature redirects by keeping isLoading true until sync finishes
                setIsLoading(true)
                try {
                    // Sync Firebase User with our Backend (and set httpOnly cookie)
                    const syncRes = await fetch('/api/auth/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL,
                            authProvider: 'firebase',
                        }),
                    })

                    const syncData = await syncRes.json()

                    if (syncData.success) {
                        const dbUser = syncData.data?.user || syncData.user
                        const userId = dbUser._id?.toString()

                        setUser((prev) => ({
                            ...dbUser,
                            id: userId,
                            _id: userId,
                            firebaseUid: firebaseUser.uid,
                            // Ensure local preferences are applied if already loaded
                            ...prev?.localPreferences,
                        }))
                    } else {
                        setUser({
                            firebaseUid: firebaseUser.uid,
                            email: firebaseUser.email,
                            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                        })
                    }
                } catch (error) {
                    console.error('Error during auth init/sync:', error)
                    toast.error('Session sync failed. Please try logging in again.')
                } finally {
                    setIsLoading(false)
                }
            } else {
                setUser(null)
                setIsLoading(false)
            }
        })

        return () => unsubscribe()
    }, [])

    // 3. Merging Preferences when they change (Independent of Auth listener)
    useEffect(() => {
        if (user && Object.keys(localPreferences).length > 0) {
            setUser((prev) => ({ ...prev, ...localPreferences }))
        }
    }, [localPreferences])

    const logout = useCallback(async () => {
        setIsLoading(true)
        try {
            // Logout API endpoint to clear httpOnly cookie
            await fetch('/api/auth/logout', { method: 'POST' })

            await signOut(auth)
            setUser(null)
            setLocalPreferences({})
            localStorage.removeItem(STORAGE_KEY)
            toast.success('Logged out successfully')
        } catch (error) {
            console.error('Error logging out:', error)
            toast.error('Failed to logout. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const updateProfile = useCallback((updatedData) => {
        setLocalPreferences((prev) => {
            const newPrefs = { ...prev, ...updatedData }
            delete newPrefs.stats // Never persist dynamic stats in local preferences
            return newPrefs
        })

        // Persist to localStorage outside of the setState updater
        const currentPrefs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
        const merged = { ...currentPrefs, ...updatedData }
        delete merged.stats // Never persist dynamic stats
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))

        setUser((prevUser) => {
            if (!prevUser) return null
            return { ...prevUser, ...updatedData }
        })
    }, [])

    const syncUser = useCallback(async () => {
        try {
            setIsLoading(true)
            const res = await fetch('/api/auth/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ authProvider: 'firebase' }),
            })
            const data = await res.json()
            if (data.success) {
                const dbUser = data.data?.user || data.user
                const userId = dbUser._id?.toString()
                setUser((prev) => ({
                    ...prev,
                    ...dbUser,
                    id: userId,
                    _id: userId,
                    ...localPreferences,
                }))
                return dbUser
            }
        } catch (error) {
            console.error('Failed to sync user:', error)
        } finally {
            setIsLoading(false)
        }
    }, [localPreferences])

    return (
        <AuthContext.Provider
            value={{ user, isAuthenticated: !!user, logout, updateProfile, syncUser, isLoading }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (ctx === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return ctx
}
