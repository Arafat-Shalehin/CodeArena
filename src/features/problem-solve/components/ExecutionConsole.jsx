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

// ─── Shared Quality Bar ─────────────────────────────────────────────────────

function QualityBar({ label, value, maxValue = 5, color }) {
    return (
        <div className="flex items-center gap-3">
            <span className="w-[72px] text-[11px] text-gray-500">{label}</span>
            <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-[#1a1a1a]">
                <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${(value / maxValue) * 100}%`, background: color }}
                />
            </div>
            <span className="w-7 text-right font-mono text-[11px] text-gray-400">
                {value}/{maxValue}
            </span>
        </div>
    )
}

// ─── Testcase Tab ───────────────────────────────────────────────────────────

function TestCaseTab() {
    const { problem, testInput, setTestInput, activeTestCase, setActiveTestCase } =
        useProblemSolve()
    if (!problem) return null

    return (
        <div className="p-5">
            {problem.sampleTestCases?.length > 0 && (
                <div className="mb-4 flex items-center gap-2">
                    {problem.sampleTestCases.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setActiveTestCase(i)
                                setTestInput(problem.sampleTestCases[i].input || '')
                            }}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                activeTestCase === i
                                    ? 'bg-[#3a3a3a] text-white'
                                    : 'text-gray-500 hover:bg-[#333] hover:text-gray-300'
                            }`}
                        >
                            <CheckCircle2 size={12} className="text-[#2cbb5d]" /> Case {i + 1}
                        </button>
                    ))}
                </div>
            )}
            <div className="mb-4">
                <div className="mb-2 text-xs font-medium text-gray-500">Input</div>
                <textarea
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    className="w-full resize-none rounded-lg border-none bg-[#262626] p-4 font-mono text-sm text-white outline-none focus:ring-1 focus:ring-[#444]"
                    rows={4}
                    spellCheck="false"
                />
            </div>
            {problem.sampleTestCases?.[activeTestCase]?.output && (
                <div>
                    <div className="mb-2 text-xs font-medium text-gray-500">Expected Output</div>
                    <div className="rounded-lg bg-[#262626] p-4 font-mono text-sm text-white">
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
    const verdictColor = isAccepted ? 'text-[#2cbb5d]' : 'text-[#ef4444]'
    const caseResults = result.results || []
    const testCases = problem?.sampleTestCases || []
    const currentCaseResult = caseResults[viewingCase]
    const currentTestCase = testCases[viewingCase]

    return (
        <div className="p-5">
            {/* Verdict Header */}
            <div className="mb-1 flex items-center justify-between">
                <div className="flex items-baseline gap-3">
                    <span className={`text-xl font-bold ${verdictColor}`}>
                        {result.verdict?.replace(/_/g, ' ')}
                    </span>
                    {result.time !== undefined && (
                        <span className="text-sm text-gray-500">
                            Runtime: <span className="text-gray-300">{result.time} ms</span>
                        </span>
                    )}
                </div>
                <button
                    className="rounded p-1 text-gray-500 hover:bg-[#3a3a3a] hover:text-white"
                    title="View Details"
                >
                    <Eye size={16} />
                </button>
            </div>
            {result.passedCount !== undefined && (
                <div className="mb-4 text-xs text-gray-500">
                    {result.passedCount}/{result.totalCount} testcases passed
                </div>
            )}

            {/* Case Badges */}
            {(caseResults.length > 0 || testCases.length > 0) && (
                <div className="mb-5 flex flex-wrap items-center gap-3">
                    {(caseResults.length > 0 ? caseResults : testCases).map((_, i) => {
                        const passed = caseResults[i]?.passed
                        return (
                            <button
                                key={i}
                                onClick={() => setViewingCase(i)}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                    viewingCase === i
                                        ? 'bg-[#3a3a3a] text-white'
                                        : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                {passed !== undefined &&
                                    (passed ? (
                                        <CheckCircle2 size={12} className="text-[#2cbb5d]" />
                                    ) : (
                                        <XCircle size={12} className="text-[#ef4444]" />
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
            <div className="mb-2 text-xs font-medium text-gray-500">{label}</div>
            <div className="rounded-lg bg-[#262626] p-4">
                <pre className="font-mono text-sm font-bold whitespace-pre-wrap text-white">
                    {value}
                </pre>
            </div>
        </div>
    )
}

// ─── AI Feedback Tab ────────────────────────────────────────────────────────

function AiFeedbackTab() {
    const { aiFeedback: feedback, isAiLoading, fetchAiFeedback } = useProblemSolve()

    if (isAiLoading) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-12">
                <div className="relative">
                    <div
                        className="absolute inset-0 animate-ping rounded-full bg-purple-500/20"
                        style={{ animationDuration: '1.5s' }}
                    />
                    <div className="relative rounded-full bg-gradient-to-br from-purple-500 to-violet-600 p-3">
                        <Brain size={22} className="animate-pulse text-white" />
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-sm font-medium text-purple-300">
                        AI Analyzing Your Code
                    </div>
                    <div className="mt-1 text-[11px] text-gray-500">
                        Powered by Groq · Llama 3.3 70B
                    </div>
                </div>
            </div>
        )
    }

    if (!feedback) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-12 text-gray-500">
                <div className="rounded-full bg-gradient-to-br from-purple-500/10 to-violet-600/10 p-4">
                    <Sparkles size={28} className="text-purple-400/50" />
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-400">
                        Get instant AI feedback on your code
                    </div>
                    <div className="mt-1 text-[11px] text-gray-600">
                        Complexity analysis · Code quality · Optimization tips
                    </div>
                </div>
                <button
                    onClick={fetchAiFeedback}
                    className="mt-1 flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-2 text-xs font-medium text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02]"
                >
                    <Sparkles size={14} /> Analyze with AI
                </button>
            </div>
        )
    }

    if (feedback.error) {
        return (
            <div className="flex flex-col items-center gap-3 py-8">
                <XCircle size={24} className="text-red-400/60" />
                <div className="text-sm text-red-400">{feedback.error}</div>
                <button
                    onClick={fetchAiFeedback}
                    className="mt-1 flex items-center gap-1.5 rounded-md border border-purple-500/30 px-3 py-1.5 text-xs text-purple-400 hover:bg-purple-500/10"
                >
                    <RotateCcw size={12} /> Retry
                </button>
            </div>
        )
    }

    const rating = feedback.rating || 0
    const ratingColor = rating >= 8 ? '#2cbb5d' : rating >= 5 ? '#ffc01e' : '#ef4444'
    const cq = feedback.code_quality || {}

    return (
        <div className="space-y-4 p-5">
            {/* Rating + Complexity */}
            <div className="flex gap-3">
                <div className="flex min-w-[100px] flex-col items-center justify-center rounded-xl border border-[#333] bg-[#222] p-4">
                    <div className="relative flex items-center justify-center">
                        <svg width="56" height="56" viewBox="0 0 56 56">
                            <circle
                                cx="28"
                                cy="28"
                                r="24"
                                fill="none"
                                stroke="#333"
                                strokeWidth="4"
                            />
                            <circle
                                cx="28"
                                cy="28"
                                r="24"
                                fill="none"
                                stroke={ratingColor}
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray={`${(rating / 10) * 150.8} 150.8`}
                                transform="rotate(-90 28 28)"
                                className="transition-all duration-1000"
                            />
                        </svg>
                        <span
                            className="absolute font-mono text-lg font-bold"
                            style={{ color: ratingColor }}
                        >
                            {rating}
                        </span>
                    </div>
                    <div className="mt-1 text-[10px] font-medium text-gray-500 uppercase">
                        Score
                    </div>
                </div>
                <div className="grid flex-1 grid-cols-2 gap-2">
                    {[
                        {
                            icon: Zap,
                            label: 'Time',
                            value: feedback.timeComplexity,
                            color: 'text-purple-400',
                            valueColor: 'text-purple-300',
                        },
                        {
                            icon: HardDrive,
                            label: 'Space',
                            value: feedback.spaceComplexity,
                            color: 'text-blue-400',
                            valueColor: 'text-blue-300',
                        },
                    ].map(({ icon: Icon, label, value, color, valueColor }) => (
                        <div key={label} className="rounded-xl border border-[#333] bg-[#222] p-3">
                            <div className="mb-1 flex items-center gap-1.5">
                                <Icon size={12} className={color} />
                                <span className="text-[10px] font-bold text-gray-500 uppercase">
                                    {label}
                                </span>
                            </div>
                            <div className={`font-mono text-sm font-bold ${valueColor}`}>
                                {value || '—'}
                            </div>
                        </div>
                    ))}
                    <div className="col-span-2 rounded-xl border border-[#333] bg-[#222] p-3">
                        <div className="mb-1 flex items-center gap-1.5">
                            <Brain size={12} className="text-violet-400" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase">
                                Algorithm
                            </span>
                        </div>
                        <div className="text-sm font-medium text-violet-300">
                            {feedback.algorithm || '—'}
                        </div>
                    </div>
                </div>
            </div>

            {feedback.verdict_explanation && (
                <div className="rounded-xl border border-[#333] bg-[#222] p-3">
                    <div className="flex items-start gap-2">
                        <Target size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
                        <p className="text-xs leading-relaxed text-gray-300">
                            {feedback.verdict_explanation}
                        </p>
                    </div>
                </div>
            )}

            {(cq.readability || cq.efficiency || cq.correctness) && (
                <div className="rounded-xl border border-[#333] bg-[#222] p-4">
                    <div className="mb-3 flex items-center gap-1.5">
                        <BarChart3 size={13} className="text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase">
                            Code Quality
                        </span>
                    </div>
                    <div className="space-y-2.5">
                        {cq.readability && (
                            <QualityBar
                                label="Readability"
                                value={cq.readability}
                                color="#a78bfa"
                            />
                        )}
                        {cq.efficiency && (
                            <QualityBar label="Efficiency" value={cq.efficiency} color="#60a5fa" />
                        )}
                        {cq.correctness && (
                            <QualityBar
                                label="Correctness"
                                value={cq.correctness}
                                color="#2cbb5d"
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Strengths & Improvements — DRY with a shared pattern */}
            {[
                {
                    items: feedback.strengths,
                    title: 'Strengths',
                    icon: ThumbsUp,
                    itemIcon: CheckCircle2,
                    borderColor: 'border-[#2cbb5d]/20',
                    bgColor: 'bg-[#2cbb5d]/5',
                    textColor: 'text-[#2cbb5d]',
                    iconOpacity: 'text-[#2cbb5d]/60',
                },
                {
                    items: feedback.improvements,
                    title: 'Improvements',
                    icon: Lightbulb,
                    itemIcon: ArrowRight,
                    borderColor: 'border-[#ffc01e]/20',
                    bgColor: 'bg-[#ffc01e]/5',
                    textColor: 'text-[#ffc01e]',
                    iconOpacity: 'text-[#ffc01e]/60',
                },
            ].map(
                ({
                    items,
                    title,
                    icon: HeaderIcon,
                    itemIcon: ItemIcon,
                    borderColor,
                    bgColor,
                    textColor,
                    iconOpacity,
                }) =>
                    items?.length > 0 && (
                        <div
                            key={title}
                            className={`rounded-xl border ${borderColor} ${bgColor} p-4`}
                        >
                            <div className="mb-2.5 flex items-center gap-1.5">
                                <HeaderIcon size={13} className={textColor} />
                                <span className={`text-[10px] font-bold uppercase ${textColor}`}>
                                    {title}
                                </span>
                            </div>
                            <ul className="space-y-2">
                                {items.map((s, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-2 text-xs leading-relaxed text-gray-300"
                                    >
                                        <ItemIcon
                                            size={13}
                                            className={`mt-0.5 flex-shrink-0 ${iconOpacity}`}
                                        />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )
            )}

            {feedback.optimal_approach && (
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                    <div className="mb-2 flex items-center gap-1.5">
                        <Award size={13} className="text-violet-400" />
                        <span className="text-[10px] font-bold text-violet-400 uppercase">
                            Optimal Approach
                        </span>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-300">
                        {feedback.optimal_approach}
                    </p>
                </div>
            )}

            <div className="flex justify-center pt-1">
                <button
                    onClick={fetchAiFeedback}
                    className="flex items-center gap-1.5 rounded-lg border border-[#333] px-3 py-1.5 text-[11px] text-gray-500 hover:border-purple-500/30 hover:text-purple-400"
                >
                    <RotateCcw size={11} /> Re-analyze
                </button>
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
            <div className="flex h-[38px] flex-shrink-0 items-center justify-between border-b border-[#333] px-4">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setConsoleTab('testcase')}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                            consoleTab === 'testcase'
                                ? 'bg-[#3a3a3a] text-white'
                                : 'text-gray-500 hover:bg-[#333] hover:text-gray-300'
                        }`}
                    >
                        <CheckCircle2 size={13} className="text-[#2cbb5d]" /> Testcase
                    </button>
                    <button
                        onClick={() => setConsoleTab('result')}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                            consoleTab === 'result'
                                ? 'bg-[#3a3a3a] text-white'
                                : 'text-gray-500 hover:bg-[#333] hover:text-gray-300'
                        }`}
                    >
                        <Terminal size={13} /> Test Result
                    </button>
                    {testResult?.status === 'done' && (
                        <button
                            onClick={() => {
                                setConsoleTab('ai')
                                fetchAiFeedback()
                            }}
                            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                consoleTab === 'ai'
                                    ? 'bg-purple-500/15 text-purple-400'
                                    : 'text-gray-500 hover:bg-[#333] hover:text-purple-300'
                            }`}
                        >
                            <Sparkles size={13} /> AI Analysis
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                    <button
                        onClick={onMaximize}
                        className="rounded p-1 hover:bg-[#3a3a3a] hover:text-white"
                        title={isMaximized ? 'Restore' : 'Maximize'}
                    >
                        {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                    <button
                        onClick={onCollapse}
                        className="rounded p-1 hover:bg-[#3a3a3a] hover:text-white"
                        title="Collapse"
                    >
                        <ChevronDown size={14} />
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
