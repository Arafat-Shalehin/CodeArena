'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    Play,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Shuffle,
    Loader2,
    Sparkles,
    Maximize2,
    Minimize2,
    CheckCircle2,
    Settings2,
    List,
    GripVertical,
    GripHorizontal,
    User as UserIcon,
} from 'lucide-react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AreanaLogo from '@/shared/components/ui/AreanaLogo'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

import ProblemListSidebar from '@/app/test-docker/ProblemListSidebar'
import { ProblemSolveProvider, useProblemSolve } from '@/context/ProblemSolveContext'
import { useAuth } from '@/context/AuthContext'
import { useProblemSolveStore } from '@/store/problemSolveStore'
import { useMarkProblemView } from '@/hooks/usePageRestoration'
import useResizable from '@/features/problem-solve/hooks/useResizable'
import dynamic from 'next/dynamic'

import SolverNavbar from './SolverNavbar'
import MobileTabBar from './MobileTabBar'
import DescriptionPanel from './DescriptionPanel'
const CodeEditorPanel = dynamic(() => import('./CodeEditorPanel'), {
    ssr: false,
    loading: () => (
        <div className="bg-bg-page text-text-muted flex h-full w-full items-center justify-center">
            <Loader2 className="animate-spin" size={24} />
            <span className="ml-2 text-sm">Loading Editor...</span>
        </div>
    ),
})
import ExecutionConsole from './ExecutionConsole'
import WorkspaceLoader from './WorkspaceLoader'

// ─── Inner Layout (has access to ProblemSolveContext) ────────────────────────

function InnerLayout({
    problem,
    problems,
    onSelectProblem,
    problemIndex,
    navigateProblem,
    randomProblem,
    contestId,
}) {
    // Mark that user is viewing this problem (for reload restoration)
    useMarkProblemView(problem?._id)

    const { runCode, submitCode, isRunning, isSubmitting, testResult, fetchAiFeedback } =
        useProblemSolve()
    const { user } = useAuth()

    // ── Panel state: null = normal, 'description'|'editor'|'console' = that panel maximized ──
    const [maximizedPanel, setMaximizedPanel] = useState(null)

    // ── Collapsed panels ──
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

    const [showProblemList, setShowProblemList] = useState(false)
    const [mobileActivePanel, setMobileActivePanel] = useState('description')

    /** Toggle maximize for a panel — if already maximized, restore */
    const toggleMaximize = useCallback((panel) => {
        setMaximizedPanel((prev) => (prev === panel ? null : panel))
        setCollapsedPanels({ description: false, editor: false, console: false })
    }, [])

    /** Toggle collapse for a panel — max 2 can be collapsed at once */
    const toggleCollapse = useCallback(
        (panel) => {
            setCollapsedPanels((prev) => {
                const next = { ...prev, [panel]: !prev[panel] }
                const collapsedCount = Object.values(next).filter(Boolean).length
                if (collapsedCount >= 3) return prev // can't fold all 3
                return next
            })
            if (maximizedPanel) setMaximizedPanel(null)
        },
        [maximizedPanel]
    )

    const isMaximized = (panel) => maximizedPanel === panel

    return (
        <div
            className="bg-bg-page text-text-primary flex h-screen w-full flex-col overflow-hidden"
            style={{
                fontFamily: 'var(--font-sans)',
                isolation: 'isolate',
            }}
        >
            {/* ═══ Problem List Sidebar ═══ */}
            <ProblemListSidebar
                isOpen={showProblemList}
                onClose={() => setShowProblemList(false)}
                problems={problems}
                selectedProblemId={problem?._id}
                onSelectProblem={onSelectProblem}
                solvedIds={user?.stats?.solvedProblems || []}
                onShuffle={randomProblem}
            />

            {/* ═══ Top Navbar ═══ */}
            <SolverNavbar
                setShowProblemList={setShowProblemList}
                navigateProblem={navigateProblem}
                randomProblem={randomProblem}
                runCode={runCode}
                submitCode={submitCode}
                isRunning={isRunning}
                isSubmitting={isSubmitting}
                isAuthenticated={!!user}
                user={user}
                testResult={testResult}
                fetchAiFeedback={fetchAiFeedback}
            />

            {/* ═══ Workspace Area ═══ */}
            <div ref={hSplit.containerRef} className="flex flex-1 gap-1.5 overflow-hidden p-1.5">
                {/* ── Maximized: Show maximized panel + other panels as collapsed headers ── */}
                {maximizedPanel ? (
                    <>
                        {/* Left side: Description or collapsed stub */}
                        {maximizedPanel === 'description' ? (
                            <div className="border-border bg-bg-subtle flex flex-1 flex-col overflow-hidden rounded-xl border">
                                <DescriptionPanel
                                    problem={problem}
                                    onMaximize={() => toggleMaximize('description')}
                                    isMaximized={true}
                                />
                            </div>
                        ) : (
                            <div className="border-border bg-bg-subtle text-text-muted hover:text-text-primary group hover:bg-bg-muted relative flex w-10 shrink-0 items-center justify-center rounded-xl border transition-colors">
                                <span
                                    style={{ writingMode: 'vertical-rl' }}
                                    className="cursor-pointer font-medium"
                                    onClick={() => toggleMaximize('description')}
                                >
                                    📄 Description
                                </span>
                                <div className="absolute bottom-3 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 group-hover:flex">
                                    <button
                                        onClick={() => toggleCollapse('description')}
                                        className="bg-bg-muted text-text-primary rounded-lg p-1.5 transition-all hover:scale-110"
                                        title="Unfold"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                    <button
                                        onClick={() => toggleMaximize('description')}
                                        className="bg-bg-muted text-text-primary rounded-lg p-1.5 transition-all hover:scale-110"
                                        title="Maximize"
                                    >
                                        <Maximize2 size={14} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Right side: Editor+Console or their stubs */}
                        <div className="flex flex-1 flex-col gap-1.5 overflow-hidden">
                            {/* Editor or stub */}
                            {maximizedPanel === 'editor' ? (
                                <div className="border-border bg-bg-subtle flex flex-1 flex-col overflow-hidden rounded-xl border">
                                    <CodeEditorPanel
                                        onMaximize={() => toggleMaximize('editor')}
                                        isMaximized={true}
                                    />
                                </div>
                            ) : (
                                <div className="border-border bg-bg-subtle text-text-muted hover:text-text-primary group hover:bg-bg-muted relative flex h-10 shrink-0 items-center gap-3 rounded-xl border px-4 transition-colors">
                                    <span
                                        className="cursor-pointer font-medium"
                                        onClick={() => toggleMaximize('editor')}
                                    >
                                        {'</>'} Code
                                    </span>
                                    <div className="absolute right-3 hidden items-center gap-2 group-hover:flex">
                                        <button
                                            onClick={() => toggleCollapse('editor')}
                                            className="bg-bg-muted text-text-primary rounded-lg p-1.5 transition-all hover:scale-110"
                                            title="Unfold"
                                        >
                                            <ChevronDown size={14} />
                                        </button>
                                        <button
                                            onClick={() => toggleMaximize('editor')}
                                            className="bg-bg-muted text-text-primary rounded-lg p-1.5 transition-all hover:scale-110"
                                            title="Maximize"
                                        >
                                            <Maximize2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Console or stub */}
                            {maximizedPanel === 'console' ? (
                                <div className="border-border bg-bg-subtle flex flex-1 flex-col overflow-hidden rounded-xl border">
                                    <ExecutionConsole
                                        onMaximize={() => toggleMaximize('console')}
                                        onCollapse={() => toggleCollapse('console')}
                                        isMaximized={true}
                                    />
                                </div>
                            ) : (
                                <div className="border-border bg-bg-subtle text-text-muted hover:text-text-primary group hover:bg-bg-muted relative flex h-10 shrink-0 items-center gap-3 rounded-xl border px-4 transition-colors">
                                    <span
                                        className="flex cursor-pointer items-center gap-2 font-medium"
                                        onClick={() => toggleMaximize('console')}
                                    >
                                        <CheckCircle2 size={14} className="text-success" /> Console
                                    </span>
                                    <div className="absolute right-3 hidden items-center gap-2 group-hover:flex">
                                        <button
                                            onClick={() => toggleCollapse('console')}
                                            className="bg-bg-muted text-text-primary rounded-lg p-1.5 transition-all hover:scale-110"
                                            title="Unfold"
                                        >
                                            <ChevronUp size={14} />
                                        </button>
                                        <button
                                            onClick={() => toggleMaximize('console')}
                                            className="bg-bg-muted text-text-primary rounded-lg p-1.5 transition-all hover:scale-110"
                                            title="Maximize"
                                        >
                                            <Maximize2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* ── Normal layout: 3 panels ── */
                    <>
                        {/* ─── Left: Description or collapsed stub ─── */}
                        {collapsedPanels.description ? (
                            <div className="border-border bg-bg-subtle text-text-muted hover:text-text-primary group hover:bg-bg-muted relative flex w-10 shrink-0 items-center justify-center rounded-xl border transition-colors">
                                <span
                                    style={{ writingMode: 'vertical-rl' }}
                                    className="cursor-pointer font-medium"
                                    onClick={() => toggleCollapse('description')}
                                >
                                    📄 Description
                                </span>
                                <div className="absolute bottom-3 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 group-hover:flex">
                                    <button
                                        onClick={() => toggleCollapse('description')}
                                        className="bg-bg-muted text-text-primary rounded-lg p-1.5 transition-all hover:scale-110"
                                        title="Unfold"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                    <button
                                        onClick={() => toggleMaximize('description')}
                                        className="bg-bg-muted text-text-primary rounded-lg p-1.5 transition-all hover:scale-110"
                                        title="Maximize"
                                    >
                                        <Maximize2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                style={{ width: `${hSplit.ratio * 100}%` }}
                                className="border-border bg-bg-subtle flex flex-col overflow-hidden rounded-xl border"
                            >
                                <DescriptionPanel
                                    problem={problem}
                                    onMaximize={() => toggleMaximize('description')}
                                    onCollapse={() => toggleCollapse('description')}
                                    isMaximized={false}
                                />
                            </div>
                        )}

                        {/* ─── Horizontal Drag Handle (always visible) ─── */}
                        <div
                            onMouseDown={(e) => {
                                if (collapsedPanels.description) {
                                    setCollapsedPanels((p) => ({ ...p, description: false }))
                                }
                                hSplit.onMouseDown(e)
                            }}
                            className="bg-bg-page hover:bg-accent/40 flex w-2 cursor-col-resize items-center justify-center transition-colors"
                        >
                            <GripVertical size={12} className="text-text-muted" />
                        </div>

                        {/* ─── Right Side: Editor + Console ─── */}
                        <div
                            style={{
                                width: collapsedPanels.description
                                    ? `calc(100% - 42px)`
                                    : `${(1 - hSplit.ratio) * 100}%`,
                            }}
                            ref={vSplit.containerRef}
                            className="flex flex-1 flex-col gap-1.5 overflow-hidden"
                        >
                            {/* Editor or collapsed stub */}
                            {collapsedPanels.editor ? (
                                <div className="border-border bg-bg-subtle text-text-muted hover:text-text-primary group hover:bg-bg-muted relative flex h-10 shrink-0 items-center gap-3 rounded-xl border px-4 transition-colors">
                                    <span
                                        className="cursor-pointer font-medium"
                                        onClick={() => toggleCollapse('editor')}
                                    >
                                        {'</>'} Code
                                    </span>
                                    <div className="absolute right-3 hidden items-center gap-2 group-hover:flex">
                                        <button
                                            onClick={() => toggleCollapse('editor')}
                                            className="bg-bg-muted text-text-primary rounded-lg p-1.5 transition-all hover:scale-110"
                                            title="Unfold"
                                        >
                                            <ChevronDown size={14} />
                                        </button>
                                        <button
                                            onClick={() => toggleMaximize('editor')}
                                            className="bg-bg-muted text-text-primary rounded-lg p-1.5 transition-all hover:scale-110"
                                            title="Maximize"
                                        >
                                            <Maximize2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        height: collapsedPanels.console
                                            ? '100%'
                                            : `${vSplit.ratio * 100}%`,
                                    }}
                                    className="border-border bg-bg-subtle flex flex-col overflow-hidden rounded-xl border"
                                >
                                    <CodeEditorPanel
                                        onMaximize={() => toggleMaximize('editor')}
                                        onCollapse={() => toggleCollapse('editor')}
                                        isMaximized={false}
                                    />
                                </div>
                            )}

                            {/* Vertical Drag Handle (always visible) */}
                            <div
                                onMouseDown={(e) => {
                                    if (collapsedPanels.editor)
                                        setCollapsedPanels((p) => ({ ...p, editor: false }))
                                    if (collapsedPanels.console)
                                        setCollapsedPanels((p) => ({ ...p, console: false }))
                                    vSplit.onMouseDown(e)
                                }}
                                className="bg-bg-page hover:bg-accent/40 flex h-2 cursor-row-resize items-center justify-center transition-colors"
                            >
                                <GripHorizontal size={12} className="text-text-muted" />
                            </div>

                            {/* Console or collapsed stub */}
                            {collapsedPanels.console ? (
                                <div className="border-border bg-bg-subtle text-text-muted hover:text-text-primary group hover:bg-bg-muted relative flex h-10 shrink-0 items-center gap-3 rounded-xl border px-4 transition-colors">
                                    <span
                                        className="flex cursor-pointer items-center gap-2 font-medium"
                                        onClick={() => toggleCollapse('console')}
                                    >
                                        <CheckCircle2 size={14} className="text-success" /> Console
                                    </span>
                                    <div className="absolute right-3 hidden items-center gap-2 group-hover:flex">
                                        <button
                                            onClick={() => toggleCollapse('console')}
                                            className="bg-bg-muted text-text-primary rounded-lg p-1.5 transition-all hover:scale-110"
                                            title="Unfold"
                                        >
                                            <ChevronUp size={14} />
                                        </button>
                                        <button
                                            onClick={() => toggleMaximize('console')}
                                            className="bg-bg-muted text-text-primary rounded-lg p-1.5 transition-all hover:scale-110"
                                            title="Maximize"
                                        >
                                            <Maximize2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        height: collapsedPanels.editor
                                            ? '100%'
                                            : `${(1 - vSplit.ratio) * 100}%`,
                                    }}
                                    className="border-border bg-bg-subtle flex flex-col overflow-hidden rounded-xl border"
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
            {/* ═══ Mobile Tab Bar (Bottom Navigation for Panels) ═══ */}
            <MobileTabBar
                mobileActivePanel={mobileActivePanel}
                setMobileActivePanel={setMobileActivePanel}
            />
        </div>
    )
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function ProblemSolverLayout({ problemId, contestId, initialProblem }) {
    const router = useRouter()

    // Get cached data from Zustand
    const zustandStore = useProblemSolveStore()

    // Start with quicker loading if cache exists for same problem
    const shouldShowCached = zustandStore.cachedProblem?._id === problemId

    // Server Component provides `initialProblem` which is the freshest data. Otherwise use cache.
    const startingProblem = initialProblem || (shouldShowCached ? zustandStore.cachedProblem : null)

    const [problem, setProblem] = useState(startingProblem)
    const [problems, setProblems] = useState(zustandStore.cachedProblems || [])

    // We only need to load if we don't have problem list (initialProblem covers the problem data)
    const needsProblemList =
        !zustandStore.cachedProblems || zustandStore.cachedProblems.length === 0
    const [isLoading, setIsLoading] = useState(!startingProblem || needsProblemList)
    const [error, setError] = useState(null)

    useEffect(() => {
        let isMounted = true
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 12000)

        const loadData = async () => {
            try {
                if (isMounted && (!problem || needsProblemList)) {
                    setIsLoading(true)
                }

                if (initialProblem) {
                    useProblemSolveStore.getState().setCachedProblem(initialProblem)
                } else {
                    // Only fetch problem data if SSR didn't provide it
                    console.log('[ProblemSolver] Fetching problem data for:', problemId)
                    const problemRes = await fetch(`/api/problems/${problemId}`, {
                        signal: controller.signal,
                    })
                    const problemData = await problemRes.json()

                    if (problemData.success) {
                        console.log('[ProblemSolver] Problem loaded:', problemId)
                        if (isMounted) setProblem(problemData.data)
                        // Use getState() to avoid re-renders from object reference changes
                        useProblemSolveStore.getState().setCachedProblem(problemData.data)
                        if (isMounted) setError(null)
                    } else {
                        console.error('[ProblemSolver] Problem fetch failed:', problemData.error)
                        if (isMounted) setError(problemData.error || 'Failed to load problem')
                    }
                }

                // Load problem list only if not cached
                const state = useProblemSolveStore.getState()
                if (!state.cachedProblems || state.cachedProblems.length === 0) {
                    console.log('[ProblemSolver] Fetching problem list')
                    const listRes = await fetch('/api/problems', { signal: controller.signal })
                    const listData = await listRes.json()

                    if (listData.success) {
                        const problemsList = listData.data || []
                        if (isMounted) setProblems(problemsList)
                        useProblemSolveStore.getState().setCachedProblems(problemsList)
                    }
                } else {
                    console.log('[ProblemSolver] Using cached problem list')
                    if (isMounted) setProblems(state.cachedProblems)
                }

                if (isMounted) setIsLoading(false)
            } catch (err) {
                console.error('[ProblemSolver] Fetch error:', err)
                if (isMounted) {
                    if (err?.name === 'AbortError') {
                        setError('Request timeout. Please retry.')
                    } else {
                        setError('Network error')
                    }
                    setIsLoading(false)
                }
            } finally {
                clearTimeout(timeoutId)
            }
        }

        loadData()

        return () => {
            isMounted = false
            clearTimeout(timeoutId)
            controller.abort()
        }
    }, [problemId])

    const problemIndex = problems.findIndex((p) => p._id === problemId)

    const onSelectProblem = (p) => {
        router.push(`/problems/${p._id}`)
    }
    const navigateProblem = (dir) => {
        if (problems.length === 0) return
        const idx = (problemIndex + dir + problems.length) % problems.length
        router.push(`/problems/${problems[idx]._id}`)
    }
    const randomProblem = () => {
        if (problems.length === 0) return
        const idx = Math.floor(Math.random() * problems.length)
        router.push(`/problems/${problems[idx]._id}`)
    }

    if (isLoading) {
        return <WorkspaceLoader />
    }

    if (error || !problem) {
        return (
            <div
                className="flex h-screen w-full flex-col items-center justify-center"
                style={{ background: '#1a1a1a' }}
            >
                <div className="max-w-md space-y-4 text-center">
                    <div className="text-4xl">⚠️</div>
                    <h2 className="text-xl font-bold" style={{ color: 'white' }}>
                        Error Loading Problem
                    </h2>
                    <p className="text-sm text-gray-400">{error || 'Problem not found.'}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="rounded-md bg-[#2cbb5d] px-6 py-2 text-sm font-medium text-white hover:bg-[#26a34f]"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <ProblemSolveProvider
            problemId={problem._id}
            initialCode={problem.defaultCode}
            problem={problem}
            contestId={contestId}
        >
            <InnerLayout
                problem={problem}
                problems={problems}
                onSelectProblem={onSelectProblem}
                problemIndex={problemIndex}
                navigateProblem={navigateProblem}
                randomProblem={randomProblem}
                contestId={contestId}
            />
        </ProblemSolveProvider>
    )
}
