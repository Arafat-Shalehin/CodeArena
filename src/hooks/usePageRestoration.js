'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProblemSolveStore } from '@/store/problemSolveStore'

/**
 * Restore user to the page they were on before reload
 * Call this in root layout or top-level component
 */
export const usePageRestoration = () => {
    const router = useRouter()

    useEffect(() => {
        // Use getState() to avoid re-renders from store reference changes
        const state = useProblemSolveStore.getState()
        const currentPage = state.currentPage
        const problemId = state.currentProblemId
        const submissionId = state.submissionViewId

        console.log(
            '[PageRestore] Current page:',
            currentPage,
            'Problem:',
            problemId,
            'Submission:',
            submissionId
        )

        // If user was viewing a submission, redirect to submission page
        if (currentPage === 'submission-details' && submissionId) {
            console.log('[PageRestore] Redirecting to submission page:', submissionId)
            router.push(`/submissions/${submissionId}`)
        } else if (currentPage === 'ai-feedback' && submissionId) {
            console.log('[PageRestore] Redirecting to AI feedback page:', submissionId)
            // Adjust path as needed
            router.push(`/submissions/${submissionId}?tab=ai-feedback`)
        } else if (currentPage === 'problem-solve' && problemId) {
            console.log('[PageRestore] Already on problem solve page or redirecting:', problemId)
            // Already on correct page or will be routed by current URL
        }
    }, [router]) // Only router dependency since it's stable
}

/**
 * Mark that user is viewing a submission
 * Call this when navigating to submission details page
 */
export const useMarkSubmissionView = (submissionId) => {
    useEffect(() => {
        if (submissionId) {
            console.log('[SubmissionView] Marking view for submission:', submissionId)
            // Use getState() to avoid store reference changes
            useProblemSolveStore.getState().setCurrentPage('submission-details')
            useProblemSolveStore.getState().setSubmissionViewId(submissionId)
        }
    }, [submissionId]) // Only depends on submissionId
}

/**
 * Mark that user is viewing a problem
 * Call this in problem solver layout
 */
export const useMarkProblemView = (problemId) => {
    useEffect(() => {
        if (problemId) {
            console.log('[ProblemView] Marking view for problem:', problemId)
            // Use getState() to avoid store reference changes
            useProblemSolveStore.getState().setCurrentPage('problem-solve')
            useProblemSolveStore.getState().setCurrentProblemId(problemId)
        }
    }, [problemId]) // Only depends on problemId
}
