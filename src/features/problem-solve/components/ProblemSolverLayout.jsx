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
} from 'lucide-react'

import ProblemListSidebar from '@/app/test-docker/ProblemListSidebar'
import { ProblemSolveProvider, useProblemSolve } from '@/context/ProblemSolveContext'
import useResizable from '@/features/problem-solve/hooks/useResizable'

import DescriptionPanel from './DescriptionPanel'
import CodeEditorPanel from './CodeEditorPanel'
import ExecutionConsole from './ExecutionConsole'

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
    const { runCode, submitCode, isRunning, isSubmitting, testResult, fetchAiFeedback } =
        useProblemSolve()

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
            className="flex h-screen w-full flex-col overflow-hidden"
            style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                background: '#1a1a1a',
                color: '#e5e7eb',
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
                solvedIds={[]}
                onShuffle={randomProblem}
            />

            {/* ═══ Top Navbar ═══ */}
            <nav className="flex h-[44px] flex-shrink-0 items-center justify-between border-b border-[#333] bg-[#282828] px-3">
                {/* Left */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowProblemList(true)}
                        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-gray-300 hover:bg-[#3a3a3a]"
                    >
                        <List size={14} />
                        <span className="font-medium">Problem List</span>
                    </button>
                    <div className="mx-1 h-4 w-px bg-[#444]" />
                    <button
                        onClick={() => navigateProblem(-1)}
                        className="rounded p-1 text-gray-400 hover:bg-[#3a3a3a] hover:text-white"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={() => navigateProblem(1)}
                        className="rounded p-1 text-gray-400 hover:bg-[#3a3a3a] hover:text-white"
                    >
                        <ChevronRight size={18} />
                    </button>
                    <button
                        onClick={randomProblem}
                        className="rounded p-1 text-gray-400 hover:bg-[#3a3a3a] hover:text-white"
                    >
                        <Shuffle size={16} />
                    </button>
                </div>
                {/* Center */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={runCode}
                        disabled={isRunning}
                        className="flex items-center gap-1.5 rounded-md bg-[#333] px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#444] disabled:opacity-50"
                    >
                        {isRunning ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Play size={14} />
                        )}
                        Run
                    </button>
                    <button
                        onClick={submitCode}
                        disabled={isSubmitting}
                        className="flex items-center gap-1.5 rounded-md bg-[#2cbb5d] px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#26a34f] disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <CheckCircle2 size={14} />
                        )}
                        Submit
                    </button>
                </div>
                {/* Right */}
                <div className="flex items-center gap-2 text-gray-400">
                    {testResult?.status === 'done' && (
                        <button
                            onClick={fetchAiFeedback}
                            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-purple-400 hover:bg-purple-500/10"
                        >
                            <Sparkles size={14} /> AI Analysis
                        </button>
                    )}
                    <button className="rounded p-1 hover:bg-[#3a3a3a] hover:text-white">
                        <Settings2 size={18} />
                    </button>
                </div>
            </nav>

            {/* ═══ Workspace Area ═══ */}
            <div ref={hSplit.containerRef} className="flex flex-1 gap-1.5 overflow-hidden p-1.5">
                {/* ── Maximized: Show maximized panel + other panels as collapsed headers ── */}
                {maximizedPanel ? (
                    <>
                        {/* Left side: Description or collapsed stub */}
                        {maximizedPanel === 'description' ? (
                            <div className="flex flex-1 flex-col overflow-hidden rounded-lg bg-[#282828]">
                                <DescriptionPanel
                                    problem={problem}
                                    onMaximize={() => toggleMaximize('description')}
                                    isMaximized={true}
                                />
                            </div>
                        ) : (
                            <div className="group relative flex w-[36px] flex-shrink-0 items-center justify-center rounded-lg bg-[#282828] text-xs text-gray-500 transition-colors hover:bg-[#333] hover:text-gray-300">
                                <span
                                    style={{ writingMode: 'vertical-rl' }}
                                    className="cursor-pointer"
                                    onClick={() => toggleMaximize('description')}
                                >
                                    📄 Description
                                </span>
                                <div className="absolute bottom-2 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 group-hover:flex">
                                    <button
                                        onClick={() => toggleCollapse('description')}
                                        className="rounded bg-[#444] p-1 text-gray-300 hover:bg-[#555] hover:text-white"
                                        title="Unfold"
                                    >
                                        <ChevronRight size={12} />
                                    </button>
                                    <button
                                        onClick={() => toggleMaximize('description')}
                                        className="rounded bg-[#444] p-1 text-gray-300 hover:bg-[#555] hover:text-white"
                                        title="Maximize"
                                    >
                                        <Maximize2 size={12} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Right side: Editor+Console or their stubs */}
                        <div className="flex flex-1 flex-col gap-1.5 overflow-hidden">
                            {/* Editor or stub */}
                            {maximizedPanel === 'editor' ? (
                                <div className="flex flex-1 flex-col overflow-hidden rounded-lg bg-[#282828]">
                                    <CodeEditorPanel
                                        onMaximize={() => toggleMaximize('editor')}
                                        isMaximized={true}
                                    />
                                </div>
                            ) : (
                                <div className="group relative flex h-[36px] flex-shrink-0 items-center gap-2 rounded-lg bg-[#282828] px-4 text-xs text-gray-500 transition-colors hover:bg-[#333] hover:text-gray-300">
                                    <span
                                        className="cursor-pointer"
                                        onClick={() => toggleMaximize('editor')}
                                    >
                                        {'</>'} Code
                                    </span>
                                    <div className="absolute right-2 hidden items-center gap-1 group-hover:flex">
                                        <button
                                            onClick={() => toggleCollapse('editor')}
                                            className="rounded bg-[#444] p-1 text-gray-300 hover:bg-[#555] hover:text-white"
                                            title="Unfold"
                                        >
                                            <ChevronDown size={12} />
                                        </button>
                                        <button
                                            onClick={() => toggleMaximize('editor')}
                                            className="rounded bg-[#444] p-1 text-gray-300 hover:bg-[#555] hover:text-white"
                                            title="Maximize"
                                        >
                                            <Maximize2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Console or stub */}
                            {maximizedPanel === 'console' ? (
                                <div className="flex flex-1 flex-col overflow-hidden rounded-lg bg-[#282828]">
                                    <ExecutionConsole
                                        onMaximize={() => toggleMaximize('console')}
                                        onCollapse={() => toggleCollapse('console')}
                                        isMaximized={true}
                                    />
                                </div>
                            ) : (
                                <div className="group relative flex h-[36px] flex-shrink-0 items-center gap-2 rounded-lg bg-[#282828] px-4 text-xs text-gray-500 transition-colors hover:bg-[#333] hover:text-gray-300">
                                    <span
                                        className="flex cursor-pointer items-center gap-1.5"
                                        onClick={() => toggleMaximize('console')}
                                    >
                                        <CheckCircle2 size={12} className="text-[#2cbb5d]" />{' '}
                                        Console
                                    </span>
                                    <div className="absolute right-2 hidden items-center gap-1 group-hover:flex">
                                        <button
                                            onClick={() => toggleCollapse('console')}
                                            className="rounded bg-[#444] p-1 text-gray-300 hover:bg-[#555] hover:text-white"
                                            title="Unfold"
                                        >
                                            <ChevronUp size={12} />
                                        </button>
                                        <button
                                            onClick={() => toggleMaximize('console')}
                                            className="rounded bg-[#444] p-1 text-gray-300 hover:bg-[#555] hover:text-white"
                                            title="Maximize"
                                        >
                                            <Maximize2 size={12} />
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
                            <div className="group relative flex w-[36px] flex-shrink-0 items-center justify-center rounded-lg bg-[#282828] text-xs text-gray-500 transition-colors hover:bg-[#333] hover:text-gray-300">
                                <span
                                    style={{ writingMode: 'vertical-rl' }}
                                    className="cursor-pointer"
                                    onClick={() => toggleCollapse('description')}
                                >
                                    📄 Description
                                </span>
                                <div className="absolute bottom-2 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 group-hover:flex">
                                    <button
                                        onClick={() => toggleCollapse('description')}
                                        className="rounded bg-[#444] p-1 text-gray-300 hover:bg-[#555] hover:text-white"
                                        title="Unfold"
                                    >
                                        <ChevronRight size={12} />
                                    </button>
                                    <button
                                        onClick={() => toggleMaximize('description')}
                                        className="rounded bg-[#444] p-1 text-gray-300 hover:bg-[#555] hover:text-white"
                                        title="Maximize"
                                    >
                                        <Maximize2 size={12} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                style={{ width: `${hSplit.ratio * 100}%` }}
                                className="flex flex-col overflow-hidden rounded-lg bg-[#282828]"
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
                            className="flex w-[6px] cursor-col-resize items-center justify-center rounded bg-[#1a1a1a] transition-colors hover:bg-[#007acc]"
                        >
                            <GripVertical size={10} className="text-gray-600" />
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
                                <div className="group relative flex h-[36px] flex-shrink-0 items-center gap-2 rounded-lg bg-[#282828] px-4 text-xs text-gray-500 transition-colors hover:bg-[#333] hover:text-gray-300">
                                    <span
                                        className="cursor-pointer"
                                        onClick={() => toggleCollapse('editor')}
                                    >
                                        {'</>'} Code
                                    </span>
                                    <div className="absolute right-2 hidden items-center gap-1 group-hover:flex">
                                        <button
                                            onClick={() => toggleCollapse('editor')}
                                            className="rounded bg-[#444] p-1 text-gray-300 hover:bg-[#555] hover:text-white"
                                            title="Unfold"
                                        >
                                            <ChevronDown size={12} />
                                        </button>
                                        <button
                                            onClick={() => toggleMaximize('editor')}
                                            className="rounded bg-[#444] p-1 text-gray-300 hover:bg-[#555] hover:text-white"
                                            title="Maximize"
                                        >
                                            <Maximize2 size={12} />
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
                                    className="flex flex-col overflow-hidden rounded-lg bg-[#282828]"
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
                                className="flex h-[6px] cursor-row-resize items-center justify-center rounded bg-[#1a1a1a] transition-colors hover:bg-[#007acc]"
                            >
                                <GripHorizontal size={10} className="text-gray-600" />
                            </div>

                            {/* Console or collapsed stub */}
                            {collapsedPanels.console ? (
                                <div className="group relative flex h-[36px] flex-shrink-0 items-center gap-2 rounded-lg bg-[#282828] px-4 text-xs text-gray-500 transition-colors hover:bg-[#333] hover:text-gray-300">
                                    <span
                                        className="flex cursor-pointer items-center gap-1.5"
                                        onClick={() => toggleCollapse('console')}
                                    >
                                        <CheckCircle2 size={12} className="text-[#2cbb5d]" />{' '}
                                        Console
                                    </span>
                                    <div className="absolute right-2 hidden items-center gap-1 group-hover:flex">
                                        <button
                                            onClick={() => toggleCollapse('console')}
                                            className="rounded bg-[#444] p-1 text-gray-300 hover:bg-[#555] hover:text-white"
                                            title="Unfold"
                                        >
                                            <ChevronUp size={12} />
                                        </button>
                                        <button
                                            onClick={() => toggleMaximize('console')}
                                            className="rounded bg-[#444] p-1 text-gray-300 hover:bg-[#555] hover:text-white"
                                            title="Maximize"
                                        >
                                            <Maximize2 size={12} />
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
                                    className="flex flex-col overflow-hidden rounded-lg bg-[#282828]"
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
    )
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function ProblemSolverLayout({ problemId, contestId }) {
    const [problem, setProblem] = useState(null)
    const [problems, setProblems] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const loadData = async () => {
            try {
                const [problemRes, listRes] = await Promise.all([
                    fetch(`/api/problems/${problemId}`),
                    fetch('/api/problems'),
                ])
                const problemData = await problemRes.json()
                const listData = await listRes.json()

                if (problemData.success) setProblem(problemData.data)
                else setError(problemData.error || 'Failed to load problem')

                if (listData.success) setProblems(listData.data || [])
            } catch (err) {
                setError('Network error')
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [problemId])

    const problemIndex = problems.findIndex((p) => p._id === problemId)

    const onSelectProblem = (p) => {
        window.location.href = `/problems/${p._id}`
    }
    const navigateProblem = (dir) => {
        if (problems.length === 0) return
        const idx = (problemIndex + dir + problems.length) % problems.length
        window.location.href = `/problems/${problems[idx]._id}`
    }
    const randomProblem = () => {
        if (problems.length === 0) return
        const idx = Math.floor(Math.random() * problems.length)
        window.location.href = `/problems/${problems[idx]._id}`
    }

    if (isLoading) {
        return (
            <div
                className="flex h-screen w-full items-center justify-center"
                style={{ background: '#1a1a1a' }}
            >
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={32} className="animate-spin text-gray-500" />
                    <p className="animate-pulse text-sm text-gray-400">Initializing workspace...</p>
                </div>
            </div>
        )
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
