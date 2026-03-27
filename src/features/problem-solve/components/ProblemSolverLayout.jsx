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
    Maximize2,
    Minimize2,
    CheckCircle2,
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
import NotificationBell from '@/components/layout/NotificationBell'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

import DescriptionPanel from './DescriptionPanel'
import CodeEditorPanel from './CodeEditorPanel'
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

    const { runCode, submitCode, isRunning, isSubmitting } = useProblemSolve()
    const { user, isAuthenticated } = useAuth()

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
    // Mobile: Track active panel (for mobile tab switching)
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
            <nav className="border-border bg-bg-subtle flex h-12 shrink-0 items-center justify-between border-b px-2 sm:px-4">
                {/* Left */}
                <div className="flex items-center gap-1">
                    <AreanaLogo
                        href="/feed"
                        className="mr-2 scale-90 transition-transform hover:scale-95 sm:mr-4"
                    />
                    <div className="bg-border mr-2 hidden h-6 w-px sm:block" />
                    <button
                        onClick={() => setShowProblemList(true)}
                        className="hover:bg-bg-muted text-text-secondary hover:text-text-primary flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors sm:px-3"
                        aria-label="Open problem list"
                    >
                        <List size={16} />
                        <span className="hidden font-semibold sm:inline">Problem List</span>
                    </button>
                    <div className="bg-border mx-2 hidden h-4 w-px sm:block" />
                    <button
                        onClick={() => navigateProblem(-1)}
                        className="text-text-muted hover:bg-bg-muted hover:text-text-primary rounded-lg p-1.5 transition-colors"
                        aria-label="Previous problem"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => navigateProblem(1)}
                        className="text-text-muted hover:bg-bg-muted hover:text-text-primary rounded-lg p-1.5 transition-colors"
                        aria-label="Next problem"
                    >
                        <ChevronRight size={20} />
                    </button>
                    <button
                        onClick={randomProblem}
                        className="text-text-muted hover:bg-bg-muted hover:text-text-primary rounded-lg p-1.5 transition-colors"
                        aria-label="Random problem"
                    >
                        <Shuffle size={18} />
                    </button>
                </div>
                {/* Center - Run/Submit buttons */}
                <div className="flex items-center gap-1 sm:gap-2">
                    <button
                        onClick={runCode}
                        disabled={isRunning}
                        className="flex items-center gap-1 rounded-md bg-[#333] px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#444] disabled:opacity-50 sm:gap-1.5 sm:px-4"
                        aria-label="Run code"
                    >
                        {isRunning ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Play size={14} />
                        )}
                        <span className="hidden sm:inline">Run</span>
                    </button>
                    <button
                        onClick={submitCode}
                        disabled={isSubmitting}
                        className="flex items-center gap-1 rounded-md bg-[#2cbb5d] px-2 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#26a34f] disabled:opacity-50 sm:gap-1.5 sm:px-4"
                        aria-label="Submit code"
                    >
                        {isSubmitting ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <CheckCircle2 size={14} />
                        )}
                        <span className="hidden sm:inline">Submit</span>
                    </button>
                </div>
                {/* Right */}
                <div className="flex items-center gap-1 text-gray-400 sm:gap-2">
                    <ThemeToggle className="scale-90" />

                    <div className="bg-border hidden h-6 w-px sm:block" />

                    <div className="hidden sm:block">
                        <NotificationBell />
                    </div>

                    <Link
                        href={isAuthenticated ? '/profile' : '/login'}
                        className="border-border bg-bg-page hover:bg-bg-muted group flex items-center gap-2 rounded-full border px-2 py-1 transition-all"
                    >
                        <Avatar className="border-accent/20 group-hover:border-accent/40 size-7 border transition-colors">
                            {isAuthenticated && user ? (
                                <AvatarImage
                                    src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.avatarSeed || user.name || user.email}`}
                                    alt={user.name}
                                />
                            ) : null}
                            <AvatarFallback className="bg-accent/10 text-accent text-[10px] font-bold">
                                <UserIcon size={11} />
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-text-secondary group-hover:text-text-primary text-xs font-semibold">
                            {isAuthenticated ? 'Profile' : 'Sign In'}
                        </span>
                    </Link>
                </div>
            </nav>

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
                                className="border-border bg-bg-subtle flex min-h-0 flex-col overflow-hidden rounded-xl border"
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
                                    className="border-border bg-bg-subtle flex min-h-0 flex-col overflow-hidden rounded-xl border"
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
            <div className="border-border bg-bg-subtle fixed right-0 bottom-0 left-0 flex h-14 shrink-0 items-center justify-around border-t px-2 sm:hidden">
                <button
                    onClick={() => setMobileActivePanel('description')}
                    className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1 transition-colors ${
                        mobileActivePanel === 'description'
                            ? 'bg-bg-muted text-accent'
                            : 'text-text-muted'
                    }`}
                    aria-label="Show description panel"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <span className="text-[10px] font-medium">Problem</span>
                </button>
                <button
                    onClick={() => setMobileActivePanel('editor')}
                    className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1 transition-colors ${
                        mobileActivePanel === 'editor'
                            ? 'bg-bg-muted text-accent'
                            : 'text-text-muted'
                    }`}
                    aria-label="Show code editor"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                    </svg>
                    <span className="text-[10px] font-medium">Code</span>
                </button>
                <button
                    onClick={() => setMobileActivePanel('console')}
                    className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1 transition-colors ${
                        mobileActivePanel === 'console'
                            ? 'bg-bg-muted text-accent'
                            : 'text-text-muted'
                    }`}
                    aria-label="Show console"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                        />
                    </svg>
                    <span className="text-[10px] font-medium">Console</span>
                </button>
            </div>
        </div>
    )
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function ProblemSolverLayout({ problemId, contestId }) {
    const router = useRouter()

    // Get cached data from Zustand
    const zustandStore = useProblemSolveStore()

    // Start with quicker loading if cache exists for same problem
    const shouldShowCached = zustandStore.cachedProblem?._id === problemId

    const [problem, setProblem] = useState(shouldShowCached ? zustandStore.cachedProblem : null)
    const [problems, setProblems] = useState(zustandStore.cachedProblems || [])
    const [isLoading, setIsLoading] = useState(!shouldShowCached)
    const [error, setError] = useState(null)

    useEffect(() => {
        let isMounted = true
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 12000)

        const loadData = async () => {
            try {
                if (isMounted) setIsLoading(true)

                // Always fetch the current problem (can change quickly)
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
                if (err?.name === 'AbortError') {
                    console.log('[ProblemSolver] Fetch aborted')
                    return
                }

                console.error('[ProblemSolver] Fetch error:', err)
                if (isMounted) {
                    setError('Network error')
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
