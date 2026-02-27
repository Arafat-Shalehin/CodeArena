'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { auth } from '@/lib/firebase/config'
import { onAuthStateChanged, signOut } from 'firebase/auth'

/**
 * @typedef {Object} AuthContextValue
 * @property {Object|null}  user              - The logged-in user object (backend Users schema).
 * @property {boolean}      isAuthenticated   - Whether a user is currently logged in.
 * @property {Function}     logout            - Clears auth state via Firebase.
 * @property {Function}     updateProfile     - Updates the local user state.
 * @property {boolean}      isLoading         - Indicates if auth state is resolving.
 */

const AuthContext = createContext(/** @type {AuthContextValue} */(undefined))

const STORAGE_KEY = 'codearena_auth_user_preferences'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // Hydrate user profile changes (like avatarSeed) from localStorage to overlay on top of DB user
    const [localPreferences, setLocalPreferences] = useState({})

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) setLocalPreferences(JSON.parse(stored))
        } catch { }
    }, [])

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // 1. Sync Firebase User with our Backend (and set httpOnly cookie)
                    const syncRes = await fetch('/api/auth/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL,
                            authProvider: 'firebase'
                        })
                    })

                    const syncData = await syncRes.json()

                    if (syncData.success) {
                        // 2. Set the combined user object (MongoDB data + UI preferences)
                        const dbUser = syncData.data?.user || syncData.user // flexible for API response shape
                        setUser({
                            ...dbUser,
                            firebaseUid: firebaseUser.uid,
                            ...localPreferences,
                        })
                    } else {
                        console.error('Backend sync failed:', syncData.error)
                        // Fallback to minimal user object if sync fails but Firebase is okay
                        setUser({
                            firebaseUid: firebaseUser.uid,
                            email: firebaseUser.email,
                            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                            ...localPreferences,
                        })
                    }
                } catch (error) {
                    console.error('Error during auth init/sync:', error)
                }
            } else {
                setUser(null)
            }
            setIsLoading(false)
        })

        return () => unsubscribe()
    }, [localPreferences])

    const logout = useCallback(async () => {
        setIsLoading(true)
        try {
            await signOut(auth)
            setUser(null)
        } catch (error) {
            console.error('Error logging out:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const updateProfile = useCallback((updatedData) => {
        setLocalPreferences((prev) => {
            const newPrefs = { ...prev, ...updatedData }
            return newPrefs
        })

        // Persist to localStorage outside of the setState updater (no side effects in updater)
        const currentPrefs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
        const merged = { ...currentPrefs, ...updatedData }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))

        setUser((prevUser) => {
            if (!prevUser) return null
            return { ...prevUser, ...updatedData }
        })
    }, [])

    return (
        <AuthContext.Provider
            value={{ user, isAuthenticated: !!user, logout, updateProfile, isLoading }}
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
