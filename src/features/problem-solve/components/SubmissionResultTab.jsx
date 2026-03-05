'use client'

import React from 'react'
import {
    Clock,
    HardDrive,
    Sparkles,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    Zap,
    BarChart3,
} from 'lucide-react'

import { useProblemSolve, LANG_LABELS } from '@/context/ProblemSolveContext'

// ─── Simple Bar Chart ───────────────────────────────────────────────────────

function DistributionChart({ userValue, label, unit }) {
    // Generate mock distribution data (in real app, backend provides this)
    const bars = [
        { range: `${unit === 'ms' ? '0' : '15'}`, height: 35, count: 12 },
        { range: `1${unit}`, height: 95, count: 45 },
        { range: `2${unit}`, height: 25, count: 8 },
        { range: `3${unit}`, height: 20, count: 6 },
        { range: `4${unit}`, height: 18, count: 5 },
    ]
    const maxH = Math.max(...bars.map((b) => b.height))

    return (
        <div className="mt-3">
            <div className="relative flex h-[100px] items-end gap-[2px]">
                {/* Y-axis labels */}
                <div className="absolute top-0 left-0 flex h-full flex-col justify-between text-[9px] text-gray-600">
                    <span>150%</span>
                    <span>100%</span>
                    <span>50%</span>
                    <span>0%</span>
                </div>
                {/* Bars */}
                <div className="ml-8 flex flex-1 items-end gap-1">
                    {bars.map((bar, i) => (
                        <div key={i} className="group relative flex flex-1 flex-col items-center">
                            <div
                                className={`w-full rounded-t transition-all ${i === 0 ? 'bg-[#007acc]' : 'bg-[#007acc]/40'}`}
                                style={{ height: `${(bar.height / maxH) * 80}px` }}
                            />
                            {/* User marker on the first bar */}
                            {i === 0 && userValue !== undefined && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                                    <div className="h-3 w-3 rounded-full border-2 border-[#007acc] bg-[#1a1a1a]" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {/* X-axis labels */}
            <div className="mt-1 ml-8 flex justify-between text-[9px] text-gray-600">
                {bars.map((bar, i) => (
                    <span key={i}>{bar.range}</span>
                ))}
            </div>
        </div>
    )
}

// ─── Metric Box ─────────────────────────────────────────────────────────────

function MetricBox({ icon: Icon, label, value, unit, beats, color = 'text-white' }) {
    return (
        <div className="flex-1 rounded-xl border border-[#333] bg-[#262626] p-4">
            <div className="mb-2 flex items-center gap-1.5">
                <Icon size={14} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-400">{label}</span>
            </div>
            <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${color}`}>{value ?? '—'}</span>
                <span className="text-sm text-gray-500">{unit}</span>
            </div>
            {beats !== undefined && (
                <div className="mt-1 text-xs">
                    Beats <span className="font-bold text-white">{beats}%</span>
                </div>
            )}
            {label === 'Runtime' && (
                <button className="mt-2 flex items-center gap-1 text-[11px] text-[#007acc] hover:underline">
                    <Sparkles size={11} /> Analyze Complexity
                </button>
            )}
        </div>
    )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function SubmissionResultTab() {
    const { submissionResult: result, setLeftTab } = useProblemSolve()

    if (!result) return null

    const isAccepted = result.verdict === 'ACCEPTED'
    const verdictColor = isAccepted ? 'text-[#2cbb5d]' : 'text-[#ef4444]'
    const verdictLabel = result.verdict?.replace(/_/g, ' ')

    const submittedDate = result.submittedAt
        ? new Date(result.submittedAt).toLocaleString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          })
        : ''

    const memoryMB = result.memory ? (result.memory / 1024).toFixed(2) : '—'

    // Mock percentile (in production, backend calculates this)
    const runtimeBeats = result.time === 0 ? '100.00' : (Math.random() * 40 + 60).toFixed(2)
    const memoryBeats = (Math.random() * 30 + 60).toFixed(2)

    return (
        <div className="space-y-5">
            {/* ── "← All Submissions" link ── */}
            <button
                onClick={() => setLeftTab('submissions')}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300"
            >
                <ChevronLeft size={14} /> All Submissions
            </button>

            {/* ── Verdict Header ── */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-baseline gap-3">
                        <span className={`text-2xl font-bold ${verdictColor}`}>{verdictLabel}</span>
                        {result.totalCount > 0 && (
                            <span className="text-sm text-gray-400">
                                {result.passedCount} / {result.totalCount} testcases passed
                            </span>
                        )}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                        {isAccepted ? (
                            <CheckCircle2 size={13} className="text-[#2cbb5d]" />
                        ) : (
                            <XCircle size={13} className="text-[#ef4444]" />
                        )}
                        <span>
                            <span className="font-medium text-gray-300">Muzahid</span> submitted at{' '}
                            {submittedDate}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="rounded-full border border-[#555] px-4 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-[#333]">
                        Editorial
                    </button>
                    <button className="rounded-full bg-[#ff375f] px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#e02e52]">
                        Solution
                    </button>
                </div>
            </div>

            {/* ── Performance Metrics ── */}
            <div className="flex gap-3">
                <MetricBox
                    icon={Clock}
                    label="Runtime"
                    value={result.time ?? 0}
                    unit="ms"
                    beats={runtimeBeats}
                />
                <MetricBox
                    icon={HardDrive}
                    label="Memory"
                    value={memoryMB}
                    unit="MB"
                    beats={memoryBeats}
                />
            </div>

            {/* ── Distribution Chart ── */}
            <div className="rounded-xl border border-[#333] bg-[#262626] p-4">
                <DistributionChart userValue={result.time} label="Runtime" unit="ms" />
            </div>

            {/* ── Submitted Code ── */}
            <div>
                <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium text-gray-300">Code</span>
                    <span>|</span>
                    <span>{LANG_LABELS[result.submittedLanguage] || result.submittedLanguage}</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto rounded-lg bg-[#1e1e1e] p-4">
                    <pre className="font-mono text-[13px] leading-6 whitespace-pre-wrap text-gray-300">
                        <code>{result.submittedCode}</code>
                    </pre>
                </div>
            </div>
        </div>
    )
}
