'use client'

import { CheckCircle2, Circle, Lock } from 'lucide-react'

const DIFFICULTY_BADGE = {
    easy: 'bg-success-light text-success',
    medium: 'bg-warning-light text-warning',
    hard: 'bg-error-light text-error',
}

/**
 * @component ArenaProblemTabs
 * Renders a horizontal tab strip for the contest problems.
 * Shows solve status (solved / unsolved / locked).
 */
export default function ArenaProblemTabs({
    problems = [],
    activeProblemId,
    onSelect,
    isEnded,
    solvedProblems = new Set(),
}) {
    return (
        <div className="border-border bg-bg-page border-b">
            <div className="flex overflow-x-auto">
                {problems.map((problem, idx) => {
                    const isActive = problem._id === activeProblemId
                    const isSolved = problem.solved || solvedProblems.has(problem._id || problem)

                    return (
                        <button
                            key={problem._id || problem}
                            onClick={() => !isEnded && onSelect(problem._id)}
                            className={`flex min-w-[120px] shrink-0 flex-col items-start gap-1 border-b-2 px-4 py-3 text-left text-sm transition-all ${
                                isActive
                                    ? 'border-accent text-text-primary bg-accent-light'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-subtle border-transparent'
                            }`}
                        >
                            <div className="flex w-full items-center justify-between gap-2">
                                <span className="font-semibold">
                                    {String.fromCharCode(65 + idx)}. {problem.title}
                                </span>
                                {isSolved ? (
                                    <CheckCircle2 className="text-success size-4 shrink-0" />
                                ) : (
                                    <Circle className="text-text-muted size-4 shrink-0" />
                                )}
                            </div>
                            <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                    DIFFICULTY_BADGE[problem.difficulty?.toLowerCase()] ??
                                    'bg-bg-muted text-text-muted'
                                }`}
                            >
                                {problem.difficulty ?? 'N/A'}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
