'use client'

import React, { useState } from 'react'
import {
    Loader2,
    Clock,
    HardDrive,
    Tag,
    ThumbsUp,
    MessageSquare,
    Star,
    ExternalLink,
} from 'lucide-react'

import SubmissionsTab from './SubmissionsTab'

// ─── Difficulty Badge Styles ────────────────────────────────────────────────

const DIFFICULTY_STYLES = {
    easy: 'text-[#00b8a3] bg-[#00b8a3]/10',
    medium: 'text-[#ffc01e] bg-[#ffc01e]/10',
    hard: 'text-[#ff375f] bg-[#ff375f]/10',
}

// ─── Problem Description Content ────────────────────────────────────────────

function ProblemDescription({ problem }) {
    return (
        <div>
            {/* Title */}
            <h2 className="mb-2 text-xl font-bold" style={{ color: '#fff' }}>
                {problem.title}
            </h2>

            {/* Badges */}
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

            {/* Stats bar */}
            <div className="mb-5 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                    <Clock size={12} /> {problem.timeLimit}ms
                </span>
                <span className="flex items-center gap-1">
                    <HardDrive size={12} /> {(problem.memoryLimit / 1024).toFixed(0)}MB
                </span>
                <span>Acceptance: {problem.acceptanceRate}%</span>
            </div>

            {/* Description */}
            <div className="mb-6 text-[14px] leading-7 whitespace-pre-wrap text-gray-300">
                {problem.description}
            </div>

            {/* Sample Test Cases */}
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

            {/* Constraints */}
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

export default function DescriptionPanel({ problem }) {
    const [leftTab, setLeftTab] = useState('description')

    if (!problem) return null

    return (
        <>
            {/* Left Tabs */}
            <div className="flex h-[38px] flex-shrink-0 items-center gap-1 border-b border-[#333] bg-[#282828] px-3">
                {[
                    { key: 'description', label: 'Description', icon: '📄' },
                    { key: 'editorial', label: 'Editorial', icon: '📘' },
                    { key: 'solutions', label: 'Solutions', icon: '💡' },
                    { key: 'submissions', label: 'Submissions', icon: '🕐' },
                ].map((tab) => (
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
            </div>

            {/* Left Content */}
            <div className="flex-1 overflow-y-auto p-5">
                {leftTab === 'description' ? (
                    <ProblemDescription problem={problem} />
                ) : leftTab === 'submissions' ? (
                    <SubmissionsTab />
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                        <span className="mb-3 text-4xl">🚧</span>
                        <p className="text-sm">Coming soon</p>
                    </div>
                )}
            </div>

            {/* Left Footer */}
            <div className="flex h-[36px] flex-shrink-0 items-center justify-between border-t border-[#333] bg-[#282828] px-4 text-xs text-gray-500">
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
