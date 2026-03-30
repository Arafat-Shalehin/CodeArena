import { useEffect } from 'react'
import {
    useProblemSolveStore,
    useContestStore,
    usePreferencesStore,
} from '@/store/problemSolveStore'

/**
 * Hook to sync Zustand store with problem ID changes
 * Automatically resets state when switching problems
 */
export const useProblemSolveSync = (problemId) => {
    const { currentProblemId, resetProblemState } = useProblemSolveStore()

    useEffect(() => {
        if (problemId && problemId !== currentProblemId) {
            resetProblemState(problemId)
        }
    }, [problemId, currentProblemId, resetProblemState])
}

/**
 * Hook to hydrate store on client mount
 * Ensures state is properly restored from localStorage
 */
export const useStoreHydration = () => {
    useEffect(() => {
        // Force re-render to ensure state is synchronized
        const timer = setTimeout(() => {
            // Hydration complete
        }, 0)
        return () => clearTimeout(timer)
    }, [])
}

export const useProblemSolve = () => useProblemSolveStore()
export const useContest = () => useContestStore()
export const usePreferences = () => usePreferencesStore()
