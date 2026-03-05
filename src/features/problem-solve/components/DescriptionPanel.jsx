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
        <div>
            <h2 className="mb-2 text-xl font-bold" style={{ color: '#fff' }}>
                {problem.title}
            </h2>

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${DIFFICULTY_STYLES[problem.difficulty] || ''}`}
                >
                    {problem.difficulty}
                </span>
                {problem.tags?.map((tag) => (
                    <span
                        key={tag}
                        className="flex items-center gap-1 rounded-full bg-[#333] px-2.5 py-0.5 text-[10px] text-gray-400"
                    >
                        <Tag size={10} /> {tag}
                    </span>
                ))}
            </div>

            <div className="mb-5 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                    <Clock size={12} /> {problem.timeLimit}ms
                </span>
                <span className="flex items-center gap-1">
                    <HardDrive size={12} /> {(problem.memoryLimit / 1024).toFixed(0)}MB
                </span>
                <span>Acceptance: {problem.acceptanceRate}%</span>
            </div>

            <div className="mb-6 text-[14px] leading-7 whitespace-pre-wrap text-gray-300">
                {problem.description}
            </div>

            {problem.sampleTestCases?.length > 0 && (
                <div>
                    {problem.sampleTestCases.map((tc, i) => (
                        <div key={i} className="mb-5">
                            <h4 className="mb-2 text-sm font-bold" style={{ color: '#fff' }}>
                                Example {i + 1}:
                            </h4>
                            <div className="rounded-lg bg-[#262626] p-4 font-mono text-sm">
                                <div className="mb-1">
                                    <span className="font-bold text-gray-400">Input: </span>
                                    <span className="text-gray-300">{tc.input}</span>
                                </div>
                                <div className="mb-1">
                                    <span className="font-bold text-gray-400">Output: </span>
                                    <span className="text-gray-300">{tc.output}</span>
                                </div>
                                {tc.explanation && (
                                    <div>
                                        <span className="font-bold text-gray-400">
                                            Explanation:{' '}
                                        </span>
                                        <span className="text-gray-300">{tc.explanation}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 rounded-lg bg-[#262626] p-4 text-sm">
                <h4 className="mb-2 font-bold" style={{ color: '#fff' }}>
                    Constraints:
                </h4>
                <ul className="space-y-1 font-mono text-xs text-gray-400">
                    <li>• Time Limit: {problem.timeLimit}ms</li>
                    <li>• Memory Limit: {(problem.memoryLimit / 1024).toFixed(0)}MB</li>
                    {problem.codeSizeLimit && <li>• Code Size Limit: {problem.codeSizeLimit}KB</li>}
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
            <div className="flex h-[38px] flex-shrink-0 items-center justify-between border-b border-[#333] px-3">
                <div className="flex items-center gap-1">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setLeftTab(tab.key)}
                            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                leftTab === tab.key
                                    ? 'bg-[#3a3a3a] text-white'
                                    : 'text-gray-500 hover:bg-[#333] hover:text-gray-300'
                            }`}
                        >
                            <span>{tab.icon}</span> {tab.label}
                        </button>
                    ))}
                    {submissionResult && (
                        <div
                            onClick={() => setLeftTab('submission-result')}
                            className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                leftTab === 'submission-result'
                                    ? 'bg-[#3a3a3a] text-white'
                                    : 'text-gray-500 hover:bg-[#333] hover:text-gray-300'
                            }`}
                        >
                            <span className="flex items-center gap-1">
                                <History
                                    size={13}
                                    className={
                                        submissionResult.passed
                                            ? 'text-[#2cbb5d]'
                                            : 'text-[#ef4444]'
                                    }
                                />
                                <span
                                    className={
                                        submissionResult.passed
                                            ? 'text-[#2cbb5d]'
                                            : 'text-[#ef4444]'
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
                                className="ml-1 flex items-center justify-center rounded p-0.5 hover:bg-[#444] hover:text-white"
                            >
                                <X size={12} />
                            </div>
                        </div>
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
                    {onCollapse && (
                        <button
                            onClick={onCollapse}
                            className="rounded p-1 hover:bg-[#3a3a3a] hover:text-white"
                            title="Collapse"
                        >
                            <ChevronLeft size={14} />
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
