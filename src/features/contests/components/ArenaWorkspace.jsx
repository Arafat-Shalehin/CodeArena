'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Loader2, Play, Send, Trophy, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

import ContestProblemProvider from './ContestProblemProvider'
import useResizable from '@/features/problem-solve/hooks/useResizable'
import DescriptionPanel from '@/features/problem-solve/components/DescriptionPanel'
import CodeEditorPanel from '@/features/problem-solve/components/CodeEditorPanel'
import ExecutionConsole from '@/features/problem-solve/components/ExecutionConsole'
import { useProblemSolve } from '@/context/ProblemSolveContext'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// --- Internal Workspace that actually consumes useProblemSolve ---
function ArenaWorkspaceInner({ currentProblem, contestId }) {
    const { runCode, submitCode, isRunning, isSubmitting } = useProblemSolve()
    const router = useRouter()
    const [isFinishing, setIsFinishing] = useState(false)
    const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false)

    // ── Pre-existing 3-pane split logic from ProblemSolverLayout ──
    const [maximizedPanel, setMaximizedPanel] = useState(null)
    const [collapsedPanels, setCollapsedPanels] = useState({
        description: false,
        editor: false,
        console: false,
    })

    const hSplit = useResizable(0.42, 'horizontal', {
        onCollapseStart: () => setCollapsedPanels((p) => ({ ...p, description: true })),
        onCollapseEnd: () =>
            setCollapsedPanels((p) => ({
                ...p,
                description: false,
                editor: false,
                console: false,
            })),
    })

    const vSplit = useResizable(0.6, 'vertical', {
        onCollapseStart: () => setCollapsedPanels((p) => ({ ...p, editor: true })),
        onCollapseEnd: () => setCollapsedPanels((p) => ({ ...p, console: true })),
    })

    const toggleMaximize = useCallback((panel) => {
        setMaximizedPanel((prev) => (prev === panel ? null : panel))
        setCollapsedPanels({ description: false, editor: false, console: false })
    }, [])

    const toggleCollapse = useCallback(
        (panel) => {
            setCollapsedPanels((prev) => {
                const next = { ...prev, [panel]: !prev[panel] }
                const collapsedCount = Object.values(next).filter(Boolean).length
                if (collapsedCount >= 3) return prev
                return next
            })
            if (maximizedPanel) setMaximizedPanel(null)
        },
        [maximizedPanel]
    )

    // Helper debounce wrappers for buttons
    const handleRun = () => {
        if (!isRunning && !isSubmitting) runCode()
    }

    const handleSubmit = () => {
        if (!isRunning && !isSubmitting) submitCode()
    }

    const handleFinish = () => {
        setIsFinishDialogOpen(true)
    }

    const confirmFinish = async () => {
        if (isFinishing) return
        setIsFinishDialogOpen(false)

        setIsFinishing(true)
        try {
            const res = await fetch(`/api/contests/${contestId}/finish`, {
                method: 'POST',
            })
            const data = await res.json()
            if (data.success) {
                toast.success('Contest finished! Redirecting to results...')
                router.push(`/contests/${contestId}/result`)
            } else {
                toast.error(data.message || 'Failed to finish contest.')
            }
        } catch (err) {
            toast.error('An error occurred. Please try again.')
        } finally {
            setIsFinishing(false)
        }
    }

    // ── Mobile layout state placeholder if needed later ──
    // const [mobileActivePanel, setMobileActivePanel] = useState('description')

    return (
        <>
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Arena Top Toolbar (Submit/Run buttons) */}
                <div className="border-border bg-bg-subtle flex h-12 shrink-0 items-center justify-between border-b px-4">
                    <span className="text-text-primary truncate text-sm font-semibold">
                        {currentProblem?.title || 'Loading Problem...'}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleRun}
                            disabled={isRunning || isSubmitting}
                            className="bg-bg-muted hover:bg-bg-muted/80 h-8 gap-1.5 text-xs transition-colors"
                        >
                            {isRunning ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Play size={14} />
                            )}
                            Run Code
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSubmit}
                            disabled={isRunning || isSubmitting}
                            className="btn-primary h-8 gap-1.5 text-xs transition-transform active:scale-95"
                        >
                            {isSubmitting ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Send size={14} />
                            )}
                            Submit Solution
                        </Button>

                        <div className="bg-border mx-2 h-6 w-px" />

                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleFinish}
                            disabled={isRunning || isSubmitting || isFinishing}
                            className="bg-error/10 hover:bg-error/20 text-error border-error/20 h-8 gap-1.5 border px-3 text-xs transition-all active:scale-95"
                        >
                            {isFinishing ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Trophy size={14} />
                            )}
                            Finish Contest
                        </Button>
                    </div>
                </div>

                {/* Main Split Interface */}
                <div ref={hSplit.containerRef} className="flex flex-1 gap-0.5 overflow-hidden p-1">
                    {maximizedPanel ? (
                        <p className="text-text-muted mt-10 p-4 text-center">
                            Maximize view currently un-optimized for Arena. Please un-maximize.
                        </p>
                    ) : (
                        <>
                            {/* ─── Left: Description ─── */}
                            {!collapsedPanels.description && (
                                <div
                                    style={{ width: `${hSplit.ratio * 100}%` }}
                                    className="border-border bg-bg-subtle flex min-h-0 flex-col overflow-hidden rounded-lg border"
                                >
                                    <DescriptionPanel
                                        problem={currentProblem}
                                        onMaximize={() => toggleMaximize('description')}
                                        onCollapse={() => toggleCollapse('description')}
                                        isMaximized={false}
                                    />
                                </div>
                            )}

                            <div
                                onMouseDown={(e) => {
                                    if (collapsedPanels.description) {
                                        setCollapsedPanels((p) => ({ ...p, description: false }))
                                    }
                                    hSplit.onMouseDown(e)
                                }}
                                className="bg-bg-page hover:bg-accent/40 flex w-1.5 cursor-col-resize items-center justify-center transition-colors"
                            />

                            {/* ─── Right Side: Editor + Console ─── */}
                            <div
                                style={{
                                    width: collapsedPanels.description
                                        ? `calc(100% - 6px)`
                                        : `${(1 - hSplit.ratio) * 100}%`,
                                }}
                                ref={vSplit.containerRef}
                                className="flex flex-1 flex-col gap-0.5 overflow-hidden"
                            >
                                {!collapsedPanels.editor && (
                                    <div
                                        style={{
                                            height: collapsedPanels.console
                                                ? '100%'
                                                : `${vSplit.ratio * 100}%`,
                                        }}
                                        className="border-border bg-bg-subtle flex flex-col overflow-hidden rounded-lg border"
                                    >
                                        <CodeEditorPanel
                                            onMaximize={() => toggleMaximize('editor')}
                                            onCollapse={() => toggleCollapse('editor')}
                                            isMaximized={false}
                                        />
                                    </div>
                                )}

                                <div
                                    onMouseDown={(e) => {
                                        if (collapsedPanels.editor)
                                            setCollapsedPanels((p) => ({ ...p, editor: false }))
                                        if (collapsedPanels.console)
                                            setCollapsedPanels((p) => ({ ...p, console: false }))
                                        vSplit.onMouseDown(e)
                                    }}
                                    className="bg-bg-page hover:bg-accent/40 flex h-1.5 cursor-row-resize items-center justify-center transition-colors"
                                />

                                {!collapsedPanels.console && (
                                    <div
                                        style={{
                                            height: collapsedPanels.editor
                                                ? '100%'
                                                : `${(1 - vSplit.ratio) * 100}%`,
                                        }}
                                        className="border-border bg-bg-subtle flex min-h-0 flex-col overflow-hidden rounded-lg border"
                                    >
                                        <ExecutionConsole
                                            onMaximize={() => toggleMaximize('console')}
                                            onCollapse={() => toggleCollapse('console')}
                                            isMaximized={false}
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <Dialog open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
                <DialogContent className="border-border bg-bg-subtle max-w-md rounded-2xl p-8 shadow-2xl">
                    <DialogHeader className="flex flex-col items-center text-center">
                        <div className="bg-error/10 text-error ring-error/5 mb-4 flex h-16 w-16 items-center justify-center rounded-full ring-8">
                            <AlertTriangle size={32} />
                        </div>
                        <DialogTitle className="text-text-primary text-2xl font-black tracking-tight">
                            Finalize Participation?
                        </DialogTitle>
                        <DialogDescription className="text-text-muted mt-2 text-sm leading-relaxed font-medium">
                            Are you absolutely sure? Once you finish, your current score will be
                            locked and you{' '}
                            <span className="text-error font-bold">cannot submit</span> any more
                            solutions for this contest.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
                        <Button
                            variant="ghost"
                            onClick={() => setIsFinishDialogOpen(false)}
                            className="text-text-muted hover:bg-bg-muted hover:text-text-primary h-11 flex-1 font-bold tracking-widest uppercase"
                        >
                            No, go back
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmFinish}
                            disabled={isFinishing}
                            className="bg-error hover:bg-error/90 shadow-error/20 h-11 flex-1 font-bold tracking-widest text-white uppercase shadow-lg"
                        >
                            {isFinishing ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                'Yes, Finish Contest'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

/**
 * @component ArenaWorkspace
 * Handles fetching the full problem bodies for the contest, stores them,
 * and passes the currently active problem into the ContestProblemProvider.
 */
export default function ArenaWorkspace({ contestId, activeProblemId, onProblemSolved }) {
    const [problemsMap, setProblemsMap] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    // Phase 2: Preload all contest problems once.
    useEffect(() => {
        if (!contestId) return

        let mounted = true
        setIsLoading(true)
        fetch(`/api/contests/${contestId}/problems-full`)
            .then((res) => res.json())
            .then((data) => {
                if (mounted) {
                    if (data.success && data.data) {
                        const map = {}
                        data.data.forEach((p) => {
                            map[p._id] = p
                        })
                        setProblemsMap(map)
                    } else {
                        setError(data.message || 'Failed to load problems.')
                    }
                    setIsLoading(false)
                }
            })
            .catch((err) => {
                if (mounted) {
                    setError(err.message)
                    setIsLoading(false)
                }
            })

        return () => {
            mounted = false
        }
    }, [contestId])

    if (isLoading) {
        return (
            <div className="flex h-full flex-1 items-center justify-center">
                <Loader2 className="text-accent animate-spin" size={32} />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-full flex-1 items-center justify-center">
                <p className="text-error font-medium">{error}</p>
            </div>
        )
    }

    const currentProblem = problemsMap[activeProblemId]

    if (!currentProblem) {
        return (
            <div className="flex h-full flex-1 items-center justify-center">
                <p className="text-text-muted text-sm">Select a problem above to start coding.</p>
            </div>
        )
    }

    return (
        <ContestProblemProvider
            key={activeProblemId}
            problemId={activeProblemId}
            problem={currentProblem}
            initialCode={currentProblem.defaultCode}
            contestId={contestId}
            onProblemSolved={onProblemSolved}
        >
            <ArenaWorkspaceInner currentProblem={currentProblem} contestId={contestId} />
        </ContestProblemProvider>
    )
}
