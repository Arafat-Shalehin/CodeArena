'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';

/**
 * @typedef {Object} AuthContextValue
 * @property {Object|null}  user              - The logged-in user object (backend Users schema).
 * @property {boolean}      isAuthenticated   - Whether a user is currently logged in.
 * @property {Function}     logout            - Clears auth state via Firebase.
 * @property {Function}     updateProfile     - Updates the local user state.
 * @property {boolean}      isLoading         - Indicates if auth state is resolving.
 */

const AuthContext = createContext(/** @type {AuthContextValue} */(undefined));

const STORAGE_KEY = 'codearena_auth_user_preferences';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Hydrate user profile changes (like avatarSeed) from localStorage to overlay on top of DB user
    const [localPreferences, setLocalPreferences] = useState({});

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) setLocalPreferences(JSON.parse(stored));
        } catch { }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const username = firebaseUser.displayName?.toLowerCase().replace(/\s+/g, '_') || firebaseUser.email.split('@')[0];
                    setUser({
                        firebaseUid: firebaseUser.uid,
                        email: firebaseUser.email,
                        name: firebaseUser.displayName || username,
                        role: 'user',
                        username,
                        bio: '',
                        avatarSeed: firebaseUser.photoURL || username,
                        stats: {
                            rating: 0,
                            problemsSolved: { easy: 0, medium: 0, hard: 0, total: 0 },
                            accuracy: 0,
                            globalRank: null,
                            languageStats: {},
                            contributions: [],
                            achievements: [],
                        },
                        ...localPreferences
                    });
                } catch (error) {
                    console.error('Error during auth init:', error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [localPreferences]);

    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateProfile = useCallback((updatedData) => {
        setLocalPreferences((prev) => {
            const newPrefs = { ...prev, ...updatedData };
            return newPrefs;
        });

        // Persist to localStorage outside of the setState updater (no side effects in updater)
        const currentPrefs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const merged = { ...currentPrefs, ...updatedData };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

        setUser((prevUser) => {
            if (!prevUser) return null;
            return { ...prevUser, ...updatedData };
        });
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, logout, updateProfile, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (ctx === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
}
