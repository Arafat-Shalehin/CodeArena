'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
    Play,
    ChevronLeft,
    ChevronRight,
    Shuffle,
    Loader2,
    Sparkles,
    CheckCircle2,
    Settings2,
    List,
    GripVertical,
} from 'lucide-react'

import ProblemListSidebar from '@/app/test-docker/ProblemListSidebar'
import { ProblemSolveProvider, useProblemSolve } from '@/context/ProblemSolveContext'

import DescriptionPanel from './DescriptionPanel'
import CodeWorkspace from './CodeWorkspace'

// ─── Resizable Panel Hook (from test-docker) ────────────────────────────────

function useResizable(initialRatio = 0.45, direction = 'horizontal') {
    const [ratio, setRatio] = useState(initialRatio)
    const containerRef = useRef(null)
    const isDragging = useRef(false)

    const onMouseDown = useCallback(
        (e) => {
            e.preventDefault()
            isDragging.current = true
            document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize'
            document.body.style.userSelect = 'none'
        },
        [direction]
    )

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!isDragging.current || !containerRef.current) return
            const rect = containerRef.current.getBoundingClientRect()
            let newRatio
            if (direction === 'horizontal') {
                newRatio = (e.clientX - rect.left) / rect.width
            } else {
                newRatio = (e.clientY - rect.top) / rect.height
            }
            setRatio(Math.max(0.2, Math.min(0.8, newRatio)))
        }

        const onMouseUp = () => {
            isDragging.current = false
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
        }
    }, [direction])

    return { ratio, containerRef, onMouseDown }
}

// ─── Inner Layout (has access to ProblemSolveContext) ────────────────────────

function InnerLayout({
    problem,
    problems,
    onSelectProblem,
    problemIndex,
    navigateProblem,
    randomProblem,
}) {
    const { runCode, submitCode, isRunning, isSubmitting, testResult, fetchAiFeedback } =
        useProblemSolve()

    const hSplit = useResizable(0.42, 'horizontal')
    const [showProblemList, setShowProblemList] = useState(false)
    const [solvedIds] = useState([])

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
                solvedIds={solvedIds}
                onShuffle={randomProblem}
            />

            {/* ═══ Top Navbar ═══ */}
            <nav className="flex h-[44px] flex-shrink-0 items-center justify-between border-b border-[#333] bg-[#282828] px-3">
                {/* Left: Problem List + Nav */}
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

                {/* Center: Run + Submit */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={runCode}
                        disabled={isRunning || isSubmitting}
                        className="flex items-center gap-1.5 rounded-md bg-[#333] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#444] disabled:opacity-50"
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
                        disabled={isRunning || isSubmitting || !problem}
                        className="flex items-center gap-1.5 rounded-md bg-[#2cbb5d] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#26a34f] disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <CheckCircle2 size={14} />
                        )}
                        Submit
                    </button>
                </div>

                {/* Right: Misc icons */}
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

            {/* ═══ Main Content (Horizontal Split) ═══ */}
            <div ref={hSplit.containerRef} className="flex flex-1 gap-1.5 overflow-hidden p-1.5">
                {/* ─── Left Panel: Problem Description ─── */}
                <div
                    style={{ width: `${hSplit.ratio * 100}%` }}
                    className="flex flex-col overflow-hidden rounded-lg bg-[#282828]"
                >
                    <DescriptionPanel problem={problem} />
                </div>

                {/* ─── Horizontal Drag Handle ─── */}
                <div
                    onMouseDown={hSplit.onMouseDown}
                    className="flex w-[6px] cursor-col-resize items-center justify-center rounded bg-[#1a1a1a] transition-colors hover:bg-[#007acc]"
                >
                    <GripVertical size={10} className="text-gray-600" />
                </div>

                {/* ─── Right Panel: Editor + Console ─── */}
                <div
                    style={{ width: `${(1 - hSplit.ratio) * 100}%` }}
                    className="flex flex-col overflow-hidden"
                >
                    <CodeWorkspace problem={problem} />
                </div>
            </div>
        </div>
    )
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function ProblemSolverLayout({ problemId }) {
    const [problem, setProblem] = React.useState(null)
    const [problems, setProblems] = React.useState([])
    const [problemIndex, setProblemIndex] = React.useState(0)
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState(null)

    // Fetch single problem
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
        if (problemId) fetchProblem()
    }, [problemId])

    // Fetch all problems for sidebar
    React.useEffect(() => {
        const fetchAll = async () => {
            try {
                const res = await fetch('/api/problems')
                const data = await res.json()
                if (data.success && data.data?.length > 0) {
                    setProblems(data.data)
                    // Find index of current problem
                    const idx = data.data.findIndex((p) => p._id === problemId)
                    if (idx >= 0) setProblemIndex(idx)
                }
            } catch (err) {
                console.error('Failed to fetch problems:', err)
            }
        }
        fetchAll()
    }, [problemId])

    const selectProblem = (p, index) => {
        // Navigate to the new problem page
        window.location.href = `/problems/${p._id}`
    }

    const navigateProblem = (dir) => {
        if (problems.length === 0) return
        const newIndex = (problemIndex + dir + problems.length) % problems.length
        const p = problems[newIndex]
        window.location.href = `/problems/${p._id}`
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
                style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#1a1a1a' }}
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
                style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#1a1a1a' }}
            >
                <div className="max-w-md space-y-4 text-center">
                    <div className="text-4xl">⚠️</div>
                    <h2 className="text-xl font-bold text-white">Error Loading Problem</h2>
                    <p className="text-sm text-gray-400">{error || 'Problem not found.'}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="rounded-md bg-[#2cbb5d] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#26a34f]"
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
        >
            <InnerLayout
                problem={problem}
                problems={problems}
                onSelectProblem={selectProblem}
                problemIndex={problemIndex}
                navigateProblem={navigateProblem}
                randomProblem={randomProblem}
            />
        </ProblemSolveProvider>
    )
}
