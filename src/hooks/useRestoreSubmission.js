'use client'

import { useEffect } from 'react'
import { useProblemSolveStore } from '@/store/problemSolveStore'
import { useExecution } from '@/context/ExecutionContext'

/**
 * Restores submission details from Zustand when component mounts
 * Call this in submission detail pages to restore state after reload
 */
export const useRestoreSubmissionDetails = () => {
    const store = useProblemSolveStore()
    const execution = useExecution()

    useEffect(() => {
        // Restore submission data on mount
        if (store.submissionDetails) {
            console.log(
                '[Restore] Restoring submission details from store:',
                store.submissionDetails._id
            )

            // Map submission data to execution context
            const s = store.submissionDetails
            const verdict = (s.verdict || '').toUpperCase()
            const isAccepted = verdict === 'ACCEPTED'

            const mappedTestResults = (s.testCaseResults || []).map((tr) => ({
                passed: tr.verdict === 'ACCEPTED',
                actual: tr.actualOutput ?? '',
                expected: '(Hidden)',
            }))

            execution.setTestResult({
                status: 'done',
                verdict: verdict,
                passed: isAccepted,
                passedCount: s.testCaseResults?.filter((r) => r.verdict === 'ACCEPTED').length || 0,
                totalCount: s.testCaseResults?.length || 0,
                time: s.executionTime,
                memory: s.memoryUsed,
                results: mappedTestResults,
                error: s.error,
            })

            // Restore code and language
            if (s.code && s.language) {
                execution.setLastSubmittedCode(s.code)
                execution.setLastSubmittedLanguage(s.language)
            }

            // Restore AI feedback if available
            if (s.aiFeedback) {
                execution.setTestResultData({ aiFeedback: s.aiFeedback })
                store.setAiFeedback(s.aiFeedback)
            }

            console.log('[Restore] Submission details restored successfully')
        }
    }, [])
}
