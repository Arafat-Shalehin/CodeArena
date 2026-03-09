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

    return (
        <div className="p-5">
            {problem.sampleTestCases?.length > 0 && (
                <div className="mb-6 flex flex-wrap items-center gap-2">
                    {problem.sampleTestCases.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setActiveTestCase(i)
                                setTestInput(problem.sampleTestCases[i].input || '')
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
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    className="bg-bg-muted text-text-primary border-border focus:border-accent/40 focus:ring-accent/20 w-full resize-none rounded-xl border p-4 font-mono text-[13px] transition-all outline-none focus:ring-1"
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
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-gray-400">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">Judging...</span>
            </div>
        )
    }
    if (result.status === 'error') {
        return (
            <div className="p-5">
                <div className="mb-1 text-xl font-bold text-[#ff375f]">Runtime Error</div>
                <div className="rounded-lg bg-[#262626] p-4 font-mono text-sm text-[#ff375f]">
                    {result.error}
                    {result.message && <div className="mt-2 text-gray-500">{result.message}</div>}
                </div>
            </div>
        )
    }

    const isAccepted = result.verdict === 'ACCEPTED'
    const verdictColor = isAccepted ? 'text-success' : 'text-error'
    const caseResults = result.results || []
    const testCases = problem?.sampleTestCases || []
    const currentCaseResult = caseResults[viewingCase]
    const currentTestCase = testCases[viewingCase]

    return (
        <div className="p-5">
            {/* Verdict Header */}
            <div className="mb-1 flex items-center justify-between">
                <div className="flex items-baseline gap-3">
                    <span className={`text-2xl font-black ${verdictColor}`}>
                        {result.verdict?.replace(/_/g, ' ')}
                    </span>
                    {result.time !== undefined && (
                        <span className="text-text-muted text-[13px]">
                            Runtime:{' '}
                            <span className="text-text-primary font-bold">{result.time} ms</span>
                        </span>
                    )}
                    {result.memory !== undefined && (
                        <span className="text-text-muted text-[13px]">
                            Memory:{' '}
                            <span className="text-text-primary font-bold">
                                {(result.memory / 1024).toFixed(2)} MB
                            </span>
                        </span>
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
            <div className="border-border bg-bg-subtle flex h-[42px] flex-shrink-0 items-center justify-between border-b px-2">
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
