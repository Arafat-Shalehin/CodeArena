'use client'

import React from 'react'
import { ProblemSolveProvider } from '@/context/ProblemSolveContext'

/**
 * @component ContestProblemProvider
 * A contest-aware wrapper around ProblemSolveProvider.
 * It strictly enforces contest constraints:
 * - disables AI feedback
 * - sets the mode to "contest"
 * - injects the contestId
 */
export default function ContestProblemProvider({
    children,
    problemId,
    initialCode,
    problem,
    contestId,
    onProblemSolved,
}) {
    return (
        <ProblemSolveProvider
            problemId={problemId}
            initialCode={initialCode}
            problem={problem}
            contestId={contestId}
            disableAI={true}
            mode="contest"
            onProblemSolved={onProblemSolved}
        >
            {children}
        </ProblemSolveProvider>
    )
}
