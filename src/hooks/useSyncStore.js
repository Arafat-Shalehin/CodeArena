'use client'

import { useEffect } from 'react'
import { useProblemSolveStore } from '@/store/problemSolveStore'

/**
 * Hook to sync Context API state with Zustand + localStorage
 * Ensures state persists across page reloads and navigations
 */
export const useSyncContextWithZustand = (contextState) => {
    const store = useProblemSolveStore()

    // Sync from Zustand to Context when Zustand state changes
    useEffect(() => {
        if (contextState?.code && contextState.updateCode) {
            if (contextState.code !== store.code) {
                contextState.updateCode(store.code)
            }
        }
    }, [store.code])

    // Sync from Context to Zustand when Context state changes
    useEffect(() => {
        if (contextState?.code !== store.code) {
            store.setCode(contextState?.code || '')
        }
    }, [contextState?.code])

    // Sync language
    useEffect(() => {
        if (contextState?.language !== store.language) {
            store.setLanguage(contextState?.language || 'python')
        }
    }, [contextState?.language])

    // Sync problem ID
    useEffect(() => {
        if (contextState?.problemId !== store.currentProblemId) {
            store.setCurrentProblemId(contextState?.problemId || null)
        }
    }, [contextState?.problemId])
}

/**
 * Restore code from Zustand store
 * Call this in useEffect to load persisted code
 */
export const restoreCodeFromStore = (problemId, language) => {
    const store = useProblemSolveStore.getState()

    // If we're on the same problem and have code, return it
    if (store.currentProblemId === problemId && store.code) {
        return store.code
    }

    // Otherwise return null and use default
    return null
}

/**
 * Save code to Zustand store
 * Call this when code changes
 */
export const saveCodeToStore = (code, problemId, language) => {
    const store = useProblemSolveStore.getState()
    store.setCode(code)

    // Also ensure it's saved to localStorage via Zustand's persist middleware
    store.setLanguage(language)
    store.setCurrentProblemId(problemId)
}
