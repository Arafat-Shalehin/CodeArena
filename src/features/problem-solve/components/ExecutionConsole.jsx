'use client'

import React, { useState } from 'react'
import {
    CheckCircle2,
    XCircle,
    Terminal,
    Loader2,
    Heart,
    Sparkles,
    Brain,
    Zap,
    HardDrive,
    Target,
    BarChart3,
    ThumbsUp,
    Lightbulb,
    ArrowRight,
    Award,
    RotateCcw,
    ChevronDown,
    Maximize2,
    Minimize2,
    Eye,
} from 'lucide-react'

import { useProblemSolve } from '@/context/ProblemSolveContext'
import AiFeedbackTab from './AiFeedbackTab'

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

function TestResultTab() {
    const { testResult: result, problem } = useProblemSolve()
    const [viewingCase, setViewingCase] = useState(0)

    console.log(result)

    if (!result) {
        return (
            <div className="flex h-full flex-col items-center justify-center py-12 text-gray-600">
                <Terminal size={28} className="mb-2 opacity-30" />
                <p className="text-xs">You must run your code first</p>
            </div>
        )
    }
    if (result.status === 'running') {
        const passedCount = result.results?.length || 0
        const totalCount = result.totalCount || '?'
        const progress = result.progress || 0

        return (
            <div className="flex h-full flex-col items-center justify-center gap-6 py-12">
                {/* Status Message */}
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="text-accent animate-spin" />
                    <div className="text-center">
                        <p className="text-text-primary text-sm font-semibold">
                            {result.statusMessage ||
                                result.progressMessage ||
                                'Judging in progress...'}
                        </p>
                        <p className="text-text-muted mt-1 text-xs">
                            {passedCount} / {totalCount} test cases
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                {totalCount !== '?' && (
                    <div className="w-48 space-y-2">
                        <div className="bg-bg-muted/50 border-border flex h-2 overflow-hidden rounded-full border">
                            <div
                                className="from-accent to-success bg-linear-to-r transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="text-text-muted text-center text-xs font-medium">
                            {progress}% complete
                        </div>
                    </div>
                )}

                {/* Test Cases Progress */}
                {result.results && result.results.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2">
                        {result.results.map((r, i) => (
                            <div
                                key={i}
                                className={`flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold ${
                                    r.verdict === 'ACCEPTED'
                                        ? 'bg-success/20 text-success'
                                        : 'bg-error/20 text-error'
                                }`}
                                title={`Case ${r.caseNumber}: ${r.verdict}`}
                            >
                                {r.caseNumber}
                            </div>
                        ))}
                    </div>
                )}
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
        <div className="p-5">
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
    const { consoleTab, setConsoleTab, testResult, fetchAiFeedback } = useProblemSolve()

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
                    {testResult?.status === 'done' && (
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
            <div className="flex-1 overflow-y-auto">
                {consoleTab === 'testcase' && <TestCaseTab />}
                {consoleTab === 'result' && <TestResultTab />}
                {consoleTab === 'ai' && <AiFeedbackTab />}
            </div>
        </>
    )
}
