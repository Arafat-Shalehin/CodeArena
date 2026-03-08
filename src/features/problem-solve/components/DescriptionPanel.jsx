'use client'

import React, { useState } from 'react'
import {
    Clock,
    HardDrive,
    Tag,
    ThumbsUp,
    MessageSquare,
    Star,
    ExternalLink,
    Maximize2,
    Minimize2,
    ChevronLeft,
    X,
    History,
} from 'lucide-react'

import SubmissionsTab from './SubmissionsTab'
import SubmissionResultTab from './SubmissionResultTab'
import { useProblemSolve } from '@/context/ProblemSolveContext'
import { formatAcceptanceRate } from '@/lib/utils'

const DIFFICULTY_STYLES = {
    easy: 'text-[#00b8a3] bg-[#00b8a3]/10',
    medium: 'text-[#ffc01e] bg-[#ffc01e]/10',
    hard: 'text-[#ff375f] bg-[#ff375f]/10',
}

const TABS = [
    { key: 'description', label: 'Description', icon: '📄' },
    { key: 'editorial', label: 'Editorial', icon: '📘' },
    { key: 'solutions', label: 'Solutions', icon: '💡' },
    { key: 'submissions', label: 'Submissions', icon: '🕐' },
]

// ─── Problem Description Content ────────────────────────────────────────────

function ProblemDescription({ problem }) {
    return (
        <div className="animate-fade-up">
            <h2 className="text-text-primary mb-3 text-2xl font-bold tracking-tight">
                {problem.title}
            </h2>

            <div className="mb-5 flex flex-wrap items-center gap-2">
                <span
                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${DIFFICULTY_STYLES[problem.difficulty] || ''}`}
                >
                    {problem.difficulty}
                </span>
                {problem.tags?.map((tag) => (
                    <span
                        key={tag}
                        className="bg-bg-muted text-text-secondary hover:text-text-primary flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-colors"
                    >
                        <Tag size={12} className="opacity-70" /> {tag}
                    </span>
                ))}
            </div>

            <div className="border-border bg-bg-page/50 text-text-secondary mb-6 flex items-center gap-6 rounded-xl border p-4 text-[13px]">
                <span className="flex items-center gap-2">
                    <Clock size={14} className="text-accent" />
                    <span className="font-medium">{problem.timeLimit}ms</span>
                </span>
                <span className="flex items-center gap-2">
                    <HardDrive size={14} className="text-accent" />
                    <span className="font-medium">{(problem.memoryLimit / 1024).toFixed(0)}MB</span>
                </span>
                <div className="bg-border h-4 w-px" />
                <span className="font-medium italic">
                    Acceptance:{' '}
                    <span className="text-text-primary not-italic">
                        {formatAcceptanceRate(problem.acceptanceRate)}
                    </span>
                </span>
            </div>

            <div className="prose-markdown text-text-secondary mb-8 text-[15px] leading-relaxed">
                {problem.description}
            </div>

            {problem.sampleTestCases?.length > 0 && (
                <div className="space-y-6">
                    {problem.sampleTestCases.map((tc, i) => (
                        <div
                            key={i}
                            className="animate-fade-up"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            <h4 className="text-text-primary mb-3 text-sm font-bold">
                                Example {i + 1}:
                            </h4>
                            <div className="border-border bg-bg-muted/50 overflow-hidden rounded-xl border font-mono text-[13px]">
                                <div className="border-border text-text-muted border-b px-4 py-2 text-xs font-bold tracking-wider uppercase">
                                    Input
                                </div>
                                <div className="text-text-primary p-4 whitespace-pre-wrap">
                                    {tc.input}
                                </div>

                                <div className="border-border text-text-muted border-y px-4 py-2 text-xs font-bold tracking-wider uppercase">
                                    Output
                                </div>
                                <div className="text-text-primary p-4 whitespace-pre-wrap">
                                    {tc.output}
                                </div>

                                {tc.explanation && (
                                    <>
                                        <div className="border-border text-text-muted border-y px-4 py-2 text-xs font-bold tracking-wider uppercase">
                                            Explanation
                                        </div>
                                        <div className="text-text-secondary p-4 whitespace-pre-wrap italic">
                                            {tc.explanation}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="border-accent/20 bg-accent/5 mt-8 rounded-xl border p-5">
                <h4 className="text-accent mb-3 flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
                    <Star size={14} /> Constraints
                </h4>
                <ul className="text-text-secondary space-y-2 font-mono text-[13px] font-medium">
                    <li className="flex items-center gap-2">
                        <div className="bg-accent h-1 w-1 rounded-full" />
                        Time Limit: {problem.timeLimit}ms
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="bg-accent h-1 w-1 rounded-full" />
                        Memory Limit: {(problem.memoryLimit / 1024).toFixed(0)}MB
                    </li>
                    {problem.codeSizeLimit && (
                        <li className="flex items-center gap-2">
                            <div className="bg-accent h-1 w-1 rounded-full" />
                            Code Size Limit: {problem.codeSizeLimit}KB
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}

// ─── Main DescriptionPanel ──────────────────────────────────────────────────

export default function DescriptionPanel({ problem, onMaximize, onCollapse, isMaximized }) {
    const { leftTab, setLeftTab, submissionResult } = useProblemSolve()

    if (!problem) return null

    return (
        <>
            {/* Tab Header */}
            <div className="border-border bg-bg-subtle flex h-[42px] flex-shrink-0 items-center justify-between border-b px-2">
                <div className="flex items-center gap-0.5">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setLeftTab(tab.key)}
                            className={`hover:text-text-primary flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                                leftTab === tab.key
                                    ? 'bg-bg-muted text-text-primary shadow-sm'
                                    : 'text-text-muted hover:bg-bg-muted/50'
                            }`}
                        >
                            <span>{tab.icon}</span> {tab.label}
                        </button>
                    ))}
                    {submissionResult && (
                        <div
                            onClick={() => setLeftTab('submission-result')}
                            className={`hover:text-text-primary relative flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                leftTab === 'submission-result'
                                    ? 'bg-bg-muted text-text-primary shadow-sm'
                                    : 'text-text-muted hover:bg-bg-muted/50'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <History
                                    size={14}
                                    className={
                                        submissionResult.passed ? 'text-success' : 'text-error'
                                    }
                                />
                                <span
                                    className={
                                        submissionResult.passed ? 'text-success' : 'text-error'
                                    }
                                >
                                    {submissionResult.passed ? 'Accepted' : 'Failed'}
                                </span>
                            </span>
                            <div
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setLeftTab('description')
                                }}
                                className="bg-bg-page/50 hover:bg-bg-muted text-text-muted hover:text-text-primary ml-2 flex h-4 w-4 items-center justify-center rounded-full transition-colors"
                            >
                                <X size={10} />
                            </div>
                        </div>
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
                    {onCollapse && (
                        <button
                            onClick={onCollapse}
                            className="text-text-muted hover:bg-bg-muted hover:text-text-primary rounded-lg p-1.5 transition-colors"
                            title="Collapse"
                        >
                            <ChevronLeft size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
                {leftTab === 'description' ? (
                    <ProblemDescription problem={problem} />
                ) : leftTab === 'submissions' ? (
                    <SubmissionsTab />
                ) : leftTab === 'submission-result' ? (
                    <SubmissionResultTab />
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                        <span className="mb-3 text-4xl">🚧</span>
                        <p className="text-sm">Coming soon</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex h-[36px] flex-shrink-0 items-center justify-between border-t border-[#333] px-4 text-xs text-gray-500">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <ThumbsUp size={12} /> {problem.totalSubmissions || 0}
                    </span>
                    <span className="flex items-center gap-1">
                        <MessageSquare size={12} /> {problem.testCaseCount || 0}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <Star size={12} className="cursor-pointer hover:text-yellow-400" />
                    <ExternalLink size={12} className="cursor-pointer hover:text-white" />
                </div>
            </div>
        </>
    )
}
