'use client'

import React from 'react'

// Internal Components
import DescriptionPanel from './DescriptionPanel'
import CodeWorkspace from './CodeWorkspace'

// Shadcn Components
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

// Problem Data (Mock)
import { PLACEHOLDER_PROBLEM } from '@/features/problem-solve/data/placeholder-problem.data'

/**
 * ProblemSolverLayout Component
 * Orchestrates the split-pane layout for the problem-solving environment.
 * Left Panel: Problem Description
 * Right Panel: Code Workspace
 */
import { useProblemSolve, ProblemSolveProvider } from '@/context/ProblemSolveContext'
import { Loader2, AlertCircle } from 'lucide-react'

export default function ProblemSolverLayout({ problemId }) {
    const [problem, setProblem] = React.useState(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState(null)

    React.useEffect(() => {
        const fetchProblem = async () => {
            try {
                setIsLoading(true)
                const res = await fetch(`/api/problems/${problemId}`)
                const json = await res.json()

                if (json.success) {
                    setProblem(json.data)
                } else {
                    setError(json.error || 'Failed to load problem')
                }
            } catch (err) {
                console.error('[ProblemSolverLayout] Fetch error:', err)
                setError('A network error occurred while loading the problem.')
            } finally {
                setIsLoading(false)
            }
        }

        if (problemId) {
            fetchProblem()
        }
    }, [problemId])

    if (isLoading) {
        return (
            <div className="bg-bg-page flex flex-1 items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="text-accent h-12 w-12 animate-spin" />
                    <p className="text-text-secondary animate-pulse text-lg">
                        Initializing workspace...
                    </p>
                </div>
            </div>
        )
    }

    if (error || !problem) {
        return (
            <div className="bg-bg-page flex flex-1 items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-4">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                    <h2 className="text-text-primary text-xl font-bold">Error Loading Problem</h2>
                    <p className="text-text-secondary">{error || 'Problem not found.'}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-accent hover:bg-accent-hover rounded-lg px-6 py-2 font-medium text-white transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <ProblemSolveProvider problemId={problem._id} initialCode={problem.defaultCode}>
            <div className="bg-bg-page flex h-[calc(100vh-theme(spacing.16))] flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    {/* LEFT PANEL: Description (50% default) */}
                    <ResizablePanel defaultSize={50} minSize={30}>
                        <DescriptionPanel problem={problem} />
                    </ResizablePanel>

                    {/* RESIZABLE DIVIDER (Handle) */}
                    <ResizableHandle className="hover:bg-accent/50 group w-1 cursor-col-resize bg-transparent transition-colors">
                        <div className="bg-border group-hover:bg-accent mx-auto h-full w-px" />
                    </ResizableHandle>

                    {/* RIGHT PANEL: Editor & Results (50% default) */}
                    <ResizablePanel defaultSize={50} minSize={30}>
                        <CodeWorkspace problem={problem} />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </ProblemSolveProvider>
    )
}
