'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
    CheckCircle2,
    Terminal,
    Loader2,
    Heart,
    Sparkles,
    ChevronDown,
    Maximize2,
    Minimize2,
    Eye,
} from 'lucide-react'

import { useProblemSolve } from '@/context/ProblemSolveContext'

const AiFeedbackTab = dynamic(() => import('./AiFeedbackTab'), {
    loading: () => (
        <div className="flex h-full items-center justify-center text-xs text-gray-500">
            Loading AI analysis...
        </div>
    ),
})

// ─── Testcase Tab ───────────────────────────────────────────────────────────

function TestCaseTab() {
    const { problem, testInput, setTestInput, activeTestCase, setActiveTestCase } =
        useProblemSolve()

    if (!problem) return null

    // Ensure testInput is a string to avoid uncontrolled component warnings
    const inputValue = testInput ?? ''

    return (
        <div className="p-5">
            {problem.sampleTestCases?.length > 0 && (
                <div className="mb-6 flex flex-wrap items-center gap-2">
                    {problem.sampleTestCases.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setActiveTestCase(i)
                                // Ensure input is properly synced when changing test case
                                const caseInput = problem.sampleTestCases[i]?.input ?? ''
                                setTestInput(caseInput)
                            }}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                                activeTestCase === i
                                    ? 'bg-bg-muted text-text-primary shadow-sm'
                                    : 'text-text-muted hover:bg-bg-muted/50 hover:text-text-secondary'
                            }`}
                        >
                            <div
                                className={`h-1.5 w-1.5 rounded-full ${activeTestCase === i ? 'bg-success' : 'bg-text-muted opacity-40'}`}
                            />
                            Case {i + 1}
                        </button>
                    ))}
                </div>
            )}
            <div className="mb-6">
                <div className="text-text-muted mb-2 text-[11px] font-bold tracking-wider uppercase">
                    Input
                </div>
                <textarea
                    value={inputValue}
                    onChange={(e) => {
                        const newValue = e.target.value
                        setTestInput(newValue)
                    }}
                    placeholder="Enter test input here..."
                    className="bg-bg-muted text-text-primary border-border focus:border-accent/40 focus:ring-accent/20 placeholder:text-text-muted/50 w-full resize-none rounded-xl border p-4 font-mono text-[13px] transition-all outline-none focus:ring-1"
                    rows={4}
                    spellCheck="false"
                />
            </div>
            {problem.sampleTestCases?.[activeTestCase]?.output && (
                <div>
                    <div className="text-text-muted mb-2 text-[11px] font-bold tracking-wider uppercase">
                        Expected Output
                    </div>
                    <div className="bg-bg-muted text-text-primary border-border w-full rounded-xl border border-dashed p-4 font-mono text-[13px]">
                        {problem.sampleTestCases[activeTestCase].output}
                    </div>
                </div>
            )}
            <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-gray-600">
                <Heart size={12} /> Contribute a testcase
            </div>
        </div>
    )
}

// ─── Test Result Tab ────────────────────────────────────────────────────────

const CONFETTI_PIECES = [
    { left: '6%', delay: 0, duration: 2.2, rotate: -24 },
    { left: '13%', delay: 0.2, duration: 2.8, rotate: 16 },
    { left: '19%', delay: 0.35, duration: 2.6, rotate: -12 },
    { left: '26%', delay: 0.1, duration: 2.4, rotate: 22 },
    { left: '32%', delay: 0.3, duration: 2.7, rotate: -18 },
    { left: '39%', delay: 0.15, duration: 2.5, rotate: 28 },
    { left: '47%', delay: 0.05, duration: 2.3, rotate: -30 },
    { left: '54%', delay: 0.22, duration: 2.9, rotate: 12 },
    { left: '61%', delay: 0.4, duration: 2.7, rotate: -20 },
    { left: '68%', delay: 0.12, duration: 2.35, rotate: 26 },
    { left: '74%', delay: 0.32, duration: 2.6, rotate: -14 },
    { left: '82%', delay: 0.18, duration: 2.85, rotate: 18 },
    { left: '89%', delay: 0.28, duration: 2.5, rotate: -26 },
]

function StagePill({ label, state }) {
    const stateClasses =
        state === 'active'
            ? 'border-accent/40 bg-accent/15 text-accent'
            : state === 'done'
              ? 'border-success/40 bg-success/15 text-success'
              : 'border-border bg-bg-muted/30 text-text-muted'

    return (
        <div
            className={`rounded-full border px-2.5 py-1 text-[10px] leading-none font-bold tracking-wide whitespace-nowrap uppercase transition-colors ${stateClasses}`}
        >
            {label}
        </div>
    )
}

function AcceptedConfetti() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {CONFETTI_PIECES.map((piece, index) => {
                const colors = ['bg-success', 'bg-accent', 'bg-warning']
                return (
                    <motion.span
                        key={index}
                        className={`absolute top-2 h-2 w-1 rounded-full ${colors[index % colors.length]}`}
                        style={{ left: piece.left }}
                        initial={{ y: -12, opacity: 0, rotate: 0 }}
                        animate={{ y: 140, opacity: [0, 1, 1, 0], rotate: piece.rotate }}
                        transition={{
                            duration: piece.duration,
                            delay: piece.delay,
                            repeat: Infinity,
                            repeatDelay: 1.8,
                            ease: 'easeOut',
                        }}
                    />
                )
            })}
        </div>
    )
}

function TestResultTab() {
    const { testResult: result, problem } = useProblemSolve()
    const [viewingCase, setViewingCase] = useState(0)

    if (!result) {
        return (
            <div className="flex h-full flex-col items-center justify-center py-12 text-gray-600">
                <Terminal size={28} className="mb-2 opacity-30" />
                <p className="text-xs">You must run your code first</p>
            </div>
        )
    }
    if (result.status === 'running') {
        const stage = result.stage || 'compile'
        const stageIndex =
            stage === 'running' ? 1 : stage === 'finalizing' || stage === 'finalized' ? 2 : 0
        const steps = ['Compiling', 'Running Cases', 'Finalizing']
        const caseResults = result.results || []
        const passedCount = caseResults.filter((item) => item.verdict === 'ACCEPTED').length
        const totalCount = Number(result.totalCount) > 0 ? Number(result.totalCount) : 0
        const progressValue = Number.isFinite(Number(result.progress)) ? Number(result.progress) : 0
        const progress = Math.max(0, Math.min(100, progressValue))
        const isFailFast = Boolean(result.failedAtCase && stage === 'finalizing')
        const statusText =
            result.statusMessage || result.progressMessage || 'Judging in progress...'
        const caseCounterText =
            totalCount > 0 ? `${passedCount} / ${totalCount} test cases` : 'Preparing test cases...'

        return (
            <div className="px-3 py-3 sm:px-4 sm:py-4">
                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-border bg-bg-subtle/80 relative mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border p-4 shadow-sm"
                >
                    <motion.div
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_50%,rgba(var(--accent-rgb),0.1),transparent_45%)]"
                        animate={{ opacity: [0.3, 0.55, 0.3] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        className={`pointer-events-none absolute inset-y-0 w-24 -skew-x-12 ${
                            isFailFast
                                ? 'from-error/0 via-error/15 to-error/0 bg-linear-to-r'
                                : 'from-accent/0 via-accent/20 to-accent/0 bg-linear-to-r'
                        }`}
                        animate={{ x: ['-140%', '180%'] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
                    />

                    <div className="relative mb-3 flex items-center justify-between gap-2">
                        <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`rounded-full border px-3 py-1 text-[11px] font-bold tracking-wide ${
                                isFailFast
                                    ? 'border-error/40 bg-error/15 text-error'
                                    : 'border-accent/35 bg-accent/10 text-accent'
                            }`}
                        >
                            {result.stageBadge || '[ ⟳ ] Compiling...'}
                        </motion.div>
                        <div className="text-text-muted rounded-full border border-current/20 px-2 py-0.5 text-[11px] font-semibold">
                            {progress}%
                        </div>
                    </div>

                    <div className="relative mb-3 flex flex-wrap items-center gap-1.5">
                        {steps.map((step, index) => (
                            <StagePill
                                key={step}
                                label={step}
                                state={
                                    index < stageIndex
                                        ? 'done'
                                        : index === stageIndex
                                          ? 'active'
                                          : 'todo'
                                }
                            />
                        ))}
                    </div>

                    <div className="relative mb-3 flex items-start gap-2.5">
                        <Loader2 size={18} className="text-accent mt-0.5 shrink-0 animate-spin" />
                        <div className="min-w-0">
                            <p className="text-text-primary truncate text-sm leading-tight font-semibold">
                                {statusText}
                            </p>
                            <p className="text-text-muted mt-1 text-[11px]">{caseCounterText}</p>
                        </div>
                    </div>

                    {totalCount > 0 && (
                        <div className="relative space-y-1.5">
                            <div className="bg-bg-muted/60 border-border flex h-2 overflow-hidden rounded-full border">
                                <motion.div
                                    className={`h-full ${
                                        isFailFast
                                            ? 'from-error via-error/90 to-warning/70 bg-linear-to-r'
                                            : 'from-accent to-success bg-linear-to-r'
                                    }`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ type: 'spring', stiffness: 50, damping: 18 }}
                                />
                            </div>
                            <div className="text-text-muted flex items-center justify-between text-[11px] font-medium">
                                <span>0%</span>
                                <span>
                                    {isFailFast
                                        ? `Stopped at case ${result.failedAtCase}`
                                        : `${progress}% complete`}
                                </span>
                                <span>100%</span>
                            </div>
                        </div>
                    )}

                    {caseResults.length > 0 && (
                        <div className="border-border/60 relative mt-3 border-t pt-3">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-text-muted text-[11px] font-semibold tracking-wide uppercase">
                                    Case Stream
                                </span>
                                {isFailFast && (
                                    <span className="text-error text-[11px] font-semibold">
                                        Failed at #{result.failedAtCase}
                                    </span>
                                )}
                            </div>
                            <div className="flex max-h-20 flex-wrap gap-1.5 overflow-y-auto pr-1">
                                {caseResults.map((r, i) => (
                                    <motion.div
                                        key={`${r.caseNumber || i}-${r.verdict || 'pending'}`}
                                        initial={{ scale: 0.86, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: i * 0.025 }}
                                        className={`flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-[10px] font-bold ${
                                            r.verdict === 'ACCEPTED'
                                                ? 'bg-success/20 text-success'
                                                : 'bg-error/20 text-error'
                                        }`}
                                        title={`Case ${r.caseNumber}: ${r.verdict}`}
                                    >
                                        {r.caseNumber}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        )
    }
    if (result.status === 'error') {
        return (
            <div className="p-5">
                <div className="mb-3 flex items-start justify-between">
                    <div>
                        <div className="text-error mb-1 text-xl font-bold">Runtime Error</div>
                        {result.failedAtCase && (
                            <div className="text-text-muted text-xs">
                                Failed at test case {result.failedAtCase}
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-error/10 border-error/20 text-error rounded-lg border p-4 font-mono text-sm">
                    {result.error || 'An error occurred during execution'}
                    {result.message && <div className="mt-2 text-gray-500">{result.message}</div>}
                </div>
            </div>
        )
    }

    const isAccepted = result.verdict === 'ACCEPTED' || result.verdict === 'EXECUTED'
    const verdictColor = isAccepted ? 'text-success' : 'text-error'
    const caseResults = result.results || []
    const testCases = problem?.sampleTestCases || []
    const currentCaseResult = caseResults[viewingCase]
    const currentTestCase = testCases[viewingCase]

    return (
        <div className="relative p-5">
            <AnimatePresence>{isAccepted && <AcceptedConfetti />}</AnimatePresence>
            {/* Verdict Header */}
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-baseline gap-3">
                    <span className={`text-2xl font-black ${verdictColor}`}>
                        {result.verdict?.replace(/_/g, ' ')}
                    </span>
                    {result.failedAtCase && (
                        <div className="bg-error/10 border-error/30 text-error rounded-lg border px-3 py-1 text-xs font-bold">
                            Case #{result.failedAtCase}
                        </div>
                    )}
                    {result.totalCount > 0 && (
                        <div className="text-text-muted border-border bg-bg-muted rounded-lg border px-2 py-0.5 text-xs font-black">
                            {result.passedCount} / {result.totalCount} PASSED
                        </div>
                    )}
                </div>
                <button
                    className="text-text-muted hover:bg-bg-muted hover:text-text-primary rounded-lg p-2 transition-colors"
                    title="View Details"
                >
                    <Eye size={18} />
                </button>
            </div>
            {result.passedCount !== undefined && (
                <div className="mb-4 text-xs text-gray-500">
                    {result.passedCount}/{result.totalCount} testcases passed
                </div>
            )}

            {/* Case Badges */}
            {(caseResults.length > 0 || testCases.length > 0) && (
                <div className="mb-6 flex flex-wrap items-center gap-2">
                    {(caseResults.length > 0 ? caseResults : testCases).map((_, i) => {
                        const passed = caseResults[i]?.passed
                        return (
                            <button
                                key={i}
                                onClick={() => setViewingCase(i)}
                                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                                    viewingCase === i
                                        ? 'bg-bg-muted text-text-primary shadow-sm'
                                        : 'text-text-muted hover:bg-bg-muted/50 hover:text-text-secondary'
                                }`}
                            >
                                {passed !== undefined &&
                                    (passed ? (
                                        <div className="bg-success h-1.5 w-1.5 rounded-full" />
                                    ) : (
                                        <div className="bg-error h-1.5 w-1.5 rounded-full" />
                                    ))}
                                Case {i + 1}
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Input / Output / Expected */}
            <div className="space-y-4">
                {currentTestCase?.input && (
                    <DataBlock label="Input" value={currentTestCase.input} />
                )}
                {(currentCaseResult?.actual ?? result.output) !== undefined && (
                    <DataBlock
                        label="Output"
                        value={currentCaseResult?.actual ?? result.output ?? ''}
                    />
                )}
                {(currentCaseResult?.expected ?? result.expected ?? currentTestCase?.output) !==
                    undefined && (
                    <DataBlock
                        label="Expected"
                        value={
                            currentCaseResult?.expected ??
                            result.expected ??
                            currentTestCase?.output ??
                            ''
                        }
                    />
                )}
                {result.error && (
                    <div>
                        <div className="mb-2 text-xs font-medium text-[#ef4444]">Error</div>
                        <div className="rounded-lg bg-[#ef4444]/5 p-4">
                            <pre className="font-mono text-xs whitespace-pre-wrap text-[#ef4444]">
                                {result.error}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-8 flex cursor-pointer items-center justify-center gap-1.5 text-xs text-gray-600 hover:text-gray-400">
                <Heart size={12} /> Contribute a testcase
            </div>
        </div>
    )
}

/** Reusable data block for Input/Output/Expected */
function DataBlock({ label, value }) {
    return (
        <div>
            <div className="text-text-muted mb-2 text-[11px] font-bold tracking-wider uppercase">
                {label}
            </div>
            <div className="bg-bg-muted text-text-primary border-border overflow-hidden rounded-xl border p-4 font-mono text-[13px]">
                <pre className="whitespace-pre-wrap">{value}</pre>
            </div>
        </div>
    )
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function ExecutionConsole({ onMaximize, onCollapse, isMaximized }) {
    const { consoleTab, setConsoleTab, testResult, fetchAiFeedback, disableAI } = useProblemSolve()

    return (
        <>
            {/* Header */}
            <div className="border-border bg-bg-subtle flex h-12 shrink-0 items-center justify-between border-b px-2">
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={() => setConsoleTab('testcase')}
                        className={`hover:text-text-primary flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                            consoleTab === 'testcase'
                                ? 'bg-bg-muted text-text-primary shadow-sm'
                                : 'text-text-muted hover:bg-bg-muted/50'
                        }`}
                    >
                        <CheckCircle2 size={14} className="text-success" /> Testcase
                    </button>
                    <button
                        onClick={() => setConsoleTab('result')}
                        className={`hover:text-text-primary flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                            consoleTab === 'result'
                                ? 'bg-bg-muted text-text-primary shadow-sm'
                                : 'text-text-muted hover:bg-bg-muted/50'
                        }`}
                    >
                        <Terminal size={14} className="text-accent" /> Test Result
                    </button>
                    {!disableAI && testResult?.status === 'done' && (
                        <button
                            onClick={() => {
                                setConsoleTab('ai')
                                fetchAiFeedback()
                            }}
                            className={`hover:text-text-primary flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                                consoleTab === 'ai'
                                    ? 'bg-accent/10 text-accent font-bold'
                                    : 'text-text-muted hover:bg-bg-muted/50'
                            }`}
                        >
                            <Sparkles size={14} className="animate-pulse" /> AI Analysis
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-1 px-2">
                    <button
                        onClick={onMaximize}
                        className="text-text-muted hover:bg-bg-muted hover:text-text-primary rounded-lg p-1.5 transition-colors"
                        title={isMaximized ? 'Restore' : 'Maximize'}
                    >
                        {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                    <button
                        onClick={onCollapse}
                        className="text-text-muted hover:bg-bg-muted hover:text-text-primary rounded-lg p-1.5 transition-colors"
                        title="Collapse"
                    >
                        <ChevronDown size={16} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto" data-lenis-prevent>
                {consoleTab === 'testcase' && <TestCaseTab />}
                {consoleTab === 'result' && <TestResultTab />}
                {consoleTab === 'ai' && !disableAI && <AiFeedbackTab />}
            </div>
        </>
    )
}
